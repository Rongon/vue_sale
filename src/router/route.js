import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载
const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/home.vue')
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/welcome.vue')

const Users = () => import(/* webpackChunkName: "Users-Roles" */ '../components/user/users.vue')
const Roles = () => import(/* webpackChunkName: "Users-Roles" */ '../components/power/roles.vue')

const Rights = () => import(/* webpackChunkName: "Rights-Cate-Params" */ '../components/power/rights.vue')
const Cate = () => import(/* webpackChunkName: "Rights-Cate-Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Rights-Cate-Params" */ '../components/goods/Params.vue')

const Goods = () => import(/* webpackChunkName: "Goods-Add" */ '../components/goods/Goods.vue')
const Add = () => import(/* webpackChunkName: "Goods-Add" */ '../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "Order-Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order-Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to表示将要访问的路径
  // from代表从哪个路径跳转而来
  // next函数，控制放行；next()默认放行；next('/***')强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
