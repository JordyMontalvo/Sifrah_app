<template>
  <div class="store-checkout-page" v-cloak>
    <!-- Topbar Oficial SIFRAH -->
    <header class="checkout-topbar">
      <div class="topbar-inner">
        <!-- Izquierda: Retorno en mobile / Logo SIFRAH -->
        <div class="topbar-left">
          <button
            v-if="step > 1"
            type="button"
            class="topbar-back-btn mobile-only"
            @click="prevStep"
            aria-label="Regresar"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <button
            v-else
            type="button"
            class="topbar-back-btn mobile-only"
            @click="back"
            aria-label="Volver a la tienda"
          >
            <i class="fas fa-arrow-left"></i>
          </button>

          <router-link :to="'/tienda/' + ownerId" class="topbar-brand">
            <img src="@/assets/img/logo/logo.svg" alt="SIFRAH" class="topbar-logo" />
            <span class="brand-tagline">FORJANDO LÍDERES</span>
          </router-link>
        </div>

        <!-- Centro: Tienda segura (Desktop) -->
        <div class="topbar-center desktop-only">
          <div class="secure-badge">
            <i class="fas fa-lock"></i>
            <span>Tienda segura</span>
          </div>
        </div>

        <!-- Derecha: Datos del socio (Desktop) / Carrito (Mobile) -->
        <div class="topbar-right">
          <!-- Desktop: Dropdown de Distribuidor -->
          <div class="partner-box desktop-only" :title="ownerFullName">
            <span class="partner-name">{{ ownerFullName }} <i class="fas fa-chevron-down"></i></span>
            <div class="partner-avatar">
              <img v-if="ownerPhoto" :src="ownerPhoto" :alt="ownerFullName" />
              <span v-else>{{ partnerInitials }}</span>
            </div>
          </div>

          <!-- Mobile: Icono de Carrito con badge -->
          <div class="mobile-cart-badge mobile-only" @click="toggleMobileCart">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="totalProductCount > 0" class="cart-badge-count">{{ totalProductCount }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Modal de Orden Confirmada (Pantalla Final de Éxito) -->
    <div v-if="orderNumber" class="order-confirmed-overlay">
      <div class="order-confirmed-card">
        <div class="success-icon-wrapper">
          <i class="fas fa-check"></i>
        </div>
        <h2>¡Orden Confirmada!</h2>
        <p class="order-success-msg">Tu orden ha sido registrada exitosamente.</p>
        
        <div class="order-summary-box">
          <div class="summary-line">
            <span>Número de orden:</span>
            <strong>#{{ orderNumber }}</strong>
          </div>
          <div class="summary-line">
            <span>Método de pago:</span>
            <span>{{ formatPaymentMethodName(payMethod) }}</span>
          </div>
          <div class="summary-line total">
            <span>Total abonado:</span>
            <strong>S/ {{ paidTotal.toFixed(2) }}</strong>
          </div>
        </div>

        <p class="order-notice">
          El distribuidor se pondrá en contacto contigo para coordinar los detalles de entrega.
        </p>

        <button type="button" class="btn-return-store-solid" @click="back">
          <i class="fas fa-store"></i> Volver a la tienda
        </button>
      </div>
    </div>

    <!-- Error / Carrito Vacío -->
    <div v-else-if="!items.length" class="empty-cart-container">
      <div class="empty-cart-card">
        <i class="fas fa-shopping-basket empty-icon"></i>
        <h2>Tu carrito está vacío</h2>
        <p>No tienes productos seleccionados para realizar la compra.</p>
        <button type="button" class="btn-return-store-solid" @click="back">
          <i class="fas fa-arrow-left"></i> Ir a la tienda
        </button>
      </div>
    </div>

    <!-- Proceso de Compra Principal (2 Columnas en Desktop) -->
    <main v-else class="checkout-main-content">
      <div class="checkout-layout-container">
        
        <!-- ========================================== -->
        <!-- COLUMNA IZQUIERDA: Carrito de Compras (Desktop) -->
        <!-- ========================================== -->
        <aside class="checkout-cart-sidebar desktop-only">
          <div class="sidebar-cart-card">
            <!-- Cabecera de carrito -->
            <div class="sidebar-cart-header">
              <div class="header-left">
                <i class="fas fa-shopping-cart header-cart-icon"></i>
                <div class="header-titles">
                  <h3>Carrito de compras</h3>
                  <span class="cart-items-count">{{ totalProductCount }} {{ totalProductCount === 1 ? 'producto' : 'productos' }}</span>
                </div>
              </div>
              <router-link :to="'/tienda/' + ownerId" class="cart-edit-link">
                Editar
              </router-link>
            </div>

            <!-- Lista de productos -->
            <div class="sidebar-cart-items">
              <div v-for="item in items" :key="item.id" class="sidebar-cart-item">
                <div class="item-img-wrapper">
                  <img :src="item.img || defaultProductImg" :alt="item.name" />
                </div>
                <div class="item-info">
                  <h4 class="item-name">{{ item.name }}</h4>
                  <span class="item-subtitle">{{ item.subdescription || 'Pote 300gr' }}</span>
                  <div class="item-price">S/ {{ Number(item.price).toFixed(2) }}</div>
                  
                  <!-- Selector de cantidad en tarjeta -->
                  <div class="item-qty-stepper">
                    <button type="button" @click="decreaseItemQty(item)" :disabled="item.total <= 1">-</button>
                    <span>{{ item.total }}</span>
                    <button type="button" @click="increaseItemQty(item)">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subtotal y Total -->
            <div class="sidebar-cart-totals">
              <div class="total-line">
                <span>Subtotal:</span>
                <span class="price-val">S/ {{ goodsTotal.toFixed(2) }}</span>
              </div>
              <div v-if="deliveryMethod === 'delivery' && deliveryPrice > 0" class="total-line">
                <span>Envío Delivery:</span>
                <span class="price-val">S/ {{ deliveryPrice.toFixed(2) }}</span>
              </div>
              <div class="total-line grand-total">
                <span>Total:</span>
                <span class="price-val">S/ {{ grandTotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Caja inferior: ¿Olvidaste algún producto? -->
            <div class="sidebar-cart-footer-box">
              <p>¿Olvidaste algún producto?</p>
              <button type="button" class="btn-return-store-outline" @click="back">
                <i class="fas fa-arrow-left"></i> Volver a la tienda
              </button>
            </div>
          </div>
        </aside>

        <!-- ========================================== -->
        <!-- COLUMNA DERECHA: Pasos del Checkout        -->
        <!-- ========================================== -->
        <section class="checkout-steps-section">
          
          <!-- Stepper de 3 Pasos -->
          <div class="checkout-stepper-wrapper">
            <div class="stepper-item" :class="{ active: step === 1, completed: step > 1 }">
              <div class="step-circle">
                <i v-if="step > 1" class="fas fa-check"></i>
                <span v-else>1</span>
              </div>
              <span class="step-label">Despacho</span>
            </div>

            <div class="stepper-line" :class="{ filled: step > 1 }"></div>

            <div class="stepper-item" :class="{ active: step === 2, completed: step > 2 }">
              <div class="step-circle">
                <i v-if="step > 2" class="fas fa-check"></i>
                <span v-else>2</span>
              </div>
              <span class="step-label">Facturación</span>
            </div>

            <div class="stepper-line" :class="{ filled: step > 2 }"></div>

            <div class="stepper-item" :class="{ active: step === 3 }">
              <div class="step-circle">
                <span>3</span>
              </div>
              <span class="step-label">Pago</span>
            </div>
          </div>

          <!-- Acordeón de Carrito para Mobile -->
          <div class="mobile-cart-accordion mobile-only">
            <div class="accordion-header" @click="showMobileCart = !showMobileCart">
              <div class="header-left">
                <i class="fas fa-shopping-cart"></i>
                <span>Carrito de compras ({{ totalProductCount }})</span>
              </div>
              <div class="header-right">
                <span class="accordion-total">S/ {{ grandTotal.toFixed(2) }}</span>
                <i class="fas" :class="showMobileCart ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>

            <transition name="fade">
              <div v-if="showMobileCart" class="accordion-body">
                <div v-for="item in items" :key="item.id" class="mobile-cart-item">
                  <img :src="item.img || defaultProductImg" :alt="item.name" class="mobile-item-img" />
                  <div class="mobile-item-details">
                    <span class="mobile-item-name">{{ item.name }}</span>
                    <span class="mobile-item-price">S/ {{ Number(item.price).toFixed(2) }}</span>
                  </div>
                  <div class="mobile-qty-controls">
                    <button type="button" @click="decreaseItemQty(item)">-</button>
                    <span>{{ item.total }}</span>
                    <button type="button" @click="increaseItemQty(item)">+</button>
                  </div>
                </div>
                <div class="mobile-cart-subtotal-row">
                  <span>Total productos:</span>
                  <strong>S/ {{ goodsTotal.toFixed(2) }}</strong>
                </div>
              </div>
            </transition>
          </div>

          <!-- Mensaje de Error Global -->
          <transition name="fade">
            <div v-if="error" class="checkout-error-banner">
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ error }}</span>
            </div>
          </transition>

          <!-- ========================================== -->
          <!-- PASO 1: DESPACHO                           -->
          <!-- ========================================== -->
          <div v-if="step === 1" class="step-content step-dispatch">
            <!-- Banner rosa superior -->
            <div class="sifrah-step-banner sifrah-banner-pink">
              <div class="sifrah-banner-content">
                <h2 class="sifrah-banner-title">Paso 1: Despacho</h2>
                <p class="sifrah-banner-subtitle">Selecciona cómo y dónde deseas recibir tu pedido.</p>
              </div>
              <div class="sifrah-banner-watermark">
                <i class="fas fa-truck"></i>
              </div>
            </div>

            <!-- Subsección 1: Selecciona el método de despacho -->
            <div class="step-block">
              <div class="block-title">
                <span class="badge-num">1</span>
                <h3>Selecciona el método de despacho</h3>
              </div>

              <div class="dispatch-methods-grid">
                <!-- Tarjeta: Recojo en tienda -->
                <div
                  class="dispatch-card"
                  :class="{ active: deliveryMethod === 'pickup' }"
                  @click="selectDeliveryMethod('pickup')"
                >
                  <div class="card-icon-box fuchsia">
                    <i class="fas fa-store"></i>
                  </div>
                  <div class="card-details">
                    <h4>Recojo en tienda</h4>
                    <p>Retira tu pedido en nuestras tiendas sin costo de envío.</p>
                  </div>
                  <div class="card-radio">
                    <span class="radio-circle" :class="{ checked: deliveryMethod === 'pickup' }">
                      <i v-if="deliveryMethod === 'pickup'" class="fas fa-check"></i>
                    </span>
                  </div>
                </div>

                <!-- Tarjeta: Delivery -->
                <div
                  class="dispatch-card"
                  :class="{ active: deliveryMethod === 'delivery' }"
                  @click="selectDeliveryMethod('delivery')"
                >
                  <div class="card-icon-box dark">
                    <i class="fas fa-truck"></i>
                  </div>
                  <div class="card-details">
                    <h4>Delivery</h4>
                    <p>Recibe tu pedido en la puerta de tu casa.</p>
                  </div>
                  <div class="card-radio">
                    <span class="radio-circle" :class="{ checked: deliveryMethod === 'delivery' }">
                      <i v-if="deliveryMethod === 'delivery'" class="fas fa-check"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subsección 2: Sede de recojo (Si eligió Recojo en tienda) -->
            <div v-if="deliveryMethod === 'pickup'" class="step-block">
              <div class="block-title">
                <span class="badge-num">2</span>
                <h3>Selecciona la sede de recojo</h3>
              </div>

              <!-- Dropdown de sedes -->
              <div class="custom-select-wrapper">
                <i class="fas fa-map-marker-alt select-lead-icon"></i>
                <select v-model="selectedPickupPoint" class="pickup-select">
                  <option value="" disabled>Selecciona una sede de recojo</option>
                  <option v-for="office in offices" :key="office.id" :value="office.id">
                    {{ office.name }} - {{ hasOfficeAddress(office) ? office.address : 'Dirección no disponible' }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-arrow-icon"></i>
              </div>

              <!-- Ficha informativa de la sede seleccionada -->
              <div v-if="currentOffice" class="office-info-card">
                <div class="info-row">
                  <div class="row-label">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Dirección:</span>
                  </div>
                  <div class="row-value" :class="{ 'text-not-available': !hasOfficeAddress(currentOffice) }">
                    {{ hasOfficeAddress(currentOffice) ? currentOffice.address : 'No disponible' }}
                  </div>
                </div>

                <div class="info-row">
                  <div class="row-label">
                    <i class="fas fa-phone-alt"></i>
                    <span>Teléfono:</span>
                  </div>
                  <div class="row-value phone-val">
                    <span v-if="hasOfficePhone(currentOffice)">{{ currentOffice.phone }}</span>
                    <span v-else class="text-not-available">No disponible</span>
                    <a
                      v-if="hasOfficePhone(currentOffice)"
                      :href="officeWhatsAppUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="whatsapp-btn-icon"
                      title="Contactar por WhatsApp"
                    >
                      <i class="fab fa-whatsapp"></i>
                    </a>
                  </div>
                </div>

                <div class="info-row">
                  <div class="row-label">
                    <i class="far fa-clock"></i>
                    <span>Horario:</span>
                  </div>
                  <div class="row-value" :class="{ 'text-not-available': !hasOfficeSchedule(currentOffice) }">
                    {{ hasOfficeSchedule(currentOffice) ? currentOffice.schedule : 'No disponible' }}
                  </div>
                </div>

                <div class="info-row">
                  <div class="row-label">
                    <i class="fas fa-map"></i>
                    <span>Ubicación en mapa:</span>
                  </div>
                  <div class="row-value">
                    <a
                      v-if="officeMapUrl(currentOffice)"
                      :href="officeMapUrl(currentOffice)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="maps-link"
                    >
                      <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                    </a>
                    <span v-else class="text-not-available">No disponible</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subsección 2 (Alternativa): Formulario de Dirección de Delivery -->
            <div v-if="deliveryMethod === 'delivery'" class="step-block">
              <div class="block-title">
                <span class="badge-num">2</span>
                <h3>Dirección de entrega a domicilio</h3>
              </div>

              <div class="form-grid-two">
                <div class="form-field">
                  <label>Departamento</label>
                  <select v-model="delivery.department" @change="onDepartment">
                    <option value="">Selecciona departamento</option>
                    <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Provincia</label>
                  <select v-model="delivery.province" @change="onProvince" :disabled="!provinces.length">
                    <option value="">Selecciona provincia</option>
                    <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-two">
                <div class="form-field">
                  <label>Distrito</label>
                  <select v-model="delivery.district" @change="onDistrict" :disabled="!districts.length">
                    <option value="">Selecciona distrito</option>
                    <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Dirección exacta</label>
                  <div class="input-icon-box">
                    <input v-model="delivery.address" type="text" placeholder="Calle, número, dpto/int." />
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                </div>
              </div>

              <div v-if="needsAgency" class="form-field">
                <label>Agencia de transporte para envíos a provincia</label>
                <select v-model="delivery.agency">
                  <option value="">Selecciona agencia de transporte</option>
                  <option v-for="ag in agencies" :key="ag.id || ag" :value="ag.name || ag">{{ ag.name || ag }}</option>
                </select>
              </div>
            </div>

            <!-- Botones de Acción de Paso 1 -->
            <div class="step-actions-row">
              <button type="button" class="btn-action-prev" @click="back">
                <i class="fas fa-arrow-left"></i> Regresar
              </button>
              <button type="button" class="btn-action-next-fuchsia" @click="nextFromDelivery">
                Continuar <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- PASO 2: FACTURACIÓN                        -->
          <!-- ========================================== -->
          <div v-if="step === 2" class="step-content step-billing">
            <!-- Banner fucsia sólido superior -->
            <div class="sifrah-step-banner sifrah-banner-fuchsia">
              <div class="sifrah-banner-content">
                <h2 class="sifrah-banner-title">Paso 2: Facturación</h2>
                <p class="sifrah-banner-subtitle">Completa tus datos para generar tu comprobante.</p>
              </div>
              <div class="sifrah-banner-watermark">
                <i class="fas fa-file-invoice"></i>
              </div>
            </div>

            <!-- Subsección 1: Datos del comprador -->
            <div class="step-block">
              <div class="block-title">
                <span class="badge-num">1</span>
                <h3>Datos del comprador</h3>
              </div>

              <div class="form-grid-two">
                <div class="form-field">
                  <label>Nombres</label>
                  <div class="input-icon-box">
                    <input v-model="buyer.name" type="text" placeholder="Nombres completos" @input="onlyLetters" />
                    <i class="fas fa-user"></i>
                  </div>
                </div>

                <div class="form-field">
                  <label>Apellidos</label>
                  <div class="input-icon-box">
                    <input v-model="buyer.lastName" type="text" placeholder="Apellidos completos" @input="onlyLettersLastName" />
                    <i class="fas fa-user"></i>
                  </div>
                </div>
              </div>

              <div class="form-grid-two">
                <div class="form-field">
                  <label>Tipo de documento</label>
                  <select v-model="buyer.documentType" @change="onBuyerDocTypeChange">
                    <option value="DNI">DNI (8 dígitos)</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUC">RUC (11 dígitos)</option>
                  </select>
                </div>

                <div class="form-field">
                  <label>Nro. de documento</label>
                  <div class="input-icon-box">
                    <input
                      v-model="buyer.document"
                      type="text"
                      :placeholder="documentPlaceholder"
                      :maxlength="documentMaxLength"
                      @input="onBuyerDocumentInput"
                    />
                    <i class="fas fa-list-ol"></i>
                  </div>
                </div>
              </div>

              <div class="form-grid-two">
                <div class="form-field">
                  <label>Celular (Perú)</label>
                  <div class="input-icon-box">
                    <input
                      v-model="buyer.phone"
                      type="tel"
                      placeholder="9XXXXXXXX (9 dígitos)"
                      maxlength="9"
                      @input="onBuyerPhoneInput"
                    />
                    <i class="fas fa-phone-alt"></i>
                  </div>
                </div>

                <div class="form-field">
                  <label>Correo electrónico (opcional)</label>
                  <div class="input-icon-box">
                    <input v-model="buyer.email" type="email" placeholder="correo@ejemplo.com" />
                    <i class="fas fa-envelope"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subsección 2: Tipo de comprobante -->
            <div class="step-block">
              <div class="block-title">
                <span class="badge-num">2</span>
                <h3>Tipo de comprobante</h3>
              </div>

              <div class="proof-types-grid">
                <!-- Boleta -->
                <div
                  class="proof-card"
                  :class="{ active: proof.type === 'boleta' }"
                  @click="proof.type = 'boleta'"
                >
                  <div class="proof-icon fuchsia">
                    <i class="fas fa-file-invoice"></i>
                  </div>
                  <div class="proof-info">
                    <h4>Boleta</h4>
                    <p>Para consumo personal</p>
                  </div>
                  <div class="card-radio">
                    <span class="radio-circle" :class="{ checked: proof.type === 'boleta' }">
                      <i v-if="proof.type === 'boleta'" class="fas fa-check"></i>
                    </span>
                  </div>
                </div>

                <!-- Factura -->
                <div
                  class="proof-card"
                  :class="{ active: proof.type === 'factura' }"
                  @click="proof.type = 'factura'"
                >
                  <div class="proof-icon dark">
                    <i class="fas fa-building"></i>
                  </div>
                  <div class="proof-info">
                    <h4>Factura</h4>
                    <p>Para empresa o negocio</p>
                  </div>
                  <div class="card-radio">
                    <span class="radio-circle" :class="{ checked: proof.type === 'factura' }">
                      <i v-if="proof.type === 'factura'" class="fas fa-check"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Campos adicionales si selecciona Factura -->
              <div v-if="proof.type === 'factura'" class="factura-fields-box">
                <div class="form-grid-two">
                  <div class="form-field">
                    <label>RUC (11 dígitos - Perú)</label>
                    <input v-model="proof.ruc" type="text" placeholder="20XXXXXXXXX (11 dígitos)" maxlength="11" @input="onlyProofDigits" />
                  </div>
                  <div class="form-field">
                    <label>Razón Social</label>
                    <input v-model="proof.razonSocial" type="text" placeholder="Nombre o Razón social de la empresa" />
                  </div>
                </div>
                <div class="form-field">
                  <label>Dirección Fiscal</label>
                  <input v-model="proof.direccionFiscal" type="text" placeholder="Dirección fiscal registrada en SUNAT" />
                </div>
              </div>
            </div>

            <!-- Subsección 3: ¿La persona que recibe o retira es diferente al comprador? -->
            <div class="step-block receptor-block">
              <div class="receptor-toggle-header">
                <div class="toggle-left">
                  <span class="badge-num">3</span>
                  <div class="toggle-text">
                    <h3>¿La persona que recibe o retira es diferente al comprador?</h3>
                    <p>Solo activar si otra persona recogerá tu pedido en tienda o recibirá el delivery.</p>
                  </div>
                </div>
                <div class="toggle-switch-wrapper">
                  <label class="switch-toggle">
                    <input type="checkbox" v-model="receiver.isDifferent" />
                    <span class="slider-round"></span>
                  </label>
                </div>
              </div>

              <!-- Campos del receptor si está activo -->
              <div v-if="receiver.isDifferent" class="receiver-form-box">
                <div class="form-field">
                  <label>Nombre de quien recibe/retira</label>
                  <input
                    v-model="receiver.name"
                    type="text"
                    placeholder="Nombres y apellidos completos"
                    @input="onReceiverNameInput"
                  />
                </div>
                <div class="form-grid-two">
                  <div class="form-field">
                    <label>Tipo de documento</label>
                    <select v-model="receiver.documentType" @change="onReceiverDocTypeChange">
                      <option value="DNI">DNI (8 dígitos)</option>
                      <option value="CE">Carnet de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Nro. de Documento</label>
                    <input
                      v-model="receiver.document"
                      type="text"
                      :placeholder="receiverDocPlaceholder"
                      :maxlength="receiverDocMaxLength"
                      @input="onReceiverDocumentInput"
                    />
                  </div>
                </div>
                <div class="form-field">
                  <label>Celular de contacto (Perú)</label>
                  <input
                    v-model="receiver.phone"
                    type="tel"
                    placeholder="9XXXXXXXX (9 dígitos)"
                    maxlength="9"
                    @input="onReceiverPhoneInput"
                  />
                </div>
              </div>
            </div>

            <!-- Botones de Acción de Paso 2 -->
            <div class="step-actions-row">
              <button type="button" class="btn-action-prev" @click="prevStep">
                <i class="fas fa-arrow-left"></i> Regresar
              </button>
              <button type="button" class="btn-action-next-fuchsia" @click="nextFromProof">
                Continuar <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- PASO 3: PAGO                               -->
          <!-- ========================================== -->
          <div v-if="step === 3" class="step-content step-payment">
            <!-- Banner fucsia sólido superior -->
            <div class="sifrah-step-banner sifrah-banner-fuchsia">
              <div class="sifrah-banner-content">
                <h2 class="sifrah-banner-title">Paso 3: Pago</h2>
                <p class="sifrah-banner-subtitle">Selecciona tu método de pago y completa la información.</p>
              </div>
              <div class="sifrah-banner-watermark">
                <i class="fas fa-credit-card"></i>
              </div>
            </div>

            <!-- Resumen 1: Datos del comprador -->
            <div class="summary-preview-card">
              <div class="preview-card-header">
                <div class="title-with-icon">
                  <i class="fas fa-user-circle fuchsia-icon"></i>
                  <h4>Datos del comprador</h4>
                </div>
                <button type="button" class="btn-edit-step" @click="goStep(2)">
                  <i class="fas fa-pencil-alt"></i> Editar
                </button>
              </div>

              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label"><i class="fas fa-user"></i> Nombres y apellidos</div>
                  <div class="item-val">{{ buyerFullName }}</div>
                </div>

                <div class="preview-item">
                  <div class="item-label">Tipo y Nro. de documento</div>
                  <div class="item-val">{{ buyer.documentType || 'DNI' }} {{ buyer.document }}</div>
                </div>

                <div class="preview-item">
                  <div class="item-label"><i class="fas fa-file-invoice"></i> Tipo de comprobante</div>
                  <div class="item-val">{{ proof.type === 'factura' ? 'Factura' : 'Boleta' }} <span class="val-sub">({{ proof.type === 'factura' ? 'Para empresa' : 'Para consumo personal' }})</span></div>
                </div>

                <div class="preview-item">
                  <div class="item-label"><i class="fas fa-phone-alt"></i> Celular</div>
                  <div class="item-val">{{ buyer.phone }}</div>
                </div>

                <div class="preview-item">
                  <div class="item-label"><i class="fas fa-envelope"></i> Correo electrónico</div>
                  <div class="item-val">{{ buyer.email || 'No especificado' }}</div>
                </div>
              </div>
            </div>

            <!-- Resumen 2: Datos del pedido -->
            <div class="summary-preview-card">
              <div class="preview-card-header">
                <div class="title-with-icon">
                  <i class="fas fa-truck fuchsia-icon"></i>
                  <h4>Datos del pedido</h4>
                </div>
                <button type="button" class="btn-edit-step" @click="goStep(1)">
                  <i class="fas fa-pencil-alt"></i> Editar
                </button>
              </div>

              <div class="preview-grid">
                <div class="preview-item">
                  <div class="item-label"><i class="fas fa-store"></i> Método de despacho</div>
                  <div class="item-val">{{ deliveryMethod === 'pickup' ? 'Recojo en tienda' : 'Delivery a domicilio' }}</div>
                </div>

                <div v-if="deliveryMethod === 'pickup'" class="preview-item">
                  <div class="item-label"><i class="fas fa-map-marker-alt"></i> Sede de recojo</div>
                  <div class="item-val">{{ (currentOffice && currentOffice.name) || 'Sede Sifrah' }}</div>
                </div>

                <div class="preview-item">
                  <div class="item-label">Dirección</div>
                  <div class="item-val" :class="{ 'text-not-available': deliveryMethod === 'pickup' && !hasOfficeAddress(currentOffice) }">
                    {{ deliveryMethod === 'pickup' ? (hasOfficeAddress(currentOffice) ? currentOffice.address : 'No disponible') : delivery.address }}
                  </div>
                </div>

                <div v-if="deliveryMethod === 'pickup'" class="preview-item">
                  <div class="item-label"><i class="fas fa-phone-alt"></i> Teléfono</div>
                  <div class="item-val phone-val">
                    <span v-if="hasOfficePhone(currentOffice)">{{ currentOffice.phone }}</span>
                    <span v-else class="text-not-available">No disponible</span>
                    <i v-if="hasOfficePhone(currentOffice)" class="fab fa-whatsapp green-wa"></i>
                  </div>
                </div>

                <div v-if="deliveryMethod === 'pickup'" class="preview-item">
                  <div class="item-label"><i class="far fa-clock"></i> Horario</div>
                  <div class="item-val" :class="{ 'text-not-available': !hasOfficeSchedule(currentOffice) }">
                    {{ hasOfficeSchedule(currentOffice) ? currentOffice.schedule : 'No disponible' }}
                  </div>
                </div>

                <div v-if="deliveryMethod === 'pickup'" class="preview-item">
                  <div class="item-label"><i class="fas fa-map"></i> Ubicación en mapa</div>
                  <div class="item-val">
                    <a :href="(currentOffice && currentOffice.googleMapsUrl) || '#'" target="_blank" class="maps-link">
                      <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Subsección: Método de pago -->
            <div class="step-block payment-methods-block">
              <div class="block-title">
                <i class="fas fa-wallet fuchsia-icon"></i>
                <div class="title-with-desc">
                  <h3>Método de pago</h3>
                  <p>Elige el método de pago que más te convenga.</p>
                </div>
              </div>

              <!-- Pestañas horizontales de Métodos de Pago -->
              <div class="payment-tabs-grid">
                <!-- 1. Transferencia / Depósito -->
                <button
                  type="button"
                  class="pay-tab-btn"
                  :class="{ active: payMethod === 'bank' }"
                  @click="selectPayMethod('bank')"
                >
                  <div class="tab-content">
                    <i class="fas fa-university tab-icon"></i>
                    <span>Transferencia / Depósito</span>
                  </div>
                  <span class="tab-radio" :class="{ checked: payMethod === 'bank' }">
                    <i v-if="payMethod === 'bank'" class="fas fa-check"></i>
                  </span>
                </button>

                <!-- 2. Yape -->
                <button
                  type="button"
                  class="pay-tab-btn"
                  :class="{ active: payMethod === 'yape' }"
                  @click="selectPayMethod('yape')"
                >
                  <div class="tab-content">
                    <span class="brand-badge yape-badge">yape</span>
                    <span>Yape</span>
                  </div>
                  <span class="tab-radio" :class="{ checked: payMethod === 'yape' }">
                    <i v-if="payMethod === 'yape'" class="fas fa-check"></i>
                  </span>
                </button>

                <!-- 3. Plin -->
                <button
                  type="button"
                  class="pay-tab-btn"
                  :class="{ active: payMethod === 'plin' }"
                  @click="selectPayMethod('plin')"
                >
                  <div class="tab-content">
                    <span class="brand-badge plin-badge">plin</span>
                    <span>Plin</span>
                  </div>
                  <span class="tab-radio" :class="{ checked: payMethod === 'plin' }">
                    <i v-if="payMethod === 'plin'" class="fas fa-check"></i>
                  </span>
                </button>

                <!-- 4. Tarjeta Izipay -->
                <button
                  type="button"
                  class="pay-tab-btn"
                  :class="{ active: payMethod === 'credit-card' }"
                  @click="selectPayMethod('credit-card')"
                >
                  <div class="tab-content">
                    <i class="fas fa-credit-card tab-icon"></i>
                    <span>Tarjeta (Izipay)</span>
                  </div>
                  <span class="tab-radio" :class="{ checked: payMethod === 'credit-card' }">
                    <i v-if="payMethod === 'credit-card'" class="fas fa-check"></i>
                  </span>
                </button>

                <!-- 5. Pago en tienda -->
                <button
                  type="button"
                  class="pay-tab-btn"
                  :class="{ active: payMethod === 'cash' }"
                  @click="selectPayMethod('cash')"
                >
                  <div class="tab-content">
                    <i class="fas fa-store tab-icon"></i>
                    <span>Pago en tienda</span>
                  </div>
                  <span class="tab-radio" :class="{ checked: payMethod === 'cash' }">
                    <i v-if="payMethod === 'cash'" class="fas fa-check"></i>
                  </span>
                </button>
              </div>

              <!-- 1. Formulario de Transferencia / Depósito -->
              <div v-if="payMethod === 'bank'" class="payment-fields-container">
                <!-- Fila de Campos: Banco, Nro de Operación, Fecha -->
                <div class="form-grid-three">
                  <div class="form-field">
                    <label>Selecciona un banco</label>
                    <div class="bank-select-container">
                      <select v-model="selectedBank" class="bank-select">
                        <option value="" disabled>Seleccionar banco</option>
                        <option v-for="method in bankPaymentMethods" :key="method.id" :value="method.id">
                          {{ method.name }}
                        </option>
                      </select>
                      <div class="bank-logo-badge" v-if="currentBankName">
                        <span class="bcp-brand" v-if="currentBankName.toUpperCase().includes('BCP')">&gt;BCP&gt;</span>
                        <span class="other-brand" v-else>{{ currentBankName }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-field">
                    <label>Número de operación</label>
                    <input
                      v-model="voucherNumber"
                      type="text"
                      placeholder="Número de operación (opcional)"
                      @input="onlyVoucherNumber('voucherNumber', $event)"
                    />
                  </div>

                  <div class="form-field">
                    <label>Fecha de pago</label>
                    <input v-model="paymentDate" type="date" />
                  </div>
                </div>

                <!-- Detalle de cuentas bancarias de la empresa / socio -->
                <div v-if="selectedMethod" class="bank-account-info-box">
                  <div class="bank-info-header">
                    <i class="fas fa-university"></i> Datos de depósito para <strong>{{ selectedMethod.name }}</strong>:
                  </div>
                  <div class="bank-info-content">
                    <p v-if="selectedMethod.titular"><strong>Titular:</strong> {{ selectedMethod.titular }}</p>
                    <p v-if="selectedMethod.n_cuenta"><strong>Nro. de Cuenta:</strong> {{ selectedMethod.n_cuenta }}</p>
                    <p v-if="selectedMethod.cci"><strong>CCI:</strong> {{ selectedMethod.cci }}</p>
                  </div>
                </div>

                <!-- Subida de comprobante bancario -->
                <div class="voucher-upload-dashed-box">
                  <div class="upload-left-content">
                    <div class="upload-icon-fuchsia">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-texts">
                      <span class="upload-main-title">Sube tu comprobante de transferencia (JPG, PNG o PDF)</span>
                      <span class="upload-subtitle">Tamaño máximo 5 MB</span>
                    </div>
                  </div>
                  
                  <div class="upload-action-box">
                    <label class="btn-select-file-fuchsia">
                      <input type="file" accept="image/*,application/pdf" @change="onVoucher" class="file-hidden-input" />
                      <span>{{ voucherFile ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                    </label>
                  </div>
                </div>

                <!-- Preview del voucher cargado -->
                <div v-if="voucherPreview" class="voucher-preview-wrapper">
                  <span class="preview-tag"><i class="fas fa-check-circle"></i> Comprobante adjuntado:</span>
                  <div class="preview-img-box">
                    <img :src="voucherPreview" alt="Voucher de pago" />
                  </div>
                </div>
              </div>

              <!-- 2. Formulario de Yape (Exclusivo, sin selector de banco) -->
              <div v-if="payMethod === 'yape'" class="payment-fields-container yape-plin-container">
                <div class="wallet-info-card yape-card">
                  <div class="wallet-card-header">
                    <div class="wallet-badge-pill yape-pill">
                      <img src="@/assets/img/yape.png" alt="Yape" class="wallet-badge-img" />
                      <span>Paga con Yape</span>
                    </div>
                    <span class="wallet-instant-tag"><i class="fas fa-bolt"></i> Acreditación rápida</span>
                  </div>
                  
                  <div class="wallet-card-body">
                    <div class="wallet-data-col">
                      <div class="wallet-data-item">
                        <span class="data-label">Titular de la cuenta:</span>
                        <strong class="data-val">{{ walletTitular }}</strong>
                      </div>
                      <div class="wallet-data-item">
                        <span class="data-label">Número de Celular Yape:</span>
                        <div class="data-phone-val">
                          <strong class="phone-number">{{ walletPhoneFormatted }}</strong>
                          <button type="button" class="btn-copy-mini" @click="copyToClipboard(walletPhone)">
                            <i class="far" :class="copiedPhone ? 'fa-check-circle' : 'fa-copy'"></i>
                            {{ copiedPhone ? '¡Copiado!' : 'Copiar' }}
                          </button>
                        </div>
                      </div>
                      <div class="wallet-data-item">
                        <span class="data-label">Monto exacto a transferir:</span>
                        <strong class="data-val price-fuchsia">S/ {{ grandTotal.toFixed(2) }}</strong>
                      </div>
                    </div>

                    <div class="wallet-qr-col">
                      <div class="qr-frame">
                        <img :src="yapeQrImage" alt="QR Yape" class="qr-img" />
                        <span class="qr-scan-hint"><i class="fas fa-qrcode"></i> Escanea con tu App Yape</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-grid-two wallet-inputs-grid">
                  <div class="form-field">
                    <label>Número de operación Yape (opcional)</label>
                    <input
                      v-model="voucherNumber"
                      type="text"
                      placeholder="Ej. 12345678"
                      @input="onlyVoucherNumber('voucherNumber', $event)"
                    />
                  </div>
                  <div class="form-field">
                    <label>Fecha de pago</label>
                    <input v-model="paymentDate" type="date" />
                  </div>
                </div>

                <!-- Subida de comprobante Yape -->
                <div class="voucher-upload-dashed-box">
                  <div class="upload-left-content">
                    <div class="upload-icon-fuchsia">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-texts">
                      <span class="upload-main-title">Sube tu captura de pantalla de Yape (JPG o PNG)</span>
                      <span class="upload-subtitle">Tamaño máximo 5 MB</span>
                    </div>
                  </div>
                  
                  <div class="upload-action-box">
                    <label class="btn-select-file-fuchsia">
                      <input type="file" accept="image/*" @change="onVoucher" class="file-hidden-input" />
                      <span>{{ voucherFile ? 'Cambiar captura' : 'Adjuntar captura' }}</span>
                    </label>
                  </div>
                </div>

                <!-- Preview del comprobante Yape -->
                <div v-if="voucherPreview" class="voucher-preview-wrapper">
                  <span class="preview-tag"><i class="fas fa-check-circle"></i> Captura de Yape adjuntada:</span>
                  <div class="preview-img-box">
                    <img :src="voucherPreview" alt="Captura Yape" />
                  </div>
                </div>
              </div>

              <!-- 3. Formulario de Plin (Exclusivo, sin selector de banco) -->
              <div v-if="payMethod === 'plin'" class="payment-fields-container yape-plin-container">
                <div class="wallet-info-card plin-card">
                  <div class="wallet-card-header">
                    <div class="wallet-badge-pill plin-pill">
                      <img src="@/assets/img/plin.png" alt="Plin" class="wallet-badge-img" />
                      <span>Paga con Plin</span>
                    </div>
                    <span class="wallet-instant-tag"><i class="fas fa-bolt"></i> Acreditación rápida</span>
                  </div>
                  
                  <div class="wallet-card-body">
                    <div class="wallet-data-col">
                      <div class="wallet-data-item">
                        <span class="data-label">Titular de la cuenta:</span>
                        <strong class="data-val">{{ walletTitular }}</strong>
                      </div>
                      <div class="wallet-data-item">
                        <span class="data-label">Número de Celular Plin:</span>
                        <div class="data-phone-val">
                          <strong class="phone-number">{{ walletPhoneFormatted }}</strong>
                          <button type="button" class="btn-copy-mini" @click="copyToClipboard(walletPhone)">
                            <i class="far" :class="copiedPhone ? 'fa-check-circle' : 'fa-copy'"></i>
                            {{ copiedPhone ? '¡Copiado!' : 'Copiar' }}
                          </button>
                        </div>
                      </div>
                      <div class="wallet-data-item">
                        <span class="data-label">Monto exacto a transferir:</span>
                        <strong class="data-val price-fuchsia">S/ {{ grandTotal.toFixed(2) }}</strong>
                      </div>
                    </div>

                    <div class="wallet-qr-col">
                      <div class="qr-frame">
                        <img :src="plinQrImage" alt="QR Plin" class="qr-img" />
                        <span class="qr-scan-hint"><i class="fas fa-qrcode"></i> Escanea con tu App Plin o de tu banco</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-grid-two wallet-inputs-grid">
                  <div class="form-field">
                    <label>Número de operación Plin (opcional)</label>
                    <input
                      v-model="voucherNumber"
                      type="text"
                      placeholder="Ej. 12345678"
                      @input="onlyVoucherNumber('voucherNumber', $event)"
                    />
                  </div>
                  <div class="form-field">
                    <label>Fecha de pago</label>
                    <input v-model="paymentDate" type="date" />
                  </div>
                </div>

                <!-- Subida de comprobante Plin -->
                <div class="voucher-upload-dashed-box">
                  <div class="upload-left-content">
                    <div class="upload-icon-fuchsia">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-texts">
                      <span class="upload-main-title">Sube tu captura de pantalla de Plin (JPG o PNG)</span>
                      <span class="upload-subtitle">Tamaño máximo 5 MB</span>
                    </div>
                  </div>
                  
                  <div class="upload-action-box">
                    <label class="btn-select-file-fuchsia">
                      <input type="file" accept="image/*" @change="onVoucher" class="file-hidden-input" />
                      <span>{{ voucherFile ? 'Cambiar captura' : 'Adjuntar captura' }}</span>
                    </label>
                  </div>
                </div>

                <!-- Preview del comprobante Plin -->
                <div v-if="voucherPreview" class="voucher-preview-wrapper">
                  <span class="preview-tag"><i class="fas fa-check-circle"></i> Captura de Plin adjuntada:</span>
                  <div class="preview-img-box">
                    <img :src="voucherPreview" alt="Captura Plin" />
                  </div>
                </div>
              </div>

              <!-- 4. Formulario para Pago en Tienda -->
              <div v-if="payMethod === 'cash'" class="store-pay-info-box">
                <i class="fas fa-hand-holding-usd"></i>
                <div class="store-pay-text">
                  <h4>Pagarás directamente en la sede</h4>
                  <p>
                    Al retirar tu pedido en la sede de <strong>{{ (currentOffice && currentOffice.name) || 'Sifrah' }}</strong>
                    <span v-if="hasOfficeAddress(currentOffice)"> ({{ currentOffice.address }})</span>
                    <span v-else> (Dirección no disponible)</span>,
                    podrás abonar en caja en efectivo o con tarjeta.
                  </p>
                </div>
              </div>

              <!-- 5. Formulario para Izipay (Aislado con v-show para proteger el DOM de Krypton) -->
              <div v-show="payMethod === 'credit-card'" class="izipay-container">
                <div class="izipay-header-banner">
                  <div class="izipay-badge">
                    <i class="fas fa-shield-alt"></i> Pasarela segura Izipay
                  </div>
                  <span class="izipay-sub">Visa, Mastercard, Diners y American Express</span>
                </div>

                <div v-if="izipayLoading" class="izipay-loading-box">
                  <div class="spinner-small"></div>
                  <span>Conectando con la pasarela segura Izipay...</span>
                </div>

                <div v-if="izipayError" class="izipay-error-msg">
                  <div class="err-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>{{ izipayError }}</span>
                  </div>
                  <button type="button" class="btn-retry-izipay" @click="reloadIzipay">
                    <i class="fas fa-redo"></i> Reintentar
                  </button>
                </div>

                <div class="kr-embedded" :kr-form-token="izipayToken">
                  <div class="kr-pan"></div>
                  <div class="kr-expiry"></div>
                  <div class="kr-security-code"></div>
                  <button class="kr-payment-button"></button>
                  <div class="kr-form-error"></div>
                </div>
              </div>
            </div>

            <!-- Botones de Acción de Paso 3 -->
            <div class="step-actions-row">
              <button type="button" class="btn-action-prev" @click="prevStep">
                <i class="fas fa-arrow-left"></i> Regresar
              </button>
              <button
                v-if="payMethod !== 'credit-card'"
                type="button"
                class="btn-action-next-fuchsia btn-confirm-pay"
                @click="openConfirmModal"
                :disabled="sending"
              >
                <span>{{ sending ? 'Procesando...' : 'Confirmar y pagar' }}</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- ========================================== -->
    <!-- MODAL DE CONFIRMACIÓN ("Confirmar pedido")  -->
    <!-- ========================================== -->
    <transition name="fade">
      <div v-if="showConfirmModal" class="confirm-modal-overlay">
        <div class="confirm-modal-card">
          <button type="button" class="modal-close-btn" @click="showConfirmModal = false" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>

          <div class="modal-check-circle-fuchsia">
            <i class="fas fa-check"></i>
          </div>

          <h3 class="modal-title">Confirmar pedido</h3>
          <p class="modal-subtitle">
            Estás a punto de finalizar tu compra.<br />
            Revisa la información antes de confirmar.
          </p>

          <div class="modal-info-summary">
            <div class="info-row">
              <div class="row-left">
                <i class="fas fa-credit-card icon-tag"></i>
                <span class="label">Método de pago</span>
              </div>
              <strong class="value">{{ formatPaymentMethodName(payMethod) }}</strong>
            </div>

            <div class="info-row total-highlight">
              <div class="row-left">
                <i class="fas fa-wallet icon-tag"></i>
                <span class="label">Total a pagar</span>
              </div>
              <strong class="value price-pink">S/ {{ grandTotal.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="modal-actions-row">
            <button type="button" class="btn-modal-cancel" @click="showConfirmModal = false">
              Cancelar
            </button>
            <button
              type="button"
              class="btn-modal-confirm-fuchsia"
              @click="submitFinalOrder"
              :disabled="sending"
            >
              {{ sending ? 'Procesando...' : 'Confirmar pedido' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from "@/api";
import axios from "axios";
import lib from "@/lib";

export default {
  name: "StoreCheckout",
  data() {
    return {
      step: 1,
      items: [],
      ownerId: "",
      ownerName: "Sifrah",
      ownerFirstName: "",
      ownerLastName: "",
      ownerFullName: "Distribuidor Sifrah",
      ownerPhoto: null,
      ownerPhone: "",
      showMobileCart: false,
      showConfirmModal: false,
      
      // Datos del comprador
      buyer: {
        name: "",
        lastName: "",
        documentType: "DNI",
        document: "",
        phone: "",
        email: ""
      },

      // Receptor alternativo
      receiver: {
        isDifferent: false,
        name: "",
        documentType: "DNI",
        document: "",
        phone: ""
      },

      // Método de despacho
      deliveryMethod: "pickup", // 'pickup' | 'delivery'
      offices: [],
      selectedPickupPoint: "",
      delivery: {
        address: "",
        department: "",
        province: "",
        district: "",
        agency: ""
      },
      departments: [],
      provinces: [],
      districts: [],
      agencies: [],
      zone: null,

      // Comprobante
      proof: {
        type: "boleta", // 'boleta' | 'factura'
        document: "",
        ruc: "",
        razonSocial: "",
        direccionFiscal: ""
      },

      // Pago
      payMethod: "bank", // 'bank' | 'yape' | 'plin' | 'credit-card' | 'cash'
      paymentMethods: [],
      selectedBank: "",
      voucherNumber: "",
      paymentDate: new Date().toISOString().split("T")[0],
      voucherFile: null,
      voucherPreview: "",

      // Estado de envío y confirmación
      sending: false,
      error: "",
      orderNumber: "",
      paidTotal: 0,

      // Izipay
      izipayLoading: false,
      izipayError: "",
      izipayToken: "",

      // Billeteras Digitales (Yape / Plin)
      walletTitular: "SIFRAH CORP S.A.C.",
      walletPhone: "959141444",
      walletPhoneFormatted: "959 141 444",
      yapeQrImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0002010102115303604540500.005802PE5915SIFRAH%20CORP%20SAC6004LIMA621107079591414446304",
      plinQrImage: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=0002010102115303604540500.005802PE5915SIFRAH%20CORP%20SAC6004LIMA621107079591414446304",
      copiedPhone: false,

      defaultProductImg: "https://via.placeholder.com/150x150?text=Sifrah"
    };
  },
  computed: {
    totalProductCount() {
      return this.items.reduce((sum, item) => sum + Number(item.total || 0), 0);
    },
    goodsTotal() {
      return this.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.total || 0),
        0
      );
    },
    deliveryPrice() {
      if (this.deliveryMethod === "delivery" && this.delivery.department === "lima" && this.zone) {
        return Number(this.zone.price) || 0;
      }
      return 0;
    },
    grandTotal() {
      return this.goodsTotal + this.deliveryPrice;
    },
    buyerFullName() {
      const first = (this.buyer.name || "").trim();
      const last = (this.buyer.lastName || "").trim();
      return `${first} ${last}`.trim() || "No especificado";
    },
    partnerInitials() {
      if (this.ownerFullName) {
        const parts = this.ownerFullName.split(" ").filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      }
      return "S";
    },
    documentMaxLength() {
      if (this.buyer.documentType === "DNI") return 8;
      if (this.buyer.documentType === "RUC") return 11;
      if (this.buyer.documentType === "CE") return 12;
      return 12;
    },
    documentPlaceholder() {
      if (this.buyer.documentType === "DNI") return "8 dígitos numéricos";
      if (this.buyer.documentType === "RUC") return "11 dígitos numéricos";
      if (this.buyer.documentType === "CE") return "Nro. de carnet de extranjería";
      return "Nro. de pasaporte";
    },
    receiverDocMaxLength() {
      if (this.receiver.documentType === "DNI") return 8;
      return 12;
    },
    receiverDocPlaceholder() {
      if (this.receiver.documentType === "DNI") return "8 dígitos numéricos";
      if (this.receiver.documentType === "CE") return "Nro. de carnet";
      return "Nro. de pasaporte";
    },
    currentOffice() {
      if (!this.selectedPickupPoint) return this.offices[0] || null;
      return this.offices.find((o) => String(o.id) === String(this.selectedPickupPoint)) || this.offices[0] || null;
    },
    officeWhatsAppUrl() {
      if (!this.currentOffice || !this.hasOfficePhone(this.currentOffice)) return "#";
      const cleanPhone = String(this.currentOffice.phone).replace(/\D/g, "");
      const msg = encodeURIComponent(
        `Hola, me gustaría coordinar el retiro de mi compra de Sifrah en la sede ${this.currentOffice.name || ""}.`
      );
      return `https://wa.me/51${cleanPhone}?text=${msg}`;
    },
    bankPaymentMethods() {
      if (!this.paymentMethods || !this.paymentMethods.length) return [];
      return this.paymentMethods.filter((m) => {
        const name = String(m.name || "").toLowerCase().trim();
        const type = String(m.type || "").toLowerCase().trim();
        return name !== "efectivo" && type !== "cash" && !name.includes("efectivo");
      });
    },
    selectedMethod() {
      if (!this.selectedBank) return this.bankPaymentMethods[0] || null;
      return (
        this.bankPaymentMethods.find((m) => String(m.id) === String(this.selectedBank)) ||
        this.bankPaymentMethods[0] ||
        null
      );
    },
    currentBankName() {
      return (this.selectedMethod && this.selectedMethod.name) || "";
    },
    needsAgency() {
      return !!this.delivery.department && this.delivery.department.toLowerCase() !== "lima";
    }
  },
  async mounted() {
    this.ownerId = this.$route.params.userId || "";
    this.loadCartFromSession();
    await this.loadStoreData();
    await this.loadDepartments();
    await this.loadPaymentMethods();
  },
  methods: {
    back() {
      this.$router.push("/tienda/" + this.ownerId);
    },
    loadCartFromSession() {
      if (!this.ownerId) return;
      try {
        const raw = sessionStorage.getItem("sifrah_store_cart_" + this.ownerId);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.items = [];
      }
    },
    saveCartToSession() {
      if (!this.ownerId) return;
      try {
        sessionStorage.setItem("sifrah_store_cart_" + this.ownerId, JSON.stringify(this.items));
      } catch (e) {
        console.error("Error saving cart to session:", e);
      }
    },
    increaseItemQty(item) {
      if (item.total < 99) {
        item.total++;
        this.saveCartToSession();
      }
    },
    decreaseItemQty(item) {
      if (item.total > 1) {
        item.total--;
        this.saveCartToSession();
      } else {
        if (confirm(`¿Deseas quitar "${item.name}" del carrito?`)) {
          this.items = this.items.filter((i) => i.id !== item.id);
          this.saveCartToSession();
        }
      }
    },
    toggleMobileCart() {
      this.showMobileCart = !this.showMobileCart;
    },
    async loadStoreData() {
      if (!this.ownerId) return;
      try {
        const { data } = await api.SharedStore.GET(this.ownerId);
        if (data && !data.error) {
          this.ownerName = data.ownerName || data.ownerFullName || "Sifrah";
          this.ownerFirstName = data.ownerFirstName || data.ownerName || "";
          this.ownerLastName = data.ownerLastName || "";
          this.ownerFullName = data.ownerFullName || `${this.ownerFirstName} ${this.ownerLastName}`.trim() || "Distribuidor Sifrah";
          this.ownerPhoto = data.ownerPhoto || null;
          this.ownerPhone = data.ownerPhone || data.phone || "";
        }
      } catch (e) {
        console.warn("No se pudo cargar datos del socio:", e);
      }
    },
    async loadDepartments() {
      try {
        const { data } = await api.getDeliveryInfo({ type: "departments" });
        this.departments = data.departments || [];
      } catch (e) {
        this.departments = [];
      }
    },
    async loadPaymentMethods() {
      try {
        const { data } = await api.SharedStore.paymentMethods();
        this.paymentMethods = (data && data.paymentMethods) || [];
        if (data && data.offices && data.offices.length) {
          this.offices = data.offices;
          if (!this.selectedPickupPoint) {
            this.selectedPickupPoint = this.offices[0].id;
          }
        }
        if (this.bankPaymentMethods.length && !this.selectedBank) {
          this.selectedBank = this.bankPaymentMethods[0].id;
        }
      } catch (e) {
        this.paymentMethods = [];
        this.offices = [];
      }
    },
    selectDeliveryMethod(method) {
      this.deliveryMethod = method;
      this.error = "";
    },
    async onDepartment() {
      this.delivery.province = "";
      this.delivery.district = "";
      this.delivery.agency = "";
      this.zone = null;
      this.provinces = [];
      this.districts = [];
      this.agencies = [];
      if (!this.delivery.department) return;
      try {
        const { data } = await api.getDeliveryInfo({ type: "provinces", department: this.delivery.department });
        this.provinces = data.provinces || [];
      } catch (e) {
        this.provinces = [];
      }
      if (this.needsAgency) {
        try {
          const { data } = await api.getDeliveryInfo({ type: "agencies-by-department", department: this.delivery.department });
          this.agencies = data.agencies || [];
        } catch (e) {
          this.agencies = [];
        }
      }
    },
    async onProvince() {
      this.delivery.district = "";
      this.zone = null;
      this.districts = [];
      if (!this.delivery.province) return;
      try {
        const { data } = await api.getDeliveryInfo({
          type: "districts",
          department: this.delivery.department,
          province: this.delivery.province
        });
        this.districts = data.districts || [];
      } catch (e) {
        this.districts = [];
      }
    },
    async onDistrict() {
      this.zone = null;
      if (this.delivery.department !== "lima" || !this.delivery.district) return;
      try {
        const { data } = await api.getDeliveryInfo({ type: "zone-by-district", district: this.delivery.district });
        this.zone = data.zone || null;
      } catch (e) {
        this.zone = null;
      }
    },
    hasOfficeAddress(office) {
      return Boolean(office && office.address && String(office.address).trim().length > 0 && String(office.address).trim() !== "-");
    },
    hasOfficePhone(office) {
      return Boolean(office && office.phone && String(office.phone).trim().length > 0 && String(office.phone).trim() !== "-");
    },
    hasOfficeSchedule(office) {
      return Boolean(office && office.schedule && String(office.schedule).trim().length > 0 && String(office.schedule).trim() !== "-");
    },
    officeMapUrl(office) {
      if (!office) return null;
      if (office.googleMapsUrl && String(office.googleMapsUrl).trim().length > 0) {
        return String(office.googleMapsUrl).trim();
      }
      if (this.hasOfficeAddress(office)) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address + ', Peru')}`;
      }
      return null;
    },
    onBuyerDocTypeChange() {
      this.buyer.document = "";
      this.error = "";
    },
    onBuyerDocumentInput(event) {
      const val = event.target.value;
      if (this.buyer.documentType === "DNI" || this.buyer.documentType === "RUC") {
        this.buyer.document = val.replace(/\D/g, "").slice(0, this.documentMaxLength);
      } else {
        this.buyer.document = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
      }
    },
    onBuyerPhoneInput(event) {
      this.buyer.phone = event.target.value.replace(/\D/g, "").slice(0, 9);
    },
    onReceiverDocTypeChange() {
      this.receiver.document = "";
      this.error = "";
    },
    onReceiverDocumentInput(event) {
      const val = event.target.value;
      if (this.receiver.documentType === "DNI") {
        this.receiver.document = val.replace(/\D/g, "").slice(0, 8);
      } else {
        this.receiver.document = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
      }
    },
    onReceiverPhoneInput(event) {
      this.receiver.phone = event.target.value.replace(/\D/g, "").slice(0, 9);
    },
    onReceiverNameInput(event) {
      this.receiver.name = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    },
    onlyLetters(event) {
      this.buyer.name = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    },
    onlyLettersLastName(event) {
      this.buyer.lastName = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    },
    onlyDigits(field, max) {
      this.buyer[field] = String(this.buyer[field] || "").replace(/\D/g, "").slice(0, max);
    },
    onlyProofDigits(event) {
      this.proof.ruc = event.target.value.replace(/\D/g, "").slice(0, 11);
    },
    onlyVoucherNumber(field, event) {
      this[field] = event.target.value.replace(/\D/g, "");
    },
    nextFromDelivery() {
      this.error = "";
      if (this.deliveryMethod === "pickup") {
        if (!this.selectedPickupPoint && this.offices.length) {
          this.selectedPickupPoint = this.offices[0].id;
        }
        if (!this.selectedPickupPoint) {
          this.error = "Por favor selecciona una sede de recojo.";
          return;
        }
      } else {
        if (!this.delivery.department || !this.delivery.province || !this.delivery.district) {
          this.error = "Completa departamento, provincia y distrito de entrega.";
          return;
        }
        if (this.delivery.address.trim().length < 5) {
          this.error = "Escribe la dirección exacta de entrega.";
          return;
        }
        if (this.delivery.department === "lima" && !this.zone) {
          this.error = "Ese distrito no cuenta con cobertura de delivery en este momento.";
          return;
        }
      }
      this.step = 2;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    nextFromProof() {
      this.error = "";
      if (!this.buyer.name || this.buyer.name.trim().length < 2) {
        this.error = "Escribe el nombre del comprador.";
        return;
      }
      if (!this.buyer.lastName || this.buyer.lastName.trim().length < 2) {
        this.error = "Escribe los apellidos del comprador.";
        return;
      }
      if (!this.buyer.document || !this.buyer.document.trim()) {
        this.error = "Escribe el número de documento del comprador.";
        return;
      }

      // Validaciones de documento según normativa Perú
      if (this.buyer.documentType === "DNI") {
        if (!/^\d{8}$/.test(this.buyer.document)) {
          this.error = "El DNI del comprador debe tener exactamente 8 dígitos numéricos.";
          return;
        }
      } else if (this.buyer.documentType === "RUC") {
        if (!/^\d{11}$/.test(this.buyer.document)) {
          this.error = "El RUC del comprador debe tener exactamente 11 dígitos numéricos.";
          return;
        }
      } else if (this.buyer.documentType === "CE") {
        if (!/^[A-Za-z0-9]{8,12}$/.test(this.buyer.document)) {
          this.error = "El Carnet de Extranjería debe tener entre 8 y 12 caracteres alfanuméricos.";
          return;
        }
      } else if (this.buyer.documentType === "PASAPORTE") {
        if (!/^[A-Za-z0-9]{6,12}$/.test(this.buyer.document)) {
          this.error = "El Pasaporte debe tener entre 6 y 12 caracteres.";
          return;
        }
      }

      // Validación de celular (Perú: 9 dígitos iniciando con 9)
      if (!/^9\d{8}$/.test(this.buyer.phone)) {
        this.error = "El celular debe tener 9 dígitos y comenzar con 9 (ej. 9XXXXXXXX).";
        return;
      }

      // Validación de correo si fue ingresado
      if (this.buyer.email && this.buyer.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.buyer.email.trim())) {
          this.error = "El correo electrónico ingresado no tiene un formato válido.";
          return;
        }
      }

      // Factura
      if (this.proof.type === "factura") {
        if (!/^\d{11}$/.test(this.proof.ruc)) {
          this.error = "El RUC de la factura debe tener exactamente 11 dígitos numéricos.";
          return;
        }
        if (!this.proof.razonSocial || this.proof.razonSocial.trim().length < 3) {
          this.error = "Escribe la Razón Social de la empresa para la factura.";
          return;
        }
        if (!this.proof.direccionFiscal || this.proof.direccionFiscal.trim().length < 4) {
          this.error = "Escribe la Dirección Fiscal registrada en SUNAT para la factura.";
          return;
        }
      }

      // Receptor alternativo
      if (this.receiver.isDifferent) {
        if (!this.receiver.name || this.receiver.name.trim().length < 3) {
          this.error = "Escribe el nombre completo de la persona que recibe o retira.";
          return;
        }
        if (!this.receiver.document || !this.receiver.document.trim()) {
          this.error = "Escribe el documento de la persona que recibe o retira.";
          return;
        }
        if (this.receiver.documentType === "DNI") {
          if (!/^\d{8}$/.test(this.receiver.document)) {
            this.error = "El DNI de la persona que recibe o retira debe tener exactamente 8 dígitos.";
            return;
          }
        } else {
          if (!/^[A-Za-z0-9]{8,12}$/.test(this.receiver.document)) {
            this.error = "El documento de la persona que recibe o retira debe tener entre 8 y 12 caracteres.";
            return;
          }
        }
        if (this.receiver.phone && !/^9\d{8}$/.test(this.receiver.phone)) {
          this.error = "El celular de la persona que recibe debe tener 9 dígitos y comenzar con 9 (ej. 9XXXXXXXX).";
          return;
        }
      }

      if (!this.proof.document) {
        this.proof.document = this.buyer.document;
      }

      this.step = 3;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    prevStep() {
      if (this.step > 1) {
        this.step--;
        this.error = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    goStep(stepNum) {
      this.step = stepNum;
      this.error = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    selectPayMethod(method) {
      this.payMethod = method;
      this.error = "";
      if (method === "credit-card") {
        this.$nextTick(() => {
          this.initIzipay();
        });
      } else if (method === "bank") {
        if (!this.selectedBank && this.bankPaymentMethods.length) {
          this.selectedBank = this.bankPaymentMethods[0].id;
        }
      }
    },
    copyToClipboard(text) {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        this.copiedPhone = true;
        setTimeout(() => {
          this.copiedPhone = false;
        }, 2000);
      }
    },
    resetIzipay() {
      this.izipayToken = "";
      this.izipayLoading = false;
      this.izipayError = "";
    },
    reloadIzipay() {
      this.resetIzipay();
      this.$nextTick(() => {
        this.initIzipay();
      });
    },
    onVoucher(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        this.error = "El archivo supera el tamaño máximo de 5 MB.";
        return;
      }
      this.error = "";
      this.voucherFile = file;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.voucherPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.voucherPreview = "pdf";
      }
    },
    formatPaymentMethodName(method) {
      switch (method) {
        case "bank":
          return this.currentBankName ? `Transferencia / Depósito (${this.currentBankName})` : "Transferencia / Depósito";
        case "yape":
          return "Yape";
        case "plin":
          return "Plin";
        case "credit-card":
          return "Tarjeta (Izipay)";
        case "cash":
          return "Pago en tienda";
        default:
          return "Transferencia bancaria";
      }
    },
    openConfirmModal() {
      this.error = "";
      if (this.payMethod === "bank" || this.payMethod === "yape" || this.payMethod === "plin") {
        if (this.payMethod === "bank") {
          if (!this.selectedBank && this.bankPaymentMethods.length) {
            this.selectedBank = this.bankPaymentMethods[0].id;
          }
        }
        if (!this.voucherFile) {
          if (this.payMethod === "yape") {
            this.error = "Por favor adjunta la captura de tu pago por Yape.";
          } else if (this.payMethod === "plin") {
            this.error = "Por favor adjunta la captura de tu pago por Plin.";
          } else {
            this.error = "Por favor adjunta tu comprobante de transferencia bancaria.";
          }
          return;
        }
      }
      this.showConfirmModal = true;
    },
    async submitFinalOrder() {
      this.showConfirmModal = false;
      this.sending = true;
      this.error = "";

      try {
        let voucherUrl = "";
        if (this.voucherFile) {
          voucherUrl = await lib.upload(
            this.voucherFile,
            `tienda_${Date.now()}_${this.voucherFile.name}`,
            "activations"
          );
        }

        const payloadData = {
          userId: this.ownerId,
          products: this.items.map((item) => ({ id: item.id, total: item.total })),
          buyer: {
            name: this.buyerFullName,
            firstName: this.buyer.name,
            lastName: this.buyer.lastName,
            document: this.buyer.document,
            documentType: this.buyer.documentType,
            phone: this.buyer.phone,
            email: this.buyer.email
          },
          receiver: this.receiver.isDifferent ? this.receiver : null,
          delivery: this.delivery,
          proof: this.proof,
          shipping_method: this.deliveryMethod,
          office_id: this.deliveryMethod === "pickup" ? this.selectedPickupPoint : "",
          pay_method: this.payMethod,
          bank: this.payMethod === "bank" ? this.currentBankName : (this.payMethod === "yape" ? "Yape" : (this.payMethod === "plin" ? "Plin" : "")),
          bank_info: this.payMethod === "bank" ? this.selectedMethod : null,
          voucher: voucherUrl,
          voucher_number: this.voucherNumber.trim(),
          payment_date: this.paymentDate
        };

        const { data } = await api.SharedStore.checkout(payloadData);

        if (!data || data.error) {
          throw new Error((data && data.msg) || "No se pudo registrar el pedido.");
        }

        this.finish(data);
      } catch (err) {
        console.error("Error al procesar el pedido:", err);
        const msg = err.response && err.response.data && err.response.data.msg;
        this.error = msg || err.message || "Error al procesar el pedido. Intenta nuevamente.";
      } finally {
        this.sending = false;
      }
    },
    finish(data) {
      this.orderNumber = data.orderNumber || data.id || "ORD-" + Math.floor(100000 + Math.random() * 900000);
      this.paidTotal = Number(data.total) || this.grandTotal;
      sessionStorage.removeItem("sifrah_store_cart_" + this.ownerId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    async initIzipay() {
      if (this.izipayLoading || this.grandTotal <= 0) return;
      
      // Si ya hay token generado para esta compra, re-adjuntamos formulario
      if (this.izipayToken && window.KR) {
        await this.attachIzipay();
        return;
      }

      this.izipayLoading = true;
      this.izipayError = "";
      try {
        const orderId = `TIENDA-${Date.now()}`;
        const email = this.buyer.email || "cliente@sifrah.com";
        const customerName = this.buyer.name || "Cliente";

        const response = await axios.post("/app/izipay-token", {
          amount: this.grandTotal,
          email,
          orderId,
          customerName
        });

        if (response.data && response.data.formToken) {
          this.izipayToken = response.data.formToken;
          await this.loadIzipayAssets();
          await this.attachIzipay();
        } else {
          this.izipayError = "No se pudo generar el formulario seguro de tarjeta.";
        }
      } catch (e) {
        console.error("Error al inicializar Izipay:", e);
        this.izipayError = "Ocurrió un error al cargar la pasarela de pago. Haz clic en reintentar.";
      } finally {
        this.izipayLoading = false;
      }
    },
    loadIzipayAssets() {
      return new Promise((resolve) => {
        if (!document.getElementById("izipay-classic-css")) {
          const style = document.createElement("link");
          style.id = "izipay-classic-css";
          style.rel = "stylesheet";
          style.href = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css";
          document.head.appendChild(style);
        }
        if (!document.getElementById("izipay-classic-js")) {
          const theme = document.createElement("script");
          theme.id = "izipay-classic-js";
          theme.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js";
          document.head.appendChild(theme);
        }
        const existing = document.getElementById("izipay-script");
        if (existing && window.KR) {
          resolve();
          return;
        }
        const script = existing || document.createElement("script");
        script.id = "izipay-script";
        script.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
        script.setAttribute("kr-public-key", "33003249:publickey_yekT6W03reoGaKT2dSrjdzE0oBJ2a7X2seEsnusIcExSO");
        script.setAttribute("kr-post-url-success", "javascript:void(0);");
        script.onload = () => resolve();
        if (!existing) document.head.appendChild(script);
        else if (window.KR) resolve();
      });
    },
    async attachIzipay() {
      await this.$nextTick();
      if (!window.KR || !this.izipayToken) return;
      try {
        const form = document.querySelector(".izipay-container .kr-embedded");
        if (typeof window.KR.setFormConfig === "function") {
          await window.KR.setFormConfig({ formToken: this.izipayToken });
        }
        if (typeof window.KR.onSubmit === "function") {
          window.KR.onSubmit(this.onIzipaySuccess.bind(this));
        }
        if (typeof window.KR.attachForm === "function" && form) {
          await window.KR.attachForm(form);
        }
      } catch (err) {
        console.error("Error al adjuntar formulario Izipay:", err);
      }
    },
    async onIzipaySuccess(event) {
      try {
        if (event && event.clientAnswer && event.clientAnswer.orderStatus === "PAID") {
          await this.submitFinalOrder();
        } else {
          this.error = "El pago con tarjeta no se completó satisfactoriamente.";
        }
      } catch (err) {
        console.error("Error en confirmación Izipay:", err);
        this.error = "Error al procesar la confirmación del pago.";
      }
      return false; // Previene envío nativo o recarga en Krypton
    }
  }
};
</script>

<style scoped>
.store-checkout-page {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

/* ========================================== */
/* Topbar Oficial SIFRAH                      */
/* ========================================== */
.checkout-topbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #12161c;
  color: #ffffff;
  z-index: 1000;
  border-bottom: 1px solid #232832;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar-back-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.topbar-logo {
  height: 34px;
  width: auto;
  filter: brightness(0) invert(1);
}

.brand-tagline {
  font-size: 10px;
  color: #cbd5e1;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.secure-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #f1f5f9;
}

.secure-badge i {
  color: #22c55e;
  font-size: 12px;
}

.partner-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.partner-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.partner-name i {
  font-size: 10px;
  margin-left: 4px;
  color: #94a3b8;
}

.partner-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  overflow: hidden;
  background-color: #334155;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.partner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-cart-badge {
  position: relative;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
}

.cart-badge-count {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #e60064;
  color: #ffffff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================================== */
/* Layout Principal (2 Columnas en Desktop)   */
/* ========================================== */
.checkout-main-content {
  padding: 30px 20px 80px;
}

.checkout-layout-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 310px 1fr;
  gap: 32px;
  align-items: start;
}

/* ========================================== */
/* Columna Izquierda: Carrito de Compras      */
/* ========================================== */
.sidebar-cart-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.sidebar-cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-cart-icon {
  font-size: 18px;
  color: #e60064;
}

.header-titles h3 {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.cart-items-count {
  font-size: 12px;
  color: #94a3b8;
}

.cart-edit-link {
  font-size: 13px;
  font-weight: 700;
  color: #e60064;
  text-decoration: underline;
  cursor: pointer;
}

.sidebar-cart-items {
  padding: 18px 0;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-cart-item {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.sidebar-cart-item:last-child {
  margin-bottom: 0;
}

.item-img-wrapper {
  width: 68px;
  height: 68px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: #ffffff;
}

.item-img-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin: 2px 0 4px;
}

.item-price {
  font-size: 14px;
  font-weight: 800;
  color: #e60064;
  margin-bottom: 6px;
}

.item-qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  height: 28px;
  background-color: #f8fafc;
}

.item-qty-stepper button {
  width: 26px;
  height: 100%;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.item-qty-stepper button:hover:not(:disabled) {
  background-color: #e2e8f0;
  color: #0f172a;
}

.item-qty-stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-qty-stepper span {
  width: 28px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}

.sidebar-cart-totals {
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.total-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.total-line.grand-total {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-top: 10px;
  margin-bottom: 0;
}

.total-line.grand-total .price-val {
  color: #e60064;
  font-size: 18px;
}

.sidebar-cart-footer-box {
  margin-top: 18px;
  padding: 16px;
  background-color: #fdf2f6;
  border-radius: 10px;
  text-align: center;
}

.sidebar-cart-footer-box p {
  font-size: 12px;
  color: #e60064;
  font-weight: 600;
  margin: 0 0 10px;
}

.btn-return-store-outline {
  width: 100%;
  padding: 9px 12px;
  background-color: #ffffff;
  color: #e60064;
  border: 1px solid #e60064;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-return-store-outline:hover {
  background-color: #e60064;
  color: #ffffff;
}

/* ========================================== */
/* Columna Derecha: Proceso de Pasos          */
/* ========================================== */
.checkout-steps-section {
  display: flex;
  flex-direction: column;
}

/* Stepper Superior */
.checkout-stepper-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #cbd5e1;
  color: #64748b;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.stepper-item.active .step-circle {
  background-color: #e60064;
  border-color: #e60064;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(230, 0, 100, 0.15);
}

.stepper-item.completed .step-circle {
  background-color: #e60064;
  border-color: #e60064;
  color: #ffffff;
}

.step-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.stepper-item.active .step-label {
  color: #e60064;
  font-weight: 800;
}

.stepper-line {
  height: 3px;
  width: 90px;
  background-color: #e2e8f0;
  margin: 0 10px;
  margin-bottom: 22px;
  transition: background-color 0.25s ease;
}

.stepper-line.filled {
  background-color: #e60064;
}

/* Error Banner */
.checkout-error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Banners superiores de cada paso (Aislados contra colisiones globales) */
.sifrah-step-banner {
  border-radius: 14px;
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.sifrah-banner-content {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  text-align: left !important;
  white-space: normal !important;
  position: relative;
  z-index: 2;
}

.sifrah-banner-pink {
  background-color: #fff0f5 !important;
  color: #111827 !important;
  border: 1px solid #ffd6e7;
}

.sifrah-banner-pink .sifrah-banner-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827 !important;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.sifrah-banner-pink .sifrah-banner-subtitle {
  font-size: 14px;
  color: #64748b !important;
  margin: 0;
  line-height: 1.4;
}

.sifrah-banner-pink .sifrah-banner-watermark i {
  font-size: 48px;
  color: #fbcfe8 !important;
  opacity: 0.85;
}

.sifrah-banner-fuchsia {
  background-color: #e60064 !important;
  background: #e60064 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(230, 0, 100, 0.22);
}

.sifrah-banner-fuchsia .sifrah-banner-title {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff !important;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.sifrah-banner-fuchsia .sifrah-banner-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95) !important;
  margin: 0;
  line-height: 1.4;
}

.sifrah-banner-fuchsia .sifrah-banner-watermark i {
  font-size: 44px;
  color: rgba(255, 255, 255, 0.85) !important;
}

.text-not-available {
  color: #94a3b8 !important;
  font-style: italic;
}

/* Bloques de Formulario */
.step-block {
  background-color: #ffffff;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.badge-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #e60064;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.block-title h3 {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

/* Tarjetas de Selección de Despacho */
.dispatch-methods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dispatch-card {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.dispatch-card:hover {
  border-color: #cbd5e1;
}

.dispatch-card.active {
  border-color: #e60064;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #e60064;
}

.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.card-icon-box.fuchsia {
  background-color: #fdf2f6;
  color: #e60064;
}

.card-icon-box.dark {
  background-color: #f1f5f9;
  color: #1e293b;
}

.card-details {
  flex: 1;
}

.card-details h4 {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 3px 0;
}

.card-details p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.35;
}

.radio-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #ffffff;
}

.radio-circle.checked {
  background-color: #e60064;
  border-color: #e60064;
}

/* Selector de Sede */
.custom-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.select-lead-icon {
  position: absolute;
  left: 14px;
  color: #111827;
  font-size: 16px;
  pointer-events: none;
}

.select-arrow-icon {
  position: absolute;
  right: 14px;
  color: #64748b;
  font-size: 13px;
  pointer-events: none;
}

.pickup-select {
  width: 100%;
  padding: 13px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  background-color: #ffffff;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.pickup-select:focus {
  border-color: #e60064;
}

/* Ficha de Sede */
.office-info-card {
  background-color: #fffbfa;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  gap: 8px;
}

.row-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
  color: #64748b;
  font-weight: 700;
  flex-shrink: 0;
}

.row-label i {
  color: #e60064;
  font-size: 15px;
  width: 16px;
  text-align: center;
}

.row-value {
  color: #111827;
  font-weight: 600;
}

.phone-val {
  display: flex;
  align-items: center;
  gap: 8px;
}

.whatsapp-btn-icon {
  color: #25d366;
  font-size: 18px;
  display: inline-flex;
  transition: transform 0.2s ease;
}

.whatsapp-btn-icon:hover {
  transform: scale(1.15);
}

.maps-link {
  color: #e60064;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.maps-link:hover {
  text-decoration: underline;
}

/* Formularios Generales */
.form-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-grid-three {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.form-field input,
.form-field select {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  background-color: #ffffff;
  transition: border-color 0.2s ease;
}

.form-field input:focus,
.form-field select:focus {
  border-color: #e60064;
}

.input-icon-box {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-box input {
  width: 100%;
  padding-right: 36px;
}

.input-icon-box i {
  position: absolute;
  right: 12px;
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
}

/* Tarjetas de Comprobante (Boleta / Factura) */
.proof-types-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.proof-card {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.proof-card.active {
  border-color: #e60064;
  box-shadow: 0 0 0 1px #e60064;
}

.proof-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.proof-icon.fuchsia {
  background-color: #fdf2f6;
  color: #e60064;
}

.proof-icon.dark {
  background-color: #f1f5f9;
  color: #1e293b;
}

.proof-info h4 {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 2px 0;
}

.proof-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.factura-fields-box {
  margin-top: 16px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

/* Receptor Alternativo Toggle */
.receptor-toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.toggle-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.toggle-text h3 {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 3px 0;
}

.toggle-text p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Switch Toggle Slider */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider-round {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.slider-round:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch-toggle input:checked + .slider-round {
  background-color: #e60064;
}

.switch-toggle input:checked + .slider-round:before {
  transform: translateX(22px);
}

.receiver-form-box {
  margin-top: 18px;
  padding: 16px;
  background-color: #fdf2f6;
  border-radius: 10px;
  border: 1px solid #fbcfe8;
}

/* Resúmenes Editables en Paso 3 (Pago) */
.summary-preview-card {
  background-color: #fdf2f6;
  border: 1px solid #fbcfe8;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.preview-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #fbcfe8;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fuchsia-icon {
  color: #e60064;
  font-size: 16px;
}

.title-with-icon h4 {
  font-size: 15px;
  font-weight: 800;
  color: #e60064;
  margin: 0;
}

.btn-edit-step {
  background: none;
  border: none;
  color: #e60064;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.btn-edit-step:hover {
  background-color: rgba(230, 0, 100, 0.08);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.preview-item .item-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 2px;
}

.preview-item .item-val {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.preview-item .val-sub {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.green-wa {
  color: #25d366;
  margin-left: 6px;
}

/* Pestañas de Métodos de Pago */
.payment-tabs-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.pay-tab-btn {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 8px;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 86px;
  transition: all 0.2s ease;
  outline: none;
}

.pay-tab-btn:hover {
  border-color: #cbd5e1;
}

.pay-tab-btn.active {
  border-color: #e60064;
  box-shadow: 0 0 0 1px #e60064;
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.tab-icon {
  font-size: 20px;
  color: #111827;
}

.pay-tab-btn.active .tab-icon {
  color: #e60064;
}

.tab-content span {
  font-size: 11px;
  font-weight: 700;
  color: #111827;
  line-height: 1.15;
}

.brand-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 900;
  color: #ffffff;
  text-transform: lowercase;
}

.yape-badge {
  background-color: #742284;
}

.plin-badge {
  background-color: #00b5e2;
}

.tab-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #ffffff;
}

.tab-radio.checked {
  background-color: #e60064;
  border-color: #e60064;
}

/* Campos de Transferencia y Banco */
.bank-select-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bank-select {
  flex: 1;
}

.bank-logo-badge {
  display: flex;
  align-items: center;
}

.bcp-brand {
  font-size: 13px;
  font-weight: 900;
  color: #002a8f;
  letter-spacing: -0.5px;
}

.bank-account-info-box {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}

.bank-info-header {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.bank-info-content p {
  margin: 3px 0;
  color: #475569;
}

/* ========================================== */
/* Billeteras Digitales (Yape y Plin)         */
/* ========================================== */
.yape-plin-container {
  margin-top: 18px;
}

.wallet-info-card {
  border-radius: 14px;
  padding: 22px 24px;
  margin-bottom: 22px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.wallet-info-card.yape-card {
  border-left: 5px solid #731384;
}

.wallet-info-card.plin-card {
  border-left: 5px solid #00a4e4;
}

.wallet-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.wallet-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 14px;
}

.wallet-badge-pill.yape-pill {
  background: #fbf2fd;
  color: #731384;
}

.wallet-badge-pill.plin-pill {
  background: #eef8fe;
  color: #0077b6;
}

.wallet-badge-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.wallet-instant-tag {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.wallet-card-body {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
}

@media (max-width: 640px) {
  .wallet-card-body {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.wallet-data-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wallet-data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wallet-data-item .data-label {
  font-size: 13px;
  color: #64748b;
}

.wallet-data-item .data-val {
  font-size: 16px;
  color: #1e293b;
  font-weight: 700;
}

.data-phone-val {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 640px) {
  .data-phone-val {
    justify-content: center;
  }
}

.phone-number {
  font-size: 20px;
  color: #12161c;
  letter-spacing: 1px;
}

.btn-copy-mini {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn-copy-mini:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.wallet-qr-col {
  display: flex;
  justify-content: center;
}

.qr-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.qr-img {
  width: 135px;
  height: 135px;
  object-fit: contain;
  border-radius: 8px;
  background: #ffffff;
  padding: 4px;
}

.qr-scan-hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-align: center;
}

.wallet-inputs-grid {
  margin-bottom: 18px;
}

/* ========================================== */
/* Pasarela Izipay Mejorada                   */
/* ========================================== */
.izipay-container {
  margin-top: 18px;
  padding: 24px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.izipay-container[style*="display: none"] {
  display: none !important;
}

.izipay-header-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 10px;
}

.izipay-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.izipay-badge i {
  color: #10b981;
}

.izipay-sub {
  font-size: 13px;
  color: #64748b;
}

.izipay-loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  color: #64748b;
  font-size: 14px;
}

.izipay-error-msg {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 14px;
  margin-bottom: 16px;
}

.izipay-error-msg .err-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-retry-izipay {
  background: #b91c1c;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;
}

.btn-retry-izipay:hover {
  opacity: 0.9;
}

.kr-embedded {
  min-height: 120px;
}

.kr-embedded .kr-payment-button {
  margin-top: 14px;
}

/* Caja de subida con borde punteado fucsia */
.voucher-upload-dashed-box {
  border: 1.5px dashed #e60064;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: #fffbfa;
}

.upload-left-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.upload-icon-fuchsia {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #e60064;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.upload-texts {
  display: flex;
  flex-direction: column;
}

.upload-main-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.upload-subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.btn-select-file-fuchsia {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  border: 1.5px solid #e60064;
  border-radius: 8px;
  background-color: #ffffff;
  color: #e60064;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-select-file-fuchsia:hover {
  background-color: #e60064;
  color: #ffffff;
}

.file-hidden-input {
  display: none;
}

.voucher-preview-wrapper {
  margin-top: 14px;
  padding: 12px;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.preview-tag {
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
  display: block;
  margin-bottom: 8px;
}

.preview-img-box img {
  max-height: 120px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.store-pay-info-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #fdf2f6;
  border: 1px solid #fbcfe8;
  border-radius: 10px;
  padding: 18px;
}

.store-pay-info-box i {
  font-size: 32px;
  color: #e60064;
}

.store-pay-text h4 {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px 0;
}

.store-pay-text p {
  font-size: 13px;
  color: #475569;
  margin: 0;
}

/* Botones de Navegación de Pasos */
.step-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.btn-action-prev {
  padding: 12px 24px;
  background-color: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-action-prev:hover {
  background-color: #f1f5f9;
}

.btn-action-next-fuchsia {
  padding: 14px 36px;
  background-color: #e60064;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(230, 0, 100, 0.28);
}

.btn-action-next-fuchsia:hover:not(:disabled) {
  background-color: #cf005a;
  transform: translateY(-1px);
}

.btn-action-next-fuchsia:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========================================== */
/* MODAL DE CONFIRMACIÓN                      */
/* ========================================== */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10050;
  padding: 20px;
  box-sizing: border-box;
}

.confirm-modal-card {
  background-color: #ffffff;
  border-radius: 18px;
  max-width: 440px;
  width: 100%;
  padding: 32px 28px 24px;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
}

.modal-check-circle-fuchsia {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #e60064;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.45;
}

.modal-info-summary {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.modal-info-summary .info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.modal-info-summary .row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.icon-tag {
  color: #e60064;
  font-size: 14px;
}

.modal-info-summary .value {
  font-size: 13px;
  color: #111827;
}

.total-highlight {
  border-top: 1px solid #e2e8f0;
  margin-top: 6px;
  padding-top: 10px;
}

.price-pink {
  font-size: 16px !important;
  font-weight: 800 !important;
  color: #e60064 !important;
}

.modal-actions-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 12px;
}

.btn-modal-cancel {
  padding: 12px 18px;
  background-color: #ffffff;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
}

.btn-modal-confirm-fuchsia {
  padding: 12px 18px;
  background-color: #e60064;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-modal-confirm-fuchsia:hover:not(:disabled) {
  background-color: #cf005a;
}

/* ========================================== */
/* Pantalla de Éxito / Orden Confirmada       */
/* ========================================== */
.order-confirmed-overlay,
.empty-cart-container {
  max-width: 520px;
  margin: 60px auto;
  padding: 0 20px;
}

.order-confirmed-card,
.empty-cart-card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.success-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #e60064;
  color: #ffffff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.empty-icon {
  font-size: 52px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.order-confirmed-card h2,
.empty-cart-card h2 {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.order-success-msg,
.empty-cart-card p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.order-summary-box {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: 6px 0;
  color: #475569;
}

.summary-line.total {
  border-top: 1px solid #e2e8f0;
  margin-top: 6px;
  padding-top: 10px;
  color: #111827;
}

.summary-line.total strong {
  color: #e60064;
  font-size: 17px;
}

.order-notice {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.45;
}

.btn-return-store-solid {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #e60064;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-return-store-solid:hover {
  background-color: #cf005a;
}

/* ========================================== */
/* Responsive & Mobile Specifics              */
/* ========================================== */
.mobile-only {
  display: none !important;
}

@media (max-width: 960px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .checkout-layout-container {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .checkout-main-content {
    padding: 16px 12px 60px;
  }

  .dispatch-methods-grid,
  .proof-types-grid,
  .form-grid-two,
  .form-grid-three {
    grid-template-columns: 1fr;
  }

  .payment-tabs-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .pay-tab-btn {
    flex-direction: row;
    min-height: auto;
    padding: 14px;
  }

  .tab-content {
    flex-direction: row;
    gap: 12px;
  }

  .tab-content span {
    font-size: 13px;
  }

  .voucher-upload-dashed-box {
    flex-direction: column;
    text-align: center;
  }

  .upload-left-content {
    flex-direction: column;
  }

  .btn-select-file-fuchsia {
    width: 100%;
  }

  .modal-actions-row {
    grid-template-columns: 1fr;
  }

  /* Acordeón de Carrito Mobile */
  .mobile-cart-accordion {
    background-color: #ffffff;
    border: 1px solid #fbcfe8;
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
  }

  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .accordion-header i.fa-shopping-cart {
    color: #e60064;
    margin-right: 6px;
  }

  .accordion-total {
    color: #e60064;
    margin-right: 6px;
    font-weight: 800;
  }

  .accordion-body {
    padding: 12px 16px 16px;
    border-top: 1px solid #fbcfe8;
    background-color: #fffbfa;
  }

  .mobile-cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .mobile-item-img {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    object-fit: contain;
    background-color: #ffffff;
  }

  .mobile-item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .mobile-item-name {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
  }

  .mobile-item-price {
    font-size: 12px;
    font-weight: 800;
    color: #e60064;
  }

  .mobile-qty-controls {
    display: flex;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    height: 24px;
  }

  .mobile-qty-controls button {
    border: none;
    background: #ffffff;
    width: 22px;
    height: 100%;
    cursor: pointer;
  }

  .mobile-qty-controls span {
    width: 22px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
  }

  .mobile-cart-subtotal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    border-top: 1px dashed #fbcfe8;
    padding-top: 10px;
    margin-top: 8px;
  }

  .mobile-cart-subtotal-row strong {
    color: #e60064;
    font-size: 15px;
  }
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
