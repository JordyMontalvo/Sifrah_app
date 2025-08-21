import Vue    from 'vue'
import Router from 'vue-router'

// Auth
import Welcome  from './views/auth/Welcome.vue'
import Login    from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import Remember from './views/auth/Remember.vue'
// Aux
import Logout from './views/auxi/Logout.vue'
// import Verify from './views/iaux/Verify.vue'
import Check  from './views/auxi/Check.vue'
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
import frontales from './views/app/frontales.vue'
import Checkout from './views/app/Checkout.vue'


Vue.use(Router)

const routes = [
  // all
  {
    path: '*',
    redirect: '/login'
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
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tree',
    component: Tree,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tree/red',
    component: Tree,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tree/frontales',
    component: Tree,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tree/niveles',
    component: Tree,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tree/actividad',
    component: Tree,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/bonuses',
    component: Bonuses,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/transactions',
    component: Transactions,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/collect',
    component: Collect,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/collects',
    component: Collects,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/closeds',
    component: Closeds,
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/tools',
    component: Tools,
    meta: { requiresAuth: true, requiresAffiliation: true }
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
    meta: { requiresAuth: true, requiresAffiliation: true }
  },
  {
    path: '/frontales',
    component: frontales,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  }
]

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {

  const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth)
  const requiresAuth   = to.matched.some(record => record.meta.requiresAuth)
  const requiresAffiliation = to.matched.some(record => record.meta.requiresAffiliation)

  const session   = localStorage.getItem('session')
  const office_id = localStorage.getItem('office_id')
  const path      = localStorage.getItem('path')
  const affiliated = localStorage.getItem('affiliated') === 'true'
  // console.log({ session, office })

  if (requiresNoAuth &&  session && !office_id) { next({ path: '/dashboard' }) }
  if (requiresNoAuth &&  session &&  office_id) { next({ path: `/${path}`   }) }

  if (requiresAuth   && !session) { next({ path: '/login' }) }
  
  // Verificar afiliación para rutas que la requieren
  if (requiresAffiliation && !affiliated) {
    // Redirigir inmediatamente a afiliación
    next({ path: '/affiliation', query: { redirected: 'true' } });
    return;
  }

  next()
})



export default router
