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
      <div class="scale-wrapper">
        <div class="main-content">
          <div class="tienda-sifrah-container" :class="{ 'content-loading': loading || !products || products.length === 0 }">
        <!-- Contenedor para título y puntos en móvil -->
        <div class="title-points-container">
          <!-- Título principal de la tienda -->
          <h1 class="store-title">Tienda Sifrah</h1>

          <!-- Barra de puntos del usuario -->
          <div class="points-bar">
            <span class="points-icon">💎</span> Puntos: <b>{{ current_points }}</b>
          </div>
        </div>
        
        <!-- Sistema de banners unificado -->
        <div class="banners-unified-wrapper">
          <!-- Banner izquierda - El más ancho -->
          <div class="banner-left">
            <div v-if="activationBanners.left" class="banner-image-container">
              <img :src="activationBanners.left" alt="Banner Izquierda" class="banner-image" />
            </div>
            <div v-else class="banner-placeholder">
              <span class="banner-text">Banner Izquierda</span>
            </div>
          </div>
          
          <!-- Banners del centro - Medianos -->
          <div class="banner-center">
            <div class="banner-medium-top">
              <div v-if="activationBanners.centerTop" class="banner-image-container">
                <img :src="activationBanners.centerTop" alt="Banner Centro Arriba" class="banner-image" />
              </div>
              <div v-else class="banner-placeholder">
                <span class="banner-text">Banner Centro Arriba</span>
              </div>
            </div>
            <div class="banner-medium-bottom">
              <div v-if="activationBanners.centerBottom" class="banner-image-container">
                <img :src="activationBanners.centerBottom" alt="Banner Centro Abajo" class="banner-image" />
              </div>
              <div v-else class="banner-placeholder">
                <span class="banner-text">Banner Centro Abajo</span>
              </div>
            </div>
          </div>
          
          <!-- Banner derecha - El más cuadrado -->
          <div class="banner-right">
            <div v-if="activationBanners.right" class="banner-image-container">
              <img :src="activationBanners.right" alt="Banner Derecha" class="banner-image" />
            </div>
            <div v-else class="banner-placeholder">
              <span class="banner-text">Banner Derecha</span>
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

    <!-- Sección de checkout mejorada -->
    <div class="checkout-section">
      <div class="checkout-header">
        <h3>Finalizar Compra</h3>
        <p>Completa los datos para procesar tu orden</p>
    </div>

      <!-- Resumen de la orden -->
      <div class="order-summary">
        <div class="summary-header">
          <h4>Resumen de tu orden</h4>
        </div>
        
        <!-- Lista de productos -->
        <div class="products-list">
          <h5>Productos seleccionados:</h5>
          <div class="product-item" v-for="item in cartItems" :key="item.id">
            <div class="product-info">
              <img :src="item.img" :alt="item.name" class="product-thumb" />
              <div class="product-details">
                <span class="product-name">{{ item.name }}</span>
                <span class="product-price">S/ {{ getProductPrice(item) }}</span>
              </div>
            </div>
            <div class="product-quantity">
              <span class="qty-badge">{{ item.total }}x</span>
              <span class="product-points">{{ item.points }} pts</span>
            </div>
          </div>
        </div>
        
        <div class="summary-content">
          <div class="summary-item">
            <span>Total productos:</span>
            <span class="summary-value">{{ cartItemsTotal }} items</span>
          </div>
          <div class="summary-item">
            <span>Subtotal:</span>
            <span class="summary-value">S/ {{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>IGV:</span>
            <span class="summary-value">S/ {{ cartIGV.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>Total a pagar:</span>
            <span class="summary-value total-value">S/ {{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span>Puntos a ganar:</span>
            <span class="summary-value points-value">{{ cartPoints.toFixed(0) }} pts</span>
          </div>
        </div>
      </div>

      <!-- Selección de oficina -->
    <div class="office-section">
        <div class="section-header">
          <i class="fas fa-building"></i>
          <h4>Selecciona una oficina</h4>
        </div>
        <select class="office-select" v-model="office" v-if="!pending">
          <option value="null" disabled>Selecciona una oficina</option>
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
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ office.address }}</span>
        </div>
        <div v-if="office.accounts" class="office-accounts">
            <label>Información de cuentas:</label>
          <textarea
            readonly
              class="office-accounts-text"
            rows="3"
            >{{ office.accounts }}</textarea
          >
        </div>
      </div>
    </div>

      <!-- Método de pago -->
    <div class="payment-section">
        <div class="section-header">
          <i class="fas fa-credit-card"></i>
          <h4>Método de pago</h4>
        </div>
        
        <!-- Opción de saldo -->
        <div class="balance-option">
          <label class="balance-checkbox">
        <input type="checkbox" v-model="check" />
            <span class="checkmark"></span>
            <span class="balance-text">Usar mi saldo disponible</span>
      </label>
          <div v-show="check" class="balance-details">
            <div class="balance-item">
              <span>Saldo disponible:</span>
              <span class="balance-amount">S/ {{ balance }}</span>
      </div>
            <div class="balance-item">
              <span>Saldo no disponible:</span>
              <span class="balance-amount">S/ {{ _balance }}</span>
            </div>
            <div v-if="remaining > 0" class="balance-item remaining">
              <span>Restante a pagar:</span>
              <span class="balance-amount">S/ {{ remaining }}</span>
            </div>
          </div>
        </div>

        <!-- Métodos de pago -->
        <div v-show="!(check && remaining == 0)" class="payment-methods">
          <div class="method-option">
            <label class="method-radio">
            <input type="radio" :value="'bank'" v-model="pay_method" />
              <span class="radio-checkmark"></span>
              <i class="fas fa-university"></i>
              <span>Transferencia bancaria</span>
          </label>
          </div>
          <div class="method-option">
            <label class="method-radio">
            <input type="radio" :value="'cash'" v-model="pay_method" />
              <span class="radio-checkmark"></span>
              <i class="fas fa-money-bill-wave"></i>
            <span>Efectivo</span>
          </label>
        </div>
        </div>

        <!-- Campos específicos del banco -->
        <div v-if="pay_method == 'bank'" class="bank-fields">
          <div class="field-group">
            <label>Nombre del banco</label>
            <input class="form-input" v-model="bank" placeholder="Ej: BCP, BBVA, Interbank..." />
          </div>
          <div class="field-group">
            <label>Fecha de pago</label>
            <input class="form-input" v-model="date" type="date" />
          </div>
          <div class="field-group">
            <label>Número de voucher</label>
          <input
              class="form-input" 
            v-model="voucher_number"
              placeholder="Número de operación"
            oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
          />
          </div>
          <div class="field-group">
            <label>Comprobante de pago</label>
            <div class="file-upload">
              <input type="file" @change="onFileChange" id="voucher-file" />
              <label for="voucher-file" class="file-label">
                <i class="fas fa-upload"></i>
                <span>{{ voucher ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
          </label>
        </div>
            <img v-if="voucher" class="voucher-preview" :src="voucher" />
          </div>
        </div>

        <!-- Información de efectivo -->
        <div v-if="pay_method == 'cash'" class="cash-info">
          <div class="cash-amount">
            <i class="fas fa-hand-holding-usd"></i>
            <span>Monto a pagar en efectivo: <strong>S/ {{ remaining }}</strong></span>
        </div>
      </div>
    </div>

      <!-- Mensajes de estado -->
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>
      <div v-if="cartItems.length === 0" class="info-message">
        <i class="fas fa-info-circle"></i>
        <span>Agrega productos al carrito para continuar</span>
      </div>
      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i>
        <span>¡Orden enviada exitosamente! La página se recargará en unos segundos...</span>
      </div>

      <!-- Botón de ordenar -->
      <div class="order-actions">
        <!-- Estado del carrito -->
        <div class="cart-status" v-if="!sending">
          <div v-if="checkCartStatus().status === 'empty'" class="cart-status-empty">
            <i class="fas fa-shopping-cart"></i>
            <span>{{ checkCartStatus().message }}</span>
          </div>
          <div v-else-if="checkCartStatus().status === 'no-quantity'" class="cart-status-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ checkCartStatus().message }}</span>
          </div>
          <div v-else class="cart-status-ready">
            <i class="fas fa-check-circle"></i>
            <span>{{ checkCartStatus().message }}</span>
          </div>
        </div>
        
        <button 
          class="order-btn" 
          v-show="!sending" 
          @click="proceedToCheckout" 
          :disabled="!canProceedToCheckout"
        >
          <i class="fas fa-shopping-cart"></i>
          <span>Confirmar y Ordenar</span>
        </button>
        
        <button class="order-btn loading" v-show="sending" disabled>
          <i class="fas fa-spinner fa-spin"></i>
          <span>Procesando orden...</span>
        </button>
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
    }
  },
  async created() {
    try {
      // GET data
      const { data } = await api.Activation.GET(this.session);
      console.log({ data });

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
      console.log("[Activation.vue] Productos recibidos del API:", data.products ? data.products.map(p => ({ id: p.id, name: p.name, subdescription: p.subdescription })) : "No hay productos");
      console.log("[Activation.vue] Estructura completa del primer producto:", this.products.length > 0 ? this.products[0] : "No hay productos");
      console.log("[Activation.vue] Campos disponibles en productos:", this.products.length > 0 ? Object.keys(this.products[0]) : "No hay productos");
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
          console.log("[Activation.vue] Banners de activación cargados:", this.activationBanners);
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
      document.body.style.overflow = 'hidden';
    },
    closeProductModal() {
      this.selectedProduct = null;
      this.imageLoaded = false; // Resetear la carga de imagen al cerrar el modal
      // Restaurar scroll del body
      document.body.style.overflow = 'auto';
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
      },
      
      closeCartDetailModal() {
        this.showCartDetailModal = false;
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
  text-align left
  font-size 1.5rem
  font-weight 700
  color #333
  margin 0 0 15px 0
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

.mp-btn {
  background: linear-gradient(90deg, #009ee3 60%, #00d4ff 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0,158,227,0.13);
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}
.mp-btn:hover {
  background: linear-gradient(90deg, #0077b6 60%, #00b4d8 100%);
  box-shadow: 0 4px 16px rgba(0,158,227,0.18);
}

@media (max-width: 900px)
  .products-main
    max-width 100%
  .products-grid
    grid-template-columns repeat(auto-fit, minmax(170px, 1fr))
    gap 10px
  .summary-box, .payment-section
    padding 10px 6px
  .product-selection-tools
    padding 16px
    margin 0 10px 20px 10px
  .filters-container
    flex-direction column
    gap 12px
  .filter-group
    justify-content space-between
  
  /* Responsive para banners - Sistema unificado */
  .banners-inner-wrapper
    padding 0 15px 0 0
  
  .banners-unified-grid
    flex-direction column
    gap 15px
  
  .banner-left-container
    flex 1
  
  .banner-center-container
    flex-direction row
    gap 15px
  
  .banner-center-top-element, .banner-center-bottom-element
    flex 1
  
  .banner-left-element, .banner-right-element
    height 200px
  
  .banner-center-top-placeholder, .banner-center-bottom-placeholder
    height 95px
  
  /* Responsive para placeholders de productos */
  .product-placeholders
    flex-direction column
    gap 15px
  
  /* Escalado proporcional para la sección de productos y carrito */
  .productos-compras-section {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    /* El escalado se aplicará desde .main-content */
  }
  
  .productos-section {
    flex: 1;
    /* Mantener proporciones originales */
  }
  
  .sticky-cart-sidebar {
    flex: 0 0 350px; /* Ancho fijo proporcional */
    /* Mantener proporciones originales */
  }
  
  .placeholder-main
    height 120px
    margin-right 0
  
  .placeholder-sidebar
    flex-direction row
    gap 10px
    max-width 100%
  
  .placeholder-small
    flex 1
    height 60px
  
  /* Responsive para el catálogo */
  .catalog-container
    flex-direction column
    gap 15px
  
  .products-catalog-grid
    grid-template-columns repeat(auto-fit, minmax(240px, 1fr))
    gap 15px
  
  .catalog-filters
    flex-direction column
    gap 15px
    padding 15px
  
  .search-filter
    min-width 100%
  
  .category-buttons
    justify-content center
    gap 8px
  
  .cart-sidebar
    order -1
    position fixed
    right -100%
    width 95%
    max-width 350px
    top 10px
    max-height calc(100vh - 20px)
  
  .cart-sidebar-open
    right 10px
  
  .cart-toggle-btn
    bottom 20px
    right 20px
    width 50px
    height 50px
    font-size 1.2rem
  
  .cart-item
    padding 12px
    gap 10px
  
  .cart-item-img
    width 60px
    height 60px
  
  .cart-item-info h4
    font-size 1rem
  
  .cart-item-details
    flex-direction column
    gap 4px
    align-items flex-start
  
  .cart-item-controls
    flex-direction row
    gap 6px
  
  .cart-item .qty-control-btn
    width 28px
    height 28px
    font-size 1rem
  
  .cart-item .quantity-display
    min-width 20px
    padding 4px 8px
    font-size 0.9rem
  
  .remove-btn
    width 28px
    height 28px
    font-size 1rem
  
  .product-modal-body
    flex-direction column
    gap 20px
  
  .modal-product-name
    font-size 1.5rem
  
  .modal-product-price
    font-size 1.4rem

@media (max-width: 600px)
  /* Responsive para banners en móviles */
  .featured-banners
    margin 15px 0
  
  .banner-grid
    gap 10px
  
  .banner-main
    height 120px
  
  .banner-sidebar
    gap 8px
  
  .banner-small, .banner-medium, .banner-large
    height 60px
  
  .banner-text
    font-size 0.8rem
    padding 6px 12px
  
  /* Responsive para placeholders en móviles */
  .store-title
    font-size 2rem
    margin 0 0 15px 0
  
  .product-placeholders
    margin 15px 0
    gap 10px
  
  .placeholder-main
    height 100px
  
  .placeholder-sidebar
    gap 8px
  
  .placeholder-small
    height 50px
  
  .placeholder-text
    font-size 0.8rem
    padding 6px 12px
  
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
  .product-selection-tools
    padding 12px
    margin 0 8px 16px 8px
  .search-input
    padding 12px 16px 12px 44px
    font-size 0.9rem
  
  .catalog-filters
    padding 12px
    gap 12px
  
  .category-btn
    padding 6px 12px
    font-size 0.85rem
  
  .clear-filters-btn
    padding 5px 10px
    font-size 0.85rem
  
  .filter-select
    padding 6px 10px
    font-size 0.85rem
  .view-btn
    width 32px
    height 32px
    font-size 0.9rem
  
  /* Responsive para móviles muy pequeños */
  .products-catalog-grid
    grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
    gap 12px
  
  .product-catalog-card
    padding 12px
  
  .product-catalog-name
    font-size 0.95rem
  
  .add-to-cart-btn
    padding 8px 16px
    font-size 0.9rem
  
  .cart-modal-content
    width 95%
    margin 10px
  
  .product-modal-content
    width 95%
    margin 10px
  
  .modal-product-name
    font-size 1.3rem
  
  .modal-product-price
    font-size 1.2rem
  
  .modal-product-actions
    flex-direction column
    gap 12px

  .cart-sidebar
    width 95%
    max-width 300px
    right -100%
  
  .cart-sidebar-open
    right 5px
  
  .cart-toggle-btn
    bottom 15px
    right 15px
    width 45px
    height 45px
    font-size 1rem
  
  .cart-item
    padding 10px
    gap 8px
  
  .cart-item-img
    width 50px
    height 50px
  
  .cart-item-info h4
    font-size 0.9rem
  
  .cart-item-price
    font-size 0.9rem
  
  .cart-item-points
    font-size 0.8rem
  
  .cart-item .qty-control-btn
    width 24px
    height 24px
    font-size 0.9rem
  
  .cart-item .quantity-display
    min-width 18px
    padding 3px 6px
    font-size 0.8rem
  
  .remove-btn
    width 24px
    height 24px
    font-size 0.9rem
  
  /* Responsive para el checkout */
  .checkout-section
    padding 16px
    margin-top 16px
  
  .checkout-header h3
    font-size 1.3rem
  
  .checkout-header p
    font-size 0.9rem
  
  .order-summary
    padding 16px
  
  .summary-header h4
    font-size 1.1rem
  
  .section-header h4
    font-size 1rem
  
  .office-select
    padding 10px 14px
    font-size 0.95rem
  
  .order-btn
    padding 14px 24px
    font-size 1rem
    min-width 180px
  
  .products-list
    margin-bottom 16px
    padding-bottom 16px
  
  .product-item
    padding 10px
  
  .product-thumb
    width 35px
    height 35px
  
  .product-name
    font-size 0.9rem
  
  .product-price
    font-size 0.8rem
  
  .qty-badge
    padding 3px 6px
    font-size 0.75rem
    min-width 25px
  
  .product-points
    font-size 0.75rem
    padding 1px 4px

/* Estilos para el checkout mejorado */
.checkout-section {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 24px;
  margin-top: 20px;
}

.checkout-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.checkout-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 8px 0;
}

.checkout-header p {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Resumen de la orden */
.order-summary {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-header h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

/* Lista de productos en el resumen */
.products-list {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.products-list h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.product-item:hover {
  border-color: #ff9800;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.product-thumb {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
  background: #f8f8f8;
  padding: 4px;
  border: 1px solid #eee;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.product-price {
  font-size: 0.85rem;
  color: #388e3c;
  font-weight: 600;
}

.product-quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.qty-badge {
  background: #ff9800;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.product-points {
  font-size: 0.8rem;
  color: #ff9800;
  font-weight: 600;
  background: rgba(255, 152, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  border-top: 2px solid #ff9800;
  border-bottom: none;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
}

.summary-value {
  font-weight: 600;
  color: #333;
}

.total-value {
  color: #388e3c;
  font-size: 1.1rem;
}

.points-value {
  color: #ff9800;
  font-weight: 700;
}

/* Secciones generales */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.section-header i {
  font-size: 1.2rem;
  color: #ff9800;
}

.section-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* Oficina */
.office-section {
  margin-bottom: 24px;
}

.office-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.office-select:focus {
  border-color: #ff9800;
  outline: none;
}

.office-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #ff9800;
}

.office-address {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #333;
  margin-bottom: 12px;
}

.office-address i {
  color: #ff9800;
  font-size: 1.1rem;
}

.office-accounts label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.office-accounts-text {
  width: 100%;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
}

/* Método de pago */
.payment-section {
  margin-bottom: 24px;
}

.balance-option {
  margin-bottom: 20px;
}

.balance-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.balance-checkbox:hover {
  border-color: #ff9800;
  background: #fff8e1;
}

.balance-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #ff9800;
}

.balance-text {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.balance-details {
  margin-top: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.95rem;
}

.balance-item.remaining {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
  color: #388e3c;
}

.balance-amount {
  font-weight: 600;
  color: #333;
}

/* Métodos de pago */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.method-option {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.method-option:hover {
  border-color: #ff9800;
}

.method-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  width: 100%;
}

.method-radio input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #ff9800;
}

.method-radio i {
  font-size: 1.2rem;
  color: #ff9800;
  width: 20px;
}

.method-radio span:last-child {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* Campos del banco */
.bank-fields {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #ff9800;
  outline: none;
}

/* Subida de archivos */
.file-upload {
  position: relative;
}

.file-upload input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.file-label:hover {
  border-color: #ff9800;
  background: #fff8e1;
}

.file-label i {
  color: #ff9800;
  font-size: 1.1rem;
}

.voucher-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #e0e0e0;
}

/* Información de efectivo */
.cash-info {
  background: #e8f5e8;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #388e3c;
}

.cash-amount {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #333;
}

.cash-amount i {
  color: #388e3c;
  font-size: 1.2rem;
}

/* Mensajes */
.error-message, .success-message, .info-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.success-message {
  background: #e8f5e8;
  color: #388e3c;
  border-left: 4px solid #388e3c;
}

.info-message {
  background: #e3f2fd;
  color: #1976d2;
  border-left: 4px solid #1976d2;
}

/* Botones de acción */
.order-actions {
  text-align: center;
  margin-top: 24px;
}

.order-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(255,152,0,0.2);
  min-width: 200px;
  justify-content: center;
}

.order-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,152,0,0.3);
}

.order-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.order-btn.loading {
  background: #ff9800;
  cursor: not-allowed;
}

.order-btn i {
  font-size: 1.2rem;
}

/* Indicadores de estado del carrito */
.cart-status {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-status-empty {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.cart-status-warning {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.cart-status-ready {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.cart-status i {
  font-size: 1.1rem;
}

/* Indicador de recarga */
.reload-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.reload-content {
  background: #fff;
  border-radius: 15px;
  padding: 30px 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.reload-content i {
  font-size: 2.5rem;
  color: #ff9800;
}

.reload-content span {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

/* CONTENEDOR PRINCIPAL DE LA TIENDA SIFRAH */
.tienda-sifrah-container {
  width: 100%;
  max-width: 1800px;
  margin: 0 0 0 20px;
  padding: 20px;
/*   background: #fafafa;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1); */
}

/* SECCIÓN DE PRODUCTOS Y COMPRAS */
.productos-compras-section {
  margin-top: -20px;
  padding: 20px 0;
}

/* Barra de puntos del usuario */
.points-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  margin: 0 0 20px 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  font-size: 0.95rem;
  font-weight: 600;
  width: fit-content;
  max-width: 250px;
  margin-left: auto;
  margin-top: -60px;
}

.points-icon {
  font-size: 1rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}

/* Layout principal con productos y carrito fijo */
.main-layout {
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: flex-start;
  position: relative;
}

/* DIV PADRE DEL CARRITO DE COMPRAS */
.carrito-compras-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  height: 100%;
  position: relative;
  /* Asegurar que se mantenga la altura relativa al banner */
  min-height: 400px;
}

/* Carrito sticky en el lado derecho */
.sticky-cart-sidebar {
  width: 420px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 20px);
  min-height: 700px;
  overflow-y: auto;
  position: sticky;
  /* Asegurar que se mantenga la altura relativa al banner */
  top: 20px;
  align-self: flex-start;
  height: fit-content;
  z-index: 100;
  flex-shrink: 0;
  margin-top: 0;
  transform: translateZ(0);
  transition: all 0.3s ease;
  flex: 0 0 380px;
}

/* Contenedor para título y puntos */
.title-points-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 20px;
}

/* Estilos para el título principal de la tienda */
.store-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 20px 0;
  text-align: left;
  letter-spacing: -0.5px;
}

/* Estilos para el título del catálogo */
.products-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
  text-align: left;
  letter-spacing: -0.5px;
  border-left: 4px solid #ff6b35;
  padding-left: 15px;
}

/* Sistema de banners unificado - TODO EN UN SOLO DIV PARA ZOOM UNIFORME */
.banners-unified-wrapper {
  display: flex;
  gap: 15px;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  background: transparent;
  transform-origin: top left;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  contain: layout style paint;
  align-items: stretch;
}

/* Sistema de escalado proporcional para toda la tienda Sifrah */
/* RESOLUCIÓN BASE DE REFERENCIA: 2560x1440p (tu monitor) */
.scale-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  min-height: 100vh;
  position: relative;
  /* Asegurar que el scroll funcione correctamente */
  scroll-behavior: smooth;
}

/* Estilos para el scroll horizontal cuando sea necesario */
.scale-wrapper::-webkit-scrollbar {
  height: 8px;
}

.scale-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scale-wrapper::-webkit-scrollbar-thumb {
  background: #ff6b35;
  border-radius: 4px;
}

.scale-wrapper::-webkit-scrollbar-thumb:hover {
  background: #e55a2b;
}

.main-content {
  /* Ancho base optimizado para 2560x1440p */
  width: 2000px; /* Aumentado para aprovechar mejor tu monitor */
  transform-origin: top left;
  margin: 0; /* Alineado a la izquierda */
  position: relative;
  min-height: 100vh;
}

/* ===== SISTEMA DE ESCALADO BASADO EN TU MONITOR 2560x1440p ===== */

/* TU MONITOR: 2560x1440p - RESOLUCIÓN BASE (centrado y equilibrado) */
@media screen and (min-width: 2560px) {
  .main-content {
    transform: scale(1); /* Tamaño original en tu monitor */
    width: 2200px; /* Ajustado para mejor equilibrio visual */
    margin: 0 auto; /* Centrado para eliminar espacio vacío de la derecha */
  }
  
  /* Ajustar el carrito para que sea más ancho en tu monitor */
  .sticky-cart-sidebar {
    flex: 0 0 450px; /* Aumentado de 350px a 450px */
    max-width: 450px;
  }
  
  /* Ajustar el catálogo para que tenga más espacio */
  .productos-section {
    flex: 1;
    max-width: calc(100% - 450px); /* Ajustado para el carrito más ancho */
  }
  
  /* Ajustar el grid de productos para mostrar más columnas */
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Columnas más anchas */
    gap: 20px;
  }
  
  /* Ajustar los banners para aprovechar mejor el espacio */
  .banners-unified-wrapper {
    gap: 20px; /* Más espacio entre banners */
  }
  
  .banner-left {
    flex: 4.2; /* Aumentado de 3.8 a 4.2 para más espacio */
  }
  
  .banner-center {
    flex: 2.0; /* Aumentado de 1.8 a 2.0 */
  }
  
  .banner-right {
    flex: 2.2; /* Aumentado de 2 a 2.2 */
  }
  
  /* Ajustar las alturas de los banners para mejor proporción */
  .banner-left,
  .banner-right {
    height: 450px; /* Aumentado de 400px a 450px */
  }
  
  .banner-medium-top,
  .banner-medium-bottom {
    height: 215px; /* Aumentado de 190px a 215px */
  }
  
  /* Actualizar las alturas de los contenedores de imágenes */
  .banner-left .banner-placeholder,
  .banner-left .banner-image-container,
  .banner-right .banner-placeholder,
  .banner-right .banner-image-container {
    height: 450px;
  }
  
  .banner-medium-top .banner-placeholder,
  .banner-medium-top .banner-image-container,
  .banner-medium-bottom .banner-placeholder,
  .banner-medium-bottom .banner-image-container {
    height: 215px;
  }
  
  /* Optimizar proporciones de imágenes para tu monitor */
  .banner-left .banner-image {
    object-fit: cover;
    object-position: center 30%; /* Ajustar para mostrar mejor el jaguar */
  }
  
  .banner-medium-top .banner-image,
  .banner-medium-bottom .banner-image {
    object-fit: cover;
    object-position: center 40%; /* Centrar verticalmente para banners pequeños */
  }
  
  .banner-right .banner-image {
    object-fit: cover;
    object-position: center 35%; /* Ajustar para banner derecho */
  }
}

/* MONITOR 1920x1080p - Escalado para mantener las mismas proporciones */
@media screen and (min-width: 1920px) and (max-width: 2559px) {
  .main-content {
    transform: scale(0.75); /* 1920/2560 = 0.75 - Mantiene proporciones exactas */
    width: 2200px; /* Mantener el mismo ancho base */
    margin: 0 auto; /* Centrado para mejor apariencia */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1680x1050p - Escalado proporcional */
@media screen and (min-width: 1680px) and (max-width: 1919px) {
  .main-content {
    transform: scale(0.656); /* 1680/2560 = 0.656 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1600x900p - Escalado proporcional */
@media screen and (min-width: 1600px) and (max-width: 1679px) {
  .main-content {
    transform: scale(0.625); /* 1600/2560 = 0.625 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1440x900p (MacBook Air) - Escalado proporcional */
@media screen and (min-width: 1440px) and (max-width: 1599px) {
  .main-content {
    transform: scale(0.5625); /* 1440/2560 = 0.5625 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1366x768p - Escalado proporcional */
@media screen and (min-width: 1366px) and (max-width: 1439px) {
  .main-content {
    transform: scale(0.534); /* 1366/2560 = 0.534 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1280x720p - Escalado proporcional */
@media screen and (min-width: 1280px) and (max-width: 1365px) {
  .main-content {
    transform: scale(0.5); /* 1280/2560 = 0.5 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MONITOR 1024x768p - Escalado proporcional */
@media screen and (min-width: 1024px) and (max-width: 1279px) {
  .main-content {
    transform: scale(0.4); /* 1024/2560 = 0.4 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* TABLETS - Escalado proporcional */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    transform: scale(0.3); /* 768/2560 = 0.3 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MÓVILES GRANDES - Escalado proporcional */
@media screen and (min-width: 480px) and (max-width: 767px) {
  .main-content {
    transform: scale(0.1875); /* 480/2560 = 0.1875 */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* MÓVILES PEQUEÑOS - Escalado mínimo */
@media screen and (max-width: 479px) {
  .main-content {
    transform: scale(0.125); /* Escalado mínimo del 12.5% */
    width: 2200px;
    margin: 0 auto; /* Centrado */
  }
  
  .scale-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }
}

/* ===== DISEÑO MÓVIL ESPECÍFICO ===== */
/* Para móviles, usar diseño nativo sin escalado */
@media screen and (max-width: 768px) {
  .scale-wrapper {
    overflow-x: visible;
    overflow-y: visible;
  }
  
  .main-content {
    transform: none !important; /* Sin escalado en móvil */
    width: 100% !important;
    margin: 0 !important;
    padding: 10px;
  }
  
  /* Layout móvil - Una columna */
  .tienda-sifrah-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  /* Contenedor título y puntos en móvil - Lado a lado */
  .title-points-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .store-title {
    margin: 0;
    font-size: 1.8rem;
    flex: 1;
  }
  
  .points-bar {
    margin: 0;
    padding: 8px 12px;
    font-size: 0.9rem;
    border-radius: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    white-space: nowrap;
  }

  /* Banners en móvil - Diseño vertical apilado como en la segunda imagen */
  .banners-unified-wrapper {
    display: flex;
    flex-direction: column; /* Layout vertical apilado */
    gap: 15px;
    width: 100%;
    align-items: stretch;
  }
  
  .banner-left {
    width: 100%;
    height: 200px; /* Banner principal más alto */
    order: 1; /* Primero en el stack */
  }
  
  .banner-center {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 15px;
    order: 2; /* Segundo en el stack */
  }
  
  .banner-right {
    width: 100%;
    height: 150px; /* Banner inferior */
    order: 3; /* Tercero en el stack */
  }
  
  .banner-medium-top,
  .banner-medium-bottom {
    flex: 1;
    height: 150px; /* Altura para los banners del centro */
  }
  
  /* Ajustar contenedores de imágenes para móvil - Diseño vertical */
  .banner-left .banner-image-container,
  .banner-left .banner-placeholder {
    height: 200px; /* Banner principal más alto */
  }
  
  .banner-center .banner-image-container,
  .banner-center .banner-placeholder {
    height: 150px; /* Banners del centro */
  }
  
  .banner-right .banner-image-container,
  .banner-right .banner-placeholder {
    height: 150px; /* Banner inferior */
  }
  
  .banner-medium-top .banner-image-container,
  .banner-medium-top .banner-placeholder,
  .banner-medium-bottom .banner-image-container,
  .banner-medium-bottom .banner-placeholder {
    height: 150px; /* Altura para los banners del centro */
  }
  
  /* Optimizar proporciones de imágenes para el diseño móvil vertical */
  .banner-left .banner-image {
    object-fit: cover;
    object-position: center 30%; /* Mostrar mejor el jaguar en banner principal */
  }
  
  .banner-medium-top .banner-image,
  .banner-medium-bottom .banner-image {
    object-fit: cover;
    object-position: center 40%; /* Centrar verticalmente en banners pequeños */
  }
  
  .banner-right .banner-image {
    object-fit: cover;
    object-position: center 35%; /* Ajustar para banner inferior */
  }
  
  /* Sección de productos y carrito en móvil - Layout como en la imagen */
  .productos-compras-section {
    display: flex;
    flex-direction: row; /* Layout horizontal como en la imagen */
    gap: 15px;
    width: 100%;
    margin-top: 15px;
  }
  
  .productos-section {
    flex: 2; /* Productos ocupan más espacio */
    order: 1;
  }
  
  .sticky-cart-sidebar {
    flex: 1; /* Carrito más pequeño */
    order: 2;
    position: static;
    max-width: none;
    height: fit-content;
  }
  
  /* Grid de productos para móvil - Optimizado para el layout horizontal */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en móvil */
    gap: 8px;
  }
  
  /* Ajustar tarjetas de productos para móvil - Layout como en la imagen */
  .product-card {
    padding: 8px;
    font-size: 0.8rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .product-img {
    width: 50px;
    height: 50px;
  }
  
  .product-name {
    font-size: 0.7rem;
    font-weight: 600;
  }
  
  .price-amount {
    font-size: 0.8rem;
    font-weight: 700;
  }
  
  /* Carrito móvil - Layout como en la imagen */
  .cart-summary {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .cart-empty {
    text-align: center;
    padding: 15px;
  }
  
  .cart-empty-icon {
    font-size: 2.5rem;
    color: #ccc;
    margin-bottom: 8px;
  }
  
  /* Botones móviles */
  .add-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  
  .order-btn {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    margin-top: 10px;
  }
}

/* Móviles muy pequeños - Diseño ultra compacto */
@media screen and (max-width: 480px) {
  .main-content {
    padding: 5px;
  }
  
  /* Banners más compactos */
  .banner-left,
  .banner-right {
    height: 150px;
  }
  
  .banner-medium-top,
  .banner-medium-bottom {
    height: 70px;
  }
  
  .banner-left .banner-image-container,
  .banner-right .banner-image-container {
    height: 150px;
  }
  
  .banner-medium-top .banner-image-container,
  .banner-medium-bottom .banner-image-container {
    height: 70px;
  }
  
  /* Grid de productos - Una columna en móviles muy pequeños */
  .products-grid {
    grid-template-columns: 1fr; /* 1 columna en móviles muy pequeños */
    gap: 8px;
  }
  
  /* Tarjetas de productos más compactas */
  .product-card {
    padding: 8px;
    font-size: 0.8rem;
  }
  
  .product-img {
    width: 50px;
    height: 50px;
  }
  
  .product-name {
    font-size: 0.7rem;
  }
  
  .price-amount {
    font-size: 0.8rem;
  }
  
  /* Botones más pequeños */
  .add-btn {
    padding: 6px 10px;
    font-size: 0.7rem;
  }
  
  .order-btn {
    padding: 10px;
    font-size: 0.9rem;
  }
  
  /* Títulos más pequeños */
  .store-title {
    font-size: 1.5rem;
  }
  
  .points-bar {
    font-size: 0.9rem;
  }
}

/* Layout responsivo - Mantener diseño actual en todas las resoluciones */
.banners-unified-wrapper {
  display: flex;
  flex-direction: row; /* Mantener diseño horizontal original */
  gap: 15px;
  width: 100%;
  /* El escalado se encarga de reducir el tamaño proporcionalmente */
}

/* Banner izquierdo - proporciones originales */
.banner-left {
  flex: 3.8;
  height: 400px; /* Altura original */
}

/* Banners del centro - proporciones originales */
.banner-center {
  flex: 1.8;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner-medium-top,
.banner-medium-bottom {
  height: 190px; /* Altura original */
}

/* Banner derecho - proporciones originales */
.banner-right {
  flex: 2;
  height: 400px; /* Altura original */
}

/* Mantener alturas originales para todos los contenedores */
.banner-left .banner-placeholder,
.banner-left .banner-image-container,
.banner-right .banner-placeholder,
.banner-right .banner-image-container {
  height: 400px;
}

.banner-medium-top .banner-placeholder,
.banner-medium-top .banner-image-container,
.banner-medium-bottom .banner-placeholder,
.banner-medium-bottom .banner-image-container {
  height: 190px;
}

/* Estilos para pantallas grandes (1600px y más) */
@media screen and (min-width: 1600px) {
  /* Contenedor principal con alineación estable */
  .banners-unified-wrapper {
    display: flex;
    flex-direction: row;
    gap: 15px;
    width: 100%;
    position: relative;
    /* Estabilizar contra zoom del navegador */
    transform-origin: top left;
    will-change: auto;
    contain: layout style paint;
    /* Prevenir cambios de alineación */
    align-items: stretch;
    justify-content: flex-start;
  }
  
  /* Banner izquierdo - Alineación estable */
  .banner-left {
    flex: 3.8;
    min-width: 0;
    position: relative;
    align-self: stretch;
    /* Mantener proporciones fijas */
    width: calc(3.8 / 7.6 * 100% - 10px);
    max-width: calc(3.8 / 7.6 * 100% - 10px);
    /* Estabilizar contra zoom */
    transform-origin: top left;
    will-change: auto;
  }
  
  /* Banners del centro - Alineación estable */
  .banner-center {
    flex: 1.8;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
    position: relative;
    justify-content: space-between;
    align-self: stretch;
    /* Mantener proporciones fijas */
    width: calc(1.8 / 7.6 * 100% - 5px);
    max-width: calc(1.8 / 7.6 * 100% - 5px);
    /* Estabilizar contra zoom */
    transform-origin: top left;
    will-change: auto;
  }
  
  /* Banner derecho - Alineación estable */
  .banner-right {
    flex: 2;
    min-width: 0;
    position: relative;
    align-self: stretch;
    /* Mantener proporciones fijas */
    width: calc(2 / 7.6 * 100% - 5px);
    max-width: calc(2 / 7.6 * 100% - 5px);
    /* Estabilizar contra zoom */
    transform-origin: top left;
    will-change: auto;
  }
  
  /* Estabilizar placeholders e imágenes */
  .banner-left .banner-placeholder,
  .banner-left .banner-image-container,
  .banner-right .banner-placeholder,
  .banner-right .banner-image-container {
    /* Mantener alturas fijas */
    height: 400px;
    min-height: 400px;
    max-height: 400px;
    /* Estabilizar contenido */
    position: relative;
    overflow: hidden;
  }
  
  .banner-medium-top .banner-placeholder,
  .banner-medium-top .banner-image-container,
  .banner-medium-bottom .banner-placeholder,
  .banner-medium-bottom .banner-image-container {
    /* Mantener alturas fijas */
    height: 190px;
    min-height: 190px;
    max-height: 190px;
    /* Estabilizar contenido */
    position: relative;
    overflow: hidden;
  }
}

/* Media queries para estabilizar alineación en diferentes zooms - Solo para pantallas grandes */
@media screen and (min-width: 1600px) and (min-resolution: 1.1dppx) {
  .banners-unified-wrapper {
    gap: 15px;
    /* Mantener alineación estable */
    align-items: stretch;
    justify-content: flex-start;
  }
  
  .banner-left {
    width: calc(3.8 / 7.6 * 100% - 10px);
    max-width: calc(3.8 / 7.6 * 100% - 10px);
  }
  
  .banner-center {
    width: calc(1.8 / 7.6 * 100% - 5px);
    max-width: calc(1.8 / 7.6 * 100% - 5px);
  }
  
  .banner-right {
    width: calc(2 / 7.6 * 100% - 5px);
    max-width: calc(2 / 7.6 * 100% - 5px);
  }
}

@media screen and (min-width: 1600px) and (min-resolution: 1.5dppx) {
  .banners-unified-wrapper {
    gap: 15px;
    /* Mantener alineación estable */
    align-items: stretch;
    justify-content: flex-start;
  }
  
  .banner-left {
    width: calc(3.8 / 7.6 * 100% - 10px);
    max-width: calc(3.8 / 7.6 * 100% - 10px);
  }
  
  .banner-center {
    width: calc(1.8 / 7.6 * 100% - 5px);
    max-width: calc(1.8 / 7.6 * 100% - 5px);
  }
  
  .banner-right {
    width: calc(2 / 7.6 * 100% - 5px);
    max-width: calc(2 / 7.6 * 100% - 5px);
  }
}

/* Media queries para zoom del navegador - Solo para pantallas grandes */
@media screen and (min-width: 1600px) and (min-zoom: 1.1) {
  .banners-unified-wrapper {
    gap: 15px;
    /* Mantener alineación estable */
    align-items: stretch;
    justify-content: flex-start;
  }
}

@media screen and (min-width: 1600px) and (min-zoom: 1.5) {
  .banners-unified-wrapper {
    gap: 15px;
    /* Mantener alineación estable */
    align-items: stretch;
    justify-content: flex-start;
  }
}

@media screen and (min-width: 1600px) and (min-zoom: 2) {
  .banners-unified-wrapper {
    gap: 15px;
    /* Mantener alineación estable */
    align-items: stretch;
    justify-content: flex-start;
  }
}

/* Estilos adicionales para mantener alineación estable */
@media screen and (min-width: 1600px) {
  /* Prevenir que el zoom afecte la alineación */
  .banners-unified-wrapper {
    /* Forzar alineación estable */
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
  }
  
  /* Mantener proporciones exactas */
  .banner-left {
    flex: 3.8 !important;
    width: calc(3.8 / 7.6 * 100% - 10px) !important;
    max-width: calc(3.8 / 7.6 * 100% - 10px) !important;
  }
  
  .banner-center {
    flex: 1.8 !important;
    width: calc(1.8 / 7.6 * 100% - 5px) !important;
    max-width: calc(1.8 / 7.6 * 100% - 5px) !important;
  }
  
  .banner-right {
    flex: 2 !important;
    width: calc(2 / 7.6 * 100% - 5px) !important;
    max-width: calc(2 / 7.6 * 100% - 5px) !important;
  }
}

/* Banner izquierda - El más ancho */
.banner-left {
  flex: 3.8;
  min-width: 0;
  position: relative;
  align-self: stretch;
}

.banner-left .banner-placeholder {
  height: 400px;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: repeating-conic-gradient(
    #f0f0f0 0deg 90deg,
    #e0e0e0 90deg 180deg
  );
  background-size: 20px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Banners del centro - Medianos */
.banner-center {
  flex: 1.8;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  position: relative;
  justify-content: space-between;
  align-self: stretch;
}

.banner-medium-top,
.banner-medium-bottom {
  width: 100%;
  height: 190px;
  position: relative;
  overflow: hidden;
  flex: 1;
}

/* Banner derecha - El más cuadrado */
.banner-right {
  flex: 2;
  min-width: 0;
  position: relative;
  align-self: stretch;
}

.banner-right .banner-placeholder {
  height: 400px;
}

/* Estilos para los placeholders de banners del centro y derecha */
.banner-medium-top .banner-placeholder,
.banner-medium-bottom .banner-placeholder,
.banner-right .banner-placeholder {
  width: 100%;
  height: 100%;
  background: repeating-conic-gradient(
    #f0f0f0 0deg 90deg,
    #e0e0e0 90deg 180deg
  );
  background-size: 20px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Estilos para los textos de banners del centro y derecha */
.banner-medium-top .banner-text,
.banner-medium-bottom .banner-text,
.banner-right .banner-text {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  text-align: center;
  padding: 16px;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}



.banner-placeholder {
  width: 100%;
  height: 100%;
  background: repeating-conic-gradient(
    #f0f0f0 0deg 90deg,
    #e0e0e0 90deg 180deg
  );
  background-size: 20px 20px;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Estilos unificados para todos los textos de banners */
.banner-text {
  color: #333;
  font-size: 14px;
  font-weight: 600;
  background: rgba(255,255,255,0.95);
  padding: 10px 16px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
}

/* Estilos para los placeholders de productos */
.product-placeholders {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  align-items: flex-start;
}

.placeholder-main {
  flex: 2;
  height: 150px;
  margin-right: 20px;
}

.placeholder-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 33.33%;
}

.placeholder-small {
  height: 65px;
}

.placeholder-content {
  width: 100%;
  height: 100%;
  background: repeating-conic-gradient(
    #f0f0f0 0deg 90deg,
    #e0e0e0 90deg 180deg
  );
  background-size: 20px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.placeholder-text {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(255,255,255,0.8);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* Estilos para el nuevo catálogo de productos */
.catalog-container {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  align-items: flex-start;
  min-height: auto;
  position: relative;
  overflow: visible;
  padding-top: 20px;
  width: 100%;
}

/* Asegurar que el contenedor tenga el comportamiento correcto para sticky */
.catalog-container {
  height: auto;
  overflow: visible;
}

/* Contenedor wrapper para controlar el comportamiento sticky del carrito */
.catalog-content-wrapper {
  min-height: auto;
  position: relative;
  overflow: visible;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  height: auto;
}

/* Contenedor interno del catálogo */
.catalog-inner-wrapper {
  flex: 1;
  min-height: auto;
  position: relative;
  height: auto;
  overflow: visible;
  width: 100%;
}

.products-main-area {
  flex: 3;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  min-height: auto;
  position: relative;
  width: 100%;
  margin-top: 0;
  overflow: visible;
  background: transparent;
  box-shadow: none;
  padding: 0;
  height: auto;
}

.catalog-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
  margin-top: 0;
}

.search-filter {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 14px 18px 14px 50px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  background-color: #fff;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-input:focus {
  border-color: #ff9800;
  outline: none;
  box-shadow: 0 2px 8px rgba(255,152,0,0.15);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.1rem;
}

.category-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.country-select, .category-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.country-select:focus, .category-btn:focus {
  border-color: #ff9800;
  outline: none;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
}

.category-btn.active {
  background: transparent;
  color: #ff9800;
  border-color: #ff9800;
  font-weight: 600;
}

.category-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.clear-filters-btn {
  background: transparent;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.clear-filters-btn:hover {
  background: rgba(0,0,0,0.05);
  color: #ff9800;
}

.clear-filters-btn i {
  font-size: 0.9rem;
  font-weight: bold;
}

  .products-catalog-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 columnas fijas como la imagen */
    gap: 20px; /* Espacio reducido entre cards para acercar productos */
    width: 100%;
    padding: 20px 0;
  }

.product-catalog-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  min-height: 300px;
  overflow: hidden;
}

.product-catalog-card::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  pointer-events: none;
  z-index: 1;
}

.product-catalog-card::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  bottom: 6px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.product-catalog-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12);
  border: 2px solid #ff9800;
  transform: translateY(-2px);
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
}

.product-catalog-card .card-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 25px 25px 0 0;
  border-color: #ff9800 transparent transparent transparent;
  z-index: 2;
  opacity: 0.9;
}

.points-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff9800;
  color: #fff;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  z-index: 3;
  border: 2px solid #fff;
}

.product-image-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
  transition: all 0.3s ease;
}

.product-image-container:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 16px rgba(255,107,53,0.2);
}

.product-catalog-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
}

.product-catalog-img:hover {
  transform: scale(1.05);
}

.product-catalog-info {
  width: 100%;
  text-align: center;
  margin-bottom: 8px;
}

.product-catalog-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b35;
  margin-bottom: 8px;
  line-height: 1.2;
  text-align: center;
  min-height: 2.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0;
  background: transparent;
  border: none;
  width: 100%;
  box-shadow: none;
}

.product-catalog-info-text {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
  margin-bottom: 9px;
  margin-top: -10px;
  line-height: 1.3;
  text-align: center;
}



.product-catalog-prrce {
  font-size: 0.9rem;
  color: #388e3c;
  font-weight: 500;
  margin-bottom: 8px;
  padding: 0;
  background: transparent;
  border: none;
  width: 100%;
  text-align: center;
  box-shadow: none;
}

.price-amount {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #388e3c;
  margin-top: 6px;
  margin-bottom: 8px;
}

.product-quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto; /* Empujar al final */
  width: 100%;
  background: #ffb74d;
  border-radius: 25px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(255,152,0,0.2);
}

.qty-control-btn {
  background: transparent;
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.qty-control-btn:first-child {
  border-radius: 21px 0 0 21px;
}

.qty-control-btn:last-child {
  border-radius: 0 21px 21px 0;
}

.qty-control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.quantity-display {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  min-width: 24px;
  text-align: center;
  background: transparent;
  padding: 8px 12px;
  border: none;
  box-shadow: none;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estilos específicos para los controles de cantidad en el modal del carrito */
.cart-item .qty-control-btn {
  width: 28px;
  height: 28px;
  font-size: 1rem;
  font-weight: 700;
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(255,152,0,0.2);
}

.cart-item .qty-control-btn:hover {
  background: #fb8c00;
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(255,152,0,0.3);
}

.cart-item .qty-control-btn:active {
  transform: scale(0.95);
}

.cart-item .quantity-display {
  font-size: 0.9rem;
  font-weight: 700;
  color: #333;
  min-width: 20px;
  text-align: center;
  background: #f8f8f8;
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0 4px;
  border: 1px solid #e0e0e0;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.add-to-cart-container {
  margin-top: auto;
  width: 100%;
}

.add-to-cart-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 26px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 12px rgba(255,152,0,0.25);
  width: 100%;
  justify-content: center;
}

.add-to-cart-btn:hover {
  background: linear-gradient(90deg, #fb8c00 60%, #ffa726 100%);
  box-shadow: 0 5px 18px rgba(255,152,0,0.35);
  transform: translateY(-2px);
}

.add-to-cart-btn:disabled {
  background: #ffe0b2;
  color: #ff9800;
  cursor: not-allowed;
  box-shadow: none;
}

.cart-sidebar {
  flex: 1;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow: hidden;
  position: fixed;
  top: 20px;
  right: -400px;
  width: 380px;
  z-index: 1000;
  transition: right 0.3s ease-in-out;
}

.cart-sidebar-open {
  right: 20px;
}

.cart-header {
  background: #f9f9f9;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #eee;
  border-radius: 15px 15px 0 0;
  position: relative;
}

.cart-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 8px 0;
  text-align: center;
}

.cart-header p {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  text-align: center;
}

.cart-items-container {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  max-height: 550px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #999;
  min-height: 200px;
}

.empty-cart i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #ddd;
}

.empty-cart p {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
}

.empty-cart span {
  font-size: 0.9rem;
  color: #999;
}

.close-cart-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}

.close-cart-btn:hover {
  color: #ff9800;
}

.cart-toggle-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(255,152,0,0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 999;
  margin-bottom: 45px;
  margin-right: -23px
}

.cart-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255,152,0,0.4);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e53935;
  color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(229, 57, 53, 0.3);
}

.product-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* Prevenir scroll del body */
  overflow: hidden;
}

.product-modal-content {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* Mantener el modal en la posición del scroll */
  position: relative;
}

.cart-items-container {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(255,152,0,0.12);
  border-color: #ff9800;
}

.cart-item-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 10px;
  flex-shrink: 0;
  background: #f8f8f8;
  padding: 8px;
  border: 1px solid #eee;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-item-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.cart-item-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-item-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #388e3c;
}

.cart-item-points {
  font-size: 1rem;
  font-weight: 600;
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-direction: column;
  gap: 6px;
}

.cart-item-quantity-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-item-remove-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #e53935;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #c62828;
  background: rgba(229, 57, 53, 0.1);
  transform: scale(1.1);
}

.remove-btn:active {
  transform: scale(0.95);
}

.cart-summary-section {
  padding: 18px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  flex-shrink: 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 1.1rem;
  color: #b26a00;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row span:first-child {
  font-weight: 600;
  color: #333;
}

.total-row {
  font-weight: 700;
  color: #388e3c;
  font-size: 1.05rem;
  padding-top: 4px;
  border-top: 1px solid #eee;
  margin-top: 4px;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 0 0 15px 15px;
  flex-shrink: 0;
}

.pay-btn, .add-more-btn, .view-detail-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255,152,0,0.13);
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  box-shadow: 0 4px 16px rgba(255,152,0,0.18);
  transform: scale(1.04);
}

.pay-btn:disabled {
  background: #ffe0b2;
  color: #ff9800;
  cursor: not-allowed;
  box-shadow: none;
}

.add-more-btn {
  background: #ffe0b2;
  color: #ff9800;
  box-shadow: none;
}

.add-more-btn:hover {
  background: #ffd5b2;
  box-shadow: none;
}

.view-detail-btn {
  background: linear-gradient(90deg, #ffb74d 60%, #ffcc02 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 183, 77, 0.2);
}

.view-detail-btn:hover {
  background: linear-gradient(90deg, #ffa726 60%, #ffb74d 100%);
  box-shadow: 0 4px 12px rgba(255, 183, 77, 0.3);
  transform: scale(1.02);
}

.product-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 15px 15px 0 0;
}

.product-modal-header h2 {
  font-size: 1.4rem; /* Más pequeño */
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}

.close-product-btn {
  background: none;
  border: none;
  font-size: 1.5rem; /* Más pequeño */
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  padding: 5px;
}

.close-product-btn:hover {
  color: #ff9800;
}

.product-modal-body {
  display: flex;
  gap: 20px; /* Menos espacio */
  padding: 15px 20px; /* Menos padding */
  overflow-y: auto;
  max-height: 60vh; /* Más pequeño */
  position: relative; /* Para posicionar la X */
}

.product-modal-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 250px; /* Más pequeño */
}

.product-modal-image {
  max-width: 100%;
  max-height: 200px; /* Más pequeño */
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.modal-product-img {
  max-width: 100%;
  max-height: 180px; /* Más pequeño */
  object-fit: contain;
  border-radius: 8px;
}

.product-modal-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
}

.product-modal-info {
  display: flex;
  flex-direction: column;
  gap: 12px; /* Menos espacio */
  margin-bottom: 15px;
}

.product-quantity {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 8px;
}

.modal-product-name {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.modal-product-price {
  font-size: 1.4rem; /* Más pequeño */
  font-weight: 700;
  color: #388e3c;
  margin-bottom: 5px;
}

.modal-product-points {
  font-size: 1rem; /* Más pequeño */
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 10px;
}

.product-description {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  flex: 1;
}

.product-description h4 {
  font-size: 1.1rem; /* Más pequeño */
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 10px;
}

.product-description p {
  font-size: 0.95rem; /* Más pequeño */
  color: #555;
  line-height: 1.6;
  max-height: 150px; /* Más pequeño */
  overflow-y: auto;
  padding-right: 10px;
}

.modal-product-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 5px 10px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.qty-control-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  padding: 5px 10px;
}

.qty-control-btn:hover {
  color: #ff9800;
}

.quantity-display {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  min-width: 30px;
  text-align: center;
}

.add-to-cart-modal-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 25px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255,152,0,0.13);
}

.add-to-cart-modal-btn:hover {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  box-shadow: 0 4px 16px rgba(255,152,0,0.18);
  transform: scale(1.04);
}

.add-to-cart-modal-btn:disabled {
  background: #ffe0b2;
  color: #ff9800;
  cursor: not-allowed;
  box-shadow: none;
}

/* Interfaz del carrito detallado (pegada a la derecha) */
.cart-detail-interface {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.cart-detail-interface-content {
  background: #fff;
  width: 450px;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.cart-detail-header {
  background: #fff;
  color: #333;
  padding: 20px 25px;
  border-bottom: 2px solid #f0f0f0;
  text-align: center;
  position: relative;
}

.cart-detail-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 8px 0;
}

.cart-detail-header p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.close-cart-detail-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-cart-detail-btn:hover {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.cart-detail-body {
  padding: 20px;
}

.cart-detail-items h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  color: #ff9800;
}

.cart-detail-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.cart-detail-item-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.cart-detail-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-detail-item-info {
  flex: 1;
}

.cart-detail-item-info h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.2;
}

.cart-detail-item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-detail-item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #388e3c;
}

.cart-detail-item-points {
  font-size: 0.85rem;
  color: #ff9800;
  font-weight: 600;
}

.cart-detail-item-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.cart-detail-quantity-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cart-detail-quantity-controls .qty-control-btn {
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 4px;
  width: 26px;
  height: 26px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(255,152,0,0.2);
}

.cart-detail-quantity-controls .qty-control-btn:hover {
  background: #fb8c00;
  transform: scale(1.05);
}

.cart-detail-quantity-controls .quantity-display {
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  min-width: 18px;
  text-align: center;
}

.remove-cart-item-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(229, 57, 53, 0.2);
}

.remove-cart-item-btn:hover {
  background: #d32f2f;
  transform: scale(1.05);
}

.empty-cart-detail {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-cart-detail i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 15px;
}

.empty-cart-detail p {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-cart-detail span {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
  display: block;
}

.cart-detail-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e0e0e0;
}

.cart-detail-summary h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  color: #ff9800;
}

