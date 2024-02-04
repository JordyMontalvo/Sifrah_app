<template>
  <Auth>
    <section>
      <br>

      <i class="icon fa fa-flag"></i>
      <select class="input" v-model="country"
        :class="{'error': error.country}"
        @change="reset('country')">
        <option value="null" disabled>País</option>
        <option value="Perú"      >🇵🇪 Perú</option>
        <option value="Ecuador"   >🇪🇨 Ecuador</option>
        <option value="Argentina" >🇦🇷 Argentina</option>
        <option value="Bolivia"   >🇧🇴 Bolivia</option>
        <option value="Colombia"  >🇨🇴 Colombia</option>
        <option value="Costa Rica">🇨🇷 Costa Rica</option>
        <option value="Chile"     >🇨🇱 Chile</option>
      </select> <br>

      <i class="icon fa fa-id-card"></i>
      <input class="input" placeholder="Documento de identidad"
      oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
      v-model="dni"
      :class="{'error': error.dni}"
      @keydown="reset('dni')"> <br>

      <i class="icon fa-solid fa-user-tie"></i>
      <input class="input" placeholder="Nombre"
      v-model="name"
      :class="{'error': error.name}"
      @keydown="reset('name')"
      :disabled="country == 'Perú' && !younger"> <br>

      <i class="icon fa-solid fa-user-tie"></i>
      <input class="input" placeholder="Apellidos"
      v-model="lastName"
      :class="{'error': error.lastName}"
      @keydown="reset('lastName')"
      :disabled="country == 'Perú' && !younger"> <br>

      <i class="icon fa fa-calendar"></i>
      <input type="date" class="input" placeholder="Fecha de Nacimiento"
      v-model="date"> <br>

      <i class="icon fa-solid fa-mobile-retro" v-if="!country"></i>
      <small v-if="country" style="min-width: 25px; margin-right: 8px; display: inline-block;">{{ prefix }}</small>
      <input class="input" placeholder="Celular" maxlength="12"
      v-model="phone"> <br>

      <i class="icon fa-solid fa-envelope-open"></i>
      <input class="input" placeholder="Correo"
      v-model.trim="email"> <br>

      <i class="icon fa-solid fa-key"></i>
      <input :type="show ? 'text' : 'password'" class="input pass" placeholder="Contraseña"
      v-model="password"
      :class="{'error': error.password}"
      @keydown="reset('password')">
      <i class="show far fa-eye" @click="show = !show"></i> <br>

      <i class="icon fa-solid fa-paper-plane"></i>
      <input class="input" placeholder="Código de patrocinador" :disabled="disabled"
      v-model="code"
      :class="{'error': error.code}"
      @keydown="reset('code')"> <br><br>

      <p class="alert">{{ alert | alert }}</p>


      <small><input type="checkbox" v-model="check">Acepto los <a href="" target="_blank" style="color: #351251;font-weight: 600;">términos de uso</a></small> <br>


      <button class="button" v-show="!sending" @click="submit">Registrarme</button>
      <button class="button" v-show= "sending" disabled>Creando cuenta ...</button> <br><br>

    </section>
    <footer>
      <router-link to="/welcome" class="route">Regresar</router-link>
      <br>
      <header>
        <div class="social">
          <!-- <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank"></a>
          <a class="fab fa-tiktok"          :href="tk" target="_blank"></a>
          <a class="fab fa-youtube"         :href="yt" target="_blank"></a> -->
          <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank"></a>
          <!-- <a class="fab fa-tiktok"          target="_blank"></a> -->
          <a class="fab fa-youtube"         target="_blank"></a>
        </div>
      </header>
    </footer>
  </Auth>
</template>

<script>
import Auth from '@/views/layouts/Auth'
import api  from '@/api'

