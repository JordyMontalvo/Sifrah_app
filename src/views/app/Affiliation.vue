
<template>
  <App :session="session" :office_id="office_id" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <div
      v-if="affiliation && affiliation.status === 'pending'"
      class="affiliation-bg"
      style="position: relative; min-height: 80vh"
    >
      <transition name="fade">
        <div class="pending-modal-local">
          <div class="pending-modal-content-block">
            <span class="pending-modal-icon-block">
              <!-- Reloj de arena animado SVG -->
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="hourglass-anim"
              >
                <g>
                  <rect
                    x="16"
                    y="8"
                    width="32"
                    height="48"
                    rx="8"
                    fill="#fffbe6"
                    stroke="#ff9800"
                    stroke-width="3"
                  />
                  <path
                    d="M20 12 Q32 32 44 12"
                    stroke="#ff9800"
                    stroke-width="3"
                    fill="none"
                  />
                  <path
                    d="M20 52 Q32 32 44 52"
                    stroke="#ff9800"
                    stroke-width="3"
                    fill="none"
                  />
                  <ellipse
                    class="sand-top"
                    cx="32"
                    cy="20"
                    rx="7"
                    ry="4"
                    fill="#ff9800"
                  />
                  <ellipse
                    class="sand-bottom"
                    cx="32"
                    cy="44"
                    rx="7"
                    ry="4"
                    fill="#ff9800"
                    opacity="0.2"
                  />
                  <rect
                    class="sand-flow"
                    x="30.5"
                    y="20"
                    width="3"
                    height="24"
                    rx="1.5"
                    fill="#ff9800"
                  />
                </g>
              </svg>
            </span>
            <h3>¡Solicitud enviada!</h3>
            <p>Tu afiliación está pendiente de aprobación.</p>
          </div>
        </div>
      </transition>
    </div>
    <div
      v-else
      class="affiliation-bg"
      style="position: relative; min-height: 80vh"
    >
                    <h2 class="affiliation-title" v-if="!showMasterTrophy">
         Afíliate y elige tu kit
       </h2>
       
       <!-- Mensaje que aparece cuando se redirige desde opciones bloqueadas -->
       <div v-if="showRedirectMessage" class="affiliation-notification">
         <div class="affiliation-notification-content">
           <div class="affiliation-notification-header">
             <i class="fas fa-star" style="color: #ffd700; margin-right: 10px;"></i>
             <span style="font-weight: bold; font-size: 16px;">¡Desbloquea tu potencial!</span>
           </div>
           <div class="affiliation-notification-body">
             Afíliate ahora y accede a todas las funcionalidades
           </div>
         </div>
       </div>
        
       
        
        <section v-if="!loading">
        <div v-if="showMasterTrophy">
          <div class="master-trophy-container">
            <img
              class="master-trophy-img"
              src="https://ik.imagekit.io/asu/sifrah/Trofeo%20sifrah_sIeu2fnie.png"
            />
            <h2 class="master-trophy-title">¡Felicidades!</h2>
            <p class="master-trophy-msg">
              Has alcanzado el nivel
              <span class="master-trophy-master">MASTER</span>
            </p>
            <button
              class="main-action-btn master-trophy-btn"
              @click="$router.push('/')"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
        <div v-else>
          <div v-if="upgradeMode" class="affiliation-alert">
            <b>Estás realizando un UPGRADE de plan.</b><br />
            Solo puedes elegir <b>{{ maxUpgradeProducts }}</b> productos
            adicionales.<br />
            Solo pagarás la diferencia: <b>S/. {{ upgradeDifference }}</b> y
            obtendrás <b>{{ upgradePoints }}</b> puntos extra.
          </div>
          <!-- Paso 1: Selección de productos -->
          <div v-if="step === 1">
            <div class="card-section plan-section">
              <h4 class="section-title">1. Selecciona tu plan</h4>
              <select class="input input-lg" v-model="selec_plan">
                <option v-for="plan in plans" :value="plan">
                  {{ plan.name }}
                </option>
              </select>
              <div class="plan-info">
                <span class="plan-amount">S/. {{ selec_plan.amount }}</span>
                <span class="plan-points"
                  >{{ selec_plan.affiliation_points }} PTS</span
                >
                <span class="plan-kit">Kit: S/. {{ selec_plan.kit }}</span>
              </div>
            </div>
            <div class="catalog-section">
              <h4 class="section-title">2. Elige tus productos</h4>
              <div
                v-for="category in categories"
                :key="category"
                class="category-block"
              >
                <h5 class="category-title">{{ category }}</h5>
                <div class="product-grid">
                  <div
                    class="product-card-modern"
                    v-for="(product, i) in upgradeMode
                      ? upgradeProducts
                      : products"
                    v-if="
                      product.type === category &&
                      product.plans &&
                      product.plans[selec_plan.id] &&
                      Object.values(product.plans).some((plan) => plan === true)
                    "
                    :key="product.id || product.name"
                  >
                    <div class="product-img-modern-wrap">
                      <img
                        :src="product.img"
                        :alt="product.name"
                        class="product-img-modern"
                      />
                    </div>
                    <div class="product-info-modern">
                      <span class="product-name-modern">{{
                        product.name
                      }}</span>
                    </div>
                    <div class="product-controls-modern">
                      <button class="qty-btn" @click="less(i)">-</button>
                      <span class="product-qty-modern">{{
                        product.total
                      }}</span>
                      <button
                        class="qty-btn"
                        @click="more(i)"
                        :disabled="
                          upgradeMode
                            ? totalUpgradeProducts +
                                (Number(product.weight) || 1) >
                              maxUpgradeProducts
                            : false
                        "
                      >
                        +
                      </button>
                      <span v-if="upgradeMode" class="max-info"
                        >/ {{ product.max }} máx.</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Resumen sticky -->
            <div
              class="sticky-summary"
              :class="{
                show: (upgradeMode ? totalUpgradeProducts : total) > 0,
              }"
            >
              <div class="sticky-summary-content">
                <div class="sticky-products">
                  <div
                    v-for="product in upgradeMode ? upgradeProducts : products"
                    v-if="product.total > 0"
                    class="sticky-product-item"
                  >
                    <img
                      v-if="product.img"
                      :src="product.img"
                      :alt="product.name"
                      class="sticky-product-img"
                    />
                    <span class="sticky-product-name"
                      >{{ product.total }} x {{ product.name }}</span
                    >
                  </div>
                </div>
                <div class="sticky-summary-total">
                  <span>Total:</span>
                  <span class="sticky-total-amount"
                    >S/.
                    {{
                      upgradeMode ? upgradeDifference : selec_plan.amount
                    }}</span
                  >
                </div>
                <small v-if="selectError" class="error-message">{{
                  selectError
                }}</small>
                <small
                  v-if="
                    (upgradeMode ? totalUpgradeProducts : total) !==
                      (upgradeMode
                        ? maxUpgradeProducts
                        : selec_plan.max_products) &&
                    (upgradeMode
                      ? maxUpgradeProducts
                      : selec_plan.max_products) > 0
                  "
                  class="info-message"
                >
                  <template
                    v-if="
                      (upgradeMode ? totalUpgradeProducts : total) <
                      (upgradeMode
                        ? maxUpgradeProducts
                        : selec_plan.max_products)
                    "
                  >
                    Te faltan
                    {{
                      (upgradeMode
                        ? maxUpgradeProducts
                        : selec_plan.max_products) -
                      (upgradeMode ? totalUpgradeProducts : total)
                    }}
                    producto<span
                      v-if="
                        (upgradeMode
                          ? maxUpgradeProducts
                          : selec_plan.max_products) -
                          (upgradeMode ? totalUpgradeProducts : total) >
                        1
                      "
                      >s</span
                    >
                    para completar tu selección.
                  </template>
                  <template v-else>
                    Has seleccionado
                    {{
                      (upgradeMode ? totalUpgradeProducts : total) -
                      (upgradeMode
                        ? maxUpgradeProducts
                        : selec_plan.max_products)
                    }}
                    producto<span
                      v-if="
                        (upgradeMode ? totalUpgradeProducts : total) -
                          (upgradeMode
                            ? maxUpgradeProducts
                            : selec_plan.max_products) >
                        1
                      "
                      >s</span
                    >
                    de más.
                  </template>
                </small>
                <button
                  class="main-action-btn sticky-btn"
                  :disabled="
                    (upgradeMode ? totalUpgradeProducts : total) !==
                    (upgradeMode ? maxUpgradeProducts : selec_plan.max_products)
                  "
                  @click="handleGoToStep2"
                >
                  Afiliarme
                </button>
              </div>
            </div>
            <!-- Botón Afiliarme solo para móvil, antes de boletas -->
            <div
              v-if="
                step === 1 &&
                (upgradeMode ? totalUpgradeProducts : total) ===
                  (upgradeMode ? maxUpgradeProducts : selec_plan.max_products)
              "
              class="afiliarme-mobile-btn"
            >
              <button class="main-action-btn" @click="handleGoToStep2">
                <span class="fab-icon">🤝</span>
                Afiliarme
              </button>
            </div>
          </div>
          <!-- Paso 2: Datos de pago y confirmación -->
          <div v-else-if="step === 2">
            <div class="card-section confirm-section">
              <h4 class="section-title">Confirma tu afiliación</h4>
              <div class="summary-section confirm-summary">
                <div
                  v-for="product in upgradeMode ? upgradeProducts : products"
                  v-if="product.total > 0"
                  class="summary-item"
                >
                  <img
                    v-if="product.img"
                    :src="product.img"
                    :alt="product.name"
                    class="summary-img"
                  />
                  <span class="summary-product-name"
                    >{{ product.total }} x {{ product.name }}</span
                  >
                </div>
                <div class="summary-total">
                  <span>Total productos:</span>
                  <span
                    >{{ upgradeMode ? maxUpgradeProducts : total }} /
                    {{
                      upgradeMode ? maxUpgradeProducts : selec_plan.max_products
                    }}</span
                  >
                </div>
                <div class="summary-total">
                  <span>Total a pagar:</span>
                  <span
                    >S/. {{ upgradeMode ? upgradeDifference : remaining }}</span
                  >
                </div>
                <div class="summary-total" v-if="upgradeMode">
                  <span>Puntos extra:</span>
                  <span>{{ upgradePoints }}</span>
                </div>
              </div>
              <div class="pay-section">
                <h5 class="section-title">Oficina y método de pago</h5>
                <select class="input input-lg" v-model="office">
                  <option value="null" disabled>Oficina</option>
                  <option v-for="office in offices" :value="office">
                    {{ office.name }}
                  </option>
                </select>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="check" />
                  <small>Deseo usar mi saldo</small>
                </label>
                <div v-if="!check" class="balance-info">
                  <small>Saldo no disponible: S/. {{ _balance }}</small
                  ><br />
                  <small>Saldo disponible: S/. {{ balance }}</small
                  ><br />
                </div>
                <div class="pay-methods">
                  <small>Medio de Pago</small><br />
                  <label class="radio-label">
                    <input type="radio" :value="'bank'" v-model="pay_method" />
                    <small>Banco</small>
                  </label>
                  <label class="radio-label">
                    <input type="radio" :value="'cash'" v-model="pay_method" />
                    <small>Efectivo</small>
                  </label>
                  <!-- <button
                    class="main-action-btn mp-btn"
                    @click="pagarConMercadoPago"
                    style="margin-top:10px; display: flex; align-items: center; gap: 10px;"
                  >
                    <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.22.6/mercadopago/logo__large.png"
                         alt="Mercado Pago" style="height: 24px; vertical-align: middle;" />
                    Pagar con Mercado Pago
                  </button> -->
                </div>
                <div v-if="pay_method == 'bank'" class="bank-fields">
                  <input
                    class="input input-lg"
                    v-model="bank"
                    placeholder="Banco"
                  />
                  <input
                    class="input input-lg"
                    v-model="date"
                    placeholder="Fecha"
                    type="date"
                  />
                  <input
                    class="input input-lg"
                    v-model="voucher_number"
                    placeholder="Número de Voucher"
                    oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                  />
                  <label class="voucher-label">
                    <span class="input" v-show="!voucher"
                      >Comprobante de pago</span
                    >
                    <img class="voucher" v-show="voucher" :src="voucher" />
                    <input type="file" @change="change" :disabled="pending" />
                  </label>
                </div>
              </div>
              <div class="action-section">
                <small v-if="error" class="error-message"
                  >{{ error }}<br
                /></small>
                <button class="main-action-btn" v-show="!sending" @click="POST">
                  Confirmar afiliación
                </button>
                <button
                  class="main-action-btn sending"
                  v-show="sending"
                  disabled
                >
                  Enviando Voucher ...
                </button>
                <button class="main-action-btn back-btn" @click="goToStep(1)">
                  Volver
                </button>
                <small v-if="pending" class="success"
                  >pendiente de aprobación</small
                >
              </div>
            </div>
          </div>
          <!-- Boletas -->
          <div class="card-section invoices-section">
            <div
              v-for="(affiliation, i) in affiliations"
              :key="affiliation.id"
              class="invoice-history-block"
            >
              <a
                :href="`${INVOICE_ROOT}?id=${affiliation.id}`"
                target="_blank"
                class="invoice-link"
              >
                Boleta {{ i + 1 }}
                <span v-if="affiliation.type === 'upgrade'" class="tag-upgrade"
                  >Upgrade</span
                >
              </a>
              <div
                v-if="affiliation.type === 'upgrade'"
                class="upgrade-details-block"
              >
                <div><b>Upgrade de plan</b></div>
                <div>
                  Plan anterior:
                  <b>{{
                    affiliation.previousPlan && affiliation.previousPlan.name
                  }}</b>
                </div>
                <div>
                  Diferencia pagada:
                  <b
                    >S/
                    {{
                      affiliation.difference && affiliation.difference.amount
                    }}</b
                  >
                </div>
                <div>
                  Productos adicionales:
                  <span
                    v-if="
                      affiliation.difference && affiliation.difference.products
                    "
                  >
                    {{
                      affiliation.difference.products
                        .filter((p) => p.total > 0)
                        .map((p) => `${p.total} ${p.name}`)
                        .join(", ")
                    }}
                  </span>
                  <span v-else>N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";
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
      loading: true,
      sending: false,

      plans: null,
      selec_plan: null,
      voucher: null,
      voucher_file: null,
      office: null,
      offices: null,

      pay_method: null,

      pending: false,
      congrats: false,

      check: false,
      INVOICE_ROOT,

      step: 1, // 1: selección, 2: confirmación

      tab: null,
      products: null,
      product: null,

      error: null,

      bank: null,
      date: null,
      voucher_number: null,
      selectError: "",
      showPendingModal: false,
      upgradeMode: false,
      previousPlan: null,
      previousProducts: [],
      maxUpgradeProducts: 0,
      upgradeDifference: 0,
      upgradePoints: 0,
      upgradeProducts: [],
             affiliation: null,
       showRedirectMessage: false, // Controla si mostrar el mensaje de redirección
     };
   },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    plan() {
      return this.$store.state.plan;
    },
    affiliated() {
      return this.$store.state.affiliated;
    },

    categories() {
      if (!this.products) return [];
      // Filtrar productos que están en algún plan
      const productsWithPlans = this.products.filter(
        (product) =>
          product.plans &&
          Object.values(product.plans).some((plan) => plan === true)
      );
      return productsWithPlans
        .map((x) => x.type)
        .filter((v, i, self) => i == self.indexOf(v));
    },
    title() {
      return "Productos";
    },
    total() {
      if (!this.products) return 0;
      const weightTotal = this.products.reduce(
        (a, b) => a + (b.weight > 0 ? (b.total || 0) * b.weight : 0),
        0
      );
      return Math.ceil(weightTotal);
    },

    remaining() {
      if (!this.selec_plan) return 0;

      let ret = this.selec_plan.amount || 0;

      // balance
      ret -= this._balance || 0;

      if (ret < 0) ret = 0;

      if (ret == 0) return ret;

      // _balance
      ret -= this.balance || 0;

      if (ret < 0) ret = 0;

      return ret;
    },

    text() {
      if (!this.selec_plan) return "";
      return `S/. ${this.selec_plan.amount || 0} / ${
        this.selec_plan.affiliation_points || 0
      } PTS`;
    },

    totalPrice() {
      if (!this.products) return 0;
      return this.products.reduce(
        (a, b) => a + (b.total || 0) * (b.price || 0),
        0
      );
    },
    isMasterPlan() {
      return this.selec_plan && this.selec_plan.id === "master";
    },
    isMasterPlanApproved() {
      // Trofeo solo si la afiliación fue aprobada como master o el usuario ya es master
      return (
        (this.affiliation &&
          this.affiliation.plan &&
          this.affiliation.plan.id === "master" &&
          this.affiliation.status === "approved") ||
        this.plan === "master"
      );
    },
    showMasterTrophy() {
      // Mostrar trofeo solo si la afiliación master fue aprobada o el usuario ya es master
      return this.isMasterPlanApproved;
    },
    totalUpgradeProducts() {
      // Total de peso seleccionados en upgrade
      return this.upgradeProducts.reduce(
        (a, b) => a + (Number(b.total) || 0) * (Number(b.weight) || 1),
        0
      );
    },
  },
  watch: {
    selec_plan() {
      if (!this.selec_plan) return;
      this.reset_totals();
      this.checkUpgradeMode();
    },
  },
  async created() {
    try {
      // GET data
      const { data } = await api.Afiliation.GET(this.session);
      console.log("API Response:", data);

      this.loading = false;

      // error
      if (data.error && data.msg == "invalid session") {
        this.$router.push("/login");
        return;
      }

      // success
      this.$store.commit("SET_NAME", data.name);
      this.$store.commit("SET_LAST_NAME", data.lastName);
      this.$store.commit("SET_AFFILIATED", data.affiliated);
      this.$store.commit("SET_ACTIVATED", data.activated);
      this.$store.commit("SET__ACTIVATED", data._activated);
      this.$store.commit("SET_PLAN", data.plan);
      this.$store.commit("SET_COUNTRY", data.country);
      this.$store.commit("SET_PHOTO", data.photo);
      this.$store.commit("SET_TREE", data.tree);

      // Usar directamente los planes que llegan del backend
      this.plans = data.plans || [];
      if (this.plans.length > 0) {
        this.selec_plan = this.plans[0];
      }

      // Initialize products with proper structure
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products.map((product) => ({
          ...product,
          total: 0,
          plans: product.plans || {
            basic: false,
            standard: false,
            master: false,
          },
        }));

        if (this.products.length > 0) {
          this.product = this.products[0];
          // Set initial tab if categories exist
          if (this.categories && this.categories.length > 0) {
            this.tab = this.categories[0];
          }
        }
      } else {
        console.error("No products data received or invalid format");
        this.products = [];
      }

      this.balance = data.balance || 0;
      this._balance = data._balance || 0;
      this.offices = data.offices || [];
      this.affiliation = data.affiliation || null;
      this.affiliations = data.affiliations || [];

      // Set congrats state
      if (
        this.plan == "master" ||
        (this.affiliation &&
          this.affiliation.plan.id == "master" &&
          this.affiliation.status == "approved")
      ) {
        this.congrats = true;
      }

             // Set pending state
       if (this.affiliation && this.affiliation.status == "pending") {
         this.pending = true;
       }
       
       // Verificar si viene de una redirección desde opciones bloqueadas
       if (this.$route.query.redirected === 'true') {
         this.showRedirectMessage = true;
         // El mensaje desaparece automáticamente después de 4 segundos
         setTimeout(() => {
           this.showRedirectMessage = false;
         }, 4000);
       }
    } catch (error) {
      console.error("Error loading data:", error);
      this.loading = false;
    }
  },

  methods: {
    reset_totals() {
      this.products.forEach((p) => {
        p.total = 0;
      });
    },

    touch(i) {
      this.product = this.products[i];
    },

    checkUpgradeMode() {
      if (
        this.affiliation &&
        this.affiliation.status === "approved" &&
        this.selec_plan &&
        this.selec_plan.amount > this.affiliation.plan.amount
      ) {
        this.upgradeMode = true;
        this.previousPlan = this.affiliation.plan;
        this.previousProducts = this.affiliation.products || [];
        this.maxUpgradeProducts =
          this.selec_plan.max_products - (this.previousPlan.max_products || 0);
        this.upgradeDifference =
          this.selec_plan.amount - this.previousPlan.amount;
        this.upgradePoints =
          (this.selec_plan.affiliation_points || 0) -
          (this.previousPlan.affiliation_points || 0);
        // No máximo individual, solo el global
        this.upgradeProducts = this.products.map((p) => ({ ...p, total: 0 }));
      } else {
        this.upgradeMode = false;
        this.previousPlan = null;
        this.previousProducts = [];
        this.maxUpgradeProducts = this.selec_plan.max_products;
        this.upgradeDifference = this.selec_plan.amount;
        this.upgradePoints = this.selec_plan.affiliation_points;
        this.upgradeProducts = this.products.map((p) => ({
          ...p,
          max: p.max,
          total: 0,
        }));
      }
    },
    more(idx) {
      if (this.upgradeMode) {
        const product = this.upgradeProducts[idx];
        const nextTotal =
          this.totalUpgradeProducts + (Number(product.weight) || 1);
        if (nextTotal > this.maxUpgradeProducts) return;
        this.upgradeProducts[idx].total += 1;
      } else {
        const product = this.products[idx];
        const productWeight = Number(product.weight);
        if (isNaN(productWeight) || productWeight <= 0) return;
        const currentTotal = this.products.reduce(
          (a, b) => a + (Number(b.total) || 0) * Number(b.weight || 1),
          0
        );
        const newTotal = currentTotal + productWeight;
        if (newTotal > this.selec_plan.max_products) return;
        product.total += 1;
      }
    },
    less(idx) {
      if (this.upgradeMode) {
        if (this.upgradeProducts[idx].total > 0) {
          this.upgradeProducts[idx].total -= 1;
        }
      } else {
        const product = this.products[idx];
        if (product.total == 0) return;
        product.total -= 1;
      }
    },

    change(e) {
      this.voucher_file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.voucher = e.target.result;
      };

      reader.readAsDataURL(this.voucher_file);
    },

    async POST() {
      let products = this.upgradeMode ? this.upgradeProducts : this.products;
      let plan = this.selec_plan;
      let voucher = this.voucher;
      let office = this.office;
      let check = this.check;
      let pay_method = this.pay_method;
      let bank = this.bank;
      let date = this.date;
      let voucher_number = this.voucher_number;

      // Validación de productos y oficina
      if (!products.some(p => p.total > 0)) {
        this.error = "Seleccione productos";
        return;
      }
      if (!office) {
        this.error = "Seleccione oficina";
        return;
      }

      // Lógica de saldo y método de pago
      const saldoTotal = (this.balance || 0) + (this._balance || 0);
      const totalPagar = this.upgradeMode ? this.upgradeDifference : (this.selec_plan ? this.selec_plan.amount : 0);
      const restante = check ? totalPagar - saldoTotal : totalPagar;
      const saldoCubreTodo = check && saldoTotal >= totalPagar;
      const saldoParcial = check && saldoTotal < totalPagar && saldoTotal > 0;
      const noSaldo = !check;

      if (saldoCubreTodo) {
        // No requiere método de pago
        pay_method = null;
      } else if (saldoParcial || noSaldo) {
        if (!pay_method) {
          this.error = saldoParcial
            ? "El saldo no cubre el total, seleccione un método de pago para el restante."
            : "Seleccione un método de pago.";
          return;
        }
        // Validaciones adicionales para banco
        if (pay_method == "bank") {
          if (!bank) {
            this.error = "Nombre de banco";
            return;
          }
          if (!date) {
            this.error = "Fecha de voucher";
            return;
          }
          if (!voucher_number) {
            this.error = "Número de voucher";
            return;
          }
          if (!voucher) {
            this.error = "Voucher de pago";
            return;
          }
        }
      }

      this.error = null;
      this.sending = true;

      if (voucher)
        voucher = await lib.upload(
          this.voucher_file,
          this.voucher_file.name,
          "affiliations"
        );

      const { data } = await api.Afiliation.POST(this.session, {
        products,
        plan,
        voucher,
        office: office.id,
        check,
        pay_method,
        bank,
        date,
        voucher_number,
      });
      console.log({ data });

      this.sending = false;
      this.pending = true;
      this.affiliation = {
        plan: this.selec_plan,
        products: this.products,
        status: "pending",
      };
      // MODAL bonito de pendiente de aprobación y redirección
      this.showPendingModal = true;
      setTimeout(() => {
        this.showPendingModal = false;
        this.step = 1;
      }, 2000);
    },
    goToStep(n) {
      this.step = n;
    },
    handleGoToStep2() {
      if (this.upgradeMode) {
        const total = this.totalUpgradeProducts;
        if (total !== this.maxUpgradeProducts) {
          this.selectError = `Debes seleccionar exactamente ${this.maxUpgradeProducts} productos adicionales para tu upgrade (considerando el peso de cada producto).`;
          return;
        }
      } else {
        if (this.total !== this.selec_plan.max_products) {
          this.selectError = `Debes seleccionar exactamente ${this.selec_plan.max_products} productos para continuar.`;
          return;
        }
      }
      this.selectError = "";
      this.goToStep(2);
    },
    // async pagarConMercadoPago() {
    //   try {
    //     const response = await api.mercadopagoPreference({
    //       description: `Afiliación ${this.selec_plan ? this.selec_plan.name : ''}`,
    //       price: this.upgradeMode ? this.upgradeDifference : this.selec_plan.amount,
    //       quantity: 1,
    //       payer_email: "test_user_116744135@testuser.com" // email de test comprador
    //     });
    //     const data = response.data;
    //     if (data.ok && data.data && data.data.init_point) {
    //       window.location.href = data.data.init_point;
    //     } else {
    //       this.error = data.msg || "Error al iniciar pago con Mercado Pago";
    //     }
    //   } catch (err) {
    //     this.error = err.message || "Error al conectar con Mercado Pago";
    //   }
    // },
  },
};
</script>