.cart-detail-summary-details .summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 1rem;
}

.cart-detail-summary-details .summary-row:last-child {
  border-bottom: none;
}

.cart-detail-summary-details .total-row {
  font-weight: 700;
  color: #388e3c;
  font-size: 1.1rem;
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 8px;
}

.cart-detail-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.add-more-products-btn {
  background: linear-gradient(90deg, #ffb74d 60%, #ffcc02 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255, 183, 77, 0.2);
}

.add-more-products-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 183, 77, 0.4);
}

.go-to-pay-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
}

.go-to-pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.go-to-pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.close-product-btn-inside {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.close-product-btn-inside:hover {
  color: #ff9800;
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .products-catalog-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
    gap: 15px;
  }
  
  .products-main-area {
    order: 1;
  }
  
  .fixed-cart-sidebar {
    order: 2;
    width: 100%;
    position: static;
    max-height: 60vh;
  }
  
  .cart-detail-modal-content {
    width: 95%;
    max-width: 600px;
  }
  
  .cart-detail-header {
    padding: 20px 25px;
  }
  
  .cart-detail-header h2 {
    font-size: 1.6rem;
  }
  
  .cart-detail-body {
    padding: 20px;
  }
  
  .cart-detail-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .cart-detail-item-controls {
    flex-direction: row;
    gap: 15px;
  }
  
  .products-catalog-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
  
  .product-catalog-card {
    padding: 10px;
    min-height: 260px;
  }
  
  .product-image-container {
    width: 70px;
    height: 70px;
  }
  
  .product-catalog-name {
    font-size: 0.9rem;
  }
  
  .product-catalog-price {
    font-size: 0.8rem;
  }
}

