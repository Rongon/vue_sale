import Vue from 'vue'
import App from './App.vue'
import router from './router/route.js'
// import './plugins/element.js'
import './assets/css/global.css'
import '../src/assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// 注册富文本编辑器的第三方插件
import VueQuillEditor from 'vue-quill-editor'

// 引入进度条nprogress插件及样式
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 请求后台接口根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置token令牌才可以访问需要授权的api
axios.interceptors.request.use(config => {
  // 开始时调用start()展示进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 完成时调用done()方法隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('TreeTable', TreeTable)

Vue.use(VueQuillEditor /* { default global options } */)

// 创建时间格式化过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
