<template>
  <App :session="session">

    <h4 class="tabs">
      <router-link class="tab" to="/activation">
        Comprar
      </router-link> &nbsp;&nbsp;
      <router-link class="tab" to="/activations">
        Historial
      </router-link>
    </h4>

    <i class="load" v-if="loading"></i> <br>

    <!-- <table>
      <thead>
        <tr>
          <th>1</th>
          <th>2</th>
          <th>3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td :class="{'green': arr[0]}">250</td>
          <td :class="{'green': arr[1]}">450</td>
          <td :class="{'green': arr[2]}">650</td>
        </tr>
      </tbody>
    </table> -->

    <div class="scroll" v-if="!loading">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Productos</th>
            <th>Monto</th>
            <th>Puntos</th>
            <th>Voucher</th>
            <th>Estado</th>
            <th>Boleta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activation in activations">
            <td>{{ activation.date | date }}</td>
            <td>
              <div v-for="product in activation.products" v-if="product.total != 0">
                {{ product.name }} - {{ product.total }}
              </div>
            </td>
            <td>{{ activation.price | price }}</td>
            <td>{{ activation.points }}</td>
            <td>
              <a :href="activation.voucher" target="_blank">
                <img :src="activation.voucher" style="max-height: 80px; max-width: 80px">
              </a>
            </td>
            <td>{{ activation.status | status }}</td>
            <td><a :href="`${INVOICE_ROOT}?id=${activation.id}`" target="_blank" style="color: gray;"
                v-if="activation.status == 'approved'">boleta</a></td>
          </tr>
        </tbody>
      </table>
    </div>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT
console.log({ INVOICE_ROOT })

export default {
  components: {
    App,
  },
  data() {
    return {
      activations: null,
      // arr: [0,0,0],
      loading: true,
      INVOICE_ROOT,
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
    price(val) {
      return `S/. ${val}`
    },
    status(val) {
      if (val == 'pending') return 'Pendiente'
      if (val == 'approved') return 'Aprobada'
      if (val == 'rejected') return 'Rechazada'
    },
  },
  async created() {
    // GET data
    const { data } = await api.Activations.GET(this.session); console.log({ data })

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

    this.activations = data.activations.reverse()
    // this.arr         = data.arr

  },
};
</script>
