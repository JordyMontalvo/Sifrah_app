<template>
  <App :session="session" :office_id="office_id" :title="title">
    <h4 class="tabs">
      <router-link class="tab" to="/activation">
        <span class="tab-icon">🛒</span> Comprar
      </router-link>
      &nbsp;&nbsp;
      <router-link class="tab" to="/activations" v-if="!office_id">
        <span class="tab-icon">📜</span> Historial
      </router-link>
    </h4>

    <div class="points-bar">
      <span class="points-icon">💎</span> Puntos: <b>{{ current_points }}</b>
    </div>
    <h4 class="products-title">Elige tus productos</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">
      <div class="products-flex">
        <div class="products-main">
          <div class="_tabs">
            <p
              class="_tab"
              v-for="(category, i) in categories"
              @click="tab = category"
              :class="{ selected: tab == categories[i] }"
            >
              <span class="tab-icon">📦</span> {{ category }}
            </p>
          </div>

          <div class="products-grid">
            <article
              class="product-card"
              v-for="(product, i) in products"
              @click="touch(i)"
              v-if="product.type == tab"
            >
              <img
                :src="product.img"
                class="product-img"
                alt="Imagen producto"
              />
              <div class="product-info">
                <p class="product-name">{{ product.name }}</p>
                <div class="product-meta">
                  <span class="product-price">S/. {{ product.price }}</span>
                  <span class="product-points">💎 {{ product.points }}</span>
                </div>
                <div class="product-controls">
                  <button class="qty-btn" @click.stop="less(product)">-</button>
                  <input v-model="product.total" readonly class="qty-input" />
                  <button class="qty-btn" @click.stop="more(product)">+</button>
                </div>
              </div>
            </article>
          </div>

          <div class="summary-box">
            <div class="summary-title">Resumen de compra</div>
            <div class="summary-chips">
              <span
                class="summary-chip"
                v-for="(product, i) in products"
                v-if="product.total > 0"
                :key="product.name"
              >
                {{ product.total }} x {{ product.name }}
              </span>
            </div>
            <div class="summary-totals">
              <span
                >Impuesto: <b>{{ IGV.toFixed(2) }}</b></span
              >
              <span
                >Total: <b>S/. {{ price }}</b></span
              >
              <span
                >Puntos: <b>{{ points }}</b></span
              >
            </div>
          </div>

          <div class="office-section">
            <label class="office-label">Selecciona una oficina</label>
            <select class="input" v-model="office" v-if="!pending">
              <option value="null" disabled>Oficina</option>
              <option
                v-for="office in offices"
                :value="office"
                :key="office.id"
              >
                {{ office.name }}
              </option>
            </select>
            <div v-if="office" class="office-info">
              <div class="office-address">
                <span class="office-icon">🏢</span> {{ office.address }}
              </div>
              <div v-if="office.accounts" class="office-accounts">
                <label>Cuentas:</label>
                <textarea
                  readonly
                  class="input office-accounts-text"
                  rows="3"
                  >{{ office.accounts }}</textarea
                >
              </div>
            </div>
          </div>

          <div class="payment-section">
            <label class="input-label">
              <input type="checkbox" v-model="check" />
              <span>Deseo usar mi saldo</span>
            </label>
            <div v-show="check" class="balance-info">
              <span
                >Saldo no disponible: <b>{{ _balance }}</b></span
              >
              <span
                >Saldo disponible: <b>{{ balance }}</b></span
              >
              <span v-if="remaining > 0"
                >Restan: <b>{{ remaining }}</b></span
              >
            </div>
            <div v-show="!(check && remaining == 0)">
              <div class="pay-methods">
                <label>
                  <input type="radio" :value="'bank'" v-model="pay_method" />
                  <span>Banco</span>
                </label>
                <label>
                  <input type="radio" :value="'cash'" v-model="pay_method" />
                  <span>Efectivo</span>
                </label>
              </div>
              <div v-if="pay_method == 'bank'" class="bank-section">
                <input class="input" v-model="bank" placeholder="Banco" />
                <input
                  class="input"
                  v-model="date"
                  placeholder="Fecha"
                  type="date"
                />
                <input
                  class="input"
                  v-model="voucher_number"
                  placeholder="Número de Voucher"
                  oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                />
                <label class="voucher-label">
                  <span v-show="!voucher">Comprobante de pago</span>
                  <img class="voucher" :src="voucher" />
                  <input type="file" @change="onFileChange" />
                </label>
              </div>
              <div v-if="pay_method == 'cash'" class="cash-section">
                <span
                  >Monto: <b>{{ remaining }}</b></span
                >
              </div>
            </div>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>
          <div v-if="success" class="success-msg">Activación Enviada</div>

          <button class="main-action-btn" v-show="!sending" @click="POST">
            <span class="btn-icon">🛒</span> Ordenar productos
          </button>
          <button class="main-action-btn sending" v-show="sending" disabled>
            Enviando orden ...
          </button>
        </div>
      </div>
    </section>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";

