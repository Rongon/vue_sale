module.exports = {
  chainWebpack: config => {
    // build阶段使用的main文件
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 首页内容不同的定制
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发阶段使用的main文件
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
    })
    config.plugin('html').tap(args => {
      args[0].isProd = false
      return args
    })
  }
}
