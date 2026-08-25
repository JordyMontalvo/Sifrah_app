<template>
  <App :session="session" :title="title">
    <h4 class="tabs">
      <router-link class="tab" exact to="/transfer">Monedero</router-link>
      <router-link class="tab" to="/transfers">Transferencias</router-link>
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
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;
}
.tabs .tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  height: 44px;
  padding: 0 20px;
  margin: 0 6px;
  box-sizing: border-box;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: #e91e63;
  background: #fce4ec;
  border: none;
  border-radius: 18px;
  text-decoration: none;
  box-shadow: none;
  transform: none !important;
  transition: background-color 0.18s, color 0.18s;
}
.tabs .tab:hover,
.tabs .tab:focus,
.tabs .tab.router-link-active,
.tabs .tab.router-link-exact-active {
  background: #e91e63;
  color: #fff;
  box-shadow: none;
  transform: none !important;
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
  background: #e91e63;
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
  border-bottom: 1.5px solid #e91e6366;
}
.collects-table tbody tr:nth-child(even) {
  background: #e91e6366;
}
.collects-table tbody tr:hover {
  background: #e91e6366;
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
  .tabs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 0 0 14px;
    padding: 0;
  }
  .tabs .tab,
  .tabs .tab:hover,
  .tabs .tab.router-link-active,
  .tabs .tab.router-link-exact-active {
    width: 100%;
    margin: 0;
    height: 44px;
    min-height: 44px;
    padding: 0 16px;
    font-size: 0.95rem;
    border-radius: 14px;
    transform: none !important;
    box-shadow: none;
  }
  .collects-table {
    min-width: 700px;
  }
  .scroll {
    padding: 0 8px 28px;
  }
}
</style>
