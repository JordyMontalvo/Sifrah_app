<template>
  <App :session="session" :title="title">

    <!-- Título -->
    <div class="mov-top">
      <h1 class="mov-title">Movimientos</h1>
      <p class="mov-subtitle">Consulta el historial de movimientos de tu cuenta.</p>
    </div>

    <!-- Buscador -->
    <div class="search-row" v-if="!loading">
      <div class="search-box" :class="{ active: search }">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div class="search-texts">
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Buscar movimientos"
            @input="onSearch"
          />
          <span class="search-hint" v-if="!search">Ej. afiliación, generacional, residual, compra...</span>
        </div>
        <button v-if="search" class="search-clear" @click="clearSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <button class="btn-filtros">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filtros
      </button>
    </div>

    <!-- Info búsqueda -->
    <div v-if="search && !loading" class="search-info">
      <span v-if="searchResultCount > 0">{{ searchResultCount }} resultado{{ searchResultCount !== 1 ? 's' : '' }}</span>
      <span v-else class="no-results">Sin resultados para "{{ search }}"</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="skeleton-wrap">
      <div v-for="i in 4" :key="i" class="skeleton-card" />
    </div>

    <!-- Empty -->
    <div v-else-if="!cycles.length" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Sin movimientos registrados</p>
    </div>

    <!-- Sin resultados búsqueda -->
    <div v-else-if="search && searchResultCount === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>Sin resultados para <strong>"{{ search }}"</strong></p>
    </div>

    <!-- Ciclos -->
    <div v-else-if="filteredCycles.length" class="cycles-wrap">
      <div
        v-for="(cycle, ci) in filteredCycles"
        :key="cycle.key"
        class="cycle-card"
      >
        <!-- Header del ciclo -->
        <button
          class="cycle-header"
          :class="{ open: cycle.expanded }"
          @click="toggleCycle(ci)"
        >
          <!-- Icono calendario -->
          <div class="cycle-icon" :class="{ 'cycle-icon--open': cycle.expanded }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <!-- Label + conteo -->
          <div class="cycle-info">
            <span class="cycle-label">{{ cycle.label }}</span>
            <span class="cycle-count-text">{{ search ? cycle.filteredItems.length : cycle.items.length }} movimientos</span>
          </div>

          <!-- Total ingresos + chevron -->
          <div class="cycle-right">
            <span class="cycle-net" :class="cycleNetClass(cycle)">
              +{{ cycleIncome(cycle).toFixed(2) }}
            </span>
            <svg
              class="chevron"
              :class="{ rotated: cycle.expanded }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        <!-- Items del ciclo -->
        <transition name="slide">
          <div v-if="cycle.expanded" class="cycle-body">
            <div
              v-for="(tx, ti) in visibleItems(cycle)"
              :key="ti"
              class="tx-row"
              :class="{ 'tx-row--pending': isVirtual(tx) }"
              @click="openDetail(tx, cycle)"
            >
              <!-- Fecha -->
              <div class="tx-date">
                <span class="tx-day">{{ tx.date | day }}</span>
                <span class="tx-month">{{ tx.date | month }}</span>
              </div>

              <!-- Info -->
              <div class="tx-info">
                <span class="tx-name" v-html="highlight(opLabel(tx.name))"></span>

                <!-- Persona que originó el bono -->
                <div class="tx-person-row" v-if="txPersonName(tx)">
                  <svg class="tx-person-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span class="tx-person" v-html="highlight(txPersonName(tx))"></span>
                </div>

                <!-- Chips de detalle: Nivel / Gen, PR -->
                <div class="tx-meta-chips" v-if="hasMeta(tx)">
                  <span class="tx-chip tx-chip--level" v-if="txLevelLabel(tx)" v-html="highlight(txLevelLabel(tx))"></span>
                  <span class="tx-chip tx-chip--pr" v-if="txPRLabel(tx)" v-html="highlight(txPRLabel(tx))"></span>
                </div>

                <!-- Fallback descripción para otros tipos de movimientos -->
                <span
                  class="tx-desc"
                  v-else-if="txFallbackDesc(tx)"
                  v-html="highlight(txFallbackDesc(tx))"
                ></span>
              </div>

              <!-- Monto (pill) -->
              <div class="tx-amount-pill" :class="tx.type === 'in' ? 'pill-in' : 'pill-out'">
                <span v-if="tx.type === 'in'">+ {{ tx.value.toFixed(2) }}</span>
                <span v-else>- {{ tx.value.toFixed(2) }}</span>
              </div>

              <!-- Chevron fila -->
              <svg class="tx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            <!-- Ver todos -->
            <button
              v-if="!cycle.showAll && (search ? cycle.filteredItems.length : cycle.items.length) > 5"
              class="btn-ver-todos"
              @click.stop="showAllItems(ci)"
            >
              Ver todos los movimientos
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="ver-icon">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Modal Detalle del Movimiento -->
    <transition name="modal-fade">
      <div
        v-if="selectedTx"
        class="tx-modal-overlay"
        @click.self="closeDetail"
      >
        <div class="tx-modal-card">
          <div class="tx-modal-header">
            <div class="tx-modal-title-wrap">
              <span class="tx-modal-badge" :class="selectedTx.type === 'in' ? 'badge-in' : 'badge-out'">
                {{ selectedTx.type === 'in' ? 'Ingreso' : 'Egreso' }}
              </span>
              <h3 class="tx-modal-title">{{ opLabel(selectedTx.name) }}</h3>
            </div>
            <button class="tx-modal-close" @click="closeDetail" aria-label="Cerrar">✕</button>
          </div>

          <div class="tx-modal-amount-box" :class="selectedTx.type === 'in' ? 'amount-in' : 'amount-out'">
            <span class="tx-modal-amount-sign">{{ selectedTx.type === 'in' ? '+' : '-' }}</span>
            <span class="tx-modal-amount-currency">S/</span>
            <span class="tx-modal-amount-val">{{ Number(selectedTx.value || 0).toFixed(2) }}</span>
          </div>

          <div class="tx-modal-body">
            <!-- Periodo / Ciclo -->
            <div class="tx-modal-item" v-if="selectedTxCycleLabel">
              <span class="tx-modal-label">Ciclo / Periodo</span>
              <span class="tx-modal-val font-semibold">{{ selectedTxCycleLabel }}</span>
            </div>

            <!-- Fecha -->
            <div class="tx-modal-item">
              <span class="tx-modal-label">Fecha</span>
              <span class="tx-modal-val">{{ formatFullDate(selectedTx.date) }}</span>
            </div>

            <!-- Detalle de origen de la comisión -->
            <template v-if="isCommissionTx(selectedTx)">
              <div class="tx-modal-divider"></div>
              <div class="tx-modal-section-title">Detalle de la comisión</div>

              <!-- Persona que originó -->
              <div class="tx-modal-item" v-if="txPersonName(selectedTx)">
                <span class="tx-modal-label">Afiliado / Origen</span>
                <span class="tx-modal-val font-semibold">{{ txPersonName(selectedTx) }}</span>
              </div>

              <!-- DNI -->
              <div class="tx-modal-item" v-if="selectedTx.affiliate_dni">
                <span class="tx-modal-label">DNI</span>
                <span class="tx-modal-val">{{ selectedTx.affiliate_dni }}</span>
              </div>

              <!-- Nivel / Generación -->
              <div class="tx-modal-item" v-if="txLevelLabel(selectedTx)">
                <span class="tx-modal-label">{{ isGenerational(selectedTx) ? 'Generación VIP' : 'Nivel' }}</span>
                <span class="tx-modal-pill pill-level">{{ txLevelLabel(selectedTx) }}</span>
              </div>


              <!-- PR -->
              <div class="tx-modal-item" v-if="selectedTx.pr != null && selectedTx.pr !== ''">
                <span class="tx-modal-label">Puntos Reconsumo (PR)</span>
                <span class="tx-modal-val">{{ Number(selectedTx.pr).toFixed(0) }} pts</span>
              </div>
            </template>

            <!-- Descripción adicional si existe -->
            <div class="tx-modal-item" v-if="selectedTx.desc">
              <span class="tx-modal-label">Descripción</span>
              <span class="tx-modal-val">{{ selectedTx.desc }}</span>
            </div>

            <!-- Disponibilidad si es virtual -->
            <div class="tx-modal-item" v-if="isVirtual(selectedTx)">
              <span class="tx-modal-label">Disponibilidad</span>
              <span class="tx-modal-badge badge-pending">Saldo no disponible (virtual)</span>
            </div>
          </div>

          <div class="tx-modal-footer">
            <button class="tx-modal-btn-close" @click="closeDetail">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </transition>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