<style lang="stylus">
/* Estilos para el mensaje verde de afiliación */
.affiliation-notification
  background linear-gradient(135deg, #4CAF50, #45a049)
  color white
  padding 20px
  border-radius 12px
  position fixed
  top 20px
  right 20px
  z-index 9999
  box-shadow 0 8px 25px rgba(0, 0, 0, 0.2)
  animation slideInFromRight 0.5s ease-out
  max-width 350px
  text-align left
  font-family Arial, sans-serif
  
.affiliation-notification-content
  position relative
  
.affiliation-notification-header
  margin-bottom 10px
  font-size 16px
  display flex
  align-items center
  justify-content flex-start
  
.affiliation-notification-body
  font-size 14px
  line-height 1.4
  margin-bottom 15px
  opacity 0.9
  
@keyframes slideInFromTop
  from
    opacity 0
    transform translateY(-20px)
  to
    opacity 1
    transform translateY(0)

@keyframes slideInFromRight
  from
    opacity 0
    transform translateX(50px)
  to
    opacity 1
    transform translateX(0)

.affiliation-bg
  min-height 100vh
  padding-bottom 80px

.affiliation-title
  text-align center
  font-size 2.2rem
  font-weight 700
  color #ff9800
  margin 32px 0 18px 0
  letter-spacing 1px

.plan-section
  margin-bottom 32px
  background #fff
  border-radius 18px
  box-shadow 0 2px 12px rgba(0,0,0,0.07)
  padding 28px 24px 18px 24px
  max-width 600px
  margin-left auto
  margin-right auto

.plan-info
  display flex
  gap 18px
  margin-top 10px
  font-size 18px
  color #a05a2c
  font-weight 700

.plan-amount
  color #ff9800
  font-weight 800
  font-size 20px

.plan-points
  color #a05a2c
  font-weight 700
  font-size 18px

.plan-kit
  color #a05a2c
  font-weight 700
  font-size 18px

.catalog-section
  margin-bottom 32px
  max-width 1100px
  margin-left auto
  margin-right auto

.product-grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(220px, 1fr))
  gap 28px
  margin-top 18px

