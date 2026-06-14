<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div class="savings-bonus-container">
      <!-- Header Section -->
      <div class="bonus-header">
        <div class="header-text">
          <h1 class="main-title">Tienda <span class="highlight">Bono Ahorro</span></h1>
          <p class="subtitle">Canjea tu saldo acumulado por productos y beneficios exclusivos.</p>
        </div>
        <div class="header-actions">
          <!-- The profile and share buttons are already in the layout, but the image shows them here too. 
               We'll stick to the layout header if possible, or add them here if the user wants this specific design.
               For now, we'll implement the main content area. -->
        </div>
      </div>

      <!-- Hero Section -->
      <div class="hero-grid">
        <div class="promo-banner">
          <div class="banner-content">
            <h2>Tu esfuerzo<br />también te recompensa</h2>
            <p>Usa tu Bono Ahorro para canjear<br />productos increíbles sin gastar dinero.</p>
          </div>
          <div class="banner-image">
            <img src="../../assets/img/piggy-3d.png" alt="Bono Ahorro" />
          </div>
        </div>

        <div class="balance-card">
          <p class="balance-label">Saldo disponible</p>
          <div class="balance-amount">
            <span class="currency">S/</span> {{ sifrahBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            <img
              class="coin-icon-img"
              src="../../assets/img/coin-saldo-icon.png"
              alt=""
            />
          </div>
          <p class="balance-note">No retirable | Solo para canje</p>
          <router-link to="/bonus-history" class="history-btn" style="text-decoration: none;">
            <i class="fas fa-history"></i> Ver historial
          </router-link>
        </div>
      </div>

      <!-- Search & Categories Section -->
      <div class="controls-section">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Buscar productos..." v-model="searchTerm" />
        </div>

        <!-- Category pills (como en Figma) -->
        <div class="category-pills">
          <button
            v-for="cat in visualCategories"
            :key="cat.name"
            class="pill"
            :class="{ active: selectedCategory === cat.name }"
            @click="selectCategory(cat.name)"
            type="button"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Visual Categories Icons (Primary Filters) -->
      <div class="visual-categories">
        <div 
          v-for="cat in visualCategories" 
          :key="cat.name" 
          class="cat-item"
          :class="{ active: selectedCategory === cat.name }"
          @click="selectCategory(cat.name)"
        >
          <div class="cat-icon-wrapper" :style="{ backgroundColor: selectedCategory === cat.name ? '#e91e63' : cat.color }">
            <img v-if="cat.img" :src="cat.img" :alt="cat.name" />
            <i v-else :class="cat.icon" :style="{ color: selectedCategory === cat.name ? 'white' : '#2d3436' }"></i>
          </div>
          <span :class="{ 'active-text': selectedCategory === cat.name }">{{ cat.name }}</span>
        </div>
      </div>

      <!-- Featured Products Section -->
      <div class="featured-section">
        <div class="section-header">
          <h3>Productos destacados</h3>
          <router-link to="/savings-bonus/all" class="view-all">Ver todos <i class="fas fa-arrow-right"></i></router-link>
        </div>

        <div class="products-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="info-icon" @click="showProductDetail(product)">i</div>
            <div class="product-image">
              <img :src="product.img" :alt="product.name" />
            </div>
            <div class="product-details">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-sub">{{ product.sub }}</p>
              <div class="product-price">
                <span class="price-coin">🪙</span> S/ {{ product.price }}
              </div>
              <button class="redeem-btn" @click="redeem(product)">Canjear</button>
              <p class="product-footer">No genera puntos ni comisiones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Swal from "sweetalert2";

export default {
  components: {
    App,
  },
  data() {
    return {
      sifrahBalance: 0,
      loading: true,
      selectedCategory: "Todos",
      searchTerm: "",
      featuredProducts: [],
      activeCatalogTab: "all", // 'bonus', 'sifrah', 'all'
      visualCategories: [
        { name: "Todos", icon: "fas fa-th", color: "#f1f2f6" },
        { name: "Productos SIFRAH", icon: "fas fa-leaf", color: "#e3f2fd" },
        { name: "Bienestar", icon: "fas fa-heart", color: "#fce4ec" },
        { name: "Hogar", icon: "fas fa-home", color: "#fff3e0" },
        { name: "Tecnología", icon: "fas fa-laptop", color: "#e0f2f1" },
        { name: "Herramientas", icon: "fas fa-tools", color: "#efebe9" },
        { name: "Electrodomésticos", icon: "fas fa-blender", color: "#f1f8e9" },
        { name: "Promociones", icon: "fas fa-tag", color: "#fffde7" },
      ],
    };
  },
  computed: {
    session() { return this.$store.state.session; },
    office_id() { return this.$store.state.office_id; },
    title() { return "Bono Ahorro"; },
    filteredProducts() {
      // 1. Filtrar por pestaña de catálogo
      let baseProducts = this.featuredProducts;
      if (this.activeCatalogTab === 'bonus') {
        baseProducts = baseProducts.filter(p => p.catalog_type === 'savings');
      } else if (this.activeCatalogTab === 'sifrah') {
        baseProducts = baseProducts.filter(p => p.catalog_type === 'both' || p.catalog_type === 'sifrah');
      }

      // 2. Filtrar por búsqueda y categoría
      return baseProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          p.type.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategory === "Todos" || p.type === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    },
    categories() {
      // Las categorías deben ser dinámicas según la pestaña activa
      let baseProducts = this.featuredProducts;
      if (this.activeCatalogTab === 'bonus') {
        baseProducts = baseProducts.filter(p => p.catalog_type === 'savings');
      } else if (this.activeCatalogTab === 'sifrah') {
        baseProducts = baseProducts.filter(p => p.catalog_type === 'both' || p.catalog_type === 'sifrah');
      }
      
      const cats = new Set(baseProducts.map(p => p.type));
      return ["Todos", ...Array.from(cats).filter(Boolean)];
    }
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        // Ejecutar dashboard (para el saldo) y la nueva API dedicada de productos en paralelo
        const [dashResponse, productsResponse] = await Promise.all([
          api.dashboard(this.session),
          api.SavingsBonus.GET(this.session)
        ]);

        const dashData = dashResponse.data;
        if (dashData && !dashData.error) {
          this.sifrahBalance = Number(dashData.sifrahBalance) || 0;
        } else if (dashData && dashData.msg === "invalid session") {
          this.$router.push("/login");
          return;
        }

        const productsData = productsResponse.data;
        if (productsData && !productsData.error) {
          if (productsData.products) {
            this.featuredProducts = productsData.products;
          }
          if (productsData.savingsBalance != null) {
            this.sifrahBalance = Number(productsData.savingsBalance) || 0;
          }
        }
      } catch (e) {
        console.error("Error fetching savings data:", e);
      } finally {
        this.loading = false;
      }
    },
    selectCategory(cat) {
      this.selectedCategory = cat;
    },
    async redeem(product) {
      const price = Number(product.price) || 0;
      if (price <= 0) return;

      const { isConfirmed } = await Swal.fire({
        title: "¿Confirmar canje?",
        html: `Vas a canjear <strong>${product.name}</strong> por <strong>S/ ${price.toFixed(2)}</strong> de tu Bono Ahorro.<br><small>La solicitud quedará pendiente de aprobación.</small>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Solicitar canje",
        cancelButtonText: "Cancelar",
      });

      if (!isConfirmed) return;

      try {
        const { data } = await api.SavingsBonus.POST(this.session, {
          products: [{ id: product.id, name: product.name, price, total: 1 }],
          office: "central",
          deliveryMethod: "pickup",
          deliveryInfo: { officeId: "central" },
        });

        if (data.error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.msg || "No se pudo registrar el canje",
          });
          return;
        }

        await Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: `Tu canje #${data.orderNumber || data.id} está pendiente de aprobación.`,
        });
        await this.fetchData();
      } catch (e) {
        console.error("Error en canje:", e);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo procesar el canje. Intenta de nuevo.",
        });
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import "../../assets/style/vars.styl"

.savings-bonus-container
  padding 22px 24px
  background #fafafa
  min-height 100vh
  font-family 'Inter', sans-serif

.bonus-header
  margin-bottom 18px
  
  .main-title
    font-size 30px
    font-weight 800
    color #2d3436
    margin 0
    
    .highlight
      color #e91e63

  .subtitle
    color #636e72
    font-size 14px
    margin-top 4px

.hero-grid
  display grid
  grid-template-columns 2.5fr 1fr
  gap 18px
  margin-bottom 18px

  @media (max-width m-break)
    grid-template-columns 1fr

.promo-banner
  /* Izquierda más profunda, derecha más clara + resplandor tras el chancho (como referencia) */
  background linear-gradient(95deg, #c02677 0%, #db2777 22%, #ec4899 50%, #f9a8d4 88%, #fbcfe8 100%)
  border-radius 16px
  padding 22px 20px 20px 32px
  display flex
  align-items flex-start
  justify-content flex-start
  color white
  overflow hidden
  position relative
  box-shadow 0 16px 40px rgba(233, 30, 99, 0.14)
  box-sizing border-box
  min-height 230px
  height auto

  &:before
    content ''
    position absolute
    inset 0
    border-radius inherit
    /* Brillo suave detrás del personaje (lado derecho) */
    background radial-gradient(ellipse 75% 120% at 88% 48%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 62%)
    pointer-events none
    z-index 0

  &:after
    content ''
    position absolute
    inset 0
    border-radius inherit
    background radial-gradient(120% 80% at 12% 35%, rgba(0, 0, 0, 0.06) 0%, transparent 50%)
    pointer-events none
    z-index 0

  .banner-content
    flex 0 0 48%
    max-width 48%
    position relative
    z-index 1
    padding 2px 12px 0 0
    align-self flex-start
    h2
      font-size 32px
      font-weight 500
      margin 0 0 20px 0
      line-height 1.28
      letter-spacing 0.055em
      -webkit-font-smoothing antialiased
    p
      font-size 16px
      font-weight 400
      opacity 0.96
      margin 0
      line-height 1.4
      letter-spacing 0.04em
      max-width 34em

  .banner-image
    position absolute
    top 50%
    right 0
    transform translateY(-50%)
    width 52%
    height 100%
    max-height 230px
    display flex
    align-items center
    justify-content flex-end
    padding 6px 18px 10px 8px
    box-sizing border-box
    pointer-events none
    z-index 1
    img
      max-height 108%
      max-width 95%
      width auto
      height auto
      object-fit contain
      object-position right center
      filter drop-shadow(0 16px 28px rgba(120, 20, 60, 0.28)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))

  /* ===== Banner promocional - Móvil ===== */
  @media (max-width m-break)
    padding 18px 18px 16px 18px
    min-height 160px

    .banner-content
      flex 0 0 60%
      max-width 60%
      padding 0 8px 0 0
      h2
        font-size 20px
        margin 0 0 10px 0
        line-height 1.22
        letter-spacing 0.03em
        br
          display none
      p
        font-size 12px
        line-height 1.4
        letter-spacing 0.02em
        max-width 100%
        br
          display none

    .banner-image
      width 40%
      max-height 100%
      padding 4px 8px 4px 0
      img
        max-height 100%
        max-width 100%

.balance-card
  background #301050 // Dark purple
  border-radius 18px
  padding 20px 22px 18px 22px
  color #fff
  display flex
  flex-direction column
  justify-content space-between
  box-shadow 0 10px 24px rgba(48, 16, 80, 0.14)
  box-sizing border-box
  min-height 230px

  .balance-label
    font-size 16px
    font-weight 400
    letter-spacing 0.04em
    color #fff
    margin 0 0 10px 0

  .balance-amount
    font-size 32px
    font-weight 500
    letter-spacing 0.02em
    color #fff
    margin 0 0 10px 0
    display flex
    align-items center
    gap 8px
    line-height 1.15
    
    .currency
      font-size 30px
      font-weight 500
      color #fff
    
    .coin-icon-img
      width 30px
      height 40px
      flex-shrink 0
      display block
      object-fit contain
      vertical-align middle

  .balance-note
    font-size 16px
    font-weight 400
    letter-spacing 0.03em
    color #fff
    margin 0 0 14px 0
    line-height 1.4

  .history-btn
    background white
    color #301050
    border none
    border-radius 10px
    padding 12px 16px
    font-size 16px
    font-weight 500
    letter-spacing 0.03em
    cursor pointer
    display flex
    align-items center
    justify-content center
    gap 10px
    transition 0.3s
    
    &:hover
      background white
      transform translateY(-2px)

  /* ===== Balance card - Móvil ===== */
  @media (max-width m-break)
    padding 16px 18px 14px 18px
    min-height auto

    .balance-label
      font-size 13px
      margin 0 0 6px 0

    .balance-amount
      font-size 26px
      margin 0 0 8px 0

      .currency
        font-size 24px

      .coin-icon-img
        width 26px
        height 26px

    .balance-note
      font-size 12px
      margin 0 0 12px 0

    .history-btn
      padding 10px 14px
      font-size 14px

.controls-section
  display flex
  gap 14px
  align-items center
  margin-bottom 14px
  flex-wrap wrap

.search-bar
  flex 1
  min-width 250px
  background white
  border-radius 999px
  padding 12px 18px
  display flex
  align-items center
  gap 12px
  border 1px solid rgba(0,0,0,0.06)
  box-shadow 0 8px 20px rgba(0,0,0,0.04)
  
  i
    color #b2bec3
  
  input
    border none
    outline none
    width 100%
    font-size 14px
    &::placeholder
      color #b2bec3

.category-pills
  display flex
  gap 10px
  width auto
  overflow-x auto
  padding 0
  margin 0
  
  &::-webkit-scrollbar
    display none

  .pill
    flex-shrink 0
    padding 8px 14px
    border-radius 999px
    border 1px solid rgba(0,0,0,0.08)
    background #fff
    color #2d3436
    font-size 12px
    font-weight 600
    transition 0.3s
    cursor pointer
    box-shadow 0 6px 14px rgba(0,0,0,0.03)
      
    &.active
      background #e91e63
      color white
      border-color #e91e63
      box-shadow 0 10px 22px rgba(233, 30, 99, 0.22)

.category-filters
  display flex
  gap 10px
  overflow-x auto
  padding-bottom 5px
  
  &::-webkit-scrollbar
    height 0px

  button
    background white
    border none
    padding 10px 20px
    border-radius 50px
    font-size 14px
    font-weight 600
    color #636e72
    cursor pointer
    white-space nowrap
    transition 0.3s
    box-shadow 0 2px 5px rgba(0,0,0,0.05)
    
    &:hover
      background #f1f2f6
    
    &.active
      background #e91e63
      color white
      box-shadow 0 4px 10px rgba(233, 30, 99, 0.3)

.visual-categories
  display grid
  grid-template-columns repeat(auto-fit, minmax(110px, 1fr))
  gap 14px
  margin-bottom 22px

  .cat-item
    background white
    padding 14px 10px
    border-radius 16px
    display flex
    flex-direction column
    align-items center
    justify-content center
    gap 10px
    cursor pointer
    border 1px solid rgba(0,0,0,0.06)
    box-shadow 0 10px 24px rgba(0,0,0,0.03)
    will-change transform, box-shadow, background-color
    transition background-color 280ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1), border-color 280ms cubic-bezier(0.4, 0, 0.2, 1)

    &:hover
      transform translateY(-2px)
      box-shadow 0 12px 26px rgba(0,0,0,0.06)
      border-color rgba(233, 30, 99, 0.18)

    &.active
      background #fff0f3
      border-color rgba(233, 30, 99, 0.18)
      box-shadow 0 14px 28px rgba(233, 30, 99, 0.10)
      transform translateY(-2px)

    .cat-icon-wrapper
      width 56px
      height 56px
      border-radius 50%
      display flex
      align-items center
      justify-content center
      font-size 24px
      color #2d3436
      transition background-color 280ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)
      will-change background-color, transform

      i
        transition color 280ms cubic-bezier(0.4, 0, 0.2, 1)

      img
        width 35px
        height 35px
        object-fit contain

    &.active .cat-icon-wrapper
      box-shadow 0 8px 18px rgba(233, 30, 99, 0.28)
      transform scale(1.04)

    span
      font-size 13px
      font-weight 700
      color #2d3436
      text-align center
      transition color 280ms cubic-bezier(0.4, 0, 0.2, 1)
      &.active-text
        color #e91e63
        font-weight 700

