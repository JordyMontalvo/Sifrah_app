<template>
  <App :session="session" :office_id="office_id" title="Cierre de Mes">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else class="cm-page">
      <!-- Bloque 1: Cabecera -->
      <header class="cm-hero">
        <div class="cm-hero-left">
          <button type="button" class="cm-back" @click="$router.back()" aria-label="Volver">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 class="cm-title">Cierre de Mes</h1>
            <p class="cm-subtitle">Resumen detallado de tus ganancias</p>
          </div>
        </div>
        <div class="cm-hero-actions">
          <label class="cm-period-select">
            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
            <select v-model="selectedPeriodKey" :disabled="!periods.length" @change="onPeriodChange">
              <option v-if="!periods.length" value="">Sin periodos cerrados</option>
              <option v-for="p in periods" :key="p.period_key" :value="p.period_key">
                {{ p.period_label }}
              </option>
            </select>
          </label>
          <button
            type="button"
            class="cm-btn cm-btn-primary"
            :disabled="!report"
            @click="downloadPdf"
          >
            <i class="fas fa-download"></i>
            Descargar PDF
          </button>
        </div>
      </header>

      <div v-if="!report" class="cm-empty">
        <i class="fas fa-inbox"></i>
        <p>Aún no hay un cierre de mes con tu participación.</p>
        <p v-if="loadError" class="cm-empty-hint">{{ loadError }}</p>
        <p class="cm-empty-hint">
          Solo aparecen periodos en los que figuraste en el cierre (rango distinto de none)
          o con comisiones de residual / afiliación registradas.
        </p>
      </div>

      <template v-else>
        <!-- Bloque 2: Socio + cierre -->
        <section class="cm-card cm-profile">
          <div class="cm-profile-who">
            <div class="cm-avatar" aria-hidden="true">
              <img v-if="photo" :src="photo" alt="" />
              <span v-else>{{ initials }}</span>
            </div>
            <div class="cm-profile-text">
              <h2 class="cm-name">{{ fullName }}</h2>
              <p class="cm-meta">
                <span v-if="dni">DNI: {{ dni }}</span>
                <span v-if="dni && token"> · </span>
                <span v-if="token">Código: {{ token }}</span>
              </p>
              <span v-if="report.rank" class="cm-rank-pill">
                Rango: {{ formatRank(report.rank) }}
              </span>
            </div>
          </div>

          <div class="cm-profile-stat cm-profile-stat--period">
            <i class="fas fa-calendar" aria-hidden="true"></i>
            <div>
              <span class="cm-stat-label">Periodo</span>
              <strong>{{ formatRange(report.period_start, report.period_end) }}</strong>
            </div>
          </div>

          <div class="cm-profile-stat">
            <i class="fas fa-clock" aria-hidden="true"></i>
            <div>
              <span class="cm-stat-label">Fecha de cierre</span>
              <strong>{{ formatDateTime(report.closed_at) }}</strong>
            </div>
          </div>

          <div class="cm-profile-stat">
            <i class="fas fa-users" aria-hidden="true"></i>
            <div>
              <span class="cm-stat-label">Personas activas</span>
              <strong>{{ report.org.active_people }}</strong>
            </div>
          </div>
        </section>

        <!-- Bloque 3: Total -->
        <section class="cm-card cm-total">
          <div class="cm-total-main">
            <span class="cm-total-label">Total generado en el periodo</span>
            <p class="cm-total-amount">S/ {{ money(report.totals.total) }}</p>
            <p
              v-if="report.totals.growth_percent != null"
              class="cm-growth"
              :class="{
                neg: report.totals.growth_percent < 0,
                flat: report.totals.growth_percent === 0,
              }"
            >
              <span class="cm-growth-icon" aria-hidden="true">
                <template v-if="report.totals.growth_percent > 0">↑</template>
                <template v-else-if="report.totals.growth_percent < 0">↓</template>
                <template v-else>=</template>
              </span>
              <template v-if="report.totals.growth_percent === 0">
                Igual que el periodo anterior
              </template>
              <template v-else>
                {{ Math.abs(report.totals.growth_percent) }}%
                {{ report.totals.growth_percent > 0 ? "más" : "menos" }}
                que el periodo anterior
              </template>
              <span v-if="report.totals.prev_total != null" class="cm-growth-prev">
                (S/ {{ money(report.totals.prev_total) }})
              </span>
            </p>
          </div>
          <div class="cm-donut-wrap">
            <div
              class="cm-donut"
              :style="{ background: donutGradient }"
              role="img"
              :aria-label="'Desglose de ganancias'"
            >
              <div class="cm-donut-hole"></div>
            </div>
          </div>
          <ul class="cm-legend">
            <li v-for="b in report.breakdown" :key="b.key">
              <span class="cm-leg-dot" :style="{ background: b.color }"></span>
              <span class="cm-leg-label">{{ b.label }}</span>
              <span class="cm-leg-amt">S/ {{ money(b.amount) }}</span>
              <span class="cm-leg-pct">{{ b.percent }}%</span>
            </li>
          </ul>
        </section>

        <!-- Bloque 4: Volumen -->
        <section class="cm-vol-grid">
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#fce4ec;color:#e91e63"><i class="fas fa-chart-line"></i></div>
            <span class="cm-vol-label">Volumen generado</span>
            <strong>{{ fmtInt(report.volume.total_points) }} pts</strong>
            <small>Puntos totales</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#e8f5e9;color:#2e7d32"><i class="fas fa-user-plus"></i></div>
            <span class="cm-vol-label">Volumen por afiliación</span>
            <strong>{{ fmtInt(report.volume.affiliation_points) }} pts</strong>
            <small>{{ report.volume.affiliation_share }}% del total · red</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#e3f2fd;color:#1565c0"><i class="fas fa-redo"></i></div>
            <span class="cm-vol-label">Volumen por reconsumo</span>
            <strong>{{ fmtInt(report.volume.reconsumo_points) }} pts</strong>
            <small>{{ report.volume.reconsumo_share }}% del total · red</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#fff3e0;color:#ef6c00"><i class="fas fa-shopping-cart"></i></div>
            <span class="cm-vol-label">Ventas realizadas</span>
            <strong>{{ fmtInt(personalReconsumoPts) }} pts</strong>
            <small>Compras personales (reconsumo propio)</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#f3e5f5;color:#7b1fa2"><i class="fas fa-layer-group"></i></div>
            <span class="cm-vol-label">Niveles activos</span>
            <strong>{{ report.org.active_levels }}</strong>
            <small>Niveles</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#e0f7fa;color:#00838f"><i class="fas fa-user-friends"></i></div>
            <span class="cm-vol-label">Frontales activos</span>
            <strong>{{ report.org.active_frontals }}</strong>
            <small>Frontales</small>
          </article>
        </section>

        <!-- Bloque 5: Detalle -->
        <section class="cm-card cm-detail">
          <div class="cm-tabs" role="tablist">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              role="tab"
              class="cm-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
              <span class="cm-tab-count">({{ tab.count }})</span>
            </button>
          </div>

          <div class="cm-detail-head">
            <div>
              <h3>{{ activeTabMeta.title }}</h3>
              <p>{{ activeTabMeta.subtitle }}</p>
            </div>
            <div class="cm-detail-total">
              Total generado
              <strong>S/ {{ money(activeTabMeta.total) }}</strong>
            </div>
          </div>

          <!-- Agrupado por nivel (afiliaciones / residuales) -->
          <template v-if="activeTab === 'affiliations' || activeTab === 'residual'">
            <div v-if="!groupedLevels.length" class="cm-no-rows">
              No hay movimientos de este tipo en el periodo.
            </div>
            <div v-else class="cm-levels">
              <div
                v-for="g in groupedLevels"
                :key="g.key"
                class="cm-level"
                :class="{ open: isLevelOpen(g.key) }"
              >
                <button
                  type="button"
                  class="cm-level-head"
                  @click="toggleLevel(g.key)"
                >
                  <span class="cm-level-title">
                    <i class="fas fa-users" aria-hidden="true"></i>
                    {{ g.label }}
                    <small v-if="g.rows.length" class="cm-level-count">({{ g.rows.length }})</small>
                  </span>
                  <span class="cm-level-right">
                    <span class="cm-level-total">
                      Total generado: <strong>S/ {{ money(g.total) }}</strong>
                    </span>
                    <i
                      class="fas cm-level-chevron"
                      :class="isLevelOpen(g.key) ? 'fa-chevron-up' : 'fa-chevron-down'"
                    ></i>
                  </span>
                </button>
                <div v-show="isLevelOpen(g.key)" class="cm-table-wrap">
                  <table
                    class="cm-table"
                    :class="activeTab === 'affiliations' ? 'cm-table--aff' : 'cm-table--res'"
                  >
                    <thead>
                      <tr v-if="activeTab === 'affiliations'">
                        <th class="col-date">Fecha</th>
                        <th class="col-name">Persona afiliada</th>
                        <th class="col-pack">Paquete adquirido</th>
                        <th class="col-pts">Puntos del paquete</th>
                        <th class="col-amt">Comisión</th>
                        <th class="col-pct">% Comisión</th>
                      </tr>
                      <tr v-else>
                        <th class="col-name">Persona</th>
                        <th class="col-dni">DNI</th>
                        <th class="col-pr">PR</th>
                        <th class="col-amt">Comisión</th>
                        <th class="col-pct">% Comisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in g.rows" :key="row.id">
                        <template v-if="activeTab === 'affiliations'">
                          <td class="col-date">{{ formatDate(row.date) }}</td>
                          <td class="col-name">
                            <span class="cm-cell-main">{{ row.name }}</span>
                            <span v-if="row.dni" class="cm-cell-sub">DNI: {{ row.dni }}</span>
                          </td>
                          <td class="col-pack">{{ row.package || "—" }}</td>
                          <td class="col-pts">
                            <template v-if="row.points != null">{{ fmtInt(row.points) }} pts</template>
                            <template v-else>—</template>
                          </td>
                          <td class="col-amt">S/ {{ money(row.amount) }}</td>
                          <td class="col-pct">
                            <template v-if="row.percentage != null">{{ formatPct(row.percentage) }}</template>
                            <template v-else>—</template>
                          </td>
                        </template>
                        <template v-else>
                          <td class="col-name">{{ row.name }}</td>
                          <td class="col-dni">{{ row.dni || "—" }}</td>
                          <td class="col-pr">
                            {{ row.pr != null ? fmtInt(row.pr) : "—" }}
                          </td>
                          <td class="col-amt">S/ {{ money(row.amount) }}</td>
                          <td class="col-pct">
                            <template v-if="row.percentage != null">{{ formatPct(row.percentage) }}</template>
                            <template v-else>—</template>
                          </td>
                        </template>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="cm-detail-footer-bar">
              <button type="button" class="cm-btn-export" @click="downloadDetail">
                <i class="fas fa-file-excel"></i>
                Descargar detalle de {{ activeTab === 'affiliations' ? 'afiliaciones' : 'residuales' }} (Excel)
              </button>
              <label class="cm-search">
                <input
                  v-model="search"
                  type="search"
                  :placeholder="activeTab === 'affiliations' ? 'Buscar afiliado o DNI...' : 'Buscar nombre o DNI...'"
                />
                <i class="fas fa-search" aria-hidden="true"></i>
              </label>
            </div>
          </template>

          <!-- Listas simples -->
          <template v-else>
            <div v-if="!simpleRows.length" class="cm-no-rows">
              No hay movimientos de este tipo en el periodo.
            </div>
            <div v-else class="cm-table-wrap">
              <table class="cm-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Rango</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in simpleRows" :key="row.id">
                    <td>{{ row.label || row.name || "—" }}</td>
                    <td>{{ formatRank(row.rank) || "—" }}</td>
                    <td class="cm-td-amt">S/ {{ money(row.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div class="cm-tax-note">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            <span>Los montos mostrados ya incluyen impuestos de ley aplicables.</span>
          </div>
        </section>
      </template>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import jsPDF from "jspdf";
import "@/assets/style/views/app/Closeds.css";

export default {
  components: { App, Spinner },
  data() {
    return {
      loading: true,
      periods: [],
      selectedPeriodKey: "",
      report: null,
      photo: null,
      dni: null,
      token: null,
      activeTab: "affiliations",
      search: "",
      openLevels: {},
      loadError: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    fullName() {
      return [this.$store.state.name, this.$store.state.lastName]
        .filter(Boolean)
        .join(" ") || "—";
    },
    initials() {
      const parts = this.fullName.split(/\s+/).filter(Boolean);
      return ((parts[0] && parts[0][0]) || "") + ((parts[1] && parts[1][0]) || "");
    },
    tabs() {
      const d = (this.report && this.report.details) || {};
      return [
        {
          key: "affiliations",
          label: "Afiliaciones",
          icon: "fas fa-handshake",
          count: (d.affiliations && d.affiliations.rows && d.affiliations.rows.length) || 0,
        },
        {
          key: "residual",
          label: "Residuales",
          icon: "fas fa-project-diagram",
          count: (d.residual && d.residual.rows && d.residual.rows.length) || 0,
        },
        {
          key: "rank_start",
          label: "Bono Inicio de Rango",
          icon: "fas fa-flag",
          count: (d.rank_start && d.rank_start.rows && d.rank_start.rows.length) || 0,
        },
        {
          key: "rank_lead",
          label: "Bono Liderazgo",
          icon: "fas fa-medal",
          count: (d.rank_lead && d.rank_lead.rows && d.rank_lead.rows.length) || 0,
        },
        {
          key: "savings",
          label: "Bono Ahorro",
          icon: "fas fa-piggy-bank",
          count: (d.savings && d.savings.rows && d.savings.rows.length) || 0,
        },
      ];
    },
    activeDetail() {
      if (!this.report) return { total: 0, rows: [] };
      return this.report.details[this.activeTab] || { total: 0, rows: [] };
    },
    activeTabMeta() {
      const map = {
        affiliations: {
          title: "Detalle de Afiliaciones",
          subtitle: "Comisiones por nuevas afiliaciones en tu red",
        },
        residual: {
          title: "Detalle de Residuales",
          subtitle: "Residual y generacional VIP del cierre",
        },
        rank_start: {
          title: "Bono Inicio de Rango",
          subtitle: "Recalificación / logro de rango",
        },
        rank_lead: {
          title: "Bono Liderazgo",
          subtitle: "Mantenimiento de rango en el cierre",
        },
        savings: {
          title: "Bono Ahorro",
          subtitle: "Bono Ahorro Sifrah del cierre",
        },
      };
      const m = map[this.activeTab] || { title: "Detalle", subtitle: "" };
      return { ...m, total: this.activeDetail.total || 0 };
    },
    filteredRows() {
      const rows = (this.activeDetail && this.activeDetail.rows) || [];
      const q = (this.search || "").trim().toLowerCase();
      if (!q) return rows;
      return rows.filter((r) => {
        const name = String(r.name || r.label || "").toLowerCase();
        const dni = String(r.dni || "").toLowerCase();
        const pack = String(r.package || "").toLowerCase();
        return name.includes(q) || dni.includes(q) || pack.includes(q);
      });
    },
    groupedLevels() {
      if (this.activeTab !== "affiliations" && this.activeTab !== "residual") return [];

      // Afiliaciones: igual al diseño — Niveles 1…6 y grupo 7 a 9
      if (this.activeTab === "affiliations") {
        const buckets = [];
        for (let L = 1; L <= 6; L++) {
          buckets.push({
            key: String(L),
            level: L,
            label: "Nivel " + L,
            rows: [],
            total: 0,
          });
        }
        buckets.push({
          key: "7-9",
          level: 7,
          label: "Nivel 7 a 9",
          rows: [],
          total: 0,
        });

        for (const row of this.filteredRows) {
          let L = row.level != null && row.level !== "" ? Number(row.level) : NaN;
          if (Number.isNaN(L) || L < 1) L = 0;
          const amount = Number(row.amount) || 0;
          if (L >= 1 && L <= 6) {
            buckets[L - 1].rows.push(row);
            buckets[L - 1].total += amount;
          } else if (L >= 7 && L <= 9) {
            buckets[6].rows.push(row);
            buckets[6].total += amount;
          } else if (L > 9) {
            buckets[6].rows.push(row);
            buckets[6].total += amount;
          } else {
            // sin resolver: no mezclar con “Nivel 1”; van a un bucket extra solo si hay
            let other = buckets.find((b) => b.key === "other");
            if (!other) {
              other = {
                key: "other",
                level: 0,
                label: "Sin nivel",
                rows: [],
                total: 0,
              };
              buckets.push(other);
            }
            other.rows.push(row);
            other.total += amount;
          }
        }
        // Ocultar “Sin nivel” si quedó vacío; mantener 1–6 y 7–9 aunque estén en 0
        return buckets.filter((b) => b.key !== "other" || b.rows.length);
      }

      const map = {};
      for (const row of this.filteredRows) {
        const level = row.level != null && row.level !== "" ? Number(row.level) || 0 : 0;
        if (!map[level]) {
          map[level] = {
            key: String(level),
            level,
            label: level > 0 ? "Nivel " + level : "Sin nivel",
            rows: [],
            total: 0,
          };
        }
        map[level].rows.push(row);
        map[level].total += Number(row.amount) || 0;
      }
      return Object.values(map).sort((a, b) => a.level - b.level);
    },
    simpleRows() {
      if (this.activeTab === "affiliations" || this.activeTab === "residual") return [];
      return this.filteredRows;
    },
    personalReconsumoPts() {
      if (!this.report || !this.report.volume) return 0;
      const v = this.report.volume;
      if (v.personal_reconsumo_points != null) {
        return Number(v.personal_reconsumo_points) || 0;
      }
      // Fallback compat
      return Number(v.personal_points) || 0;
    },
    donutGradient() {
      const parts = (this.report && this.report.breakdown) || [];
      const withAmt = parts.filter((b) => Number(b.amount) > 0);
      if (!withAmt.length) return "conic-gradient(#e5e7eb 0deg 360deg)";
      let acc = 0;
      const segs = withAmt.map((b) => {
        const start = acc;
        acc += Math.max(0.1, Number(b.percent) || 0);
        return `${b.color} ${start * 3.6}deg ${acc * 3.6}deg`;
      });
      if (acc < 100) segs.push(`#eef2f7 ${acc * 3.6}deg 360deg`);
      return `conic-gradient(${segs.join(", ")})`;
    },
  },
  async created() {
    await this.load();
  },
  methods: {
    money(n) {
      return (Number(n) || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    fmtInt(n) {
      return (Number(n) || 0).toLocaleString("es-PE");
    },
    formatRank(rank) {
      if (rank == null || rank === "") return "";
      const s = String(rank).toLowerCase().trim();
      if (s === "none" || s === "null" || s === "undefined") return "Inactivo";
      if (s === "active" || s === "activo") return "Activo";
      return String(rank)
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    },
    formatDate(d) {
      if (!d) return "—";
      const x = new Date(d);
      if (Number.isNaN(x.getTime())) return "—";
      return x.toLocaleDateString("es-PE", { timeZone: "America/Lima" });
    },
    formatDateTime(d) {
      if (!d) return "—";
      const x = new Date(d);
      if (Number.isNaN(x.getTime())) return "—";
      return (
        x.toLocaleDateString("es-PE", { timeZone: "America/Lima" }) +
        " · " +
        x.toLocaleTimeString("es-PE", {
          timeZone: "America/Lima",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    },
    formatRange(start, end) {
      if (!start && !end) return "—";
      const a = start ? this.formatDate(start) : "—";
      const b = end ? this.formatDate(end) : "—";
      return `${a} – ${b}`;
    },
    formatPct(p) {
      if (p == null || p === "") return "—";
      const n = Number(p);
      if (Number.isNaN(n)) return "—";
      // 0–1 => porcentaje; 1–100 => ya es %
      const pct = n > 0 && n <= 1 ? n * 100 : n;
      return `${pct.toFixed(1)}%`;
    },
    isLevelOpen(key) {
      if (this.openLevels[key] === true) return true;
      if (this.openLevels[key] === false) return false;
      // Por defecto solo Nivel 1 abierto
      return String(key) === "1";
    },
    toggleLevel(key) {
      this.$set(this.openLevels, key, !this.isLevelOpen(key));
    },
    downloadDetail() {
      if (!this.report) return;
      const rows = this.filteredRows;
      const isAff = this.activeTab === "affiliations";
      const isRes = this.activeTab === "residual";
      let headers;
      if (isAff) {
        headers = [
          "Fecha",
          "Persona afiliada",
          "DNI",
          "Paquete",
          "Puntos",
          "Comisión",
          "% Comisión",
          "Nivel",
        ];
      } else if (isRes) {
        headers = ["Persona", "DNI", "PR", "Comisión", "% Comisión", "Nivel"];
      } else {
        headers = ["Concepto", "Rango", "Monto"];
      }
      const lines = [headers.join(",")];
      for (const r of rows) {
        let cols;
        if (isAff) {
          cols = [
            this.formatDate(r.date),
            r.name || "",
            r.dni || "",
            r.package || "",
            r.points != null ? r.points : "",
            Number(r.amount || 0).toFixed(2),
            r.percentage != null ? this.formatPct(r.percentage) : "",
            r.level != null ? r.level : "",
          ];
        } else if (isRes) {
          cols = [
            r.name || "",
            r.dni || "",
            r.pr != null ? r.pr : "",
            Number(r.amount || 0).toFixed(2),
            r.percentage != null ? this.formatPct(r.percentage) : "",
            r.level != null ? r.level : "",
          ];
        } else {
          cols = [
            r.label || r.name || "",
            this.formatRank(r.rank) || "",
            Number(r.amount || 0).toFixed(2),
          ];
        }
        lines.push(
          cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        );
      }
      const blob = new Blob(["\ufeff" + lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cierre-${this.report.period_key || "mes"}-${this.activeTab}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    async load(periodKey) {
      this.loading = true;
      try {
        const { data } = await api.Closeds.GET(this.session, periodKey || undefined);
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
        this.dni = data.dni || null;
        this.token = data.token || null;
        this.photo = data.photo || this.$store.state.photo || null;
        this.periods = data.periods || [];
        this.report = data.report || null;
        this.loadError =
          data.debug && data.debug.hint
            ? data.debug.hint
            : data.error
              ? data.msg || "Error al cargar"
              : null;
        if (this.report && this.report.period_key) {
          this.selectedPeriodKey = this.report.period_key;
        } else if (this.periods.length) {
          this.selectedPeriodKey = this.periods[0].period_key;
        }
        this.openLevels = {};
        this.search = "";
      } catch (e) {
        console.error(e);
        this.report = null;
        this.loadError = "No se pudo conectar con el servidor. Intenta de nuevo.";
      } finally {
        this.loading = false;
      }
    },
    async onPeriodChange() {
      if (!this.selectedPeriodKey) return;
      await this.load(this.selectedPeriodKey);
    },
    downloadPdf() {
      if (!this.report) return;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 40;
      const contentW = pageW - M * 2;
      const PINK = [233, 30, 99];
      const DARK = [17, 24, 39];
      const GRAY = [107, 114, 128];
      const LINE = [229, 231, 235];
      const BG = [249, 250, 251];
      let y = M;

      const ensure = (need = 40) => {
        if (y + need > pageH - 48) {
          doc.addPage();
          y = M;
        }
      };

      const hrule = (gap = 10) => {
        ensure(12);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.7);
        doc.line(M, y, pageW - M, y);
        y += gap;
      };

      const sectionTitle = (txt) => {
        ensure(28);
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.text(String(txt), M, y);
        y += 6;
        doc.setDrawColor(...PINK);
        doc.setLineWidth(1.5);
        doc.line(M, y, M + 36, y);
        y += 14;
      };

      const kvRow = (label, value, x, w) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(String(label), x, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(String(value || "—"), w);
        doc.text(lines, x, y + 12);
        return lines.length;
      };

      // ── Encabezado (sin título "Cierre de Mes") ──
      doc.setFillColor(...PINK);
      doc.rect(0, 0, pageW, 6, "F");
      y = 28;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...PINK);
      doc.text("Sifrah", M, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text("Resumen de ganancias del periodo", M + 58, y - 1);

      y += 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...DARK);
      doc.text(this.report.period_label || "Periodo", M, y);
      y += 8;
      hrule(14);

      // ── Socio ──
      sectionTitle("Socio");
      ensure(64);
      const socioTop = y;
      doc.setFillColor(...BG);
      doc.roundedRect(M, socioTop - 4, contentW, 56, 4, 4, "F");
      const colW = contentW / 2;
      y = socioTop + 10;
      kvRow("Nombre", this.fullName, M + 10, colW - 20);
      kvRow(
        "Rango del periodo",
        this.formatRank(this.report.rank) || "—",
        M + colW + 10,
        colW - 20
      );
      y = socioTop + 34;
      kvRow("DNI", this.dni || "—", M + 10, colW - 20);
      kvRow("Código", this.token || "—", M + colW + 10, colW - 20);
      y = socioTop + 60;

      // ── Periodo / cierre ──
      sectionTitle("Periodo y cierre");
      ensure(56);
      const perTop = y;
      doc.setFillColor(...BG);
      doc.roundedRect(M, perTop - 4, contentW, 50, 4, 4, "F");
      const q = contentW / 3;
      y = perTop + 10;
      kvRow(
        "Periodo",
        this.formatRange(this.report.period_start, this.report.period_end),
        M + 10,
        q - 16
      );
      kvRow(
        "Fecha de cierre",
        this.formatDateTime(this.report.closed_at),
        M + q + 6,
        q - 12
      );
      kvRow(
        "Personas activas",
        String(
          this.report.org.active_people != null
            ? this.report.org.active_people
            : 0
        ),
        M + q * 2 + 6,
        q - 12
      );
      y = perTop + 54;

      // ── Total ──
      sectionTitle("Total generado");
      ensure(36);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...PINK);
      doc.text(`S/ ${this.money(this.report.totals.total)}`, M, y);
      y += 14;
      if (this.report.totals.growth_percent != null) {
        const g = this.report.totals.growth_percent;
        const prev = this.report.totals.prev_total;
        let growthTxt =
          g === 0
            ? "Igual que el periodo anterior"
            : `${Math.abs(g)}% ${g > 0 ? "más" : "menos"} que el periodo anterior`;
        if (prev != null) growthTxt += ` (S/ ${this.money(prev)})`;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text(growthTxt, M, y);
        y += 12;
      }
      y += 4;

      // ── Desglose tabla ──
      sectionTitle("Desglose de comisiones");
      const breakdown = this.report.breakdown || [];
      ensure(20 + breakdown.length * 18);
      // header
      doc.setFillColor(...BG);
      doc.rect(M, y - 10, contentW, 18, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text("Concepto", M + 8, y);
      doc.text("%", M + contentW * 0.58, y);
      doc.text("Monto", pageW - M - 8, y, { align: "right" });
      y += 12;
      hrule(8);
      breakdown.forEach((b, i) => {
        ensure(18);
        if (i % 2 === 1) {
          doc.setFillColor(252, 252, 253);
          doc.rect(M, y - 11, contentW, 16, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(String(b.label || "—"), M + 8, y);
        doc.setTextColor(...GRAY);
        doc.text(`${b.percent != null ? b.percent : 0}%`, M + contentW * 0.58, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK);
        doc.text(`S/ ${this.money(b.amount)}`, pageW - M - 8, y, { align: "right" });
        y += 16;
      });
      y += 4;

      // ── Volumen ──
      sectionTitle("Volumen y organización");
      const vol = [
        ["Volumen generado", `${this.fmtInt(this.report.volume.total_points)} pts`],
        [
          "Vol. afiliación",
          `${this.fmtInt(this.report.volume.affiliation_points)} pts`,
        ],
        [
          "Vol. reconsumo",
          `${this.fmtInt(this.report.volume.reconsumo_points)} pts`,
        ],
        [
          "Ventas realizadas",
          `${this.fmtInt(this.personalReconsumoPts)} pts`,
        ],
        [
          "Niveles activos",
          String(
            this.report.org.active_levels != null
              ? this.report.org.active_levels
              : 0
          ),
        ],
        [
          "Frontales activos",
          String(
            this.report.org.active_frontals != null
              ? this.report.org.active_frontals
              : 0
          ),
        ],
      ];
      ensure(70);
      const cellW = contentW / 3;
      const cellH = 36;
      vol.forEach((pair, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        if (col === 0 && row > 0) y += cellH + 6;
        if (col === 0) ensure(cellH + 8);
        const x = M + col * cellW;
        const yy = y;
        doc.setFillColor(...BG);
        doc.roundedRect(x + 2, yy, cellW - 6, cellH, 3, 3, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text(pair[0], x + 10, yy + 14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(pair[1], x + 10, yy + 28);
      });
      y += cellH + 12;

      // ── Detalle por concepto ──
      sectionTitle("Detalle por concepto");
      for (const tab of this.tabs) {
        const block = this.report.details[tab.key];
        if (!block) continue;
        ensure(36);
        doc.setFillColor(...BG);
        doc.roundedRect(M, y - 4, contentW, 22, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(tab.label, M + 8, y + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(
          `${(block.rows || []).length} registro(s)`,
          M + contentW * 0.45,
          y + 10
        );
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(`S/ ${this.money(block.total)}`, pageW - M - 8, y + 10, {
          align: "right",
        });
        y += 28;

        const rows = (block.rows || []).slice(0, 20);
        if (!rows.length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          doc.text("Sin movimientos en este concepto.", M + 4, y);
          y += 14;
          continue;
        }

        // mini table header
        ensure(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        if (tab.key === "affiliations") {
          doc.text("Fecha", M + 4, y);
          doc.text("Persona / DNI", M + 70, y);
          doc.text("Nivel", M + contentW * 0.55, y);
          doc.text("Comisión", pageW - M - 4, y, { align: "right" });
        } else if (tab.key === "residual") {
          doc.text("Persona / DNI", M + 4, y);
          doc.text("Nivel", M + contentW * 0.5, y);
          doc.text("Comisión", pageW - M - 4, y, { align: "right" });
        } else {
          doc.text("Concepto", M + 4, y);
          doc.text("Rango", M + contentW * 0.55, y);
          doc.text("Monto", pageW - M - 4, y, { align: "right" });
        }
        y += 6;
        hrule(6);

        for (const r of rows) {
          ensure(14);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...DARK);
          if (tab.key === "affiliations") {
            doc.text(this.formatDate(r.date), M + 4, y);
            const who = `${r.name || "—"}${r.dni ? " · " + r.dni : ""}`;
            doc.text(
              doc.splitTextToSize(who, contentW * 0.4)[0],
              M + 70,
              y
            );
            doc.text(
              r.level != null ? `N${r.level}` : "—",
              M + contentW * 0.55,
              y
            );
            doc.setFont("helvetica", "bold");
            doc.text(`S/ ${this.money(r.amount)}`, pageW - M - 4, y, {
              align: "right",
            });
          } else if (tab.key === "residual") {
            const who = `${r.name || "—"}${r.dni ? " · " + r.dni : ""}`;
            doc.text(doc.splitTextToSize(who, contentW * 0.45)[0], M + 4, y);
            doc.text(
              r.level != null ? `N${r.level}` : "—",
              M + contentW * 0.5,
              y
            );
            doc.setFont("helvetica", "bold");
            doc.text(`S/ ${this.money(r.amount)}`, pageW - M - 4, y, {
              align: "right",
            });
          } else {
            doc.text(
              doc.splitTextToSize(r.label || r.name || "—", contentW * 0.45)[0],
              M + 4,
              y
            );
            doc.text(this.formatRank(r.rank) || "—", M + contentW * 0.55, y);
            doc.setFont("helvetica", "bold");
            doc.text(`S/ ${this.money(r.amount)}`, pageW - M - 4, y, {
              align: "right",
            });
          }
          y += 13;
        }
        if ((block.rows || []).length > 20) {
          ensure(12);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          doc.text(
            `… y ${(block.rows || []).length - 20} registro(s) más`,
            M + 4,
            y
          );
          y += 12;
        }
        y += 6;
      }

      // ── Pie ──
      ensure(36);
      y += 8;
      hrule(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(
        "Los montos mostrados ya incluyen impuestos de ley aplicables.",
        M,
        y
      );
      y += 12;
      doc.text(
        `Generado ${new Date().toLocaleString("es-PE")} · Periodo ${
          this.report.period_key || ""
        }`,
        M,
        y
      );

      // Números de página
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(`${p} / ${totalPages}`, pageW - M, pageH - 20, {
          align: "right",
        });
        doc.setFillColor(...PINK);
        doc.rect(0, pageH - 4, pageW, 4, "F");
      }

      doc.save(`cierre-mes-${this.report.period_key || "periodo"}.pdf`);
    },
  },
};
</script>
