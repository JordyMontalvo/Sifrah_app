<template>
  <App :session="session">

    <h4 class="tabs">
      <router-link class="tab" to="/transfer">
        Monedero
      </router-link> &nbsp;&nbsp;
      <router-link class="tab" to="/transfers">
        Transferencias
      </router-link>
    </h4>

    <i class="load" v-if="loading"></i> <br>

    <div class="scroll" v-if="!loading">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions">
            <td>{{ transaction.date | date }}</td>
            <td>{{ transaction.name }}</td>
            <td>{{ transaction.desc }}</td>
            <td>
              <span v-if="transaction.type == 'in'" class="in">+ {{ transaction.value.toFixed(2) }}</span>
              <span v-if="transaction.type == 'out'" class="out">- {{ transaction.value.toFixed(2) }}</span>
            </td>
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
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString()
    },
  },
  async created() {
    // GET data
    const { data } = await api.Transfers.GET(this.session); console.log({ data })

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
    this.$store.commit('SET_TREE', data.tree)

    this.transactions = data.transactions.reverse()
  },
};
</script>
