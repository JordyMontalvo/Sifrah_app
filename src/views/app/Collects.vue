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

    <div class="scroll" v-if="!loading">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cuenta</th>
            <th>Monto</th>
            <th>Oficina</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="collect in collects">
            <td>{{ collect.date | date }}</td>
            <td>
              <div v-if="!collect.cash">
                En efectivo
              </div>
              <div v-else>
                Banco: {{ collect.bank }} <br>
                Cuenta: {{ collect.account }} <br>
                CCI: {{ collect.ink }}
              </div>
            </td>
            <td>{{ collect.amount }}</td>
            <td>{{ collect.office }}</td>
            <td>{{ collect.status | status }}</td>
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
      collects: null,
      loading: true,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString()
      // return new Date(val).toLocaleString()
    },
    status(val) {
      if (val == 'pending') return 'Pendiente'
      if (val == 'approved') return 'Entregado'
    },
  },
  async created() {
    // GET data
    const { data } = await api.Collects.GET(this.session); console.log({ data })

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

    this.collects = data.collects.reverse()

  },
};
</script>
