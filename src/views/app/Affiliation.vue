<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div v-cloak>
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando afiliación...</p>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <div v-else-if="affiliation && affiliation.status === 'pending'" class="affiliation-bg" style="position: relative; min-height: 80vh">
        <transition name="fade">
          <div class="pending-modal-local">
            <div class="pending-modal-content-block">
              <span class="pending-modal-icon-block">
                <!-- Reloj de arena animado SVG -->
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="hourglass-anim"
                >
                  <g>
                    <rect
                      x="16"
                      y="8"
                      width="32"
                      height="48"
                      rx="8"
                      fill="#fffbe6"
                      stroke="#ff9800"
                      stroke-width="3"
                    />
                    <path
                      d="M20 12 Q32 32 44 12"
                      stroke="#ff9800"
                      stroke-width="3"
                      fill="none"
                    />
                    <path
                      d="M20 52 Q32 32 44 52"
                      stroke="#ff9800"
                      stroke-width="3"
                      fill="none"
                    />
                    <ellipse
                      class="sand-top"
                      cx="32"
                      cy="20"
                      rx="7"
                      ry="4"
                      fill="#ff9800"
                    />
                    <ellipse
                      class="sand-bottom"
                      cx="32"
                      cy="44"
                      rx="7"
                      ry="4"
                      fill="#ff9800"
                      opacity="0.2"
                    />
                    <rect
                      class="sand-flow"
                      x="30.5"
                      y="20"
                      width="3"
                      height="24"
                      rx="1.5"
                      fill="#ff9800"
                    />
                  </g>
                </svg>
              </span>
              <h3>¡Solicitud enviada!</h3>
              <p>Tu afiliación está pendiente de aprobación.</p>
            </div>
          </div>
        </transition>
      </div>

        <!-- Mensaje que aparece cuando se redirige desde opciones bloqueadas -->
        <div v-if="showRedirectMessage && !(affiliation && affiliation.status === 'pending')" class="affiliation-notification">
          <div class="affiliation-notification-content">
            <div class="affiliation-notification-header">
              <i class="fas fa-star" style="color: #ffd700; margin-right: 10px;"></i>
              <span style="font-weight: bold; font-size: 16px;">¡Bienvenido a Sifrah!</span>
            </div>
            <div class="affiliation-notification-body">
              Para comenzar tu experiencia, elige tu plan de afiliación y accede a todas las funcionalidades
            </div>
          </div>
        </div>
        
       
        
        <section v-if="!loading && !(affiliation && affiliation.status === 'pending')" class="affiliation-main-container">
          <!-- Contenido principal -->
          <div class="affiliation-content">
            <div v-if="showMasterTrophy">
              <div class="master-trophy-container">
                <img
                  class="master-trophy-img"
                  src="https://ik.imagekit.io/asu/sifrah/Trofeo%20sifrah_sIeu2fnie.png"
                />
                <h2 class="master-trophy-title">¡Felicidades!</h2>
                <p class="master-trophy-msg">
                  Has alcanzado el nivel
                  <span class="master-trophy-master">MASTER</span>
                </p>
                <button
                  class="main-action-btn master-trophy-btn"
                  @click="$router.push('/')"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
            <div v-else>
          <div v-if="upgradeMode" class="affiliation-alert">
            <b>Estás realizando un UPGRADE de plan.</b><br />
            Solo puedes elegir <b>{{ maxUpgradeProducts }}</b> productos
            adicionales.<br />
            Solo pagarás la diferencia: <b>S/. {{ upgradeDifference }}</b> y
            obtendrás <b>{{ upgradePoints }}</b> puntos extra.
          </div>
              <!-- Paso 1: Selección de productos -->
              <div v-if="step === 1">
                <!-- Banner principal -->
                <div class="affiliation-banner">
                  <div class="banner-content">
                    <h3>¡Comienza tu viaje con Sifrah!</h3>
                    <p>Elige tu plan de afiliación y descubre un mundo de oportunidades</p>
                  </div>
                </div>

                <!-- Sección 1: Selección de paquetes -->
                <div class="packages-section">
                  <h4 class="section-title">1.- Elige tu paquete de Afiliación:</h4>
                  <div class="packages-grid">
                    <div 
                      v-for="plan in plans" 
                      :key="plan.id"
                      class="package-card"
                      :class="{ active: selec_plan && selec_plan.id === plan.id }"
                      @click="selec_plan = plan"
                    >
                      <div class="package-image">
                        <img 
                          :src="plan.img || 'https://via.placeholder.com/150x100/ff6b9d/ffffff?text=Pack'" 
                          :alt="plan.name"
                          @error="handleImageError"
                          @load="handleImageLoad"
                        />
                      </div>
                      <div class="package-info">
                        <h5 class="package-name">{{ plan.name }}</h5>
                        <div class="package-price">S/{{ plan.amount }}</div>
                        <div class="package-description">
                          Seleccionas {{ plan.max_products }} productos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección 2: Kit de inicio -->
                <div class="kit-section">
                  <h4 class="section-title">2.- Llévate tu Kit de Inicio:</h4>
                  <div class="kit-banner">
                    <div class="kit-content">
                      <h5>Kit de Inicio Incluido</h5>
                      <p>Todo lo que necesitas para comenzar</p>
                    </div>
                  </div>
                </div>
                <!-- Sección 3: Selección de productos -->
                <div class="products-section">
                  <h4 class="section-title">3.- Escoge tus productos:</h4>
                  
                  <!-- Filtros y búsqueda -->
                  <div class="products-filters">
                    <div class="search-container">
                      <div class="search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                          v-model="searchTerm" 
                          type="text" 
                          placeholder="Búsqueda..." 
                          class="search-input"
                        />
                      </div>
                      <button v-if="searchTerm" @click="clearSearch" class="clear-search-btn">
                        X Limpiar
                      </button>
                    </div>
                    
                    <div class="category-filters">
                      <div class="category-buttons">
                        <button 
                          @click="selectedCategories = []"
                          :class="{ active: selectedCategories.length === 0 }"
                          class="category-btn"
                        >
                          Todos
                        </button>
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
                  <div class="products-grid">
                    <div 
                      v-for="(product, i) in filteredCatalogProducts" 
                      :key="product.id || i"
                      class="product-card"
                      v-if="
                        product.plans &&
                        product.plans[selec_plan.id] &&
                        Object.values(product.plans).some((plan) => plan === true)
                      "
                    >
                      <!-- Badge de puntos -->
                      <div class="product-points-badge">
                        <i class="fas fa-star"></i>
                        {{ product.points }} pts
                      </div>
                      
                      <!-- Imagen del producto -->
                      <div class="product-image-container" @click="openProductModal(product)">
                        <img 
                          :src="product.img || 'https://via.placeholder.com/150x150/f0f0f0/666666?text=Sin+Imagen'" 
                          :alt="product.name"
                          class="product-image"
                          @error="handleImageError"
                          @load="handleImageLoad"
                        />
                      </div>
                     
                      <!-- Información del producto -->
                      <div class="product-info">
                        <h4 class="product-name">{{ product.name }}</h4>
                        <div class="product-description">
                          {{ product.subdescription || product.description }}
                        </div>
                        <div class="product-price">
                          Precio Socio: <span class="price-amount">S/ {{ getProductPrice(product) }}</span>
                        </div>
                      </div>
                     
                      <!-- Controles de cantidad -->
                      <div class="product-controls">
                        <div v-if="upgradeMode ? upgradeProducts[i].total > 0 : products[i].total > 0" class="quantity-selector">
                          <button class="qty-btn" @click.stop="less(i)">-</button>
                          <span class="qty-display">
                            {{ upgradeMode ? upgradeProducts[i].total : products[i].total }}
                          </span>
                          <button
                            class="qty-btn"
                            @click.stop="more(i)"
                            :disabled="
                              upgradeMode
                                ? totalUpgradeProducts +
                                    (Number(product.weight) || 1) >
                                  maxUpgradeProducts
                                : false
                            "
                          >
                            +
                          </button>
                        </div>
                        <button 
                          v-else
                          class="add-to-cart-btn"
                          @click.stop="more(i)"
                          :disabled="
                            upgradeMode
                              ? totalUpgradeProducts +
                                  (Number(product.weight) || 1) >
                                maxUpgradeProducts
                              : false
                          "
                        >
                          <i class="fas fa-shopping-cart"></i>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrito de compras lateral - Solo visible si no es plan MASTER -->
          <div v-if="!showMasterTrophy" class="shopping-cart-sidebar">
            <div class="cart-header">
              <h3>Carrito de Compras</h3>
              <button class="close-cart-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="cart-content">
              <div v-if="(upgradeMode ? totalUpgradeProducts : total) === 0" class="empty-cart">
                <div class="empty-cart-icon">
                  <i class="fas fa-shopping-cart"></i>
                </div>
                <p class="empty-cart-text">Tu carrito está vacío</p>
                <p class="empty-cart-subtext">Agregar productos para comenzar</p>
              </div>
              
              <div v-else class="cart-items">
                <div class="cart-scroll">
                  <div
                    v-for="product in (upgradeMode ? upgradeProducts : products) || []"
                    v-if="product.total > 0"
                    class="cart-item"
                  >
                    <img
                      :src="product.img || 'https://via.placeholder.com/50x50/f0f0f0/666666?text=Sin+Imagen'"
                      :alt="product.name"
                      class="cart-item-img"
                      @error="handleImageError"
                    />
                    <div class="cart-item-info">
                      <span class="cart-item-name">{{ product.name }}</span>
                      <span class="cart-item-qty">{{ product.total }} x S/{{ getProductPrice(product) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="cart-summary">
              <div class="summary-item">
                <span>Concepto:</span>
                <span>{{ selec_plan ? selec_plan.name : 'Sin Pack' }}</span>
              </div>
              <div class="summary-item">
                <span>Puntos:</span>
                <span>{{ selec_plan ? selec_plan.affiliation_points : 0 }} pts</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>S/. {{ upgradeMode ? upgradeDifference : (selec_plan ? selec_plan.amount : 0) }}</span>
              </div>
            </div>
            
            <div class="cart-actions">
              <button class="view-detail-btn">Ver detalle</button>
              <button 
                class="go-to-pay-btn"
                :disabled="
                  (upgradeMode ? totalUpgradeProducts : total) !==
                  (upgradeMode ? maxUpgradeProducts : (selec_plan ? selec_plan.max_products : 0))
                "
                @click="handleGoToStep2"
              >
                Ir a Pagar
              </button>
            </div>
          </div>
        </section>



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
                          :src="selectedProduct.img || 'https://via.placeholder.com/300x300/f0f0f0/666666?text=Sin+Imagen'" 
                          :alt="selectedProduct.name"
                          class="modal-product-img"
                          @load="imageLoaded = true"
                          @error="handleImageError"
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
            
            <!-- Botón Afiliarme solo para móvil, antes de boletas -->
            <div
              v-if="
                step === 1 &&
                (upgradeMode ? totalUpgradeProducts : total) ===
                  (upgradeMode ? maxUpgradeProducts : (selec_plan ? selec_plan.max_products : 0))
              "
              class="afiliarme-mobile-btn"
            >
              <button class="main-action-btn" @click="handleGoToStep2">
                <span class="fab-icon">🤝</span>
                Afiliarme
              </button>
            </div>
          <!-- Paso 2: Datos de pago y confirmación -->
          <div v-else-if="step === 2">
            <div class="card-section confirm-section">
              <h4 class="section-title">Confirma tu afiliación</h4>
              <div class="summary-section confirm-summary">
                <div
                  v-for="product in upgradeMode ? upgradeProducts : products"
                  v-if="product.total > 0"
                  class="summary-item"
                >
                  <img
                    :src="product.img || 'https://via.placeholder.com/50x50/f0f0f0/666666?text=Sin+Imagen'"
                    :alt="product.name"
                    class="summary-img"
                    @error="handleImageError"
                  />
                  <span class="summary-product-name"
                    >{{ product.total }} x {{ product.name }}</span
                  >
                </div>
                <div class="summary-total">
                  <span>Total productos:</span>
                  <span
                    >{{ upgradeMode ? maxUpgradeProducts : total }} /
                    {{
                      upgradeMode ? maxUpgradeProducts : (selec_plan ? selec_plan.max_products : 0)
                    }}</span
                  >
                </div>
                <div class="summary-total">
                  <span>Total a pagar:</span>
                  <span>S/. {{ upgradeMode ? upgradeDifference : (selec_plan ? selec_plan.amount : 0) }}</span>
                </div>
                <div class="summary-total" v-if="upgradeMode">
                  <span>Puntos extra:</span>
                  <span>{{ upgradePoints }}</span>
                </div>
              </div>
              <div class="pay-section">
                <h5 class="section-title">Oficina y método de pago</h5>
                <select class="input input-lg" v-model="office">
                  <option value="null" disabled>Oficina</option>
                  <option v-for="office in offices" :value="office">
                    {{ office.name }}
                  </option>
                </select>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="check" />
                  <small>Deseo usar mi saldo</small>
                </label>
                <div v-if="!check" class="balance-info">
                  <small>Saldo no disponible: S/. {{ _balance }}</small
                  ><br />
                  <small>Saldo disponible: S/. {{ balance }}</small
                  ><br />
                <div class="pay-methods">
                  <small>Medio de Pago</small><br />
                  <label class="radio-label">
                    <input type="radio" :value="'bank'" v-model="pay_method" />
                    <small>Banco</small>
                  </label>
                  <label class="radio-label">
                    <input type="radio" :value="'cash'" v-model="pay_method" />
                    <small>Efectivo</small>
                  </label>
                </div>
                <div v-if="pay_method == 'bank'" class="bank-fields">
                  <input
                    class="input input-lg"
                    v-model="bank"
                    placeholder="Banco"
                  />
                  <input
                    class="input input-lg"
                    v-model="date"
                    placeholder="Fecha"
                    type="date"
                  />
                  <input
                    class="input input-lg"
                    v-model="voucher_number"
                    placeholder="Número de Voucher"
                    oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                  />
                  <label class="voucher-label">
                    <span class="input" v-show="!voucher"
                      >Comprobante de pago</span
                    >
                    <img class="voucher" v-show="voucher" :src="voucher" />
                    <input type="file" @change="change" :disabled="pending" />
                  </label>
                </div>
              </div>
              <div class="action-section">
                <small v-if="error" class="error-message"
                  >{{ error }}<br
                /></small>
                <button class="main-action-btn" v-show="!sending" @click="POST">
                  Confirmar afiliación
                </button>
                <button
                  class="main-action-btn sending"
                  v-show="sending"
                  disabled
                >
                  Enviando Voucher ...
                </button>
                <button class="main-action-btn back-btn" @click="goToStep(1)">
                  Volver
                </button>
                <small v-if="pending" class="success"
                  >pendiente de aprobación</small
                >
              </div>
            </div>
          <!-- Boletas -->
          <div class="card-section invoices-section">
            <div
              v-for="(affiliation, i) in affiliations"
              :key="affiliation.id"
              class="invoice-history-block"
            >
              <a
                :href="`${INVOICE_ROOT}?id=${affiliation.id}`"
                target="_blank"
                class="invoice-link"
              >
                Boleta {{ i + 1 }}
                <span v-if="affiliation.type === 'upgrade'" class="tag-upgrade"
                  >Upgrade</span
                >
              </a>
              <div
                v-if="affiliation.type === 'upgrade'"
                class="upgrade-details-block"
              >
                <div><b>Upgrade de plan</b></div>
                <div>
                  Plan anterior:
                  <b>{{
                    affiliation.previousPlan && affiliation.previousPlan.name
                  }}</b>
                </div>
                <div>
                  Diferencia pagada:
                  <b
                    >S/
                    {{
                      affiliation.difference && affiliation.difference.amount
                    }}</b
                  >
                </div>
                <div>
                  Productos adicionales:
                  <span
                    v-if="
                      affiliation.difference && affiliation.difference.products
                    "
                  >
                    {{
                      affiliation.difference.products
                        .filter((p) => p.total > 0)
                        .map((p) => `${p.total} ${p.name}`)
                        .join(", ")
                    }}
                  </span>
                  <span v-else>N/A</span>
                </div>
              </div>
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
import Spinner from "@/components/Spinner.vue";

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT;
console.log({ INVOICE_ROOT });

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
      sending: false,

      plans: null,
      selec_plan: null,
      voucher: null,
      voucher_file: null,
      office: null,
      offices: null,

      pay_method: null,

      pending: false,
      congrats: false,

      check: false,
      INVOICE_ROOT,

      step: 1, // 1: selección, 2: confirmación

      tab: null,
      products: null,
      product: null,

      error: null,

      bank: null,
      date: null,
      voucher_number: null,
      selectError: "",
      showPendingModal: false,
      upgradeMode: false,
      previousPlan: null,
      previousProducts: [],
      maxUpgradeProducts: 0,
      upgradeDifference: 0,
      upgradePoints: 0,
      upgradeProducts: [],
             affiliation: null,
       showRedirectMessage: false, // Controla si mostrar el mensaje de redirección
       // Nuevas propiedades para la selección de productos
       searchTerm: '',
       sortBy: 'name', // 'name', 'weight', 'popularity'
       viewMode: 'grid', // 'grid', 'list'
       
       // Nuevas propiedades para el catálogo de productos
       selectedCategories: [],
       selectedProduct: null,
       imageLoaded: false,
     };
   },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    plan() {
      return this.$store.state.plan;
    },
    affiliated() {
      return this.$store.state.affiliated;
    },

    categories() {
      if (!this.products) return [];
      // Filtrar productos que están en algún plan
      const productsWithPlans = this.products.filter(
        (product) =>
          product.plans &&
          Object.values(product.plans).some((plan) => plan === true)
      );
      return productsWithPlans
        .map((x) => x.type)
        .filter((v, i, self) => i == self.indexOf(v));
    },
    title() {
      return "Productos";
    },
    total() {
      if (!this.products) return 0;
      const weightTotal = this.products.reduce(
        (a, b) => a + (b.weight > 0 ? (b.total || 0) * b.weight : 0),
        0
      );
      return Math.ceil(weightTotal);
    },

    remaining() {
      if (!this.selec_plan) return 0;

      let ret = this.selec_plan.amount || 0;

      // balance
      ret -= this._balance || 0;

      if (ret < 0) ret = 0;

      if (ret == 0) return ret;

      // _balance
      ret -= this.balance || 0;

      if (ret < 0) ret = 0;

      return ret;
    },

    text() {
      if (!this.selec_plan) return "";
      return `S/. ${this.selec_plan.amount || 0} / ${
        this.selec_plan.affiliation_points || 0
      } PTS`;
    },

    totalPrice() {
      if (!this.products) return 0;
      return this.products.reduce(
        (a, b) => a + (b.total || 0) * (b.price || 0),
        0
      );
    },
    isMasterPlan() {
      return this.selec_plan && this.selec_plan.id === "master";
    },
    isMasterPlanApproved() {
      // Trofeo solo si la afiliación fue aprobada como master o el usuario ya es master
      return (
        (this.affiliation &&
          this.affiliation.plan &&
          this.affiliation.plan.id === "master" &&
          this.affiliation.status === "approved") ||
        this.plan === "master"
      );
    },
    showMasterTrophy() {
      // Mostrar trofeo solo si la afiliación master fue aprobada o el usuario ya es master
      return this.isMasterPlanApproved;
    },
    totalUpgradeProducts() {
      // Total de peso seleccionados en upgrade
      if (!this.upgradeProducts) return 0;
      return this.upgradeProducts.reduce(
        (a, b) => a + (Number(b.total) || 0) * (Number(b.weight) || 1),
        0
      );
    },

    // Nuevas propiedades computadas para el catálogo de productos
    catalogProducts() {
      if (!this.products) return [];
      
      return this.products.filter(product => {
        // Solo filtrar por búsqueda y categoría
        const matchesSearch = !this.searchTerm || product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(product.type);
        
        return matchesSearch && matchesCategory;
      });
    },

    filteredCatalogProducts() {
      // Si no hay productos filtrados, mostrar todos los productos
      const productsToShow = this.catalogProducts.length > 0 ? this.catalogProducts : this.products;
      
      return productsToShow || [];
    },


  },
  watch: {
    selec_plan() {
      if (!this.selec_plan) return;
      this.reset_totals();
      this.checkUpgradeMode();
    },
  },
  async created() {
    try {
      // Verificar si ya tenemos el estado de afiliación en el store
      console.log('Affiliation.vue: Estado actual del store:', {
        session: this.$store.state.session,
        affiliated: this.$store.state.affiliated
      });
      
      // Si ya tenemos el estado de afiliación, no hacer llamada al API
      if (this.$store.state.affiliated !== null && this.$store.state.affiliated !== undefined) {
        console.log('Affiliation.vue: Ya tenemos estado de afiliación, sincronizando...');
        
        // Sincronizar el estado desde el store en lugar de hacer llamada al API
        this.syncStateFromStore();
        return;
      }
      
      // Solo hacer llamada al API si no tenemos el estado
      console.log('Affiliation.vue: No tenemos estado de afiliación, haciendo llamada al API...');
      const { data } = await api.Afiliation.GET(this.session);
      console.log("API Response:", data);

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

      // Usar directamente los planes que llegan del backend
      this.plans = data.plans || [];
      if (this.plans.length > 0) {
        this.selec_plan = this.plans[0];
      }

      // Initialize products with proper structure
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products.map((product) => ({
          ...product,
          total: 0,
          plans: product.plans || {
            basic: false,
            standard: false,
            master: false,
          },
        }));

        if (this.products.length > 0) {
          this.product = this.products[0];
          // Set initial tab if categories exist
          if (this.categories && this.categories.length > 0) {
            this.tab = this.categories[0];
          }
        }
        

      } else {
        console.error("No products data received or invalid format");
        this.products = [];
      }

      this.balance = data.balance || 0;
      this._balance = data._balance || 0;
      this.offices = data.offices || [];
      this.affiliation = data.affiliation || null;
      this.affiliations = data.affiliations || [];

      // Llamar checkUpgradeMode después de que todo esté cargado
      if (this.selec_plan) {
        this.checkUpgradeMode();
      }

      // Set congrats state
      if (
        this.plan == "master" ||
        (this.affiliation &&
          this.affiliation.plan.id == "master" &&
          this.affiliation.status == "approved")
      ) {
        this.congrats = true;
      }

             // Set pending state
       if (this.affiliation && this.affiliation.status == "pending") {
         this.pending = true;
       }
       
       // Verificar si viene de una redirección desde opciones bloqueadas
       if (this.$route.query.redirected === 'true') {
         this.showRedirectMessage = true;
         // El mensaje desaparece automáticamente después de 4 segundos
         setTimeout(() => {
           this.showRedirectMessage = false;
         }, 4000);
       }
    } catch (error) {
      console.error("Error loading data:", error);
      this.error = "Error al cargar los datos. Por favor, intenta de nuevo.";
    } finally {
      // IMPORTANTE: Establecer loading en false ANTES de que termine la carga
      // para evitar la pantalla negra
      this.loading = false;
      
      // Pequeño delay para asegurar que la interfaz se renderice suavemente
      setTimeout(() => {
        console.log('Affiliation.vue: Carga completada, interfaz lista');
      }, 100);
    }
  },
  
  methods: {
    // Método para sincronizar estado desde el store
    async syncStateFromStore() {
      console.log('Affiliation.vue: Sincronizando estado desde el store...');
      
      // IMPORTANTE: Permitir que usuarios afiliados accedan libremente
      // Ellos pueden querer acceder para hacer upgrade o ver historial
      console.log('Affiliation.vue: Estado de afiliación:', this.$store.state.affiliated);
      
      try {
        // Hacer llamada al API para obtener datos necesarios para la afiliación
        const { data } = await api.Afiliation.GET(this.session);
        console.log('Affiliation.vue: Datos cargados para afiliación:', data);
        
        if (data.error && data.msg == "invalid session") {
          this.$router.push("/login");
          return;
        }
        
        // Establecer datos en el store (sin cambiar affiliated)
        if (data.name) this.$store.commit("SET_NAME", data.name);
        if (data.lastName) this.$store.commit("SET_LAST_NAME", data.lastName);
        if (data.photo) this.$store.commit("SET_PHOTO", data.photo);
        if (data.plan) this.$store.commit("SET_PLAN", data.plan);
        if (data.country) this.$store.commit("SET_COUNTRY", data.country);
        if (data.tree !== undefined) this.$store.commit("SET_TREE", data.tree);
        if (data.activated !== undefined) this.$store.commit("SET_ACTIVATED", data.activated);
        if (data._activated !== undefined) this.$store.commit("SET__ACTIVATED", data._activated);
        if (data.balance !== undefined) this.$store.commit("SET_BALANCE", data.balance);
        if (data._balance !== undefined) this.$store.commit("SET__BALANCE", data._balance);
        
        // Cargar datos específicos para la afiliación
        this.plans = data.plans || [];
        if (this.plans.length > 0) {
          this.selec_plan = this.plans[0];
        }
        
        // Initialize products with proper structure
        if (data.products && Array.isArray(data.products)) {
          this.products = data.products.map((product) => ({
            ...product,
            total: 0,
            plans: product.plans || {
              basic: false,
              standard: false,
              master: false,
            },
          }));
          
          if (this.products.length > 0) {
            this.product = this.products[0];
            // Set initial tab if categories exist
            if (this.categories && this.categories.length > 0) {
              this.tab = this.categories[0];
            }
          }
        } else {
          console.error("No products data received or invalid format");
          this.products = [];
        }
        
        this.balance = data.balance || 0;
        this._balance = data._balance || 0;
        this.offices = data.offices || [];
        this.affiliation = data.affiliation || null;
        this.affiliations = data.affiliations || [];
        
        // Llamar checkUpgradeMode después de que todo esté cargado
        if (this.selec_plan) {
          this.checkUpgradeMode();
        }
        
        // Set congrats state
        if (
          this.plan == "master" ||
          (this.affiliation &&
            this.affiliation.plan.id == "master" &&
            this.affiliation.status == "approved")
        ) {
          this.congrats = true;
        }
        
        // Set pending state
        if (this.affiliation && this.affiliation.status == "pending") {
          this.pending = true;
        }
        
        // Verificar si viene de una redirección desde opciones bloqueadas
        if (this.$route.query.redirected === 'true') {
          this.showRedirectMessage = true;
          // El mensaje desaparece automáticamente después de 4 segundos
          setTimeout(() => {
            this.showRedirectMessage = false;
          }, 4000);
        }
        
        console.log('Affiliation.vue: Datos cargados exitosamente');
        
      } catch (error) {
        console.error('Affiliation.vue: Error al cargar datos para afiliación:', error);
        this.error = "Error al cargar los datos de afiliación. Por favor, intenta de nuevo.";
      } finally {
        this.loading = false;
      }
    },
    reset_totals() {
      if (!this.products) return;
      this.products.forEach((p) => {
        p.total = 0;
      });
    },

    clearSearch() {
      this.searchTerm = "";
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

    handleImageError(event) {
      console.warn('Error cargando imagen:', event.target.src);
      // Si la imagen falla, usar una imagen placeholder
      event.target.src = 'https://via.placeholder.com/150x150/f0f0f0/666666?text=Error+Carga';
    },

    handleImageLoad(event) {
      console.log('Imagen cargada correctamente:', event.target.src);
    },







    getProductPrice(product) {
      // Implementar lógica de precio según el plan
      return product.price || 0;
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

    touch(i) {
      if (!this.products || !this.products[i]) return;
      this.product = this.products[i];
    },

    checkUpgradeMode() {
      if (!this.products) return;
      
      if (
        this.affiliation &&
        this.affiliation.status === "approved" &&
        this.selec_plan &&
        this.selec_plan.amount > this.affiliation.plan.amount
      ) {
        this.upgradeMode = true;
        this.previousPlan = this.affiliation.plan;
        this.previousProducts = this.affiliation.products || [];
        this.maxUpgradeProducts =
          this.selec_plan.max_products - (this.previousPlan.max_products || 0);
        this.upgradeDifference =
          this.selec_plan.amount - this.previousPlan.amount;
        this.upgradePoints =
          (this.selec_plan.affiliation_points || 0) -
          (this.previousPlan.affiliation_points || 0);
        // No máximo individual, solo el global
        this.upgradeProducts = this.products.map((p) => ({ ...p, total: 0 }));
      } else {
        this.upgradeMode = false;
        this.previousPlan = null;
        this.previousProducts = [];
        this.maxUpgradeProducts = this.selec_plan ? this.selec_plan.max_products : 0;
        this.upgradeDifference = this.selec_plan ? this.selec_plan.amount : 0;
        this.upgradePoints = this.selec_plan ? this.selec_plan.affiliation_points : 0;
        this.upgradeProducts = this.products.map((p) => ({
          ...p,
          max: p.max,
          total: 0,
        }));
      }
    },
    more(idx) {
      if (this.upgradeMode) {
        if (!this.upgradeProducts || !this.upgradeProducts[idx]) return;
        const product = this.upgradeProducts[idx];
        const nextTotal =
          this.totalUpgradeProducts + (Number(product.weight) || 1);
        if (nextTotal > this.maxUpgradeProducts) return;
        this.upgradeProducts[idx].total += 1;
      } else {
        if (!this.products || !this.products[idx]) return;
        const product = this.products[idx];
        const productWeight = Number(product.weight);
        if (isNaN(productWeight) || productWeight <= 0) return;
        const currentTotal = this.products.reduce(
          (a, b) => a + (Number(b.total) || 0) * Number(b.weight || 1),
          0
        );
        const newTotal = currentTotal + productWeight;
        if (newTotal > this.selec_plan.max_products) return;
        product.total += 1;
      }
    },
    less(idx) {
      if (this.upgradeMode) {
        if (!this.upgradeProducts || !this.upgradeProducts[idx]) return;
        if (this.upgradeProducts[idx].total > 0) {
          this.upgradeProducts[idx].total -= 1;
        }
      } else {
        if (!this.products || !this.products[idx]) return;
        const product = this.products[idx];
        if (product.total == 0) return;
        product.total -= 1;
      }
    },

    change(e) {
      this.voucher_file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.voucher = e.target.result;
      };

      reader.readAsDataURL(this.voucher_file);
    },

    async POST() {
      let products = this.upgradeMode ? this.upgradeProducts : this.products;
      if (!products) {
        this.error = "No hay productos disponibles";
        return;
      }
      
      let plan = this.selec_plan;
      let voucher = this.voucher;
      let office = this.office;
      let check = this.check;
      let pay_method = this.pay_method;
      let bank = this.bank;
      let date = this.date;
      let voucher_number = this.voucher_number;

      // Validación de productos y oficina
      if (!products.some(p => p.total > 0)) {
        this.error = "Seleccione productos";
        return;
      }
      if (!office) {
        this.error = "Seleccione oficina";
        return;
      }

      // Lógica de saldo y método de pago
      const saldoTotal = (this.balance || 0) + (this._balance || 0);
      const totalPagar = this.upgradeMode ? this.upgradeDifference : (this.selec_plan ? this.selec_plan.amount : 0);
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
            ? "El saldo no cubre el total, seleccione un método de pago para el restante."
            : "Seleccione un método de pago.";
          return;
        }
        // Validaciones adicionales para banco
        if (pay_method == "bank") {
          if (!bank) {
            this.error = "Nombre de banco";
            return;
          }
          if (!date) {
            this.error = "Fecha de voucher";
            return;
          }
          if (!voucher_number) {
            this.error = "Número de voucher";
            return;
          }
          if (!voucher) {
            this.error = "Voucher de pago";
            return;
          }
        }
      }

      this.error = null;
      this.sending = true;

      if (voucher)
        voucher = await lib.upload(
          this.voucher_file,
          this.voucher_file.name,
          "affiliations"
        );

      const { data } = await api.Afiliation.POST(this.session, {
        products,
        plan,
        voucher,
        office: office.id,
        check,
        pay_method,
        bank,
        date,
        voucher_number,
      });
      console.log({ data });

      this.sending = false;
      this.pending = true;
      this.affiliation = {
        plan: this.selec_plan,
        products: this.products,
        status: "pending",
      };
      // MODAL bonito de pendiente de aprobación y redirección
      this.showPendingModal = true;
      setTimeout(() => {
        this.showPendingModal = false;
        this.step = 1;
      }, 2000);
    },
    goToStep(n) {
      this.step = n;
    },
    handleGoToStep2() {
      if (this.upgradeMode) {
        const total = this.totalUpgradeProducts;
        if (total !== this.maxUpgradeProducts) {
          this.selectError = `Debes seleccionar exactamente ${this.maxUpgradeProducts} productos adicionales para tu upgrade (considerando el peso de cada producto).`;
          return;
        }
      } else {
        if (!this.selec_plan) {
          this.selectError = "Debes seleccionar un plan";
          return;
        }
        
        // Validar que se hayan seleccionado productos
        const selectedProducts = this.products.filter(p => p.total > 0);
        if (selectedProducts.length === 0) {
          this.selectError = "Debes seleccionar al menos un producto";
          return;
        }
        
        // Validar que los productos seleccionados correspondan al plan
        const invalidProducts = selectedProducts.filter(product => {
          return !product.plans || !product.plans[this.selec_plan.id];
        });
        
        if (invalidProducts.length > 0) {
          this.selectError = `Los productos ${invalidProducts.map(p => p.name).join(', ')} no están disponibles para el plan ${this.selec_plan.name}`;
          return;
        }
        
        // Validar cantidad total de productos
        if (this.total !== this.selec_plan.max_products) {
          this.selectError = `Debes seleccionar exactamente ${this.selec_plan.max_products} productos para continuar.`;
          return;
        }
      }
      this.selectError = "";
      this.goToStep(2);
    },
    // async pagarConMercadoPago() {
    //   try {
    //     const response = await api.mercadopagoPreference({
    //       description: `Afiliación ${this.selec_plan ? this.selec_plan.name : ''}`,
    //       price: this.upgradeMode ? this.upgradeDifference : this.selec_plan.amount,
    //       quantity: 1,
    //       payer_email: "test_user_116744135@testuser.com" // email de test comprador
    //     });
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
  },
};
</script>


<style lang="stylus">
@import '../../assets/style/views/app/Affiliation.styl'
</style>
