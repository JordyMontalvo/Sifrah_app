<template>
  <App :session="session" :title="title">

    <h4>MOVIMIENTOS</h4>

    <i class="load" v-if="loading"></i>

    <div class="scroll" v-if="!loading">
      <table v-if="transactions.length">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Persona</th>
            <th>Operación</th>
            <th>Monto</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" v-bind:style= "[ transaction.virtual == true ? {opacity: 0.5} : {opacity: 1}]">
            <td>{{ transaction.date | date }}</td>
            <td>{{ transaction.user_name }}</td>
            <td>{{ transaction.name | op }}</td>
            <td>
              <span v-if="transaction.type == 'in'"  class="in" >+ {{ transaction.value.toFixed(2) }}</span>
              <span v-if="transaction.type == 'out'" class="out">- {{ transaction.value.toFixed(2) }}</span>
            </td>
            <td>{{ transaction.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

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
      transactions: null,
      loading: true,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  async created() {
    // GET data
    const { data } = await api.transactions(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

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

    this.transactions = data.transactions.reverse()
  },
  filters: {
    date: (val) => {
      return new Date(val).toLocaleDateString()
    },
    op: (val) => {
      if(val == 'standard-register')     return 'Bono Registro Emprendedor'
      if(val == 'business-register')     return 'Bono Registro Ejecutivo'
      if(val == 'business-vip-register') return 'Bono Registro Empresarial'
      if(val == 'collect')               return 'Retiro'
      if(val == 'residual')              return 'Bono Residual'
      if(val == 'objetive')              return 'Bono Logro'
      if(val == 'points')                return 'Bono Compras'
      if(val == 'affiliation')           return 'Afiliación con saldo'
      if(val == 'activation')            return 'Compra con saldo'
      if(val == 'affiliation bonus')     return 'Bono por afiliación'
      if(val == 'migration bonus')       return 'Bono por migración'
      if(val == 'wallet transfer')       return 'Monedero brillante'
      if(val == 'remaining')             return 'Pago Ganancia'
      if(val == 'closed bonus')          return 'Bono cierre'
      if(val == 'activation bonnus promo') return 'Bono compra promoción'
      if(val == 'closed reset')            return 'Descuento por cierre'
    },
  },
};
</script>