.featured-section
  .section-header
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px
    
    h3
      font-size 20px
      font-weight 800
      color #2d3436
      margin 0
      padding-left 10px
      border-left 4px solid #e91e63
    
    .view-all
      color #e91e63
      font-size 14px
      font-weight 600
      text-decoration none
      display flex
      align-items center
      gap-5px
      
      &:hover
        text-decoration underline

.products-grid
  display grid
  grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
  gap 20px

.product-card
  background white
  border-radius 20px
  padding 15px
  position relative
  transition 0.3s
  box-shadow 0 4px 10px rgba(0,0,0,0.03)
  display flex
  flex-direction column
  
  &:hover
    transform translateY(-5px)
    box-shadow 0 10px 25px rgba(0,0,0,0.1)

  .info-icon
    position absolute
    top 12px
    right 12px
    width 20px
    height 20px
    background #f1f2f6
    border-radius 50%
    display flex
    align-items center
    justify-content center
    font-size 12px
    font-weight 800
    color #636e72
    cursor pointer

  .product-image
    height 140px
    display flex
    align-items center
    justify-content center
    margin-bottom 15px
    img
      max-width 100%
      max-height 100%
      object-fit contain

  .product-details
    text-align center
    flex 1
    display flex
    flex-direction column
    
    .product-name
      font-size 15px
      font-weight 800
      color #2d3436
      margin 0 0 4px 0
      text-transform uppercase

    .product-sub
      font-size 12px
      color #b2bec3
      margin-bottom 10px

    .product-price
      font-size 18px
      font-weight 800
      color #2d3436
      margin-bottom 15px
      display flex
      align-items center
      justify-content center
      gap 5px
      
      .price-coin
        font-size 14px

    .redeem-btn
      background #e91e63
      color white
      border none
      border-radius 10px
      padding 10px
      font-weight 700
      width 100%
      cursor pointer
      transition 0.3s
      margin-bottom 10px
      
      &:hover
        background #d81b60
        box-shadow 0 4px 12px rgba(233, 30, 99, 0.3)

    .product-footer
      font-size 10px
      color #b2bec3
      margin 0
</style>
