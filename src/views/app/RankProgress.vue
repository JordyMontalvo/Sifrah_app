<template>
  <App :session="session" :office_id="office_id" title="Rango">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else-if="progress" class="rank-progress-view">
      <header class="rp-hero">
        <div class="rp-hero-text">
          <h1 class="rp-title">
            <i class="fas fa-bullseye"></i>
            Progreso de Rango
          </h1>
          <p class="rp-subtitle">Consulta tu avance hacia el siguiente rango</p>
        </div>
      </header>

      <section class="rp-card rp-main-card">
        <div class="rp-main-header">
          <div class="rp-target-zone">
            <div class="rp-target-top">
              <div class="rp-target-icon" :class="{ 'rp-target-icon--pin': !!progress.targetRankImage }">
                <img
                  v-if="progress.targetRankImage"
                  :src="progress.targetRankImage"
                  :alt="progress.targetRankLabel"
                  class="rp-rank-pin"
                />
                <i v-else class="fas fa-arrow-up" aria-hidden="true"></i>
              </div>
              <div class="rp-target-titles">
                <span class="rp-target-label">PROGRESO HACIA</span>
                <h2 class="rp-target-rank">{{ progress.targetRankLabel }}</h2>
              </div>
            </div>
            <p class="rp-target-pill">
              Este cálculo corresponde al rango {{ progress.targetRankLabel }}
            </p>
          </div>

          <div class="rp-current-ranks-wrapper">
            <div class="rp-current-rank-box">
              <span class="rp-current-label">TIEMPO REAL</span>
              <div class="rp-current-rank">
                <img
                  v-if="progress.currentRankImage"
                  :src="progress.currentRankImage"
                  :alt="progress.currentRankLabel"
                  class="rp-medal-icon rp-rank-pin"
                />
                <i
                  v-else
                  class="fas fa-award rp-medal-icon"
                  :style="{ color: rankColor(progress.currentRankLabel) }"
                  aria-hidden="true"
                ></i>
                <div>
                  <strong>{{ progress.currentRankLabel }}</strong>
                  <span>Proyectado actual</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rp-stats-grid">
          <div class="rp-stat">
            <span class="rp-stat-label">Puntos válidos</span>
            <p class="rp-stat-value">
              <strong>{{ formatNum(progress.validPoints) }}</strong>
              / {{ formatNum(progress.thresholdPoints) }} pts
            </p>
            <span v-if="progress.pointsMissing > 0" class="rp-stat-hint warn">
              Te faltan {{ formatNum(progress.pointsMissing) }} pts
            </span>
            <span v-else class="rp-stat-hint ok">
              <i class="fas fa-check-circle"></i> Requisito cumplido
            </span>
          </div>

          <div class="rp-stat">
            <span class="rp-stat-label">Líneas activas</span>
            <p class="rp-stat-value">
              <strong>{{ progress.activeLines }}</strong>
              / {{ progress.minimumFrontals }} mínimo
            </p>
            <span v-if="progress.linesMet" class="rp-stat-hint ok">
              <i class="fas fa-check-circle"></i> Requisito cumplido
            </span>
            <span v-else class="rp-stat-hint warn">Aún no cumples el mínimo</span>
          </div>

          <div class="rp-stat">
            <span class="rp-stat-label">Reconsumo propio</span>
            <p class="rp-stat-value">
              <strong>{{ formatNum(progress.reconsumo) }}</strong>
              / {{ formatNum(progress.reconsumoRequired) }} pts
            </p>
            <span v-if="progress.reconsumoMet" class="rp-stat-hint ok">
              <i class="fas fa-check-circle"></i> Requisito cumplido
            </span>
            <span v-else class="rp-stat-hint warn">Aún no cumples el mínimo</span>
          </div>

          <div class="rp-stat">
            <span class="rp-stat-label">VPM (Máx. por pierna)</span>
            <p class="rp-stat-value">
              <strong>{{ formatNum(progress.vmp) }}</strong> pts
            </p>
            <span class="rp-stat-hint ok">
              <i class="fas fa-info-circle"></i> Para {{ progress.targetRankLabel }}
            </span>
          </div>
        </div>

        <div class="rp-progress-row">
          <div class="rp-progress-bar">
            <div
              class="rp-progress-fill"
              :style="{ width: progress.progressPercent + '%' }"
            ></div>
          </div>
          <span class="rp-progress-pct">{{ progress.progressPercent }}%</span>
        </div>
      </section>

      <div class="rp-bottom-grid">
        <section class="rp-card rp-table-card">
          <header class="rp-card-header">
            <i class="fas fa-users"></i>
            <h3>¿CÓMO SE ESTÁN CONTANDO MIS PUNTOS?</h3>
            <button
              type="button"
              class="rp-info-btn"
              title="VMP: máximo de puntos válidos por pierna según el rango objetivo"
            >
              <i class="fas fa-info-circle"></i>
            </button>
          </header>

          <div class="rp-table-wrap">
            <table class="rp-table">
              <thead>
                <tr>
                  <th>Pierna</th>
                  <th>Puntos generados</th>
                  <th>Puntos válidos</th>
                  <th>Aplicación personal</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!progress.legs.length">
                  <td colspan="5" class="rp-empty-legs">Sin piernas activas con puntos</td>
                </tr>
                <tr v-for="leg in progress.legs" :key="leg.letter">
                  <td>
                    <span class="rp-leg-badge">{{ leg.letter }}</span>
                  </td>
                  <td>
                    <template v-if="leg.personalAdded > 0">
                      {{ formatNum(leg.generated) }} pts
                      <span class="rp-personal-plus">
                        + {{ formatNum(leg.personalAdded) }} personal
                      </span>
                    </template>
                    <template v-else>{{ formatNum(leg.generated) }} pts</template>
                  </td>
                  <td><strong class="rp-valid-pts">{{ formatNum(leg.valid) }} pts</strong></td>
                  <td>
                    <span v-if="leg.personalAdded > 0" class="rp-status-text">
                      Incluye puntos personales
                    </span>
                    <span v-else class="rp-status-dash">—</span>
                  </td>
                  <td>
                    <span v-if="leg.statusType === 'vmp'" class="rp-status-badge vmp">
                      <i class="fas fa-star"></i> {{ leg.status }}
                    </span>
                    <span v-else class="rp-status-dash">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="rp-table-footer">
            <div class="rp-total-label">
              <i class="fas fa-coins"></i>
              <strong>TOTAL PUNTOS VÁLIDOS</strong>
            </div>
            <span class="rp-total-value">{{ formatNum(progress.validPoints) }} pts</span>
          </footer>
        </section>

        <section class="rp-card rp-requirements-card">
          <header class="rp-card-header">
            <i class="fas fa-clipboard-check"></i>
            <h3>ESTADO DE REQUISITOS</h3>
          </header>

          <ul class="rp-req-list">
            <li v-for="req in progress.requirements" :key="req.key" :class="{ met: req.met }">
              <i
                :class="req.met ? 'fas fa-check-circle ok' : 'fas fa-exclamation-circle warn'"
              ></i>
              <span class="rp-req-label">{{ req.label }}</span>
              <span class="rp-req-value" :class="req.met ? 'ok' : 'warn'">
                {{ req.display }}
              </span>
            </li>
          </ul>
        </section>
      </div>

      <footer class="rp-tip-banner">
        <i class="fas fa-info-circle"></i>
        <div class="rp-tip-content">
          <p class="rp-tip-text" style="margin: 0; font-size: 0.85rem; color: #555; line-height: 1.45;">
            <strong>Valor Máximo por Pierna (VPM):</strong> Es la cantidad máxima de puntos que se pueden validar de una sola línea de tu organización para calificar al rango objetivo. Los puntos que excedan este límite no se contabilizan para tu progreso, promoviendo un crecimiento equilibrado de tus líneas.
          </p>
          <p class="rp-tip-text" style="margin: 8px 0 0; font-size: 0.85rem; color: #555; line-height: 1.45; border-top: 1px dashed rgba(233, 30, 99, 0.15); padding-top: 8px;">
            <i class="fas fa-lightbulb" style="color: #e91e63; font-size: 0.9rem; margin-right: 4px; display: inline; vertical-align: middle;"></i>
            <span style="vertical-align: middle;">{{ progress.tip }}</span>
          </p>
        </div>
      </footer>
    </div>

    <div v-else class="rp-error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>No se pudo cargar tu progreso de rango.</p>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import Spinner from "@/components/Spinner.vue";
import api from "@/api";
import "@/assets/style/views/app/RankProgress.css";

export default {
  components: { App, Spinner },
  data() {
    return {
      loading: true,
      progress: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
  },
  async created() {
    await this.loadProgress();
  },
  methods: {
    formatNum(n) {
      return Number(n || 0).toLocaleString("es-PE");
    },
    rankColor(label) {
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
    async loadProgress() {
      try {
        const { data } = await api.RankProgress.GET(this.session);
        if (data.error && data.msg === "invalid session") {
          this.$router.push("/login");
          return;
        }
        if (!data.error) {
          this.progress = data.progress;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