export default {
  components: {
    App,
  },
  data() {
    return {
      current_points: null,
      current_profit: null,
      products: null,
      product: null,
      balance: null,
      _balance: null,
      //  office:   null,
      check: false,
      voucher: null,

      error: null,

      file: null,
      office: null,
      offices: null,

      loading: true,
      sending: false,
      success: false,

      pending: false,

      tab: null,

      pay_method: null,

      bank: null,
      date: null,
      voucher_number: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },

    price() {
      console.log("price");
      let price = this.products.reduce((a, b) => a + b.price * b.total, 0);
      return price;
    },
    title() {
      return "Productos";
    },
    points() {
      return this.products.reduce((a, b) => a + b.points * b.total, 0);
    },
    // commission() { return this.products.reduce((a, b) => a + (b.val ? b.val : b.price) * b.total, 0) },
    total() {
      return this.products.reduce((a, b) => a + b.total, 0);
    },

    _price() {
      return `Total: S/. ${this.price}`;
    },
    // _points() { return `A comisionar: ${this.commission}` },
    _points() {
      return `Puntos: ${this.points}`;
    },

    IGV() {
      return this.price - this.price / 1.18;
    },

    remaining() {
      if (this.check) {
        let ret = this.price - (this.balance + this._balance);

        return ret > 0 ? ret : 0;
      } else {
        return this.price;
      }
    },

    categories() {
      const arr = this.products.map(function (x) {
        return x.type;
      });

      let ret = arr.filter(function (v, i, self) {
        return i == self.indexOf(v);
      });

      return ret;
    },
  },
  async created() {
    // GET data
    const { data } = await api.Activation.GET(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");

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

    this.current_points = data.points;
    this.current_profit = data.profit;
    this.products = data.products.map((a) => ({ ...a, total: 0 }));
    this.product = this.products[0];

    this.balance = data.balance;
    this._balance = data._balance;

    if (this.office_id) this.office = this.office_id;

    this.offices = data.offices;

    this.tab = this.categories[0];
  },
  methods: {
    touch(i) {
      this.product = this.products[i];
    },
    more(product) {
      if (product.total == 10) return;
      product.total += 1;
    },
    less(product) {
      if (product.total == 0) return;
      product.total -= 1;
    },
    onFileChange(e) {
      this.file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.voucher = e.target.result;
      };

      reader.readAsDataURL(this.file);
    },
    reset() {
      console.log("reset ...");

      this.products.forEach((product) => {
        product.total = 0;
      });
    },
    async POST() {
      let {
        products,
        office,
        check,
        voucher,
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

      if (!this.total) {
        this.error = "Seleccione productos";
        return;
      }

      if (!office) {
        this.error = "Seleccione oficina";
        return;
      }

      if (!check && !pay_method) {
        this.error = "Seleccione Medio de Pago";
        return;
      }

      if (check && this.remaining && !pay_method) {
        this.error = "Seleccione Medio de Pago";
        return;
      }

      this.error = null;

      // POST Affiliation
      this.sending = true;

      if (voucher)
        voucher = await lib.upload(this.file, this.file.name, "activations");

      const { data } = await api.Activation.POST(this.session, {
        products,
        voucher,
        office: office.id,
        check,
        pay_method,
        bank,
        date,
        voucher_number,
      });

      this.sending = false;

      this.success = true;

      this.reset();
    },
  },
};
</script>

<style lang="stylus">
.tabs
  display flex
  justify-content center
  align-items center
  margin-bottom 24px
  .tab
    display flex
    align-items center
    font-size 1.18rem
    font-weight 600
    color #ff9800
    background #fff3e0
    border-radius 18px
    padding 10px 28px
    margin 0 6px
    box-shadow 0 2px 8px rgba(255,152,0,0.07)
    transition all 0.18s
    text-decoration none
    position relative
    .tab-icon
      margin-right 8px
      font-size 1.3em
    &:hover, &.router-link-exact-active
      background #ff9800
      color #fff
      box-shadow 0 4px 16px rgba(255,152,0,0.13)
      transform translateY(-2px) scale(1.04)

.points-bar
  display flex
  align-items center
  justify-content flex-end
  font-size 1.1rem
  margin-bottom 10px
  color #ff9800
  .points-icon
    margin-right 6px
    font-size 1.3em

.products-title
  text-align center
  font-size 1.5rem
  font-weight 700
  color #ff9800
  margin 18px 0 10px 0
  letter-spacing 1px

.products-flex
  display flex
  justify-content center
  align-items flex-start
  width 100%

.products-main
  width 100%
  max-width 700px

._tabs
  display flex
  overflow auto
  margin-bottom 18px
  ._tab
    padding 10px 18px
    background #fffde7
    border-radius 16px 16px 0 0
    font-weight 400
    font-size 1.08rem
    cursor pointer
    margin-right 8px
    display flex
    align-items center
    gap 8px
    transition background 0.18s, color 0.18s
    .tab-icon
      font-size 1.2em
    &.selected
      font-weight 700
      background #ff9800
      color #fff
      box-shadow 0 2px 8px rgba(255,152,0,0.10)

.products-grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(220px, 1fr))
  gap 18px
  margin-bottom 24px

