import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  unocss: true,
  typescript: true,
  formatters: true,
  ignores: [`.github`, `scripts`, `src/assets`, `example`, `**/*.bak`, `**/*.backup`, `public/`],
}, {
  rules: {
    'semi': [`error`, `never`],
    'quotes': [`error`, `backtick`, { avoidEscape: true, allowTemplateLiterals: true }],
    'no-unused-vars': `off`,
    'no-console': `off`,
    'no-debugger': `off`,
    'no-alert': `off`, // 禁用 no-alert 规则
    'vue/require-explicit-emits': `off`, // 禁用 require-explicit-emits 规则
  },
}, {
  files: [`**/*.ts`, `**/*.vue`],
  rules: {
    quotes: [`error`, `single`, { avoidEscape: true, allowTemplateLiterals: true }],
  },
})
