                                                                                                                                                                                                                                                                                                                                                                                  <template>
  <App>
    <!-- Título principal del checkout -->
    <div class="checkout-main-title">
      <h1>Checkout</h1>
    </div>
    
    <!-- Contenedor padre unificado para prevenir distorsión con zoom -->
    <div class="checkout-unified-wrapper">
      


      <div class="checkout-container">
        
          <div class="checkout-content">
            <!-- Columna izquierda - Resumen del carrito (oculto en escritorio, visible en móvil) -->
            <div class="cart-summary desktop-only">
              <!-- Título del carrito -->
              <div class="cart-title">
                <h2>Carrito de compras</h2>
                <p>Estos son los productos que has elegido</p>
              </div>
              
              <!-- Productos del carrito -->
              <div class="cart-items">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                  <div class="cart-item-image">
                    <img :src="item.img" :alt="item.name" />
                  </div>
                  <div class="cart-item-details">
                    <div class="cart-item-quantity">{{ item.total }} Unid.</div>
                    <div class="cart-item-name">{{ item.name }}</div>
                    <div class="cart-item-price">S/ {{ getProductPrice(item) }}</div>
                    <div class="cart-item-points">{{ item.points }} pts</div>
                  </div>
                </div>
                
                <!-- Card de Delivery integrada como producto -->
                <div v-if="deliveryZoneInfo && deliveryData.department === 'lima'" class="cart-item delivery-item">
                  <div class="delivery-item-icon">
                    🚚
                  </div>
                  <div class="cart-item-details">
                    <div class="cart-item-quantity">Delivery</div>
                    <div class="cart-item-price">S/ {{ deliveryZoneInfo.price.toFixed(2) }}</div>
                  </div>
                </div>

                <!-- Card para delivery por agencia (provincias) -->
                <div v-if="showAgencyField && deliveryData.department !== 'lima' && deliveryData.agency" class="cart-item delivery-item agency-item">
                  <div class="delivery-item-icon">
                    📦
                  </div>
                  <div class="cart-item-details">
                    <div class="cart-item-quantity">Envío</div>
                    <div class="cart-item-name">{{ getAgencyName() }}</div>
                    <div class="cart-item-price">Consultar costo</div>
                  </div>
                </div>
              </div>

              <!-- Resumen de la orden -->
              <div class="order-summary">
                <!-- En el paso 3 (pago), mostrar el diseño de transacción -->
                <div v-if="currentStep === 3" class="transaction-summary">
                  <div class="transaction-row">
                    <div class="transaction-item">
                      <span class="label">Concepto:</span>
                      <span class="value">Recompra</span>
                    </div>
                    <div class="transaction-item">
                      <span class="label">Fecha Compra:</span>
                      <span class="value">{{ currentDate }}</span>
                    </div>
                  </div>
                  <div class="transaction-row">
                    <div class="transaction-item">
                      <span class="label">Estado:</span>
                      <span class="value">Pendiente de Pago</span>
                    </div>
                    <div class="transaction-item">
                      <span class="label">Puntos:</span>
                      <span class="value">{{ orderSummaryPoints.toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="transaction-row total">
                    <div class="transaction-item">
                      <span class="label">Total:</span>
                      <span class="value">S/ {{ orderSummaryTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- En otros pasos, mantener el diseño original -->
                <div v-else>
                  <div class="summary-row">
                    <span>Total productos:</span>
                    <span>{{ cartItemsTotal }} items</span>
                  </div>
                  <div class="summary-row">
                    <span>Puntos:</span>
                    <span>{{ cartPoints.toFixed(2) }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>S/ {{ cartTotal.toFixed(2) }}</span>
                  </div>
                  <!-- Línea de delivery cuando hay zona seleccionada -->
                  <div v-if="deliveryZoneInfo && deliveryData.department === 'lima'" class="summary-row delivery-row">
                    <span>🚚 Delivery:</span>
                    <span>S/ {{ deliveryZoneInfo.price.toFixed(2) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total:</span>
                    <span>S/ {{ finalTotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Botón para volver a la tienda (solo en pasos 1 y 2) -->
              <div v-if="currentStep !== 3" class="return-to-store">
                <p>¿Olvidaste algún producto?</p>
                <button @click="returnToStore" class="return-btn">
                  Volver a la tienda
                </button>
              </div>
            </div>

            <!-- Columna derecha - Proceso de checkout -->
            <div class="checkout-process">

            <!-- Barra de progreso (visible solo en pasos 1 y 2) -->
            <div v-if="currentStep !== 3" class="top-progress-bar" :style="{ '--current-step': currentStep }">
              <div class="progress-step" :class="{ active: currentStep >= 1 }">
                <div class="step-number">1</div>
                <div class="step-label">Despacho</div>
              </div>
              <div class="progress-step" :class="{ active: currentStep >= 2 }">
                <div class="step-number">2</div>
                <div class="step-label">Facturación</div>
              </div>
              <div class="progress-step" :class="{ active: currentStep >= 3 }">
                <div class="step-number">3</div>
                <div class="step-label">Pago</div>
              </div>
            </div>

            <!-- Paso 1: Opciones de Despacho -->
            <div v-if="currentStep === 1" class="checkout-step">
              <!-- Opciones de Despacho -->
              <div class="delivery-options">
                <div class="delivery-header">
                  <h3>Opciones de Despacho</h3>
                </div>
                
                <div class="delivery-content">
                  <div class="delivery-description">
                    <p>Elije tu método de despacho preferido.</p>
                  </div>
                  
                  <div class="delivery-methods">
                    <button 
                      @click="selectDeliveryMethod('pickup')" 
                      :class="['delivery-method', { active: deliveryMethod === 'pickup' }]"
                    >
                      Retira tu Compra
                    </button>
                    <button 
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
                        <div class="input-with-icon">
                          <input v-model="deliveryData.recipientName" type="text" placeholder="Nombre Completo" @input="onlyLetters($event, 'deliveryData.recipientName')" required />
                          <i class="fas fa-user"></i>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Documento</label>
                        <div class="input-with-icon">
                          <input v-model="deliveryData.document" type="text" placeholder="Nro. de Documento" @input="onlyNumbers($event, 'deliveryData.document')" required />
                          <i class="fas fa-list"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Celular Receptor</label>
                      <div class="input-with-icon">
                        <input v-model="deliveryData.recipientPhone" type="tel" placeholder="Celular Receptor" @input="onlyNumbersPhone($event, 'deliveryData.recipientPhone')" maxlength="9" required />
                        <i class="fas fa-phone"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-section">
                    <h4>Ubicación de Entrega</h4>
                    
                    <div class="form-row">
                                              <div class="form-group department-field">
                          <label>Departamento</label>
                          <select v-model="deliveryData.department" class="form-select" @change="onDepartmentChange">
                            <option value="">Selecciona</option>
                            <option v-for="dept in availableDepartments" :key="dept.value" :value="dept.value">
                              {{ dept.name }}
                            </option>
                          </select>
                        </div>
                        
                        <div class="form-group province-field">
                          <label>Provincia</label>
                          <select v-model="deliveryData.province" class="form-select" @change="onProvinceChange">
                            <option value="">Selecciona</option>
                            <option v-for="province in availableProvinces" :key="province.value" :value="province.value">
                              {{ province.name }}
                            </option>
                          </select>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Distrito</label>
                        <select v-model="deliveryData.district" class="form-select district-select" @change="onDistrictChange">
                          <option value="">Selecciona</option>
                          <option v-for="district in availableDistricts" :key="district.value" :value="district.value">
                            {{ district.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    
                    <!-- Campo de Agencia (solo para envíos fuera de Lima) -->
                    <div v-if="showAgencyField" class="form-section agency-section">
                      <h4>Agencia de Transporte</h4>
                      <div class="form-group">
                        <label>Agencia</label>
                        <select v-model="deliveryData.agency" class="form-select agency-select">
                          <option value="">Seleccione el PDE</option>
                          <option v-for="agency in availableAgencies" :key="agency._id" :value="agency.agency_code">
                            {{ agency.agency_name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    

                    
                    <div v-if="showAgencyField" class="delivery-note">
                      <p>💡 El costo de envío varía según la agencia y destino. Consulta directamente con la agencia seleccionada.</p>
                    </div>
                </div>
                
                <!-- Formulario de Pickup -->
                <div v-if="deliveryMethod === 'pickup'" class="pickup-form">
                  <div class="pickup-section">
                    <h4>Seleccione el PDE</h4>
                    <select v-model="selectedPickupPoint" class="pickup-select" @change="onPickupPointChange">
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
                        <span class="office-value">{{ selectedOffice ? selectedOffice.address : 'No disponible' }}</span>
                      </div>

                      <div class="office-item">
                        <span class="office-label">Teléfono:</span>
                        <span class="office-value">{{ selectedOffice ? selectedOffice.phone : 'No disponible' }}</span>
                      </div>

                      <div class="office-item" v-if="selectedOffice && selectedOffice.horario && selectedOffice.id !== 'central'">
                        <span class="office-label">Horario:</span>
                        <span class="office-value">{{ selectedOffice.horario }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón continuar -->
              <div class="step-actions">
                <button 
                  @click="nextStep" 
                  :disabled="!canProceedToNextStep"
                  class="continue-btn"
                >
                  Continuar >>
                </button>
              </div>
            </div>

            <!-- Paso 2: Facturación -->
            <div v-if="currentStep === 2" class="checkout-step">
              <div class="proof-section">
                <div class="proof-header">
                  <h3>Facturación</h3>
                </div>
                <div class="proof-description">
                  <p>Elije entre boleta y factura.</p>
                </div>
                
                <div class="proof-form">
                  <!-- Selección de tipo de comprobante -->
                  <div class="proof-type-selection">
                    <div class="proof-option">
                      <input 
                        type="radio" 
                        id="boleta" 
                        name="proofType" 
                        value="boleta"
                        v-model="proofData.type"
                      />
                      <label for="boleta" class="proof-label">
                        <span>Boleta</span>
                      </label>
                    </div>
                    
                    <div class="proof-option">
                      <input 
                        type="radio" 
                        id="factura" 
                        name="proofType" 
                        value="factura"
                        v-model="proofData.type"
                      />
                      <label for="factura" class="proof-label">
                        <span>Factura</span>
                      </label>
                    </div>
                  </div>
                  
                  <!-- Campo de documento (solo para boleta) -->
                  <div v-if="proofData.type === 'boleta'" class="boleta-fields">
                    <div class="form-group">
                      <label>Documento</label>
                      <div class="input-with-icon">
                        <input v-model="proofData.document" type="text" placeholder="Nro. de Documento" @input="onlyNumbers($event, 'proofData.document')" required />
                        <i class="fas fa-list"></i>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Campos para factura -->
                  <div v-if="proofData.type === 'factura'" class="factura-fields">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nro. RUC</label>
                        <div class="input-with-icon">
                          <input v-model="proofData.ruc" type="text" placeholder="Número de RUC" @input="onlyNumbersRUC($event, 'proofData.ruc')" maxlength="11" required />
                          <i class="fas fa-user"></i>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Razón Social</label>
                        <div class="input-with-icon">
                          <input v-model="proofData.razonSocial" type="text" placeholder="Razón Social" required />
                          <i class="fas fa-users"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Dirección Fiscal</label>
                      <div class="input-with-icon">
                        <input v-model="proofData.direccionFiscal" type="text" placeholder="Dirección Fiscal" required />
                        <i class="fas fa-map-marker-alt"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botones de navegación -->
              <div class="step-actions">
                <button 
                  @click="nextStep" 
                  :disabled="!canProceedToProofStep"
                  class="continue-btn"
                >
                  Continuar >>
                </button>
                <button @click="previousStep" class="back-btn">
                  << Regresar
                </button>
              </div>
            </div>

            <!-- Paso 3: Pago -->
            <div v-if="currentStep === 3" class="checkout-step">
              <div class="three-cards-container">
                <!-- Card 1: Datos de Despacho -->
                <div class="delivery-data-card">
                  <div class="delivery-data-header">
                    <h3>Datos de Despacho</h3>
                  </div>
                  
                  <div class="delivery-data-content">
                    <!-- Información de Pickup -->
                    <div v-if="deliveryMethod === 'pickup' && selectedOffice">
                      <div class="delivery-info-item">
                        <span class="delivery-label">Recojo en:</span>
                        <span class="delivery-value">{{ selectedOffice.name }}</span>
                      </div>
                      <div class="delivery-info-item">
                        <span class="delivery-label">Dirección:</span>
                        <span class="delivery-value">{{ selectedOffice.address }}</span>
                      </div>
                      <div class="delivery-info-item">
                        <span class="delivery-label">Teléfono:</span>
                        <span class="delivery-value">
                          +51 {{ selectedOffice.phone }}
                          <i class="fab fa-whatsapp whatsapp-icon" v-if="selectedOffice.phone && selectedOffice.phone !== 'No disponible'"></i>
                        </span>
                      </div>
                      <div class="delivery-info-item" v-if="selectedOffice.horario && selectedOffice.id !== 'central'">
                        <span class="delivery-label">Horario:</span>
                        <span class="delivery-value">{{ selectedOffice.horario }}</span>
                      </div>
                      <div class="delivery-info-item" v-if="officeMapUrl">
                        <a
                          :href="officeMapUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="map-link"
                        >
                          {{ officeMapUrl }}
                        </a>
                      </div>
                    </div>
                    
                    <!-- Información de Delivery -->
                    <div v-if="deliveryMethod === 'delivery'">
                      <div class="delivery-info-item">
                        <span class="delivery-label">Receptor:</span>
                        <span class="delivery-value">{{ deliveryData.recipientName }}</span>
                      </div>
                      <div class="delivery-info-item">
                        <span class="delivery-label">Documento:</span>
                        <span class="delivery-value">{{ deliveryData.document }}</span>
                      </div>
                      <div class="delivery-info-item">
                        <span class="delivery-label">Celular:</span>
                        <span class="delivery-value">{{ deliveryData.recipientPhone }}</span>
                      </div>
                      <div class="delivery-info-item">
                        <span class="delivery-label">Ubicación:</span>
                        <span class="delivery-value">
                          {{ getLocationString() }}
                        </span>
                      </div>
                      <div v-if="showAgencyField && deliveryData.agency" class="delivery-info-item">
                        <span class="delivery-label">Agencia:</span>
                        <span class="delivery-value">{{ getAgencyName() }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card 2: Datos del Comprobante -->
                <div class="voucher-data-card">
                  <div class="voucher-data-header">
                    <h3>Datos del Comprobante</h3>
                  </div>
                  
                  <div class="voucher-data-content">
                    <div class="voucher-row-three">
                      <div class="voucher-info-item third-width">
                        <span class="voucher-label">Tipo Documento:</span>
                        <span class="voucher-value">{{ proofData.type === 'factura' ? 'Factura' : 'Boleta' }}</span>
                      </div>
                      <div class="voucher-info-item third-width">
                        <span class="voucher-label">Serie:</span>
                        <span class="voucher-value">---</span>
                      </div>
                      <div class="voucher-info-item third-width">
                        <span class="voucher-label">Correlativo:</span>
                        <span class="voucher-value">---</span>
                      </div>
                    </div>
                    <div class="voucher-info-item">
                      <span class="voucher-label">{{ proofData.type === 'factura' ? 'Nro. RUC:' : 'Nro. Documento:' }}</span>
                      <span class="voucher-value">{{ proofData.type === 'factura' ? (proofData.ruc || '---') : (proofData.document || '---') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Card 3: Método de Pago y Resumen -->
                <div class="payment-card">
                  <div class="payment-card-header">
                    <h3>Método de Pago</h3>
                  </div>
                  
                  <div class="payment-card-content">
                    <div class="payment-instruction">
                      <p>Selecciona tu método de pago preferido.</p>
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
                      <span class="balance-amount">S/ {{ balance.toFixed(2) }}</span>
                    </div>
                    <div class="balance-item">
                      <span>Saldo no disponible:</span>
                      <span class="balance-amount">S/ {{ _balance.toFixed(2) }}</span>
                    </div>
                    <div v-if="remaining > 0" class="balance-item remaining">
                      <span>Restante a pagar:</span>
                      <span class="balance-amount">S/ {{ remaining.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <div v-show="needsExternalPayment" class="payment-methods">
                  <div class="payment-method">
                    <input 
                      type="radio" 
                      id="bank" 
                      name="payment" 
                      value="bank"
                      v-model="pay_method"
                      @click="togglePaymentMethod('bank')"
                    />
                    <label for="bank">
                      <i class="fas fa-university"></i>
                      <span>{{ selectedBank ? getBankDisplayName(selectedBank) : 'Pago con Comprobante' }}</span>
                      <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': showBankOptions }"></i>
                    </label>
                  </div>
                  
                  <!-- Opciones desplegables para Pago con Comprobante -->
                  <div v-if="pay_method === 'bank' && showBankOptions" class="bank-options">
                    <div v-if="loadingPaymentMethods" class="loading-methods">
                      <span>Cargando métodos de pago...</span>
                    </div>
                    <div v-else-if="paymentMethods.length === 0" class="no-methods">
                      <span>No hay métodos de pago disponibles</span>
                    </div>
                    <div 
                      v-else
                      v-for="method in paymentMethods" 
                      :key="method.id"
                      class="bank-option-card" 
                      @click="selectBankOption(method.id)" 
                      :class="{ 'selected': selectedBank === method.id }"
                    >
                      <span>{{ method.name }}</span>
                    </div>
                  </div>
                  
                  <div class="payment-method">
                    <input 
                      type="radio" 
                      id="credit-card" 
                      name="payment" 
                      value="credit-card"
                      v-model="pay_method"
                      @click="togglePaymentMethod('credit-card')"
                    />
                    <label for="credit-card">
                      <i class="fas fa-credit-card"></i>
                      <span>Tarjeta de Crédito/Débito (Izipay)</span>
                    </label>
                  </div>
                  
                  <!-- Contenedor Izipay -->
                  <div v-if="pay_method === 'credit-card'" class="izipay-container" style="margin-top: 15px; text-align: center;">
                    <div v-if="izipayLoading" style="padding: 20px;">
                      <i class="fas fa-spinner fa-spin"></i> Cargando pasarela de pago...
                    </div>
                    <div v-else-if="izipayError" style="color: red; padding: 20px; font-size: 14px;">
                      {{ izipayError }}
                    </div>
                    <div v-else-if="izipayFormToken" class="kr-embedded" :kr-form-token="izipayFormToken">
                      <div class="kr-pan"></div>
                      <div class="kr-expiry"></div>
                      <div class="kr-security-code"></div>
                      <button class="kr-payment-button"></button>
                      <div class="kr-form-error"></div>
                    </div>
                  </div>
                  
                  <!-- Información del banco seleccionado -->
                  <div v-if="pay_method === 'bank' && selectedBank" class="bank-info-card">
                    <div class="bank-info-item">
                      <strong>Banco:</strong> {{ getBankInfo(selectedBank).name }}
                    </div>
                    <div class="bank-info-item">
                      <strong>Cuenta:</strong> {{ getBankInfo(selectedBank).account }}
                    </div>
                    <div class="bank-info-item">
                      <strong>Titular:</strong> {{ getBankInfo(selectedBank).holder }}
                    </div>
                    <div class="bank-info-item">
                      <strong>Tipo:</strong> {{ getBankInfo(selectedBank).type }}
                    </div>
                    <div v-if="getBankInfo(selectedBank).cci" class="bank-info-item">
                      <strong>CCI:</strong> {{ getBankInfo(selectedBank).cci }}
                    </div>
                  </div>
                  
                </div>
                
                
                <!-- Campos de Pago con Comprobante - Fuera del contenedor de métodos -->
                <div v-if="needsExternalPayment && pay_method === 'bank'" class="voucher-payment-fields">
                  <!-- Comprobante 1 -->
                  <div class="form-field-simple">
                    <label>Número de Operación/Voucher</label>
                    <input v-model="voucherNumber" type="text" placeholder="Número de Operación/Voucher" @input="onlyNumbers($event, 'voucherNumber')" required />
                  </div>

                  <div class="form-field-simple">
                    <label>Comprobante de Pago</label>
                    <div class="file-upload-simple">
                      <input type="file" accept="image/*" @change="onVoucherFileChange" id="voucher-file" />
                      <label for="voucher-file" class="file-label-simple">
                        <i class="fas fa-upload"></i>
                        <span>{{ voucherPreview ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                      </label>
                    </div>
                    <img v-if="voucherPreview" :src="voucherPreview" class="voucher-preview-img" />
                  </div>

                  <!-- Número de operación del segundo voucher: se genera al subir el segundo comprobante.
                       Se muestra ARRIBA de su comprobante para mantener el mismo orden que el primero. -->
                  <div v-if="voucherPreview2" class="form-field-simple">
                    <label>Número de Operación/Voucher (Comprobante 2)</label>
                    <input v-model="voucherNumber2" type="text" placeholder="Número de Operación del segundo voucher" @input="onlyNumbers($event, 'voucherNumber2')" required />
                  </div>

                  <!-- Comprobante 2 (opcional). Al agregarlo, se exige su propio número de operación -->
                  <div class="form-field-simple">
                    <label>Segundo Comprobante de Pago (opcional)</label>
                    <div class="file-upload-simple">
                      <input type="file" accept="image/*" @change="onVoucherFileChange2" id="voucher-file-2" />
                      <label for="voucher-file-2" class="file-label-simple">
                        <i class="fas fa-upload"></i>
                        <span>{{ voucherPreview2 ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                      </label>
                    </div>
                    <img v-if="voucherPreview2" :src="voucherPreview2" class="voucher-preview-img" />
                  </div>
                </div>
                
                <!-- Mensajes de estado de activación -->
                <div v-if="activationError" class="error-message">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>{{ activationError }}</span>
                </div>
                <div v-if="activationSuccess" class="success-message">
                  <i class="fas fa-check-circle"></i>
                  <span>¡Orden enviada exitosamente!</span>
                </div>

                    <!-- Botones finales -->
                    <div class="step-actions">
                      <button @click="previousStep" class="back-btn">
                        << Volver
                      </button>
                      <button 
                        @click="processOrder" 
                        :disabled="!canProcessOrder || sending"
                        class="process-btn"
                      >
                        <span v-if="!sending">Confirmar y Pagar</span>
                        <span v-else><i class="fas fa-spinner fa-spin"></i> Procesando...</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de confirmación -->
      <div v-if="showConfirmation" class="confirmation-modal">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-check-circle"></i>
            <h3>¡Orden Confirmada!</h3>
          </div>
          <div class="modal-body">
            <p>Tu orden ha sido procesada exitosamente.</p>
            <p>Número de orden: <strong>{{ orderNumber }}</strong></p>
            <p>Te enviaremos un email con los detalles de tu compra.</p>
          </div>
          <div class="modal-actions">
            <button @click="goToDashboard" class="dashboard-btn">
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
      
    </div> <!-- Cierre del checkout-unified-wrapper -->
  </App>
</template>

  <script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";
import axios from "axios";
import { mapState } from 'vuex';

export default {
  name: 'Checkout',
  components: {
    App
  },
  data() {
    return {
      currentStep: 1,
      deliveryMethod: 'pickup',
      selectedPickupPoint: '',
      pay_method: "",
      showConfirmation: false,
      orderNumber: '',
      /** Totales congelados al confirmar (el carrito se vacía y finalTotal pasaría a 0) */
      confirmedOrderTotal: null,
      confirmedCartPoints: null,
      
      // Datos de facturación
      billingData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: ''
      },
      
      // Datos de delivery
      deliveryData: {
        recipientName: '',
        document: '',
        recipientPhone: '',
        department: '',
        province: '',
        district: '',
        agency: ''
      },
      
      // Datos del comprobante
      proofData: {
        type: 'boleta',
        document: '',
        ruc: '',
        razonSocial: '',
        direccionFiscal: ''
      },
      
      // Oficinas disponibles para recogida
      offices: [],
      
      // Delivery zones y agencies
      availableAgencies: [],
      deliveryZoneInfo: null,
      
      // Datos geográficos dinámicos (cargados desde DB)
      availableDepartments: [],
      availableProvinces: [],
      availableDistricts: [],
      
      // Intervalo para actualización automática
      officesUpdateInterval: null,
      
      // Datos del usuario (simulados)
      userBalance: 150.00,
      
      // Nuevos datos para el saldo
      check: false, // Controla si se usa el saldo
      balance: 0,   // Saldo disponible
      _balance: 0,  // Saldo no disponible
      // remaining: 0, // El restante a pagar se calculará en una propiedad computada
      // Datos para la subida de activación
      sending: false,
      voucherFile: null,
      voucherPreview: null,
      voucherFile2: null,
      voucherPreview2: null,
      bankName: '',
      paymentDate: '',
      voucherNumber: '',
      voucherNumber2: '',
      // Variables para el desplegable de bancos
      showBankOptions: false,
      selectedBank: '',
      activationError: null,
      activationSuccess: false,
      // Métodos de pago dinámicos
      paymentMethods: [],
      loadingPaymentMethods: false,
      
      // Izipay variables
      izipayFormToken: null,
      izipayLoading: false,
      izipayError: null,
      izipayTransactionId: null,
      izipayAuthorizationCode: null
    }
  },
  
  computed: {
    // Obtener productos del carrito desde el store o props
    cartItems() {
      return this.$store.state.cartItems || [];
    },
    
    cartTotal() {
      // Si es checkout de afiliación, usar el precio total del plan
      if (this.$store.state.isAffiliationCheckout && this.$store.state.affiliationTotal !== null) {
        return this.$store.state.affiliationTotal;
      }
      return this.cartItems.reduce((sum, item) => 
        sum + this.getProductPrice(item) * item.total, 0);
    },
    
    cartPoints() {
      // Si es checkout de afiliación, usar los puntos del plan
      if (this.$store.state.isAffiliationCheckout && this.$store.state.affiliationPoints !== null) {
        return this.$store.state.affiliationPoints;
      }
      return this.cartItems.reduce((sum, item) => 
        sum + item.points * item.total, 0);
    },
    
    cartItemsTotal() {
      return this.cartItems.reduce((sum, item) => sum + item.total, 0);
    },
    
    finalTotal() {
      let total = this.cartTotal;
      // Agregar costo de delivery para Lima
      if (this.deliveryZoneInfo && this.deliveryData.department === 'lima') {
        total += this.deliveryZoneInfo.price;
      }
      return total;
    },
    
    // Propiedad computada para el monto restante a pagar después de aplicar el saldo
    remaining() {
      if (this.check) {
        const saldoTotal = (this.balance || 0) + (this._balance || 0);
        let ret = this.finalTotal - saldoTotal;
        return ret > 0 ? ret : 0;
      } else {
        return this.finalTotal;
      }
    },
    
    canProceedToNextStep() {
      if (this.currentStep === 1) {
        if (this.deliveryMethod === 'delivery') {
          const basicInfo = this.deliveryData.recipientName && 
                           this.deliveryData.document && 
                           this.deliveryData.document.length > 0 &&
                           this.deliveryData.recipientPhone &&
                           this.deliveryData.department &&
                           this.deliveryData.province &&
                           this.deliveryData.district;
          
          if (this.showAgencyField) {
            return basicInfo && this.deliveryData.agency;
          }
          
          return basicInfo;
        }
        return this.deliveryMethod && this.selectedPickupPoint;
      }
      if (this.currentStep === 2) {
        // Para boleta solo requiere documento (números, sin límite de longitud)
        if (this.proofData.type === 'boleta') {
          return !!this.proofData.document && this.proofData.document.length > 0;
        }
        // Para factura requiere RUC con exactamente 11 números, Razón Social y Dirección Fiscal
        if (this.proofData.type === 'factura') {
          return this.proofData.ruc && 
                 this.proofData.ruc.length === 11 &&
                 this.proofData.razonSocial && 
                 this.proofData.direccionFiscal;
        }
        return false;
      }
      return true;
    },
    
    showAgencyField() {
      // Mostrar agencia si el departamento NO es lima O la provincia NO es lima
      return (this.deliveryData.department && this.deliveryData.department !== 'lima') ||
             (this.deliveryData.province && this.deliveryData.province !== 'lima');
    },
    

    
    canProceedToProofStep() {
      // Para boleta solo requiere documento (números, sin límite de longitud)
      if (this.proofData.type === 'boleta') {
        return !!this.proofData.document && this.proofData.document.length > 0;
      }
      // Para factura requiere RUC con exactamente 11 números, Razón Social y Dirección Fiscal
      if (this.proofData.type === 'factura') {
        return this.proofData.ruc && 
               this.proofData.ruc.length === 11 &&
               this.proofData.razonSocial && 
               this.proofData.direccionFiscal;
      }
      return false;
    },
    
    canProcessOrder() {
      if (this.cartItems.length === 0) return false;
      if (!this.needsExternalPayment) return true;
      if (!this.pay_method) return false;

      // Pago por transferencia: voucher 1 con su número de operación obligatorios
      if (this.pay_method === 'bank') {
        if (!this.voucherNumber || !this.voucherFile) return false;
        // Si se agregó un segundo comprobante, su número de operación es obligatorio
        if (this.voucherFile2 && !this.voucherNumber2) return false;
      }

      return true;
    },

    needsExternalPayment() {
      return !this.check || this.remaining > 0;
    },
    
    selectedOffice() {
      if (!this.selectedPickupPoint) return null;
      return this.offices.find(office => office.id == this.selectedPickupPoint);
    },

    officeMapUrl() {
      const office = this.selectedOffice;
      if (!office) return null;
      if (office.googleMapsUrl && office.googleMapsUrl.trim()) {
        return office.googleMapsUrl;
      }
      const address = office.address;
      if (address && address !== 'Dirección no disponible' && address !== 'hola') {
        return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
      }
      return null;
    },
    
    // Obtener el DNI del usuario desde el store
    userDNI() {
      return this.$store.state.dni || '';
    },
    
    hasDeliveryInfo() {
      return this.deliveryMethod === 'delivery' && 
             ((this.deliveryZoneInfo && this.deliveryData.department === 'lima') ||
              (this.deliveryData.agency && this.deliveryData.department !== 'lima'));
    },
    
    currentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    orderSummaryTotal() {
      if (
        (this.showConfirmation || this.activationSuccess) &&
        this.confirmedOrderTotal != null
      ) {
        return this.confirmedOrderTotal;
      }
      return this.finalTotal;
    },

    orderSummaryPoints() {
      if (
        (this.showConfirmation || this.activationSuccess) &&
        this.confirmedCartPoints != null
      ) {
        return this.confirmedCartPoints;
      }
      return this.cartPoints;
    },
  },
  
  methods: {
    // Método para toggle de métodos de pago - permite desmarcar al hacer clic nuevamente
    togglePaymentMethod(method) {
      if (this.pay_method === method) {
        // Si ya está seleccionado, deseleccionar
        this.pay_method = '';
        this.showBankOptions = false;
        this.selectedBank = '';
      } else {
        // Si no está seleccionado, seleccionar
        this.pay_method = method;
        if (method === 'bank') {
          this.showBankOptions = true;
        } else {
          this.showBankOptions = false;
          this.selectedBank = '';
        }
        
        if (method === 'credit-card') {
          this.initIzipay();
        }
      }
      
    },
    
    async initIzipay() {
      if (this.izipayFormToken) return; // Ya generado
      this.izipayLoading = true;
      this.izipayError = null;
      
      try {
        const orderId = `ORDER-${Date.now()}`;
        const amount = this.finalTotal; // Total a pagar de la compra actual
        const email = this.billingData.email || (this.$store.state.user ? this.$store.state.user.email : null) || 'cliente@sifrah.com';
        
        const response = await axios.post('/app/izipay-token', {
          amount,
          email,
          orderId,
          customerName: this.billingData.firstName || (this.$store.state.user ? this.$store.state.user.name : null) || 'Cliente'
        });
        
        this.izipayFormToken = response.data.formToken;
        
        const attachForm = async () => {
          await this.$nextTick();
          if (window.KR) {
            try {
              if (typeof window.KR.setFormConfig === "function") {
                await window.KR.setFormConfig({ formToken: this.izipayFormToken });
              }
              if (typeof window.KR.onSubmit === "function") {
                window.KR.onSubmit(this.onIzipaySuccess);
              }
              if (typeof window.KR.attachForm === "function") {
                const formElement = document.querySelector('.kr-embedded');
                if (formElement) {
                  await window.KR.attachForm(formElement);
                }
              }
            } catch (err) {
              console.error("Error attach Izipay:", err);
            }
          }
        };

        // Cargar script de Izipay si no existe
        if (!document.getElementById('izipay-script')) {
          const script = document.createElement('script');
          script.id = 'izipay-script';
          script.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
          script.setAttribute('kr-public-key', '33003249:publickey_yekT6W03reoGaKT2dSrjdzE0oBJ2a7X2seEsnusIcExSO');
          script.setAttribute('kr-post-url-success', 'javascript:void(0);');
          
          document.head.appendChild(script);
          
          const style = document.createElement('link');
          style.rel = 'stylesheet';
          style.href = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css';
          document.head.appendChild(style);
          
          const scriptTheme = document.createElement('script');
          scriptTheme.src = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js';
          document.head.appendChild(scriptTheme);
          
          script.onload = () => {
            attachForm();
          };
        } else {
          attachForm();
        }
        
      } catch (err) {
        console.error('Error al generar token Izipay:', err);
        this.izipayError = 'Ocurrió un error al cargar la pasarela de pago.';
      } finally {
        this.izipayLoading = false;
      }
    },
    
    onIzipaySuccess(event) {
      if (event.clientAnswer.orderStatus === 'PAID') {
        const transaction = event.clientAnswer.transactions && event.clientAnswer.transactions[0];
        this.izipayTransactionId = transaction ? transaction.uuid : null;
        this.izipayAuthorizationCode = transaction ? transaction.authorizationCode : null;
        // Lanzar la activación del lado del sistema local
        this.submitActivation();
      }
      return false; // Prevenir redirección POST estándar
    },
    
    selectBankOption(bank) {
      this.selectedBank = bank;
      this.showBankOptions = false; // Cerrar el desplegable al seleccionar
    },
    
    getBankDisplayName(bankId) {
      const method = this.paymentMethods.find(m => m.id === bankId);
      return method ? method.name : 'Pago con Comprobante';
    },
    
    getBankInfo(bankId) {
      const method = this.paymentMethods.find(m => m.id === bankId);
      if (method) {
        return {
          name: method.name,
          account: method.account,
          holder: method.holder,
          type: method.type,
          cci: method.cci || ""
        };
      }
      return {};
    },
    
    getAgencyName() {
      // Buscar el nombre de la agencia seleccionada
      if (this.availableAgencies && this.deliveryData.agency) {
        const agency = this.availableAgencies.find(a => a.agency_id === this.deliveryData.agency || a._id === this.deliveryData.agency);
        return agency ? agency.agency_name : this.deliveryData.agency;
      }
      return this.deliveryData.agency || 'Agencia seleccionada';
    },
    
    getLocationString() {
      // Crear string legible de la ubicación de delivery
      const parts = [];
      if (this.deliveryData.district) parts.push(this.deliveryData.district);
      if (this.deliveryData.province) parts.push(this.deliveryData.province);
      if (this.deliveryData.department) parts.push(this.deliveryData.department);
      return parts.join(', ') || 'Ubicación no especificada';
    },
    
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
      return product.price || 0;
    },
    
    onlyNumbers(event, fieldPath) {
      // Remover todos los caracteres que no sean números
      const value = event.target.value.replace(/[^0-9]/g, '');
      event.target.value = value;
      
      // Actualizar el modelo de datos
      const pathParts = fieldPath.split('.');
      if (pathParts.length === 2) {
        this[pathParts[0]][pathParts[1]] = value;
      } else {
        this[fieldPath] = value;
      }
    },
    
    onlyNumbersDocument(event, fieldPath) {
      // Remover todos los caracteres que no sean números y limitar a 8 dígitos
      let value = event.target.value.replace(/[^0-9]/g, '');
      
      // Limitar a máximo 8 dígitos
      if (value.length > 8) {
        value = value.substring(0, 8);
      }
      
      event.target.value = value;
      
      // Actualizar el modelo de datos
      const pathParts = fieldPath.split('.');
      if (pathParts.length === 2) {
        this[pathParts[0]][pathParts[1]] = value;
      }
    },
    
    onlyNumbersPhone(event, fieldPath) {
      // Remover todos los caracteres que no sean números y limitar a 9 dígitos
      let value = event.target.value.replace(/[^0-9]/g, '');
      
      // Limitar a máximo 9 dígitos
      if (value.length > 9) {
        value = value.substring(0, 9);
      }
      
      event.target.value = value;
      
      // Actualizar el modelo de datos
      const pathParts = fieldPath.split('.');
      if (pathParts.length === 2) {
        this[pathParts[0]][pathParts[1]] = value;
      }
    },
    
    onlyLetters(event, fieldPath) {
      // Remover todos los caracteres que no sean letras, espacios o acentos
      let value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      
      event.target.value = value;
      
      // Actualizar el modelo de datos
      const pathParts = fieldPath.split('.');
      if (pathParts.length === 2) {
        this[pathParts[0]][pathParts[1]] = value;
      }
    },
    
    onlyNumbersRUC(event, fieldPath) {
      // Remover todos los caracteres que no sean números y limitar a 11 dígitos
      let value = event.target.value.replace(/[^0-9]/g, '');
      
      // Limitar a máximo 11 dígitos
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      
      event.target.value = value;
      
      // Actualizar el modelo de datos
      const pathParts = fieldPath.split('.');
      if (pathParts.length === 2) {
        this[pathParts[0]][pathParts[1]] = value;
      }
    },
    
    selectDeliveryMethod(method) {
      this.deliveryMethod = method;
      if (method === 'delivery') {
        this.selectedPickupPoint = '';
      }
    },
    
    async onDepartmentChange() {
      
      // Resetear campos dependientes
      this.deliveryData.province = '';
      this.deliveryData.district = '';
      this.deliveryData.agency = '';
      this.deliveryZoneInfo = null; // Asegurar que deliveryZoneInfo se resetea
      this.availableProvinces = [];
      this.availableDistricts = [];
      this.availableAgencies = []; // Asegurar que las agencias se reseteen al cambiar de departamento
      
      if (!this.deliveryData.department) return;
      
      // 1. Cargar provincias para el departamento
      await this.loadProvincesForDepartment(this.deliveryData.department);
      
      // 2. Si no es Lima, cargar agencias
      if (this.deliveryData.department !== 'lima') {
        await this.loadAgenciesForDepartment(this.deliveryData.department);
      }
    },
    
    async onProvinceChange() {
      
      // Resetear campos dependientes
      this.deliveryData.district = '';
      this.deliveryZoneInfo = null;
      this.availableDistricts = [];
      
      if (!this.deliveryData.department || !this.deliveryData.province) return;
      
      // Cargar distritos para departamento + provincia
      await this.loadDistrictsForProvince(this.deliveryData.department, this.deliveryData.province);
    },
    
    async onDistrictChange() {
      
      // Reset zona info
      this.deliveryZoneInfo = null;
      
      if (!this.deliveryData.district) return;
      
      // Si es Lima, buscar zona de delivery
      if (this.deliveryData.department === 'lima') {
        await this.loadZoneForDistrict(this.deliveryData.district);
      }
    },
    
    // Método helper para scroll hacia arriba
    scrollToTop() {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    },
    
    nextStep() {
      if (this.canProceedToNextStep && this.currentStep < 3) {
        this.currentStep++;
        // Scroll hacia arriba cuando cambia de paso
        this.$nextTick(() => {
          this.scrollToTop();
        });
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        // Scroll hacia arriba cuando cambia de paso
        this.$nextTick(() => {
          this.scrollToTop();
        });
      }
    },
    
    returnToStore() {
      // Si es checkout de afiliación, regresar a affiliation, sino a activation
      const isAffiliation = this.$store.state.isAffiliationCheckout;
      if (isAffiliation) {
        this.$store.commit('clearAffiliationCheckout');
        this.$router.push('/affiliation');
      } else {
        this.$router.push('/activation');
      }
    },
    
    processOrder() {
      if (!this.canProcessOrder) return;

      this.submitActivation();
    },
    
    goToDashboard() {
      this.showConfirmation = false;
      this.confirmedOrderTotal = null;
      this.confirmedCartPoints = null;
      // Limpiar estado de afiliación al ir al dashboard
      this.$store.commit('clearAffiliationCheckout');
      this.$router.push('/dashboard');
    },

    async refreshWalletFromServer(session) {
      try {
        const { data } = await api.Activation.GET(session);
        if (data) {
          this.balance = data.balance || 0;
          this._balance = data._balance || 0;
          this.$store.commit('SET_BALANCE', this.balance);
          this.$store.commit('SET__BALANCE', this._balance);
        }
      } catch (e) {
        console.warn('No se pudo refrescar el saldo:', e);
      }
    },
    
    async loadOffices() {
      try {
        // Verificar si api.Offices existe antes de usarlo
        if (api.Offices && api.Offices.GET) {
          const { data } = await api.Offices.GET();
          if (data && data.offices) {
            // Procesar las oficinas para normalizar los datos
            this.offices = data.offices.map(office => ({
              id: office.id,
              name: office.name,
              phone: office.phone || office.email || 'No disponible', // Usar phone, email como fallback, o mensaje por defecto
              address: office.address || 'Dirección no disponible',
              googleMapsUrl: office.googleMapsUrl || '',
              accounts: office.accounts || 'Información de cuentas no disponible',
              horario: office.horario || 'Horario no disponible',
              dias: office.dias || 'Días no disponible',
            }));
            return;
          }
        }
        throw new Error('API de oficinas no disponible');
      } catch (error) {
        console.error('Error al cargar oficinas:', error);
        // En caso de error, usar datos reales de ejemplo basados en los datos que proporcionaste
        this.offices = [
          {
            id: "central",
            name: "OFICINA MATRIZ",
            phone: "central", // Usando el email como teléfono temporalmente
            address: "Calle Loma Real 262",
            googleMapsUrl: "https://maps.google.com/?q=-12.0464,-77.0428",
            accounts: "Banco BCP - Cuenta de Ahorros - N° 194 90823860 070"
          },
          {
            id: "001",
            name: "Ate Vitarte",
            phone: "santaanita", // Usando el email como teléfono temporalmente
            address: "Ate Vitarte, Lima",
            googleMapsUrl: "https://maps.google.com/?q=-12.0432,-76.8987",
            accounts: "Información de cuentas no disponible"
          },
          {
            id: "002",
            name: "Cajabamba",
            phone: "cajabamba", // Usando el email como teléfono temporalmente
            address: "Cajabamba, Cajamarca",
            googleMapsUrl: "https://maps.google.com/?q=-7.6208,-78.0486",
            accounts: "Información de cuentas no disponible"
          },
          {
            id: "1756225703768",
            name: "cajamarca",
            phone: "9701", // Usando el email como teléfono temporalmente
            address: "Cajamarca, Cajamarca",
            googleMapsUrl: "https://maps.google.com/?q=-7.1631,-78.5126",
            accounts: "Información de cuentas no disponible"
          }
        ];
      }
    },
    
    async loadPaymentMethods() {
      try {
        this.loadingPaymentMethods = true;
        const { data } = await api.PaymentMethods.GET(this.$store.state.session);
        if (data && data.paymentMethods) {
          this.paymentMethods = data.paymentMethods;
        } else {
          console.warn('⚠️ No se encontraron métodos de pago en la respuesta');
          this.paymentMethods = [];
        }
      } catch (error) {
        console.error('❌ Error al cargar métodos de pago:', error);
        this.paymentMethods = [];
      } finally {
        this.loadingPaymentMethods = false;
      }
    },
    
    onPickupPointChange() {
    },
    
    async loadDepartments() {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'departments' });
        this.availableDepartments = data.departments || [];
      } catch (error) {
        console.error('❌ Error cargando departamentos:', error);
        this.availableDepartments = [];
      }
    },

    async loadProvincesForDepartment(department) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'provinces', department: department });
        this.availableProvinces = data.provinces || [];
      } catch (error) {
        console.error('❌ Error cargando provincias:', error);
        this.availableProvinces = [];
      }
    },

    async loadDistrictsForProvince(department, province) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'districts', department: department, province: province });
        this.availableDistricts = data.districts || [];
      } catch (error) {
        console.error('❌ Error cargando distritos:', error);
        this.availableDistricts = [];
      }
    },

    async loadAgenciesForDepartment(department) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'agencies-by-department', department: department });
        this.availableAgencies = data.agencies || [];
      } catch (error) {
        console.error('Error cargando agencias:', error);
        // Eliminamos el fallback con datos por defecto para depender completamente de la API
        this.availableAgencies = []; 
      }
    },
    
    async loadZoneForDistrict(district) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'zone-by-district', district: district });
        this.deliveryZoneInfo = data.zone || null;
      } catch (error) {
        console.error('❌ Error cargando zona:', error);
        this.deliveryZoneInfo = null;
      }
    },

    async refreshOffices() {
      await this.loadOffices();
      // Mostrar mensaje de confirmación
      if (this.$toast) {
        this.$toast.success('Oficinas actualizadas correctamente');
      }
    },
    
    onVoucherFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type || !file.type.startsWith('image/')) {
          this.voucherFile = null;
          this.voucherPreview = null;
          if (event && event.target) event.target.value = '';
          const msg = 'Solo se permiten imágenes (JPG, PNG, WEBP, etc.) para el voucher.';
          this.activationError = msg;
          if (this.$toast && typeof this.$toast.error === 'function') this.$toast.error(msg);
          return;
        }
        this.voucherFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.voucherPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.voucherFile = null;
        this.voucherPreview = null;
      }
    },
    
    onVoucherFileChange2(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type || !file.type.startsWith('image/')) {
          this.voucherFile2 = null;
          this.voucherPreview2 = null;
          this.voucherNumber2 = '';
          if (event && event.target) event.target.value = '';
          const msg = 'Solo se permiten imágenes (JPG, PNG, WEBP, etc.) para el voucher.';
          this.activationError = msg;
          if (this.$toast && typeof this.$toast.error === 'function') this.$toast.error(msg);
          return;
        }
        this.voucherFile2 = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.voucherPreview2 = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.voucherFile2 = null;
        this.voucherPreview2 = null;
        this.voucherNumber2 = '';
      }
    },
    
    
    async submitActivation() {
      this.activationError = null;
      this.activationSuccess = false;
      this.confirmedOrderTotal = null;
      this.confirmedCartPoints = null;
      this.sending = true;

      try {
        const session = this.$store.state.session;
        const isAffiliationCheckout = this.$store.state.isAffiliationCheckout;
        const needsExternalPayment = this.needsExternalPayment;
        const isBankPayment = needsExternalPayment && this.pay_method === 'bank';
        const isIzipayPayment = needsExternalPayment && this.pay_method === 'credit-card';
        const effectivePayMethod = needsExternalPayment ? this.pay_method : 'balance';
        
        // Determinar el directorio según el tipo de checkout
        const uploadDir = isAffiliationCheckout ? 'affiliations' : 'activations';
        
        let voucherUrl = null;
        let voucherUrl2 = null;
        if (isBankPayment) {
          if (this.voucherFile) {
            voucherUrl = await lib.upload(this.voucherFile, this.voucherFile.name, uploadDir);
          }
          if (this.voucherFile2) {
            voucherUrl2 = await lib.upload(this.voucherFile2, this.voucherFile2.name, uploadDir);
          }
        }

        // Preparar los productos del carrito para la API, incluyendo todos los detalles y filtrando por cantidad
        const productsToActivate = this.cartItems
          .filter(item => item.total > 0) // Filtrar productos con cantidad mayor a 0
          .map(item => ({ // Incluir todos los detalles relevantes del producto
            ...item, // Copiar todas las propiedades existentes del item
            price: this.getProductPrice(item), // Asegurarse de usar el precio correcto según el plan
            // Asegurarse de que `total` sea el que se muestra en el carrito si es diferente del `total` original del producto
            total: item.total 
          }));

        const payload = {
          products: productsToActivate,
          deliveryMethod: this.deliveryMethod,
          pay_method: effectivePayMethod,
          orderTotal: this.finalTotal, // El total final con delivery
          orderPoints: this.cartPoints,
          check: this.check, // Añadir el estado del checkbox de usar saldo
          
          // Información de Delivery o Recogida
          deliveryInfo: {},

          // Información de facturación (boleta/factura)
          proofType: this.proofData.type,
          proofDocument: this.proofData.document,
          proofRUC: this.proofData.ruc,
          proofRazonSocial: this.proofData.razonSocial,
          proofDireccionFiscal: this.proofData.direccionFiscal,

          // Datos del voucher (si aplica) - ahora con soporte para dos imágenes
          voucher: voucherUrl,
          bank: isBankPayment && this.selectedBank ? this.getBankInfo(this.selectedBank).name : null,
          bank_info: isBankPayment && this.selectedBank ? this.getBankInfo(this.selectedBank) : null,
          voucher_number: isBankPayment ? this.voucherNumber : null,
          
          // Izipay transaction details
          transaction_id: isIzipayPayment ? this.izipayTransactionId : null,
          authorization_code: isIzipayPayment ? this.izipayAuthorizationCode : null,
        };
        
        // Solo agregar voucher2 y su número de operación si existe
        if (voucherUrl2) {
          payload.voucher2 = voucherUrl2;
          payload.voucher_number2 = isBankPayment ? this.voucherNumber2 : null;
        }

        if (this.deliveryMethod === 'pickup') {
          if (!this.selectedOffice) {
            this.activationError = 'Por favor, selecciona un punto de recogida.';
            this.sending = false;
            return;
          }
          payload.deliveryInfo.type = 'pickup';
          payload.deliveryInfo.officeId = this.selectedOffice.id;
          payload.deliveryInfo.officeName = this.selectedOffice.name;
        } else if (this.deliveryMethod === 'delivery') {
          if (!this.deliveryData.department || !this.deliveryData.province || !this.deliveryData.district) {
            this.activationError = 'Por favor, completa todos los campos de ubicación para el delivery.';
            this.sending = false;
            return;
          }
          payload.deliveryInfo.type = 'delivery';
          payload.deliveryInfo.recipientName = this.deliveryData.recipientName;
          payload.deliveryInfo.document = this.deliveryData.document;
          payload.deliveryInfo.recipientPhone = this.deliveryData.recipientPhone;
          payload.deliveryInfo.department = this.deliveryData.department;
          payload.deliveryInfo.province = this.deliveryData.province;
          payload.deliveryInfo.district = this.deliveryData.district;
          
          //  MEJORADO: Agregar precio del delivery con mejor manejo y depuración
          // Inicializar campos de delivery
          payload.deliveryInfo.deliveryPrice = 0;
          payload.deliveryInfo.deliveryType = 'unknown';
          
          if (this.deliveryZoneInfo && this.deliveryData.department === 'lima') {
            // Para Lima: incluir información de zona y precio
            payload.deliveryInfo.deliveryZone = {
              zone_id: this.deliveryZoneInfo.zone_id,
              zone_name: this.deliveryZoneInfo.zone_name,
              price: this.deliveryZoneInfo.price
            };
            payload.deliveryInfo.deliveryPrice = parseFloat(this.deliveryZoneInfo.price) || 0;
            payload.deliveryInfo.deliveryType = 'zone';
          } else if (this.showAgencyField && this.deliveryData.agency) {
            // Para provincias: incluir agencia
            payload.deliveryInfo.agency = this.deliveryData.agency;
            payload.deliveryInfo.deliveryPrice = 0; // Precio por consultar
            payload.deliveryInfo.deliveryNote = 'Costo por confirmar con la agencia';
            payload.deliveryInfo.deliveryType = 'agency';
          } else {
            // Caso por defecto - sin información de delivery
            payload.deliveryInfo.deliveryPrice = 0;
            payload.deliveryInfo.deliveryType = 'none';
            payload.deliveryInfo.deliveryNote = 'Información de delivery no disponible';
          }
          
          // Log final del payload de delivery
        }

        // Validaciones finales antes de enviar
        if (this.cartItems.length === 0) {
          this.activationError = 'No hay productos en el carrito.';
          this.sending = false;
          return;
        }
        if (payload.proofType === 'boleta' && !payload.proofDocument) {
          this.activationError = 'Por favor, ingrese el documento para la boleta.';
          this.sending = false;
          return;
        }
        if (payload.proofType === 'factura' && (!payload.proofRUC || payload.proofRUC.length !== 11 || !payload.proofRazonSocial || !payload.proofDireccionFiscal)) {
          this.activationError = 'Para factura, completa RUC (11 dígitos), Razón Social y Dirección Fiscal.';
          this.sending = false;
          return;
        }

        // Validar método de pago si el saldo no cubre el total
        if (needsExternalPayment) {
          if (!payload.pay_method) {
            this.activationError = 'Por favor, selecciona un método de pago.';
            this.sending = false;
            return;
          }
        }

        if (isBankPayment && (!payload.bank || !payload.voucher_number || !payload.voucher)) {
          this.activationError = 'Para transferencia, selecciona un banco, ingresa el número de operación y sube el voucher.';
          this.sending = false;
          return;
        }

        // Si hay segundo comprobante, su número de operación es obligatorio
        if (isBankPayment && voucherUrl2 && !this.voucherNumber2) {
          this.activationError = 'Ingresa el número de operación correspondiente al segundo comprobante de pago.';
          this.sending = false;
          return;
        }
        
        if (isIzipayPayment && !payload.transaction_id) {
          this.activationError = 'El pago con tarjeta no se completó correctamente.';
          this.sending = false;
          return;
        }

        // Si es checkout de afiliación, usar el endpoint de afiliación
        if (isAffiliationCheckout) {
          const affiliationPlan = this.$store.state.affiliationPlan;
          if (!affiliationPlan) {
            throw new Error('No se encontró el plan de afiliación. Por favor, vuelve a seleccionar un plan.');
          }
          
          // Para afiliación, validar que se haya seleccionado una oficina
          let officeId = null;
          if (this.deliveryMethod === 'pickup') {
            if (!this.selectedOffice) {
              this.activationError = 'Por favor, selecciona un punto de recogida.';
              this.sending = false;
              return;
            }
            officeId = this.selectedOffice.id;
          } else {
            // Para afiliación, si no hay pickup, usar la primera oficina disponible o null
            // El endpoint de afiliación puede manejar office como null
            if (this.offices && this.offices.length > 0) {
              officeId = this.offices[0].id;
            }
          }
          
          // Construir payload para afiliación
          const affiliationPayload = {
            products: productsToActivate,
            plan: affiliationPlan, // El plan completo
            voucher: voucherUrl,
            office: officeId,
            check: this.check,
            pay_method: effectivePayMethod,
            bank: isBankPayment && this.selectedBank ? this.getBankInfo(this.selectedBank).name : null,
            date: this.paymentDate || new Date().toISOString().split('T')[0],
            voucher_number: isBankPayment ? this.voucherNumber : null,
            transaction_id: isIzipayPayment ? this.izipayTransactionId : null,
            authorization_code: isIzipayPayment ? this.izipayAuthorizationCode : null,
          };
          
          // Solo agregar voucher2 y su número de operación si existe
          if (voucherUrl2) {
            affiliationPayload.voucher2 = voucherUrl2;
            affiliationPayload.voucher_number2 = isBankPayment ? this.voucherNumber2 : null;
          }
          
          const { data } = await api.Afiliation.POST(session, affiliationPayload);
          
          if (data.error) {
            throw new Error(data.msg || 'Error al procesar la afiliación.');
          }
          
          // Éxito en la afiliación
          this.confirmedOrderTotal = this.finalTotal;
          this.confirmedCartPoints = this.cartPoints;
          this.orderNumber = data.orderNumber || data.id || 'N/A';
          this.activationSuccess = true;
          this.showConfirmation = true;
          await this.refreshWalletFromServer(session);
          this.$store.commit('setCartItems', []); // Limpiar el carrito en el store
          this.$store.commit('clearAffiliationCheckout'); // Limpiar el estado de afiliación
        } else {
          // Es una activación normal
          const { data } = await api.Activation.POST(session, payload);

          if (data.error) {
            throw new Error(data.msg || 'Error al procesar la activación.');
          }

          // Éxito en la activación
          this.confirmedOrderTotal = this.finalTotal;
          this.confirmedCartPoints = this.cartPoints;
          this.orderNumber = data.orderNumber || data.id || 'N/A';
          this.activationSuccess = true;
          this.showConfirmation = true;
          await this.refreshWalletFromServer(session);
          this.$store.commit('setCartItems', []); // Limpiar el carrito en el store
          this.$store.commit('clearAffiliationCheckout'); // Limpiar el estado de afiliación
        }
        // Opcional: limpiar los datos del formulario aquí si no se va a redirigir
        // this.$router.push('/dashboard'); // Redirigir al dashboard o a una página de éxito

      } catch (error) {
        console.error('Error en submitActivation:', error);
        let errMsg = error.message || 'Error al procesar la orden. Intenta nuevamente.';
        
        // Manejar error nativo de navegadores móviles al perder permiso sobre el archivo temporal
        if (errMsg.toLowerCase().includes('could not be read') || 
            errMsg.toLowerCase().includes('permission problems') || 
            errMsg.includes('NotReadableError')) {
          errMsg = '⚠️ Por seguridad de tu celular, el navegador perdió acceso a la foto. Por favor vuelve a "Seleccionar archivo" e intenta Confirmar de nuevo inmediatamente.';
          // Limpiar las variables de archivo para forzar a que lo seleccione de nuevo
          this.voucherFile = null;
          this.voucherPreview = null;
          this.voucherFile2 = null;
          this.voucherPreview2 = null;
          this.voucherNumber2 = '';
        }
        
        this.activationError = errMsg;
      } finally {
        this.sending = false;
      }
    },
  },
  
  watch: {
    activationError: {
      handler(msg) {
        if (!msg) return
        if (this.$toast && typeof this.$toast.error === 'function') {
          this.$toast.error(msg)
        }
      }
    },
    activationSuccess: {
      handler(ok) {
        if (!ok) return
        if (this.$toast && typeof this.$toast.success === 'function') {
          this.$toast.success('¡Orden enviada exitosamente!')
        }
      }
    },
    currentStep: {
      handler(newStep) {
        this.$nextTick(() => {
          this.scrollToTop();
        });
      }
    },

    // Watcher para autocompletar el documento cuando se selecciona 'boleta'
    'proofData.type': {
      handler(newType) {
        // Si cambia a 'boleta' y el campo está vacío, autocompletar con el DNI
        if (newType === 'boleta' && !this.proofData.document && this.userDNI) {
          this.$nextTick(() => {
            this.proofData.document = this.userDNI;
          });
        }
      }
    },

    // Computed para mostrar info de delivery
    hasDeliveryInfo() {
      return this.deliveryMethod === 'delivery' && 
             ((this.deliveryZoneInfo && this.deliveryData.department === 'lima') ||
              (this.deliveryData.agency && this.deliveryData.department !== 'lima'));
    }
  },
  
  async mounted() {
    // Asegurar que la página comience desde arriba
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Verificar si hay productos en el carrito
    if (this.cartItems.length === 0) {
      // Verificar si el usuario está afiliado para redirigir correctamente
      const affiliated = this.$store.state.affiliated !== null 
          ? this.$store.state.affiliated 
          : (localStorage.getItem('affiliated') === 'true');
          
      if (!affiliated) {
        this.$router.push('/affiliation');
      } else {
        this.$router.push('/activation');
      }
    }
    
    // Cargar las oficinas disponibles
    await this.loadOffices();
    
    // Cargar métodos de pago
    await this.loadPaymentMethods();
    
    // Cargar el saldo del usuario
    try {
      const { data } = await api.Activation.GET(this.$store.state.session);
      if (data) {
        this.balance = data.balance || 0;
        this._balance = data._balance || 0;
        
        // Guardar el DNI en el store si está disponible
        if (data.dni) {
          this.$store.commit('SET_DNI', data.dni);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando el saldo del usuario:', error);
      // Opcional: mostrar un mensaje de error al usuario
    }

    // Cargar departamentos disponibles
    await this.loadDepartments();
    
    // Autocompletar el campo de documento con el DNI del usuario
    if (this.userDNI && this.proofData.type === 'boleta') {
      this.proofData.document = this.userDNI;
    }
    
    // Configurar actualización automática cada 30 segundos
    this.officesUpdateInterval = setInterval(async () => {
      await this.loadOffices();
    }, 30000); // 30 segundos
    
    // Asegurar que la página esté en la parte superior después de cargar todo
    this.$nextTick(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  },
  
  beforeDestroy() {
    if (this.officesUpdateInterval) {
      clearInterval(this.officesUpdateInterval);
    }
  }
}
</script>


<style lang="stylus" scoped>
@import '../../assets/style/views/app/Checkout.styl'
</style>