const NO_PERSON_OPS = new Set([
  "collect",
  "affiliation",
  "activation",
  "wallet transfer",
  "remaining",
]);

const OP_LABELS = {
  "standard-register": "Bono Registro Emprendedor",
  "business-register": "Bono Registro Ejecutivo",
  "business-vip-register": "Bono Registro Empresarial",
  "collect": "Retiro",
  "residual": "Bono Residual",
  "residual bonus": "Bono Residual",
  "generational bonus vip": "Bono Generacional VIP",
  "generational bonus": "Bono Generacional",
  "objetive": "Bono Logro",
  "points": "Bono Compras",
  "affiliation": "Afiliación con saldo",
  "activation": "Compra con saldo",
  "affiliation bonus": "Bono por afiliación",
  "migration bonus": "Bono por migración",
  "wallet transfer": "Monedero brillante",
  "remaining": "Pago Ganancia",
  "closed bonus": "Bono Cierre",
  "activation bonnus promo": "Bono compra promoción",
  "closed reset": "Descuento por cierre",
  "bono ahorro sifrah": "Bono Ahorro Sifrah",
  "savings bonus": "Bono Ahorro Sifrah",
  "bono logro rango": "Bono Logro de Rango",
  "bono mantenimiento rango": "Bono Mantenimiento de Rango",
  "excedent bonus": "Bono Excedente",
};

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default {
  components: { App },
  data() {
    return {
      loading: true,
      cycles: [],
      title: "Movimientos",
      search: "",
      selectedTx: null,
      selectedCycle: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    selectedTxCycleLabel() {
      if (!this.selectedTx) return "";
      if (this.selectedTx.period_label) return this.selectedTx.period_label;
      if (this.selectedTx.period_key) return this.selectedTx.period_key;
      if (this.selectedCycle && this.selectedCycle.label) return this.selectedCycle.label;
      return "";
    },
    filteredCycles() {
      if (!this.search.trim()) return this.cycles;
      const q = this.search.trim().toLowerCase();
      return this.cycles
        .map(cycle => {
          const filtered = cycle.items.filter(tx => {
            const op1    = (OP_LABELS[tx.name] || '').toLowerCase();
            const op2    = (tx.name || '').toLowerCase();
            const person = (this.txPersonName(tx) || '').toLowerCase();
            const period = (cycle.label || '').toLowerCase();
            const lvl    = (this.txLevelLabel(tx) || '').toLowerCase();
            const pct    = (this.txPercentageLabel(tx) || '').toLowerCase();
            const pr     = (this.txPRLabel(tx) || '').toLowerCase();
            const desc   = (tx.desc || '').toLowerCase();
            const dni    = (tx.affiliate_dni || '').toLowerCase();
            return (
              op1.includes(q) ||
              op2.includes(q) ||
              person.includes(q) ||
              period.includes(q) ||
              lvl.includes(q) ||
              pct.includes(q) ||
              pr.includes(q) ||
              desc.includes(q) ||
              dni.includes(q)
            );
          });
          return { ...cycle, filteredItems: filtered, expanded: filtered.length > 0 };
        })
        .filter(cycle => cycle.filteredItems.length > 0);
    },
    searchResultCount() {
      return this.filteredCycles.reduce((sum, c) => sum + c.filteredItems.length, 0);
    },
  },
  async created() {
    const { data } = await api.transactions(this.session);
    this.loading = false;

    if (data.error && data.msg === "invalid session") return this.$router.push("/login");
    if (data.error && data.msg === "unverified user") return this.$router.push("/verify");

    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);

    const txs = [...data.transactions].reverse();
    this.cycles = this.buildCycles(txs);

    if (this.cycles.length) this.$set(this.cycles[0], "expanded", true);
  },
  methods: {
    openDetail(tx, cycle) {
      this.selectedTx = tx;
      this.selectedCycle = cycle;
    },
    closeDetail() {
      this.selectedTx = null;
      this.selectedCycle = null;
    },
    txPersonName(tx) {
      if (!tx) return "";
      if (tx.affiliate_name && String(tx.affiliate_name).trim()) return String(tx.affiliate_name).trim();
      if (tx.user_name && String(tx.user_name).trim() && !NO_PERSON_OPS.has(tx.name)) {
        return String(tx.user_name).trim();
      }
      if (tx.desc && tx.desc.includes(" - ")) {
        const parts = tx.desc.split(" - ");
        if (parts.length > 1 && parts[1].trim()) return parts[1].trim();
      }
      return "";
    },
    isGenerational(tx) {
      if (!tx || !tx.name) return false;
      return String(tx.name).toLowerCase().includes("generational");
    },
    txLevelLabel(tx) {
      if (!tx) return "";
      if (tx.level != null && tx.level !== "") {
        const lvl = Number(tx.level);
        if (this.isGenerational(tx)) return `Gen. VIP ${lvl}`;
        return `Nivel ${lvl}`;
      }
      if (tx.desc) {
        const mGen = tx.desc.match(/G(\d+)/i);
        if (mGen) return `Gen. VIP ${mGen[1]}`;
        const mLvl = tx.desc.match(/nivel\s+(\d+)/i);
        if (mLvl) return `Nivel ${mLvl[1]}`;
      }
      return "";
    },
    txPercentageLabel(tx) {
      if (!tx) return "";
      if (tx.percentage != null && tx.percentage !== "") {
        const p = Number(tx.percentage);
        if (Number.isFinite(p) && p > 0) {
          const val = p > 1 ? p : p * 100;
          return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)) + "%";
        }
      }
      if (tx.desc) {
        const m = tx.desc.match(/(\d+(?:\.\d+)?)\s*%/);
        if (m) return `${m[1]}%`;
      }
      return "";
    },
    txPRLabel(tx) {
      if (!tx || tx.pr == null || tx.pr === "") return "";
      const pr = Number(tx.pr);
      if (!Number.isFinite(pr) || pr <= 0) return "";
      return `PR ${pr.toFixed(0)}`;
    },
    hasMeta(tx) {
      return !!(this.txLevelLabel(tx) || this.txPRLabel(tx));
    },
    txFallbackDesc(tx) {
      if (!tx) return "";
      if (this.hasMeta(tx)) return "";
      if (tx.desc && tx.desc !== tx.name && tx.desc !== this.opLabel(tx.name)) {
        return tx.desc;
      }
      return "";
    },
    isCommissionTx(tx) {
      if (!tx || !tx.name) return false;
      const n = String(tx.name).toLowerCase();
      return (
        n.includes("residual") ||
        n.includes("generational") ||
        n.includes("closed") ||
        n.includes("affiliation") ||
        n.includes("ahorro") ||
        n.includes("bonus") ||
        !!this.txPersonName(tx)
      );
    },
    formatFullDate(val) {
      if (!val) return "—";
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    buildCycles(txs) {
      const map = new Map();
      for (const tx of txs) {
        const key   = tx.period_key || tx.period_label || this.fallbackPeriod(tx.date);
        const label = tx.period_label || tx.period_key || this.fallbackPeriod(tx.date);
        if (!map.has(key)) {
          map.set(key, { key, label, items: [], totalIn: 0, totalOut: 0, expanded: false, showAll: false });
        }
        const cycle = map.get(key);
        cycle.items.push(tx);
        if (tx.type === "in") cycle.totalIn += Number(tx.value || 0);
        else cycle.totalOut += Number(tx.value || 0);
      }
      return Array.from(map.values());
    },
    fallbackPeriod(dateStr) {
      const d = new Date(dateStr);
      return MONTHS[d.getMonth()] + " " + d.getFullYear();
    },
    toggleCycle(index) {
      const key = (this.search ? this.filteredCycles : this.cycles)[index].key;
      const ri  = this.cycles.findIndex(c => c.key === key);
      if (ri !== -1) this.$set(this.cycles[ri], "expanded", !this.cycles[ri].expanded);
    },
    showAllItems(index) {
      const key = (this.search ? this.filteredCycles : this.cycles)[index].key;
      const ri  = this.cycles.findIndex(c => c.key === key);
      if (ri !== -1) this.$set(this.cycles[ri], "showAll", true);
    },
    visibleItems(cycle) {
      const items = this.search ? cycle.filteredItems : cycle.items;
      return cycle.showAll ? items : items.slice(0, 5);
    },
    isVirtual(tx) {
      const v = tx && tx.virtual;
      return v === true || v === 1 || v === "true" || v === "1";
    },
    cycleItems(cycle) {
      return this.search ? cycle.filteredItems : cycle.items;
    },
    cycleAllVirtual(cycle) {
      const items = this.cycleItems(cycle);
      return items.length > 0 && items.every((tx) => this.isVirtual(tx));
    },
    cycleNetClass(cycle) {
      if (this.cycleAllVirtual(cycle)) return "net-pending";
      return "net-pos";
    },
    showPerson(tx) {
      return !!this.txPersonName(tx);
    },
    opLabel(name) {
      return OP_LABELS[name] || name || "";
    },
    onSearch() {},
    clearSearch() {
      this.search = "";
    },
    highlight(text) {
      if (!this.search || !text) return text;
      const q = this.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return text.replace(new RegExp(`(${q})`, "gi"), '<mark class="hl">$1</mark>');
    },
    cycleNet(cycle) {
      return this.cycleItems(cycle).reduce((s, t) => s + (t.type === "in" ? 1 : -1) * Number(t.value || 0), 0);
    },
    cycleIncome(cycle) {
      return this.cycleItems(cycle).reduce((s, t) => t.type === "in" ? s + Number(t.value || 0) : s, 0);
    },
  },
  filters: {
    day(val)   { return new Date(val).getDate(); },
    month(val) { return MONTHS[new Date(val).getMonth()]; },
  },
};
</script>