.product-card
  background #fff
  border-radius 18px
  box-shadow 0 2px 12px rgba(0,0,0,0.07)
  padding 18px 14px
  display flex
  flex-direction column
  align-items center
  transition box-shadow 0.18s, transform 0.18s
  cursor pointer
  border 2px solid transparent
  &:hover
    box-shadow 0 4px 24px rgba(255,152,0,0.13)
    border 2px solid #ff9800
    transform scale(1.03)

.product-img
  width 90px
  height 90px
  object-fit contain
  margin-bottom 12px

.product-info
  width 100%
  text-align center

.product-name
  font-size 1.08rem
  font-weight 700
  color #ff9800
  margin-bottom 6px

.product-meta
  display flex
  justify-content center
  gap 12px
  font-size 0.98rem
  margin-bottom 10px
  .product-price
    color #388e3c
    font-weight 600
  .product-points
    color #b26a00
    font-weight 600

.product-controls
  display flex
  justify-content center
  align-items center
  gap 8px
  margin-top 8px

.qty-btn
  background #ff9800
  color #fff
  border none
  border-radius 8px
  font-size 1.2rem
  width 32px
  height 32px
  display flex
  align-items center
  justify-content center
  cursor pointer
  transition background 0.18s, transform 0.18s
  &:hover
    background #fb8c00
    transform scale(1.08)

.qty-input
  width 38px
  text-align center
  font-size 1.1rem
  border 1.5px solid #ffe0b2
  border-radius 6px
  padding 4px
  background #fffde7

.summary-box
  background #fffde7
  border-radius 14px
  box-shadow 0 2px 8px rgba(255,152,0,0.07)
  padding 16px 18px
  margin-bottom 18px
  .summary-title
    font-size 1.1rem
    font-weight 700
    color #ff9800
    margin-bottom 8px
  .summary-chips
    display flex
    flex-wrap wrap
    gap 8px
    margin-bottom 10px
  .summary-chip
    background #ffe0b2
    color #ff9800
    border-radius 12px
    padding 4px 12px
    font-size 0.98em
    font-weight 500
  .summary-totals
    display flex
    flex-direction column
    gap 4px
    font-size 1.05em
    color #b26a00
    margin-top 6px

.payment-section
  background #fff
  border-radius 12px
  box-shadow 0 2px 8px rgba(255,152,0,0.07)
  padding 14px 18px
  margin-bottom 18px
  .input-label
    display flex
    align-items center
    gap 8px
    font-size 1em
    margin-bottom 8px
  .balance-info
    display flex
    flex-direction column
    gap 2px
    font-size 0.98em
    color #b26a00
    margin-bottom 8px
  .pay-methods
    display flex
    gap 18px
    margin-bottom 10px
    label
      display flex
      align-items center
      gap 6px
      font-size 1em
  .bank-section, .cash-section
    margin-top 8px
  .voucher-label
    display flex
    flex-direction column
    gap 6px
    margin-top 6px
    .voucher
      max-width 90px
      max-height 90px
      border-radius 8px
      border 1.5px solid #ffe0b2
      margin-top 4px



.error-msg
  color #e53935
  font-size 1em
  margin-bottom 8px
.success-msg
  color #388e3c
  font-size 1em
  margin-bottom 8px

.main-action-btn
  background linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)
  color white
  border none
  border-radius 10px
  font-weight 700
  font-size 1.1rem
  padding 14px 36px
  margin-top 10px
  box-shadow 0 2px 8px rgba(255,152,0,0.13)
  cursor pointer
  transition background 0.2s, box-shadow 0.2s, transform 0.18s
  display flex
  align-items center
  gap 10px
  &:hover
    background linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%)
    box-shadow 0 4px 16px rgba(255,152,0,0.18)
    transform scale(1.04)
  &.sending
    background #ffe0b2
    color #ff9800
    cursor not-allowed

@media (max-width: 900px)
  .products-main
    max-width 100%
  .products-grid
    grid-template-columns repeat(auto-fit, minmax(170px, 1fr))
    gap 10px
  .summary-box, .payment-section
    padding 10px 6px

@media (max-width: 600px)
  .products-title
    font-size 1.1rem
  .products-grid
    grid-template-columns repeat(auto-fit, minmax(140px, 1fr))
    gap 6px
  .product-card
    padding 10px 6px
    border-radius 10px
  .summary-box, .payment-section
    padding 6px 2px
  .main-action-btn
    padding 10px 10px
    font-size 1em

.office-section
  margin-bottom 18px
  .office-label
    font-size 1.05em
    font-weight 600
    color #ff9800
    margin-bottom 6px
    display block
  .input
    margin-bottom 6px
  .office-info
    margin-top 6px
    .office-address
      font-size 0.98em
      color #b26a00
      margin-bottom 4px
      display flex
      align-items center
      gap 6px
      .office-icon
        font-size 1.2em
    .office-accounts
      margin-top 4px
      label
        font-size 0.95em
        color #888
      .office-accounts-text
        width 100%
        min-width 180px
        max-width 320px
        background #fffde7
        color #444
        border-radius 8px
        border 1.5px solid #ffe0b2
        font-size 0.98em
        margin-top 2px
</style>