@media (max-width: 600px) {
  .main-layout {
    gap: 10px;
  }
  
  .fixed-cart-sidebar {
    max-height: 50vh;
  }
  
  .cart-detail-modal-content {
    width: 98%;
    max-width: 500px;
  }
  
  .cart-detail-header {
    padding: 15px 20px;
  }
  
  .cart-detail-header h2 {
    font-size: 1.4rem;
  }
  
  .cart-detail-body {
    padding: 15px;
  }
  
  .cart-detail-item {
    padding: 15px;
  }
  
  .cart-detail-item-image {
    width: 60px;
    height: 60px;
  }
  
  .cart-detail-item-info h4 {
    font-size: 1rem;
  }
  
  .cart-detail-item-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .cart-detail-actions {
    gap: 12px;
  }
  
  .add-more-products-btn,
  .go-to-pay-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
  
  .products-catalog-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
  }
  
  .product-catalog-card {
    padding: 8px;
    min-height: 240px;
  }
  
  .product-image-container {
    width: 60px;
    height: 60px;
  }
  
  .product-catalog-name {
    font-size: 0.85rem;
  }
  
  .product-catalog-price {
    font-size: 0.75rem;
  }
  
  .qty-control-btn {
    width: 24px;
    height: 24px;
    font-size: 0.9rem;
  }
  
  .add-to-cart-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}

