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
              <span class="metric-card-title">Puntos <br class="metric-title-br" />Personales</span>
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
              <span class="metric-card-title">Volumen <br class="metric-title-br" />Global</span>
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
              <span class="metric-card-title">Equipo <br class="metric-title-br" />Total</span>
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
              <span class="metric-card-title">Frontales <br class="metric-title-br" />Totales</span>
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
              <span class="metric-card-title">Frontales <br class="metric-title-br" />Activos</span>
            </div>
            <span class="metric-card-value frontals-active-value">{{ formattedFrontalsActive }}</span>
            <span class="metric-card-caption">Con actividad este mes</span>
          </article>

          <!-- Solo móvil: al final del carrusel -->
          <article class="metric-card levels-metric depth-metric levels-metric-mobile">
            <div class="metric-card-header">
              <div class="metric-icon levels-icon--depth" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="metric-card-title">Profundidad</span>
            </div>
            <span class="metric-card-value depth-value">{{ totalDepthLevels }}</span>
            <span class="metric-card-caption">Niveles con personas en tu red</span>
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
            <div v-else-if="isNoneRank" class="max-rank-fallback" aria-hidden="true">
              <i class="fas fa-trophy"></i>
            </div>
            <div v-else class="max-rank-svg-container" aria-hidden="true">
              <svg viewBox="0 0 100 100" class="rank-trophy-svg">
                <defs>
                  <linearGradient id="goldTrophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FFF9C4" />
                    <stop offset="50%" stop-color="#FBC02D" />
                    <stop offset="100%" stop-color="#F57F17" />
                  </linearGradient>
                  <linearGradient id="silverTrophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FFFFFF" />
                    <stop offset="50%" stop-color="#B0BEC5" />
                    <stop offset="100%" stop-color="#37474F" />
                  </linearGradient>
                  <linearGradient id="bronzeTrophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FFE0B2" />
                    <stop offset="50%" stop-color="#A1887F" />
                    <stop offset="100%" stop-color="#4E342E" />
                  </linearGradient>
                  <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" :stop-color="gemGradients.start" />
                    <stop offset="100%" :stop-color="gemGradients.end" />
                  </linearGradient>
                </defs>
                <ellipse cx="50" cy="90" rx="30" ry="6" fill="#000" opacity="0.15" />
                <path d="M 30,80 L 70,80 L 65,90 L 35,90 Z" fill="#5D4037" />
                <rect x="35" y="72" width="30" height="8" rx="2" fill="#3E2723" />
                <rect x="42" y="74" width="16" height="4" rx="1" fill="#FFD700" opacity="0.8" />
                <path d="M 45,55 L 55,55 L 53,72 L 47,72 Z" :fill="'url(#' + trophyGradient + ')'" />
                <path d="M 30,28 C 15,28 15,48 32,50" fill="none" :stroke="'url(#' + trophyGradient + ')'" stroke-width="4" stroke-linecap="round" />
                <path d="M 70,28 C 85,28 85,48 68,50" fill="none" :stroke="'url(#' + trophyGradient + ')'" stroke-width="4" stroke-linecap="round" />
                <path d="M 30,22 L 70,22 Q 70,55 50,55 Q 30,55 30,22 Z" :fill="'url(#' + trophyGradient + ')'" />
                <ellipse cx="50" cy="22" rx="20" ry="4" fill="#F57F17" opacity="0.5" />
                <polygon points="50,28 60,35 56,47 44,47 40,35" fill="url(#gemGrad)" stroke="#FFF" stroke-width="1" />
              </svg>
            </div>
          </div>
        </article>

        <article class="info-panel rank-progress-panel">
          <div class="progress-card-header">
            <div class="target-icon-circle">
              <i class="fas fa-bullseye" aria-hidden="true"></i>
            </div>
            <h3 class="info-panel-title">Progreso de Rango</h3>
          </div>

          <div class="progress-main-grid">
            <div class="progress-columns-row">
              <div class="progress-col">
                <span class="progress-col-label">Rango en tiempo real</span>
                <div class="progress-col-value">
                  <img
                    v-if="currentRankImage"
                    :src="currentRankImage"
                    :alt="currentRankLabel"
                    class="progress-rank-pin"
                  />
                  <i
                    v-else
                    class="fas fa-award"
                    :style="{ color: getRankColor(currentRankLabel) }"
                    aria-hidden="true"
                  ></i>
                  <span :style="{ color: getRankColor(currentRankLabel) }">{{ currentRankLabel }}</span>
                </div>
              </div>
              <div class="progress-divider-vertical"></div>
              <div class="progress-col">
                <span class="progress-col-label">Progreso hacia</span>
                <div class="progress-col-value">
                  <img
                    v-if="targetRankImage"
                    :src="targetRankImage"
                    :alt="targetRankLabel"
                    class="progress-rank-pin"
                  />
                  <i
                    v-else
                    class="fas fa-award"
                    :style="{ color: getRankColor(targetRankLabel) }"
                    aria-hidden="true"
                  ></i>
                  <span :style="{ color: getRankColor(targetRankLabel) }">{{ targetRankLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="progress-points-box">
            <span class="points-box-label">PUNTOS VÁLIDOS</span>
            <div class="points-box-value">
              <strong class="points-current">{{ formatPointsValue(validPoints) }}</strong>
              <span class="points-separator">/</span>
              <span class="points-required">{{ formatPointsValue(thresholdPoints) }} pts</span>
            </div>
            <span class="points-box-missing">
              Te faltan <strong class="missing-highlight">{{ formatPointsValue(pointsMissing) }} pts</strong>
            </span>
          </div>

          <div class="progress-bar-row">
            <div class="progress-bar-track">
              <div
                class="progress-bar-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
            <span class="progress-bar-pct">{{ progressPercent }}%</span>
          </div>
        </article>

        <article class="metric-card levels-metric depth-metric levels-metric-desktop">
          <div class="metric-card-header">
            <div class="metric-icon levels-icon--depth" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="metric-card-title">Profundidad</span>
          </div>
          <span class="metric-card-value depth-value">{{ totalDepthLevels }}</span>
          <span class="metric-card-caption">Niveles con personas en tu red</span>
      </div>

      <div class="personal-third-row">
        <article class="info-panel growth-chart-panel">
          <div class="growth-chart-header">
            <div class="growth-header-left">
              <div class="chart-icon-circle">
                <i class="fas fa-chart-line" aria-hidden="true"></i>
              </div>
              <h3 class="info-panel-title">Evolución de la Organización</h3>
            </div>
            <div class="growth-header-right" tabindex="0">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
              <span class="growth-info-tooltip" role="tooltip">
                Visualiza la evolución del crecimiento de tu organización durante los últimos seis meses.
                Este gráfico muestra cómo ha variado la cantidad total de personas en tu equipo en cada cierre mensual,
                permitiéndote identificar tendencias de crecimiento y medir el desarrollo de tu red a lo largo del tiempo.
              </span>
            </div>
          </div>

          <div class="growth-chart-container">
            <svg
              :viewBox="chartPoints.viewBox"
              class="growth-svg-chart"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#e91e63" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#e91e63" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g class="chart-grid">
                <line
                  v-for="line in chartPoints.gridLines"
                  :key="'grid-' + line.y"
                  :x1="chartPoints.plot.left"
                  :y1="line.y"
                  :x2="chartPoints.plot.right"
                  :y2="line.y"
                  stroke="#eef2f7"
                  stroke-width="1"
                />
              </g>

              <g class="chart-y-axis">
                <text
                  v-for="line in chartPoints.gridLines"
                  :key="'lbl-' + line.y"
                  :x="chartPoints.plot.left - 6"
                  :y="line.y + 3.5"
                  text-anchor="end"
                  class="chart-axis-label"
                >
                  {{ line.value }}
                </text>
              </g>

              <path :d="chartPoints.areaPath" fill="url(#chartAreaGradient)" />
              <path
                :d="chartPoints.linePath"
                fill="none"
                stroke="#e91e63"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />

              <g class="chart-dots">
                <g v-for="p in chartPoints.points" :key="'dot-' + p.x">
                  <circle
                    :cx="p.x"
                    :cy="p.y"
                    :r="p.value > 0 ? 5 : 3.5"
                    fill="#ffffff"
                    stroke="#e91e63"
                    :stroke-width="p.value > 0 ? 2.5 : 1.75"
                    vector-effect="non-scaling-stroke"
                  />
                  <text
                    v-if="p.value > 0"
                    :x="p.x"
                    :y="p.labelY"
                    text-anchor="middle"
                    class="chart-point-value"
                  >
                    {{ p.displayValue }}
                  </text>
                </g>
              </g>

              <g class="chart-x-axis">
                <text
                  v-for="p in chartPoints.points"
                  :key="'x-lbl-' + p.x"
                  :x="p.x"
                  :y="chartPoints.plot.bottom + chartPoints.monthLabelOffset"
                  text-anchor="middle"
                  class="chart-month-label"
                >
                  {{ p.shortLabel || p.label }}
                </text>
              </g>
            </svg>
          </div>
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
      currentRankImage: null,
      targetRankLabel: "—",
      targetRankImage: null,
      pointsMissing: 0,
      progressPercent: 0,
      legs: [],
      validPoints: 0,
      thresholdPoints: 0,
      totalDepthLevels: 0,
      growthHistory: [],
      isMobileViewport: false,
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
    historicalRankCode() {
      const label = String(this.historicalRankLabel || "").toLowerCase();
      if (label.includes("activo")) return "active";
      if (label.includes("bronce")) return "star";
      if (label.includes("plata")) return "silver";
      if (label.includes("oro")) return "gold";
      if (label.includes("platino")) return "platino";
      if (label.includes("zafiro")) return "sapphire";
      if (label.includes("ruby") || label.includes("rubí") || label.includes("rubi")) return "ruby";
      if (label.includes("esmeralda")) return "emerald";
      if (label.includes("diamante")) return "diamond";
      if (label.includes("ninguno")) return "none";
      return label;
    },
    isNoneRank() {
      const code = this.historicalRankCode;
      return !code || code === "none" || code === "ninguno";
    },
    gemGradients() {
      const r = this.historicalRankCode;
      if (r === "active") return { start: "#a5d6a7", end: "#2e7d32" };
      if (r === "star") return { start: "#ffcc80", end: "#d84315" };
      if (r === "silver") return { start: "#cfd8dc", end: "#37474f" };
      if (r === "gold") return { start: "#fff59d", end: "#f57f17" };
      if (r === "platino") return { start: "#e5e4e2", end: "#90a4ae" };
      if (r === "sapphire") return { start: "#90caf9", end: "#0d47a1" };
      if (r === "ruby") return { start: "#f8bbd0", end: "#c2185b" };
      if (r === "emerald") return { start: "#b9f6ca", end: "#00c853" };
      if (r === "diamond" || r.includes("diamante")) return { start: "#e0f7fa", end: "#0097a7" };
      return { start: "#e0e0e0", end: "#9e9e9e" };
    },
    trophyGradient() {
      const r = this.historicalRankCode;
      if (r === "star") return "bronzeTrophyGrad";
      if (r === "silver") return "silverTrophyGrad";
      return "goldTrophyGrad";
    },
    maxRankDateText() {
      if (this.historicalRankDate) return `Alcanzado el ${this.historicalRankDate}`;
      if (this.historicalRankSubtitle) return this.historicalRankSubtitle;
      return "Aún sin rango en historial";
    },
    pointsByLineBars() {
      const legs = Array.isArray(this.legs) ? [...this.legs] : [];
      legs.sort((a, b) => (Number(b.generated) || 0) - (Number(a.generated) || 0));

      const top5 = legs.slice(0, 5);
      const rest = legs.slice(5);
      const bars = top5.map((leg, index) => {
        const value = Math.round(Number(leg.generated) || 0);
        return {
          label: `Línea ${index + 1}`,
          value,
          displayValue: value.toLocaleString("es-PE"),
          color: LINE_COLORS[index] || OTHER_COLOR,
        };
      });

      if (rest.length > 0) {
        const otherValue = Math.round(
          rest.reduce((sum, leg) => sum + (Number(leg.generated) || 0), 0)
        );
        bars.push({
          label: "Otras líneas",
          value: otherValue,
          displayValue: otherValue.toLocaleString("es-PE"),
          color: OTHER_COLOR,
        });
      }

      const maxVal = Math.max(...bars.map((b) => b.value), 1);
      return bars.map((b) => ({
        ...b,
        heightPct: Math.max(8, Math.round((b.value / maxVal) * 100)),
      }));
    },
    chartPoints() {
      const history = Array.isArray(this.growthHistory) && this.growthHistory.length === 6
        ? this.growthHistory
        : [
            { label: "Dic 2024", value: 0 },
            { label: "Ene 2025", value: 0 },
            { label: "Feb 2025", value: 0 },
            { label: "Mar 2025", value: 0 },
            { label: "Abr 2025", value: 0 },
            { label: "May 2025", value: 0 }
          ];

      const values = history.map((h) => Number(h.value) || 0);
      const maxVal = Math.max(...values, 10);

      let yAxisMax = 100;
      if (maxVal > 100) {
        yAxisMax = Math.ceil(maxVal / 100) * 100;
      } else if (maxVal > 10) {
        yAxisMax = Math.ceil(maxVal / 10) * 10;
      }

      // Desktop: proporción cómoda (~2.6:1). Móvil: más alto.
      const mobile = this.isMobileViewport;
      const viewBox = mobile ? "0 0 360 220" : "0 0 520 200";
      const plot = mobile
        ? { left: 30, right: 346, top: 30, bottom: 172 }
        : { left: 42, right: 492, top: 32, bottom: 158 };
      plot.width = plot.right - plot.left;
      plot.height = plot.bottom - plot.top;
      const monthLabelOffset = mobile ? 22 : 20;
      const valueLabelGap = mobile ? 14 : 12;
      const minLabelY = mobile ? 16 : 14;
      // Aire extra en extremos para que no se corten puntos/meses
      const edgeInset = mobile ? 4 : 10;

      const monthShort = (label) => {
        const s = String(label || "");
        const m = s.match(/^([A-Za-záéíóúÁÉÍÓÚ]{3})/);
        return m ? m[1] : s;
      };

      const usableWidth = Math.max(plot.width - edgeInset * 2, 1);
      const stepX = usableWidth / Math.max(history.length - 1, 1);
      const points = history.map((item, index) => {
        const value = Number(item.value) || 0;
        const x = plot.left + edgeInset + index * stepX;
        const y = plot.bottom - (value / yAxisMax) * plot.height;
        const labelY = Math.max(minLabelY, y - valueLabelGap);
        return {
          x,
          y,
          labelY,
          label: item.label,
          shortLabel: monthShort(item.label),
          value,
          displayValue: value.toLocaleString("es-PE"),
        };
      });

      const linePath = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");

      const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${plot.bottom} L ${points[0].x.toFixed(2)} ${plot.bottom} Z`;

      // Solo 3 líneas de eje para menos ruido visual
      const gridLines = [0, 0.5, 1].map((pct) => ({
        y: plot.bottom - pct * plot.height,
        value: Math.round(pct * yAxisMax).toLocaleString("es-PE"),
      }));

      return {
        points,
        linePath,
        areaPath,
        gridLines,
        yAxisMax,
        plot,
        viewBox,
        monthLabelOffset,
      };
    },
  },
  mounted() {
    this.updateGrowthViewport();
    window.addEventListener("resize", this.updateGrowthViewport);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateGrowthViewport);
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
    updateGrowthViewport() {
      this.isMobileViewport = window.innerWidth <= 767;
    },
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
        this.growthHistory = dash.growthHistory || [];
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
        this.currentRankImage = progress.currentRankImage
          ? String(progress.currentRankImage).trim() || null
          : null;
        this.targetRankLabel = progress.targetRankLabel || "—";
        this.targetRankImage = progress.targetRankImage
          ? String(progress.targetRankImage).trim() || null
          : null;
        this.pointsMissing = Number(progress.pointsMissing) || 0;
        this.progressPercent = Number(progress.progressPercent) || 0;
        this.legs = Array.isArray(progress.legs) ? progress.legs : [];
        this.validPoints = Number(progress.validPoints) || 0;
        this.thresholdPoints = Number(progress.thresholdPoints) || 0;
        this.totalDepthLevels = Number(progress.totalDepthLevels) || 0;
        if (!dash && progress.historicRankLabel) {
          this.historicalRankLabel = progress.historicRankLabel;
        }
      } else {
        this.currentRankLabel = this.$options.filters._rank(this.rank);
        this.currentRankImage = null;
        this.targetRankImage = null;
      }
    },
    getRankColor(label) {
      const l = String(label || "").toLowerCase();
      if (l.includes("activo")) return "#4CAF50";
      if (l.includes("bronce")) return "#CD7F32";
      if (l.includes("plata")) return "#90A4AE";
      if (l.includes("oro")) return "#FFD700";
      if (l.includes("platino")) return "#cfd8dc";
      if (l.includes("zafiro")) return "#0d47a1";
      if (l.includes("ruby") || l.includes("rubí") || l.includes("rubi")) return "#d81b60";
      if (l.includes("esmeralda")) return "#00c853";
      if (l.includes("diamante")) return "#0097a7";
      return "#e91e63";
    },
    formatPointsValue(val) {
      return (Number(val) || 0).toLocaleString("es-PE");
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
