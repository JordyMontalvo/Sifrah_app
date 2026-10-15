<template>
  <div class="shared-store-product-page" v-cloak>
    <!-- Encabezado oficial con logo SIFRAH y datos del socio distribuidor -->
    <SharedStoreHeader
      :ownerName="ownerFirstName"
      :ownerLastName="ownerLastName"
      :ownerFullName="ownerFullName"
      :ownerPhoto="ownerPhoto"
      :ownerId="ownerId"
      :dark="true"
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
        <router-link :to="/tienda/ + ownerId" class="btn-return-store">
          <i class="fas fa-arrow-left"></i> Volver a la tienda
        </router-link>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main v-else class="product-page-main">
      <div class="product-page-container">
        <!-- Ruta de navegación: Tienda / Nombre del producto -->
        <nav class="product-breadcrumb">
          <router-link :to="/tienda/ + ownerId" class="breadcrumb-link">
            Tienda
          </router-link>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ product.name }}</span>
        </nav>

        <!-- Bloque superior: Galería a la izquierda y Detalles a la derecha -->
        <div class="product-top-card">
          <!-- Columna Izquierda: Galería con imagen principal y 3 miniaturas -->
          <div class="product-gallery-box">
            <!-- Imagen principal con flechas de navegación -->
            <div class="main-image-wrapper">
              <button
                type="button"
                class="gallery-arrow arrow-prev"
                @click="prevImage"
                title="Imagen anterior"
                aria-label="Imagen anterior"
              >
                <i class="fas fa-chevron-left"></i>
              </button>

              <div class="main-image-viewport">
                <img
                  :src="activeImage"
                  :alt="product.name"
                  class="main-product-img"
                  @load="imageLoaded = true"
                  v-show="imageLoaded"
                />
                <div v-if="!imageLoaded" class="image-skeleton-loader">
                  <div class="loading-spinner"></div>
                </div>
              </div>

              <button
                type="button"
                class="gallery-arrow arrow-next"
                @click="nextImage"
                title="Siguiente imagen"
                aria-label="Siguiente imagen"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <!-- 3 Miniaturas seleccionables -->
            <div class="thumbnails-row">
              <button
                v-for="(imgSrc, idx) in productThumbnails"
                :key="idx"
                type="button"
                class="thumbnail-btn"
                :class="{ active: currentImageIndex === idx }"
                @click="selectImage(idx)"
              >
                <img :src="imgSrc" :alt="product.name + " miniatura " + (idx + 1)" class="thumbnail-img" />
              </button>
            </div>

            <!-- Indicadores de puntos (dots) -->
            <div class="gallery-dots-row">
              <span
                v-for="(dot, idx) in productThumbnails"
                :key=""dot-" + idx"
                class="gallery-dot"
                :class="{ active: currentImageIndex === idx }"
                @click="selectImage(idx)"
              ></span>
            </div>
          </div>

          <!-- Columna Derecha: Información del producto, precios y compra -->
          <div class="product-info-box">
            <!-- Título y subtítulo -->
            <h1 class="product-title">{{ product.name }}</h1>
            <h2 v-if="productSubtitle" class="product-subtitle">
              {{ productSubtitle }}
            </h2>

            <!-- Precio público -->
            <div class="product-price-section">
              <span class="price-public-label">Precio público</span>
              <div class="price-public-value">
                S/ {{ getProductPrice(product).toFixed(2) }}
              </div>
            </div>

            <!-- Descripción breve -->
            <p class="product-short-description">
              {{ shortDescription }}
            </p>

            <!-- Selector de cantidad -->
            <div class="product-qty-stepper">
              <button
                type="button"
                class="stepper-btn"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                aria-label="Disminuir cantidad"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="stepper-value">{{ quantity }}</span>
              <button
                type="button"
                class="stepper-btn"
                @click="increaseQuantity"
                :disabled="quantity >= 99"
                aria-label="Aumentar cantidad"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>

            <!-- Botones de compra -->
            <div class="product-action-buttons">
              <!-- Comprar ahora (fucsia) -->
              <button
                type="button"
                class="btn-buy-now-fuchsia"
                @click="buyNow"
              >
                Comprar ahora
              </button>

              <!-- Agregar al carrito (oscuro) -->
              <button
                type="button"
                class="btn-add-cart-dark"
                @click="addToCartAndNotify"
              >
                <i class="fas fa-shopping-cart"></i>
                <span>Agregar al carrito</span>
              </button>
            </div>

            <!-- Feedback temporal al agregar -->
            <transition name="fade">
              <div v-if="addedFeedback" class="added-feedback-toast">
                <i class="fas fa-check-circle"></i>
                <span>¡Producto agregado al carrito!</span>
              </div>
            </transition>

            <!-- Badges de despacho: Delivery y Recojo en tienda -->
            <div class="dispatch-badges-row">
              <div class="dispatch-badge-item">
                <div class="dispatch-icon">
                  <i class="fas fa-truck"></i>
                </div>
                <div class="dispatch-texts">
                  <span class="dispatch-title">Delivery</span>
                  <span class="dispatch-desc">Recibe en la puerta de tu casa</span>
                </div>
              </div>

              <div class="dispatch-badge-item">
                <div class="dispatch-icon">
                  <i class="fas fa-store"></i>
                </div>
                <div class="dispatch-texts">
                  <span class="dispatch-title">Recojo en tienda</span>
                  <span class="dispatch-desc">Retira en nuestras tiendas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloque inferior: Descripción completa del producto -->
        <section class="product-full-description-section">
          <h3 class="full-desc-title">Descripción del producto</h3>
          <p class="full-desc-body">
            {{ fullDescription }}
          </p>
        </section>

        <!-- Bloque Recomendados: También podría interesarte -->
        <section v-if="recommendedProducts.length > 0" class="recommended-section">
          <div class="recommended-header">
            <h3 class="recommended-title">También podría interesarte</h3>
            <div class="recommended-arrows">
              <button
                type="button"
                class="carousel-nav-btn"
                @click="scrollCarousel(-1)"
                title="Anterior"
                aria-label="Productos anteriores"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                class="carousel-nav-btn"
                @click="scrollCarousel(1)"
                title="Siguiente"
                aria-label="Productos siguientes"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Carrusel de tarjetas -->
          <div class="recommended-carousel-track" ref="carouselTrack">
            <div
              v-for="rel in recommendedProducts"
              :key="rel.id"
              class="recommended-card"
            >
              <!-- Imagen y enlace a la página individual del producto -->
              <div class="card-img-container" @click="goToProduct(rel.id)">
                <img :src="rel.img" :alt="rel.name" class="card-product-img" />
              </div>

              <!-- Detalles de la tarjeta -->
              <div class="card-content">
                <h4 class="card-product-name" @click="goToProduct(rel.id)" :title="rel.name">
                  {{ rel.name }}
                </h4>
                <span class="card-price-label">Precio público</span>
                <div class="card-price-value">
                  S/ {{ getProductPrice(rel).toFixed(2) }}
                </div>

                <!-- Botón de acción: Agregar o Stepper si ya está en el carrito -->
                <div class="card-action-container">
                  <!-- Botón Fucsia Agregar si no está en carrito -->
                  <button
                    v-if="getCartItemQuantity(rel.id) === 0"
                    type="button"
                    class="btn-card-add-fuchsia"
                    @click="addRecommendedToCart(rel)"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    <span>Agregar</span>
                  </button>

                  <!-- Stepper Fucsia [- qty +] cuando ya tiene unidades en carrito -->
                  <div v-else class="card-qty-stepper-fuchsia">
                    <button
                      type="button"
                      class="card-stepper-btn"
                      @click="decrementRecommended(rel)"
                      aria-label="Disminuir"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="card-stepper-num">{{ getCartItemQuantity(rel.id) }}</span>
                    <button
                      type="button"
                      class="card-stepper-btn"
                      @click="incrementRecommended(rel)"
                      aria-label="Aumentar"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Barra flotante de carrito inferior (cuando hay productos en el carrito) -->
    <transition name="fade">
      <div v-if="cartItemsCount > 0" class="floating-cart-bottombar">
        <div class="floating-cart-content">
          <div class="floating-cart-info">
            <i class="fas fa-shopping-cart cart-icon"></i>
            <span class="cart-count">
              {{ cartItemsCount }} {{ cartItemsCount === 1 ? producto : productos }}
            </span>
            <span class="cart-total">Total: S/ {{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="floating-cart-actions">
            <router-link :to="/tienda/ + ownerId" class="btn-more-products">
              Ver más productos
            </router-link>
            <button @click="goToCheckout" class="btn-floating-checkout">
              Finalizar compra <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Pie de página aprobado con WhatsApp, Redes y Formas de pago -->
    <SharedStoreFooter
      :whatsappPhone="ownerPhone"
      :ownerName="ownerFullName"
    />
  </div>
</template>

<script>
import SharedStoreHeader from "@/components/SharedStoreHeader.vue";
import SharedStoreFooter from "@/components/SharedStoreFooter.vue";
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
    SharedStoreHeader,
    SharedStoreFooter
  },
  data() {
    return {
      loading: true,
      imageLoaded: false,
      product: null,
      currentImageIndex: 0,
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
      ownerPhone: "",
      allProducts: []
    };
  },
  computed: {
    productSubtitle() {
      if (!this.product) return "";
      if (this.product.subdescription && this.product.subdescription.length < 40) {
        return this.product.subdescription;
      }
      return this.product.type || "";
    },
    shortDescription() {
      if (!this.product) return "";
      if (this.product.short_description) {
        return this.product.short_description;
      }
      if (this.product.subdescription) {
        return this.product.subdescription;
      }
      if (this.product.description) {
        const firstSentence = this.product.description.split(".")[0];
        if (firstSentence && firstSentence.length > 10) {
          return firstSentence + ".";
        }
      }
      return "Disfruta de este producto exclusivo en tu rutina diaria.";
    },
    fullDescription() {
      if (!this.product) return "";
      return (
        this.product.description_full ||
        this.product.description ||
        this.product.subdescription ||
        "Disfruta el sabor único y los beneficios nutricionales en tu rutina diaria. Combina ingredientes de la más alta calidad con una textura suave, ideal para acompañarte en cualquier momento del día."
      );
    },
    productThumbnails() {
      if (!this.product) return [];
      const img1 = this.product.img;
      const extraImages = Array.isArray(this.product.images)
        ? this.product.images.filter(Boolean)
        : [];

      const list = [img1, ...extraImages].filter(Boolean);

      // Si tiene al menos 3 imágenes reales, usar las primeras 3
      if (list.length >= 3) {
        return list.slice(0, 3);
      }
      // Si tiene solo 1 o 2 imágenes, completar hasta 3 miniaturas para cumplir el diseño aprobado
      if (list.length === 2) {
        return [list[0], list[1], list[0]];
      }
      if (list.length === 1) {
        return [list[0], list[0], list[0]];
      }
      return [
        "https://via.placeholder.com/400x400?text=Sifrah",
        "https://via.placeholder.com/400x400?text=Sifrah",
        "https://via.placeholder.com/400x400?text=Sifrah"
      ];
    },
    activeImage() {
      const thumbs = this.productThumbnails;
      if (!thumbs.length) return "";
      const idx = Math.max(0, Math.min(this.currentImageIndex, thumbs.length - 1));
      return thumbs[idx];
    },
    cartItemsCount() {
      return this.cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
    },
    cartTotal() {
      return this.cartItems.reduce(
        (sum, item) => sum + this.getProductPrice(item) * (item.total || 0),
        0
      );
    },
    recommendedProducts() {
      if (!this.product || !this.allProducts.length) return [];
      return this.allProducts.filter(
        (p) => String(p.id) !== String(this.product.id) && p.visible_shared_store !== false
      );
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
      return Number(prod.public_price || prod.price_socio || prod.price || 0);
    },
    selectImage(index) {
      this.currentImageIndex = index;
    },
    prevImage() {
      const total = this.productThumbnails.length;
      if (total <= 1) return;
      this.currentImageIndex = (this.currentImageIndex - 1 + total) % total;
    },
    nextImage() {
      const total = this.productThumbnails.length;
      if (total <= 1) return;
      this.currentImageIndex = (this.currentImageIndex + 1) % total;
    },
    goToProduct(productId) {
      if (String(productId) === String(this.$route.params.productId)) return;
      this.saveCartToSession();
      this.$router.push(`/tienda/${this.ownerId}/producto/${productId}`);
    },
    selectProductById(productId) {
      this.product =
        this.allProducts.find((p) => String(p.id) === String(productId)) || null;
      this.quantity = 1;
      this.currentImageIndex = 0;
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
      if (this.quantity < 99) {
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
      const existing = this.cartItems.find(
        (item) => String(item.id) === String(this.product.id)
      );
      if (existing) {
        existing.total = Math.min(99, existing.total + this.quantity);
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
      }, 3000);
    },
    buyNow() {
      this.addToCartAndNotify();
      this.goToCheckout();
    },
    goToCheckout() {
      if (this.cartItems.length === 0 || !this.ownerId) return;
      this.saveCartToSession();
      this.$router.push("/tienda/" + this.ownerId + "/checkout");
    },
    getCartItemQuantity(productId) {
      const item = this.cartItems.find((i) => String(i.id) === String(productId));
      return item ? item.total : 0;
    },
    addRecommendedToCart(prod) {
      const existing = this.cartItems.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        existing.total += 1;
      } else {
        this.cartItems.push({
          id: prod.id,
          name: prod.name,
          img: prod.img || "",
          total: 1,
          price: this.getProductPrice(prod),
          points: Number(prod.points) || 0
        });
      }
      this.saveCartToSession();
    },
    incrementRecommended(prod) {
      const existing = this.cartItems.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        existing.total += 1;
        this.saveCartToSession();
      } else {
        this.addRecommendedToCart(prod);
      }
    },
    decrementRecommended(prod) {
      const existing = this.cartItems.find((i) => String(i.id) === String(prod.id));
      if (existing) {
        if (existing.total > 1) {
          existing.total -= 1;
        } else {
          this.cartItems = this.cartItems.filter(
            (i) => String(i.id) !== String(prod.id)
          );
        }
        this.saveCartToSession();
      }
    },
    scrollCarousel(direction) {
      const track = this.$refs.carouselTrack;
      if (!track) return;
      const cardWidth = 270;
      track.scrollBy({
        left: direction * cardWidth * 2,
        behavior: "smooth"
      });
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
        this.ownerFullName =
          data.ownerFullName || `${this.ownerFirstName} ${this.ownerLastName}`.trim();
        this.ownerPhoto = data.ownerPhoto || null;
        this.ownerPhone = data.ownerPhone || data.phone || "";

        const allProducts = data.products
          ? data.products.filter(
              (p) => !isPromotionProduct(p) && p.visible_shared_store !== false
            )
          : [];

        this.allProducts = allProducts;
        this.product =
          allProducts.find((p) => String(p.id) === String(productId)) || null;
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
      this.product =
        mockProducts.find((p) => String(p.id) === String(productId)) || null;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

/* Loading & Not Found */
.product-page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.spinner-wrapper {
  text-align: center;
  color: #64748b;
}

.loading-spinner-large {
  width: 46px;
  height: 46px;
  border: 4px solid #e2e8f0;
  border-top-color: #e60064;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-not-found-container {
  max-width: 500px;
  margin: 80px auto;
  padding: 0 20px;
  text-align: center;
}

.not-found-card {
  background: #ffffff;
  padding: 40px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.not-found-icon {
  font-size: 50px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.btn-return-store {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #e60064;
  color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.btn-return-store:hover {
  opacity: 0.9;
}

/* Contenedor Principal */
.product-page-main {
  flex: 1;
  padding: 24px 20px 60px;
  box-sizing: border-box;
}

.product-page-container {
  max-width: 1140px;
  margin: 0 auto;
}

/* Breadcrumb: Tienda / Nombre del producto */
.product-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  font-weight: 500;
}

.breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s ease;
}

.breadcrumb-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

.breadcrumb-sep {
  color: #94a3b8;
}

.breadcrumb-current {
  color: #e60064;
  font-weight: 700;
}

/* Tarjeta superior: 2 columnas */
.product-top-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  margin-bottom: 40px;
}

/* Galería (Columna Izquierda) */
.product-gallery-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 12px;
}