// Loading overlay que permite ver la vista opaca
.loading-overlay
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  background rgba(255, 255, 255, 0.9)
  backdrop-filter blur(5px)
  z-index 9999
  display flex
  align-items center
  justify-content center

// Clase para el contenido durante la carga
.content-loading
  opacity 0.3
  pointer-events none
  user-select none

// Logo de Sifrah para el loading
.sifrah-logo-loading
  width 120px
  height 120px
  background linear-gradient(135deg, #ff8c00 0%, #ffa726 100%)
  border-radius 50%
  display flex
  align-items center
  justify-content center
  margin-bottom 25px
  box-shadow 0 8px 30px rgba(255, 140, 0, 0.3)
  animation logoFloat 2s ease-in-out infinite
  
  i
    font-size 3.5rem
    color white
    text-shadow 0 2px 10px rgba(0, 0, 0, 0.2)

@keyframes logoFloat
  0%, 100%
    transform translateY(0px) scale(1)
  50%
    transform translateY(-10px) scale(1.05)

// Estilos para el loading container
.loading-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  min-height 400px
  padding 40px
  animation fadeIn 0.6s ease-in
  text-align center
  
  .loading-spinner-large
    width 80px
    height 80px
    border 6px solid #f3f3f3
    border-top 6px solid #ff8c00
    border-radius 50%
    animation spin 1.5s linear infinite
    margin-bottom 30px
    box-shadow 0 4px 20px rgba(255, 140, 0, 0.3)
  
  h2
    color #333
    font-size 1.8rem
    margin 0 0 15px 0
    font-weight 700
    text-align center
    letter-spacing -0.5px
  
  p
    color #666
    font-size 1.1rem
    margin 0 0 20px 0
    font-weight 500
    text-align center
    max-width 400px
    line-height 1.4
  
  .error-message
    background #ffebee
    color #c62828
    padding 20px 30px
    border-radius 15px
    border 1px solid #ffcdd2
    font-size 1.1rem
    text-align center
    max-width 600px
    box-shadow 0 6px 25px rgba(198, 40, 40, 0.2)
    margin-top 20px

@keyframes fadeIn
  from
    opacity 0
    transform translateY(10px)
  to
    opacity 1
    transform translateY(0)

@keyframes spin
  0%
    transform rotate(0deg)
  100%
    transform rotate(360deg)

// Estilos para el loading sutil del grid de productos
.products-loading
  display flex
  flex-direction column
  align-items center
  justify-content center
  min-height 300px
  padding 40px
  
  .loading-spinner-medium
    width 40px
    height 40px
    border 3px solid #f3f3f3
    border-top 3px solid #ff9800
    border-radius 50%
    animation spin 1s linear infinite
    margin-bottom 15px
  
  p
    color #666
    font-size 1rem
    margin 0

// Estilos para el catálogo con transición
.catalog-container
  animation fadeInUp 0.5s ease-out
  transition all 0.3s ease

@keyframes fadeInUp
  from
    opacity 0
    transform translateY(20px)
  to
    opacity 1
    transform translateY(0)

.clear-filters-btn i {
  font-size: 0.8rem;
}

.products-count-indicator {
  grid-column: 1 / -1;
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #666;
  border: 1px solid #e9ecef;
}

.products-count-indicator .filter-active {
  color: #ff9800;
  font-weight: 600;
  margin-left: 8px;
}

.no-products-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin: 20px 0;
}

