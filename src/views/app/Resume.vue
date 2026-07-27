<template>
  <App :session="session" :office_id="office_id" :title="title">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else class="personal-view">
      <div class="personal-row-layout">
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

        <div class="personal-stats">
          <article class="metric-card points-card">
            <div class="metric-card-header">
              <div class="metric-icon points-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <span class="metric-card-title">Puntos<br class="metric-title-br" />Personales</span>
            </div>
            <span class="metric-card-value points-value">{{ formattedPoints }}</span>
            <span
              class="points-status-pill"
              :class="periodActive ? 'is-active' : 'is-inactive'"
            >
              <i
                :class="periodActive ? 'fas fa-check-circle' : 'fas fa-times-circle'"
                aria-hidden="true"
              ></i>
              {{ periodActive ? "Activo" : "Inactivo" }}
            </span>
          </article>

          <article class="metric-card volume-card">
            <div class="metric-card-header">
              <div class="metric-icon volume-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                  />
                </svg>
              </div>
              <span class="metric-card-title">Volumen<br class="metric-title-br" />Global</span>
            </div>
            <span class="metric-card-value volume-value">{{ formattedVolume }}</span>
            <span class="metric-card-caption">Total de puntos en tu equipo</span>
          </article>

          <article class="metric-card team-card">
            <div class="metric-card-header">
              <div class="metric-icon team-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <span class="metric-card-title">Equipo<br class="metric-title-br" />Total</span>
            </div>
            <span class="metric-card-value team-value">{{ formattedTeam }}</span>
            <span class="metric-card-caption">Personas en tu equipo</span>
          </article>

          <article class="metric-card frontals-card">
            <div class="metric-card-header">
              <div class="metric-icon frontals-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                  />
                </svg>
              </div>
              <span class="metric-card-title">Frontales<br class="metric-title-br" />Totales</span>
            </div>
            <span class="metric-card-value frontals-value">{{ formattedFrontals }}</span>
            <span class="metric-card-caption">Directos en tu red</span>
          </article>

          <article class="metric-card frontals-active-card">
            <div class="metric-card-header">
              <div class="metric-icon frontals-active-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <span class="metric-card-title">Frontales<br class="metric-title-br" />Activos</span>
            </div>
            <span class="metric-card-value frontals-active-value">{{ formattedFrontalsActive }}</span>
            <span class="metric-card-caption">Con actividad este mes</span>
          </article>
        </div>
      </div>

      <div class="personal-second-row">
        <article class="info-panel max-rank-panel">
          <h3 class="info-panel-title">Rango Máximo Logrado</h3>
          <div class="max-rank-body">
            <div class="max-rank-text">
              <span class="max-rank-name">{{ historicalRankLabel }}</span>
              <span class="max-rank-date">{{ maxRankDateText }}</span>
            </div>
            <img
              v-if="hasMaxRankImage"
              :src="historicalRankImage"
              :alt="historicalRankLabel"
              class="max-rank-image"
            />
            <div v-else class="max-rank-fallback" aria-hidden="true">
              <i class="fas fa-trophy"></i>
            </div>
          </div>
        </article>

        <article class="info-panel next-points-panel">
          <h3 class="info-panel-title">Puntos necesarios para el siguiente rango</h3>
          <div class="next-rank-current">
            <i class="fas fa-gem" aria-hidden="true"></i>
            <span>Rango actual: <strong>{{ currentRankLabel }}</strong></span>
          </div>
          <span class="info-panel-value next-points-value">{{ formattedPointsMissing }}</span>
          <span class="info-panel-caption">{{ nextPointsCaption }}</span>
          <div class="next-progress-row">
            <div class="next-progress-bar">
              <div
                class="next-progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
            <span class="next-progress-pct">{{ progressPercent }}%</span>
          </div>
        </article>

        <article class="info-panel levels-panel">
          <h3 class="info-panel-title">Niveles Activos</h3>
          <div class="levels-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 8l10 5 10-5-10-5z" />
              <path d="M2 12.5l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span class="info-panel-value levels-value">{{ activeLevels }}</span>
          <span class="info-panel-caption">Niveles con actividad en tu red</span>
        </article>

        <article class="info-panel lines-chart-panel">
          <div class="lines-chart-header">
            <h3 class="info-panel-title">Distribución de puntos por línea (Top 5)</h3>
            <router-link to="/rango" class="lines-chart-link">Ver todas →</router-link>
          </div>
          <div v-if="lineBars.length" class="lines-chart">
            <div
              v-for="bar in lineBars"
              :key="bar.key"
              class="lines-chart-col"
            >
              <span class="lines-chart-value">{{ bar.formatted }}</span>
              <div class="lines-chart-track">
                <div
                  class="lines-chart-bar"
                  :style="{ height: bar.heightPct + '%', background: bar.color }"
                ></div>
              </div>
              <span class="lines-chart-label">{{ bar.label }}</span>
            </div>
          </div>
          <p v-else class="lines-chart-empty">Sin líneas con puntos este periodo</p>
        </article>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

