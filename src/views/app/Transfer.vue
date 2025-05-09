<template>
  <App :session="session" :office_id="office_id" :title="title">

    <h4 class="tabs">
      <router-link class="tab" to="/transfer">
        Monedero
      </router-link> &nbsp;&nbsp;
      <router-link class="tab" to="/transfers" v-if="!office_id">
        Transferencias
      </router-link>
    </h4> <br>

    <h4>MONEDERO SIFRAH</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading"> <br>

      <div v-if="!confirmation">

        <small>Total disponible: S/. {{ balance }}</small> <br><br>

        <i class="icon fa fa-id-card"></i>
        <input class="input" v-model="dni" placeholder="Usuario receptor"
        oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
        @keydown="error = null"> <br>

        <i class="icon fas fa-hand-holding-usd"></i>
        <input class="input" v-model.number="amount" placeholder="Monto a enviar"
        oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')"
        @keydown="error = null"> <br>

        <span v-if="error" class="alert">{{ error }}<br></span><br>

        <textarea class="input" v-model="desc" placeholder="Motivo de transferencia" maxlength="30"></textarea> <br>

        <button class="button" v-show="!validating" @click="validate">Transferir</button>
        <button class="button" v-show= "validating" disabled>Transferir</button>

      </div>

      <div v-if="confirmation">

        <p>{{ _name }}</p>

        <img :src="_photo" style="height: 100px; width: 100px; border-radius: 50%;" > <br><br>

        <i class="icon fa-solid fa-key"></i>
        <input :type="show ? 'text' : 'password'" class="input pass" placeholder="Confirmar Password"
        v-model="password" @keydown="error2 = null">
        <i class="show far fa-eye" @click="show = !show"></i> <br>

        <span v-if="error2" class="alert">{{ error2 }}<br><br></span>

        <small>Monto a enviar: S/. {{ amount }}</small> <br>
        <span><i>{{ desc }}</i></span> <br><br>


        <div v-show="!end">
          <small @click="confirmation = false"><i class="fa fa-arrow-left"></i> Cancelar</small>&nbsp;

          <button class="button" v-show="!sending" @click="send">Confirmar</button>
          <button class="button" v-show= "sending" disabled>Confirmar</button>
        </div>

        <small class="success" v-show="end">transferencia exitosa</small>

      </div>

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
      loading: true,
      confirmation: false,
      validating: false,
      sending: false,

      dni: null,
      amount: null,
      desc: null,

      _name: null,
      _photo: null,
      password: null,

      error: null,
      error2: null,

      show: false,

      end: false,
    }
  },
  computed: {
    session()   { return this.$store.state.session   },
    office_id() { return this.$store.state.office_id },
  },
  async created() {
    // GET data
    const { data } = await api.Transfer.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')

    // success
    this.$store.commit('SET_NAME',       data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET__ACTIVATED',  data._activated)
    this.$store.commit('SET_ACTIVATED',  data.activated)
    this.$store.commit('SET_PLAN',       data.plan)
    this.$store.commit('SET_COUNTRY',    data.country)
    this.$store.commit('SET_PHOTO',      data.photo)
    this.$store.commit('SET_TREE',       data.tree)

    this.balance  = data.balance
  },
  methods: {
    async validate() {
      let { dni, amount, desc } = this
      console.log({ dni, amount, desc })

      if(!dni) return this.error = 'ingresar dni'
      if(!amount) return this.error = 'ingresar monto'

      if(amount > this.balance) return this.error = 'monto inválido'

      this.validating = true

      const { data } = await api.Transfer.POST(this.session, { dni, amount, desc, type: 'validate' }); console.log({ data })

      this.validating = false

      if(data.error) return this.error = 'usuario inválido'

      this.confirmation = true

      this._name = data._name
      this._photo = data._photo
    },

    async send() {
      let { dni, amount, desc, password } = this
      console.log({ password })

      if(!password) return this.error2 = 'ingresar password'

      this.sending = true

      const { data } = await api.Transfer.POST(this.session, { dni, amount, desc, password, type: 'send' }); console.log({ data })

      this.sending = false

      if(data.error) return this.error2 = 'password inválido'

      this.end = true
    },
  },
}
</script>