<style scoped>
/* ── Top ── */
.mov-top {
  padding: 4px 0 12px;
}
.mov-title {
  font-size: 26px;
  font-weight: 800;
  color: #111;
  margin: 0 0 4px;
  line-height: 1.2;
}
.mov-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* ── Search row ── */
.search-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 6px;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f7;
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 10px 14px;
  transition: border-color 0.2s, background 0.2s;
  min-width: 0;
}
.search-box.active {
  background: #fff;
  border-color: #e91e63;
}
.search-icon {
  width: 18px;
  height: 18px;
  color: #bbb;
  flex-shrink: 0;
  transition: color 0.2s;
}
.search-box.active .search-icon {
  color: #e91e63;
}
.search-texts {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.search-input {
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  padding: 0;
  line-height: 1.3;
}
.search-input::placeholder { color: transparent; }
.search-hint {
  font-size: 11.5px;
  color: #bbb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.search-clear {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.search-clear svg {
  width: 15px;
  height: 15px;
  color: #bbb;
}

/* Filtros button */
.btn-filtros {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #fce4ec;
  color: #e91e63;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.btn-filtros svg {
  width: 16px;
  height: 16px;
}

/* Search info */
.search-info {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
  padding-left: 2px;
}
.no-results { color: #e91e63; }

/* ── Skeleton ── */
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.skeleton-card {
  height: 66px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty ── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }

/* ── Cycles wrap ── */
.cycles-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 90px;
  margin-top: 8px;
}

/* ── Cycle card ── */
.cycle-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* ── Cycle header ── */
.cycle-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
  text-align: left;
}
.cycle-header.open {
  background: #fff0f5;
}