.no-products-message i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 15px;
}

.no-products-message h4 {
  font-size: 1.2rem;
  color: #495057;
  margin: 0 0 10px 0;
}

.no-products-message p {
  color: #6c757d;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
}

/* Estilos adicionales para mejorar el comportamiento sticky del carrito */
@media (max-width: 1200px) {
  .sticky-cart-sidebar {
    width: 320px;
  }
}

/* Media queries para hacer el carrito responsivo y que se aplaste */
@media (max-width: 1400px) {
  .sticky-cart-sidebar {
    width: 380px;
    /* Mantener altura y posición relativa al banner */
    top: 20px;
    max-height: calc(100vh - 40px);
  }
}

@media (max-width: 1200px) {
  .sticky-cart-sidebar {
    width: 320px;
    /* Ajustar altura para mantener proximidad al banner */
    top: 20px;
    max-height: calc(100vh - 40px);
  }
}

@media (max-width: 1000px) {
  .sticky-cart-sidebar {
    width: 280px;
    /* Reducir altura para acercarse más al banner */
    top: 15px;
    max-height: calc(100vh - 30px);
  }
}

@media (max-width: 900px) {
  .sticky-cart-sidebar {
    width: 250px;
    /* Ajustar altura para mantener proximidad */
    top: 15px;
    max-height: calc(100vh - 30px);
  }
}