.main-image-viewport {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  outline: none;
}

.gallery-arrow:hover {
  background-color: #ffffff;
  color: #0f172a;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  transform: translateY(-50%) scale(1.06);
}

.arrow-prev {
  left: 0;
}

.arrow-next {
  right: 0;
}

/* Miniaturas */
.thumbnails-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
}

.thumbnail-btn {
  width: 86px;
  height: 86px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background-color: #ffffff;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  outline: none;
}

.thumbnail-btn:hover {
  border-color: #cbd5e1;
}

.thumbnail-btn.active {
  border-color: #e60064;
  box-shadow: 0 0 0 1px #e60064;
}

.thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Dots */
.gallery-dots-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.gallery-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gallery-dot.active {
  background-color: #e60064;
  width: 18px;
  border-radius: 4px;
}

/* Detalles (Columna Derecha) */
.product-info-box {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.15;
}

.product-subtitle {
  font-size: 20px;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 16px 0;
}

/* Precio */
.product-price-section {
  margin-bottom: 14px;
}

.price-public-label {
  font-size: 14px;
  color: #64748b;
  display: block;
  margin-bottom: 2px;
}

.price-public-value {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
}

.product-short-description {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

/* Selector de cantidad */
.product-qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  width: 140px;
  height: 40px;
  margin-bottom: 20px;
  background-color: #ffffff;
}

