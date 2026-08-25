<template>
  <App :session="session" :title="title">
    <h4 class="tabs">
      <router-link class="tab" exact to="/collect">Nuevo Retiro</router-link>
      <router-link class="tab" to="/collects">Historial de Retiros</router-link>
    </h4>
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="8"
      width="100%"
      height="32px"
      style="margin: 24px 0"
    />
    <div class="collects-bg">
      <div class="scroll collects-table-wrap" v-if="!loading">
        <table class="collects-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta</th>
              <th>Descripción</th>
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
              <td>{{ collect.desc || '—' }}</td>
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
import Spinner from "@/components/Spinner.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";
import lib from "@/lib";

export default {
  components: {
    App,
    Spinner,
    SkeletonLoader,
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
      if (!val) return "";
      const parsedDate = lib.parseDate(val);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return parsedDate.toLocaleDateString();
      // return parsedDate.toLocaleString()
    },
    status(val) {
      if (val == "pending") return "Pendiente";
      if (val == "approved") return "Entregado";
    },
  },
  async created() {
    // GET data
    const { data } = await api.Collects.GET(this.session);

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
.collects-bank,
.collects-account,
.collects-cci {
  color: #08385c;
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
  background: #ffe0fa;
  color: #ff9800;
}
.status-badge.approved {
  background: #c8e6c9;
  color: #388e3c;
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
    box-sizing: border-box;
    transform: none !important;
    box-shadow: none;
  }
  .collects-table {
    min-width: 700px;
  }
  .scroll {
    padding: 0 8px;
  }
}
</style>
