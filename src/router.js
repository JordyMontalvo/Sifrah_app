import Vue    from 'vue'
import Router from 'vue-router'

// Auth
import Welcome  from './views/auth/Welcome.vue'
import Login    from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import Remember from './views/auth/Remember.vue'
// Aux
import Logout from './views/aux/Logout.vue'
// import Verify from './views/aux/Verify.vue'
import Check  from './views/aux/Check.vue'
// App
import Dashboard    from './views/app/Dashboard.vue'
import Status       from './views/app/Status.vue'
import Affiliation  from './views/app/Affiliation.vue'
import Activation   from './views/app/Activation.vue'
import Activations  from './views/app/Activations.vue'
import Transfer     from './views/app/Transfer.vue'
import Transfers    from './views/app/Transfers.vue'
import Directs      from './views/app/Directs.vue'
import Tree         from './views/app/Tree.vue'
import Bonuses      from './views/app/Bonuses.vue'
import Transactions from './views/app/Transactions.vue'
import Collect      from './views/app/Collect.vue'
import Collects     from './views/app/Collects.vue'
import Closeds      from './views/app/Closeds.vue'
import Tools        from './views/app/Tools.vue'
import Profile      from './views/app/Profile.vue'
import Password     from './views/app/Password.vue'
import Security     from './views/app/Security.vue'
import Resume       from './views/app/Resume.vue'


Vue.use(Router)

const routes = [
  // all
  {
    path: '*',
    redirect: '/welcome'
  },
  // Auth
  {
    path: '/welcome',
    component: Welcome,
    meta: { requiresNoAuth: true }
  },
  {
    path: '/login/:id?',
    component: Login,
    meta: { requiresNoAuth: true }
  },
  {
    path: '/register/:code?',
    component: Register,
    // meta: { requiresNoAuth: true }
  },
  {
    path: '/remember',
    component: Remember,
    meta: { requiresNoAuth: true }
  },
  // Aux
  {
    path: '/logout',
    component: Logout
  },
  // {
  //   path: '/verify',
  //   component: Verify,
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/check/:check',
    component: Check,
  },
  // App
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/status',
    component: Status,
    meta: { requiresAuth: true }
  },
  {
    path: '/affiliation',
    component: Affiliation,
    meta: { requiresAuth: true }
  },
  {
    path: '/activation',
    component: Activation,
    meta: { requiresAuth: true }
  },
  {
    path: '/activations',
    component: Activations,
    meta: { requiresAuth: true }
  },
  {
    path: '/transfer',
    component: Transfer,
    meta: { requiresAuth: true }
  },
  {
    path: '/transfers',
    component: Transfers,
    meta: { requiresAuth: true }
  },
  {
    path: '/directs',
    component: Directs,
    meta: { requiresAuth: true }
  },
  {
    path: '/tree',
    component: Tree,
    meta: { requiresAuth: true }
  },
  {
    path: '/bonuses',
    component: Bonuses,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  },
  {
    path: '/collect',
    component: Collect,
    meta: { requiresAuth: true }
  },
  {
    path: '/collects',
    component: Collects,
    meta: { requiresAuth: true }
  },
  {
    path: '/closeds',
    component: Closeds,
    meta: { requiresAuth: true }
  },
  {
    path: '/tools',
    component: Tools,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/password',
    component: Password,
    meta: { requiresAuth: true }
  },
  {
    path: '/security',
    component: Security,
    meta: { requiresAuth: true }
  },
  {
    path: '/resume',
    component: Resume,
    meta: { requiresAuth: true }
  },
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {

  const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth)
  const requiresAuth   = to.matched.some(record => record.meta.requiresAuth)

  const session   = localStorage.getItem('session')
  const office_id = localStorage.getItem('office_id')
  const path      = localStorage.getItem('path')
  // console.log({ session, office })

  if (requiresNoAuth &&  session && !office_id) { next({ path: '/dashboard' }) }
  if (requiresNoAuth &&  session &&  office_id) { next({ path: `/${path}`   }) }

  if (requiresAuth   && !session) { next({ path: '/login' }) }

  next()
})

export default router
