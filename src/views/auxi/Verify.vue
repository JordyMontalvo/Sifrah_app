<template>
  <div class="verify">
    <img class="logo" src="@/assets/img/logo/logo.svg"> <br><br>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">
      <h3>Confirmar Email</h3> <br>
      <h4>Se envió un email a {{ email }}</h4> <br>
      <small @click="logout" style="cursor: pointer">Cerar sesión</small>
    </section>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data() {
    return {
      email:   null,
      loading: true,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  async created() {
    // GET data
    const { data } = await api.verify(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'verified user')   this.$router.push('/dashboard')

    // success
    this.email = data.email
  },
  methods: {
    resend() {
    },
  },
};
</script>

<style lang="stylus">
  .verify
    padding 16px
    max-width 768px
    margin auto
</style>

<!-- <small>No recibiste el email? <i @click="resend">Reenviar email</i></small> <br><br><br> -->
