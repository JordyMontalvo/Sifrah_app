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
          <div class="cm-profile-stats">
            <div class="cm-stat">
              <i class="fas fa-calendar"></i>
              <div>
                <span class="cm-stat-label">Periodo</span>
                <strong>{{ formatRange(report.period_start, report.period_end) }}</strong>
              </div>
            </div>
            <div class="cm-stat">
              <i class="fas fa-clock"></i>
              <div>
                <span class="cm-stat-label">Fecha de cierre</span>
                <strong>{{ formatDateTime(report.closed_at) }}</strong>
              </div>
            </div>
            <div class="cm-stat">
              <i class="fas fa-users"></i>
              <div>
                <span class="cm-stat-label">Personas activas</span>
                <strong>{{ report.org.active_people }}</strong>
              </div>
            </div>
            <div class="cm-stat">
              <i class="fas fa-check-circle"></i>
              <div>
                <span class="cm-stat-label">Estado</span>
                <strong class="cm-status-ok">{{ report.payment_status_label || "En saldo" }}</strong>
              </div>
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
              :class="{ neg: report.totals.growth_percent < 0 }"
            >
              <template v-if="report.totals.growth_percent >= 0">↑ </template>
              <template v-else>↓ </template>
              {{ Math.abs(report.totals.growth_percent) }}%
              {{ report.totals.growth_percent >= 0 ? "más" : "menos" }}
              que el periodo anterior
              <span v-if="report.totals.prev_total != null">
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
            <small>{{ report.volume.affiliation_share }}% del total</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#e3f2fd;color:#1565c0"><i class="fas fa-redo"></i></div>
            <span class="cm-vol-label">Volumen por reconsumo</span>
            <strong>{{ fmtInt(report.volume.reconsumo_points) }} pts</strong>
            <small>{{ report.volume.reconsumo_share }}% del total</small>
          </article>
          <article class="cm-vol-card">
            <div class="cm-vol-icon" style="background:#fff3e0;color:#ef6c00"><i class="fas fa-shopping-bag"></i></div>
            <span class="cm-vol-label">Puntos personales</span>
            <strong>{{ fmtInt(report.volume.personal_points) }} pts</strong>
            <small>Reconsumo + afiliación propia</small>
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
              Total: <strong>S/ {{ money(activeTabMeta.total) }}</strong>
            </div>
          </div>

          <div class="cm-detail-toolbar">
            <button type="button" class="cm-btn cm-btn-soft" @click="downloadDetail">
              <i class="fas fa-file-excel"></i>
              Descargar detalle (Excel/CSV)
            </button>
            <label class="cm-search">
              <i class="fas fa-search"></i>
              <input v-model="search" type="search" placeholder="Buscar nombre o DNI..." />
            </label>
          </div>

          <!-- Agrupado por nivel (afiliaciones / residuales) -->
          <template v-if="activeTab === 'affiliations' || activeTab === 'residual'">
            <div v-if="!groupedLevels.length" class="cm-no-rows">
              No hay movimientos de este tipo en el periodo.
            </div>
            <div v-else class="cm-levels">
              <div
                v-for="g in groupedLevels"
                :key="g.level"
                class="cm-level"
              >
                <button
                  type="button"
                  class="cm-level-head"
                  @click="toggleLevel(g.level)"
                >
                  <span>
                    <i
                      class="fas"
                      :class="openLevels[g.level] === false ? 'fa-chevron-right' : 'fa-chevron-down'"
                    ></i>
                    {{ g.level > 0 ? "Nivel " + g.level : "Sin nivel" }}
                  </span>
                  <strong>S/ {{ money(g.total) }}</strong>
                </button>
                <div v-show="openLevels[g.level] !== false" class="cm-table-wrap">
                  <table class="cm-table">
                    <thead>
                      <tr>
                        <th v-if="activeTab === 'affiliations'">Fecha</th>
                        <th>Persona</th>
                        <th>DNI</th>
                        <th v-if="activeTab === 'residual'">PR / %</th>
                        <th>Comisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in g.rows" :key="row.id">
                        <td v-if="activeTab === 'affiliations'">{{ formatDate(row.date) }}</td>
                        <td>{{ row.name }}</td>
                        <td>{{ row.dni || "—" }}</td>
                        <td v-if="activeTab === 'residual'">
                          <span v-if="row.pr != null">{{ fmtInt(row.pr) }}</span>
                          <span v-if="row.percentage != null">
                            · {{ (row.percentage * 100).toFixed(1) }}%
                          </span>
                          <span v-if="row.pr == null && row.percentage == null">—</span>
                        </td>
                        <td class="cm-td-amt">S/ {{ money(row.amount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
        </section>

        <p class="cm-footnote">
          Los montos mostrados corresponden al cierre del periodo seleccionado y ya
          reflejan las comisiones registradas en tu cuenta.
        </p>
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
          subtitle: "Comisiones por afiliaciones del periodo",
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
        return name.includes(q) || dni.includes(q);
      });
    },
    groupedLevels() {
      if (this.activeTab !== "affiliations" && this.activeTab !== "residual") return [];
      const map = {};
      for (const row of this.filteredRows) {
        const level = row.level != null && row.level !== "" ? Number(row.level) || 0 : 0;
        if (!map[level]) map[level] = { level, rows: [], total: 0 };
        map[level].rows.push(row);
        map[level].total += Number(row.amount) || 0;
      }
      return Object.values(map).sort((a, b) => a.level - b.level);
    },
    simpleRows() {
      if (this.activeTab === "affiliations" || this.activeTab === "residual") return [];
      return this.filteredRows;
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
      if (!rank) return "";
      const s = String(rank).toLowerCase();
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
      return x.toLocaleDateString("es-PE");
    },
    formatDateTime(d) {
      if (!d) return "—";
      const x = new Date(d);
      if (Number.isNaN(x.getTime())) return "—";
      return (
        x.toLocaleDateString("es-PE") +
        " · " +
        x.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
      );
    },
    formatRange(start, end) {
      if (!start && !end) return "—";
      const a = start ? this.formatDate(start) : "—";
      const b = end ? this.formatDate(end) : "—";
      return `${a} – ${b}`;
    },
    toggleLevel(level) {
      const cur = this.openLevels[level];
      this.$set(this.openLevels, level, cur === false ? true : false);
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
        if (this.report && this.report.period_key) {
          this.selectedPeriodKey = this.report.period_key;
        } else if (this.periods.length) {
          this.selectedPeriodKey = this.periods[0].period_key;
        }
        this.openLevels = {};
      } catch (e) {
        console.error(e);
        this.report = null;
      } finally {
        this.loading = false;
      }
    },
    async onPeriodChange() {
      if (!this.selectedPeriodKey) return;
      await this.load(this.selectedPeriodKey);
    },
    downloadDetail() {
      if (!this.report) return;
      const rows = this.filteredRows;
      const headers = ["Concepto", "Nombre", "DNI", "Nivel", "Monto"];
      const lines = [headers.join(",")];
      for (const r of rows) {
        const cols = [
          this.activeTabMeta.title,
          r.name || r.label || "",
          r.dni || "",
          r.level != null ? r.level : "",
          Number(r.amount || 0).toFixed(2),
        ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
        lines.push(cols.join(","));
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
    downloadPdf() {
      if (!this.report) return;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;
      let y = 48;
      const line = (txt, size = 11, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(String(txt), 515);
        doc.text(lines, margin, y);
        y += lines.length * (size + 4) + 4;
        if (y > 780) {
          doc.addPage();
          y = 48;
        }
      };

      line("Sifrah — Cierre de Mes", 16, true);
      line(this.report.period_label || "", 12, true);
      line(`${this.fullName}`, 11);
      if (this.dni) line(`DNI: ${this.dni}`);
      if (this.token) line(`Código: ${this.token}`);
      line(`Rango del periodo: ${this.formatRank(this.report.rank) || "—"}`);
      line(
        `Periodo: ${this.formatRange(this.report.period_start, this.report.period_end)}`
      );
      line(`Cierre: ${this.formatDateTime(this.report.closed_at)}`);
      y += 8;
      line(`Total generado: S/ ${this.money(this.report.totals.total)}`, 13, true);
      y += 4;
      line("Desglose", 12, true);
      for (const b of this.report.breakdown || []) {
        line(
          `• ${b.label}: S/ ${this.money(b.amount)} (${b.percent}%)`
        );
      }
      y += 6;
      line("Volumen y organización", 12, true);
      line(`Volumen total: ${this.fmtInt(this.report.volume.total_points)} pts`);
      line(`Afiliación: ${this.fmtInt(this.report.volume.affiliation_points)} pts`);
      line(`Reconsumo: ${this.fmtInt(this.report.volume.reconsumo_points)} pts`);
      line(`Puntos personales: ${this.fmtInt(this.report.volume.personal_points)} pts`);
      line(`Personas activas: ${this.report.org.active_people}`);
      line(`Niveles activos: ${this.report.org.active_levels}`);
      line(`Frontales activos: ${this.report.org.active_frontals}`);
      y += 8;
      line("Detalle por concepto (resumen)", 12, true);
      for (const tab of this.tabs) {
        const block = this.report.details[tab.key];
        if (!block) continue;
        line(
          `${tab.label}: S/ ${this.money(block.total)} · ${block.rows.length} registro(s)`,
          11,
          true
        );
        const top = (block.rows || []).slice(0, 25);
        for (const r of top) {
          line(
            `  - ${r.name || r.label || "—"} ${r.dni ? "(" + r.dni + ")" : ""} · S/ ${this.money(r.amount)}`
          );
        }
        if (block.rows.length > 25) {
          line(`  … y ${block.rows.length - 25} más`);
        }
      }
      y += 10;
      line(
        "Los montos corresponden al cierre del periodo y a las comisiones registradas.",
        9
      );

      doc.save(`cierre-mes-${this.report.period_key || "periodo"}.pdf`);
    },
  },
};
</script>