.product-card-modern
  background: linear-gradient(135deg, #fff8e1 80%, #ffe0b2 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(255,152,0,0.10);
  padding: 22px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  border: 1.5px solid #ffe0b2;
  &:hover
    box-shadow: 0 8px 32px rgba(255,152,0,0.18);
    transform: translateY(-4px) scale(1.04);
    border-color: #ffb74d;

.product-img-modern-wrap
  width 110px
  height 110px
  display flex
  align-items center
  justify-content center
  margin-bottom 12px

.product-img-modern
  width 100px
  height 100px
  object-fit cover
  border-radius 16px
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  background #fff
  border 2px solid #fff3e0
  transition transform 0.2s
  &:hover
    transform scale(1.08)

.product-info-modern
  text-align center
  margin-bottom 10px

.product-name-modern
  color: #a05a2c;
  font-weight: 700;

.product-controls-modern
  display flex
  align-items center
  gap 10px
  margin-top 8px

.qty-btn
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  &:hover
    background: #fb8c00;

.product-qty-modern
  color: #a05a2c;
  font-weight: 700;

.sticky-summary
  position fixed
  left 0
  right 0
  bottom 0
  background #fff
  box-shadow 0 -2px 16px rgba(255,152,0,0.13)
  border-radius 18px 18px 0 0
  padding 18px 24px 12px 24px
  z-index 1003
  display none
  opacity 0
  pointer-events none
  transition opacity 0.3s
  @media (min-width: 900px)
    width 340px
    right 0px
    left auto
    top -25px
    bottom auto
    border-radius 18px
    position absolute
    display block
    opacity 1
    pointer-events auto
  &.show
    display block
    opacity 1
    pointer-events auto

.sticky-summary-content
  display flex
  flex-direction column
  gap 10px

.sticky-products
  display flex
  flex-wrap wrap
  gap 12px
  margin-bottom 8px

.sticky-product-item
  display flex
  align-items center
  gap 7px
  background #fff8e1
  border-radius 8px
  padding 4px 10px
  font-size 15px
  color #444

.sticky-product-img
  width 24px
  height 24px
  object-fit cover
  border-radius 6px
  border 1.5px solid #ff9800

.sticky-summary-total
  display flex
  justify-content space-between
  font-weight 600
  color #ff9800
  font-size 18px
  margin-top 4px

.sticky-total-amount
  font-size 1.1rem
  font-weight 700

.sticky-btn
  margin-top 8px
  font-size 1.1rem
  padding 10px 0

.confirm-section
  max-width 600px
  margin-left auto
  margin-right auto
  background: linear-gradient(135deg, #fffbe6 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,152,0,0.10);
  padding: 28px 24px 18px 24px;

.confirm-summary
  margin-bottom 18px

.back-btn
  background #fff3e0
  color #ff9800
  border 1.5px solid #ff9800
  margin-top 10px
  &:hover
    background #ff9800
    color #fff

._img
  width 100%
  max-width 600px

._plan
  max-width 400px
  margin 8px 0

._product
  max-width 240px
  margin 8px 0
  max-height 240px

._strong
  font-weight 600

.card-section,
.confirm-section,
.summary-section {
  background: linear-gradient(135deg, #fffbe6 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,152,0,0.10);
  padding: 28px 24px 18px 24px;
  margin-bottom: 28px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  border: 1.5px solid #ffe0b2;
}

.section-title
  font-size: 20px;
  font-weight: 700;
  color: #a05a2c;
  margin-bottom: 18px;
  letter-spacing: 0.5px;

.input-lg
  font-size 17px
  padding 10px 14px
  border-radius 8px
  border 1px solid #e0e0e0
  margin-bottom 12px
  margin-top 6px
  width 100%
  box-sizing border-box

.product-tabs
  display flex
  gap 10px
  margin-bottom 18px

.product-tab
  padding 7px 18px
  border-radius 18px
  background #fff3e0
  color #ff9800
  font-weight 500
  font-size 15px
  cursor pointer
  border 1.5px solid #ff9800
  transition background 0.2s, color 0.2s
  &.selected
    background #ff9800
    color #fff

.product-list
  display flex
  flex-wrap wrap
  gap 18px
  margin-bottom 18px

.product-img-wrap
  width 100%
  display flex
  justify-content center
  margin-bottom 10px

.product-img
  width 80px
  height 80px
  object-fit cover
  border-radius 16px
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  background #fff
  border 2px solid #fff3e0
  transition transform 0.2s
  &:hover
    transform scale(1.08)

.product-card
  background #fff8e1
  border-radius 16px
  box-shadow 0 4px 16px rgba(255,152,0,0.10)
  padding 18px 20px
  min-width 180px
  flex 1 1 200px
  display flex
  flex-direction column
  align-items center
  justify-content center
  transition box-shadow 0.2s, transform 0.2s
  cursor pointer
  &:hover
    box-shadow 0 8px 24px rgba(255,152,0,0.18)
    transform translateY(-4px) scale(1.03)

.product-card-header
  font-size 16px
  font-weight 600
  color #ff9800
  margin-bottom 8px

.product-card-controls
  display flex
  align-items center
  gap 10px

.product-qty
  width 38px
  text-align center
  font-size 16px
  border-radius 6px
  border 1px solid #e0e0e0
  background #fff
  padding 3px 0

.summary-section {
  background: linear-gradient(135deg, #fffbe6 80%, #fff 100%);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(255,152,0,0.07);
  border: 1.5px solid #ffe0b2;
  color: #a05a2c;
}

.summary-item
  display flex
  align-items center
  gap 10px
  margin-bottom 8px

.summary-item-weight
  color #bbb
  font-size 14px

.summary-total
  color: #ff9800;
  font-weight: 800;
  font-size: 18px;
  margin-top 8px

.balance-info
  font-size: 17px;
  color: #a05a2c;
  font-weight: 700;
  margin: 10px 0 10px 0;

.pay-methods
  margin-top 10px
  margin-bottom 10px

.radio-label
  color: #a05a2c;
  font-size: 17px;
  font-weight: 700;
  margin-right: 18px;

.checkbox-label
  display flex
  align-items center
  margin-top 10px
  margin-bottom 10px
  font-size 15px
  color: #a05a2c;

.bank-fields
  margin-top 10px
  margin-bottom 10px

.voucher-label
  display flex
  flex-direction column
  gap 8px
  margin-top 8px

.error-message
  color #e53935
  font-size 16px
  font-weight 500
  margin-bottom 10px
  margin-top 6px

.success
  color #388e3c
  font-size 16px
  font-weight 500
  margin-top 10px

.main-action-btn
  width 100%
  background linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)
  color white
  border none
  border-radius 10px
  padding 14px 0
  font-size 18px
  font-weight 600
  box-shadow 0 2px 8px rgba(255,152,0,0.13)
  cursor pointer
  margin-bottom 10px
  transition background 0.2s, box-shadow 0.2s
  &:hover
    background linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%)
    box-shadow 0 4px 16px rgba(255,152,0,0.18)

.main-action-btn.sending
  background #bbb
  color #fff
  cursor not-allowed

.invoices-section
  margin-top 18px
  text-align center

.invoice-link
  color: #ff9800;
  font-weight: 800;
  font-size: 17px;
  text-decoration: underline;
  margin-right: 10px;
  &:hover
    color #fb8c00

.summary-img-wrap
  width 32px
  height 32px
  display flex
  align-items center
  justify-content center
  background #fff8e1
  border-radius 8px
  box-shadow 0 1px 4px rgba(255,152,0,0.07)

.summary-img
  width 28px
  height 28px
  object-fit cover
  border-radius 7px
  border 1.5px solid #ff9800

.summary-product-name
  color: #a05a2c;
  font-weight: 700;
  font-size: 16px;

.category-block
  margin-bottom 38px

.category-title
  color: #ff9800;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  margin-top: 10px;

.info-message
  color #ff9800
  font-size 15px
  font-weight 500
  margin-bottom 8px
  margin-top 6px

.master-trophy-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  min-height 70vh
  animation fadeInBounce 1.1s

.master-trophy-img
  width 180px
  height 180px
  object-fit contain
  margin-bottom 24px
  animation bounce 1.2s

.master-trophy-title
  font-size 2.5rem
  font-weight 800
  color #ff9800
  margin-bottom 10px
  letter-spacing 1px
  text-shadow 0 2px 8px #ffe0b2

.master-trophy-msg
  font-size 1.3rem
  color #444
  margin-bottom 28px
  font-weight 500
  .master-trophy-master
    color #e53935
    font-weight 700
    font-size 1.4rem
    text-shadow 0 1px 6px #ffb74d

.master-trophy-btn
  font-size 1.1rem
  padding 12px 32px
  margin-top 10px
  background linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)
  color white
  border none
  border-radius 10px
  font-weight 700
  box-shadow 0 2px 8px rgba(255,152,0,0.13)
  cursor pointer
  transition background 0.2s, box-shadow 0.2s
  &:hover
    background linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%)
    box-shadow 0 4px 16px rgba(255,152,0,0.18)

