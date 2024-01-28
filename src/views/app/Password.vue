<template>
  <App :session="session">

    <h4>CAMBIAR PASSWORD</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <i class="icon fas fa-unlock-alt"></i>
      <input class="input" placeholder="Actual Password"
      v-model="oldPassword"
      @keydown="reset('email')"> <br>

      <i class="icon fas fa-unlock-alt"></i>
      <input class="input" placeholder="Nuevo Password"
      v-model="newPassword"
      @keydown="reset('email')"> <br>

      <p class="alert">{{ alert | alert }}</p>

      <small v-if="success" class="success">Password actualizado</small> <br>

      <button class="button" v-show="!sending" @click="UPDATE">Actualizar</button>
      <button class="button" v-show= "sending" disabled>Actualizando password ...</button>
    </section>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

export default {
  components: {
    App,
  },
  data() {
    return {
      name:    null,
      oldPassword: null,
      newPassword: null,

      loading: true,
      sending: false,

      alert: null,

      success: false,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  filters: {
    alert(msg) {
      if (msg == 'invalid password') return 'El password actual no coincide'
    },
  },
  async created() {
    // GET data
    const { data } = await api.Password.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED',  data.activated)

  },
  methods: {
    async UPDATE() {

      const { oldPassword, newPassword } = this

      // UPDATE Profile
      this.sending = true

      const { data } = await api.Password.UPDATE(this.session, {
        oldPassword,
        newPassword,
      }); console.log({ data })

      this.sending = false

      // error
      if(data.error) return this.alert = data.msg

      // success
      this.success = true
    },
    reset() {
      this.alert = null
    },
  },
};
</script>
