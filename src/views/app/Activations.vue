<template>
  <App :session="session" :title="title">
    <div v-cloak>
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando historial...</p>
      </div>
      
      <div v-else class="activations-bg">
        <h2 class="activations-title" v-if="!showMasterTrophy">
          Historial de operaciones
        </h2>
        <section>
          <div></div>
          <div>
            <h4 class="tabs">
              <router-link class="tab" to="/activation">
                <span class="tab-icon">🛒</span> Comprar
              </router-link>
            </h4>

            <div class="period-filter-wrap" v-if="activations && activations.length">
              <label class="period-filter-label" for="period-filter-select">Período</label>
              <select
                id="period-filter-select"
                class="period-filter-select"
                v-model="periodFilter"
              >
                <option value="">Todos (agrupado por mes)</option>
                <option
                  v-for="opt in periodOptions"
                  :key="opt.key"
                  :value="opt.key"
                >
                  {{ opt.label }} ({{ opt.key }})
                </option>
              </select>
            </div>

            <div class="scroll">
              <table class="activations-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Periodo</th>
                    <th>Detalle</th>
                    <th>Monto</th>
                    <th>Puntos</th>
                    <th>Voucher</th>
                    <th>Estado</th>
                    <th>Boleta</th>
                  </tr>
                </thead>
                <tbody v-if="periodFilter && !filteredActivations.length">
                  <tr>
                    <td colspan="9" class="activations-empty-msg">
                      No hay operaciones en este período.
                    </td>
                  </tr>
                </tbody>
                <tbody v-else-if="periodFilter">
                  <tr
                    v-for="activation in filteredActivations"
                    :key="activation.id"
                  >
                    <td>{{ activation.date | date }}</td>
                    <td>
                      <span
                        :class="[
                          'operation-type-chip',
                          activation.type === 'affiliation'
                            ? 'affiliation'
                            : 'activation',
                        ]"
                      >
                        {{
                          activation.type === "affiliation"
                            ? "Afiliación"
                            : "Recompra"
                        }}
                      </span>
                    </td>
                    <td>{{ periodLabel(activation) }}</td>
                    <td>
                      <div class="product-chips">
                        <span
                          v-if="
                            activation.type === 'affiliation' &&
                            activation.plan &&
                            activation.plan.name
                          "
                          class="product-chip affiliation-plan-chip"
                        >
                          {{ activation.plan.name }}
                        </span>
                        <span
                          v-for="product in activation.products"
                          v-if="product.total != 0"
                          class="product-chip"
                          :key="product.name"
                        >
                          {{ product.name }}
                          <span class="product-chip-total"
                            >x{{ product.total }}</span
                          >
                        </span>
                        <span
                          v-if="
                            activation.type === 'affiliation' &&
                            (!activation.products ||
                              !activation.products.length) &&
                            !(activation.plan && activation.plan.name)
                          "
                          class="product-chip affiliation-plan-chip"
                        >
                          Paquete de afiliación
                        </span>
                      </div>
                    </td>
                    <td>{{ activation.price | price }}</td>
                    <td>{{ activation.points }}</td>
                    <td>
                      <a
                        v-if="activation.voucher"
                        :href="activation.voucher"
                        target="_blank"
                      >
                        <img :src="activation.voucher" class="voucher-img" />
                      </a>
                      <span v-else class="no-voucher">—</span>
                    </td>
                    <td>
                      <span :class="['status-badge', activation.status]">
                        <span
                          v-if="activation.status === 'pending'"
                          class="status-icon"
                          >⏳</span
                        >
                        <span
                          v-else-if="activation.status === 'approved'"
                          class="status-icon"
                          >✔️</span
                        >
                        <span
                          v-else-if="activation.status === 'rejected'"
                          class="status-icon"
                          >❌</span
                        >
                        {{ activation.status | status }}
                      </span>
                    </td>
                    <td>
                      <router-link
                        :to="`/boleta?id=${activation.id}${activation.type === 'affiliation' ? '&type=affiliation' : ''}`"
                        class="invoice-link-btn"
                        v-if="activation.status == 'approved'"
                      >
                        <span class="invoice-icon">🧾</span> Boleta
                      </router-link>
                    </td>
                  </tr>
                </tbody>
                <template v-else>
                  <tbody
                    v-for="group in groupedActivations"
                    :key="group.key"
                  >
                    <tr class="period-group-header">
                      <td colspan="9">{{ group.label }}</td>
                    </tr>
                    <tr v-for="activation in group.items" :key="activation.id">
                      <td>{{ activation.date | date }}</td>
                      <td>
                        <span
                          :class="[
                            'operation-type-chip',
                            activation.type === 'affiliation'
                              ? 'affiliation'
                              : 'activation',
                          ]"
                        >
                          {{
                            activation.type === "affiliation"
                              ? "Afiliación"
                              : "Recompra"
                          }}
                        </span>
                      </td>
                      <td>{{ periodLabel(activation) }}</td>
                      <td>
                        <div class="product-chips">
                          <span
                            v-if="
                              activation.type === 'affiliation' &&
                              activation.plan &&
                              activation.plan.name
                            "
                            class="product-chip affiliation-plan-chip"
                          >
                            {{ activation.plan.name }}
                          </span>
                          <span
                            v-for="product in activation.products"
                            v-if="product.total != 0"
                            class="product-chip"
                            :key="product.name"
                          >
                            {{ product.name }}
                            <span class="product-chip-total"
                              >x{{ product.total }}</span
                            >
                          </span>
                          <span
                            v-if="
                              activation.type === 'affiliation' &&
                              (!activation.products ||
                                !activation.products.length)
                            "
                            class="product-chip affiliation-plan-chip"
                          >
                            Paquete de afiliación
                          </span>
                        </div>
                      </td>
                      <td>{{ activation.price | price }}</td>
                      <td>{{ activation.points }}</td>
                      <td>
                        <a
                          v-if="activation.voucher"
                          :href="activation.voucher"
                          target="_blank"
                        >
                          <img :src="activation.voucher" class="voucher-img" />
                        </a>
                        <span v-else class="no-voucher">—</span>
                      </td>
                      <td>
                        <span :class="['status-badge', activation.status]">
                          <span
                            v-if="activation.status === 'pending'"
                            class="status-icon"
                            >⏳</span
                          >
                          <span
                            v-else-if="activation.status === 'approved'"
                            class="status-icon"
                            >✔️</span
                          >
                          <span
                            v-else-if="activation.status === 'rejected'"
                            class="status-icon"
                            >❌</span
                          >
                          {{ activation.status | status }}
                        </span>
                      </td>
                      <td>
                        <router-link
                          :to="`/boleta?id=${activation.id}${activation.type === 'affiliation' ? '&type=affiliation' : ''}`"
                          class="invoice-link-btn"
                          v-if="activation.status == 'approved'"
                        >
                          <span class="invoice-icon">🧾</span> Boleta
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT;
console.log({ INVOICE_ROOT });

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      activations: null,
      // arr: [0,0,0],
      loading: true,
      INVOICE_ROOT,
      /** '' = todos (vista agrupada por mes); 'YYYY-MM' = solo ese período */
      periodFilter: "",
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    isMasterPlan() {
      return (
        this.$store && this.$store.state && this.$store.state.plan === "master"
      );
    },
    showMasterTrophy() {
      // Mostrar trofeo si el plan es master
      return this.isMasterPlan;
    },
    periodOptions() {
      if (!this.activations || !this.activations.length) return [];
      const keys = [
        ...new Set(
          this.activations.map((a) => this.periodKey(a)).filter(Boolean)
        ),
      ];
      keys.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      return keys.map((k) => ({
        key: k,
        label: this.monthLabelFromKey(k),
      }));
    },
    filteredActivations() {
      if (!this.activations || !this.periodFilter) return [];
      return this.activations.filter(
        (a) => this.periodKey(a) === this.periodFilter
      );
    },
    groupedActivations() {
      if (!this.activations || this.periodFilter) return [];
      const map = new Map();
      for (const a of this.activations) {
        const k = this.periodKey(a);
        if (!k) continue;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(a);
      }
      const keys = [...map.keys()].sort().reverse();
      return keys.map((k) => ({
        key: k,
        label: this.monthLabelFromKey(k),
        items: map.get(k).sort(
          (a, b) =>
            new Date(b.approved_at || b.date) - new Date(a.approved_at || a.date)
        ),
      }));
    },
  },
  methods: {
    periodKey(item) {
      if (item && item.period_key) return item.period_key;
      return this.periodKeyFromDate(item && item.date);
    },
    periodKeyFromDate(val) {
      if (!val) return "";
      const d = new Date(val);
      if (isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },
    periodLabel(item) {
      if (item && item.period_label) return item.period_label;
      if (!item || !item.date) return "-";
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return "-";
      const raw = d.toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric",
      });
      const normalized = raw.replace(/\s+de\s+/gi, " ").trim();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    },
    normalizeAffiliation(aff) {
      return {
        ...aff,
        date: aff.date || aff.createdAt,
        price: Number(aff.price || aff.amount || (aff.plan ? aff.plan.amount : 0)),
        points: Number(
          aff.points || (aff.plan ? aff.plan.affiliation_points : 0)
        ),
        voucher: aff.voucher || aff.voucher2 || null,
        type: "affiliation",
      };
    },
    mergeHistory(activationsList, affiliationsList) {
      const acts = (activationsList || []).map((a) => ({
        ...a,
        type: a.type || "activation",
      }));
      const affs = (affiliationsList || []).map((a) =>
        this.normalizeAffiliation(a)
      );
      const seen = new Set();
      const merged = [];
      for (const row of [...acts, ...affs]) {
        const key = `${row.type || "activation"}:${row.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(row);
      }
      return merged.sort(
        (a, b) =>
          new Date(b.approved_at || b.date) - new Date(a.approved_at || a.date)
      );
    },
    monthLabelFromKey(key) {
      const MONTHS_ES = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      if (!key || !/^\d{4}-\d{2}$/.test(key)) return key || "";
      const [y, m] = key.split("-").map(Number);
      return `${MONTHS_ES[m - 1] || ""} ${y}`;
    },
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
      // return new Date(val).toLocaleString()
    },
    period(val) {
      if (!val) return "-";
      const d = new Date(val);
      if (isNaN(d.getTime())) return "-";
      // Ej: "abril de 2026" (es-PE) -> "Abril 2026"
      const raw = d.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
      const normalized = raw.replace(/\s+de\s+/gi, " ").trim();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    },
    price(val) {
      return `S/. ${val}`;
    },
    status(val) {
      if (val == "pending") return "Pendiente";
      if (val == "approved") return "Aprobada";
      if (val == "rejected") return "Rechazada";
    },
  },
  async created() {
    try {
      const activationsRes = await api.Activations.GET(this.session);
      const data = activationsRes.data;

      if (data.error && data.msg == "invalid session")
        return this.$router.push("/login");
      if (data.error && data.msg == "unverified user")
        return this.$router.push("/verify");

      this.$store.commit("SET_NAME", data.name);
      this.$store.commit("SET_LAST_NAME", data.lastName);
      this.$store.commit("SET_AFFILIATED", data.affiliated);
      this.$store.commit("SET_ACTIVATED", data.activated);
      this.$store.commit("SET__ACTIVATED", data._activated);
      this.$store.commit("SET_PLAN", data.plan);
      this.$store.commit("SET_COUNTRY", data.country);
      this.$store.commit("SET_PHOTO", data.photo);
      this.$store.commit("SET_TREE", data.tree);

      let activationsList = data.activations || [];
      const hasAffiliations = activationsList.some(
        (a) => a.type === "affiliation"
      );

      if (!hasAffiliations) {
        try {
          const affiliationsRes = await api.Afiliation.GET(this.session);
          const affiliationsData = affiliationsRes.data || {};
          activationsList = this.mergeHistory(
            activationsList,
            affiliationsData.affiliations || []
          );
        } catch (affErr) {
          console.warn("No se pudieron cargar afiliaciones:", affErr);
        }
      }

      this.activations = activationsList;
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },
};
</script>


<style lang="stylus">
@import '../../assets/style/views/app/Activations.styl'
</style>
