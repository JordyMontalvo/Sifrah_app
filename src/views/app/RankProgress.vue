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
              <div class="rp-target-icon">
                <i class="fas fa-arrow-up"></i>
              </div>
              <div class="rp-target-titles">
                <span class="rp-target-label">PROGRESO HACIA</span>
                <h2 class="rp-target-rank">{{ progress.targetRankLabel }}</h2>
              </div>
            </div>
            <p class="rp-target-pill">
              Cálculo para rango {{ progress.targetRankLabel }}
            </p>
          </div>

          <div class="rp-current-rank-box">
            <span class="rp-current-label">RANGO EN TIEMPO REAL</span>
            <div class="rp-current-rank">
              <i class="fas fa-medal rp-medal-icon"></i>
              <div>
                <strong>{{ progress.currentRankLabel }}</strong>
                <span>Rango actual</span>
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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!progress.legs.length">
                <td colspan="4" class="rp-empty-legs">Sin piernas activas con puntos</td>
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
                  <span v-if="leg.statusType === 'vmp'" class="rp-status-badge vmp">
                    <i class="fas fa-star"></i> {{ leg.status }}
                  </span>
                  <span v-else-if="leg.statusType === 'personal'" class="rp-status-text">
                    {{ leg.status }}
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
              {{ req.met && req.key !== 'points' ? req.display : req.display }}
            </span>
          </li>
        </ul>
      </section>

      <footer class="rp-tip-banner">
        <i class="fas fa-lightbulb"></i>
        <p>{{ progress.tip }}</p>
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
