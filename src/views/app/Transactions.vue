<template>
  <App :session="session" :title="title">
    <h4>MOVIMIENTOS</h4>

    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="8"
      width="100%"
      height="32px"
      style="margin: 24px 0"
    />

    <div class="scroll" v-if="!loading">
      <table v-if="transactions.length" class="collects-table">
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
          <tr
            v-for="transaction in transactions"
            v-bind:style="[
              transaction.virtual == true ? { opacity: 0.5 } : { opacity: 1 },
            ]"
          >
            <td>{{ transaction.date | date }}</td>
            <td>{{ transaction.user_name }}</td>
            <td>{{ transaction.name | op }}</td>
            <td>
              <span v-if="transaction.type == 'in'" class="in"
                >+ {{ transaction.value.toFixed(2) }}</span
              >
              <span v-if="transaction.type == 'out'" class="out"
                >- {{ transaction.value.toFixed(2) }}</span
              >
            </td>
            <td>{{ transaction.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  components: {
    App,
    Spinner,
    SkeletonLoader,
  },
  data() {
    return {
      transactions: null,
      loading: true,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
  },
  async created() {
    // GET data
    const { data } = await api.transactions(this.session);
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
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);

    this.transactions = data.transactions.reverse();
  },
  filters: {
    date: (val) => {
      return new Date(val).toLocaleDateString();
    },
    op: (val) => {
      if (val == "standard-register") return "Bono Registro Emprendedor";
      if (val == "business-register") return "Bono Registro Ejecutivo";
      if (val == "business-vip-register") return "Bono Registro Empresarial";
      if (val == "collect") return "Retiro";
      if (val == "residual") return "Bono Residual";
      if (val == "objetive") return "Bono Logro";
      if (val == "points") return "Bono Compras";
      if (val == "affiliation") return "Afiliación con saldo";
      if (val == "activation") return "Compra con saldo";
      if (val == "affiliation bonus") return "Bono por afiliación";
      if (val == "migration bonus") return "Bono por migración";
      if (val == "wallet transfer") return "Monedero brillante";
      if (val == "remaining") return "Pago Ganancia";
      if (val == "closed bonus") return "Bono cierre";
      if (val == "activation bonnus promo") return "Bono compra promoción";
      if (val == "closed reset") return "Descuento por cierre";
    },
  },
};
</script>

<style scoped>
.collects-bg {
  min-height: 100vh;
  padding-bottom: 80px;
}
.scroll {
  overflow-x: auto;
  margin-top: 18px;
}
.collects-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  min-width: 900px;
  overflow: hidden;
}
.collects-table thead tr {
  background: #ff9800;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
  font-size: 17px;
  font-weight: 600;
}
.collects-table th,
.collects-table td {
  padding: 14px 12px;
  text-align: left;
  font-size: 15px;
  border-bottom: 1.5px solid #ffe0b2;
}
.collects-table tbody tr:nth-child(even) {
  background: #fff8e1;
}
.collects-table tbody tr:hover {
  background: #ffe0b2;
  transition: background 0.2s;
}
.in {
  color: #43a047;
  font-weight: 700;
  background: #e8f5e9;
  border-radius: 10px;
  padding: 4px 12px;
  font-size: 1.05em;
}
.out {
  color: #e53935;
  font-weight: 700;
  background: #ffebee;
  border-radius: 10px;
  padding: 4px 12px;
  font-size: 1.05em;
}
@media (max-width: 900px) {
  .collects-table {
    min-width: 700px;
  }
  .scroll {
    padding: 0 8px;
  }
}
</style>
