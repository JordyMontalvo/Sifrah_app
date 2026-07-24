<template>
  <App :session="session" :office_id="office_id" :title="title">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else class="personal-view">
      <article class="personal-card">
        <div class="personal-avatar-wrap">
          <img
            v-if="photo"
            :src="photo"
            :alt="fullName"
            class="personal-avatar"
          />
          <div v-else class="personal-avatar personal-avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <div class="personal-info">
          <h2 class="personal-name">{{ fullName }}</h2>

          <div class="personal-rank-badge">
            <span>Rango Actual: {{ rank | _rank }}</span>
            <i class="fas fa-gem" aria-hidden="true"></i>
          </div>

          <div class="personal-row">
            <span>Código: {{ token || "—" }}</span>
            <button
              v-if="token"
              type="button"
              class="personal-icon-btn"
              title="Copiar código"
              aria-label="Copiar código de patrocinio"
              @click="copyCode"
            >
              <i class="fas fa-copy" aria-hidden="true"></i>
            </button>
            <span v-if="copied" class="personal-copied">Copiado</span>
          </div>

          <div class="personal-row">
            <span>Afiliado desde: {{ affiliationDate | date }}</span>
            <i class="far fa-calendar-alt" aria-hidden="true"></i>
          </div>
        </div>
      </article>
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
      loading: true,
      photo: null,
      name: null,
      lastName: null,
      rank: null,
      token: null,
      affiliationDate: null,
      copied: false,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    title() {
      return "Personal";
    },
    fullName() {
      return [this.name, this.lastName].filter(Boolean).join(" ") || "—";
    },
  },
  filters: {
    date(val) {
      if (!val) return "—";
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "—";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    },
    _rank(val) {
      if (!val) return "Ninguno";
      const v = String(val).toLowerCase();
      let result = "";
      if (v === "none") result = "Ninguno";
      else if (v === "active" || v === "activo") result = "Activo";
      else if (v === "star" || v === "bronce") result = "Bronce";
      else if (v === "master") result = "Master";
      else if (v === "silver" || v === "plata") result = "Plata";
      else if (v === "si") result = "Platino";
      else if (v === "gold" || v === "oro") result = "Oro";
      else if (v === "sapphire" || v === "zafiro") result = "Zafiro";
      else if (v === "rubi" || v === "ruby" || v === "rubí") result = "Rubí";
      else if (v === "esmeralda" || v === "emerald") result = "Esmeralda";
      else if (v === "diamond" || v === "diamante") result = "Diamante";
      else if (v.includes("doble diamante")) result = "Doble diamante";
      else if (v.includes("triple diamante")) result = "Triple diamante";
      else if (v.includes("diamante estrella")) result = "Diamante estrella";
      else result = v;

      return result.charAt(0).toUpperCase() + result.slice(1);
    },
  },
  async created() {
    try {
      const { data } = await api.status(this.session);

      if (data.error && data.msg === "invalid session") {
        this.$router.push("/login");
        return;
      }
      if (data.error && data.msg === "unverified user") {
        this.$router.push("/verify");
        return;
      }

      this.$store.commit("SET_NAME", data.name);
      this.$store.commit("SET_LAST_NAME", data.lastName);
      this.$store.commit("SET_AFFILIATED", data.affiliated);
      this.$store.commit("SET_ACTIVATED", data.activated);
      this.$store.commit("SET_PLAN", data.plan);
      this.$store.commit("SET_COUNTRY", data.country);
      this.$store.commit("SET_PHOTO", data.photo);
      if (data.token) this.$store.commit("SET_TOKEN", data.token);

      this.name = data.name;
      this.lastName = data.lastName;
      this.photo = data.photo || this.$store.state.photo;
      this.rank = data.rank;
      this.token = data.token || this.$store.state.token;
      this.affiliationDate = data.affiliationDate;
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    copyCode() {
      if (!this.token) return;
      const done = () => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(this.token).then(done).catch(() => {
          this.fallbackCopy(this.token);
          done();
        });
        return;
      }
      this.fallbackCopy(this.token);
      done();
    },
    fallbackCopy(text) {
      const tempInput = document.createElement("input");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      tempInput.setSelectionRange(0, 99999);
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    },
  },
};
</script>

<style scoped src="../../assets/style/views/app/Resume.css"></style>