.stepper-btn {
  width: 44px;
  height: 100%;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  outline: none;
}

.stepper-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #0f172a;
}

.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper-value {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

/* Botones de acción */
.product-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-buy-now-fuchsia {
  width: 100%;
  padding: 14px 20px;
  background-color: #e60064;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(230, 0, 100, 0.25);
  outline: none;
}

.btn-buy-now-fuchsia:hover {
  background-color: #cf005a;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(230, 0, 100, 0.35);
}

.btn-add-cart-dark {
  width: 100%;
  padding: 14px 20px;
  background-color: #242c38;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  outline: none;
}

.btn-add-cart-dark:hover {
  background-color: #1a212b;
  transform: translateY(-1px);
}

/* Toast de feedback */
.added-feedback-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Badges de despacho */
.dispatch-badges-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.dispatch-badge-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dispatch-icon {
  font-size: 24px;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dispatch-texts {
  display: flex;
  flex-direction: column;
}

.dispatch-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.dispatch-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

/* Descripción Completa */
.product-full-description-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 44px;
}

.full-desc-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 14px 0;
}

.full-desc-body {
  font-size: 14px;
  line-height: 1.65;
  color: #475569;
  margin: 0;
}

/* También podría interesarte */
.recommended-section {
  margin-bottom: 40px;
}

