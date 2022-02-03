// 在项目发布阶段才需要用到的bable插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品适合的插件数组 ...代表数组展开
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
