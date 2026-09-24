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

          <!-- Balance neto + chevron -->
          <div class="cycle-right">
            <span class="cycle-net" :class="cycleNet(cycle) >= 0 ? 'net-pos' : 'net-neg'">
              {{ cycleNet(cycle) >= 0 ? '+' : '' }}{{ cycleNet(cycle).toFixed(2) }}
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
            >
              <!-- Fecha -->
              <div class="tx-date">
                <span class="tx-day">{{ tx.date | day }}</span>
                <span class="tx-month">{{ tx.date | month }}</span>
              </div>

              <!-- Info -->
              <div class="tx-info">
                <span class="tx-name" v-html="highlight(opLabel(tx.name))"></span>
                <span class="tx-person" v-if="showPerson(tx)" v-html="highlight(tx.user_name)"></span>
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
  "objetive": "Bono Logro",
  "points": "Bono Compras",
  "affiliation": "Afiliación con saldo",
  "activation": "Compra con saldo",
  "affiliation bonus": "Bono por afiliación",
  "migration bonus": "Bono por migración",
  "wallet transfer": "Monedero brillante",
  "remaining": "Pago Ganancia",
  "closed bonus": "Bono cierre",
  "activation bonnus promo": "Bono compra promoción",
  "closed reset": "Descuento por cierre",
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
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    filteredCycles() {
      if (!this.search.trim()) return this.cycles;
      const q = this.search.trim().toLowerCase();
      return this.cycles
        .map(cycle => {
          const filtered = cycle.items.filter(tx => {
            const op     = (OP_LABELS[tx.name] || tx.name || '').toLowerCase();
            const person = (tx.user_name || '').toLowerCase();
            const period = (cycle.label || '').toLowerCase();
            return op.includes(q) || person.includes(q) || period.includes(q);
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
    showPerson(tx) {
      return tx.user_name && !NO_PERSON_OPS.has(tx.name);
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
      const items = this.search ? cycle.filteredItems : cycle.items;
      return items.reduce((s, t) => s + (t.type === "in" ? 1 : -1) * Number(t.value || 0), 0);
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
}
.tx-row:active { background: #fafafa; }

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
.tx-person {
  font-size: 12px;
  color: #999;
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
</style>