.recommended-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.recommended-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.recommended-arrows {
  display: flex;
  align-items: center;
  gap: 10px;
}

.carousel-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  outline: none;
}

.carousel-nav-btn:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Track horizontal */
.recommended-carousel-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 6px 2px 16px 2px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.recommended-carousel-track::-webkit-scrollbar {
  height: 6px;
}

.recommended-carousel-track::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

/* Tarjeta individual */
.recommended-card {
  flex: 0 0 250px;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommended-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
}

.card-img-container {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 12px;
}

.card-product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.card-img-container:hover .card-product-img {
  transform: scale(1.05);
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-product-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
}

.card-product-name:hover {
  color: #e60064;
}

.card-price-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.card-price-value {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 14px;
}

.card-action-container {
  margin-top: auto;
}

/* Botón Agregar Fucsia */
.btn-card-add-fuchsia {
  width: 100%;
  padding: 9px 12px;
  background-color: #e60064;
  color: #ffffff;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.btn-card-add-fuchsia:hover {
  background-color: #cf005a;
}

/* Stepper Fucsia [- qty +] */
.card-qty-stepper-fuchsia {
  width: 100%;
  height: 36px;
  background-color: #e60064;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
}

.card-stepper-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: transform 0.1s ease;
}

.card-stepper-btn:active {
  transform: scale(0.9);
}

