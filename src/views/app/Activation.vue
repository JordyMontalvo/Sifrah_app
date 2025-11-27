<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div v-cloak>
      <!-- Loading overlay que muestra la vista opaca -->
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
      
      <!-- Contenido principal (siempre visible, pero opaco durante carga) -->
      <div class="tienda-sifrah-container" :class="{ 'content-loading': loading || !products || products.length === 0 }">
        <!-- Header con título y barra de puntos -->
        <div class="store-header">
          <!-- Título principal de la tienda -->
          <h1 class="store-title">Tienda Sifrah</h1>

          <!-- Barra de puntos del usuario -->
          <div class="points-bar">
            <span class="points-icon">💎</span> Puntos: <b>{{ current_points }}</b>
          </div>
        </div>
        
        <!-- Sistema de banners con Grid - Izquierda separada, Derecha con centro integrado -->
        <div class="banners-grid-wrapper">
          <!-- Banner izquierda - Columna izquierda -->
          <div class="banner-left">
            <div v-if="getBannerImg('left')" class="banner-image-container" @click="onBannerClick('left')" style="cursor: pointer;">
              <img :src="getBannerImg('left')" alt="Banner Izquierda" class="banner-image" />
            </div>
            <div v-else class="banner-placeholder">
              <span class="banner-text">Banner Izquierda</span>
            </div>
          </div>
          
          <!-- Banner derecha con centro integrado - Columna derecha -->
          <div class="banner-right-with-center">
            <!-- Banners del centro uno debajo del otro -->
            <div class="banner-center-column">
              <!-- Banner centro superior -->
              <div class="banner-center-top">
                <div v-if="getBannerImg('centerTop')" class="banner-image-container" @click="onBannerClick('centerTop')" style="cursor: pointer;">
                  <img :src="getBannerImg('centerTop')" alt="Banner Centro Arriba" class="banner-image" />
                </div>
                <div v-else class="banner-placeholder">
                  <span class="banner-text">Banner Centro Arriba</span>
                </div>
              </div>
              
              <!-- Banner centro inferior -->
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

        <!-- Filtros de búsqueda para móviles - Solo visible en móviles -->
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
              <!-- Contenedor con altura definida para el sticky -->
              <div class="catalog-content-wrapper">
                <!-- Contenedor del catálogo completo -->
                <div class="catalog-inner-wrapper">
                  <!-- Título del catálogo -->
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


                  <div class="cart-button-container-mobile">
                    <div class="cart-info-left">
                      <div class="cart-price-info">
                        <span class="total-price">Monto: S/ {{ cartTotal.toFixed(2) }}</span>
                        <span class="total-items">Puntos: {{ cartPoints }} pts</span>
                      </div>
                    </div>
                    <button @click="openCartDetailModal" class="cart-square-btn">
                      <i class="fas fa-shopping-cart"></i>
                      <span>Ver carrito</span>
                    </button>
                  </div>

                  <!-- Grid de productos -->
                  <div class="products-catalog-grid">
                    <!-- Indicador de productos mostrados -->
                    <div class="products-count-indicator">
                      <span>Mostrando {{ filteredCatalogProducts.length }} de {{ products.length }} productos</span>
                      <span v-if="searchTerm || (selectedCategories.length > 0 && !selectedCategories.includes('Todos'))" class="filter-active">
                        (filtros activos)
                      </span>
                    </div>
                    
                    <div 
                      v-for="(product, i) in filteredCatalogProducts" 
                      :key="product.id || i"
                      class="product-catalog-card"
                      @click="openProductModal(product)"
                    >
                      <!-- Esquina decorativa de la tarjeta -->
                      <div class="card-corner"></div>
                      
                      <!-- Badge de puntos -->
                      <div class="points-badge">
                        <i class="fas fa-star"></i>
                        {{ product.points }} pts
                      </div>
                      
                      <!-- Imagen del producto -->
                      <div class="product-image-container">
                        <img
                          :src="product.img"
                          :alt="product.name"
                          class="product-catalog-img"
                        />
                      </div>
                      
                      <!-- Información del producto -->
                      <div class="product-catalog-info">
                        <h4 class="product-catalog-name">{{ product.name }}</h4>
                        <div v-if="product.subdescription" class="product-catalog-info-text">
                          {{ product.subdescription }}
                        </div>
                        <div class="product-catalog-price">
                          Precio Socio: <span class="price-amount">S/ {{ getProductPrice(product) }}</span>
                        </div>
                      </div>
                      
                      <!-- Controles de cantidad -->
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
                      
                      <!-- Botón de agregar -->
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
                    
                    <!-- Mensaje cuando no hay productos que coincidan con los filtros -->
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

            <!-- DIV PADRE DEL CARRITO DE COMPRAS -->
            <div class="carrito-compras-container">
              <!-- Carrito fijo en el lado derecho -->
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
                        <span class="cart-item-points">{{ item.points }}pts</span>
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
                    <div class="summary-row">
                      <span>Puntos:</span>
                      <span>{{ cartPoints.toFixed(2) }}</span>
                    </div>
                    <div class="summary-row total-row">
                      <span>Total:</span>
                      <span>S/ {{ cartTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="cart-actions">
                  <button class="pay-btn" @click="goToCheckout" :disabled="cartItems.length === 0">
                    Ir a Pagar
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
            <!-- X para cerrar dentro del modal -->
            <button @click="closeProductModal" class="close-product-btn-inside">
              <i class="fas fa-times"></i>
            </button>
            
            <!-- Panel izquierdo - Imagen -->
            <div class="product-modal-left">
              <div class="product-modal-image">
                <img 
                  :src="selectedProduct.img" 
                  :alt="selectedProduct.name"
                  class="modal-product-img"
                  @load="imageLoaded = true"
                  v-show="imageLoaded"
                />
                <!-- Carga de imagen -->
                <div v-if="!imageLoaded" class="image-loading">
                  <div class="loading-spinner"></div>
                  <span>Cargando imagen...</span>
                </div>
              </div>
            </div>
            
            <!-- Panel derecho - Información -->
            <div class="product-modal-right">
              <div class="product-modal-info">
                <div class="modal-product-price">S/ {{ getProductPrice(selectedProduct) }}</div>
                <div class="modal-product-points">{{ selectedProduct.points }} pts</div>
                
                <div class="product-description">
                  <h4>Descripción:</h4>
                  <p>{{ getProductDescription(selectedProduct) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interfaz del carrito detallado (pegada a la derecha) -->
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
            <!-- Lista de productos del carrito -->
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
                    <span class="cart-detail-item-points">{{ item.points }}pts</span>
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
            <!-- Resumen del carrito -->
            <div class="cart-detail-summary">
              <h3>Resumen</h3>
              <div class="cart-detail-summary-details">
                <div class="summary-row">
                  <span>Total productos:</span>
                  <span class="summary-value">{{ cartItemsTotal }} items</span>
                </div>
                <div class="summary-row">
                  <span>Puntos:</span>
                  <span>{{ cartPoints.toFixed(2) }}</span>
                </div>
                <div class="summary-row total-row">
                  <span>Total:</span>
                  <span>S/ {{ cartTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="cart-detail-actions">
              <button class="go-to-pay-btn" @click="goToCheckout" :disabled="cartItems.length === 0">
                Ir a Pagar
              </button>
              <button class="add-more-products-btn" @click="closeCartDetailModal">
                <i class="fas fa-plus"></i>
                Añadir más productos
              </button>
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
import lib from "@/lib";
import axios from "axios";

export default {
  components: {
    App,
  },
  data() {
    return {
      loading: true,
      products: null,
      product: null,
      offices: [],
      office: null,
      check: false,
      voucher: null,
      file: null,
      bank: "",
      date: "",
      voucher_number: "",
      pay_method: "",
      error: null,
      success: false,
      sending: false,
      pending: false,
              selectedProduct: null,
        imageLoaded: false,
        showCartDetailModal: false,
        cartItems: [],
      searchTerm: "",
      selectedCategories: [],
      current_points: 0,
      current_profit: 0,
      balance: 0,
      _balance: 0,
      tab: "Todos",
      total: 0,
      
      // Banners de activación
      activationBanners: {
        left: "",
        centerTop: "",
        centerBottom: "",
        right: ""
      },
      price: 0,
      points: 0,
      IGV: 0,
      remaining: 0,

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
      // Suma el precio correcto según el plan
      return this.products.reduce(
        (a, b) => a + this.getProductPrice(b) * b.total,
        0
      );
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
      if (!this.products) return ["Todos"];
      
      const arr = this.products.map(function (x) {
        return x.type;
      });

      let ret = arr.filter(function (v, i, self) {
        return i == self.indexOf(v);
      });

      // Agregar "Todos" al inicio del array
      return ["Todos", ...ret];
    },


    // Computed properties para el catálogo de productos
    catalogProducts() {
      // Si está cargando o no hay productos, retornar array vacío
      if (this.loading || !this.products) {
        return [];
      }
      
      return this.products.filter(product => {
        // Filtro por búsqueda
        const matchesSearch = !this.searchTerm || 
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        // Filtro por categoría
        let matchesCategory = true;
        if (this.selectedCategories.length > 0 && !this.selectedCategories.includes("Todos")) {
          matchesCategory = this.selectedCategories.includes(product.type);
        }
        
        return matchesSearch && matchesCategory;
      });
    },

    filteredCatalogProducts() {
      // Si está cargando o no hay productos, retornar array vacío
      if (this.loading || !this.products || this.products.length === 0) {
        return [];
      }
      
      // Si no hay productos filtrados, mostrar todos los productos
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

    cartIGV() {
      return this.cartTotal - this.cartTotal / 1.18;
    },
    
    canProceedToCheckout() {
      const cartStatus = this.checkCartStatus();
      return cartStatus.canProceed && this.office && (this.check || this.pay_method);
    }
  },
  watch: {
    cartItems: {
      handler(newItems) {
        // Sincronizar con el store cada vez que cambie el carrito
        this.$store.commit('setCartItems', [...newItems]);
      },
      deep: true
    },
    products: {
      handler(newProducts) {
        if (newProducts && newProducts.length > 0) {
          // Reinicializar categorías cuando cambien los productos
          this.initializeDefaultCategories();
        }
      },
      immediate: true
    },
    $route() {
      // Limpiar la clase modal-open cuando cambie la ruta
      document.body.classList.remove('modal-open');
    }
  },
  async created() {
    try {
      // GET data
      const { data } = await api.Activation.GET(this.session);

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

      this.current_points = data.points || 0;
      this.current_profit = data.profit || 0;
      this.products = data.products ? data.products.map((a) => ({ ...a, total: 0 })) : [];
      this.product = this.products.length > 0 ? this.products[0] : null;

      this.balance = data.balance || 0;
      this._balance = data._balance || 0;

      if (this.office_id) this.office = this.office_id;

      this.offices = data.offices || [];
      
      // Cargar banners de activación
      try {
        const { data: bannersData } = await api.ActivationBanners.GET(this.session);
        if (bannersData.activationBanners) {
          this.activationBanners = bannersData.activationBanners;
        }
      } catch (bannerError) {
        console.error("Error loading activation banners:", bannerError);
        // No mostrar error al usuario, solo usar banners vacíos
      }
      
      // Restaurar el carrito desde el store si existe
      const savedCartItems = this.$store.state.cartItems;
      if (savedCartItems && savedCartItems.length > 0) {
        this.cartItems = [...savedCartItems];
      }
      
      // Inicializar categorías seleccionadas por defecto
      this.initializeDefaultCategories();
      
    } catch (error) {
      console.error('Error loading activation data:', error);
      this.error = "Error al cargar los datos. Por favor, intenta de nuevo.";
    } finally {
      this.loading = false;
    }
  },

  mounted() {
    // Asegurar que el scroll esté habilitado al montar el componente
    document.body.classList.remove('modal-open');
  },

  beforeDestroy() {
    // Limpiar la clase antes de destruir el componente
    document.body.classList.remove('modal-open');
  },

  methods: {
    formatCategoryName(category) {
      // Convertir la primera letra a mayúscula y el resto a minúscula
      return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    },
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

      this.products.forEach((product) => {
        product.total = 0;
      });
    },
    getBannerImg(position) {
      const b = this.activationBanners || {};
      const val = b[position];
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val.img || val.url || val.src || null;
      return null;
    },
    getBannerUrl(position) {
      const b = this.activationBanners || {};
      const direct = b[`${position}Url`] || b[`${position}Link`];
      const nested = b[position] && (b[position].url || b[position].link || b[position].href);
      return direct || nested || null;
    },
    onBannerClick(position) {
      const url = this.getBannerUrl(position);
      if (!url || typeof url !== 'string') return;
      try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          window.open(url, '_blank');
        } else if (url.startsWith('/')) {
          this.$router.push(url);
        } else {
          window.open(`https://${url}`, '_blank');
        }
      } catch (e) {
        console.error('Error abriendo la URL del banner:', e);
      }
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

      // Validación de productos y oficina
      const productosSeleccionados = this.products.filter(p => p.total > 0);
      if (productosSeleccionados.length === 0) {
        this.error = "No hay productos seleccionados";
        return;
      }
      if (!office) {
        this.error = "Selecciona una oficina";
        return;
      }

      // Lógica de saldo y método de pago
      const saldoTotal = (this.balance || 0) + (this._balance || 0);
      const totalPagar = this.price;
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
            ? "El saldo no cubre el total, selecciona un método de pago para el restante."
            : "Selecciona un método de pago.";
          return;
        }
        // Validaciones adicionales para banco
        if (pay_method == "bank") {
          if (!bank) {
            this.error = "Ingresa el nombre del banco";
            return;
          }
          if (!date) {
            this.error = "Ingresa la fecha de pago";
            return;
          }
          if (!voucher_number) {
            this.error = "Ingresa el número de voucher";
            return;
          }
          if (!voucher) {
            this.error = "Sube el comprobante de pago";
            return;
          }
        }
      }

      this.error = null;
      this.sending = true;

      try {
        if (voucher) {
          voucher = await lib.upload(this.file, this.file.name, "activations");
        }

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
        
        // Limpiar el carrito solo después de procesar exitosamente
        this.cartItems = [];
        this.$store.commit('setCartItems', []);
        
        this.reset();
        
        // Mostrar mensaje de éxito por 3 segundos y luego recargar
        setTimeout(() => {
          this.success = false;
          // Agregar indicador de recarga
          this.$nextTick(() => {
            const reloadIndicator = document.createElement('div');
            reloadIndicator.className = 'reload-indicator';
            reloadIndicator.innerHTML = `
              <div class="reload-content">
                <i class="fas fa-sync-alt fa-spin"></i>
                <span>Recargando página...</span>
              </div>
            `;
            document.body.appendChild(reloadIndicator);
            
            // Recargar después de mostrar el indicador
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
        }, 3000);
      } catch (error) {
        this.sending = false;
        this.error = "Error al procesar la orden. Intenta nuevamente.";
        console.error("Error en POST:", error);
      }
    },
    // async pagarConMercadoPago() {
    //   try {
    //     const response = await axios.post(
    //       "http://localhost:4000/api/app/mercadopago",
    //       {
    //         description: "Activación de productos",
    //         price: this.price,
    //         quantity: 1,
    //         payer_email: "test_user_116744135@testuser.com"
    //       }
    //     );
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
    getProductPrice(product) {
      // Usa el precio por plan si existe, si no el general
      const planId =
        this.$store.state.plan && this.$store.state.plan.id
          ? this.$store.state.plan.id
          : this.$store.state.plan;
      if (
        product.prices &&
        planId &&
        product.prices[planId] != null &&
        product.prices[planId] !== ""
      ) {
        return product.prices[planId];
      }
      return product.price;
    },



    // Métodos para el catálogo de productos
    toggleCategory(category) {
      if (category === "Todos") {
        // Si se hace clic en "Todos", limpiar todas las selecciones
        this.selectedCategories = [];
      } else {
        // Si se hace clic en otra categoría, remover "Todos" si está seleccionado
        this.selectedCategories = this.selectedCategories.filter(cat => cat !== "Todos");
        
        const index = this.selectedCategories.indexOf(category);
        if (index > -1) {
          this.selectedCategories.splice(index, 1);
        } else {
          this.selectedCategories.push(category);
        }
        
        // Si no hay categorías seleccionadas, mostrar todos
        if (this.selectedCategories.length === 0) {
          this.selectedCategories = [];
        }
      }
    },
    openProductModal(product) {
      this.selectedProduct = product;
      this.imageLoaded = false; // Resetear la carga de imagen al abrir el modal
      // Prevenir scroll del body cuando el modal está abierto
      const body = document.body;
      const html = document.documentElement;
      body.style.overflow = 'hidden';
      body.style.height = '100%';
      html.style.overflow = 'hidden';
      html.style.height = '100%';
      
      // Agregar clase al body para resetear el transform del content
      body.classList.add('product-modal-open');
    },
    closeProductModal() {
      this.selectedProduct = null;
      this.imageLoaded = false; // Resetear la carga de imagen al cerrar el modal
      // Restaurar scroll del body
      const body = document.body;
      const html = document.documentElement;
      body.style.overflow = '';
      body.style.height = '';
      html.style.overflow = '';
      html.style.height = '';
      
      // Remover clase del body para restaurar el transform del content
      body.classList.remove('product-modal-open');
    },
    addToCart(product) {
      const existingItem = this.cartItems.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.total += 1;
      } else {
        this.cartItems.push({ ...product, total: 1 });
      }
      // Sincronizar con el store
      this.$store.commit('setCartItems', [...this.cartItems]);
    },
    removeFromCart(index) {
      this.cartItems.splice(index, 1);
      // Sincronizar con el store
      this.$store.commit('setCartItems', [...this.cartItems]);
    },
    getProductQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      return item ? item.total : 0;
    },
    increaseQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      if (item) {
        item.total += 1;
        // Sincronizar con el store
        this.$store.commit('setCartItems', [...this.cartItems]);
      }
    },
    decreaseQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      if (item && item.total > 0) {
        item.total -= 1;
        // Si llega a 0, remover del carrito
        if (item.total === 0) {
          this.removeFromCart(this.cartItems.indexOf(item));
        } else {
          // Sincronizar con el store
          this.$store.commit('setCartItems', [...this.cartItems]);
        }
      }
    },
    addToCartFromModal(product) {
      this.addToCart(product);
      this.closeProductModal();
    },
    proceedToCheckout() {
      // Validar que hay productos en el carrito
      if (this.cartItems.length === 0) {
        this.error = "No hay productos en el carrito. Agrega productos antes de continuar.";
        return;
      }
      
      // Validar que hay productos con cantidad > 0
      const productosConCantidad = this.cartItems.filter(item => item.total > 0);
      if (productosConCantidad.length === 0) {
        this.error = "No hay productos con cantidad seleccionada. Verifica las cantidades de los productos.";
        return;
      }

      // Validar que se seleccionó una oficina
      if (!this.office) {
        this.error = "Selecciona una oficina";
        return;
      }

      // Validar método de pago si no se usa saldo completo
      const saldoTotal = (this.balance || 0) + (this._balance || 0);
      const totalPagar = this.cartTotal;
      const restante = this.check ? totalPagar - saldoTotal : totalPagar;
      
      if (restante > 0 && !this.pay_method) {
        this.error = "Selecciona un método de pago para el monto restante";
        return;
      }

      // Validar campos del banco si se seleccionó transferencia
      if (this.pay_method === 'bank') {
        if (!this.bank) {
          this.error = "Ingresa el nombre del banco";
          return;
        }
        if (!this.date) {
          this.error = "Ingresa la fecha de pago";
          return;
        }
        if (!this.voucher_number) {
          this.error = "Ingresa el número de voucher";
          return;
        }
        if (!this.voucher) {
          this.error = "Sube el comprobante de pago";
          return;
        }
      }

      // Transferir productos del carrito al array principal de productos
      this.products.forEach(product => {
        const cartItem = this.cartItems.find(item => item.id === product.id);
        if (cartItem) {
          product.total = cartItem.total;
        } else {
          product.total = 0;
        }
      });
      
      // NO limpiar el carrito aquí, solo procesar la orden
      this.error = null;
      this.sending = true;
      this.POST();
    },

          openCartDetailModal() {
        this.showCartDetailModal = true;
        document.body.classList.add('modal-open');
        console.log('1');
        document.getElementsByClassName('content')[0].style.transform = 'none';
      },
      
      closeCartDetailModal() {
        this.showCartDetailModal = false;
        document.body.classList.remove('modal-open');
        document.getElementsByClassName('content')[0].style.removeProperty('transform');
      },
      
      scrollToProducts() {
      // Hacer scroll hacia la sección de productos
      const productsSection = document.querySelector('.products-main-area');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    goToCheckout() {
      // Guardar los productos del carrito en el store para el checkout
      this.$store.commit('setCartItems', this.cartItems);
      // Redirigir al checkout
      this.$router.push('/checkout');
      
    },

    getProductDescription(product) {
      // Usar la descripción de la base de datos si existe
      if (product.description && product.description.trim() !== '') {
        return product.description;
      }
      
      // Descripciones personalizadas como fallback para productos sin descripción
      const descriptions = {
        'Luce Force': 'Descubre el poder de la belleza total con el mejor colágeno hidrolizado Luce Force. Rejuvenece tu piel, fortalece uñas, cabello y articulaciones. Diseñado para el cuidado completo de tu cuerpo, con ingredientes como cartílago de tiburón (fuente de glucosamina), magnesio, zinc, cúrcuma, frutos rojos y Stevia. ¡Dale a tu belleza el impulso que se merece! ❤️✨',
        'Luce Al100': 'Suplemento nutricional premium con vitamina A y antioxidantes naturales. Fortalece el sistema inmunológico, mejora la salud visual y promueve la regeneración celular. Ideal para mantener una salud óptima y vitalidad diaria.',
        'Luce Exquisito': 'Combinación única de ingredientes naturales para el cuidado de la piel. Hidrata profundamente, reduce líneas de expresión y proporciona un brillo natural. Formulado con aceites esenciales y vitaminas para una piel radiante.',
        'Luce Lu Kids': 'Suplemento especialmente formulado para niños con vitaminas y minerales esenciales. Promueve el crecimiento saludable, fortalece el sistema inmunológico y mejora el desarrollo cognitivo. Sabor agradable que los niños amarán.',
        'Luce Activo': 'Energizante natural que mejora el rendimiento físico y mental. Aumenta la resistencia, reduce la fatiga y promueve la recuperación muscular. Ideal para deportistas y personas activas.',
        'Luce Ligera': 'Suplemento para el control de peso y bienestar general. Acelera el metabolismo, reduce la retención de líquidos y proporciona energía sostenida. Formulado con ingredientes naturales para resultados seguros y efectivos.'
      };
      
      // Buscar descripción por nombre del producto
      for (const [key, description] of Object.entries(descriptions)) {
        if (product.name.includes(key)) {
          return description;
        }
      }
      
      // Descripción genérica si no hay una específica
      return 'Producto de alta calidad con ingredientes naturales seleccionados cuidadosamente. Diseñado para mejorar tu bienestar y calidad de vida. ¡Experimenta la diferencia con nuestros productos premium!';
    },
    
    // Método para verificar el estado del carrito
    checkCartStatus() {
      if (this.cartItems.length === 0) {
        return {
          status: 'empty',
          message: 'Tu carrito está vacío. Agrega productos para continuar.',
          canProceed: false
        };
      }
      
      const productosConCantidad = this.cartItems.filter(item => item.total > 0);
      if (productosConCantidad.length === 0) {
        return {
          status: 'no-quantity',
          message: 'No hay productos con cantidad seleccionada. Verifica las cantidades.',
          canProceed: false
        };
      }
      
      return {
        status: 'ready',
        message: `Carrito listo con ${productosConCantidad.length} productos.`,
        canProceed: true
      };
    },
    initializeDefaultCategories() {
      // Inicializar categorías seleccionadas por defecto
      this.selectedCategories = ["Todos"];
    },
    
    clearAllFilters() {
      this.searchTerm = "";
      this.selectedCategories = ["Todos"];
    }
  },
  
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // Restaurar el carrito desde el store si existe
      const savedCartItems = vm.$store.state.cartItems;
      if (savedCartItems && savedCartItems.length > 0) {
        vm.cartItems = [...savedCartItems];
      }
    });
  },
  
  beforeRouteLeave(to, from, next) {
    // Guardar el estado del carrito en el store antes de salir
    if (this.cartItems.length > 0) {
      this.$store.commit('setCartItems', this.cartItems);
    }
    next();
  },
};
</script>


<style lang="stylus">
@import '../../assets/style/views/app/Activation.styl'
</style>