/* Calendar icon */
.cycle-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #fce4ec;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cycle-icon svg {
  width: 20px;
  height: 20px;
  stroke: #e91e63;
}
.cycle-icon--open {
  background: #e91e63;
}
.cycle-icon--open svg {
  stroke: #fff;
}

/* Cycle info */
.cycle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cycle-label {
  font-size: 15px;
  font-weight: 700;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cycle-count-text {
  font-size: 12px;
  color: #aaa;
  font-weight: 500;
}

/* Cycle right */
.cycle-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.cycle-net {
  font-size: 15px;
  font-weight: 700;
}
.net-pos { color: #2e7d32; }
.net-neg { color: #c62828; }
.net-pending { color: #c5c5c5; }
.chevron {
  width: 18px;
  height: 18px;
  color: #ccc;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}
.chevron.rotated { transform: rotate(180deg); }

/* ── Cycle body ── */
.cycle-body { padding-bottom: 4px; }

/* ── Transaction row ── */
.tx-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
  transition: background 0.15s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.tx-row:hover { background: #fafafa; }
.tx-row:active { background: #f5f5f5; }

/* Saldo no disponible: la fila completa queda desvanecida */
.tx-row--pending .tx-day,
.tx-row--pending .tx-name {
  color: #c5c5c5;
}
.tx-row--pending .tx-month,
.tx-row--pending .tx-person {
  color: #d4d4d4;
}
.tx-row--pending .tx-chip {
  opacity: 0.55;
}
.tx-row--pending .tx-desc {
  color: #ccc;
}
.tx-row--pending .tx-amount-pill {
  background: #f3f3f3;
  color: #c5c5c5;
}
.tx-row--pending .tx-chevron {
  color: #e4e4e4;
}
.tx-row--pending :deep(.hl) {
  background: #f3f3f3;
  color: #9a9a9a;
}

/* Date */
.tx-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 28px;
  flex-shrink: 0;
}
.tx-day {
  font-size: 18px;
  font-weight: 800;
  color: #111;
  line-height: 1;
}
.tx-month {
  font-size: 10px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

/* Info */
.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.tx-name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-person-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.tx-person-icon {
  width: 12px;
  height: 12px;
  color: #888;
  flex-shrink: 0;
}
.tx-person {
  font-size: 12.5px;
  font-weight: 500;
  color: #4a5568;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-meta-chips {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.tx-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  line-height: 1.3;
}
.tx-chip--level {
  background: #e0f2fe;
  color: #0369a1;
}
.tx-chip--pct {
  background: #fef3c7;
  color: #92400e;
}
.tx-chip--pr {
  background: #f1f5f9;
  color: #475569;
}
.tx-desc {
  font-size: 12px;
  color: #718096;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Amount pill */
.tx-amount-pill {
  font-size: 13px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 20px;
  flex-shrink: 0;
  white-space: nowrap;
}
.pill-in  { background: #e8f5e9; color: #2e7d32; }
.pill-out { background: #ffebee; color: #c62828; }

/* Row chevron */
.tx-chevron {
  width: 16px;
  height: 16px;
  color: #ddd;
  flex-shrink: 0;
}

/* ── Ver todos ── */
.btn-ver-todos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 14px 16px;
  background: none;
  border: none;
  border-top: 1.5px solid #f5f5f5;
  color: #e91e63;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}
.btn-ver-todos:active { background: #fce4ec; }
.ver-icon {
  width: 16px;
  height: 16px;
}

/* ── Slide transition ── */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
  max-height: 2000px;
}
.slide-enter,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Highlight búsqueda ── */
:deep(.hl) {
  background: #fff176;
  color: #111;
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 700;
}

/* ── Modal Detalle Movimiento ── */
.tx-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  -webkit-tap-highlight-color: transparent;
}
.tx-modal-card {
  background: #fff;
  border-radius: 20px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
@keyframes modalPop {
  0%   { transform: scale(0.94); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.tx-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.tx-modal-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.tx-modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #111;
  line-height: 1.25;
}
.tx-modal-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.badge-in { background: #e8f5e9; color: #2e7d32; }
.badge-out { background: #ffebee; color: #c62828; }
.badge-pending { background: #f3f4f6; color: #6b7280; }

.tx-modal-close {
  background: #f5f5f5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}
.tx-modal-close:hover { background: #eee; }

.tx-modal-amount-box {
  padding: 16px 20px;
  background: #fafafa;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.amount-in { color: #2e7d32; }
.amount-out { color: #c62828; }
.tx-modal-amount-sign { font-size: 26px; font-weight: 800; }
.tx-modal-amount-currency { font-size: 18px; font-weight: 700; }
.tx-modal-amount-val { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }

.tx-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tx-modal-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}
.tx-modal-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.tx-modal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
}
.tx-modal-label {
  color: #718096;
  font-weight: 500;
  flex-shrink: 0;
}
.tx-modal-val {
  color: #1a202c;
  text-align: right;
  word-break: break-word;
}
.font-semibold { font-weight: 700; }

.tx-modal-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 8px;
}
.pill-level { background: #e0f2fe; color: #0369a1; }
.pill-pct { background: #fef3c7; color: #92400e; }

.tx-modal-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid #f0f0f0;
}
.tx-modal-btn-close {
  width: 100%;
  padding: 12px;
  background: #e91e63;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.tx-modal-btn-close:active { opacity: 0.85; }

/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
