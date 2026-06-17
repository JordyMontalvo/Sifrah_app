<template>
  <div class="office-embed-page">
    <div v-if="error" class="office-embed-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>
    <div v-else class="office-embed-loading">
      <div class="office-embed-spinner"></div>
      <p>{{ sending ? "Abriendo sesión del socio…" : "Conectando…" }}</p>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "OfficeEmbed",
  data() {
    return {
      sending: false,
      error: null,
    };
  },
  async created() {
    const q = this.$route.query || {};
    const dni = q.dni ? String(q.dni).trim() : "";
    const path = q.path ? String(q.path).trim().replace(/^\//, "") : "dashboard";
    const office_id = q.office_id ? String(q.office_id).trim() : "central";

    if (!dni) {
      this.error = "Falta el DNI del socio.";
      return;
    }

    await this.$store.dispatch("resetForOfficeEmbed", dni);
    await this.openSession(dni, office_id, path);
  },
  watch: {
    async "$route.query.dni"(nextDni) {
      const dni = nextDni ? String(nextDni).trim() : "";
      if (!dni) return;
      const path = this.$route.query.path
        ? String(this.$route.query.path).trim().replace(/^\//, "")
        : "dashboard";
      const office_id = this.$route.query.office_id
        ? String(this.$route.query.office_id).trim()
        : "central";
      this.error = null;
      await this.$store.dispatch("resetForOfficeEmbed", dni);
      await this.openSession(dni, office_id, path);
    },
  },
  methods: {
    getOfficePasswordCandidates() {
      const fromEnv = process.env.VUE_APP_OFFICE_PASSWORD;
      return [...new Set([fromEnv, "8QfghvCxuzxrbvii4w", "2374", "098"].filter(Boolean))];
    },
    applyUserToStore(userInfo) {
      if (!userInfo) return;
      if (userInfo.name) this.$store.commit("SET_NAME", userInfo.name);
      if (userInfo.lastName) this.$store.commit("SET_LAST_NAME", userInfo.lastName);
      if (userInfo.email) this.$store.commit("SET_EMAIL", userInfo.email);
      if (userInfo.photo) this.$store.commit("SET_PHOTO", userInfo.photo);
      if (userInfo.plan) this.$store.commit("SET_PLAN", userInfo.plan);
      if (userInfo.dni) this.$store.commit("SET_DNI", userInfo.dni);
      if (userInfo.total_points !== undefined) {
        this.$store.commit("SET_TOTAL_POINTS", userInfo.total_points);
      }
      if (userInfo.affiliated !== undefined && userInfo.affiliated !== null) {
        this.$store.commit("SET_AFFILIATED", userInfo.affiliated);
      }
      if (userInfo.tree !== undefined) this.$store.commit("SET_TREE", userInfo.tree);
      if (userInfo.activated !== undefined) {
        this.$store.commit("SET_ACTIVATED", userInfo.activated);
      }
      if (userInfo._activated !== undefined) {
        this.$store.commit("SET__ACTIVATED", userInfo._activated);
      }
      if (userInfo.country) this.$store.commit("SET_COUNTRY", userInfo.country);
    },
    formatLoginError(msg) {
      if (msg === "dni not found") return "El documento no existe";
      if (msg === "invalid password") return "Clave de oficina incorrecta en el servidor";
      return msg || "No se pudo abrir la sesión";
    },
    async openSession(dni, office_id, path) {
      this.sending = true;
      this.error = null;

      try {
        const passwords = this.getOfficePasswordCandidates();
        let data = null;
        let lastError = null;

        for (const password of passwords) {
          const response = await api.login({ dni, password, office_id });
          data = response.data;
          if (!data.error) break;
          lastError = data;
        }

        if (!data || data.error) {
          this.error = this.formatLoginError(
            (data && (data.msg || data.error)) || (lastError && lastError.msg)
          );
          return;
        }

        this.$store.commit("SET_SESSION", data.session);
        this.$store.commit("SET_OFFICE_ID", { office_id, path });
        this.applyUserToStore(data);

        if (data.affiliated === undefined || data.affiliated === null) {
          try {
            const userData = await api.Afiliation.GET(data.session);
            if (userData.data && !userData.data.error) {
              this.applyUserToStore(userData.data);
            }
          } catch (e) {
            console.warn("OfficeEmbed: perfil no cargado", e);
          }
        }

        const dest = !path || path === "dashboard" ? "/dashboard" : `/${path}`;
        this.$router.replace(dest);
      } catch (e) {
        console.error("OfficeEmbed:", e);
        this.error = "Error de conexión con el servidor. Intenta de nuevo.";
      } finally {
        this.sending = false;
      }
    },
  },
};
</script>

<style scoped>
.office-embed-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdfafc;
  padding: 24px;
}
.office-embed-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}
.office-embed-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #f3e5f5;
  border-top-color: #e91e63;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.office-embed-error {
  text-align: center;
  color: #c0392b;
  max-width: 360px;
}
.office-embed-error i {
  font-size: 2rem;
  margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
