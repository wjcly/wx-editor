import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

import 'virtual:uno.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/theme/darcula.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/css-hint'
// 移除了搜索功能插件，使用自定义搜索面板替代
// import 'codemirror/addon/search/search'
// import 'codemirror/addon/search/searchcursor'
// import 'codemirror/addon/search/jump-to-line'
// import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/comment/comment'

const app = createApp(App)

app.use(createPinia())

app.mount(`#app`)
