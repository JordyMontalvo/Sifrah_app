<template>
  <div class="office-embed-loading">
    <div class="office-embed-spinner"></div>
    <p class="office-embed-text">Abriendo cuenta del socio…</p>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "SudoLogin",
  async created() {
    const q = this.$route.query;
    const session = q.session ? String(q.session).trim() : "";
    const dni = q.dni ? String(q.dni).trim() : "";
    const path = q.path ? String(q.path).trim().replace(/^\//, "") : "dashboard";
    const office_id = q.office_id ? String(q.office_id).trim() : "central";

    if (!session || !dni) {
      this.$router.replace("/login");
      return;
    }

    await this.$store.dispatch("resetForOfficeEmbed", dni);

    this.$store.commit("SET_SESSION", session);
    this.$store.commit("SET_OFFICE_ID", { office_id, path });
    this.$store.commit("SET_DNI", dni);

    try {
      const { data } = await api.Afiliation.GET(session);
      if (data && !data.error) {
        this.applyUserToStore(data);
      }
    } catch (e) {
      console.warn("SudoLogin: perfil no cargado", e);
    }

    const dest = path === "dashboard" ? "/dashboard" : `/${path}`;
    this.$router.replace(dest);
  },
  methods: {
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
      if (userInfo.balance !== undefined) {
        this.$store.commit("SET_BALANCE", userInfo.balance);
      }
      if (userInfo._balance !== undefined) {
        this.$store.commit("SET__BALANCE", userInfo._balance);
      }
    },
  },
};
</script>

<style scoped>
.office-embed-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  gap: 16px;
}
.office-embed-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3e5f5;
  border-top-color: #e91e63;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.office-embed-text {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