export default {
  components: { Auth },
  data() {
    return {
      // country: 'Perú',
      // country: 'Bolivia',
      // country: 'Ecuador',
      country: null,

      younger: false,
      dni:      null,
      name:     null,
      lastName: null,
      // username: null,
      date:     null,
      email:    null,
      phone:    null,
      password: "123456",
      code:     null,
      check:    false,
      error: {
        country:  false,
        dni:      false,
        name:     false,
        lastName: false,
        // username: false,
        email:    false,
        phone:    false,
        password: false,
        code:     false,
      },
      sending:  false,
      alert:    null,
      disabled: false,
      show:     false,
    }
  },
  filters: {
    alert(msg) {
      // if (msg == 'username already use') return 'El usuario ya existe'
      if (msg == 'dni already use') return 'El documento ya existe'
      if (msg == 'code not found')  return 'El código de invitación no existe'
    },
  },
  computed: {

    // social
    fb() { return this.$store.state.fb },
    is() { return this.$store.state.is },
    tk() { return this.$store.state.tk },
    yt() { return this.$store.state.yt },

    prefix() {
      if(this.country == 'Ecuador')    return '+593'
      if(this.country == 'Perú')       return '+51'
      if(this.country == 'Argentina')  return '+54'
      if(this.country == 'Bolivia')    return '+591'
      if(this.country == 'Colombia')   return '+57'
      if(this.country == 'Costa Rica') return '+506'
      if(this.country == 'Chile')      return '+56'
    },
  },
  created() {
    this.code = this.$route.params.code

    if(this.code) this.disabled = true
  },
  watch: {
    async dni(dni) {
      if(this.country != 'Perú' || this.younger) return

      if(dni.length < 8) return

      const response = await fetch(`https://dniruc.apisperu.com/api/v1/dni/${dni}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImhhbnNldmFuZ2VsaXN0YUBnbWFpbC5jb20ifQ.Fa2w9sYLXtcgMbtM58YRiwYvomChYwwMAoIDmYmo1H8`)

      var data = await response.json()
      console.log(data)

      if(data.success == false) {
        console.log('person not found ...')
        this.error.name = true
        return
      }

      this.error.name = false

      this.name     = data.nombres
      this.lastName = data.apellidoPaterno + ' ' + data.apellidoMaterno
    }
  },
  methods: {
    async submit() {

      // const { name, lastName, username, email, password, phone, code, check } = this
      const { country, dni, name, lastName, date, email, password, phone, code, check } = this

      // valid fields
      if(!country)  { return this.error.country  = true }
      if(!dni)      { return this.error.dni      = true }
      if(!name)     { return this.error.name     = true }
      if(!lastName) { return this.error.lastName = true }
      // if(!username) { return this.error.username = true }
      // if(!email)    { return this.error.email    = true }
      if(!password) { return this.error.password = true }
      // if(!phone)    { return this.error.phone    = true }
      if(!code)     { return this.error.code     = true }
      if(!check)    { return }

      // POST Register
      this.sending = true

      // const { data } = await api.register({ name, lastName, username, email, password, phone, code }); console.log({ data })
      const { data } = await api.register({ country, dni, name, lastName, date, email, password, phone, code }); console.log({ data })

      this.sending = false

      // error
      if(data.error) return this.alert = data.msg


      // logout
      const session = localStorage.getItem('session')
      if(session) {
        localStorage.removeItem('session')
        api.logout(this.session)
      }

      // login
      this.$store.commit('SET_SESSION', data.session)

      // routing
      this.$router.push('/dashboard')

    },
    reset(name) {
      this.alert = null

      if(name == 'country')  this.error.country  = false
      if(name == 'dni')      this.error.dni      = false
      if(name == 'name')     this.error.name     = false
      if(name == 'lastName') this.error.lastName = false
      // if(name == 'username') this.error.username = false
      // if(name == 'email')    this.error.email    = false
      if(name == 'password') this.error.password = false
      if(name == 'code')     this.error.code     = false
    },
  },
};
</script>
