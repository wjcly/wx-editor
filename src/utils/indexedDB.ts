// IndexedDB 工具类，用于存储 AI 聊天会话和提示词

const DB_NAME = 'AIChatDB'
const SESSIONS_STORE_NAME = 'sessions'
const PROMPTS_STORE_NAME = 'prompts'

type ChatMessage = UserMessage | AssistantMessage

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  // Add any other properties that a chat session should have
}

interface UserMessage {
  id: string
  role: 'user'
  content: string // 完整的用户消息内容
  timestamp: number
}

interface AssistantMessage {
  id: string
  role: 'assistant'
  content: string
  timestamp: number
}

interface Prompt {
  id: string
  name: string
  content: string
  category: string
  tags: string[]
  isCustom?: boolean // 标记是否为用户自定义的提示词
}

class IndexedDBHelper {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  // 打开数据库
  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    if (this.dbPromise) {
      return this.dbPromise
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME) // 打开数据库

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 检查是否需要创建会话存储对象
        if (!db.objectStoreNames.contains(SESSIONS_STORE_NAME)) {
          const store = db.createObjectStore(SESSIONS_STORE_NAME, { keyPath: 'id' })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // 检查是否需要创建提示词存储对象
        if (!db.objectStoreNames.contains(PROMPTS_STORE_NAME)) {
          const store = db.createObjectStore(PROMPTS_STORE_NAME, { keyPath: 'id' })
          store.createIndex('category', 'category', { unique: false })
          store.createIndex('name', 'name', { unique: false })
        }
      }
    })

    return this.dbPromise
  }

  // 确保数据库已打开
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }
    const db = await this.open()
    if (!db) {
      throw new Error('Failed to open database')
    }
    return db
  }

  // 获取所有会话
  async getAllSessions(): Promise<ChatSession[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readonly')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)

      // 使用游标遍历所有会话，这样更高效
      const request = store.getAll()

      request.onsuccess = () => {
        const sessions = request.result as ChatSession[]
        // 按更新时间降序排序
        sessions.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(sessions)
      }

      request.onerror = () => {
        reject(new Error('Failed to get sessions'))
      }
    })
  }

  // 获取单个会话
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readonly')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)
      const request = store.get(sessionId)

      request.onsuccess = () => {
        resolve(request.result as ChatSession | null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get session'))
      }
    })
  }

  // 保存单个会话
  async saveSession(session: ChatSession): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)

      // 深度克隆对象，移除 Vue 响应式属性
      const plainSession = this.deepClone(session)
      const request = store.put(plainSession)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save session'))
      }
    })
  }

  // 批量保存会话
  async saveSessions(sessions: ChatSession[]): Promise<void> {
    if (!sessions || sessions.length === 0) {
      return this.clearAllSessions()
    }

    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)

      // 清空现有数据
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        // 批量添加会话
        const clonedSessions = sessions.map(session => this.deepClone(session))

        if (clonedSessions.length === 0) {
          resolve()
          return
        }

        let completed = 0
        const total = clonedSessions.length

        clonedSessions.forEach((session) => {
          const request = store.put(session)

          request.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve()
            }
          }

          request.onerror = () => {
            reject(new Error('Failed to save sessions'))
          }
        })
      }

      clearRequest.onerror = () => {
        reject(new Error('Failed to clear sessions'))
      }
    })
  }

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)
      const request = store.delete(sessionId)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete session'))
      }
    })
  }

  // 清空所有会话
  async clearAllSessions(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear sessions'))
      }
    })
  }

  // 深度克隆对象，移除响应式属性
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item))
    }

    if (typeof obj === 'object') {
      const clonedObj: any = {}
      Object.keys(obj).forEach((key) => {
        clonedObj[key] = this.deepClone(obj[key])
      })
      return clonedObj
    }

    return obj
  }

  // 关闭数据库
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.dbPromise = null
    }
  }

  // 获取数据库大小信息
  async getDatabaseSize(): Promise<number> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SESSIONS_STORE_NAME], 'readonly')
      const store = transaction.objectStore(SESSIONS_STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const data = request.result
        const size = new Blob([JSON.stringify(data)]).size
        resolve(size)
      }

      request.onerror = () => {
        reject(new Error('Failed to get database size'))
      }
    })
  }

  // ==================== 提示词相关方法 ====================

  // 获取所有提示词
  async getAllPrompts(): Promise<Prompt[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readonly')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)

      const request = store.getAll()

      request.onsuccess = () => {
        const prompts = request.result as Prompt[]
        resolve(prompts)
      }

      request.onerror = () => {
        reject(new Error('Failed to get prompts'))
      }
    })
  }

  // 获取单个提示词
  async getPrompt(promptId: string): Promise<Prompt | null> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readonly')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)
      const request = store.get(promptId)

      request.onsuccess = () => {
        resolve(request.result as Prompt | null)
      }

      request.onerror = () => {
        reject(new Error('Failed to get prompt'))
      }
    })
  }

  // 保存单个提示词
  async savePrompt(prompt: Prompt): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)

      // 深度克隆对象，移除 Vue 响应式属性
      const plainPrompt = this.deepClone(prompt)
      const request = store.put(plainPrompt)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to save prompt'))
      }
    })
  }

  // 批量保存提示词
  async savePrompts(prompts: Prompt[]): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)

      // 清空现有数据
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        // 批量添加提示词
        const clonedPrompts = prompts.map(prompt => this.deepClone(prompt))

        if (clonedPrompts.length === 0) {
          resolve()
          return
        }

        let completed = 0
        const total = clonedPrompts.length

        clonedPrompts.forEach((prompt) => {
          const request = store.put(prompt)

          request.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve()
            }
          }

          request.onerror = () => {
            reject(new Error('Failed to save prompts'))
          }
        })
      }

      clearRequest.onerror = () => {
        reject(new Error('Failed to clear prompts'))
      }
    })
  }

  // 删除提示词
  async deletePrompt(promptId: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)
      const request = store.delete(promptId)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete prompt'))
      }
    })
  }

  // 清空所有提示词
  async clearAllPrompts(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PROMPTS_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(PROMPTS_STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear prompts'))
      }
    })
  }
}

// 导出单例实例
export const chatDB = new IndexedDBHelper()
export type { AssistantMessage, ChatMessage, ChatSession, UserMessage }
