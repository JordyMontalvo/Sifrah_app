<template>
  <App :session="session" :title="title">
    <h4>CIERRES</h4>

    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div class="scroll" v-if="!loading">
      <i class="icon fa-solid fa-briefcase"></i>
      <select class="input" v-model="selec_closed">
        <option disabled :value="null">Periodo de cálculo</option>
        <option v-for="closed in closeds" :value="closed">
          {{ new Date(closed.date).toLocaleString() }}
        </option>
      </select>
      <br />
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button class="button" @click="report">Reporte</button>
      <br />
      <br />

      <div v-if="node">
        <p>{{ node.dni }} - {{ node.name }}</p>
        <p>Fecha: {{ new Date(selec_closed.date).toLocaleString() }}</p>
        <p>Rango obtenido: {{ node.rank }}</p>
        <p>Puntaje personal: {{ node.points }}</p>
        <p>Puntaje grupal: {{ node._total }}</p>
        <p>
          Activación:
          <span v-if="node.activated">Full</span>
          <span v-else>Simple</span>
        </p>
        <br />
        <p>Residual:</p>
        <br />
        <table>
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Importe</th>
              <th>%</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in node.residual_bonus_arr">
              <td>{{ r.n + 1 }}</td>
              <td>{{ r.dni }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.val }}</td>
              <td>{{ r.r * r.rr * 100 }} %</td>
              <td>{{ r.val * r.r * r.rr }} USD</td>
            </tr>
          </tbody>
        </table>
        <br />
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      id: null,
      selec_closed: null,
      closeds: null,
      loading: true,
      node: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
      // return new Date(val).toLocaleString()
    },
  },
  async created() {
    // GET data
    const { data } = await api.Closeds.GET(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");
    if (data.error && data.msg == "unverified user")
      this.$router.push("/verify");

    // success
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);

    this.id = data.id;
    this.closeds = data.closeds;
  },

  methods: {
    report() {
      console.log("report");
      if (!this.selec_closed) return;

      console.log(this.id);
      this.node = this.selec_closed.tree.find((e) => e.id == this.id);

      this.node.residual_bonus_arr = this.ordered(this.node.residual_bonus_arr);
    },

    ordered(arr) {
      console.log({ arr });

      arr.sort((a, b) => (a.n > b.n ? 1 : b.n > a.n ? -1 : 0));

      return arr;
    },
  },
};
</script>
