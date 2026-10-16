<template>
  <div class="shared-store-public-view" v-cloak>
    <!-- Barra superior con logo SIFRAH y datos del socio distribuidor -->
    <SharedStoreHeader
      :ownerName="ownerFirstName"
      :ownerLastName="ownerLastName"
      :ownerFullName="ownerFullName"
      :ownerPhoto="ownerPhoto"
      :ownerId="ownerId"
    />

    <!-- Loading overlay -->
    <div v-if="loading || !products || products.length === 0" class="loading-overlay">
      <div class="loading-container">
        <div class="sifrah-logo-loading">
          <i class="fas fa-store"></i>
        </div>
        <div class="loading-spinner-large"></div>
        <h2 v-if="loading">Cargando Tienda Sifrah...</h2>
        <h2 v-else-if="!products">Inicializando catálogo...</h2>
        <h2 v-else-if="products && products.length === 0">No hay productos disponibles</h2>
        <p v-if="loading">Preparando el mejor catálogo para ti</p>
        <p v-else-if="!products">Configurando productos y ofertas</p>
        <p v-else-if="products && products.length === 0">Contacta al administrador para agregar productos</p>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
    
    <!-- Contenido principal -->
    <div class="tienda-sifrah-container" :class="{ 'content-loading': loading || !products || products.length === 0 }">
      <!-- Sistema de banners con Grid -->
      <div class="banners-grid-wrapper">
        <!-- Banner izquierda -->
        <div class="banner-left">
          <div v-if="getBannerImg('left')" class="banner-image-container" @click="onBannerClick('left')" style="cursor: pointer;">
            <img :src="getBannerImg('left')" alt="Banner Izquierda" class="banner-image" />
          </div>
          <div v-else class="banner-placeholder">
            <span class="banner-text">Banner Izquierda</span>
          </div>
        </div>
        
        <!-- Banner derecha con centro integrado -->
        <div class="banner-right-with-center">
          <!-- Banners del centro -->
          <div class="banner-center-column">
            <div class="banner-center-top">
              <div v-if="getBannerImg('centerTop')" class="banner-image-container" @click="onBannerClick('centerTop')" style="cursor: pointer;">
                <img :src="getBannerImg('centerTop')" alt="Banner Centro Arriba" class="banner-image" />
              </div>
              <div v-else class="banner-placeholder">
                <span class="banner-text">Banner Centro Arriba</span>
              </div>
            </div>
            
            <div class="banner-center-bottom">
              <div v-if="getBannerImg('centerBottom')" class="banner-image-container" @click="onBannerClick('centerBottom')" style="cursor: pointer;">
                <img :src="getBannerImg('centerBottom')" alt="Banner Centro Abajo" class="banner-image" />
              </div>
              <div v-else class="banner-placeholder">
                <span class="banner-text">Banner Centro Abajo</span>
              </div>
            </div>
          </div>
          
          <!-- Banner derecha principal -->
          <div class="banner-right-main">
            <div v-if="getBannerImg('right')" class="banner-image-container" @click="onBannerClick('right')" style="cursor: pointer;">
              <img :src="getBannerImg('right')" alt="Banner Derecha" class="banner-image" />
            </div>
            <div v-else class="banner-placeholder">
              <span class="banner-text">Banner Derecha</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros de búsqueda para móviles -->
      <div class="mobile-catalog-filters">
        <div class="search-filter">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Búsqueda..." 
            class="search-input"
          />
        </div>
        
        <div class="category-filters">
          <div class="category-buttons">
            <button 
              @click="clearAllFilters"
              class="clear-filters-btn"
              v-if="searchTerm || (selectedCategories.length > 0 && !selectedCategories.includes('Todos'))"
            >
              <i class="fas fa-times"></i> Limpiar
            </button>
            <button 
              v-for="category in categories" 
              :key="category"
              @click="toggleCategory(category)"
              :class="{ active: selectedCategories.includes(category) }"
              class="category-btn"
            >
              {{ formatCategoryName(category) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sección de catálogo de productos y carrito -->
      <div class="productos-compras-section">
        <!-- Contenido principal del catálogo y carrito -->
        <div class="catalog-container">
          <!-- Área principal de productos -->
          <div class="products-main-area">
            <div class="catalog-content-wrapper">
              <div class="catalog-inner-wrapper">
                <h4 class="products-title">Catálogo de Productos</h4>
                
                <!-- Filtros y búsqueda -->
                <div class="catalog-filters">
                  <div class="search-filter">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                      v-model="searchTerm" 
                      type="text" 
                      placeholder="Búsqueda..." 
                      class="search-input"
                    />
                  </div>
                  
                  <div class="category-filters">
                    <div class="category-buttons">
                      <button 
                        @click="clearAllFilters"
                        class="clear-filters-btn"
                        v-if="searchTerm || (selectedCategories.length > 0 && !selectedCategories.includes('Todos'))"
                      >
                        <i class="fas fa-times"></i> Limpiar
                      </button>
                      <button 
                        v-for="category in categories" 
                        :key="category"
                        @click="toggleCategory(category)"
                        :class="{ active: selectedCategories.includes(category) }"
                        class="category-btn"
                      >
                        {{ formatCategoryName(category) }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Botón flotante del carrito para móviles -->
                <div class="cart-button-container-mobile">
                  <div class="cart-info-left">
                    <div class="cart-price-info">
                      <span class="total-price">Monto: S/ {{ cartTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                  <button @click="openCartDetailModal" class="cart-square-btn">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Ver carrito</span>
                  </button>
                </div>

                <!-- Grid de productos -->
                <div class="products-catalog-grid">
                  <div 
                    v-for="(product, i) in filteredCatalogProducts" 
                    :key="product.id || i"
                    class="product-catalog-card"
                    @click="openProductModal(product)"
                  >
                    <div class="card-corner"></div>
                    
                    <div class="product-image-container">
                      <img
                        :src="product.img"
                        :alt="product.name"
                        class="product-catalog-img"
                      />
                    </div>
                    
                    <div class="product-catalog-info">
                      <h4 class="product-catalog-name">{{ product.name }}</h4>
                      <div class="product-catalog-info-text">
                        {{ product.subdescription || '\u00a0' }}
                      </div>
                      <div class="product-catalog-price">
                        Precio: <span class="price-amount">S/ {{ Number(getProductPrice(product)).toFixed(2) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="getProductQuantity(product) > 0" class="product-quantity-controls">
                      <button 
                        @click.stop="decreaseQuantity(product)"
                        class="qty-control-btn"
                      >
                        -
                      </button>
                      <span class="quantity-display">
                        {{ getProductQuantity(product) }}
                      </span>
                      <button 
                        @click.stop="addToCart(product)"
                        class="qty-control-btn"
                        :disabled="getProductQuantity(product) >= 10"
                      >
                        +
                      </button>
                    </div>
                    
                    <div v-else class="add-to-cart-container">
                      <button 
                        @click.stop="addToCart(product)"
                        class="add-to-cart-btn"
                        :disabled="getProductQuantity(product) >= 10"
                      >
                        <i class="fas fa-shopping-cart"></i>
                        Agregar
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="filteredCatalogProducts.length === 0 && !loading" class="no-products-message">
                    <i class="fas fa-search"></i>
                    <h4>No se encontraron productos</h4>
                    <p>No hay productos que coincidan con los filtros seleccionados.</p>
                    <button @click="clearAllFilters" class="clear-filters-btn">
                      <i class="fas fa-times"></i> Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrito fijo en el lado derecho -->
          <div class="carrito-compras-container">
            <div class="sticky-cart-sidebar">
              <div class="cart-header">
                <h3>Carrito de Compras</h3>
                <p>Puedes hacer scroll para ver todos tus productos.</p>
              </div>
              
              <div class="cart-items-container">
                <div 
                  v-for="(item, index) in cartItems" 
                  :key="index"
                  class="cart-item"
                >
                  <img :src="item.img" :alt="item.name" class="cart-item-img" />
                  <div class="cart-item-info">
                    <h4>{{ item.name }}</h4>
                    <div class="cart-item-details">
                      <span class="cart-item-price">S/ {{ getProductPrice(item) }}</span>
                    </div>
                  </div>
                  <div class="cart-item-controls">
                    <div class="cart-item-quantity-controls">
                      <button @click="decreaseQuantity(item)" class="qty-control-btn">
                        -
                      </button>
                      <span class="quantity-display">{{ item.total }}</span>
                      <button @click="increaseQuantity(item)" class="qty-control-btn">
                        +
                      </button>
                    </div>
                    <div class="cart-item-remove-control">
                      <button @click="removeFromCart(index)" class="remove-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-if="cartItems.length === 0" class="empty-cart">
                  <i class="fas fa-shopping-cart"></i>
                  <p>Tu carrito está vacío</p>
                  <span>Agrega productos para comenzar</span>
                </div>
              </div>
              
              <div class="cart-summary-section">
                <h3>Resumen</h3>
                <div class="summary-details">
                  <div class="summary-row">
                    <span>Total productos:</span>
                    <span class="summary-value">{{ cartItemsTotal }} items</span>
                  </div>
                  <div class="summary-row total-row">
                    <span>Total:</span>
                    <span>S/ {{ cartTotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="cart-actions">
                <button class="pay-btn" @click="goToCheckout" :disabled="cartItems.length === 0">
                  Continuar compra
                </button>
                <button class="view-detail-btn" @click="openCartDetailModal">
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de producto -->
    <div v-if="selectedProduct" class="product-modal" @click="closeProductModal">
      <div class="product-modal-content" @click.stop>
        <div class="product-modal-header">
          <h2>{{ selectedProduct.name }}</h2>
        </div>
        
        <div class="product-modal-body">
          <button @click="closeProductModal" class="close-product-btn-inside">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="product-modal-left">
            <div class="product-modal-image">
              <img 
                :src="selectedProduct.img" 
                :alt="selectedProduct.name"
                class="modal-product-img"
                @load="imageLoaded = true"
                v-show="imageLoaded"
              />
              <div v-if="!imageLoaded" class="image-loading">
                <div class="loading-spinner"></div>
                <span>Cargando imagen...</span>
              </div>
            </div>
          </div>
          
          <div class="product-modal-right">
            <div class="product-modal-info">
              <div class="modal-product-price">S/ {{ Number(getProductPrice(selectedProduct)).toFixed(2) }}</div>
              
              <div class="product-description">
                <h4>Descripción:</h4>
                <p>{{ getProductDescription(selectedProduct) }}</p>
              </div>

              <div class="modal-actions-box" style="margin-top: 16px;">
                <button
                  type="button"
                  @click="goToProductPage(selectedProduct)"
                  class="btn-visit-product-page"
                  style="display: inline-flex; align-items: center; gap: 8px; background: #00ae62; color: #fff; padding: 10px 18px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer;"
                >
                  <i class="fas fa-external-link-alt"></i> Ver página del producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interfaz del carrito detallado -->
    <div v-if="showCartDetailModal" class="cart-detail-interface">
      <div class="cart-detail-interface-content">
        <div class="cart-detail-header">
          <h2>Carrito de Compras</h2>
          <p>Puedes hacer scroll para ver todos tus productos.</p>
          <button @click="closeCartDetailModal" class="close-cart-detail-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="cart-detail-body">
          <div class="cart-detail-items">
            <h3>Productos en tu carrito</h3>
            <div 
              v-for="(item, index) in cartItems" 
              :key="index"
              class="cart-detail-item"
            >
              <div class="cart-detail-item-image">
                <img :src="item.img" :alt="item.name" />
              </div>
              <div class="cart-detail-item-info">
                <h4>{{ item.name }}</h4>
                <div class="cart-detail-item-details">
                  <span class="cart-detail-item-price">S/ {{ getProductPrice(item) }}</span>
                </div>
              </div>
              <div class="cart-detail-item-controls">
                <div class="cart-detail-quantity-controls">
                  <button @click="decreaseQuantity(item)" class="qty-control-btn">
                    -
                  </button>
                  <span class="quantity-display">{{ item.total }}</span>
                  <button @click="increaseQuantity(item)" class="qty-control-btn">
                    +
                  </button>
                </div>
                <button @click="removeFromCart(index)" class="remove-cart-item-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div v-if="cartItems.length === 0" class="empty-cart-detail">
              <i class="fas fa-shopping-cart"></i>
              <p>Tu carrito está vacío</p>
              <span>Agregar productos para comenzar</span>
            </div>
          </div>
        </div>
        
        <div class="cart-detail-footer" style="padding: 10px">
          <div class="cart-detail-summary">
            <h3>Resumen</h3>
            <div class="cart-detail-summary-details">
              <div class="summary-row">
                <span>Total productos:</span>
                <span class="summary-value">{{ cartItemsTotal }} items</span>
              </div>
              <div class="summary-row total-row">
                <span>Total:</span>
                <span>S/ {{ cartTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="cart-detail-actions">
            <button class="go-to-pay-btn" @click="goToCheckout" :disabled="cartItems.length === 0">
              Continuar compra
            </button>
            <button class="add-more-products-btn" @click="closeCartDetailModal">
              <i class="fas fa-plus"></i>
              Añadir más productos
            </button>
          </div>
        </div>
      </div>
    </div>

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
  components: {
    SharedStoreHeader,
    SharedStoreFooter
  },
  data() {
    return {
      loading: true,
      products: null,
      error: null,
      selectedProduct: null,
      imageLoaded: false,
      showCartDetailModal: false,
      cartItems: [],
      searchTerm: "",
      selectedCategories: [],
      activationBanners: {
        left: "",
        centerTop: "",
        centerBottom: "",
        right: ""
      },
      ownerId: null,
      ownerName: "Sifrah",
      ownerFirstName: "",
      ownerLastName: "",
      ownerFullName: "",
      ownerPhoto: null,
      ownerPhone: "",

      useMockData: false, // Flag para saber si estamos usando datos mock
    };
  },
  computed: {
    categories() {
      if (!this.products) return ["Todos"];
      
      const arr = this.products.map(function (x) {
        return x.type;
      });

      let ret = arr.filter(function (v, i, self) {
        return i == self.indexOf(v);
      });

      return ["Todos", ...ret];
    },

    catalogProducts() {
      if (this.loading || !this.products) {
        return [];
      }
      
      return this.products.filter(product => {
        const matchesSearch = !this.searchTerm || 
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        let matchesCategory = true;
        if (this.selectedCategories.length > 0 && !this.selectedCategories.includes("Todos")) {
          matchesCategory = this.selectedCategories.includes(product.type);
        }
        
        return matchesSearch && matchesCategory;
      });
    },

    filteredCatalogProducts() {
      if (this.loading || !this.products || this.products.length === 0) {
        return [];
      }
      
      const productsToShow = this.catalogProducts.length > 0 ? this.catalogProducts : this.products;
      
      return productsToShow.map(product => {
        const cartItem = this.cartItems.find(item => item.id === product.id);
        return {
          ...product,
          total: cartItem ? cartItem.total : 0
        };
      });
    },

    cartTotal() {
      return this.cartItems.reduce((sum, item) => sum + this.getProductPrice(item) * item.total, 0);
    },

    cartPoints() {
      return this.cartItems.reduce((sum, item) => sum + item.points * item.total, 0);
    },

    cartItemsTotal() {
      return this.cartItems.reduce((sum, item) => sum + item.total, 0);
    },
  },
  methods: {
    getProductPrice(product) {
      if (!product) return 0;
      if (Number(product.public_price) > 0) {
        return Number(product.public_price);
      }
      return Number(product.price_socio || product.price || 0);
    },

    getProductDescription(product) {
      return product.description || product.subdescription || "Sin descripción disponible";
    },

    loadCartFromSession() {
      if (!this.ownerId) return;
      try {
        const raw = sessionStorage.getItem("sifrah_store_cart_" + this.ownerId);
        if (raw) {
          this.cartItems = JSON.parse(raw);
        }
      } catch (e) {
        console.error("Error reading cart from sessionStorage:", e);
      }
    },

    saveCartToSession() {
      if (!this.ownerId) return;
      try {
        const items = this.cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          img: item.img || "",
          total: item.total,
          price: this.getProductPrice(item),
          points: Number(item.points) || 0,
        }));
        sessionStorage.setItem("sifrah_store_cart_" + this.ownerId, JSON.stringify(items));
      } catch (e) {
        console.error("Error saving cart to sessionStorage:", e);
      }
    },

    getProductQuantity(product) {
      const cartItem = this.cartItems.find(item => item.id === product.id);
      return cartItem ? cartItem.total : 0;
    },

    addToCart(product) {
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.total < 10) {
          existingItem.total++;
        }
      } else {
        this.cartItems.push({
          ...product,
          total: 1
        });
      }
      this.saveCartToSession();
    },

    decreaseQuantity(product) {
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.total > 1) {
          existingItem.total--;
        } else {
          const index = this.cartItems.indexOf(existingItem);
          this.cartItems.splice(index, 1);
        }
        this.saveCartToSession();
      }
    },

    increaseQuantity(product) {
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem && existingItem.total < 10) {
        existingItem.total++;
        this.saveCartToSession();
      }
    },

    removeFromCart(index) {
      this.cartItems.splice(index, 1);
      this.saveCartToSession();
    },

    openProductModal(product) {
      if (this.ownerId && product && product.id) {
        this.saveCartToSession();
        this.$router.push(`/tienda/${this.ownerId}/producto/${product.id}`);
      } else {
        this.selectedProduct = product;
        this.imageLoaded = false;
        document.body.classList.add('modal-open');
      }
    },

    goToProductPage(product) {
      if (!this.ownerId || !product || !product.id) return;
      this.saveCartToSession();
      this.$router.push(`/tienda/${this.ownerId}/producto/${product.id}`);
    },

    closeProductModal() {
      this.selectedProduct = null;
      this.imageLoaded = false;
      document.body.classList.remove('modal-open');
    },

    openCartDetailModal() {
      this.showCartDetailModal = true;
      document.body.classList.add('modal-open');
    },

    closeCartDetailModal() {
      this.showCartDetailModal = false;
      document.body.classList.remove('modal-open');
    },

    toggleCategory(category) {
      if (category === "Todos") {
        this.selectedCategories = [];
      } else {
        const index = this.selectedCategories.indexOf(category);
        if (index > -1) {
          this.selectedCategories.splice(index, 1);
        } else {
          this.selectedCategories.push(category);
          const todosIndex = this.selectedCategories.indexOf("Todos");
          if (todosIndex > -1) {
            this.selectedCategories.splice(todosIndex, 1);
          }
        }
      }
    },

    clearAllFilters() {
      this.searchTerm = "";
      this.selectedCategories = [];
    },

    formatCategoryName(category) {
      return category;
    },

    getBannerImg(position) {
      return this.activationBanners[position] || "";
    },

    onBannerClick(position) {
      console.log("Banner clicked:", position);
    },

    initializeDefaultCategories() {
      this.selectedCategories = [];
    },

    goToCheckout() {
      if (this.cartItems.length === 0 || !this.ownerId) return;
      const items = this.cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        img: item.img || "",
        total: item.total,
        price: this.getProductPrice(item),
        points: Number(item.points) || 0,
      }));
      sessionStorage.setItem("sifrah_store_cart_" + this.ownerId, JSON.stringify(items));
      this.$router.push("/tienda/" + this.ownerId + "/checkout");
    }
  },
  async created() {
    document.body.classList.add('activation-view');
    
    try {
      // Obtener el ID del usuario desde la URL
      this.ownerId = this.$route.params.userId;
      
      if (!this.ownerId) {
        this.error = "ID de usuario no válido";
        this.loading = false;
        return;
      }

      this.loadCartFromSession();

      try {
        // Intentar llamar al API
        const { data } = await api.SharedStore.GET(this.ownerId);

        if (data.error) {
          throw new Error(data.msg || "Error al cargar la tienda");
        }

        // Cargar datos del API
        this.products = data.products
          ? data.products.filter((a) => !isPromotionProduct(a) && a.visible_shared_store !== false).map((a) => ({ ...a, total: 0 }))
          : [];
        this.ownerName = data.ownerName || data.ownerFullName || "Sifrah";
        this.ownerFirstName = data.ownerFirstName || data.ownerName || "";
        this.ownerLastName = data.ownerLastName || "";
        this.ownerFullName = data.ownerFullName || `${this.ownerFirstName} ${this.ownerLastName}`.trim();
        this.ownerPhoto = data.ownerPhoto || null;
        this.ownerPhone = data.ownerPhone || data.phone || "";
        
        if (data.activationBanners) {
          this.activationBanners = data.activationBanners;
        }
      } catch (apiError) {
        // Si el API falla, usar datos mock
        console.warn('API no disponible, usando datos mock:', apiError);
        this.useMockData = true;
        
        const mockData = mockSharedStoreData;
        this.products = mockData.products.map((a) => ({ ...a, total: 0 }));
        this.ownerName = mockData.ownerName;
        this.ownerFirstName = mockData.ownerFirstName || "";
        this.ownerLastName = mockData.ownerLastName || "";
        this.ownerFullName = mockData.ownerFullName || mockData.ownerName;
        this.ownerPhoto = mockData.ownerPhoto || null;
        this.activationBanners = mockData.activationBanners;
        
        // Mostrar mensaje informativo
        this.error = "⚠️ Modo Demo: El backend no está disponible. Mostrando datos de ejemplo.";
        
        // Limpiar el error después de 5 segundos
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
      
      this.initializeDefaultCategories();
      
    } catch (error) {
      console.error('Error loading shared store:', error);
      this.error = "Error al cargar la tienda. Por favor, intenta de nuevo.";
    } finally {
      this.loading = false;
    }
  },

  mounted() {
    document.body.classList.remove('modal-open');
  },

  beforeDestroy() {
    document.body.classList.remove('modal-open');
    document.body.classList.remove('activation-view');
  }
};
</script>

