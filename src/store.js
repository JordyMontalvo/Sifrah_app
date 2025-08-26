import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    session:    null,
    office_id:  null,
    name:       null,
    lastName:   null,
    affiliated: null,
    activated:  null,
    _activated: null,
    plan:       null,
    country:    null,
    photo:      null,
    tree:       null,
    email:      null,
    token:      null,
    address:    null,
    city:       null,
    birthdate:   null,
    total_points: null,
    cartItems: [],

    fb:   'https://www.facebook.com/profile.php?id=61555335617817',
    is:   'https://www.instagram.com/sifrahcorp',
    tk:   'https://www.tiktok.com/@sifrah.corp',
    yt:   'https://www.youtube.com/@SIFRAHCORP',
    wsp_pe: 'https://wa.me/qr/PYSNS6G6AYACB1',
    wsp_bo: '',
    wsp_ec: '',
    site: '',

    open: false,
    resume: false,
    buys: false,
    network: false,
    commissions: false,
  },
  mutations: {
    SET_SESSION: (state, session) => {
      state.session = session
      if (session) {
        localStorage.setItem('session', session)
      } else {
        localStorage.removeItem('session')
      }
    },
    SET_OFFICE_ID: (state, {office_id, path}) => {
      state.office_id = office_id
      if (office_id) {
        localStorage.setItem('office', 'true')
        localStorage.setItem('office_id', office_id)
        localStorage.setItem('path', path)
      } else {
        localStorage.removeItem('office')
        localStorage.removeItem('office_id')
        localStorage.removeItem('path')
      }
    },
    SET_NAME: (state, name) => {
      state.name = name
      if (name) {
        localStorage.setItem('name', name)
      } else {
        localStorage.removeItem('name')
      }
    },
    SET_LAST_NAME: (state, lastName) => {
      state.lastName = lastName
      if (lastName) {
        localStorage.setItem('lastName', lastName)
      } else {
        localStorage.removeItem('lastName')
      }
    },
    SET_AFFILIATED: (state, affiliated) => {
      state.affiliated = affiliated
      if (affiliated !== null && affiliated !== undefined) {
        localStorage.setItem('affiliated', affiliated.toString())
      } else {
        localStorage.removeItem('affiliated')
      }
    },
    SET_ACTIVATED: (state, activated) => {
      state.activated = activated
      if (activated !== null && activated !== undefined) {
        localStorage.setItem('activated', activated.toString())
      } else {
        localStorage.removeItem('activated')
      }
    },
    SET__ACTIVATED: (state, _activated) => {
      state._activated = _activated
      if (_activated !== null && _activated !== undefined) {
        localStorage.setItem('_activated', _activated.toString())
      } else {
        localStorage.removeItem('_activated')
      }
    },
    SET_PLAN: (state, plan) => {
      state.plan = plan
      if (plan) {
        localStorage.setItem('plan', plan)
      } else {
        localStorage.removeItem('plan')
      }
    },
    SET_COUNTRY: (state, country) => {
      state.country = country
      if (country) {
        localStorage.setItem('country', country)
      } else {
        localStorage.removeItem('country')
      }
    },
    SET_PHOTO: (state, photo) => {
      state.photo = photo
      if (photo) {
        localStorage.setItem('photo', photo)
      } else {
        localStorage.removeItem('photo')
      }
    },
    SET_TREE: (state, tree) => {
      state.tree = tree
      if (tree !== null && tree !== undefined) {
        localStorage.setItem('tree', tree.toString())
      } else {
        localStorage.removeItem('tree')
      }
    },
    SET_EMAIL: (state, email) => {
      state.email = email
      if (email) {
        localStorage.setItem('email', email)
      } else {
        localStorage.removeItem('email')
      }
    },
    SET_TOKEN: (state, token) => {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_ADDRESS: (state, address) => {
      state.address = address
      if (address) {
        localStorage.setItem('address', address)
      } else {
        localStorage.removeItem('address')
      }
    },
    SET_CITY: (state, city) => {
      state.city = city
      if (city) {
        localStorage.setItem('city', city)
      } else {
        localStorage.removeItem('city')
      }
    },
    SET_BIRTHDATE: (state, birthdate) => {
      state.birthdate = birthdate
      if (birthdate) {
        localStorage.setItem('birthdate', birthdate)
      } else {
        localStorage.removeItem('birthdate')
      }
    },
    SET_TOTAL_POINTS: (state, total_points) => {
      state.total_points = total_points
      if (total_points !== null && total_points !== undefined) {
        localStorage.setItem('total_points', total_points.toString())
      } else {
        localStorage.removeItem('total_points')
      }
    },
    SET_BALANCE: (state, balance) => {
      state.balance = balance
      if (balance !== null && balance !== undefined) {
        localStorage.setItem('balance', balance.toString())
      } else {
        localStorage.removeItem('balance')
      }
    },
    SET__BALANCE: (state, _balance) => {
      state._balance = _balance
      if (_balance !== null && _balance !== undefined) {
        localStorage.setItem('_balance', _balance.toString())
      } else {
        localStorage.removeItem('_balance')
      }
    },
    setCartItems: (state, cartItems) => {
      state.cartItems = cartItems
    },
    
    // Mutaciones de menú
    SET_OPEN: (state) => {
      state.open = !state.open
    },
    SET_RESUME: (state) => {
      state.resume = !state.resume
      state.buys = false
      state.network = false
      state.commissions = false
    },
    SET_BUYS: (state) => {
      state.resume = false
      state.buys = !state.buys
      state.network = false
      state.commissions = false
    },
    SET_NETWORK: (state) => {
      state.resume = false
      state.buys = false
      state.network = !state.network
      state.commissions = false
    },
    SET_COMMISSIONS: (state) => {
      state.resume = false
      state.buys = false
      state.network = false
      state.commissions = !state.commissions
    },
  },
  actions: {
    // Acción para restaurar el estado desde localStorage
    async restoreState({ commit }) {
      try {
        console.log('Restaurando estado desde localStorage...');
        
        const session = localStorage.getItem('session')
        if (session) {
          commit('SET_SESSION', session)
          console.log('Sesión restaurada:', !!session);
        }
        
        const office_id = localStorage.getItem('office_id')
        const path = localStorage.getItem('path')
        if (office_id) {
          commit('SET_OFFICE_ID', { office_id, path })
          console.log('Office ID restaurado:', !!office_id);
        }
        
        const name = localStorage.getItem('name')
        if (name) commit('SET_NAME', name)
        
        const lastName = localStorage.getItem('lastName')
        if (lastName) commit('SET_LAST_NAME', lastName)
        
        const affiliated = localStorage.getItem('affiliated')
        if (affiliated !== null) {
          const isAffiliated = affiliated === 'true'
          commit('SET_AFFILIATED', isAffiliated)
          console.log('Estado de afiliación restaurado:', isAffiliated);
        }
        
        const activated = localStorage.getItem('activated')
        if (activated !== null) commit('SET_ACTIVATED', activated === 'true')
        
        const _activated = localStorage.getItem('_activated')
        if (_activated !== null) commit('SET__ACTIVATED', _activated === 'true')
        
        const plan = localStorage.getItem('plan')
        if (plan) commit('SET_PLAN', plan)
        
        const country = localStorage.getItem('country')
        if (country) commit('SET_COUNTRY', country)
        
        const photo = localStorage.getItem('photo')
        if (photo) commit('SET_PHOTO', photo)
        
        const tree = localStorage.getItem('tree')
        if (tree !== null) commit('SET_TREE', tree === 'true')
        
        const email = localStorage.getItem('email')
        if (email) commit('SET_EMAIL', email)
        
        const token = localStorage.getItem('token')
        if (token) commit('SET_TOKEN', token)
        
        const address = localStorage.getItem('address')
        if (address) commit('SET_ADDRESS', address)
        
        const city = localStorage.getItem('city')
        if (city) commit('SET_CITY', city)
        
        const birthdate = localStorage.getItem('birthdate')
        if (birthdate) commit('SET_BIRTHDATE', birthdate)
        
        const total_points = localStorage.getItem('total_points')
        if (total_points !== null) commit('SET_TOTAL_POINTS', parseInt(total_points))
        
        const balance = localStorage.getItem('balance')
        if (balance !== null) commit('SET_BALANCE', parseFloat(balance))
        
        const _balance = localStorage.getItem('_balance')
        if (_balance !== null) commit('SET__BALANCE', parseFloat(_balance))
        
        console.log('Estado restaurado exitosamente');
        return true;
      } catch (error) {
        console.error('Error al restaurar el estado:', error);
        return false;
      }
    },
    
    // Acción para limpiar todo el estado
    clearState({ commit }) {
      commit('SET_SESSION', null)
      commit('SET_OFFICE_ID', { office_id: null, path: null })
      commit('SET_NAME', null)
      commit('SET_LAST_NAME', null)
      commit('SET_AFFILIATED', null)
      commit('SET_ACTIVATED', null)
      commit('SET__ACTIVATED', null)
      commit('SET_PLAN', null)
      commit('SET_COUNTRY', null)
      commit('SET_PHOTO', null)
      commit('SET_TREE', null)
      commit('SET_EMAIL', null)
      commit('SET_TOKEN', null)
      commit('SET_ADDRESS', null)
      commit('SET_CITY', null)
      commit('SET_BIRTHDATE', null)
      commit('SET_TOTAL_POINTS', null)
      commit('SET_BALANCE', null)
      commit('SET__BALANCE', null)
    }
  }
})
