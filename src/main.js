import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api'

Vue.config.productionTip = false

// Global Logout Mixin
Vue.mixin({
  methods: {
    logout() {
      localStorage.removeItem('session')
      api.logout(this.session)
      
      const office = localStorage.getItem('office')

      if(office == 'true') {

        const office_id = localStorage.getItem('office_id')
        const path      = localStorage.getItem('path')

        const url = `/login/${office_id}?path=${path}`
        console.log({url})
        
        localStorage.removeItem('office_id')

        this.$router.push(url)

      } else {

        this.$router.push('/login')
      }

    },
    logout2() {
      localStorage.removeItem('session')
      api.logout(this.session)

      this.$router.push('/login')
    },
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