<style lang="stylus">
@import '../../assets/style/views/app/Activation.styl'

// Estilos adicionales específicos para la vista pública
.shared-store-public-view
  --shared-store-topbar-height: 58px
  min-height: 100vh
  background: #f5f5f5

.store-subtitle
  text-align: center
  color: #666
  font-size: 1.1rem
  margin-top: -10px
  margin-bottom: 20px

.shared-store-public-view .points-badge
  display: none !important

.shared-store-public-view .cart-detail-interface
  top: var(--shared-store-topbar-height)
  height: calc(100% - var(--shared-store-topbar-height))
  z-index: 10000

.shared-store-public-view .cart-detail-interface-content
  height: 100%
  max-height: 100%

body.modal-open header.shared-store-topbar
  display: block !important
  visibility: visible !important
  opacity: 1 !important
  pointer-events: auto !important
  z-index: 100050 !important
  position: sticky !important
  top: 0 !important

@media (max-width: 768px)
  .shared-store-public-view
    --shared-store-topbar-height: 52px

  .shared-store-public-view .cart-detail-interface
  body.modal-open .shared-store-public-view .cart-detail-interface
    top: var(--shared-store-topbar-height) !important
    right: 0 !important
    bottom: 0 !important
    left: 0 !important
    width: 100% !important
    height: calc(100dvh - var(--shared-store-topbar-height)) !important
    min-height: 0 !important
    z-index: 10000 !important

  .shared-store-public-view .cart-detail-interface-content
    height: 100% !important
    min-height: 0 !important
    max-height: 100% !important

@media (max-width: 480px)
  .shared-store-public-view
    --shared-store-topbar-height: 48px
</style>
