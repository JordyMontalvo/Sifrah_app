<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div class="savings-bonus-container">
      <!-- Header Section -->
      <div class="bonus-header">
        <h1 class="main-title">Tienda <span class="highlight">Bono Ahorro</span></h1>
        <p class="subtitle">Canjea tu saldo acumulado por productos y beneficios exclusivos.</p>
      </div>

      <!-- Hero Section -->
      <div class="hero-grid">
        <div class="promo-banner">
          <div class="banner-content">
            <h2>Tu esfuerzo también te <span class="banner-highlight">recompensa</span></h2>
            <p>Usa tu Bono Ahorro para canjear productos increíbles sin gastar dinero.</p>
          </div>
          <div class="banner-image">
            <img src="../../assets/img/piggy-3d.png" alt="Bono Ahorro" />
          </div>
        </div>

        <div class="balance-card">
          <p class="balance-label">Tu saldo de Bono Ahorro</p>
          <div class="balance-amount">
            <img
              class="coin-icon-img"
              src="../../assets/img/coin-saldo-icon.png"
              alt=""
            />
            <span class="balance-value">{{ formatCoins(sifrahBalance) }}</span>
          </div>
          <div class="balance-meta">
            <p class="balance-note">
              Saldo solo para canje
              <i class="fas fa-info-circle" title="Este saldo solo puede usarse para canjear productos"></i>
            </p>
            <p class="balance-subnote">Solo para canje · No genera puntos.</p>
          </div>
          <button type="button" class="cart-btn" @click="openCart">
            <i class="fas fa-shopping-cart"></i>
            Ver carrito y canjear<span v-if="cartCount > 0"> ({{ cartCount }})</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Info: cómo ganar bono -->
      <div class="earn-info-bar" :class="{ 'is-expanded': earnInfoExpanded }">
        <div class="earn-info-text">
          <i class="fas fa-lightbulb earn-info-icon"></i>
          <div class="earn-info-copy">
            <p class="earn-info-question">¿Cómo gano Bono Ahorro?</p>
            <div class="earn-info-expandable">
              <p class="earn-info-answer">
                Realiza compras personales adicionales a las 4 compras mínimas mensuales y acumula saldo de Bono Ahorro.
              </p>
              <router-link to="/bonus-history" class="earn-info-link earn-info-link-inline">
                Ver más detalles <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="earn-info-toggle"
          :aria-expanded="earnInfoExpanded ? 'true' : 'false'"
          aria-label="Mostrar cómo ganar Bono Ahorro"
          @click="earnInfoExpanded = !earnInfoExpanded"
        >
          <i class="fas fa-chevron-down earn-info-chevron"></i>
        </button>
        <router-link to="/bonus-history" class="earn-info-link earn-info-link-side">
          Ver más detalles <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <!-- Search & Categories Section -->
      <div class="controls-section">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Buscar productos..." v-model="searchTerm" />
        </div>

        <div class="category-pills-wrap">
          <div class="category-pills">
            <button
              v-for="cat in visualCategories"
              :key="cat.name"
              class="pill"
              :class="{ active: selectedCategory === cat.name }"
              :aria-pressed="selectedCategory === cat.name ? 'true' : 'false'"
              @click="selectCategory(cat.name)"
              type="button"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Featured Products Section -->
      <div class="featured-section">
        <div class="section-header">
          <h3>Productos disponibles para canjear</h3>
          <div class="sort-control">
            <label for="sort-by">Ordenar por:</label>
            <select id="sort-by" v-model="sortBy" class="sort-select">
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="products-loading">
          <Spinner :size="36" color="#e91e63" />
          <p>Cargando productos...</p>
        </div>

        <div v-else-if="!sortedFilteredProducts.length" class="products-empty">
          <i class="fas fa-box-open"></i>
          <p v-if="searchTerm || selectedCategory !== 'Todos'">
            No hay productos que coincidan con tu búsqueda o categoría.
          </p>
          <p v-else>No hay productos disponibles para canjear en este momento.</p>
        </div>

        <div v-else class="products-grid">
          <div v-for="product in sortedFilteredProducts" :key="product.id" class="product-card">
            <div class="info-icon" @click="showProductDetail(product)">i</div>
            <div class="product-image">
              <img :src="product.img" :alt="product.name" />
            </div>
            <div class="product-details">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-sub">{{ categoryLabel(product) || product.sub || product.type }}</p>
              <div class="product-price">
                <img
                  class="price-coin-img"
                  src="../../assets/img/coin-saldo-icon.png"
                  alt=""
                />
                <span>{{ formatCoins(product.price) }}</span>
              </div>
              <div v-if="cartQty(product.id) > 0" class="cart-qty-control">
                <button type="button" class="qty-btn" @click="updateCartQty(product, -1)" aria-label="Disminuir cantidad">−</button>
                <span class="qty-value">{{ cartQty(product.id) }}</span>
                <button type="button" class="qty-btn" @click="updateCartQty(product, 1)" aria-label="Aumentar cantidad">+</button>
              </div>
              <button v-else type="button" class="redeem-btn" @click="addToCart(product)">
                Canjear <i class="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="saldo-info-bar" :class="{ 'is-expanded': saldoInfoExpanded }">
        <div class="saldo-info-text">
          <i class="fas fa-info-circle saldo-info-icon"></i>
          <div class="saldo-info-copy">
            <p class="saldo-info-question">¿Te falta saldo?</p>
            <div class="saldo-info-expandable">
              <p class="saldo-info-answer">
                Puedes completar con dinero la diferencia para llevarte el producto que deseas.
              </p>
              <button type="button" class="saldo-info-btn saldo-info-btn-inline" @click="showSaldoHelp">
                Conoce cómo funciona <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="saldo-info-toggle"
          :aria-expanded="saldoInfoExpanded ? 'true' : 'false'"
          aria-label="Mostrar información de saldo"
          @click="saldoInfoExpanded = !saldoInfoExpanded"
        >
          <i class="fas fa-chevron-down saldo-info-chevron"></i>
        </button>
        <button type="button" class="saldo-info-btn saldo-info-btn-side" @click="showSaldoHelp">
          Conoce cómo funciona <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import Spinner from "@/components/Spinner";
