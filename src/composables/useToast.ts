import { toast as sonnerToast } from 'vue-sonner'

interface ToastOptions {
  duration?: number
  position?: `top-center` | `top-right` | `bottom-right` | `bottom-center`
}

// 创建一个包装器，统一处理提示样式
export const toast = {
  success(message: string, options: ToastOptions = {}) {
    sonnerToast.success(message, {
      duration: options.duration || 2000,
      position: options.position || `top-center`,
      closeButton: false,
      classes: {
        toast: 'shadow-xl bg-transparent',
        success: 'border-l-4 border-l-green-500 bg-transparent text-green-700 font-medium',
      },
    })
  },

  error(message: string, options: ToastOptions = {}) {
    sonnerToast.error(message, {
      duration: options.duration || 3000,
      position: options.position || `top-center`,
      closeButton: false,
      classes: {
        toast: 'shadow-xl z-[1000] backdrop-blur-sm',
        error: 'border-l-4 border-l-red-500 bg-white text-red-700 font-medium',
      },
    })
  },

  info(message: string, options: ToastOptions = {}) {
    sonnerToast(message, {
      duration: options.duration || 2000,
      position: options.position || `top-center`,
      closeButton: false,
      classes: {
        toast: 'shadow-xl z-[1000] backdrop-blur-sm',
        info: 'border-l-4 border-l-blue-500 bg-white text-blue-700 font-medium',
      },
    })
  },

  warning(message: string, options: ToastOptions = {}) {
    sonnerToast.warning(message, {
      duration: options.duration || 3000,
      position: options.position || `top-center`,
      closeButton: false,
      classes: {
        toast: 'shadow-xl z-[1000] backdrop-blur-sm',
        warning: 'border-l-4 border-l-yellow-500 bg-white text-yellow-700 font-medium',
      },
    })
  },
}
