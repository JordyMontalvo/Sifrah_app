<template>
  <App :session="session" :title="title">
    <h4 class="tabs">
      <router-link class="tab" to="/transfer"> Monedero </router-link>
      &nbsp;&nbsp;
      <router-link class="tab" to="/transfers"> Transferencias </router-link>
    </h4>

    <Spinner v-if="loading" :size="40" :color="'#086eb6'" /> <br />

    <div class="scroll" v-if="!loading">
      <table class="collects-table">
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
              <span v-if="transaction.type == 'in'" class="in"
                >+ {{ transaction.value.toFixed(2) }}</span
              >
              <span v-if="transaction.type == 'out'" class="out"
                >- {{ transaction.value.toFixed(2) }}</span
              >
            </td>
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

export default {
  components: {
    App,
    Spinner,
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
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
    },
  },
  async created() {
    // GET data
    const { data } = await api.Transfers.GET(this.session);
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
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);

    this.transactions = data.transactions.reverse();
  },
};
</script>

<style scoped>
.collects-bg {
  min-height: 100vh;
  padding-bottom: 80px;
}
.tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}
.tab {
  display: flex;
  align-items: center;
  font-size: 1.18rem;
  font-weight: 600;
  color: #fff;
  background: #9F00AD;
  border-radius: 18px;
  padding: 10px 28px;
  margin: 0 6px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.07);
  transition: all 0.18s;
  text-decoration: none;
  position: relative;
}
.tab:hover,
.tab.router-link-exact-active {
  background: #d209b6;
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.13);
  transform: translateY(-2px) scale(1.04);
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
  background: #d209b6;
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
  border-bottom: 1.5px solid #d209b666;
}
.collects-table tbody tr:nth-child(even) {
  background: #d209b666;
}
.collects-table tbody tr:hover {
  background: #d209b666;
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
