<template>
  <App :session="session">
    <div class="activations-bg">
      <h2 class="activations-title" v-if="!showMasterTrophy">
        Historial de Activaciones
      </h2>
      <section v-if="!loading">
        <div></div>
        <div>
          <h4 class="tabs">
            <router-link class="tab" to="/activation">
              <span class="tab-icon">🛒</span> Comprar
            </router-link>
            &nbsp;&nbsp;
            <router-link class="tab" to="/activations">
              <span class="tab-icon">📜</span> Historial
            </router-link>
          </h4>

          <i class="load" v-if="loading"></i> <br />

          <div class="scroll">
            <table class="activations-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Monto</th>
                  <th>Puntos</th>
                  <th>Voucher</th>
                  <th>Estado</th>
                  <th>Boleta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activation in activations" :key="activation.id">
                  <td>{{ activation.date | date }}</td>
                  <td>
                    <div class="product-chips">
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
                    </div>
                  </td>
                  <td>{{ activation.price | price }}</td>
                  <td>{{ activation.points }}</td>
                  <td>
                    <a :href="activation.voucher" target="_blank">
                      <img :src="activation.voucher" class="voucher-img" />
                    </a>
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
                    <a
                      :href="`${INVOICE_ROOT}?id=${activation.id}`"
                      target="_blank"
                      class="invoice-link-btn"
                      v-if="activation.status == 'approved'"
                    >
                      <span class="invoice-icon">🧾</span> Boleta
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT;
console.log({ INVOICE_ROOT });

export default {
  components: {
    App,
  },
  data() {
    return {
      activations: null,
      // arr: [0,0,0],
      loading: true,
      INVOICE_ROOT,
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
  },
  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
      // return new Date(val).toLocaleString()
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
    // GET data
    const { data } = await api.Activations.GET(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");
    if (data.error && data.msg == "unverified user")
      this.$router.push("/verify");

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

    this.activations = data.activations.reverse();
    // this.arr         = data.arr
  },
};
</script>

<style lang="stylus">
.activations-bg
  min-height 100vh
  padding-bottom 80px

.activations-title
  text-align center
  font-size 2.2rem
  font-weight 700
  color #ff9800
  margin 32px 0 18px 0
  letter-spacing 1px

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

.scroll
  overflow-x auto
  margin-top 18px

.activations-table
  width 100%
  border-collapse separate
  border-spacing 0
  background #fff
  border-radius 16px
  box-shadow 0 2px 12px rgba(0,0,0,0.07)
  min-width 900px
  overflow hidden

  thead tr
    background #ff9800
    color #fff
    position sticky
    top 0
    z-index 2
    font-size 17px
    font-weight 600

  th, td
    padding 14px 12px
    text-align left
    font-size 15px
    border-bottom 1.5px solid #ffe0b2

  tbody tr:nth-child(even)
    background #fff8e1

  tbody tr:hover
    background #ffe0b2
    transition background 0.2s

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

.product-chips
  display flex
  flex-wrap wrap
  gap 6px
.product-chip
  background #ffe0b2
  color #ff9800
  border-radius 12px
  padding 4px 12px
  font-size 0.98em
  font-weight 500
  display inline-flex
  align-items center
  margin-bottom 2px
  .product-chip-total
    color #b26a00
    margin-left 4px

.status-badge
  display inline-flex
  align-items center
  gap 6px
  padding 5px 14px
  border-radius 16px
  font-size 15px
  font-weight 600
  text-transform capitalize
  box-shadow 0 1px 4px rgba(255,152,0,0.07)
  .status-icon
    font-size 1.1em
  &.pending
    background #fff3e0
    color #ff9800
  &.approved
    background #c8e6c9
    color #388e3c
  &.rejected
    background #ffcdd2
    color #e53935

.invoice-link-btn
  display inline-flex
  align-items center
  gap 6px
  background #ff9800
  color #fff
  border-radius 8px
  padding 6px 16px
  font-size 15px
  font-weight 600
  text-decoration none
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  transition background 0.18s, box-shadow 0.18s, transform 0.18s
  .invoice-icon
    font-size 1.1em
  &:hover
    background #fb8c00
    color #fffde7
    box-shadow 0 4px 16px rgba(255,152,0,0.18)
    transform scale(1.05)

.voucher-img
  max-height 60px
  max-width 60px
  border-radius 10px
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  border 2px solid #fff3e0
  transition transform 0.2s
  &:hover
    transform scale(1.08)

@media (max-width: 900px)
  .activations-table
    min-width 700px
  .scroll
    padding 0 8px
</style>