@media (max-width: 800px) {
  .sticky-cart-sidebar {
    width: 220px;
    /* Reducir altura para acercarse más al banner */
    top: 10px;
    max-height: calc(100vh - 20px);
  }
}

@media (max-width: 768px) {
  .catalog-container {
    flex-direction: column;
    padding-top: 0;
  }
  
  .catalog-content-wrapper {
    flex-direction: column;
  }
  
  .sticky-cart-sidebar {
    width: 100%;
    position: relative;
    top: 0;
    right: 0;
    margin-top: 20px;
    max-height: none;
  }
  
  .products-main-area {
    min-height: auto;
    margin-right: 0;
  }
}

/* Media queries adicionales para hacer el carrito responsivo y que se aplaste */
@media (max-width: 600px) {
  .sticky-cart-sidebar {
    width: 100%;
    margin: 10px 0;
    border-radius: 10px;
    /* Mantener altura relativa al banner */
    top: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .carrito-compras-container {
    width: 100%;
    align-items: stretch;
    min-height: 350px;
  }
}

@media (max-width: 480px) {
  .sticky-cart-sidebar {
    width: 100%;
    margin: 5px 0;
    border-radius: 8px;
    min-height: 400px;
    /* Ajustar altura para mantener proximidad al banner */
    top: 5px;
    max-height: calc(100vh - 10px);
  }
  
  .carrito-compras-container {
    min-height: 300px;
  }
  
  .cart-header h3 {
    font-size: 1.1rem;
  }
  
  .cart-header p {
    font-size: 0.85rem;
  }
}

/* Estilos adicionales para mantener la altura relativa al banner */
@media (max-width: 1600px) {
  .carrito-compras-container {
    /* Ajustar altura para pantallas menores a 1600px */
    min-height: 350px;
  }
  
  .sticky-cart-sidebar {
    /* Mantener proximidad al banner */
    top: 15px;
    max-height: calc(100vh - 30px);
  }
}

/* Asegurar que el grid de productos tenga suficiente contenido para el sticky */
.products-catalog-grid {
  min-height: auto;
  padding-bottom: 50px;
  position: relative;
  height: auto;
}

/* Mejorar el comportamiento del carrito sticky */
.sticky-cart-sidebar {
  position: -webkit-sticky;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  transition: all 0.3s ease;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.sticky-cart-sidebar:hover {
  box-shadow: 0 6px 25px rgba(0,0,0,0.15);
}

/* Asegurar que el carrito se alinee con el contenido */
.sticky-cart-sidebar .cart-header {
  padding-top: 0;
  margin-top: 0;
}

/* Media queries específicas para diferentes niveles de zoom */
@media screen and (min-resolution: 1.1dppx) {
  .banners-unified-grid {
    gap: 22px;
  }
  
  .banner-left-text,
  .banner-center-top-text,
  .banner-center-bottom-text,
  .banner-right-text {
    font-size: 15px;
  }
}

@media screen and (min-resolution: 1.5dppx) {
  .banners-unified-grid {
    gap: 25px;
  }
  
  .banner-left-text,
  .banner-center-top-text,
  .banner-center-bottom-text,
  .banner-right-text {
    font-size: 16px;
  }
}

/* Media queries para diferentes escalas de zoom del navegador */
@media screen and (min-width: 1200px) and (max-width: 1400px) {
  .banner-left-element,
  .banner-right-element {
    height: 300px;
  }
  
  .banner-center-top-placeholder,
  .banner-center-bottom-placeholder {
    height: 140px;
  }
}

@media screen and (min-width: 1400px) and (max-width: 1800px) {
  .banner-left-element,
  .banner-right-element {
    height: 320px;
  }
  
  .banner-center-top-placeholder,
  .banner-center-bottom-placeholder {
    height: 150px;
  }
}

@media screen and (min-width: 1800px) {
  .banner-left-element,
  .banner-right-element {
    height: 350px;
  }
  
  .banner-center-top-placeholder,
  .banner-center-bottom-placeholder {
    height: 165px;
  }
}

/* Media queries para dispositivos con alta densidad de píxeles */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .banner-placeholder {
    background-size: clamp(12px, 1.2vw, 20px);
  }
}

/* Media queries para dispositivos con muy alta densidad de píxeles */
@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi) {
  .banner-placeholder {
    background-size: clamp(10px, 1vw, 18px);
  }
}

