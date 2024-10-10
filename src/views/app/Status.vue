<template>
  <App :session="session">

    <h4>MI ESTADO</h4>

    <i class="load" v-if="loading"></i>

    <div class="scroll" v-if="!loading">

      <table>
        <tbody>
          <tr>
            <td>ESTADO</td>
            <td>{{ status | status }}</td>
          </tr>
          <!-- <tr v-if="status == 'activated'">
            <td>ACTIVO HASTA</td>
            <td>{{ last_date | date }}</td>
          </tr> -->
          <tr>
            <td>FECHA DE INGRESO</td>
            <td>{{ date | date }}</td>
          </tr>
          <tr>
            <td>FECHA DE INSCRIPCIÓN</td>
            <td>{{ affiliationDate | date }}</td>
          </tr>
          <tr>
            <td>PAQUETE</td>
            <td>{{ plan | plan }}</td>
          </tr>
          <tr>
            <td>RANGO</td>
            <td>{{ rank | rank }}</td>
          </tr>
          <tr>
            <td>INACTIVOS</td>
            <td>{{ unactivateds }}</td>
          </tr>
          <tr>
            <td>ACTIVOS</td>
            <td>{{ activateds }}</td>
          </tr>
          <tr>
            <td>TOTAL</td>
            <td>{{ team }}</td>
          </tr>
        </tbody>
      </table> <br>
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
      status: null,
      date: null,
      affiliationDate: null,
      rank: null,
      team: null,
      activateds: null,
      unactivateds: null,

      loading: true,
    }
  },
  computed: {
    session() { return this.$store.state.session },
    last_date() {
      const date = new Date()
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      return lastDay.toLocaleDateString()
    }
  },
  async created() {
    // GET data
    const { data } = await api.status(this.session); console.log({ data })

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

    this.status = 'registered'
    if (data.affiliated) this.status = 'affiliated'
    if (data.activated) this.status = 'activated'

    this.date = data.date
    this.affiliationDate = data.affiliationDate
    this.plan = data.plan
    this.rank = data.rank
    this.team = data.team
    this.activateds = data.activateds
    this.unactivateds = data.unactivateds
  },
  filters: {
    status(val) {
      if (val == 'registered') return 'Registrado'
      if (val == 'affiliated') return 'Afiliado'
      if (val == 'activated') return 'Activado'
    },
    date(val) {
      if (!val) return ""
      return new Date(val).toLocaleDateString()
    },
    rank(val) {
      if (val == 'active') return 'Activo'
      if (val == 'coral') return 'Coral'
      if (val == 'quartz') return 'Cuarzo'
      if (val == 'sapphire') return 'Zafiro'
      if (val == 'ruby') return 'Rubī'
      if (val == 'emerald') return 'Esmeralda'
      if (val == 'diamond') return 'Diamante'
      if (val == 'crown-diamond') return 'Diamante Corona'
      if (val == 'imperial-diamond') return 'Diamante Imperial'
    },
    plan(val) {
      if (val == 'basic') return 'EMPRENDEDOR'
      if (val == 'standard') return 'EMPRENDEDOR'
      if (val == 'business') return 'EMPRESARIAL'
      if (val == 'business-vip') return 'EMPRESARIAL VIP'
    },
  },
};
</script>