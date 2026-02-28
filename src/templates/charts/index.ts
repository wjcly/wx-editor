// 图表模板
export const chartTemplates = [
  {
    name: `流程图`,
    content: `\`\`\`mermaid\ngraph TD\n    A[开始] --> B{判断条件}\n    B -->|条件1| C[处理1]\n    B -->|条件2| D[处理2]\n    C --> E[结束]\n    D --> E\n\`\`\``,
  },
  {
    name: `时序图`,
    content: `\`\`\`mermaid\nsequenceDiagram\n    participant 用户\n    participant 系统\n    participant 数据库\n    \n    用户->>系统: 发送请求\n    系统->>数据库: 查询数据\n    数据库-->>系统: 返回结果\n    系统-->>用户: 显示结果\n\`\`\``,
  },
  {
    name: `甘特图`,
    content: `\`\`\`mermaid\ngantt\n    title 项目进度表\n    dateFormat  YYYY-MM-DD\n    section 阶段1\n    任务1           :a1, 2024-01-01, 30d\n    任务2           :after a1, 20d\n    section 阶段2\n    任务3           :2024-02-01, 35d\n    任务4           :2024-03-01, 20d\n\`\`\``,
  },
  {
    name: `饼图`,
    content: `\`\`\`mermaid\npie title 收入分布\n    "工资" : 60\n    "投资" : 20\n    "其他" : 20\n\`\`\``,
  },
  {
    name: `类图`,
    content: `\`\`\`mermaid\nclassDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound()\n    }\n    class Dog {\n        +bark()\n    }\n    class Cat {\n        +meow()\n    }\n    Animal <|-- Dog\n    Animal <|-- Cat\n\`\`\``,
  },
  {
    name: `状态图`,
    content: `\`\`\`mermaid\nstateDiagram-v2\n    [*] --> 待处理\n    待处理 --> 处理中: 开始处理\n    处理中 --> 已完成: 处理完成\n    处理中 --> 失败: 处理失败\n    失败 --> 待处理: 重试\n    已完成 --> [*]\n\`\`\``,
  },
  {
    name: `ER图`,
    content: `\`\`\`mermaid\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses\n    ORDER {
        int id
        string status
        date created_at
    }\n    CUSTOMER {\n        int id\n        string name\n        string email\n    }\n\`\`\``,
  },
  {
    name: `用户旅程图`,
    content: `\`\`\`mermaid\njourney\n    title 用户购物流程\n    section 浏览商品\n      访问首页: 5: 用户\n      搜索商品: 4: 用户\n      查看详情: 3: 用户\n    section 购买流程\n      加入购物车: 4: 用户\n      结算: 3: 用户,系统\n      支付: 5: 用户,系统\n    section 收货\n      物流追踪: 4: 用户,系统\n      确认收货: 5: 用户\n\`\`\``,
  },
  {
    name: `思维导图`,
    content: `\`\`\`mermaid\nmindmap\n  root((项目管理))\n    开发流程\n      需求分析\n      设计\n      编码\n      测试\n      部署\n    团队管理\n      任务分配\n      进度跟踪\n      绩效考核\n    质量控制\n      代码审查\n      自动化测试\n      性能优化\n    风险管理\n      识别风险\n      评估风险\n      应对措施\n\`\`\``,
  },
  {
    name: `Git分支图`,
    content: `\`\`\`mermaid\ngitGraph\n    commit\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit\n    branch feature\n    checkout feature\n    commit\n    commit\n    checkout develop\n    merge feature\n    checkout main\n    merge develop\n\`\`\``,
  },
  {
    name: `四象限图`,
    content: `\`\`\`mermaid\nquadrantChart\n    title 优先级矩阵\n    x-axis "低紧急" --> "高紧急"\n    y-axis "低重要" --> "高重要"\n    quadrant-1 "重要且紧急"\n    quadrant-2 "重要不紧急"\n    quadrant-3 "不重要但紧急"\n    quadrant-4 "不重要不紧急"\n    "立即处理": [0.8, 0.8]\n    "关键任务": [0.7, 0.9]\n    "计划处理": [0.2, 0.7]\n    "战略任务": [0.3, 0.6]\n    "委托他人": [0.8, 0.3]\n    "干扰任务": [0.6, 0.2]\n    "可以延后": [0.3, 0.4]\n    "琐碎任务": [0.2, 0.1]\n\`\`\``,
  },
  {
    name: `时间线`,
    content: `\`\`\`mermaid\ntimeline\n    title 项目时间线\n    section 2024 Q1\n        1月: 项目启动\n        2月: 需求分析\n        3月: 概要设计\n    section 2024 Q2\n        4月: 详细设计\n        5月: 开发实现\n        6月: 单元测试\n    section 2024 Q3\n        7月: 集成测试\n        8月: 系统测试\n        9月: 验收测试\n    section 2024 Q4\n        10月: 试运行\n        11月: 正式上线\n        12月: 运维支持\n\`\`\``,
  },
]