const LINE_COLORS = [
  "#e91e63",
  "#7c4dff",
  "#2563eb",
  "#14b8a6",
  "#f57c00",
];
const OTHER_COLOR = "#c4c9d4";

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
      points: 0,
      totalPoints: 0,
      team: 0,
      frontalsTotal: 0,
      frontalsActive: 0,
      activated: false,
      periodActive: false,
      copied: false,
      historicalRankLabel: "Ninguno",
      historicalRankImage: null,
      historicalRankDate: null,
      historicalRankSubtitle: "",
      currentRankLabel: "—",
      targetRankLabel: "—",
      pointsMissing: 0,
      progressPercent: 0,
      activeLevels: 0,
      legs: [],
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
      const local = [this.name, this.lastName].filter(Boolean).join(" ");
      if (local) return local;
      const fromStore = [
        this.$store.state.name,
        this.$store.state.lastName,
      ]
        .filter(Boolean)
        .join(" ");
      return fromStore || "—";
    },
    formattedVolume() {
      return (Number(this.totalPoints) || 0).toLocaleString("es-PE");
    },
    formattedPoints() {
      return (Number(this.points) || 0).toLocaleString("es-PE");
    },
    formattedTeam() {
      return (Number(this.team) || 0).toLocaleString("es-PE");
    },
    formattedFrontals() {
      return (Number(this.frontalsTotal) || 0).toLocaleString("es-PE");
    },
    formattedFrontalsActive() {
      return (Number(this.frontalsActive) || 0).toLocaleString("es-PE");
    },
    hasMaxRankImage() {
      return !!(this.historicalRankImage && String(this.historicalRankImage).trim());
    },
    maxRankDateText() {
      if (this.historicalRankDate) return `Alcanzado el ${this.historicalRankDate}`;
      if (this.historicalRankSubtitle) return this.historicalRankSubtitle;
      return "Aún sin rango en historial";
    },
    formattedPointsMissing() {
      return (Number(this.pointsMissing) || 0).toLocaleString("es-PE");
    },
    nextPointsCaption() {
      if (!this.targetRankLabel || this.targetRankLabel === "—") {
        return "Puntos para el siguiente rango";
      }
      return `Puntos para ${this.targetRankLabel}`;
    },
    lineBars() {
      const legs = Array.isArray(this.legs) ? this.legs : [];
      const sorted = [...legs].sort(
        (a, b) => (Number(b.generated) || 0) - (Number(a.generated) || 0)
      );
      const top = sorted.slice(0, 5);
      const rest = sorted.slice(5);
      const othersTotal = rest.reduce(
        (sum, leg) => sum + (Number(leg.generated) || 0),
        0
      );

      const bars = top.map((leg, i) => ({
        key: `line-${i + 1}`,
        label: `Línea ${i + 1}`,
        value: Number(leg.generated) || 0,
        color: LINE_COLORS[i] || LINE_COLORS[0],
      }));

      if (othersTotal > 0 || rest.length > 0) {
        bars.push({
          key: "others",
          label: "Otras líneas",
          value: othersTotal,
          color: OTHER_COLOR,
        });
      }

      const max = Math.max(...bars.map((b) => b.value), 1);
      return bars.map((b) => ({
        ...b,
        formatted: b.value.toLocaleString("es-PE"),
        heightPct: Math.max(8, Math.round((b.value / max) * 100)),
      }));
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
      if (data.total_points != null) {
        this.$store.commit("SET_TOTAL_POINTS", data.total_points);
      }

      this.name = data.name || this.$store.state.name;
      this.lastName = data.lastName || this.$store.state.lastName;
      this.photo = data.photo || this.$store.state.photo;
      this.rank = data.rank;
      this.token = data.token || this.$store.state.token;
      this.affiliationDate = data.affiliationDate;
      this.points = Number(data.points) || 0;
      this.totalPoints = Number(data.total_points) || 0;
      this.team = Number(data.team) || 0;
      this.frontalsTotal = Number(data.frontals_total) || 0;
      this.frontalsActive = Number(data.frontals_active) || 0;
      this.activated = !!data.activated;
      this.periodActive =
        data.period_active != null
          ? !!data.period_active
          : (Number(data.points) || 0) >= 120;

      await this.loadSecondRow();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadSecondRow() {
      const [dashRes, progressRes] = await Promise.all([
        api.dashboard(this.session).catch((e) => {
          console.error(e);
          return null;
        }),
        api.RankProgress.GET(this.session).catch((e) => {
          console.error(e);
          return null;
        }),
      ]);

      const dash = dashRes && dashRes.data && !dashRes.data.error ? dashRes.data : null;
      if (dash) {
        this.historicalRankLabel = dash.historicalRankLabel || "Ninguno";
        this.historicalRankImage = dash.historicalRankImage
          ? String(dash.historicalRankImage).trim() || null
          : null;
        this.historicalRankDate = dash.historicalRankDate || null;
        this.historicalRankSubtitle = dash.historicalRankSubtitle || "";
      }

      const progress =
        progressRes &&
        progressRes.data &&
        !progressRes.data.error &&
        progressRes.data.progress
          ? progressRes.data.progress
          : null;

      if (progress) {
        this.currentRankLabel = progress.currentRankLabel || this.$options.filters._rank(this.rank);
        this.targetRankLabel = progress.targetRankLabel || "—";
        this.pointsMissing = Number(progress.pointsMissing) || 0;
        this.progressPercent = Number(progress.progressPercent) || 0;
        this.activeLevels = Number(progress.activeLevels) || 0;
        this.legs = Array.isArray(progress.legs) ? progress.legs : [];
        if (!dash && progress.historicRankLabel) {
          this.historicalRankLabel = progress.historicRankLabel;
        }
      } else {
        this.currentRankLabel = this.$options.filters._rank(this.rank);
      }
    },
    copyCode() {
      if (!this.token) return;
      const done = () => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(this.token)
          .then(done)
          .catch(() => {
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
