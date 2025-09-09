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
      
      <div v-else class="affiliation-bg" style="position: relative; min-height: 80vh">
        <h2 class="affiliation-title" v-if="!showMasterTrophy">
         ¡Comienza tu viaje con Sifrah!
       </h2>
       <p class="affiliation-subtitle" v-if="!showMasterTrophy">
         Elige tu plan de afiliación y descubre un mundo de oportunidades
       </p>
       
       <!-- Mensaje que aparece cuando se redirige desde opciones bloqueadas -->
       <div v-if="showRedirectMessage" class="affiliation-notification">
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
        
       
        
        <section v-if="!loading">
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
            <div class="card-section plan-section">
              <h4 class="section-title">1. Selecciona tu plan</h4>
              <select class="input input-lg" v-model="selec_plan">
                <option v-for="plan in plans" :value="plan">
                  {{ plan.name }}
                </option>
              </select>
              <div class="plan-info">
                <span class="plan-amount">S/. {{ selec_plan.amount }}</span>
                <span class="plan-points"
                  >{{ selec_plan.affiliation_points }} PTS</span
                >
                <span class="plan-kit">Kit: S/. {{ selec_plan.kit }}</span>
              </div>
            </div>
            <div class="catalog-section">
              <h4 class="section-title">2. Elige tus productos</h4>
              
              <!-- Nuevo catálogo de productos con carrito -->
              <div class="catalog-container">
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
                  <div 
                    v-for="category in categories"
                    :key="category"
                    class="category-block"
                  >
                    <h5 class="category-title">{{ category }}</h5>
                    <div class="products-catalog-grid" :class="viewMode">
                      <div 
                        v-for="(product, i) in filteredCatalogProducts" 
                        :key="product.id || i"
                        class="product-catalog-card"
                        @click="openProductModal(product)"
                        v-if="
                          product.type === category &&
                          product.plans &&
                          product.plans[selec_plan.id] &&
                          Object.values(product.plans).some((plan) => plan === true)
                        "
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
                        <!-- Debug: mostrar subdescription -->
                        <div v-if="product.subdescription" class="product-catalog-info-text">
                          {{ product.subdescription }}
                        </div>
                        <div class="product-catalog-price">
                          Precio Socio: <span class="price-amount">S/ {{ getProductPrice(product) }}</span>
                        </div>
                      </div>
                      
                      <!-- Controles de cantidad -->
                      <div class="product-controls-modern">
                        <button 
                          v-if="upgradeMode ? upgradeProducts[i].total > 0 : products[i].total > 0"
                          class="qty-btn" 
                          @click.stop="less(i)"
                        >
                          -
                        </button>
                        <span class="product-qty-modern">
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
                        <span v-if="upgradeMode" class="max-info">/ {{ product.max }} máx.</span>
                      </div>
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
              
              <!-- Resumen sticky -->
              <div
                class="sticky-summary"
                :class="{
                  show: (upgradeMode ? totalUpgradeProducts : total) > 0,
                }"
              >
              <div class="sticky-summary-content">
                <div class="sticky-products">
                  <div
                    v-for="product in (upgradeMode ? upgradeProducts : products) || []"
                    v-if="product.total > 0"
                    class="sticky-product-item"
                  >
                    <img
                      v-if="product.img"
                      :src="product.img"
                      :alt="product.name"
                      class="sticky-product-img"
                    />
                    <span class="sticky-product-name"
                      >{{ product.total }} x {{ product.name }}</span
                    >
                  </div>
                </div>
                <div class="sticky-summary-total">
                  <span>Total:</span>
                  <span class="sticky-total-amount"
                    >S/.
                    {{
                      upgradeMode ? upgradeDifference : (selec_plan ? selec_plan.amount : 0)
                    }}</span
                  >
                </div>
                <small v-if="selectError" class="error-message">{{
                  selectError
                }}</small>
                <small
                  v-if="
                    (upgradeMode ? totalUpgradeProducts : total) !==
                      (upgradeMode
                        ? maxUpgradeProducts
                        : (selec_plan ? selec_plan.max_products : 0)) &&
                    (upgradeMode
                      ? maxUpgradeProducts
                      : (selec_plan ? selec_plan.max_products : 0)) > 0
                  "
                  class="info-message"
                >
                  <template
                    v-if="
                      (upgradeMode ? totalUpgradeProducts : total) <
                      (upgradeMode
                        ? maxUpgradeProducts
                        : (selec_plan ? selec_plan.max_products : 0))
                    "
                  >
                    Te faltan
                    {{
                      (upgradeMode
                        ? maxUpgradeProducts
                        : (selec_plan ? selec_plan.max_products : 0)) -
                      (upgradeMode ? totalUpgradeProducts : total)
                    }}
                    producto<span
                      v-if="
                        (upgradeMode
                          ? maxUpgradeProducts
                          : (selec_plan ? selec_plan.max_products : 0)) -
                          (upgradeMode ? totalUpgradeProducts : total) >
                        1
                      "
                      >s</span
                    >
                    para completar tu selección.
                  </template>
                  <template v-else>
                    Has seleccionado
                    {{
                      (upgradeMode ? totalUpgradeProducts : total) -
                      (upgradeMode
                        ? maxUpgradeProducts
                        : (selec_plan ? selec_plan.max_products : 0))
                    }}
                    producto<span
                      v-if="
                        (upgradeMode ? totalUpgradeProducts : total) -
                          (upgradeMode
                            ? maxUpgradeProducts
                            : (selec_plan ? selec_plan.max_products : 0)) >
                        1
                      "
                      >s</span
                    >
                    de más.
                  </template>
                </small>
                <button
                  class="main-action-btn sticky-btn"
                  :disabled="
                    (upgradeMode ? totalUpgradeProducts : total) !==
                    (upgradeMode ? maxUpgradeProducts : (selec_plan ? selec_plan.max_products : 0))
                  "
                  @click="handleGoToStep2"
                >
                  Afiliarme
                </button>
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
                    v-if="product.img"
                    :src="product.img"
                    :alt="product.name"
                    class="summary-img"
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
                  <span
                    >S/. {{ upgradeMode ? upgradeDifference : (selec_plan ? selec_plan.amount : 0) }}</span
                  >
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
                </div>
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
                  <!-- <button
                    class="main-action-btn mp-btn"
                    @click="pagarConMercadoPago"
                    style="margin-top:10px; display: flex; align-items: center; gap: 10px;"
                  >
                    <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.22.6/mercadopago/logo__large.png"
                         alt="Mercado Pago" style="height: 24px; vertical-align: middle;" />
                    Pagar con Mercado Pago
                  </button> -->
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
      </section>
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
/* Estilos para el mensaje verde de afiliación */
.affiliation-notification
  background linear-gradient(135deg, #4CAF50, #45a049)
  color white
  padding 20px
  border-radius 12px
  position fixed
  top 20px
  right 20px
  z-index 9999
  box-shadow 0 8px 25px rgba(0, 0, 0, 0.2)
  animation slideInFromRight 0.5s ease-out
  max-width 350px
  text-align left
  font-family Arial, sans-serif
  
  &.affiliated-user
    background linear-gradient(135deg, #2196F3, #1976D2)
    max-width 400px
    
    .affiliation-notification-actions
      margin-top 15px
      display flex
      justify-content center
      
      .btn-dashboard
        background rgba(255, 255, 255, 0.2)
        color white
        border 1px solid rgba(255, 255, 255, 0.3)
        border-radius 8px
        padding 8px 16px
        font-size 0.9rem
        cursor pointer
        transition all 0.2s
        display flex
        align-items center
        gap 6px
        
        &:hover
          background rgba(255, 255, 255, 0.3)
          transform translateY(-2px)
          box-shadow 0 4px 12px rgba(0, 0, 0, 0.2)
        
        i
          font-size 0.8rem

.affiliation-notification-content
  position relative
  
.affiliation-notification-header
  margin-bottom 10px
  font-size 16px
  display flex
  align-items center
  justify-content flex-start
  
.affiliation-notification-body
  font-size 14px
  line-height 1.4
  margin-bottom 15px
  opacity 0.9
  
@keyframes slideInFromTop
  from
    opacity 0
    transform translateY(-20px)
  to
    opacity 1
    transform translateY(0)

@keyframes slideInFromRight
  from
    opacity 0
    transform translateX(50px)
  to
    opacity 1
    transform translateX(0)

.affiliation-bg
  min-height 100vh
  padding-bottom 80px

.affiliation-title
  text-align center
  font-size 2.2rem
  font-weight 700
  color #ff9800
  margin 32px 0 18px 0
  letter-spacing 1px

.affiliation-subtitle
  text-align center
  font-size 1.1rem
  color #666
  margin 0 0 32px 0
  font-weight 400
  line-height 1.5

.plan-section
  margin-bottom 32px
  background #fff
  border-radius 18px
  box-shadow 0 2px 12px rgba(0,0,0,0.07)
  padding 28px 24px 18px 24px
  max-width 600px
  margin-left auto
  margin-right auto

.plan-info
  display flex
  gap 18px
  margin-top 10px
  font-size 18px
  color #a05a2c
  font-weight 700

.plan-amount
  color #ff9800
  font-weight 800
  font-size 20px

.plan-points
  color #a05a2c
  font-weight 700
  font-size 18px

.plan-kit
  color #a05a2c
  font-weight 700
  font-size 18px

.catalog-section
  margin-bottom 32px
  max-width 1100px
  margin-left auto
  margin-right auto

.product-grid
  display grid
  grid-template-columns repeat(auto-fit, minmax(220px, 1fr))
  gap 28px
  margin-top 18px

.product-card-modern
  background: linear-gradient(135deg, #fff8e1 80%, #ffe0b2 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(255,152,0,0.10);
  padding: 22px 18px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  border: 1.5px solid #ffe0b2;
  &:hover
    box-shadow: 0 8px 32px rgba(255,152,0,0.18);
    transform: translateY(-4px) scale(1.04);
    border-color: #ffb74d;

.product-img-modern-wrap
  width 110px
  height 110px
  display flex
  align-items center
  justify-content center
  margin-bottom 12px

.product-img-modern
  width 100px
  height 100px
  object-fit cover
  border-radius 16px
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  background #fff
  border 2px solid #fff3e0
  transition transform 0.2s
  &:hover
    transform scale(1.08)

.product-info-modern
  text-align center
  margin-bottom 10px

.product-name-modern
  color: #a05a2c;
  font-weight: 700;

.product-controls-modern
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto; /* Empujar al final */
  width: 100%;

.qty-btn {
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

.qty-btn:hover {
  background: #fb8c00;
  transform: scale(1.05);
}

.qty-btn:disabled {
  background: #ffe0b2;
  color: #ff9800;
  cursor: not-allowed;
  transform: none;
}

.product-qty-modern {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  min-width: 20px;
  text-align: center;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.max-info {
  color: #ff9800;
  font-size: 0.75rem;
  margin-left: 4px;
  font-weight: 600;
}

.sticky-summary
  position fixed
  left 0
  right 0
  bottom 0
  background #fff
  box-shadow 0 -2px 16px rgba(255,152,0,0.13)
  border-radius 18px 18px 0 0
  padding 18px 24px 12px 24px
  z-index 1003
  display none
  opacity 0
  pointer-events none
  transition opacity 0.3s
  @media (min-width: 900px)
    width 340px
    right 0px
    left auto
    top -25px
    bottom auto
    border-radius 18px
    position absolute
    display block
    opacity 1
    pointer-events auto
  &.show
    display block
    opacity 1
    pointer-events auto

.sticky-summary-content
  display flex
  flex-direction column
  gap 10px

.sticky-products
  display flex
  flex-wrap wrap
  gap 12px
  margin-bottom 8px

.sticky-product-item
  display flex
  align-items center
  gap 7px
  background #fff8e1
  border-radius 8px
  padding 4px 10px
  font-size 15px
  color #444

.sticky-product-img
  width 24px
  height 24px
  object-fit cover
  border-radius 6px
  border 1.5px solid #ff9800

.sticky-summary-total
  display flex
  justify-content space-between
  font-weight 600
  color #ff9800
  font-size 18px
  margin-top 4px

.sticky-total-amount
  font-size 1.1rem
  font-weight 700

.sticky-btn
  margin-top 8px
  font-size 1.1rem
  padding 10px 0

.confirm-section
  max-width 600px
  margin-left auto
  margin-right auto
  background: linear-gradient(135deg, #fffbe6 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,152,0,0.10);
  padding: 28px 24px 18px 24px;

.confirm-summary
  margin-bottom 18px

.back-btn
  background #fff3e0
  color #ff9800
  border 1.5px solid #ff9800
  margin-top 10px
  &:hover
    background #ff9800
    color #fff

._img
  width 100%
  max-width 600px

._plan
  max-width 400px
  margin 8px 0

._product
  max-width 240px
  margin 8px 0
  max-height 240px

._strong
  font-weight 600

.card-section,
.confirm-section,
.summary-section {
  background: linear-gradient(135deg, #fffbe6 60%, #fff 100%);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,152,0,0.10);
  padding: 28px 24px 18px 24px;
  margin-bottom: 28px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  border: 1.5px solid #ffe0b2;
}

.section-title
  font-size: 20px;
  font-weight: 700;
  color: #a05a2c;
  margin-bottom: 18px;
  letter-spacing: 0.5px;

.input-lg
  font-size 17px
  padding 10px 14px
  border-radius 8px
  border 1px solid #e0e0e0
  margin-bottom 12px
  margin-top 6px
  width 100%
  box-sizing border-box

.product-tabs
  display flex
  gap 10px
  margin-bottom 18px

.product-tab
  padding 7px 18px
  border-radius 18px
  background #fff3e0
  color #ff9800
  font-weight 500
  font-size 15px
  cursor pointer
  border 1.5px solid #ff9800
  transition background 0.2s, color 0.2s
  &.selected
    background #ff9800
    color #fff

.product-list
  display flex
  flex-wrap wrap
  gap 18px
  margin-bottom 18px

.product-img-wrap
  width 100%
  display flex
  justify-content center
  margin-bottom 10px

.product-img
  width 80px
  height 80px
  object-fit cover
  border-radius 16px
  box-shadow 0 2px 8px rgba(255,152,0,0.10)
  background #fff
  border 2px solid #fff3e0
  transition transform 0.2s
  &:hover
    transform scale(1.08)

.product-card
  background #fff8e1
  border-radius 16px
  box-shadow 0 4px 16px rgba(255,152,0,0.10)
  padding 18px 20px
  min-width 180px
  flex 1 1 200px
  display flex
  flex-direction column
  align-items center
  justify-content center
  transition box-shadow 0.2s, transform 0.2s
  cursor pointer
  &:hover
    box-shadow 0 8px 24px rgba(255,152,0,0.18)
    transform translateY(-4px) scale(1.03)

.product-card-header
  font-size 16px
  font-weight 600
  color #ff9800
  margin-bottom 8px

.product-card-controls
  display flex
  align-items center
  gap 10px

.product-qty
  width 38px
  text-align center
  font-size 16px
  border-radius 6px
  border 1px solid #e0e0e0
  background #fff
  padding 3px 0

.summary-section {
  background: linear-gradient(135deg, #fffbe6 80%, #fff 100%);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(255,152,0,0.07);
  border: 1.5px solid #ffe0b2;
  color: #a05a2c;
}

.summary-item
  display flex
  align-items center
  gap 10px
  margin-bottom 8px

.summary-item-weight
  color #bbb
  font-size 14px

.summary-total
  color: #ff9800;
  font-weight: 800;
  font-size: 18px;
  margin-top 8px

.balance-info
  font-size: 17px;
  color: #a05a2c;
  font-weight: 700;
  margin: 10px 0 10px 0;

.pay-methods
  margin-top 10px
  margin-bottom 10px

.radio-label
  color: #a05a2c;
  font-size: 17px;
  font-weight: 700;
  margin-right: 18px;

.checkbox-label
  display flex
  align-items center
  margin-top 10px
  margin-bottom 10px
  font-size 15px
  color: #a05a2c;

.bank-fields
  margin-top 10px
  margin-bottom 10px

.voucher-label
  display flex
  flex-direction column
  gap 8px
  margin-top 8px

.error-message
  color #e53935
  font-size 16px
  font-weight 500
  margin-bottom 10px
  margin-top 6px

.success
  color #388e3c
  font-size 16px
  font-weight 500
  margin-top 10px

.main-action-btn
  width 100%
  background linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)
  color white
  border none
  border-radius 10px
  padding 14px 0
  font-size 18px
  font-weight 600
  box-shadow 0 2px 8px rgba(255,152,0,0.13)
  cursor pointer
  margin-bottom 10px
  transition background 0.2s, box-shadow 0.2s
  &:hover
    background linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%)
    box-shadow 0 4px 16px rgba(255,152,0,0.18)

.main-action-btn.sending
  background #bbb
  color #fff
  cursor not-allowed

.invoices-section
  margin-top 18px
  text-align center

.invoice-link
  color: #ff9800;
  font-weight: 800;
  font-size: 17px;
  text-decoration: underline;
  margin-right: 10px;
  &:hover
    color #fb8c00

.summary-img-wrap
  width 32px
  height 32px
  display flex
  align-items center
  justify-content center
  background #fff8e1
  border-radius 8px
  box-shadow 0 1px 4px rgba(255,152,0,0.07)

.summary-img
  width 28px
  height 28px
  object-fit cover
  border-radius 7px
  border 1.5px solid #ff9800

.summary-product-name
  color: #a05a2c;
  font-weight: 700;
  font-size: 16px;

.category-block
  margin-bottom 38px

.category-title
  color: #ff9800;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  margin-top: 10px;

.info-message
  color #ff9800
  font-size 15px
  font-weight 500
  margin-bottom 8px
  margin-top 6px

.master-trophy-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  min-height 70vh
  animation fadeInBounce 1.1s

.master-trophy-img
  width 180px
  height 180px
  object-fit contain
  margin-bottom 24px
  animation bounce 1.2s

.master-trophy-title
  font-size 2.5rem
  font-weight 800
  color #ff9800
  margin-bottom 10px
  letter-spacing 1px
  text-shadow 0 2px 8px #ffe0b2

.master-trophy-msg
  font-size 1.3rem
  color #444
  margin-bottom 28px
  font-weight 500
  .master-trophy-master
    color #e53935
    font-weight 700
    font-size 1.4rem
    text-shadow 0 1px 6px #ffb74d

.master-trophy-btn
  font-size 1.1rem
  padding 12px 32px
  margin-top 10px
  background linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)
  color white
  border none
  border-radius 10px
  font-weight 700
  box-shadow 0 2px 8px rgba(255,152,0,0.13)
  cursor pointer
  transition background 0.2s, box-shadow 0.2s
  &:hover
    background linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%)
    box-shadow 0 4px 16px rgba(255,152,0,0.18)

@keyframes fadeInBounce
  0%
    opacity 0
    transform scale(0.8)
  60%
    opacity 1
    transform scale(1.05)
  100%
    opacity 1
    transform scale(1)

@keyframes bounce
  0%
    transform translateY(-60px)
  60%
    transform translateY(20px)
  80%
    transform translateY(-10px)
  100%
    transform translateY(0)

@media (max-width: 900px)
  .sticky-summary
    display none !important
  .afiliarme-mobile-btn
    display flex
    justify-content center
    align-items center
    margin 18px 0 0 0
    .main-action-btn
      max-width 400px
      width 100%
      font-size 1.15rem
      padding 16px 0
      border-radius 12px
      box-shadow 0 2px 8px rgba(255,152,0,0.13)
      display flex
      align-items center
      justify-content center
      gap 10px
      .fab-icon
        font-size 1.4em
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
  
  .product-modal-body
    flex-direction column
    gap 20px
  
  .modal-product-name
    font-size 1.5rem
  
  .modal-product-price
    font-size 1.4rem

@media (min-width: 900px)
  .afiliarme-mobile-btn
    display none !important

.fade-enter-active, .fade-leave-active
  transition opacity 0.4s
.fade-enter, .fade-leave-to
  opacity 0
.pending-modal-local
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  background rgba(30, 30, 30, 0.55)
  display flex
  align-items center
  justify-content center
  z-index 400
  .pending-modal-content-block
    background #fff
    border-radius 18px
    box-shadow 0 4px 32px rgba(255,152,0,0.18)
    padding 38px 32px
    text-align center
    display flex
    flex-direction column
    align-items center
    .pending-modal-icon-block
      margin-bottom 18px
      .hourglass-anim
        display block
        margin 0 auto
        .sand-top {
          animation: sandTopAnim 1.5s infinite alternate;
        }
        .sand-bottom {
          animation: sandBottomAnim 1.5s infinite alternate;
        }
        .sand-flow {
          animation: sandFlowAnim 1.5s infinite alternate;
        }
@keyframes sandTopAnim {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}
@keyframes sandBottomAnim {
  0% { opacity: 0.2; }
  100% { opacity: 1; }
}
@keyframes sandFlowAnim {
  0% { opacity: 1; height: 24px; }
  100% { opacity: 0.2; height: 2px; }
}
.affiliation-alert
  background #fffbe6
  color #ff9800
  border 2px solid #ff9800
  border-radius 14px
  padding 24px 18px
  margin 32px auto
  max-width 500px
  text-align center
  font-size 1.15rem
  font-weight 600
.tag-upgrade {
  background: #ff9800;
  color: #fff;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.95em;
  margin-left: 8px;
  font-weight: 700;
}
.upgrade-details-block {
  background: #fffbe6;
  border: 1.5px solid #ff9800;
  border-radius: 10px;
  padding: 10px 16px;
  margin: 8px 0 18px 0;
  font-size: 1.05em;
  color: #a05a2c;
}
.invoice-history-block {
  margin-bottom: 18px;
}
.max-info {
  color: #ff9800;
  font-size: 0.95em;
  margin-left: 6px;
  font-weight: 600;
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
  margin-bottom: 0px;
  line-height: 1.1;
}

.product-catalog-info-text {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
  margin-bottom: 8px;
  margin-top: 4px;
  line-height: 1.3;
  text-align: center;
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
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-summary-afi {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.cart-summary h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 10px;
}

.cart-totals {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.cart-total-item {
  display: flex;
  justify-content: space-between;
  font-size: 1.05rem;
  color: #b26a00;
}

.total-amount {
  font-weight: 600;
  color: #388e3c;
}

.total-points {
  font-weight: 600;
  color: #ff9800;
}

.view-cart-btn {
  background: linear-gradient(90deg, #ff9800 60%, #ffb74d 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255,152,0,0.13);
}

.view-cart-btn:hover {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  box-shadow: 0 4px 16px rgba(255,152,0,0.18);
  transform: scale(1.04);
}

/* Estilos para modales */
.cart-modal, .product-modal {
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

.cart-modal-content, .product-modal-content {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* Mantener el modal en la posición del scroll */
  position: relative;
}

.product-modal-content {
  max-width: 800px;
  max-height: 90vh;
}

.cart-modal-header, .product-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 15px 15px 0 0;
}

.cart-modal-header h2, .product-modal-header h2 {
  font-size: 1.4rem; /* Más pequeño */
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}

.cart-modal-header p {
  font-size: 0.95rem;
  color: #666;
  margin-top: 5px;
}

.close-cart-btn, .close-product-btn {
  background: none;
  border: none;
  font-size: 1.5rem; /* Más pequeño */
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  padding: 5px;
}

.close-cart-btn:hover, .close-product-btn:hover {
  color: #ff9800;
}

.close-product-btn {
  position: absolute;
  top: 15px;
  right: 15px;
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
  gap: 15px;
  background: #fdfdfd;
  border-radius: 10px;
  padding: 12px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.cart-item-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.cart-item-info p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #e53935;
  cursor: pointer;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #c62828;
}

/* .cart-summary-section {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 0 0 15px 15px;
} */

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1.05rem;
  color: #b26a00;
}

.summary-row {
  display: flex;
  justify-content: space-between;
}

.summary-row span:first-child {
  font-weight: 600;
  color: #333;
}

.total-row {
  font-weight: 700;
  color: #388e3c;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 0 0 15px 15px;
}

.pay-btn, .add-more-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
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

.pay-btn:hover {
  background: linear-gradient(90deg, #fb8c00 60%, #ffe0b2 100%);
  box-shadow: 0 4px 16px rgba(255,152,0,0.18);
  transform: scale(1.04);
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

/* Estilos para modal de producto */
.product-modal-body {
  display: flex;
  gap: 20px; /* Menos espacio */
  padding: 15px 20px; /* Menos padding */
  overflow-y: auto;
  max-height: 60vh; /* Más pequeño */
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

@media (max-width: 600px)
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

.modal-product-img {
  max-width: 100%;
  max-height: 180px; /* Más pequeño */
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .product-modal-body {
    flex-direction: column;
    gap: 15px;
    max-height: 70vh;
  }
  
  .product-modal-left {
    max-width: 100%;
    max-height: 150px;
  }
  
  .product-modal-image {
    max-height: 130px;
  }
  
  .modal-product-img {
    max-height: 120px;
  }
  
  .product-description p {
    max-height: 120px;
  }
  
  .product-modal-header h2 {
    font-size: 1.2rem;
  }
  
  .modal-product-price {
    font-size: 1.2rem;
  }
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

.product-modal-body {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  overflow-y: auto;
  max-height: 60vh;
  position: relative; /* Para posicionar la X */
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
    margin 0
  
  .error-message
    background #ffebee
    color #c62828
    padding 12px 20px
    border-radius 8px
    border 1px solid #ffcdd2
    font-size 0.9rem
    text-align center
    max-width 400px
    margin-top 15px

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
</style>