/* Media queries para diferentes escalas de zoom del navegador */
@media (min-zoom: 1.1) {
  .banners-unified-wrapper {
    gap: 22px;
  }
}

@media (min-zoom: 1.5) {
  .banners-unified-wrapper {
    gap: 25px;
  }
}

@media (min-zoom: 2) {
  .banners-unified-wrapper {
    gap: 28px;
  }
}

/* Estilos adicionales para mejorar la experiencia del zoom */
.banner-left, .banner-center, .banner-right {
  transform-origin: center;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Prevenir distorsión en diferentes escalas de zoom */
@media (min-resolution: 1.1dppx) {
  .banner-placeholder {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Mejorar la calidad de renderizado en dispositivos de alta resolución */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .banner-placeholder {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Asegurar que los banners mantengan su proporción en todos los niveles de zoom */
.banner-left, .banner-center, .banner-right {
  min-width: 0;
  max-width: 100%;
}

/* Media queries para tablets */
@media (min-width: 768px) and (max-width: 1024px) {
  .banners-unified-wrapper {
    gap: 25px;
  }
  
  .products-catalog-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  
  .product-catalog-card {
    min-height: 260px;
    padding: 16px;
  }
}

/* Media queries para dispositivos móviles grandes */
@media (min-width: 480px) and (max-width: 767px) {
  .banners-unified-wrapper {
    gap: 20px;
  }
  
  .products-catalog-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .product-catalog-card {
    min-height: 240px;
    padding: 14px;
  }
}

/* Media queries para los nuevos contenedores */
@media (max-width: 1800px) {
  .tienda-sifrah-container {
    max-width: 95%;
    padding: 15px;
    margin: 0 0 0 15px;
  }
}

@media (max-width: 1400px) {
  .tienda-sifrah-container {
    max-width: 98%;
    padding: 15px;
    margin: 0 0 0 15px;
  }
}

@media (max-width: 1200px) {
  .tienda-sifrah-container {
    max-width: 98%;
    padding: 15px;
    margin: 0 0 0 15px;
  }
}

@media (max-width: 768px) {
  .tienda-sifrah-container {
    max-width: 100%;
    padding: 10px;
    border-radius: 15px;
    margin: 0 0 0 10px;
  }
  
  .store-title {
    font-size: 2rem;
    text-align: left;
  }
  
  .points-bar {
    padding: 12px 20px;
    font-size: 1rem;
    margin: 0 0 15px 0;
  }
  
  .productos-compras-section {
    margin-top: 20px;
    padding: 15px 0;
  }
}

@media (max-width: 480px) {
  .tienda-sifrah-container {
    padding: 8px;
    border-radius: 10px;
    margin: 0 0 0 8px;
  }
  
  .store-title {
    font-size: 1.8rem;
    margin: 0 0 15px 0;
    text-align: left;
  }
  
  .points-bar {
    padding: 10px 15px;
    font-size: 0.9rem;
    margin: 0 0 10px 0;
  }
  
  .productos-compras-section {
    margin-top: 15px;
    padding: 10px 0;
  }
  
  .product-image-container {
    width: 90px;
    height: 90px;
  }
}

/* Media queries para dispositivos móviles pequeños */
@media (max-width: 479px) {
  .products-catalog-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .product-catalog-card {
    min-height: 220px;
    padding: 12px;
  }
  
  .product-image-container {
    width: 80px;
    height: 80px;
  }
  
  .product-catalog-name {
    font-size: 1.1rem;
  }
  
  .price-amount {
    font-size: 1.2rem;
  }
}

/* Estilos para las imágenes de banners */
.banner-image-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #d0d0d0;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Mantener 'cover' para llenar el espacio */
  object-position: center center; /* Centrar la imagen */
  border-radius: 12px;
  transition: all 0.3s ease;
  /* Asegurar que la imagen llene completamente el contenedor */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Ajustes específicos para el banner izquierdo (más ancho) */
.banner-left .banner-image {
  object-fit: cover;
  object-position: center center; /* Centrar horizontalmente y verticalmente */
}

/* Ajustes para banners del centro (más cuadrados) */
.banner-medium-top .banner-image,
.banner-medium-bottom .banner-image {
  object-fit: cover;
  object-position: center center; /* Centrar para mejor visualización */
}

/* Ajustes para banner derecho (más alto que ancho) */
.banner-right .banner-image {
  object-fit: cover;
  object-position: center center; /* Centrar para mantener proporciones */
}

/* Ajustes de proporciones para diferentes resoluciones */
@media screen and (min-width: 1920px) and (max-width: 2559px) {
  .banner-left .banner-image {
    object-position: center 30%; /* Mantener proporción del jaguar */
  }
  
  .banner-medium-top .banner-image,
  .banner-medium-bottom .banner-image {
    object-position: center 40%;
  }
  
  .banner-right .banner-image {
    object-position: center 35%;
  }
}

@media screen and (min-width: 1600px) and (max-width: 1919px) {
  .banner-left .banner-image {
    object-position: center 30%;
  }
  
  .banner-medium-top .banner-image,
  .banner-medium-bottom .banner-image {
    object-position: center 40%;
  }
  
  .banner-right .banner-image {
    object-position: center 35%;
  }
}

@media screen and (min-width: 1440px) and (max-width: 1599px) {
  .banner-left .banner-image {
    object-position: center 30%;
  }
  
  .banner-medium-top .banner-image,
  .banner-medium-bottom .banner-image {
    object-position: center 40%;
  }
  
  .banner-right .banner-image {
    object-position: center 35%;
  }
}

.banner-image:hover {
  transform: scale(1.02);
}

/* Asegurar que las imágenes tengan las mismas dimensiones que los placeholders */
.banner-left .banner-image-container {
  height: 400px;
}

.banner-medium-top .banner-image-container,
.banner-medium-bottom .banner-image-container {
  height: 190px;
}

.banner-right .banner-image-container {
  height: 400px;
}

/* Estilos responsivos para mantener proporcionalidad en diferentes resoluciones */
@media screen and (max-width: 1599px) {
  .banner-image {
    object-fit: cover;
    object-position: center center;
    width: 100%;
    height: 100%;
  }
  
  .banner-image-container {
    position: relative;
    overflow: hidden;
  }
}

/* Para pantallas muy pequeñas (móviles) */
@media screen and (max-width: 768px) {
  .banner-image {
    object-fit: cover;
    object-position: center center;
    width: 100%;
    height: 100%;
  }
  
  .banner-image-container {
    position: relative;
    overflow: hidden;
    min-height: 120px;
  }
}

/* Para pantallas de alta resolución */
@media screen and (min-resolution: 2dppx) {
  .banner-image {
    object-fit: cover;
    object-position: center center;
    width: 100%;
    height: 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

</style>
