<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div v-cloak>
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
      <h4 class="products-title">Catálogo de Productos</h4>

      <!-- Nuevo catálogo de productos con carrito -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando productos...</p>
      </div>
      
      <div v-else-if="!products || products.length === 0" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p v-if="!products">Inicializando catálogo...</p>
        <p v-else>No hay productos disponibles</p>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <div v-else-if="loading" class="skeleton-container">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
        </div>
        <div class="skeleton-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="catalog-container">
        <!-- Área principal de productos -->
        <div class="products-main-area">
          <!-- Filtros y búsqueda -->
          <div class="catalog-filters">
            <div class="search-filter">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Busqueda..." 
                class="search-input"
              />
            </div>
            
            <div class="category-filters">
              <span>Puedes utilizar estos filtros.</span>
              <div class="category-buttons">
                <button 
                  v-for="category in categories" 
                  :key="category"
                  @click="toggleCategory(category)"
                  :class="{ active: selectedCategories.includes(category) }"
                  class="category-btn"
                >
                  {{ category }}
                </button>
              </div>
            </div>
          </div>

          <!-- Grid de productos -->
          <div v-if="loading" class="products-loading">
            <div class="loading-spinner-medium"></div>
            <p>Cargando catálogo...</p>
          </div>
          
          <div v-else class="products-catalog-grid">
            <div 
              v-for="(product, i) in filteredCatalogProducts" 
              :key="product.id || i"
              class="product-catalog-card"
              @click="openProductModal(product)"
            >
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
                <div class="product-catalog-price">
                  Precio Socio: <span class="price-amount">S/ {{ getProductPrice(product) }}</span>
                </div>
              </div>
              
              <!-- Controles de cantidad -->
              <div class="product-quantity-controls">
                <button 
                  v-if="getProductQuantity(product) > 0"
                  @click.stop="decreaseQuantity(product)"
                  class="qty-control-btn"
                >
                  -
                </button>
                <span v-if="getProductQuantity(product) > 0" class="quantity-display">
                  {{ getProductQuantity(product) }}
                </span>
                <button 
                  @click.stop="addToCart(product)"
                  :class="getProductQuantity(product) > 0 ? 'qty-control-btn' : 'add-to-cart-btn'"
                  :disabled="getProductQuantity(product) >= 10"
                >
                  <i v-if="getProductQuantity(product) === 0" class="fas fa-shopping-cart"></i>
                  {{ getProductQuantity(product) > 0 ? '+' : 'Agregar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar del carrito -->
        <div class="cart-sidebar" :class="{ 'cart-sidebar-open': showCart }">
          <div class="cart-header">
            <h3>Carrito de compras</h3>
            <p>Puedes hacer scroll para ver todos tus productos.</p>
            <button @click="toggleCart" class="close-cart-btn">
              <i class="fas fa-times"></i>
            </button>
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
                <span>Concepto:</span>
                <span>Sin Pack</span>
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
              IR A PAGAR
            </button>
            <button class="add-more-btn" @click="scrollToProducts">
              AÑADIR MÁS PRODUCTOS
            </button>
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

      <!-- Botón flotante del carrito -->
      <div v-if="!showCart" class="cart-toggle-btn" @click="toggleCart">
        <i class="fas fa-shopping-cart"></i>
        <span v-if="cartItems.length > 0" class="cart-badge">{{ cartItems.length }}</span>
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
        <button class="order-btn" v-show="!sending" @click="proceedToCheckout" :disabled="!office || (!check && !pay_method) || cartItems.length === 0">
          <i class="fas fa-shopping-cart"></i>
          <span>Confirmar y Ordenar</span>
    </button>
        <button class="order-btn loading" v-show="sending" disabled>
          <i class="fas fa-spinner fa-spin"></i>
          <span>Procesando orden...</span>
    </button>
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
      showCart: false,
      cartItems: [],
      searchTerm: "",
      selectedCategories: [],
      categories: ["Todos", "Suplementos", "Belleza", "Salud", "Energía"],
      current_points: 0,
      current_profit: 0,
      balance: 0,
      _balance: 0,
      tab: "Todos",
      total: 0,
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
      if (!this.products) return [];
      
      const arr = this.products.map(function (x) {
        return x.type;
      });

      let ret = arr.filter(function (v, i, self) {
        return i == self.indexOf(v);
      });

      return ret;
    },

    // Computed properties para el catálogo de productos
    catalogProducts() {
      // Si está cargando o no hay productos, retornar array vacío
      if (this.loading || !this.products) {
        return [];
      }
      
      return this.products.filter(product => {
        const matchesSearch = !this.searchTerm || 
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategories.length === 0 || 
          this.selectedCategories.includes(product.type);
        
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
      this.product = this.products.length > 0 ? this.products[0] : null;

      this.balance = data.balance || 0;
      this._balance = data._balance || 0;

      if (this.office_id) this.office = this.office_id;

      this.offices = data.offices || [];
      this.tab = this.categories[0];
      
    } catch (error) {
      console.error('Error loading activation data:', error);
      this.error = "Error al cargar los datos. Por favor, intenta de nuevo.";
    } finally {
      this.loading = false;
    }
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

      // Validación de productos y oficina
      if (!this.total) {
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
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(category);
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
    },
    removeFromCart(index) {
      this.cartItems.splice(index, 1);
    },
    getProductQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      return item ? item.total : 0;
    },
    increaseQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      if (item) {
        item.total += 1;
      }
    },
    decreaseQuantity(product) {
      const item = this.cartItems.find(item => item.id === product.id);
      if (item && item.total > 0) {
        item.total -= 1;
        // Si llega a 0, remover del carrito
        if (item.total === 0) {
          this.removeFromCart(this.cartItems.indexOf(item));
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
        this.error = "No hay productos en el carrito";
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
      
      // Limpiar carrito y procesar orden
      this.cartItems = [];
      this.error = null;
      this.sending = true;
      this.POST();
    },

    toggleCart() {
      this.showCart = !this.showCart;
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
  
  /* Responsive para el catálogo */
  .catalog-container
    flex-direction column
    gap 15px
  
  .products-catalog-grid
    grid-template-columns repeat(auto-fit, minmax(240px, 1fr))
    gap 15px
  
  .catalog-filters
    flex-direction column
    gap 12px
  
  .search-filter
    min-width 100%
  
  .category-buttons
    justify-content center
  
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

/* Estilos para el nuevo catálogo de productos */
.catalog-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.products-main-area {
  flex: 2;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}

.catalog-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-filter {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #ff9800;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.1rem;
}

.country-filter, .category-filters {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: #ffe0b2;
  color: #ff9800;
  border: 1px solid #ff9800;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s, border-color 0.2s;
}

.category-btn.active {
  background: #ff9800;
  color: #fff;
  border-color: #ff9800;
}

.products-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Más pequeño para 4 columnas */
  gap: 15px; /* Menos espacio entre cards */
}

.product-catalog-card {
  background: #fff;
  border-radius: 12px; /* Más pequeño */
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 12px; /* Menos padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
  border: 2px solid transparent;
  min-height: 280px; /* Altura fija más pequeña */
}

.product-catalog-card:hover {
  box-shadow: 0 4px 16px rgba(255,152,0,0.13);
  border: 2px solid #ff9800;
  transform: scale(1.02); /* Menos escala */
}

.points-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff9800;
  color: #fff;
  border-radius: 10px;
  padding: 3px 8px;
  font-size: 0.75rem; /* Más pequeño */
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(255,152,0,0.15);
}

.product-image-container {
  width: 80px; /* Más pequeño */
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  overflow: hidden;
}

.product-catalog-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-catalog-info {
  width: 100%;
  text-align: center;
  margin-bottom: 8px;
}

.product-catalog-name {
  font-size: 0.95rem; /* Más pequeño */
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 3px;
  line-height: 1.2;
}

.product-catalog-price {
  font-size: 0.85rem; /* Más pequeño */
  color: #388e3c;
  font-weight: 600;
}

.product-quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto; /* Empujar al final */
  width: 100%;
}

.qty-control-btn {
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-control-btn:hover {
  background: #fb8c00;
  transform: scale(1.05);
}

.quantity-display {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  min-width: 20px;
  text-align: center;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
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

.add-to-cart-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(255,152,0,0.13);
}

.add-to-cart-btn:hover {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  box-shadow: 0 4px 12px rgba(255,152,0,0.18);
  transform: scale(1.04);
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
  padding: 16px 16px 12px 16px;
  border-bottom: 1px solid #eee;
  border-radius: 15px 15px 0 0;
  position: relative;
}

.cart-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 6px 0;
  text-align: center;
}

.cart-header p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  text-align: center;
}

.cart-items-container {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  gap: 12px;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(255,152,0,0.12);
  border-color: #ff9800;
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
  background: #f8f8f8;
  padding: 6px;
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
  font-size: 0.8rem;
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
  font-size: 0.95rem;
  font-weight: 600;
  color: #388e3c;
}

.cart-item-points {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
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
  padding: 14px 16px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  flex-shrink: 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1rem;
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
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 0 0 15px 15px;
  flex-shrink: 0;
}

.pay-btn, .add-more-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

// Estilos para el loading container
.loading-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  min-height 400px
  padding 40px
  animation fadeIn 0.3s ease-in
  
  .loading-spinner-large
    width 60px
    height 60px
    border 4px solid #f3f3f3
    border-top 4px solid #ff9800
    border-radius 50%
    animation spin 1s linear infinite
    margin-bottom 20px
  
  p
    color #666
    font-size 1.1rem
    margin 0 0 15px 0
  
  .error-message
    background #ffebee
    color #c62828
    padding 12px 20px
    border-radius 8px
    border 1px solid #ffcdd2
    font-size 0.9rem
    text-align center
    max-width 400px

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


</style>
