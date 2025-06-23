<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div class="affiliation-bg">
      <h2 class="affiliation-title" v-if="!showMasterTrophy">
        Afíliate y elige tu kit
      </h2>
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
                    v-for="(product, i) in products"
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
                      <span class="product-price-modern"
                        >S/. {{ product.price }}</span
                      >
                      <span class="product-points-modern"
                        >{{ product.points }} pts</span
                      >
                    </div>
                    <div class="product-controls-modern">
                      <button class="qty-btn" @click="less(product)">-</button>
                      <span class="product-qty-modern">{{
                        product.total
                      }}</span>
                      <button class="qty-btn" @click="more(product)">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Resumen sticky -->
            <div class="sticky-summary" :class="{ show: total > 0 }">
              <div class="sticky-summary-content">
                <div class="sticky-products">
                  <div
                    v-for="product in products"
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
                    >S/. {{ selec_plan.amount }}</span
                  >
                </div>
                <small v-if="selectError" class="error-message">{{
                  selectError
                }}</small>
                <small
                  v-if="
                    total !== selec_plan.max_products &&
                    selec_plan.max_products > 0
                  "
                  class="info-message"
                >
                  <template v-if="total < selec_plan.max_products">
                    Te faltan
                    {{ selec_plan.max_products - total }} producto<span
                      v-if="selec_plan.max_products - total > 1"
                      >s</span
                    >
                    para completar tu selección.
                  </template>
                  <template v-else>
                    Has seleccionado
                    {{ total - selec_plan.max_products }} producto<span
                      v-if="total - selec_plan.max_products > 1"
                      >s</span
                    >
                    de más.
                  </template>
                </small>
                <button
                  class="main-action-btn sticky-btn"
                  :disabled="total !== selec_plan.max_products"
                  @click="handleGoToStep2"
                >
                  Afiliarme
                </button>
              </div>
            </div>
          </div>
          <!-- Paso 2: Datos de pago y confirmación -->
          <div v-else-if="step === 2">
            <div class="card-section confirm-section">
              <h4 class="section-title">Confirma tu afiliación</h4>
              <div class="summary-section confirm-summary">
                <div
                  v-for="product in products"
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
                  <span>{{ total }} / {{ selec_plan.max_products }}</span>
                </div>
                <div class="summary-total">
                  <span>Total a pagar:</span>
                  <span>S/. {{ remaining }}</span>
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
                  <small>No Deseo usar mi saldo</small>
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
            <a
              v-for="(affiliation, i) in affiliations"
              :href="`${INVOICE_ROOT}?id=${affiliation.id}`"
              target="_blank"
              class="invoice-link"
              >Boleta {{ i + 1 }} &nbsp;&nbsp;</a
            >
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

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT;
console.log({ INVOICE_ROOT });

export default {
  components: {
    App,
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
  },
  watch: {
    selec_plan() {
      if (!this.selec_plan) return;
      // this.prices()
      // this.totals()
      this.reset_totals();
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

      // Initialize plans
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

    more(product) {
      const productWeight = Number(product.weight);
      if (isNaN(productWeight) || productWeight <= 0) return;
      const currentTotal = this.products.reduce(
        (a, b) => a + (Number(b.total) || 0) * Number(b.weight || 1),
        0
      );
      const newTotal = currentTotal + productWeight;
      if (newTotal > this.selec_plan.max_products) return;
      product.total += 1;
    },
    less(product) {
      if (product.total == 0) return;
      product.total -= 1;
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
      let {
        products,
        selec_plan,
        voucher,
        office,
        check,
        pay_method,
        bank,
        date,
        voucher_number,
      } = this;

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

      if (!office) {
        this.error = "Seleccione oficina";
        return;
      }

      this.error = null;

      // // POST Affiliation
      this.sending = true;

      if (voucher)
        voucher = await lib.upload(
          this.voucher_file,
          this.voucher_file.name,
          "affiliations"
        );

      const { data } = await api.Afiliation.POST(this.session, {
        products,
        plan: selec_plan,
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
      };
    },
    goToStep(n) {
      this.step = n;
    },
    handleGoToStep2() {
      if (this.total !== this.selec_plan.max_products) {
        this.selectError = `Debes seleccionar exactamente ${this.selec_plan.max_products} productos para continuar.`;
        return;
      }
      this.selectError = "";
      this.goToStep(2);
    },
  },
};
</script>

<style lang="stylus">
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

.product-price-modern
  color: #ff9800;
  font-weight: 600;

.product-points-modern
  color: #bdbdbd;

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
    right 32px
    left auto
    top 100px
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
</style>
