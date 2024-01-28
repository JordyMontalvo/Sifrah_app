<template>
  <App :session="session">

    <h4>PERFIL</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <i class="icon fas fa-flag"></i>
      <input class="input" readonly
      placeholder="Pais"
      v-model="country"> <br>

      <i class="icon fas fa-user"></i>
      <input class="input" readonly
      placeholder="Nombre"
      v-model="name"> <br>

      <i class="icon fas fa-user"></i>
      <input class="input" readonly
      placeholder="Apellido"
      v-model="lastName"> <br>

      <i class="icon far fa-id-card"></i>
      <input class="input" readonly
      placeholder="Documento de identidad"
      v-model="dni">&nbsp;
      <router-link to="/password" style="font-size: 12px; text-decoration: underline;">
        Cambiar contraseña
      </router-link> <br>


      <div v-if="token">

        <i class="icon fas fa-user-shield"></i>
        <input class="input" readonly @click="copy_token" id="token"
        v-model="token">
        <i class="copy" v-if="c_token">código copiado <i class="fas fa-check"></i></i><br>

        <i class="icon fas fa-share-alt"></i>
        <input class="input" readonly @click="copy_link" id="link"
        v-model="link">
        <i class="copy" v-if="c_link">link copiado <i class="fas fa-check"></i></i>

        &nbsp;<a v-bind:href="link"> <small> Registrar </small> </a> <br>

      </div>


      <i class="icon fas fa-envelope"></i>
      <input class="input" placeholder="Correo electrónico"
      v-model="email"> <br>

      <i class="icon fas fa-mobile-alt"></i>
      <input class="input" placeholder="Teléfono"
      v-model="phone"> <br>

      <!-- <i class="icon fas fa-user"></i>
      <input class="input" placeholder="edad"
      oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
      v-model="age"> <br> -->

      <i class="icon fa fa-calendar"></i>
      <input type="date" class="input" placeholder="Fecha de Nacimiento" readonly
      v-model="birthdate"> <br>

      <i class="icon fas fa-map-marker-alt"></i>
      <input class="input" placeholder="Dirección"
      v-model="address"> <br>

      <router-link to="/security">
        <button class="button">Persona de confianza</button>
      </router-link> <br>

      <br>
      <a class="route">Datos Bancarios</a> <br>

      <i class="icon fas fa-university"></i>
      <!-- <select class="input"
      v-model="bank" :disabled="bank_disabled"> -->
      <select class="input"
      v-model="bank">
        <option value="null" disabled>Banco</option>
        <option value="Banco de Guayaquil">Banco de Guayaquil</option>
        <option value="Banco de la JEF">Banco de la JEF</option>
        <option value="Banco del pacifico">Banco del pacifico</option>
        <option value="Banco internaciona">Banco internaciona</option>
        <option value="Banco Pichincha">Banco Pichincha</option>
      </select> <br>

      <i class="icon fas fa-university"></i>
      <!-- <select class="input"
      v-model="account_type" :disabled="account_type_disabled"> -->
      <select class="input"
      v-model="account_type">
        <option value="null" disabled>Tipo de cuenta</option>
        <option value="Ahorros">Ahorros</option>
        <option value="Corriente">Corriente</option>
      </select> <br>

      <i class="icon fas fa-user-circle"></i>
      <!-- <input class="input" placeholder="Número de cuenta" :disabled="account_disabled"
      v-model="account"> <br> -->
      <input class="input" placeholder="Número de cuenta"
      v-model="account"> <br>

      <br>

      <!-- <i class="icon far fa-user-circle"></i>
      <input class="input" placeholder="Código interbancario" :disabled="ibk_disabled"
      v-model="ibk"> <br> -->

      <button class="button" v-show="!sending" @click="UPDATE">Guardar</button>
      <button class="button" v-show= "sending" disabled>Guardando datos ...</button>
      <br>
      <br>
    </section>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

const ROOT = process.env.VUE_APP_ROOT
console.log({ ROOT })

export default {
  components: {
    App,
  },
  data() {
    return {
      country:    null,
      name:       null,
      lastName:   null,
      email:      null,
      phone:      null,
      birthdate:  null,
      address:    null,
      token:      null,

      bank:         null,
      account_type: null,
      account:      null,
      ibk:          null,

      bank_disabled:         false,
      account_type_disabled: false,
      account_disabled:      false,
      ibk_disabled:          false,

      loading: true,
      sending: false,

      c_token: false,
      c_link:  false,
    }
  },
  computed: {
    session() { return this.$store.state.session },
    link()    { return `${ROOT}/register/${this.token}`},
  },
  async created() {
    // GET data
    const { data } = await api.Profile.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET__ACTIVATED',  data._activated)
    this.$store.commit('SET_ACTIVATED',  data.activated)
    this.$store.commit('SET_PLAN',       data.plan)
    this.$store.commit('SET_COUNTRY',    data.country)
    this.$store.commit('SET_PHOTO',      data.photo)
    this.$store.commit('SET_TREE',       data.tree)

    this.country      = data.country
    this.dni          = data.dni
    this.name         = data.name
    this.lastName     = data.lastName
    this.email        = data.email
    this.phone        = data.phone
    this.birthdate    = data.birthdate
    this.address      = data.address
    this.token        = data.token
    this.bank         = data.bank
    this.account_type = data.account_type
    this.account      = data.account
    this.ibk          = data.ibk

    if(this.bank)         this.bank_disabled         = true
    if(this.account_type) this.account_type_disabled = true
    if(this.account)      this.account_disabled      = true
    if(this.ibk)          this.ibk_disabled          = true
  },
  methods: {
    async UPDATE() {

      const { email, phone, birthdate, address, bank, account_type, account, ibk } = this

      // UPDATE Profile
      this.sending = true

      const { data } = await api.Profile.UPDATE(this.session, {
        email,
        phone,
        birthdate,
        address,
        bank,
        account_type,
        account,
        ibk,
      }); console.log({ data })

      this.sending = false
    },
    copy_token() {
      lib.copy('token')
      this.c_token = true
      setTimeout(() => this.c_token = false, 4000)
    },
    copy_link() {
      lib.copy('link')
      this.c_link = true
      setTimeout(() => this.c_link = false, 4000)
    },
  },
};
</script>
