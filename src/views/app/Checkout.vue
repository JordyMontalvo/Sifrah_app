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
                      <span class="value">{{ cartPoints.toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="transaction-row total">
                    <div class="transaction-item">
                      <span class="label">Total:</span>
                      <span class="value">S/ {{ finalTotal.toFixed(2) }}</span>
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
                          <input v-model="deliveryData.document" type="text" placeholder="Nro. de Documento" @input="onlyNumbersDocument($event, 'deliveryData.document')" maxlength="8" required />
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

              <!-- Ubicación en mapa y información -->
              <div v-if="selectedPickupPoint && deliveryMethod === 'pickup'" class="map-and-location-container">
                <div class="section-header">
                  <h3>Ubicación en mapa</h3>
                </div>
                
                <div class="map-location-vertical">
                  <!-- Mapa en la parte superior -->
                  <div class="map-section">
                    <div class="map-container">
                      <div id="map" style="height: 300px; border-radius: 12px;"></div>
                      <div class="map-info">
                        <div class="map-location-label">Ubicación en Mapa:</div>
                        <a 
                          v-if="selectedOffice && selectedOffice.googleMapsUrl" 
                          :href="selectedOffice.googleMapsUrl" 
                          target="_blank" 
                          class="map-link"
                        >
                          Ver en Google Maps
                        </a>
                        <a 
                          v-else-if="selectedOffice && selectedOffice.address && selectedOffice.address !== 'Dirección no disponible' && selectedOffice.address !== 'hola'"
                          :href="`https://www.openstreetmap.org/search?query=${encodeURIComponent(selectedOffice.address)}`"
                          target="_blank" 
                          class="map-link"
                        >
                          Ver en OpenStreetMap
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Información de la oficina matriz debajo del mapa -->
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

                      <div class="office-item" v-if="selectedOffice.horario && selectedOffice.id !== 'central'">
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
                        <input v-model="proofData.document" type="text" placeholder="Nro. de Documento" @input="onlyNumbersDocument($event, 'proofData.document')" maxlength="8" required />
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
                      <!-- Mapa pequeño para la oficina seleccionada -->
                      <div class="delivery-info-item map-section" v-if="selectedOffice">
                        <div class="map-location-label">Ubicación en Mapa:</div>
                        <div class="small-map-container">
                          <div id="small-map" style="height: 200px; border-radius: 8px; margin-top: 10px;"></div>
                          <div class="map-links">
                            <a 
                              v-if="selectedOffice.googleMapsUrl" 
                              :href="selectedOffice.googleMapsUrl" 
                              target="_blank" 
                              class="map-link"
                            >
                              Ver en Google Maps
                            </a>
                            <a 
                              v-else-if="selectedOffice.address && selectedOffice.address !== 'Dirección no disponible' && selectedOffice.address !== 'hola'"
                              :href="`https://www.openstreetmap.org/search?query=${encodeURIComponent(selectedOffice.address)}`"
                              target="_blank" 
                              class="map-link"
                            >
                              Ver en OpenStreetMap
                            </a>
                          </div>
                        </div>
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

                <div v-show="!(check && remaining == 0)" class="payment-methods">
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
                  
                  <div class="payment-method disabled-payment-method">
                    <input 
                      type="radio" 
                      id="credit-card" 
                      name="payment" 
                      value="credit-card"
                      v-model="pay_method"
                      @click="togglePaymentMethod('credit-card')"
                      disabled
                    />
                    <label for="credit-card" class="disabled-label">
                      <i class="fas fa-credit-card"></i>
                      <span>Tarjeta de Crédito/Débito</span>
                    </label>
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
                  </div>
                  
                </div>
                
                
                <!-- Campos de Pago con Comprobante - Fuera del contenedor de métodos -->
                <div v-if="pay_method === 'bank'" class="voucher-payment-fields">
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
                    
                    <div class="file-upload-simple" style="margin-top: 15px;">
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
      
      // Instancia del mapa de Leaflet
      map: null,
      smallMap: null, // Agregar instancia del mapa pequeño
      
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
      // Variables para el desplegable de bancos
      showBankOptions: false,
      selectedBank: '',
      activationError: null,
      activationSuccess: false,
      // Métodos de pago dinámicos
      paymentMethods: [],
      loadingPaymentMethods: false
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
                           this.deliveryData.document.length === 8 &&
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
        // Para boleta solo requiere documento con exactamente 8 números
        if (this.proofData.type === 'boleta') {
          return this.proofData.document && this.proofData.document.length === 8;
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
      // Para boleta solo requiere documento con exactamente 8 números
      if (this.proofData.type === 'boleta') {
        return this.proofData.document && this.proofData.document.length === 8;
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
      return this.cartItems.length > 0 && ((this.check && this.remaining === 0) || this.pay_method);
    },
    
    selectedOffice() {
      if (!this.selectedPickupPoint) return null;
      return this.offices.find(office => office.id == this.selectedPickupPoint);
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
    }
  },
  
  methods: {
    // Método para toggle de métodos de pago - permite desmarcar al hacer clic nuevamente
    togglePaymentMethod(method) {
      // Bloquear la selección de tarjeta de crédito/débito
      if (method === 'credit-card') {
        return; // No permitir seleccionar esta opción
      }
      
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
      }
      
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
          type: method.type
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
      // Limpiar estado de afiliación al ir al dashboard
      this.$store.commit('clearAffiliationCheckout');
      this.$router.push('/dashboard');
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
    
    getMapCoordinates(office) {
      if (!office) return null;
      
      // Prioridad 1: Extraer coordenadas de Google Maps URL
      if (office.googleMapsUrl && office.googleMapsUrl.trim() !== '') {
        try {
          const googleUrl = office.googleMapsUrl;
          
          // Diferentes patrones para extraer coordenadas
          let coordsMatch = googleUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/); // @lat,lng
          if (!coordsMatch) {
            coordsMatch = googleUrl.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/); // q=lat,lng
          }
          if (!coordsMatch) {
            coordsMatch = googleUrl.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/); // ll=lat,lng
          }
          
          if (coordsMatch) {
            return {
              lat: parseFloat(coordsMatch[1]),
              lng: parseFloat(coordsMatch[2])
            };
          }
        } catch (error) {
          console.error('Error al extraer coordenadas de Google Maps:', error);
        }
      }
      
      // Prioridad 2: Usar coordenadas por defecto para ciudades conocidas
      if (office.address && office.address !== 'Dirección no disponible' && office.address !== 'hola') {
        const address = office.address.toLowerCase();
        
        // Coordenadas por defecto para ciudades principales del Perú
        if (address.includes('lima') || address.includes('loma real')) {
          return { lat: -12.0464, lng: -77.0428 }; // Lima Centro
        } else if (address.includes('ate') || address.includes('vitarte')) {
          return { lat: -12.0432, lng: -76.8987 }; // Ate Vitarte
        } else if (address.includes('cajamarca') || address.includes('cajabamba')) {
          return { lat: -7.1631, lng: -78.5126 }; // Cajamarca
        } else if (address.includes('arequipa')) {
          return { lat: -16.4040, lng: -71.5197 }; // Arequipa
        } else if (address.includes('cusco')) {
          return { lat: -13.5319, lng: -71.9675 }; // Cusco
        } else if (address.includes('trujillo')) {
          return { lat: -8.1116, lng: -79.0287 }; // Trujillo
        } else if (address.includes('piura')) {
          return { lat: -5.1945, lng: -80.6328 }; // Piura
        } else if (address.includes('chiclayo')) {
          return { lat: -6.7714, lng: -79.8374 }; // Chiclayo
        } else if (address.includes('huancayo')) {
          return { lat: -12.0653, lng: -75.2049 }; // Huancayo
        }
      }
      
      console.warn('No se pudieron obtener coordenadas para la oficina:', office.name);
      return null;
    },
    
    initMap(office) {
      
      // Verificar que Leaflet está disponible
      if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Verifica que se haya cargado la librería.');
        return;
      }
      
      const coords = this.getMapCoordinates(office);
      
      if (!coords) {
        console.warn('No se pudieron obtener coordenadas para la oficina:', office.name);
        return;
      }
      
      // Verificar que el elemento del mapa existe
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.warn('Elemento del mapa no encontrado');
        return;
      }
      
      // Limpiar el mapa si ya existe
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      
      try {
        
        // Crear mapa de Leaflet
        this.map = L.map('map', {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true
        }).setView([coords.lat, coords.lng], 15);
        
        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(this.map);
        
        // Agregar marcador personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #d209b6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-map-marker-alt" style="color: white; font-size: 14px;"></i></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        L.marker([coords.lat, coords.lng], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(`
            <div style="text-align: center; padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #9f00ad; font-weight: 700;">${office.name}</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">${office.address}</p>
              ${office.phone && office.phone !== 'No disponible' ? `<p style="margin: 5px 0 0 0; color: #333; font-size: 13px;"><i class="fas fa-phone"></i> ${office.phone}</p>` : ''}
            </div>
          `)
          .openPopup();
        
        // Ajustar el tamaño del mapa después de cargar
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 200);
        
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
      }
    },
    
    // Método para inicializar el mapa pequeño en la card de datos de despacho
    initSmallMap(office) {
      
      // Verificar que Leaflet está disponible
      if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Verifica que se haya cargado la librería.');
        return;
      }
      
      const coords = this.getMapCoordinates(office);
      
      if (!coords) {
        console.warn('No se pudieron obtener coordenadas para la oficina:', office.name);
        return;
      }
      
      // Verificar que el elemento del mapa pequeño existe
      const mapElement = document.getElementById('small-map');
      if (!mapElement) {
        console.warn('Elemento del mapa pequeño no encontrado');
        return;
      }
      
      // Limpiar el mapa pequeño si ya existe
      if (this.smallMap) {
        this.smallMap.remove();
        this.smallMap = null;
      }
      
      try {
        
        // Crear mapa pequeño de Leaflet
        this.smallMap = L.map('small-map', {
          zoomControl: false, // Desactivar controles para mapa pequeño
          scrollWheelZoom: false, // Desactivar zoom con scroll
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          dragging: true, // Permitir arrastrar
          touchZoom: true
        }).setView([coords.lat, coords.lng], 16); // Zoom un poco más cerca
        
        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(this.smallMap);
        
        // Agregar marcador personalizado más pequeño
        const smallCustomIcon = L.divIcon({
          className: 'custom-marker-small',
          html: '<div style="background-color: #d209b6; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-map-marker-alt" style="color: white; font-size: 12px;"></i></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        L.marker([coords.lat, coords.lng], { icon: smallCustomIcon })
          .addTo(this.smallMap)
          .bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <h4 style="margin: 0 0 6px 0; color: #ff8c00; font-weight: 700; font-size: 13px;">${office.name}</h4>
              <p style="margin: 0; color: #666; font-size: 12px;">${office.address}</p>
              ${office.phone && office.phone !== 'No disponible' ? `<p style="margin: 4px 0 0 0; color: #333; font-size: 11px;"><i class="fas fa-phone"></i> ${office.phone}</p>` : ''}
            </div>
          `);
        
        // Ajustar el tamaño del mapa después de cargar
        setTimeout(() => {
          if (this.smallMap) {
            this.smallMap.invalidateSize();
          }
        }, 200);
        
      } catch (error) {
        console.error('Error al inicializar el mapa pequeño:', error);
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
      }
    },
    
    
    async submitActivation() {
      this.activationError = null;
      this.activationSuccess = false;
      this.sending = true;

      try {
        const session = this.$store.state.session;
        const isAffiliationCheckout = this.$store.state.isAffiliationCheckout;
        
        // Determinar el directorio según el tipo de checkout
        const uploadDir = isAffiliationCheckout ? 'affiliations' : 'activations';
        
        let voucherUrl = null;
        let voucherUrl2 = null;
        if (this.pay_method === 'bank') {
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
          pay_method: this.pay_method,
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
          bank: this.selectedBank ? this.getBankInfo(this.selectedBank).name : null,
          bank_info: this.selectedBank ? this.getBankInfo(this.selectedBank) : null,
          voucher_number: this.voucherNumber,
        };
        
        // Solo agregar voucher2 si existe
        if (voucherUrl2) {
          payload.voucher2 = voucherUrl2;
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
        if (payload.proofType === 'boleta' && (!payload.proofDocument || payload.proofDocument.length !== 8)) {
          this.activationError = 'El documento para boleta debe tener 8 dígitos.';
          this.sending = false;
          return;
        }
        if (payload.proofType === 'factura' && (!payload.proofRUC || payload.proofRUC.length !== 11 || !payload.proofRazonSocial || !payload.proofDireccionFiscal)) {
          this.activationError = 'Para factura, completa RUC (11 dígitos), Razón Social y Dirección Fiscal.';
          this.sending = false;
          return;
        }

        // Validar método de pago si el saldo no cubre el total
        if (!this.check || this.remaining > 0) {
          if (!payload.pay_method) {
            this.activationError = 'Por favor, selecciona un método de pago.';
            this.sending = false;
            return;
          }
        }

        if (payload.pay_method === 'bank' && (!payload.bank || !payload.voucher_number || !payload.voucher)) {
          this.activationError = 'Para transferencia, selecciona un banco, ingresa el número de operación y sube el voucher.';
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
            pay_method: this.pay_method,
            bank: this.selectedBank ? this.getBankInfo(this.selectedBank).name : null,
            date: this.paymentDate || new Date().toISOString().split('T')[0],
            voucher_number: this.voucherNumber,
          };
          
          // Solo agregar voucher2 si existe
          if (voucherUrl2) {
            affiliationPayload.voucher2 = voucherUrl2;
          }
          
          const { data } = await api.Afiliation.POST(session, affiliationPayload);
          
          if (data.error) {
            throw new Error(data.msg || 'Error al procesar la afiliación.');
          }
          
          // Éxito en la afiliación
          this.orderNumber = data.orderNumber || 'N/A';
          this.activationSuccess = true;
          this.showConfirmation = true;
          this.$store.commit('setCartItems', []); // Limpiar el carrito en el store
          this.$store.commit('clearAffiliationCheckout'); // Limpiar el estado de afiliación
        } else {
          // Es una activación normal
          const { data } = await api.Activation.POST(session, payload);

          if (data.error) {
            throw new Error(data.msg || 'Error al procesar la activación.');
          }

          // Éxito en la activación
          this.orderNumber = data.orderNumber || 'N/A'; // Suponiendo que la API devuelve un número de orden
          this.activationSuccess = true;
          this.showConfirmation = true;
          this.$store.commit('setCartItems', []); // Limpiar el carrito en el store
          this.$store.commit('clearAffiliationCheckout'); // Limpiar el estado de afiliación
        }
        // Opcional: limpiar los datos del formulario aquí si no se va a redirigir
        // this.$router.push('/dashboard'); // Redirigir al dashboard o a una página de éxito

      } catch (error) {
        console.error('Error en submitActivation:', error);
        this.activationError = error.message || 'Error al procesar la orden. Intenta nuevamente.';
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
    selectedPickupPoint: {
      handler(newPickupPoint) {
        if (newPickupPoint) {
          const office = this.offices.find(o => o.id == newPickupPoint);
          if (office) {
            // Esperar a que el DOM se actualice
            this.$nextTick(() => {
              setTimeout(() => {
                this.initMap(office);
                // También inicializar el mapa pequeño si estamos en el paso 3
                if (this.currentStep === 3) {
                  setTimeout(() => {
                    this.initSmallMap(office);
                  }, 300);
                }
              }, 100);
            });
          }
        }
      }
    },

    // Watcher para cuando cambie el paso actual
    currentStep: {
      handler(newStep) {
        // Scroll hacia arriba cuando cambia de paso
        this.$nextTick(() => {
          this.scrollToTop();
        });
        
        // Si llegamos al paso 3 y hay una oficina seleccionada, inicializar el mapa pequeño
        if (newStep === 3 && this.selectedOffice) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.initSmallMap(this.selectedOffice);
            }, 200);
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
      this.$router.push('/activation');
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
      }
    } catch (error) {
      console.error('❌ Error cargando el saldo del usuario:', error);
      // Opcional: mostrar un mensaje de error al usuario
    }

    // Cargar departamentos disponibles
    await this.loadDepartments();
    
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
    // Limpiar el intervalo cuando el componente se destruye
    if (this.officesUpdateInterval) {
      clearInterval(this.officesUpdateInterval);
    }
    
    // Limpiar el mapa cuando el componente se destruye
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    // Limpiar el mapa pequeño cuando el componente se destruye
    if (this.smallMap) {
      this.smallMap.remove();
      this.smallMap = null;
    }
  }
}
</script>


<style lang="stylus" scoped>
@import '../../assets/style/views/app/Checkout.styl'
</style>
