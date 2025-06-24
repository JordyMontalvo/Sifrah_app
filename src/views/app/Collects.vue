<template>
  <App :session="session">
    <h4 class="tabs">
      <router-link class="tab" to="/collect"> Nuevo Retiro </router-link>
      &nbsp;&nbsp;
      <router-link class="tab" to="/collects">
        Historial de Retiros
      </router-link>
    </h4>
    <div class="collects-bg">
      <i class="load" v-if="loading"></i>
      <div class="scroll collects-table-wrap" v-if="!loading">
        <table class="collects-table">
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
            <tr v-for="collect in collects" :key="collect._id">
              <td>{{ collect.date | date }}</td>
              <td>
                <div v-if="!collect.cash">En efectivo</div>
                <div v-else>
                  <span class="collects-bank">Banco: {{ collect.bank }}</span
                  ><br />
                  <span class="collects-account"
                    >Cuenta: {{ collect.account }}</span
                  ><br />
                  <span class="collects-cci">CCI: {{ collect.ink }}</span>
                </div>
              </td>
              <td class="collects-amount">S/. {{ collect.amount }}</td>
              <td>{{ collect.office }}</td>
              <td>
                <span :class="['status-badge', collect.status]">
                  {{ collect.status | status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

export default {
  components: {
    App,
  },
  data() {
    return {
      collects: null,
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
      // return new Date(val).toLocaleString()
    },
    status(val) {
      if (val == "pending") return "Pendiente";
      if (val == "approved") return "Entregado";
    },
  },
  async created() {
    // GET data
    const { data } = await api.Collects.GET(this.session);
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

    this.collects = data.collects.reverse();
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
  color: #ff9800;
  background: #fff3e0;
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
  background: #ff9800;
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
.collects-bank,
.collects-account,
.collects-cci {
  color: #ff9800;
  font-size: 0.98rem;
}
.collects-amount {
  font-weight: 700;
  color: #222;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  text-transform: capitalize;
  box-shadow: 0 1px 4px rgba(255, 152, 0, 0.07);
}
.status-badge.pending {
  background: #fff3e0;
  color: #ff9800;
}
.status-badge.approved {
  background: #c8e6c9;
  color: #388e3c;
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