.card-stepper-num {
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
}

/* Floating bottom cart bar */
.floating-cart-bottombar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #1e293b;
  color: #ffffff;
  padding: 12px 24px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  box-sizing: border-box;
}

.floating-cart-content {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.floating-cart-info {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
}

.cart-icon {
  font-size: 18px;
  color: #e60064;
}

.cart-count {
  font-weight: 600;
  color: #e2e8f0;
}

.cart-total {
  font-weight: 800;
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
}

.floating-cart-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-more-products {
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-more-products:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}

.btn-floating-checkout {
  background-color: #e60064;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-floating-checkout:hover {
  background-color: #cf005a;
  transform: translateY(-1px);
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Skeleton loader */
.image-skeleton-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #e60064;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 960px) {
  .product-top-card {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 24px;
  }

  .main-image-wrapper {
    height: 320px;
  }
}

@media (max-width: 600px) {
  .product-page-main {
    padding: 16px 12px 40px;
  }

  .product-top-card {
    padding: 20px 16px;
  }

  .product-title {
    font-size: 26px;
  }

  .price-public-value {
    font-size: 28px;
  }

  .thumbnail-btn {
    width: 72px;
    height: 72px;
  }

  .dispatch-badges-row {
    grid-template-columns: 1fr;
  }

  .floating-cart-content {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .floating-cart-actions {
    justify-content: space-between;
  }
}
</style>
