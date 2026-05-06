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
            <h2>Tu esfuerzo también te recompensa</h2>
            <p>Usa tu Bono Ahorro para canjear productos increíbles sin gastar dinero.</p>
          </div>
          <div class="banner-image">
            <img src="../../assets/img/savings_bonus_banner.png" alt="Bono Ahorro" />
          </div>
        </div>

        <div class="balance-card">
          <p class="balance-label">Saldo disponible</p>
          <div class="balance-amount">
            <span class="currency">S/</span> {{ sifrahBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
            <span class="coin-icon">💰</span>
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
        <div class="category-filters">
          <button v-for="cat in categories" :key="cat" 
                  :class="{ active: selectedCategory === cat }"
                  @click="selectedCategory = cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Visual Categories Icons -->
      <div class="visual-categories">
        <div v-for="cat in visualCategories" :key="cat.name" class="cat-item">
          <div class="cat-icon-wrapper" :style="{ backgroundColor: cat.color }">
            <img v-if="cat.img" :src="cat.img" :alt="cat.name" />
            <i v-else :class="cat.icon"></i>
          </div>
          <span>{{ cat.name }}</span>
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

export default {
  components: {
    App,
  },
  data() {
    return {
      sifrahBalance: 0,
      loading: true,
      searchTerm: "",
      selectedCategory: "Todos",
      visualCategories: [
        { name: "Productos SIFRAH", icon: "fas fa-leaf", color: "#e3f2fd" },
        { name: "Bienestar", icon: "fas fa-heart", color: "#f3e5f5" },
        { name: "Hogar", icon: "fas fa-home", color: "#fff3e0" },
        { name: "Tecnología", icon: "fas fa-laptop", color: "#e8f5e9" },
        { name: "Herramientas", icon: "fas fa-tools", color: "#fbe9e7" },
        { name: "Electrodomésticos", icon: "fas fa-blender", color: "#f1f8e9" },
        { name: "Promociones", icon: "fas fa-tag", color: "#fffde7" },
      ],
      featuredProducts: [],
    };
  },
  computed: {
    session() { return this.$store.state.session; },
    office_id() { return this.$store.state.office_id; },
    title() { return "Bono Ahorro"; },
    filteredProducts() {
      return this.featuredProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategory === "Todos" || p.type === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    },
    categories() {
      const cats = new Set(this.featuredProducts.map(p => p.type));
      return ["Todos", ...Array.from(cats).filter(Boolean)];
    }
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        // Obtener datos del dashboard para el saldo
        const { data: dashData } = await api.dashboard(this.session);
        if (dashData.error) {
          if (dashData.msg === "invalid session") this.$router.push("/login");
          return;
        }
        this.sifrahBalance = Number(dashData.sifrahBalance) || 0;

        // Obtener catálogo de productos
        const { data: productsData } = await api.Activation.GET(this.session);
        if (productsData.products) {
          // Filtrar productos habilitados para Bono Ahorro
          this.featuredProducts = productsData.products
            .filter(p => p.is_savings_bonus)
            .map(p => ({
              id: p.id,
              name: p.name,
              sub: p.subdescription || p.type,
              // Usar precio de ahorro si existe, sino el precio regular
              price: p.savings_price || p.price,
              // Usar imagen de ahorro si existe, sino la regular
              img: p.savings_img || p.img,
              description: p.savings_description || p.description,
              type: p.type
            }));
        }
      } catch (e) {
        console.error("Error fetching savings data:", e);
      } finally {
        this.loading = false;
      }
    },
    redeem(product) {
      console.log("Redeeming product:", product.name);
      // Logic for redemption
    }
  }
};
</script>

<style lang="stylus" scoped>
@import "../../assets/style/vars.styl"

.savings-bonus-container
  padding 20px
  background #f8f9fa
  min-height 100vh
  font-family 'Inter', sans-serif

.bonus-header
  margin-bottom 24px
  
  .main-title
    font-size 28px
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
  gap 15px
  margin-bottom 25px

  @media (max-width m-break)
    grid-template-columns 1fr

.promo-banner
  background linear-gradient(135deg, #ff4b91 0%, #ff80b5 100%)
  border-radius 18px
  padding 15px 30px
  display flex
  align-items center
  justify-content space-between
  color white
  overflow hidden
  position relative
  box-shadow 0 6px 12px rgba(233, 30, 99, 0.12)
  min-height 130px

  .banner-content
    flex 1
    z-index 1
    h2
      font-size 22px
      font-weight 800
      margin-bottom 4px
      line-height 1.1
    p
      font-size 13px
      opacity 0.9
      max-width 280px

  .banner-image
    flex 0 0 30%
    text-align right
    display flex
    justify-content flex-end
    img
      max-width 110%
      height auto
      transform translateY(10%)
      filter drop-shadow(0 6px 10px rgba(0,0,0,0.1))

.balance-card
  background #301050 // Dark purple
  border-radius 18px
  padding 15px
  color white
  display flex
  flex-direction column
  justify-content space-between
  box-shadow 0 6px 12px rgba(48, 16, 80, 0.12)
  min-height 130px

  .balance-label
    font-size 12px
    opacity 0.8
    margin-bottom 2px

  .balance-amount
    font-size 26px
    font-weight 800
    margin-bottom 2px
    display flex
    align-items center
    gap 5px
    
    .currency
      font-size 24px
      opacity 0.9
    
    .coin-icon
      font-size 24px

  .balance-note
    font-size 10px
    opacity 0.7
    margin-bottom 8px

  .history-btn
    background white
    color #301050
    border none
    border-radius 8px
    padding 8px
    font-size 12px
    font-weight 700
    cursor pointer
    display flex
    align-items center
    justify-content center
    gap 8px
    transition 0.3s
    
    &:hover
      background white
      transform translateY(-2px)

.controls-section
  display flex
  gap 20px
  align-items center
  margin-bottom 24px
  flex-wrap wrap

.search-bar
  flex 1
  min-width 250px
  background white
  border-radius 50px
  padding 12px 20px
  display flex
  align-items center
  gap 12px
  box-shadow 0 4px 10px rgba(0,0,0,0.05)
  
  i
    color #b2bec3
  
  input
    border none
    outline none
    width 100%
    font-size 14px
    &::placeholder
      color #b2bec3

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
  grid-template-columns repeat(auto-fill, minmax(120px, 1fr))
  gap 15px
  margin-bottom 40px

  .cat-item
    background white
    padding 15px
    border-radius 20px
    display flex
    flex-direction column
    align-items center
    justify-content center
    gap 10px
    cursor pointer
    transition 0.3s
    box-shadow 0 4px 10px rgba(0,0,0,0.03)
    
    &:hover
      transform translateY(-5px)
      box-shadow 0 10px 20px rgba(0,0,0,0.08)

    .cat-icon-wrapper
      width 60px
      height 60px
      border-radius 18px
      display flex
      align-items center
      justify-content center
      font-size 24px
      color #2d3436
      
      img
        width 35px
        height 35px
        object-fit contain

    span
      font-size 13px
      font-weight 600
      color #2d3436
      text-align center

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