import api from "@/api";
import Swal from "sweetalert2";
import {
  loadBonusCart,
  saveBonusCart,
  clearBonusCart,
} from "@/utils/savingsBonusCart";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      sifrahBalance: 0,
      loading: true,
      selectedCategory: "Todos",
      searchTerm: "",
      sortBy: "featured",
      featuredProducts: [],
      apiCategories: [],
      bonusCart: [],
      earnInfoExpanded: false,
      saldoInfoExpanded: false,
    };
  },
  computed: {
    session() { return this.$store.state.session; },
    office_id() { return this.$store.state.office_id; },
    title() { return "Bono Ahorro"; },
    cartCount() {
      return this.bonusCart.reduce((sum, item) => sum + (item.qty || 1), 0);
    },
    visualCategories() {
      const todos = { name: "Todos", id: null };
      const apiCats = (this.apiCategories || []).map((c) => ({
        id: c.id,
        name: c.name,
      }));

      if (apiCats.length) {
        return [todos, ...apiCats];
      }

      const fromProducts = [
        ...new Set(
          this.featuredProducts
            .map((p) => this.categoryLabel(p))
            .filter((name) => name && name !== "Promociones")
        ),
      ].map((name) => ({ name, id: null }));

      if (fromProducts.length) {
        return [todos, ...fromProducts];
      }

      const defaults = [
        "Salud y Bienestar",
        "Hogar",
        "Tecnología",
        "Electrodomésticos",
        "Accesorios",
        "Beneficios",
      ].map((name) => ({ name, id: null }));

      return [todos, ...defaults];
    },
    selectedCategoryObj() {
      if (this.selectedCategory === "Todos") return null;
      return this.visualCategories.find((c) => c.name === this.selectedCategory) || null;
    },
    filteredProducts() {
      return this.featuredProducts.filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (p.type || "").toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (p.sub || "").toLowerCase().includes(this.searchTerm.toLowerCase());
        const cat = this.selectedCategoryObj;
        const productCategory = this.categoryLabel(p);
        const matchesCategory =
          this.selectedCategory === "Todos" ||
          (this.selectedCategory === "Productos SIFRAH" &&
            (p.catalog_type === "both" || p.catalog_type === "sifrah") &&
            !p.is_promotion) ||
          (this.selectedCategory === "Promociones" && p.is_promotion) ||
          (cat && cat.id && p.savings_category_id === cat.id) ||
          productCategory === this.selectedCategory ||
          (p.type && p.type.toUpperCase() === this.selectedCategory.toUpperCase()) ||
          (p.sub && p.sub.toUpperCase() === this.selectedCategory.toUpperCase());
        return matchesSearch && matchesCategory;
      });
    },
    sortedFilteredProducts() {
      const list = [...this.filteredProducts];
      if (this.sortBy === "price-asc") {
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      }
      if (this.sortBy === "price-desc") {
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      }
      if (this.sortBy === "name") {
        return list.sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
      }
      return list;
    },
  },
  watch: {
    bonusCart: {
      deep: true,
      handler() {
        this.saveCart();
      },
    },
  },
  async created() {
    this.bonusCart = loadBonusCart(this.session);
    await this.fetchData();
  },
  methods: {
    loadCart() {
      this.bonusCart = loadBonusCart(this.session);
    },
    saveCart() {
      saveBonusCart(this.session, this.bonusCart);
    },
    clearCart() {
      this.bonusCart = [];
      clearBonusCart(this.session);
    },
    async fetchData() {
      try {
        this.loading = true;
        // Ejecutar dashboard (para el saldo) y la nueva API dedicada de productos en paralelo
        const [dashResponse, productsResponse] = await Promise.all([
          api.dashboard(this.session),
          api.SavingsBonus.GET(this.session)
        ]);

        const dashData = dashResponse.data;
        let balance = 0;

        if (dashData && !dashData.error) {
          balance = Number(dashData.sifrahBalance) || 0;
        } else if (dashData && dashData.msg === "invalid session") {
          this.$router.push("/login");
          return;
        }

        const productsData = productsResponse.data;
        if (productsData && !productsData.error) {
          if (productsData.products) {
            this.featuredProducts = productsData.products;
          }
          if (productsData.categories) {
            this.apiCategories = productsData.categories;
          }
          if (productsData.savingsBalance != null) {
            balance = Number(productsData.savingsBalance) || 0;
          }
        }

        this.sifrahBalance = balance;
      } catch (e) {
        console.error("Error fetching savings data:", e);
      } finally {
        this.loading = false;
      }
    },
    selectCategory(cat) {
      this.selectedCategory = cat;
    },
    categoryLabel(product) {
      if (!product) return "";
      const aliases = {
        SALUD: "Salud y Bienestar",
        BELLEZA: "Salud y Bienestar",
        BIENESTAR: "Salud y Bienestar",
        HOGAR: "Hogar",
        TECNOLOGIA: "Tecnología",
        TECNOLOGÍA: "Tecnología",
        ELECTRODOMESTICOS: "Electrodomésticos",
        ELECTRODOMÉSTICOS: "Electrodomésticos",
        ACCESORIOS: "Accesorios",
        BENEFICIOS: "Beneficios",
      };
      const raw = String(product.sub || product.type || "").trim();
      if (!raw) return "";
      const upper = raw.toUpperCase();
      if (aliases[upper]) return aliases[upper];
      return raw
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
    formatCoins(value) {
      const n = Number(value);
      const safe = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
      return safe.toLocaleString("es-PE");
    },
    showProductDetail(product) {
      Swal.fire({
        title: product.name,
        html: `<p style="margin:0 0 8px;color:#666">${product.sub || product.type || ""}</p><p style="margin:0;font-size:1.25rem;font-weight:700;color:#e91e63">${this.formatCoins(product.price)}</p>`,
        imageUrl: product.img,
        imageWidth: 180,
        confirmButtonColor: "#e91e63",
        confirmButtonText: "Cerrar",
      });
    },
    showSaldoHelp() {
      Swal.fire({
        icon: "info",
        title: "¿Te falta saldo?",
        text: "Si el producto que deseas supera tu saldo de Bono Ahorro, puedes completar la diferencia con dinero al momento del canje.",
        confirmButtonColor: "#e91e63",
        confirmButtonText: "Entendido",
      });
    },
    addToCart(product) {
      const existing = this.bonusCart.find((item) => item.id === product.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        this.bonusCart.push({ ...product, qty: 1 });
      }
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Producto agregado al carrito",
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true,
      });
    },
    cartQty(productId) {
      const item = this.bonusCart.find((p) => p.id === productId);
      return item ? (item.qty || 1) : 0;
    },
    updateCartQty(product, delta) {
      const idx = this.bonusCart.findIndex((item) => item.id === product.id);
      if (idx === -1) return;
      const item = this.bonusCart[idx];
      const next = (item.qty || 1) + delta;
      if (next <= 0) {
        this.bonusCart.splice(idx, 1);
        return;
      }
      this.$set(item, "qty", next);
    },
    openCart() {
      if (!this.bonusCart.length) {
        Swal.fire({
          icon: "info",
          title: "Carrito vacío",
          text: "Agrega productos con el botón Canjear para continuar.",
          confirmButtonColor: "#e91e63",
        });
        return;
      }
      this.saveCart();
      this.$router.push("/savings-bonus/checkout");
    },
  }
};
</script>

