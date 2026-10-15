<template>
  <div class="shared-store-product-page" v-cloak>
    <!-- Barra superior con logo SIFRAH y datos del socio distribuidor -->
    <SharedStoreHeader
      :ownerName="ownerFirstName"
      :ownerLastName="ownerLastName"
      :ownerFullName="ownerFullName"
      :ownerPhoto="ownerPhoto"
      :ownerId="ownerId"
    />

    <!-- Estado de carga -->
    <div v-if="loading" class="product-page-loading">
      <div class="spinner-wrapper">
        <div class="loading-spinner-large"></div>
        <p>Cargando información del producto...</p>
      </div>
    </div>

    <!-- Error / Producto no encontrado -->
    <div v-else-if="!product" class="product-not-found-container">
      <div class="not-found-card">
        <i class="fas fa-box-open not-found-icon"></i>
        <h2>Producto no encontrado</h2>
        <p>El producto solicitado no está disponible en este momento.</p>
        <router-link :to="'/tienda/' + ownerId" class="btn-return-store">
          <i class="fas fa-arrow-left"></i> Volver a la tienda
        </router-link>
      </div>
    </div>

    <!-- Contenido del producto -->
    <main v-else class="product-page-main">
      <div class="product-page-container">
        <!-- Navegación de retorno -->
        <nav class="product-breadcrumb">
          <router-link :to="'/tienda/' + ownerId" class="breadcrumb-back-btn">
            <i class="fas fa-arrow-left"></i>
            <span>Volver a la tienda</span>
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-category">{{ product.type || 'Catálogo' }}</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ product.name }}</span>
        </nav>

        <!-- Detalle del producto en 2 columnas -->
        <div class="product-detail-card">
          <!-- Columna Izquierda: Imagen del producto -->
          <div class="product-image-section">
            <div class="product-badge" v-if="product.type">
              {{ product.type }}
            </div>
            <div class="product-image-box">
              <img
                :src="product.img"
                :alt="product.name"
                class="product-detail-img"
                @load="imageLoaded = true"
                v-show="imageLoaded"
              />
              <div v-if="!imageLoaded" class="image-skeleton-loader">
                <div class="loading-spinner"></div>
                <span>Cargando imagen...</span>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Información, precio y compra -->
          <div class="product-info-section">
            <h1 class="product-title">{{ product.name }}</h1>
            <p v-if="product.subdescription" class="product-subtitle">
              {{ product.subdescription }}
            </p>

            <div class="product-price-box">
              <span class="price-label">Precio:</span>
              <span class="price-value">S/ {{ getProductPrice(product).toFixed(2) }}</span>
            </div>

            <!-- Selector de cantidad -->
            <div class="product-quantity-selector">
              <span class="quantity-label">Cantidad:</span>
              <div class="quantity-controls">
                <button
                  type="button"
                  @click="decreaseQuantity"
                  class="qty-btn"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <span class="qty-number">{{ quantity }}</span>
                <button
                  type="button"
                  @click="increaseQuantity"
                  class="qty-btn"
                  :disabled="quantity >= 10"
                >
                  +
                </button>
              </div>
              <span v-if="quantity >= 10" class="max-qty-notice">Máx. 10 unidades</span>
            </div>

            <!-- Botones de acción principales -->
            <div class="product-actions-group">
              <button
                type="button"
                @click="addToCartAndNotify"
                class="btn-add-cart"
              >
                <i class="fas fa-shopping-cart"></i>
                <span>Agregar al carrito</span>
              </button>
              <button
                type="button"
                @click="buyNow"
                class="btn-buy-now"
              >
                <i class="fas fa-bolt"></i>
                <span>Comprar ahora</span>
              </button>
            </div>

            <!-- Mensaje de feedback al agregar -->
            <transition name="fade">
              <div v-if="addedFeedback" class="added-feedback-toast">
                <i class="fas fa-check-circle"></i>
                <span>¡Producto agregado al carrito!</span>
              </div>
            </transition>

            <!-- Opciones para compartir producto -->
            <div class="product-share-container">
              <span class="product-share-title"><i class="fas fa-share-alt"></i> Compartir este producto:</span>
              <div class="product-share-actions">
                <button
                  type="button"
                  @click="shareOnWhatsApp"
                  class="btn-share-item btn-share-whatsapp"
                >
                  <i class="fab fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  @click="copyProductLink"
                  class="btn-share-item btn-share-copy"
                  :class="{ copied: linkCopied }"
                >
                  <i :class="linkCopied ? 'fas fa-check' : 'fas fa-link'"></i>
                  <span>{{ linkCopied ? '¡Copiado!' : 'Copiar enlace' }}</span>
                </button>
              </div>
            </div>

            <!-- Descripción detallada -->
            <div class="product-description-block">
              <h3>Descripción del producto</h3>
              <p class="description-text">
                {{ getProductDescription(product) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sección de Productos Relacionados -->
        <section v-if="relatedProducts.length > 0" class="related-products-section">
          <div class="related-header">
            <h2 class="related-title">Productos Relacionados</h2>
            <p class="related-subtitle">Otros productos recomendados de la tienda</p>
          </div>

          <div class="related-grid">
            <div
              v-for="rel in relatedProducts"
              :key="rel.id"
              class="related-card"
              @click="goToRelated(rel.id)"
            >
              <div class="related-img-box">
                <img :src="rel.img" :alt="rel.name" class="related-img" />
                <span v-if="rel.type" class="related-badge">{{ rel.type }}</span>
              </div>
              <div class="related-body">
                <h3 class="related-name">{{ rel.name }}</h3>
                <div class="related-price-row">
                  <span class="related-price">S/ {{ getProductPrice(rel).toFixed(2) }}</span>
                  <span class="btn-related-view">
                    Ver <i class="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Barra flotante de carrito inferior (si tiene productos) -->
    <div v-if="cartItemsCount > 0" class="floating-cart-bottombar">
      <div class="floating-cart-content">
        <div class="floating-cart-info">
          <i class="fas fa-shopping-cart cart-icon"></i>
          <span class="cart-count">{{ cartItemsCount }} {{ cartItemsCount === 1 ? 'producto' : 'productos' }}</span>
          <span class="cart-total">Total: S/ {{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="floating-cart-actions">
          <router-link :to="'/tienda/' + ownerId" class="btn-more-products">
            Ver más productos
          </router-link>
          <button @click="goToCheckout" class="btn-floating-checkout">
            Finalizar compra <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SharedStoreHeader from "@/components/SharedStoreHeader.vue";
import api from "@/api";
import { mockSharedStoreData } from "@/mocks/sharedStoreMock";

function isPromotionProduct(product) {
  if (!product) return false;
  return (
    product.is_promotion === true ||
    product.catalog_type === "promotion" ||
    product.type === "Promoción"
  );
}

export default {
  name: "SharedStoreProduct",
  components: {
    SharedStoreHeader
  },
  data() {
    return {
      loading: true,
      imageLoaded: false,
      product: null,
      quantity: 1,
      cartItems: [],
      addedFeedback: false,
      feedbackTimer: null,
      ownerId: null,
      ownerName: "Sifrah",
      ownerFirstName: "",
      ownerLastName: "",
      ownerFullName: "",
      ownerPhoto: null,
      allProducts: [],
      linkCopied: false
    };
  },
  computed: {
    cartItemsCount() {
      return this.cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
    },
    cartTotal() {
      return this.cartItems.reduce(
        (sum, item) => sum + this.getProductPrice(item) * (item.total || 0),
        0
      );
    },
    relatedProducts() {
      if (!this.product || !this.allProducts.length) return [];
      const others = this.allProducts.filter(
        (p) => String(p.id) !== String(this.product.id) && p.visible_shared_store !== false
      );
      const sameCategory = others.filter((p) => p.type && p.type === this.product.type);
      const otherCategory = others.filter((p) => !p.type || p.type !== this.product.type);
      return [...sameCategory, ...otherCategory].slice(0, 4);
    }
  },
  watch: {
    "$route.params.productId"(newId) {
      if (newId) {
        this.selectProductById(newId);
      }
    }
  },
  methods: {
    getProductPrice(prod) {
      if (!prod) return 0;
      return Number(prod.price_socio || prod.price || 0);
    },
    getProductDescription(prod) {
      if (!prod) return "";
      return prod.description || prod.subdescription || "Producto de nutrición y bienestar Sifrah.";
    },
    productShareUrl() {
      const baseUrl = window.location.origin;
      return `${baseUrl}/tienda/${this.ownerId}/producto/${this.product ? this.product.id : ""}`;
    },
    shareOnWhatsApp() {
      if (!this.product) return;
      const url = this.productShareUrl();
      const text = encodeURIComponent(
        `¡Mira este producto en Sifrah! ${this.product.name} (S/ ${this.getProductPrice(this.product).toFixed(2)}): ${url}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
    },
    async copyProductLink() {
      try {
        await navigator.clipboard.writeText(this.productShareUrl());
        this.linkCopied = true;
        setTimeout(() => {
          this.linkCopied = false;
        }, 3000);
      } catch (err) {
        console.error("Error al copiar enlace:", err);
      }
    },
    goToRelated(productId) {
      if (String(productId) === String(this.$route.params.productId)) return;
      this.$router.push(`/tienda/${this.ownerId}/producto/${productId}`);
    },
    selectProductById(productId) {
      this.product =
        this.allProducts.find((p) => String(p.id) === String(productId)) || null;
      this.quantity = 1;
      this.imageLoaded = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    loadCartFromSession() {
      if (!this.ownerId) return;
      try {
        const raw = sessionStorage.getItem("sifrah_store_cart_" + this.ownerId);
        if (raw) {
          this.cartItems = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Error reading cart from sessionStorage:", err);
      }
    },
    saveCartToSession() {
      if (!this.ownerId) return;
      try {
        sessionStorage.setItem(
          "sifrah_store_cart_" + this.ownerId,
          JSON.stringify(this.cartItems)
        );
      } catch (err) {
        console.error("Error saving cart to sessionStorage:", err);
      }
    },
    increaseQuantity() {
      if (this.quantity < 10) {
        this.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    addToCartAndNotify() {
      if (!this.product) return;
      const existing = this.cartItems.find(item => String(item.id) === String(this.product.id));
      if (existing) {
        existing.total = Math.min(10, existing.total + this.quantity);
      } else {
        this.cartItems.push({
          id: this.product.id,
          name: this.product.name,
          img: this.product.img || "",
          total: this.quantity,
          price: this.getProductPrice(this.product),
          points: Number(this.product.points) || 0
        });
      }
      this.saveCartToSession();

      this.addedFeedback = true;
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
      this.feedbackTimer = setTimeout(() => {
        this.addedFeedback = false;
      }, 3500);
    },
    buyNow() {
      this.addToCartAndNotify();
      this.goToCheckout();
    },
    goToCheckout() {
      if (this.cartItems.length === 0 || !this.ownerId) return;
      this.saveCartToSession();
      this.$router.push("/tienda/" + this.ownerId + "/checkout");
    }
  },
  async created() {
    this.ownerId = this.$route.params.userId;
    const productId = this.$route.params.productId;

    if (!this.ownerId || !productId) {
      this.loading = false;
      return;
    }

    this.loadCartFromSession();

    try {
      const { data } = await api.SharedStore.GET(this.ownerId);

      if (data && !data.error) {
        this.ownerName = data.ownerName || data.ownerFullName || "Sifrah";
        this.ownerFirstName = data.ownerFirstName || data.ownerName || "";
        this.ownerLastName = data.ownerLastName || "";
        this.ownerFullName = data.ownerFullName || `${this.ownerFirstName} ${this.ownerLastName}`.trim();
        this.ownerPhoto = data.ownerPhoto || null;

        const allProducts = data.products
          ? data.products.filter(p => !isPromotionProduct(p) && p.visible_shared_store !== false)
          : [];

        this.allProducts = allProducts;
        this.product = allProducts.find(p => String(p.id) === String(productId)) || null;
      } else {
        throw new Error((data && data.msg) || "Error al cargar datos");
      }
    } catch (err) {
      console.warn("API de tienda no disponible, usando fallback mock:", err);
      const mock = mockSharedStoreData;
      this.ownerName = mock.ownerName;
      this.ownerFirstName = mock.ownerFirstName || "";
      this.ownerLastName = mock.ownerLastName || "";
      this.ownerFullName = mock.ownerFullName || mock.ownerName;
      this.ownerPhoto = mock.ownerPhoto || null;

      const mockProducts = (mock.products || []).filter(
        (p) => !isPromotionProduct(p) && p.visible_shared_store !== false
      );
      this.allProducts = mockProducts;
      this.product = mockProducts.find(p => String(p.id) === String(productId)) || null;
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.shared-store-product-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 90px;
}

.product-page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.spinner-wrapper {
  text-align: center;
  color: #475569;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #00ae62;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-not-found-container {
  max-width: 500px;
  margin: 60px auto;
  padding: 0 16px;
  text-align: center;
}

.not-found-card {
  background: #ffffff;
  padding: 40px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.not-found-icon {
  font-size: 54px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.btn-return-store {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #00ae62;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 20px;
  transition: background-color 0.2s ease;
}

.btn-return-store:hover {
  background-color: #009353;
}

/* Breadcrumb */
.product-page-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  box-sizing: border-box;
}

.product-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.breadcrumb-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #00ae62;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.breadcrumb-back-btn:hover {
  color: #00874c;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 600;
}

/* Tarjeta principal de detalle */
.product-detail-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  padding: 36px;
  box-sizing: border-box;
}

/* Columna Izquierda */
.product-image-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  min-height: 380px;
}

.product-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #001c50;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-image-box {
  width: 100%;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-detail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-detail-img:hover {
  transform: scale(1.05);
}

.image-skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}

/* Columna Derecha */
.product-info-section {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.25;
}

.product-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.product-price-box {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 20px;
  background: #f0fdf4;
  border-left: 4px solid #00ae62;
  border-radius: 8px;
  margin-bottom: 24px;
}

.price-label {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
  text-transform: uppercase;
}

.price-value {
  font-size: 30px;
  font-weight: 800;
  color: #15803d;
}

/* Controles de cantidad */
.product-quantity-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.quantity-label {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  background: #f1f5f9;
  border: none;
  width: 38px;
  height: 38px;
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-number {
  min-width: 44px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.max-qty-notice {
  font-size: 12px;
  color: #e11d48;
}

/* Acciones */
.product-actions-group {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.btn-add-cart,
.btn-buy-now {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.btn-add-cart {
  background: #00ae62;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 174, 98, 0.25);
}

.btn-add-cart:hover {
  background: #009353;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 174, 98, 0.35);
}

.btn-buy-now {
  background: #001c50;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 28, 80, 0.25);
}

.btn-buy-now:hover {
  background: #002b7a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 28, 80, 0.35);
}

/* Toast de feedback */
.added-feedback-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.product-description-block {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  margin-top: auto;
}

.product-description-block h3 {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
}

.description-text {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  white-space: pre-line;
  margin: 0;
}

/* Barra flotante inferior de carrito */
.floating-cart-bottombar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  padding: 12px 20px;
  z-index: 9999;
  box-sizing: border-box;
}

.floating-cart-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.floating-cart-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.floating-cart-info .cart-icon {
  color: #00ae62;
  font-size: 18px;
}

.floating-cart-info .cart-count {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  color: #475569;
}

.floating-cart-info .cart-total {
  color: #15803d;
  font-size: 16px;
}

.floating-cart-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-more-products {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  transition: background 0.15s;
}

.btn-more-products:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-floating-checkout {
  background: #00ae62;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}

.btn-floating-checkout:hover {
  background: #009353;
}

/* Responsividad */
@media (max-width: 900px) {
  .product-detail-card {
    grid-template-columns: 1fr;
    padding: 24px;
    gap: 24px;
  }

  .product-image-section {
    min-height: 280px;
  }

  .product-image-box {
    height: 240px;
  }

  .product-title {
    font-size: 24px;
  }
}

@media (max-width: 600px) {
  .product-page-main {
    padding: 16px 12px;
  }

  .product-detail-card {
    padding: 16px;
    border-radius: 12px;
  }

  .product-actions-group {
    flex-direction: column;
  }

  .floating-cart-content {
    flex-direction: column;
    align-items: stretch;
  }

  .floating-cart-actions {
    justify-content: space-between;
  }

  .btn-floating-checkout {
    flex: 1;
    justify-content: center;
  }
}

/* Share product styling */
.product-share-container {
  margin-top: 20px;
  padding: 14px 18px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-share-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-share-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-share-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-share-whatsapp {
  background: #25d366;
  color: #ffffff;
}

.btn-share-whatsapp:hover {
  background: #1ebd5a;
  transform: translateY(-1px);
}

.btn-share-copy {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.btn-share-copy:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-share-copy.copied {
  background: #00ae62;
  color: #ffffff;
  border-color: #00ae62;
}

/* Related products section */
.related-products-section {
  margin-top: 40px;
}

.related-header {
  margin-bottom: 20px;
}

.related-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.related-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.related-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.related-img-box {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.related-img {
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.related-card:hover .related-img {
  transform: scale(1.05);
}

.related-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 174, 98, 0.9);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.related-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
}

.related-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.related-price {
  font-size: 16px;
  font-weight: 700;
  color: #00ae62;
}

.btn-related-view {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s ease;
}

.related-card:hover .btn-related-view {
  color: #00ae62;
}
</style>