@keyframes fadeInBounce
  0%
    opacity 0
    transform scale(0.8)
  60%
    opacity 1
    transform scale(1.05)
  100%
    opacity 1
    transform scale(1)

@keyframes bounce
  0%
    transform translateY(-60px)
  60%
    transform translateY(20px)
  80%
    transform translateY(-10px)
  100%
    transform translateY(0)

@media (max-width: 900px)
  .sticky-summary
    display none !important
  .afiliarme-mobile-btn
    display flex
    justify-content center
    align-items center
    margin 18px 0 0 0
    .main-action-btn
      max-width 400px
      width 100%
      font-size 1.15rem
      padding 16px 0
      border-radius 12px
      box-shadow 0 2px 8px rgba(255,152,0,0.13)
      display flex
      align-items center
      justify-content center
      gap 10px
      .fab-icon
        font-size 1.4em
@media (min-width: 900px)
  .afiliarme-mobile-btn
    display none !important

.fade-enter-active, .fade-leave-active
  transition opacity 0.4s
.fade-enter, .fade-leave-to
  opacity 0
.pending-modal-local
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  background rgba(30, 30, 30, 0.55)
  display flex
  align-items center
  justify-content center
  z-index 400
  .pending-modal-content-block
    background #fff
    border-radius 18px
    box-shadow 0 4px 32px rgba(255,152,0,0.18)
    padding 38px 32px
    text-align center
    display flex
    flex-direction column
    align-items center
    .pending-modal-icon-block
      margin-bottom 18px
      .hourglass-anim
        display block
        margin 0 auto
        .sand-top {
          animation: sandTopAnim 1.5s infinite alternate;
        }
        .sand-bottom {
          animation: sandBottomAnim 1.5s infinite alternate;
        }
        .sand-flow {
          animation: sandFlowAnim 1.5s infinite alternate;
        }
@keyframes sandTopAnim {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}
@keyframes sandBottomAnim {
  0% { opacity: 0.2; }
  100% { opacity: 1; }
}
@keyframes sandFlowAnim {
  0% { opacity: 1; height: 24px; }
  100% { opacity: 0.2; height: 2px; }
}
.affiliation-alert
  background #fffbe6
  color #ff9800
  border 2px solid #ff9800
  border-radius 14px
  padding 24px 18px
  margin 32px auto
  max-width 500px
  text-align center
  font-size 1.15rem
  font-weight 600
.tag-upgrade {
  background: #ff9800;
  color: #fff;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.95em;
  margin-left: 8px;
  font-weight: 700;
}
.upgrade-details-block {
  background: #fffbe6;
  border: 1.5px solid #ff9800;
  border-radius: 10px;
  padding: 10px 16px;
  margin: 8px 0 18px 0;
  font-size: 1.05em;
  color: #a05a2c;
}
.invoice-history-block {
  margin-bottom: 18px;
}
.max-info {
  color: #ff9800;
  font-size: 0.95em;
  margin-left: 6px;
  font-weight: 600;
}
</style>