<style lang="stylus" scoped>
@import "../../assets/style/vars.styl"

tablet-break = 900px

.savings-bonus-container
  box-sizing border-box
  width 100%
  max-width 1800px
  margin 0 0 0 20px
  padding 20px
  background #fafafa
  min-height 100vh
  font-family 'Inter', sans-serif

  @media (max-width 1800px)
    max-width 95%
    padding 15px
    margin 0 0 0 15px

  @media (max-width 768px)
    max-width 100%
    padding 10px
    margin 0 0 0 10px

  @media (max-width 480px)
    padding 8px
    margin 0 0 0 8px

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

  @media (min-width 901px)
    gap 20px
    margin-bottom 20px

  @media (max-width tablet-break)
    grid-template-columns 1fr

.promo-banner
  background linear-gradient(135deg, #fce4ec 0%, #f8bbd0 45%, #f48fb1 100%)
  border-radius 16px
  padding 22px 20px 20px 32px
  display flex
  align-items center
  justify-content flex-start
  color #2d3436
  overflow hidden
  position relative
  box-shadow 0 8px 24px rgba(233, 30, 99, 0.08)
  box-sizing border-box
  min-height 230px
  height auto

  @media (min-width 901px)
    min-height 250px
    padding 32px 28px 28px 40px

  .banner-content
    flex 0 0 52%
    max-width 52%
    position relative
    z-index 1
    padding 2px 12px 0 0
    align-self center
    h2
      font-size 32px
      font-weight 700
      margin 0 0 16px 0
      line-height 1.25
      color #2d3436
      .banner-highlight
        color #e91e63
    p
      font-size 16px
      font-weight 400
      color #636e72
      margin 0
      line-height 1.5
      max-width 28em

    @media (min-width 901px)
      h2
        font-size 2.1rem
      p
        font-size 1rem

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
  background linear-gradient(160deg, #1e2a5a 0%, #2d1b69 55%, #301050 100%)
  border-radius 18px
  padding 20px 22px 18px 22px
  color #fff
  display flex
  flex-direction column
  justify-content space-between
  box-shadow 0 10px 24px rgba(48, 16, 80, 0.2)
  box-sizing border-box
  min-height 230px

  @media (min-width 901px)
    min-height 250px
    padding 24px 24px 20px

  .balance-label
    font-size 15px
    font-weight 500
    color rgba(255,255,255,0.92)
    margin 0 0 12px 0

  .balance-amount
    font-size 42px
    font-weight 700
    color #fff
    margin 0 0 12px 0
    display flex
    align-items center
    gap 10px
    line-height 1

    .balance-value
      font-size 2.5rem
      font-weight 800
      min-width 1ch
      display inline-block

    .coin-icon-img
      width 36px
      height 36px
      flex-shrink 0
      object-fit contain

  .balance-meta
    margin-bottom 16px

  .balance-note
    font-size 13px
    font-weight 400
    color rgba(255,255,255,0.88)
    margin 0 0 4px 0
    display flex
    align-items center
    gap 6px

    i
      font-size 12px
      opacity 0.8

  .balance-subnote
    font-size 12px
    color rgba(255,255,255,0.75)
    margin 0

  .cart-btn
    background white
    color #e91e63
    border none
    border-radius 10px
    padding 12px 16px
    font-size 14px
    font-weight 700
    cursor pointer
    display flex
    align-items center
    justify-content center
    gap 8px
    width 100%
    transition 0.3s

    &:hover
      transform translateY(-1px)
      box-shadow 0 6px 16px rgba(0,0,0,0.12)

  @media (max-width m-break)
    padding 16px 18px 14px 18px
    min-height auto

    .balance-label
      font-size 13px
      margin 0 0 6px 0

    .balance-amount
      font-size 26px
      margin 0 0 8px 0

      .coin-icon-img
        width 26px
        height 26px

    .balance-note
      font-size 12px
      margin 0 0 12px 0

.earn-info-bar
  display flex
  align-items center
  justify-content space-between
  gap 16px
  background #fff8f0
  border 1px solid #ffe8cc
  border-radius 14px
  padding 14px 20px
  margin-bottom 18px

  .earn-info-text
    display flex
    align-items flex-start
    gap 12px
    flex 1
    min-width 0

  .earn-info-icon
    color #f59e0b
    font-size 1.1rem
    margin-top 4px
    flex-shrink 0

  .earn-info-copy
    display flex
    flex-direction column
    gap 2px
    flex 1
    min-width 0

  .earn-info-question
    margin 0
    font-size 0.95rem
    font-weight 700
    color #2d3436
    line-height 1.25

  .earn-info-toggle
    display none
    align-items center
    justify-content center
    width 32px
    height 32px
    padding 0
    border none
    background transparent
    color #8B5E34
    cursor pointer
    flex-shrink 0

  .earn-info-chevron
    font-size 1rem
    transition transform 0.2s ease

  .earn-info-expandable
    display block

  .earn-info-answer
    margin 0
    font-size 0.88rem
    color #666
    line-height 1.35
    text-align left

  .earn-info-link
    color #8B5E34
    font-size 0.85rem
    font-weight 600
    text-decoration none
    white-space nowrap
    display flex
    align-items center
    gap 6px
    padding 8px 14px
    border-radius 8px
    background rgba(255, 255, 255, 0.55)
    border 1px solid #E8D5B5
    transition background 0.2s, color 0.2s
    flex-shrink 0

    &.earn-info-link-inline
      display none

    i
      color #8B5E34
      font-size 0.8rem

    &:hover
      background #fff
      color #6F4A28
      text-decoration none

      i
        color #6F4A28

.controls-section
  display flex
  gap 14px
  align-items center
  margin-bottom 14px
  flex-wrap nowrap

  @media (min-width 901px)
    margin-bottom 20px
    gap 16px

.search-bar
  flex 0 1 360px
  min-width 200px
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

.category-pills-wrap
  position relative
  flex 1
  min-width 0

  &::after
    content ''
    position absolute
    top 0
    right 0
    width 32px
    height 100%
    pointer-events none
    background linear-gradient(to left, #fafafa 20%, transparent)

.category-pills
  display flex
  gap 10px
  flex 1
  min-width 0
  overflow-x auto
  flex-wrap nowrap
  padding 0
  margin 0
  flex-shrink 1
  -webkit-overflow-scrolling touch
  scrollbar-width none
  -ms-overflow-style none
  
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

.featured-section
  margin-bottom 20px

  .section-header
    display flex
    justify-content space-between
    align-items center
    margin-bottom 20px
    gap 16px
    
    h3
      font-size 20px
      font-weight 800
      color #2d3436
      margin 0
      padding-left 10px
      border-left 4px solid #e91e63

    .sort-control
      display flex
      align-items center
      gap 8px
      font-size 0.88rem
      color #666
      white-space nowrap

      label
        font-weight 500

      .sort-select
        border 1px solid #e0e0e0
        border-radius 8px
        padding 6px 30px 6px 10px
        font-size 0.88rem
        color #2d3436
        background-color #fff
        background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
        background-repeat no-repeat
        background-position right 14px center
        appearance none
        -webkit-appearance none
        -moz-appearance none
        cursor pointer
        outline none

        &:focus
          border-color #e91e63

.products-loading,
.products-empty
  display flex
  flex-direction column
  align-items center
  justify-content center
  gap 12px
  padding 48px 24px
  text-align center
  color #636e72

.products-empty
  i
    font-size 2rem
    color #b2bec3

  p
    margin 0
    font-size 0.95rem
    line-height 1.5
    max-width 320px

.products-grid
  display grid
  grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
  gap 20px

  @media (min-width 901px)
    grid-template-columns repeat(3, 1fr)
    gap 18px

  @media (min-width 1200px)
    grid-template-columns repeat(6, 1fr)

.product-card
  background white
  border-radius 16px
  padding 14px
  position relative
  transition 0.3s
  border 1px solid #f0f0f0
  box-shadow 0 2px 8px rgba(0,0,0,0.04)
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
      font-size 14px
      font-weight 800
      color #2d3436
      margin 0 0 4px 0
      text-transform none
      line-height 1.3

    .product-sub
      font-size 12px
      color #b2bec3
      margin-bottom 10px

    .product-price
      font-size 18px
      font-weight 800
      color #2d3436
      margin-bottom 12px
      display flex
      align-items center
      justify-content center
      gap 6px

      .price-coin-img
        width 20px
        height 20px
        object-fit contain

    .redeem-btn
      background #e91e63
      color white
      border none
      border-radius 10px
      padding 10px
      font-weight 700
      font-size 0.88rem
      width 100%
      cursor pointer
      transition 0.3s
      display flex
      align-items center
      justify-content center
      gap 8px
      margin-top auto
      
      &:hover
        background #d81b60
        box-shadow 0 4px 12px rgba(233, 30, 99, 0.3)

    .cart-qty-control
      display flex
      align-items center
      width 100%
      margin-top auto
      border 1px solid #f3d1df
      border-radius 10px
      background #fff
      overflow hidden
      min-height 42px

      .qty-btn
        flex 1
        border none
        background transparent
        color #e91e63
        font-size 1.25rem
        font-weight 600
        line-height 1
        cursor pointer
        padding 10px 8px
        transition 0.2s

        &:hover
          background #fff5f8

      .qty-value
        flex 0 0 36px
        text-align center
        font-size 1rem
        font-weight 700
        color #2d3436

.saldo-info-bar
  display flex
  align-items center
  justify-content space-between
  gap 16px
  background #e8f4fd
  border 1px solid #bee3f8
  border-radius 14px
  padding 14px 20px
  margin-top 8px

  .saldo-info-text
    display flex
    align-items flex-start
    gap 12px
    flex 1
    min-width 0

  .saldo-info-icon
    color #3182ce
    font-size 1.1rem
    margin-top 4px
    flex-shrink 0

  .saldo-info-copy
    display flex
    flex-direction column
    gap 2px
    flex 1
    min-width 0

  .saldo-info-question
    margin 0
    font-size 0.95rem
    font-weight 700
    color #1a365d
    line-height 1.25

  .saldo-info-toggle
    display none
    align-items center
    justify-content center
    width 32px
    height 32px
    padding 0
    border none
    background transparent
    color #2b6cb0
    cursor pointer
    flex-shrink 0

  .saldo-info-chevron
    font-size 1rem
    transition transform 0.2s ease

  .saldo-info-expandable
    display block

  .saldo-info-answer
    margin 0
    font-size 0.88rem
    color #2c5282
    line-height 1.35

  .saldo-info-btn
    background transparent
    border 1px solid #63b3ed
    color #2b6cb0
    border-radius 8px
    padding 8px 14px
    font-size 0.85rem
    font-weight 600
    cursor pointer
    white-space nowrap
    display flex
    align-items center
    gap 6px
    transition 0.2s
    flex-shrink 0

    &.saldo-info-btn-inline
      display none

    &:hover
      background rgba(99, 179, 237, 0.15)

@media (max-width tablet-break)
  .earn-info-bar
    display grid
    grid-template-columns auto 1fr auto
    grid-template-rows auto auto
    column-gap 10px
    row-gap 0
    padding 12px 14px
    align-items center

    .earn-info-text
      display contents

    .earn-info-copy
      display contents

    .earn-info-icon
      grid-column 1
      grid-row 1
      margin-top 0
      align-self center

    .earn-info-question
      grid-column 2
      grid-row 1
      align-self center
      font-size 0.9rem

    .earn-info-toggle
      display flex
      grid-column 3
      grid-row 1
      justify-self end
      align-self center

    .earn-info-link-side
      display none

    .earn-info-expandable
      display none
      grid-column 1 / -1
      grid-row 2
      margin-top 10px
      padding-top 10px
      border-top 1px solid rgba(232, 213, 181, 0.65)

    &.is-expanded
      align-items start

      .earn-info-expandable
        display flex
        flex-direction column
        align-items flex-start
        gap 10px

      .earn-info-answer
        font-size 0.84rem
        line-height 1.5
        color #5c5c5c

      .earn-info-chevron
        transform rotate(180deg)

    .earn-info-link.earn-info-link-inline
      display inline-flex
      margin-top 0
      align-self flex-start

  .saldo-info-bar
    display grid
    grid-template-columns auto 1fr auto
    grid-template-rows auto auto
    column-gap 10px
    row-gap 0
    padding 12px 14px
    align-items center

    .saldo-info-text
      display contents

    .saldo-info-copy
      display contents

    .saldo-info-icon
      grid-column 1
      grid-row 1
      margin-top 0
      align-self center

    .saldo-info-question
      grid-column 2
      grid-row 1
      align-self center
      font-size 0.9rem

    .saldo-info-toggle
      display flex
      grid-column 3
      grid-row 1
      justify-self end
      align-self center

    .saldo-info-btn-side
      display none

    .saldo-info-expandable
      display none
      grid-column 1 / -1
      grid-row 2
      margin-top 10px
      padding-top 10px
      border-top 1px solid rgba(99, 179, 237, 0.35)

    &.is-expanded
      align-items start

      .saldo-info-expandable
        display flex
        flex-direction column
        align-items flex-start
        gap 10px

      .saldo-info-answer
        font-size 0.84rem
        line-height 1.5

      .saldo-info-chevron
        transform rotate(180deg)

    .saldo-info-btn.saldo-info-btn-inline
      display inline-flex
      margin-top 0
      align-self flex-start

  .controls-section
    flex-direction column
    align-items stretch
    gap 12px

    .search-bar
      flex 1 1 100%
      min-width 0

    .category-pills-wrap
      width 100%

  .featured-section .section-header
    flex-direction column
    align-items flex-start

  .products-grid
    grid-template-columns repeat(2, 1fr)
    gap 12px
</style>
