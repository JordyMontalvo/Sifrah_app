<template>
  <Auth> <br>

    <router-link to="/login"    class="button large">INGRESAR A OFICINA</router-link>
    <router-link to="/register" class="button large">REGISTRAR DISTRIBUIDOR</router-link>
    <!-- <router-link to="/welcome"  class="button large">ACESSO</router-link>
    <router-link to="/welcome"  class="button large">APP</router-link> -->

    <a :href="wsp"  target="_blank" class="route">WhatsApp de ayuda</a>

  </Auth>
</template>

<script>
import Auth from '@/views/layouts/Auth'

export default {
  components: { Auth },

  computed: {
    // wsp()  { return this.$store.state.wsp_ec }
    wsp()  { return this.$store.state.wsp_pe }
  },
}
</script>
