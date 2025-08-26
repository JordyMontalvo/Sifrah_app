import Vue    from 'vue'
import Router from 'vue-router'
import store from './store'

// Auth
import Welcome  from './views/auth/Welcome.vue'
import Login    from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import Remember from './views/auth/Remember.vue'
import ResetPassword from './views/auth/ResetPassword.vue'
// Aux
import Logout from './views/auxi/Logout.vue'
// import Verify from './views/auxi/Verify.vue'
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
  // Redirección por defecto para usuarios autenticados
  {
    path: '/',
    redirect: to => {
      const session = localStorage.getItem('session');
      const affiliated = localStorage.getItem('affiliated') === 'true';
      
      if (!session) {
        return '/login';
      } else if (!affiliated) {
        return '/affiliation';
      } else {
        return '/dashboard';
      }
    }
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
  {
    path: '/reset-password',
    component: ResetPassword,
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
    meta: { requiresAuth: true, requiresAffiliation: true }
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

  // Obtener datos del store (estado actual) y localStorage (estado persistido)
  const session   = store.state.session || localStorage.getItem('session')
  const office_id = store.state.office_id || localStorage.getItem('office_id')
  const path      = localStorage.getItem('path')
  const affiliated = store.state.affiliated !== null ? store.state.affiliated : (localStorage.getItem('affiliated') === 'true')

  console.log('Router Guard:', { 
    to: to.path, 
    session: !!session, 
    affiliated, 
    office_id: !!office_id,
    requiresAuth,
    requiresAffiliation,
    requiresNoAuth
  })

  // Si es usuario de oficina, manejar redirección especial
  if (office_id && path) {
    if (requiresNoAuth && session) {
      next({ path: `/${path}` })
      return
    }
  }

  // Si requiere no autenticación y ya está autenticado
  if (requiresNoAuth && session && !office_id) {
    if (affiliated) {
      next({ path: '/dashboard' })
    } else {
      next({ path: '/affiliation' })
    }
    return
  }

  // Si requiere autenticación y no está autenticado
  if (requiresAuth && !session) {
    next({ path: '/login' })
    return
  }

  // Si requiere afiliación y no está afiliado
  if (requiresAffiliation && !affiliated) {
    next({ path: '/affiliation' })
    return
  }

  // Si está autenticado pero no afiliado y no está en afiliación
  if (session && !affiliated && to.path !== '/affiliation' && to.path !== '/profile' && to.path !== '/password' && to.path !== '/security') {
    next({ path: '/affiliation' })
    return
  }

  next()
})

export default router
