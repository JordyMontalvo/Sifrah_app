<template>
  <App :session="session" title="Retiros">
    <div class="wd-page">
      <h1 class="wd-title">Retiros</h1>
      <nav class="wd-tabs" aria-label="Secciones de retiros">
        <router-link class="wd-tab" exact to="/collect">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 7.6 15.8 4.7v2.9"/>
            <path d="M4 7.6h13.3A2.3 2.3 0 0 1 19.6 9.9v2.3"/>
            <path d="M4 7.6v9.3A1.7 1.7 0 0 0 5.7 18.6h6.5"/>
            <path d="M15.3 12.2h4.3v3.5h-4.3a1.75 1.75 0 0 1 0-3.5Z"/>
            <path d="M13.2 18.6h7.3"/>
            <path d="M18.2 16.1 20.8 18.6 18.2 21.1"/>
          </svg>
          Nuevo retiro
        </router-link>
        <router-link class="wd-tab" exact to="/collects">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
            <path d="M12 8v4.2l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Historial de retiros
        </router-link>
      </nav>

      <div v-if="loading" class="wd-loading">
        <Spinner :size="40" :color="'#e91e63'" />
      </div>

      <div v-else-if="!collects.length" class="wd-empty">
        Aún no tienes retiros registrados.
      </div>

      <div v-else>
        <div class="wd-history">
          <article
            v-for="collect in collects"
            :key="collect._id || collect.id"
            class="wd-history-card"
          >
            <div class="wd-history-row">
              <strong>S/. {{ collect.amount }}</strong>
              <span :class="['status-badge', collect.status]">
                {{ collect.status | status }}
              </span>
            </div>
            <div class="wd-history-meta">
              <div class="wd-history-line">{{ collect | destination }}</div>
              <div class="wd-history-line">{{ collect.date | date }}</div>
              <p v-if="collect.desc" class="wd-history-desc">{{ collect.desc }}</p>
            </div>
          </article>
        </div>

        <div class="wd-table-wrap">
          <table class="wd-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Destino</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="collect in collects" :key="(collect._id || collect.id) + '-row'">
                <td>{{ collect.date | date }}</td>
                <td>{{ collect | destination }}</td>
                <td class="wd-table-desc">{{ collect.desc || "—" }}</td>
                <td>S/. {{ collect.amount }}</td>
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
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import lib from "@/lib";

function maskTail(value) {
  const raw = String(value || "").replace(/\s/g, "");
  if (raw.length < 4) return raw || "—";
  return `.... ${raw.slice(-4)}`;
}

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      collects: [],
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
      if (isNaN(parsedDate.getTime())) return "Fecha inválida";
      return parsedDate.toLocaleDateString();
    },
    status(val) {
      if (val == "pending") return "Pendiente";
      if (val == "approved") return "Entregado";
      return val || "—";
    },
    destination(collect) {
      if (!collect) return "—";
      if (collect.cash === false) return "En efectivo";
      const bank = collect.bank || "Cuenta";
      return `${bank} ${maskTail(collect.account)}`;
    },
  },
  async created() {
    const { data } = await api.Collects.GET(this.session);
    this.loading = false;
    if (data.error && data.msg == "invalid session") this.$router.push("/login");
    if (data.error && data.msg == "unverified user") this.$router.push("/verify");
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.collects = Array.isArray(data.collects) ? data.collects.slice().reverse() : [];
  },
};
</script>

<style src="@/assets/style/views/app/Collect.css"></style>
