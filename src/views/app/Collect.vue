<template>
  <App :session="session">

    <h4 class="tabs">
      <router-link class="tab" to="/collect">
        Nuevo Retiro
      </router-link> &nbsp;&nbsp;
      <router-link class="tab" to="/collects">
        Historial de Retiros
      </router-link>
    </h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading"> <br>

      <label>
        <input type="radio" :value=false v-model="cash">
        <small>Retirar en efectivo</small>
      </label> <br>

      <label>
        <input type="radio" :value=true v-model="cash">
        <small>Retirar en cuenta bancaria</small>
      </label> <br>

      <!-- <label>
        <input type="radio">
        <small><router-link to="/transfer">Transferir saldo</router-link></small>
      </label> <br> -->

      <router-link to="/transfer">
        <label>
          <input type="radio">
          <small>Transferir saldo</small>
        </label> <br>
      </router-link>

      <i class="icon fas fa-university"></i>
      <select class="input" v-model="office" :class="{ 'error': error.office }" @change="reset('office')" disabled>
        <option value="null" disabled>Oficina</option>
        <option value="central">Central</option>
        <option value="secondary">Ledezma</option>
      </select> <br>


      <div v-if="cash">
        <i class="icon fas fa-university"></i>
        <input class="input" readonly placeholder="Banco" v-model="bank" :class="{ 'error': error.bank }"
          @keydown="reset('bank')"> <br>

        <i class="icon fas fa-university"></i>
        <input class="input" readonly placeholder="Banco" v-model="account_type" :class="{ 'error': error.bank }"
          @keydown="reset('bank')"> <br>

        <i class="icon fas fa-user-circle"></i>
        <input class="input" readonly placeholder="Número de cuenta" v-model="account" :class="{ 'error': error.account }"
          @keydown="reset('account')"> <br>

        <!-- <i class="icon far fa-user-circle"></i>
        <input class="input" readonly placeholder="Código interbancario"
        v-model="interbank_code"> <br> -->
      </div>

      <br>
      <small>Total disponible: S/. {{ balance }}</small> <br>

      <i class="icon fas fa-hand-holding-usd"></i>
      <input class="input" placeholder="Monto a retirar"
        oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')" v-model.number="amount"
        :class="{ 'error': error.amount }" @keydown="reset('amount')"> <br>

      <br>
      <textarea class="input" v-model="desc" placeholder="Descripción" maxlength="30"></textarea> <br>

      <p class="alert">{{ alert | alert }}</p>

      <small v-if="success" class="success">Retiro Enviado</small> <br>

      <button class="button" v-show="!sending" @click="POST">Solicitar retiro</button>
      <button class="button" v-show="sending" disabled>Guardando datos ...</button>
    </section>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'

export default {
  components: {
    App,
  },
  data() {
    return {
      cash: true,
      bank: null,
      account: null,
      account_type: null,
      // interbank_code: null,
      balance: null,
      amount: null,
      desc: null,
      office: 'central',

      error: {
        bank: false,
        account: false,
        amount: false,
        office: false,
      },

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
      if (msg == 'amount exceeds the balance') return 'Excede la cantidad disponible'
    },
  },
  async created() {
    // GET data
    const { data } = await api.Collect.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if (data.error && data.msg == 'invalid session') this.$router.push('/login')
    if (data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME', data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED', data.activated)
    this.$store.commit('SET__ACTIVATED', data._activated)
    this.$store.commit('SET_PLAN', data.plan)
    this.$store.commit('SET_COUNTRY', data.country)
    this.$store.commit('SET_PHOTO', data.photo)

    this.bank = data.bank
    this.account = data.account
    this.account_type = data.account_type
    // this.ibk     = data.ibk
    this.balance = data.balance.toFixed(2)
    // this.amount  = data.balance
  },
  methods: {
    async POST() {

      const { cash, bank, account, account_type, amount, desc, balance, office } = this

      // validate fields
      if (cash && !bank) { return this.error.bank = true }
      if (cash && !account) { return this.error.account = true }
      if (!office) { return this.error.office = true }
      if (!amount) { return this.error.amount = true }

      // validate amount
      if (amount > balance) { return this.alert = 'amount exceeds the balance' }


      // POST Collect
      this.sending = true

      const { data } = await api.Collect.POST(this.session, { cash, bank, account, account_type, amount, desc, office })
      console.log({ data })

      this.sending = false

      // error
      if (data.error) return this.alert = data.msg

      // success
      this.success = true

    },
    reset(name) {
      this.alert = null

      if (name == 'bank') this.error.bank = false
      if (name == 'account') this.error.account = false
      if (name == 'amount') this.error.amount = false
      if (name == 'office') this.error.office = false
    },
  },
};
</script>
