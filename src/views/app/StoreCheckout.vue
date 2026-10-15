<template>
  <div class="store-checkout-page">
    <div class="checkout-main-title">
      <h1>Checkout</h1>
    </div>

    <div v-if="orderNumber" class="confirmation-modal">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-check-circle"></i>
          <h3>¡Orden Confirmada!</h3>
        </div>
        <div class="modal-body">
          <p>Tu orden ha sido procesada exitosamente.</p>
          <p>Número de orden: <strong>{{ orderNumber }}</strong></p>
          <p>Total: <strong>S/ {{ paidTotal.toFixed(2) }}</strong></p>
        </div>
        <div class="modal-actions">
          <button type="button" class="dashboard-btn" @click="back">Volver a la tienda</button>
        </div>
      </div>
    </div>

    <p v-else-if="!items.length" class="error-message">El carrito está vacío. <button type="button" class="return-btn" @click="back">Volver a la tienda</button></p>

    <div v-else class="checkout-unified-wrapper">
      <div class="checkout-container">
        <div class="checkout-content">
          <div class="cart-summary desktop-only">
            <div class="cart-title">
              <h2>Carrito de compras</h2>
              <p>Estos son los productos que has elegido</p>
            </div>
            <div class="cart-items">
              <div v-for="item in items" :key="item.id" class="cart-item">
                <div class="cart-item-image">
                  <img :src="item.img" :alt="item.name" />
                </div>
                <div class="cart-item-details">
                  <div class="cart-item-quantity">{{ item.total }} Unid.</div>
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-price">S/ {{ Number(item.price).toFixed(2) }}</div>
                </div>
              </div>
              <div v-if="deliveryMethod === 'delivery' && zone && delivery.department === 'lima'" class="cart-item delivery-item">
                <div class="delivery-item-icon">🚚</div>
                <div class="cart-item-details">
                  <div class="cart-item-quantity">Delivery</div>
                  <div class="cart-item-price">S/ {{ Number(zone.price).toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="order-summary">
              <div class="summary-row"><span>Subtotal:</span><span>S/ {{ goodsTotal.toFixed(2) }}</span></div>
              <div v-if="deliveryMethod === 'delivery' && zone && delivery.department === 'lima'" class="summary-row delivery-row">
                <span>🚚 Delivery:</span><span>S/ {{ Number(zone.price).toFixed(2) }}</span>
              </div>
              <div class="summary-row total"><span>Total:</span><span>S/ {{ grandTotal.toFixed(2) }}</span></div>
            </div>
            <div v-if="step !== 3" class="return-to-store">
              <p>¿Olvidaste algún producto?</p>
              <button type="button" class="return-btn" @click="back">Volver a la tienda</button>
            </div>
          </div>

          <div class="checkout-process">
            <div v-if="step !== 3" class="top-progress-bar" role="navigation">
              <div class="step-connector connector-1-2"><span class="step-connector-fill" :class="{ 'is-half': step === 1, 'is-full': step > 1 }"></span></div>
              <div class="step-connector connector-2-3"><span class="step-connector-fill" :class="{ 'is-half': step === 2, 'is-full': step > 2 }"></span></div>
              <div class="progress-step" :class="{ active: step === 1, complete: step > 1 }"><div class="step-number">1</div><div class="step-label">Despacho</div></div>
              <div class="progress-step" :class="{ active: step === 2, complete: step > 2 }"><div class="step-number">2</div><div class="step-label">Facturación</div></div>
              <div class="progress-step" :class="{ active: step === 3 }"><div class="step-number">3</div><div class="step-label">Pago</div></div>
            </div>

            <div v-if="step === 1" class="checkout-step">
              <div class="delivery-options">
                <div class="delivery-header"><h3>Opciones de Despacho</h3></div>
                <div class="delivery-content">
                  <div class="delivery-description"><p>Elije tu método de despacho preferido.</p></div>
                  <div class="delivery-methods">
                    <button
                      type="button"
                      @click="selectDeliveryMethod('pickup')"
                      :class="['delivery-method', { active: deliveryMethod === 'pickup' }]"
                    >
                      Retira tu Compra
                    </button>
                    <button
                      type="button"
                      @click="selectDeliveryMethod('delivery')"
                      :class="['delivery-method', { active: deliveryMethod === 'delivery' }]"
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                <!-- Formulario de Delivery -->
                <div v-if="deliveryMethod === 'delivery'" class="delivery-form">
                  <div class="form-section">
                    <h4>Información del Receptor</h4>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nombre Receptor</label>
                        <div class="input-with-icon"><input v-model="buyer.name" type="text" placeholder="Nombre Completo" @input="onlyLetters" /><i class="fas fa-user"></i></div>
                      </div>
                      <div class="form-group">
                        <label>Nro. de Documento</label>
                        <div class="input-with-icon"><input v-model="buyer.document" type="text" placeholder="Nro. de Documento" maxlength="8" @input="onlyDigits('document', 8)" /><i class="fas fa-list"></i></div>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Celular Receptor</label>
                        <div class="input-with-icon"><input v-model="buyer.phone" type="tel" placeholder="Celular Receptor" maxlength="9" @input="onlyDigits('phone', 9)" /><i class="fas fa-phone"></i></div>
                      </div>
                      <div class="form-group">
                        <label>Correo</label>
                        <div class="input-with-icon"><input v-model="buyer.email" type="email" placeholder="Correo (opcional)" /><i class="fas fa-envelope"></i></div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <h4>Ubicación de Entrega</h4>
                    <div class="form-group">
                      <label>Dirección</label>
                      <div class="input-with-icon"><input v-model="delivery.address" type="text" placeholder="Calle, número, referencia" /><i class="fas fa-map-marker-alt"></i></div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Departamento</label>
                        <select v-model="delivery.department" class="form-select" @change="onDepartment">
                          <option value="">Selecciona</option>
                          <option v-for="dept in departments" :key="dept.value" :value="dept.value">{{ dept.name }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Provincia</label>
                        <select v-model="delivery.province" class="form-select" @change="onProvince">
                          <option value="">Selecciona</option>
                          <option v-for="item in provinces" :key="item.value" :value="item.value">{{ item.name }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Distrito</label>
                      <select v-model="delivery.district" class="form-select district-select" @change="onDistrict">
                        <option value="">Selecciona</option>
                        <option v-for="item in districts" :key="item.value" :value="item.value">{{ item.name }}</option>
                      </select>
                    </div>
                    <div v-if="needsAgency" class="form-section agency-section">
                      <h4>Agencia de Transporte</h4>
                      <div class="form-group">
                        <label>Agencia</label>
                        <select v-model="delivery.agency" class="form-select agency-select">
                          <option value="">Seleccione</option>
                          <option v-for="agency in agencies" :key="agency.agency_code" :value="agency.agency_code">{{ agency.agency_name }}</option>
                        </select>
                      </div>
                      <div class="delivery-note"><p>💡 El costo de envío varía según la agencia y destino. Consulta directamente con la agencia seleccionada.</p></div>
                    </div>
                  </div>
                </div>

                <!-- Formulario de Pickup -->
                <div v-if="deliveryMethod === 'pickup'" class="pickup-form">
                  <div class="form-section">
                    <h4>Información de Quien Retira</h4>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nombre Receptor</label>
                        <div class="input-with-icon"><input v-model="buyer.name" type="text" placeholder="Nombre Completo" @input="onlyLetters" /><i class="fas fa-user"></i></div>
                      </div>
                      <div class="form-group">
                        <label>Nro. de Documento</label>
                        <div class="input-with-icon"><input v-model="buyer.document" type="text" placeholder="Nro. de Documento" maxlength="8" @input="onlyDigits('document', 8)" /><i class="fas fa-list"></i></div>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Celular Receptor</label>
                        <div class="input-with-icon"><input v-model="buyer.phone" type="tel" placeholder="Celular Receptor" maxlength="9" @input="onlyDigits('phone', 9)" /><i class="fas fa-phone"></i></div>
                      </div>
                      <div class="form-group">
                        <label>Correo</label>
                        <div class="input-with-icon"><input v-model="buyer.email" type="email" placeholder="Correo (opcional)" /><i class="fas fa-envelope"></i></div>
                      </div>
                    </div>
                  </div>

                  <div class="pickup-section">
                    <h4>Seleccione el PDE</h4>
                    <select v-model="selectedPickupPoint" class="pickup-select">
                      <option value="">Selecciona un punto de entrega</option>
                      <option v-for="office in offices" :key="office.id" :value="office.id">
                        {{ office.name }}
                        <span v-if="office.googleMapsUrl" class="maps-indicator" title="Tiene Google Maps">
                          <i class="fas fa-map-marker-alt"></i>
                        </span>
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Ubicación e información de la oficina -->
              <div v-if="selectedPickupPoint && deliveryMethod === 'pickup'" class="map-and-location-container">
                <div class="section-header">
                  <h3>Ubicación en mapa</h3>
                </div>

                <div class="map-location-vertical">
                  <div class="map-section">
                    <div class="map-container map-link-only">
                      <div class="map-info">
                        <div class="map-location-label">Ubicación en Mapa:</div>
                        <a
                          v-if="officeMapUrl"
                          :href="officeMapUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="map-link"
                        >
                          {{ officeMapUrl }}
                        </a>
                        <span v-else class="office-value">No disponible</span>
                      </div>
                    </div>
                  </div>

                  <div class="office-info-section">
                    <div class="office-header">
                      <h4>{{ selectedOffice ? selectedOffice.name : 'Oficina' }}</h4>
                    </div>

                    <div class="office-details">
                      <div class="office-item">
                        <span class="office-label">Dirección:</span>
                        <span class="office-value">{{ selectedOffice ? (selectedOffice.address || 'No disponible') : 'No disponible' }}</span>
                      </div>

                      <div class="office-item">
                        <span class="office-label">Teléfono:</span>
                        <span class="office-value">
                          {{ selectedOffice && selectedOffice.phone ? selectedOffice.phone : 'No disponible' }}
                          <i class="fab fa-whatsapp whatsapp-icon" v-if="selectedOffice && selectedOffice.phone && selectedOffice.phone !== 'No disponible'"></i>
                        </span>
                      </div>

                      <div class="office-item" v-if="selectedOffice && selectedOffice.horario && selectedOffice.id !== 'central'">
                        <span class="office-label">Horario:</span>
                        <span class="office-value">{{ selectedOffice.horario }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="error" class="error-message">{{ error }}</p>
              <div class="step-actions">
                <button type="button" class="continue-btn" @click="nextFromDelivery">Continuar >></button>
              </div>
            </div>

            <div v-else-if="step === 2" class="checkout-step">
              <div class="proof-section">
                <div class="proof-header"><h3>Facturación</h3></div>
                <div class="proof-description"><p>Elije entre boleta y factura.</p></div>
                <div class="proof-form">
                  <div class="proof-type-selection">
                    <div class="proof-option">
                      <input id="boleta" type="radio" value="boleta" v-model="proof.type" />
                      <label for="boleta" class="proof-label"><span>Boleta</span></label>
                    </div>
                    <div class="proof-option">
                      <input id="factura" type="radio" value="factura" v-model="proof.type" />
                      <label for="factura" class="proof-label"><span>Factura</span></label>
                    </div>
                  </div>
                  <div v-if="proof.type === 'boleta'" class="boleta-fields">
                    <div class="form-group">
                      <label>Documento</label>
                      <div class="input-with-icon">
                        <input v-model="proof.document" type="text" placeholder="Nro. de Documento" @input="onlyProofDocument" />
                        <i class="fas fa-list"></i>
                      </div>
                    </div>
                  </div>
                  <div v-else class="factura-fields">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nro. RUC</label>
                        <div class="input-with-icon"><input v-model="proof.ruc" type="text" placeholder="Número de RUC" maxlength="11" @input="onlyProofDigits" /><i class="fas fa-user"></i></div>
                      </div>
                      <div class="form-group">
                        <label>Razón Social</label>
                        <div class="input-with-icon"><input v-model="proof.razonSocial" type="text" placeholder="Razón Social" /><i class="fas fa-users"></i></div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Dirección Fiscal</label>
                      <div class="input-with-icon"><input v-model="proof.direccionFiscal" type="text" placeholder="Dirección Fiscal" /><i class="fas fa-map-marker-alt"></i></div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="error" class="error-message">{{ error }}</p>
              <div class="step-actions">
                <button type="button" class="continue-btn" @click="nextFromProof">Continuar >></button>
                <button type="button" class="back-btn" @click="goStep(1)">&lt;&lt; Regresar</button>
              </div>
            </div>

            <div v-else class="checkout-step">
              <div class="payment-card">
                <div class="payment-card-header"><h3>Método de Pago</h3></div>
                <div class="payment-card-content">
                  <div class="payment-instruction"><p>Selecciona tu método de pago preferido.</p></div>
                  <div class="payment-methods">
                    <div class="payment-method">
                      <input id="bank" type="radio" value="bank" v-model="payMethod" @change="selectPay('bank')" />
                      <label for="bank"><i class="fas fa-university"></i><span>{{ selectedMethod ? selectedMethod.name : 'Pago con Comprobante' }}</span></label>
                    </div>
                    <div v-if="payMethod === 'bank'" class="bank-options">
                      <div v-for="method in paymentMethods" :key="method.id" class="bank-option-card" :class="{ selected: selectedBank === method.id }" @click="selectedBank = method.id">
                        <span>{{ method.name }}</span>
                      </div>
                    </div>
                    <div class="payment-method">
                      <input id="credit-card" type="radio" value="credit-card" v-model="payMethod" @change="selectPay('credit-card')" />
                      <label for="credit-card"><i class="fas fa-credit-card"></i><span>Tarjeta de Crédito/Débito (Izipay)</span></label>
                    </div>
                    <div v-if="payMethod === 'credit-card'" class="izipay-container">
                      <div v-if="izipayLoading">Cargando pasarela de pago...</div>
                      <div v-else-if="izipayError" class="error-message">{{ izipayError }}</div>
                      <div v-else-if="izipayToken" class="kr-embedded" :kr-form-token="izipayToken">
                        <div class="kr-pan"></div>
                        <div class="kr-expiry"></div>
                        <div class="kr-security-code"></div>
                        <button class="kr-payment-button"></button>
                        <div class="kr-form-error"></div>
                      </div>
                    </div>
                    <div v-if="payMethod === 'bank' && selectedMethod" class="bank-info-card">
                      <div class="bank-info-item"><strong>Banco:</strong> {{ selectedMethod.name }}</div>
                      <div class="bank-info-item"><strong>Cuenta:</strong> {{ selectedMethod.account }}</div>
                      <div class="bank-info-item"><strong>Titular:</strong> {{ selectedMethod.holder }}</div>
                      <div class="bank-info-item"><strong>Tipo:</strong> {{ selectedMethod.type }}</div>
                      <div v-if="selectedMethod.cci" class="bank-info-item"><strong>CCI:</strong> {{ selectedMethod.cci }}</div>
                    </div>
                  </div>
                  <div v-if="payMethod === 'bank'" class="voucher-payment-fields">
                    <div class="form-field-simple">
                      <label>Número de Operación/Voucher</label>
                      <input v-model="voucherNumber" type="text" placeholder="Número de Operación/Voucher" @input="onlyVoucherNumber('voucherNumber', $event)" />
                    </div>
                    <div class="form-field-simple">
                      <label>Comprobante de Pago</label>
                      <div class="file-upload-simple">
                        <input id="voucher-file" type="file" accept="image/*" @change="onVoucher" />
                        <label for="voucher-file" class="file-label-simple">
                          <i class="fas fa-upload"></i>
                          <span>{{ voucherPreview ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                        </label>
                      </div>
                      <img v-if="voucherPreview" :src="voucherPreview" class="voucher-preview-img" alt="Comprobante" />
                    </div>
                    <div v-if="voucherPreview2" class="form-field-simple">
                      <label>Número de Operación/Voucher (Comprobante 2)</label>
                      <input v-model="voucherNumber2" type="text" placeholder="Número de Operación del segundo voucher" @input="onlyVoucherNumber('voucherNumber2', $event)" />
                    </div>
                    <div class="form-field-simple">
                      <label>Segundo Comprobante de Pago (opcional)</label>
                      <div class="file-upload-simple">
                        <input id="voucher-file-2" type="file" accept="image/*" @change="onVoucher2" />
                        <label for="voucher-file-2" class="file-label-simple">
                          <i class="fas fa-upload"></i>
                          <span>{{ voucherPreview2 ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                        </label>
                      </div>
                      <img v-if="voucherPreview2" :src="voucherPreview2" class="voucher-preview-img" alt="Segundo comprobante" />
                    </div>
                  </div>
                  <p v-if="error" class="error-message">{{ error }}</p>
                  <div class="step-actions">
                    <button type="button" class="back-btn" @click="goStep(2)">&lt;&lt; Volver</button>
                    <button v-if="payMethod === 'bank'" type="button" class="process-btn" :disabled="sending" @click="payWithBank">
                      <span v-if="!sending">Confirmar y Pagar</span>
                      <span v-else>Procesando...</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      buyer: { name: "", document: "", phone: "", email: "" },
      deliveryMethod: "delivery",
      offices: [],
      selectedPickupPoint: "",
      delivery: { address: "", department: "", province: "", district: "", agency: "" },
      proof: { type: "boleta", document: "", ruc: "", razonSocial: "", direccionFiscal: "" },
      voucherFile2: null,
      voucherPreview2: "",
      voucherNumber2: "",
      departments: [],
      provinces: [],
      districts: [],
      agencies: [],
      zone: null,
      paymentMethods: [],
      payMethod: "bank",
      selectedBank: "",
      voucherNumber: "",
      voucherFile: null,
      voucherPreview: "",
      sending: false,
      error: "",
      orderNumber: "",
      paidTotal: 0,
      izipayLoading: false,
      izipayError: "",
      izipayToken: "",
    };
  },
  computed: {
    needsAgency() {
      return !!this.delivery.department && this.delivery.department !== "lima";
    },
    selectedOffice() {
      if (!this.selectedPickupPoint) return null;
      return this.offices.find((office) => office.id == this.selectedPickupPoint) || null;
    },
    officeMapUrl() {
      if (!this.selectedOffice || !this.selectedOffice.googleMapsUrl) return "";
      return this.selectedOffice.googleMapsUrl;
    },
    goodsTotal() {
      return this.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.total || 0), 0);
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
    selectedMethod() {
      return this.paymentMethods.find((method) => method.id === this.selectedBank) || null;
    },
  },
  async mounted() {
    this.ownerId = this.$route.params.userId || "";
    try {
      const raw = sessionStorage.getItem("sifrah_store_cart_" + this.ownerId);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.items = [];
    }
    await this.loadDepartments();
    await this.loadPaymentMethods();
  },
  methods: {
    back() {
      this.$router.push("/tienda/" + this.ownerId);
    },
    onlyLetters(event) {
      this.buyer.name = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
    },
    onlyDigits(field, max) {
      this.buyer[field] = String(this.buyer[field] || "").replace(/\D/g, "").slice(0, max);
    },
    onlyProofDigits(event) {
      this.proof.ruc = event.target.value.replace(/\D/g, "").slice(0, 11);
    },
    onlyProofDocument(event) {
      this.proof.document = event.target.value.replace(/\D/g, "");
    },
    onlyVoucherNumber(field, event) {
      this[field] = event.target.value.replace(/\D/g, "");
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
        if (data && data.offices) {
          this.offices = data.offices;
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
          province: this.delivery.province,
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
    nextFromDelivery() {
      this.error = "";
      if (this.buyer.name.trim().length < 3) {
        return (this.error = this.deliveryMethod === "pickup" ? "Escribe el nombre de quien retira." : "Escribe el nombre de quien recibe.");
      }
      if (!/^\d{8}$/.test(this.buyer.document)) return (this.error = "El DNI debe tener 8 dígitos.");
      if (!/^\d{9}$/.test(this.buyer.phone)) return (this.error = "El celular debe tener 9 dígitos.");

      if (this.deliveryMethod === "pickup") {
        if (!this.selectedPickupPoint) return (this.error = "Selecciona un punto de entrega.");
      } else {
        if (this.delivery.address.trim().length < 5) return (this.error = "Escribe la dirección de entrega.");
        if (!this.delivery.department || !this.delivery.province || !this.delivery.district) {
          return (this.error = "Completa departamento, provincia y distrito.");
        }
        if (this.delivery.department === "lima" && !this.zone) {
          return (this.error = "Ese distrito no tiene cobertura de delivery.");
        }
        if (this.needsAgency && !this.delivery.agency) return (this.error = "Selecciona la agencia de transporte.");
      }

      if (!this.proof.document) this.proof.document = this.buyer.document;
      this.step = 2;
      window.scrollTo(0, 0);
    },
    goStep(step) {
      this.step = step;
      this.error = "";
      if (step < 3) this.izipayToken = "";
    },
    nextFromProof() {
      this.error = "";
      if (this.proof.type === "boleta" && !this.proof.document) {
        return (this.error = "Escribe el número de documento de la boleta.");
      }
      if (this.proof.type === "factura") {
        if (!/^\d{11}$/.test(this.proof.ruc)) return (this.error = "El RUC debe tener 11 dígitos.");
        if (this.proof.razonSocial.trim().length < 3) return (this.error = "Escribe la razón social.");
      }
      this.step = 3;
      window.scrollTo(0, 0);
    },
    selectPay(method) {
      this.payMethod = method;
      this.error = "";
      if (method === "credit-card") this.initIzipay();
    },
    onVoucher(event) {
      const file = event.target.files && event.target.files[0];
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        this.voucherFile = null;
        this.voucherPreview = "";
        this.error = "El comprobante debe ser una imagen.";
        return;
      }
      this.error = "";
      this.voucherFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.voucherPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    onVoucher2(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        this.voucherFile2 = null;
        this.voucherPreview2 = "";
        this.voucherNumber2 = "";
        return;
      }
      if (!file.type || file.type.indexOf("image/") !== 0) {
        this.error = "El comprobante debe ser una imagen.";
        return;
      }
      this.error = "";
      this.voucherFile2 = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.voucherPreview2 = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    payload(extra) {
      return {
        userId: this.ownerId,
        products: this.items.map((item) => ({ id: item.id, total: item.total })),
        buyer: this.buyer,
        delivery: this.delivery,
        proof: this.proof,
        shipping_method: this.deliveryMethod,
        office_id: this.deliveryMethod === "pickup" ? this.selectedPickupPoint : "",
        ...extra,
      };
    },
    async payWithBank() {
      this.error = "";
      if (!this.selectedMethod) return (this.error = "Selecciona el banco.");
      if (!this.voucherNumber.trim()) return (this.error = "Escribe el número de operación.");
      if (!this.voucherFile) return (this.error = "Sube la foto del comprobante.");
      if (this.voucherFile2 && !this.voucherNumber2.trim()) return (this.error = "Escribe el número del segundo comprobante.");
      this.sending = true;
      try {
        const voucher = await lib.upload(this.voucherFile, "tienda_" + Date.now() + "_" + this.voucherFile.name, "activations");
        let voucher2 = "";
        if (this.voucherFile2) {
          voucher2 = await lib.upload(this.voucherFile2, "tienda2_" + Date.now() + "_" + this.voucherFile2.name, "activations");
        }
        const { data } = await api.SharedStore.checkout(this.payload({
          pay_method: "bank",
          voucher,
          voucher_number: this.voucherNumber.trim(),
          voucher2,
          voucher_number2: this.voucherNumber2.trim(),
          bank: this.selectedMethod.name,
          bank_info: this.selectedMethod,
        }));
        if (!data || data.error) {
          this.error = (data && data.msg) || "No se pudo registrar el pedido.";
          return;
        }
        this.finish(data);
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.msg;
        this.error = msg || "No se pudo registrar el pedido.";
      } finally {
        this.sending = false;
      }
    },
    finish(data) {
      this.orderNumber = data.orderNumber || data.id;
      this.paidTotal = Number(data.total) || this.grandTotal;
      sessionStorage.removeItem("sifrah_store_cart_" + this.ownerId);
      window.scrollTo(0, 0);
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
      const form = document.querySelector(".checkout-unified-wrapper .kr-embedded");
      if (!form) return;
      if (typeof window.KR.setFormConfig === "function") {
        await window.KR.setFormConfig({ formToken: this.izipayToken });
      }
      if (typeof window.KR.onSubmit === "function") window.KR.onSubmit(this.onIzipaySuccess.bind(this));
      if (typeof window.KR.attachForm === "function") await window.KR.attachForm(form);
    },
    async initIzipay() {
      if (this.izipayToken || this.izipayLoading || this.grandTotal <= 0) return;
      this.izipayLoading = true;
      this.izipayError = "";
      try {
        const response = await axios.post("/app/izipay-token", {
          amount: this.grandTotal,
          email: this.buyer.email || "cliente@sifrah.com",
          orderId: "TIENDA-" + Date.now(),
          customerName: this.buyer.name || "Cliente",
        });
        if (!response.data || !response.data.formToken) {
          this.izipayError = "No se pudo cargar el pago con tarjeta.";
          return;
        }
        this.izipayToken = response.data.formToken;
        this.izipayLoading = false;
        await this.loadIzipayAssets();
        await this.attachIzipay();
      } catch (e) {
        this.izipayError = "No se pudo cargar el pago con tarjeta.";
      } finally {
        this.izipayLoading = false;
      }
    },
    async onIzipaySuccess(event) {
      if (!event.clientAnswer || event.clientAnswer.orderStatus !== "PAID") return false;
      const transaction = event.clientAnswer.transactions && event.clientAnswer.transactions[0];
      this.sending = true;
      this.error = "";
      try {
        const { data } = await api.SharedStore.checkout(this.payload({
          pay_method: "credit-card",
          transaction_id: transaction ? transaction.uuid : "",
          authorization_code: transaction ? transaction.authorizationCode : "",
        }));
        if (!data || data.error) this.error = (data && data.msg) || "El cobro se hizo, pero no se registró el pedido.";
        else this.finish(data);
      } catch (e) {
        this.error = "El cobro se hizo, pero no se registró el pedido.";
      } finally {
        this.sending = false;
      }
      return false;
    },
  },
};
</script>

<style lang="stylus" scoped>
@import '../../assets/style/views/app/Checkout.styl'
.store-checkout-page
  background #f7f7f8
  min-height 100vh
  padding 12px 0 40px
.error-message
  color #be123c
  font-weight 600
  margin 10px 0
</style>
