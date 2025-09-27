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
                        <select v-model="deliveryData.agency" class="form-select agency-select" @change="console.log('Agencia seleccionada:', deliveryData.agency)">
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
                    <div class="bank-option-card" @click="selectBankOption('bcp')" :class="{ 'selected': selectedBank === 'bcp' }">
                      <span>BCP</span>
                    </div>
                    <div class="bank-option-card" @click="selectBankOption('interbank')" :class="{ 'selected': selectedBank === 'interbank' }">
                      <span>Interbank</span>
                    </div>
                    <div class="bank-option-card" @click="selectBankOption('yape')" :class="{ 'selected': selectedBank === 'yape' }">
                      <span>Yape</span>
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
                      <input type="file" @change="onVoucherFileChange" id="voucher-file" />
                      <label for="voucher-file" class="file-label-simple">
                        <i class="fas fa-upload"></i>
                        <span>{{ voucherPreview ? 'Cambiar archivo' : 'Seleccionar archivo' }}</span>
                      </label>
                    </div>
                    <img v-if="voucherPreview" :src="voucherPreview" class="voucher-preview-img" />
                    
                    <div class="file-upload-simple" style="margin-top: 15px;">
                      <input type="file" @change="onVoucherFileChange2" id="voucher-file-2" />
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
      activationSuccess: false
    }
  },
  
  computed: {
    // Obtener productos del carrito desde el store o props
    cartItems() {
      return this.$store.state.cartItems || [];
    },
    
    cartTotal() {
      return this.cartItems.reduce((sum, item) => 
        sum + this.getProductPrice(item) * item.total, 0);
    },
    
    cartPoints() {
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
      console.log('Validando paso', this.currentStep, 'con deliveryMethod:', this.deliveryMethod);
      if (this.currentStep === 1) {
        if (this.deliveryMethod === 'delivery') {
          console.log('Delivery Data:', this.deliveryData);
          const basicInfo = this.deliveryData.recipientName && 
                           this.deliveryData.document && 
                           this.deliveryData.document.length === 8 &&
                           this.deliveryData.recipientPhone &&
                           this.deliveryData.department &&
                           this.deliveryData.province &&
                           this.deliveryData.district;
          console.log('Basic Info Valid:', basicInfo);
          
          if (this.showAgencyField) {
            console.log('Show Agency Field:', this.showAgencyField, 'Agency selected:', this.deliveryData.agency);
            console.log('Available Agencies:', this.availableAgencies); // Añadido para depuración
            return basicInfo && this.deliveryData.agency;
          }
          
          return basicInfo;
        }
        console.log('Pickup selected:', this.selectedPickupPoint);
        return this.deliveryMethod && this.selectedPickupPoint;
      }
      if (this.currentStep === 2) {
        console.log('Proof Data:', this.proofData);
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
      console.log('Debug showAgencyField:', {
        department: this.deliveryData.department,
        province: this.deliveryData.province,
        deptNotLima: this.deliveryData.department !== 'lima',
        provNotLima: this.deliveryData.province !== 'lima'
      });
      
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
      console.log('Banco seleccionado:', bank);
    },
    
    getBankDisplayName(bank) {
      const bankNames = {
        'bcp': 'BCP',
        'interbank': 'Interbank',
        'yape': 'Yape'
      };
      return bankNames[bank] || 'Pago con Comprobante';
    },
    
    getBankInfo(bank) {
      const bankData = {
        'bcp': {
          name: 'Banco de Crédito del Perú',
          account: '193-12345678-0-12',
          holder: 'SIFRAH S.A.C.',
          type: 'Cuenta Corriente'
        },
        'interbank': {
          name: 'Interbank',
          account: '838 3244339443',
          holder: 'SIFRAH S.A.C.',
          type: 'Cuenta Corriente'
        },
        'yape': {
          name: 'Yape',
          account: '973 808 360',
          holder: 'SIFRAH S.A.C.',
          type: 'Transferencia a celular'
        }
      };
      return bankData[bank] || {};
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
      console.log('🌍 Departamento cambiado a:', this.deliveryData.department);
      
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
      console.log('🏙️ Provincia cambiada a:', this.deliveryData.province);
      
      // Resetear campos dependientes
      this.deliveryData.district = '';
      this.deliveryZoneInfo = null;
      this.availableDistricts = [];
      
      if (!this.deliveryData.department || !this.deliveryData.province) return;
      
      // Cargar distritos para departamento + provincia
      await this.loadDistrictsForProvince(this.deliveryData.department, this.deliveryData.province);
    },
    
    async onDistrictChange() {
      console.log('🏘️ Distrito cambiado a:', this.deliveryData.district);
      
      // Reset zona info
      this.deliveryZoneInfo = null;
      
      if (!this.deliveryData.district) return;
      
      // Si es Lima, buscar zona de delivery
      if (this.deliveryData.department === 'lima') {
        await this.loadZoneForDistrict(this.deliveryData.district);
      }
    },
    
    nextStep() {
      if (this.canProceedToNextStep && this.currentStep < 3) {
        this.currentStep++;
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    returnToStore() {
      this.$router.push('/activation');
    },
    
    processOrder() {
      if (!this.canProcessOrder) return;

      this.submitActivation();
    },
    
    goToDashboard() {
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
            console.log('Oficinas cargadas desde servidor:', this.offices);
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
        console.log('Usando oficinas por defecto:', this.offices);
      }
    },
    
    onPickupPointChange() {
      console.log('Punto de recogida cambiado:', this.selectedPickupPoint);
      console.log('Oficina seleccionada:', this.selectedOffice);
    },
    
    async loadDepartments() {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'departments' });
        this.availableDepartments = data.departments || [];
        console.log('✅ Departamentos cargados:', this.availableDepartments);
      } catch (error) {
        console.error('❌ Error cargando departamentos:', error);
        this.availableDepartments = [];
      }
    },

    async loadProvincesForDepartment(department) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'provinces', department: department });
        this.availableProvinces = data.provinces || [];
        console.log('✅ Provincias cargadas para', department, ':', this.availableProvinces);
      } catch (error) {
        console.error('❌ Error cargando provincias:', error);
        this.availableProvinces = [];
      }
    },

    async loadDistrictsForProvince(department, province) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'districts', department: department, province: province });
        this.availableDistricts = data.districts || [];
        console.log('✅ Distritos cargados para', department, '/', province, ':', this.availableDistricts);
      } catch (error) {
        console.error('❌ Error cargando distritos:', error);
        this.availableDistricts = [];
      }
    },

    async loadAgenciesForDepartment(department) {
      try {
        const { data } = await api.getDeliveryInfo({ type: 'agencies-by-department', department: department });
        this.availableAgencies = data.agencies || [];
        console.log('Agencias cargadas para', department, ':', this.availableAgencies);
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
        console.log('🎯 Zona encontrada para', district, ':', this.deliveryZoneInfo);
      } catch (error) {
        console.error('❌ Error cargando zona:', error);
        this.deliveryZoneInfo = null;
      }
    },

    async refreshOffices() {
      console.log('Actualizando oficinas...');
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
          console.log('URL de Google Maps:', googleUrl);
          
          // Diferentes patrones para extraer coordenadas
          let coordsMatch = googleUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/); // @lat,lng
          if (!coordsMatch) {
            coordsMatch = googleUrl.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/); // q=lat,lng
          }
          if (!coordsMatch) {
            coordsMatch = googleUrl.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/); // ll=lat,lng
          }
          
          if (coordsMatch) {
            console.log('Coordenadas extraídas de Google Maps:', coordsMatch);
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
      console.log('Iniciando mapa para oficina:', office);
      
      // Verificar que Leaflet está disponible
      if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Verifica que se haya cargado la librería.');
        return;
      }
      
      const coords = this.getMapCoordinates(office);
      console.log('Coordenadas extraídas:', coords);
      
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
        console.log('Limpiando mapa anterior');
        this.map.remove();
        this.map = null;
      }
      
      try {
        console.log('Creando nuevo mapa con coordenadas:', coords);
        
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
            console.log('Mapa inicializado correctamente');
          }
        }, 200);
        
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
      }
    },
    
    // Método para inicializar el mapa pequeño en la card de datos de despacho
    initSmallMap(office) {
      console.log('Iniciando mapa pequeño para oficina:', office);
      
      // Verificar que Leaflet está disponible
      if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Verifica que se haya cargado la librería.');
        return;
      }
      
      const coords = this.getMapCoordinates(office);
      console.log('Coordenadas extraídas para mapa pequeño:', coords);
      
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
        console.log('Limpiando mapa pequeño anterior');
        this.smallMap.remove();
        this.smallMap = null;
      }
      
      try {
        console.log('Creando nuevo mapa pequeño con coordenadas:', coords);
        
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
            console.log('Mapa pequeño inicializado correctamente');
          }
        }, 200);
        
      } catch (error) {
        console.error('Error al inicializar el mapa pequeño:', error);
      }
    },
    
    onVoucherFileChange(event) {
      const file = event.target.files[0];
      if (file) {
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
        let voucherUrl = null;
        if (this.pay_method === 'bank' && this.voucherFile) {
          voucherUrl = await lib.upload(this.voucherFile, this.voucherFile.name, 'activations');
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

          // Datos del voucher (si aplica)
          voucher: voucherUrl,
          bank: this.bankName,
          date: this.paymentDate,
          voucher_number: this.voucherNumber,
        };

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
          console.log('🚚 Debug Delivery Info:', {
            deliveryZoneInfo: this.deliveryZoneInfo,
            department: this.deliveryData.department,
            showAgencyField: this.showAgencyField,
            agency: this.deliveryData.agency
          });
          
          // Inicializar campos de delivery
          payload.deliveryInfo.deliveryPrice = 0;
          payload.deliveryInfo.deliveryType = 'unknown';
          
          if (this.deliveryZoneInfo && this.deliveryData.department === 'lima') {
            // Para Lima: incluir información de zona y precio
            console.log('🏙️ Lima - Zona encontrada:', this.deliveryZoneInfo);
            payload.deliveryInfo.deliveryZone = {
              zone_id: this.deliveryZoneInfo.zone_id,
              zone_name: this.deliveryZoneInfo.zone_name,
              price: this.deliveryZoneInfo.price
            };
            payload.deliveryInfo.deliveryPrice = parseFloat(this.deliveryZoneInfo.price) || 0;
            payload.deliveryInfo.deliveryType = 'zone';
            console.log('💰 Precio de delivery Lima:', payload.deliveryInfo.deliveryPrice);
          } else if (this.showAgencyField && this.deliveryData.agency) {
            // Para provincias: incluir agencia
            console.log('🏔️ Provincia - Agencia seleccionada:', this.deliveryData.agency);
            payload.deliveryInfo.agency = this.deliveryData.agency;
            payload.deliveryInfo.deliveryPrice = 0; // Precio por consultar
            payload.deliveryInfo.deliveryNote = 'Costo por confirmar con la agencia';
            payload.deliveryInfo.deliveryType = 'agency';
            console.log('📦 Precio de delivery Provincia: Por consultar');
          } else {
            // Caso por defecto - sin información de delivery
            console.log('⚠️ Sin información de delivery válida');
            payload.deliveryInfo.deliveryPrice = 0;
            payload.deliveryInfo.deliveryType = 'none';
            payload.deliveryInfo.deliveryNote = 'Información de delivery no disponible';
          }
          
          // Log final del payload de delivery
          console.log('📋 Payload Delivery Info Final:', payload.deliveryInfo);
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

        if (payload.pay_method === 'bank' && (!payload.bank || !payload.date || !payload.voucher_number || !payload.voucher)) {
          this.activationError = 'Para transferencia, completa todos los datos del banco y sube el voucher.';
          this.sending = false;
          return;
        }

        console.log('Payload de activación final a enviar:', payload);
        const session = this.$store.state.session;
        const { data } = await api.Activation.POST(session, payload);

        if (data.error) {
          throw new Error(data.msg || 'Error al procesar la activación.');
        }

        // Éxito en la activación
        this.orderNumber = data.orderNumber || 'N/A'; // Suponiendo que la API devuelve un número de orden
        this.activationSuccess = true;
        this.showConfirmation = true;
        this.$store.commit('setCartItems', []); // Limpiar el carrito en el store
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
    selectedPickupPoint: {
      handler(newPickupPoint) {
        console.log('Punto de recogida cambió a:', newPickupPoint);
        if (newPickupPoint) {
          const office = this.offices.find(o => o.id == newPickupPoint);
          console.log('Oficina encontrada:', office);
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
    // Verificar si hay productos en el carrito
    if (this.cartItems.length === 0) {
      this.$router.push('/activation');
    }
    
    // Cargar las oficinas disponibles
    await this.loadOffices();
    
    // Cargar el saldo del usuario
    try {
      const { data } = await api.Activation.GET(this.$store.state.session);
      if (data) {
        this.balance = data.balance || 0;
        this._balance = data._balance || 0;
        console.log('✅ Saldo de usuario cargado:', { balance: this.balance, _balance: this._balance });
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
.checkout-page
  min-height 100vh
  padding 20px
  margin-top 20px

.top-progress-bar
  display flex
  justify-content space-between
  align-items center
  margin-bottom -20px
  max-width 600px
  margin-left auto
  margin-right 90px
  padding 35px 45px
  position relative
  
  &::before
    content ''
    position absolute
    top 50%
    left 45px
    right 45px
    height 6px
    background #f0f0f0
    transform translateY(-50%)
    z-index 1
    border-radius 4px
  
  &::after
    content ''
    position absolute
    top 50%
    left 65px
    height 6px
    background #d209b6
    transform translateY(-50%)
    z-index 1
    border-radius 4px
    transition all 0.8s cubic-bezier(0.4, 0, 0.2, 1)
    width calc((100% - 90px) * (var(--current-step, 1) / 3))
    box-shadow 0 2px 12px rgba(255,140,0,0.25)

.top-progress-bar .progress-step
  display flex
  flex-direction column
  align-items center
  position relative
  z-index 2
  transition all 0.6s cubic-bezier(0.4, 0, 0.2, 1)
  
  .step-number
    width 50px
    height 50px
    border-radius 50%
    background white
    color #555
    display flex
    align-items center
    justify-content center
    font-weight 700
    font-size 1.1rem
    margin-bottom 15px
    transition all 0.6s cubic-bezier(0.4, 0, 0.2, 1)
    border 2px solid #e0e0e0
    box-shadow 0 2px 10px rgba(0,0,0,0.08)
    transform scale(1)
  
  .step-label
    font-size 1rem
    color #555
    font-weight 500
    transition all 0.6s cubic-bezier(0.4, 0, 0.2, 1)
    transform translateY(0)
    letter-spacing 0.3px
  
  &.active
    .step-number
      background #d209b6
      color white
      border-color #d209b633
      box-shadow #d209b633
      transform scale(1.05)
    
    .step-label
      color #333
      font-weight 600
      transform translateY(-1px)



.checkout-main-title
  text-align left
  margin-bottom 20px
  padding 0
  margin-top 0
  position absolute
  top 40px
  left 40px
  z-index 10
  
  h1
    color #9f00ad
    font-size 20px
    margin 0 0 20px 0
    font-weight 700
    text-align left
    letter-spacing -0.5px
  
  // Ajuste para móviles - ocultar el título en dispositivos móviles
  @media (max-width: 768px)
    display none

.checkout-header
  text-align center
  color #333
  margin-bottom 30px
  
  h1
    font-size 2.5rem
    margin-bottom 10px
    font-weight 700
    color #333
  
  p
    font-size 1.1rem
    color #666

.checkout-container
  display flex
  flex-direction column
  max-width 1400px
  margin 0 auto 0 0
  overflow visible
  
  // Ajuste para móviles - agregar margen superior para evitar choque con el título
  @media (max-width: 768px)
    margin-top 40px

.checkout-main-header

  padding 30px
  border-bottom 1px solid #e0e0e0
  text-align center
  
  h1
    color #333
    font-size 2rem
    margin-bottom 10px
    font-weight 700
  
  p
    color #666
    font-size 1rem
    margin 0

.checkout-content
  display grid
  grid-template-columns 1.2fr 2.2fr
  gap 0px
  margin-top -25px
  position relative
  overflow visible
// Columna izquierda - Resumen del carrito
.cart-summary
  background linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
  padding 35px
  height 898px
  border-radius 18px
  box-shadow 0 8px 32px rgba(0,0,0,0.12)
  width 445px
  border 1px solid #e8e8e8
  position relative
  z-index 10
  margin-top 20px
  display flex
  flex-direction column

.cart-title
  text-align center
  margin-bottom 13px
  padding 25px
  background #c285c75e
  border-radius 12px
  border 2px solid #c285c75e
  
  h2
    margin 0 0 12px 0
    font-size 1.3rem
    font-weight 700
    color #9f00ad
    text-shadow 0 1px 2px rgba(255, 140, 0, 0.1)
  
  p
    margin 0
    font-size 0.95rem
    color #555
    font-weight 500
    line-height 1.4

.cart-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 15px
  padding-bottom 15px
  border-bottom 1px solid #e0e0e8

  h3
    margin 0
    font-size 1.5rem
    font-weight 700
    color #ff9800
    text-align center
    flex 1

.close-cart-btn
  background none
  border none
  cursor pointer
  font-size 1.5rem
  color #666
  transition all 0.3s ease
  padding 5px
  border-radius 50%
  width 35px
  height 35px
  display flex
  align-items center
  justify-content center

  &:hover
    color #ff9800
    background rgba(255, 152, 0, 0.1)

.cart-scroll-info
  text-align center
  margin-bottom 20px
  padding 10px 0
  background #e9ecef
  border-radius 8px
  font-size 0.9rem
  color #666
  font-style italic

.cart-items
  margin-bottom 30px
  flex 1
  overflow-y auto
  -webkit-overflow-scrolling touch
  padding-right 15px

.cart-item
  display flex
  align-items center
  padding 22px
  border 1px solid #e8e8e8
  border-radius 14px
  margin-bottom 22px
  transition all 0.3s ease
  background linear-gradient(135deg, #ffffff 0%, #fefefe 100%)
  box-shadow 0 4px 16px rgba(0,0,0,0.08)
  
  &:hover
    border-color #d209b6
    box-shadow #d209b633
    transform translateY(-2px)

.cart-item-image
  width 80px
  height 80px
  margin-right 20px
  flex-shrink 0
  
  img
    width 100%
    height 100%
    object-fit cover
    border-radius 8px
    background repeating-conic-gradient(
      #f0f0f0 0deg 90deg,
      #e0e0e0 90deg 180deg
    )
    background-size 20px 20px

.cart-item-details
  flex 1
  display flex
  flex-direction column
  gap 4px

.cart-item-quantity
  font-size 1.1rem
  color #666
  margin-bottom 5px
  font-weight 600

.cart-item-name
  font-weight 700
  margin-bottom 8px
  color #333
  font-size 1.1rem
  line-height 1.3

.cart-item-price
  font-size 1.1rem
  color #d209b6
  font-weight 600
  margin-bottom 8px

.cart-item-points
  font-size 0.8rem
  color #d209b6
  font-weight 600
  background #d209b633
  padding 2px 6px
  border-radius 4px
  display inline-block
  width fit-content

// Estilos específicos para los items de delivery
.delivery-item
  background linear-gradient(135deg, #ff8c00 0%, #ff9800 100%) !important
  border-color #ff6b00 !important
  color white !important
  
  &:hover
    border-color #ff6b00 !important
    box-shadow 0 6px 20px rgba(255, 107, 0, 0.3) !important
    transform translateY(-2px) !important
  
  .cart-item-details
    .cart-item-quantity
      color rgba(255,255,255,0.9) !important
      font-weight 600 !important
      text-transform uppercase !important
      letter-spacing 0.5px !important
      font-size 0.85rem !important
    
    .cart-item-name
      color white !important
      font-weight 700 !important
      text-shadow 0 1px 2px rgba(0,0,0,0.2) !important
    
    .cart-item-price
      color white !important
      font-weight 700 !important
      text-shadow 0 1px 2px rgba(0,0,0,0.2) !important
      font-size 1.2rem !important

.delivery-item-icon
  width 80px
  height 80px
  margin-right 20px
  flex-shrink 0
  display flex
  align-items center
  justify-content center
  font-size 2.5rem
  background rgba(255,255,255,0.2)
  border-radius 12px
  backdrop-filter blur(10px)
  border 2px solid rgba(255,255,255,0.3)
  text-shadow 0 2px 4px rgba(0,0,0,0.2)

// Estilo especial para delivery por agencia
.agency-item
  background linear-gradient(135deg, #2196f3 0%, #1976d2 100%) !important
  border-color #1565c0 !important
  
  &:hover
    border-color #1565c0 !important
    box-shadow 0 6px 20px rgba(21, 101, 192, 0.3) !important

.order-summary
  border-top 2px solid #ffe4d6
  padding-top 10px
  margin-top 0px
  margin-bottom 15px
  background linear-gradient(135deg, #ffffff 0%, #fefefe 100%)
  padding 15px
  border-radius 14px
  box-shadow 0 4px 16px rgba(0,0,0,0.08)
  border 1px solid #f0f0f0
  flex-shrink 0

  .summary-row
    display flex
    justify-content space-between
    margin-bottom 5px
    font-size 1rem
    align-items center
    
    span:first-child
      font-weight 600
      color #333
    
    span:last-child
      font-weight 500
      color #d209b6
    
    // Colores específicos para cada tipo de información
    &:nth-child(1) // Total productos
      font-size 1.1rem
      span:first-child
        color #333
        font-weight 700
      span:last-child
        color #d209b6
        font-weight 700
    
    &:nth-child(2) // Puntos
      font-size 1.1rem
      span:first-child
        color #333
        font-weight 700
      span:last-child
        color #d209b6
        font-weight 700
    
    &.total
      font-weight 700
      font-size 1.1rem
      color #388e3c
      border-top 1px solid #e0e0e0
      padding-top 10px
      margin-top 10px
      
      span:first-child
        font-weight 600
        color #333
      
      span:last-child
        font-weight 700
        color #d209b6

  .delivery-row
    background linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)
    padding 12px 15px
    border-radius 8px
    border-left 4px solid #ff8c00
    margin 8px 0
    
    span:first-child
      color #ff8c00
      font-weight 700
      font-size 1rem
    
    span:last-child
      color #ff8c00
      font-weight 700
      font-size 1.1rem

// Estilos para el resumen de transacción (paso 3)
.transaction-summary
  .transaction-row
    display flex
    justify-content space-between
    margin-bottom 12px
    font-size 1rem
    
    .transaction-item
      flex 1
      
      .label
        color #333
        font-weight 500
        display block
        margin-bottom 4px
      
      .value
        color #D209B6
        font-weight 600
        display block
    
    &.total
      font-weight bold
      font-size 1.2rem
      border-top 2px solid #ffe4d6
      padding-top 8px
      margin-top 8px
      
      .value
        color #D209B6
        font-size 1.3rem

.summary-details .concept-value
  font-weight 600
  color #ff9800

.summary-details .points-value
  font-weight 600
  color #ff9800

.summary-details .total-value
  font-weight 700
  color #388e3c

.return-to-store
  text-align center
  margin-top auto
  padding 20px
  background #c285c75e
  border-radius 12px
  border 1px solid rgba(255, 140, 0, 0.1)
  flex-shrink 0
  
  p
    margin-bottom 20px
    color #555
    font-size 1.05rem
    font-weight 500

.return-btn
  background #d209b6
  color white
  border none
  padding 16px 32px
  border-radius 12px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  width 100%
  box-shadow #d209b633
  font-size 1.05rem
  
  &:hover
    background #9f00ad
    transform translateY(-3px)
    box-shadow #d209b633

// Columna derecha - Proceso de checkout
.checkout-process
  padding 30px

.progress-bar
  display flex
  justify-content space-between
  margin-bottom 40px
  position relative
  
  &::before
    content ''
    position absolute
    top 15px
    left 0
    right 0
    height 2px
    background #e0e0e0
    z-index 1

.progress-step
  display flex
  flex-direction column
  align-items center
  position relative
  z-index 2
  
  .step-number
    width 30px
    height 30px
    border-radius 50%
    background #e0e0e0
    color #666
    display flex
    align-items center
    justify-content center
    font-weight 600
    margin-bottom 8px
    transition all 0.3s ease
  
  .step-label
    font-size 0.9rem
    color #666
    font-weight 500
  
  &.active
    .step-number
      background #667eea
      color white
    
    .step-label
      color #667eea
      font-weight 600

.checkout-step
  min-height 400px

.delivery-options
  background white
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.08)
  overflow hidden
  margin-bottom 30px

.delivery-header
  background #d209b6
  color white
  padding 20px 30px
  border-radius 12px 12px 0 0
  margin-bottom 0
  
  h3
    margin 0
    font-size 1.3rem
    font-weight 700
    text-align left

.delivery-content
  background #f8f9fa
  border-left 1px solid #e0e0e0
  border-right 1px solid #e0e0e0
  border-bottom 1px solid #e0e0e0
  border-radius 0 0 12px 12px
  padding 25px 0

.delivery-description
  padding 0 30px 20px 30px
  margin-bottom 0
  
  p
    margin 0
    color #333
    font-size 1rem
    font-weight 500

.section-header
  margin-bottom 25px
  display flex
  justify-content space-between
  align-items center
  
  h3
    color #333
    margin-bottom 8px
    font-size 1.3rem
    margin 0
  
  p
    color #666
    font-size 0.95rem

.refresh-btn
  background #ff8c00
  color white
  border none
  padding 8px 12px
  border-radius 6px
  cursor pointer
  transition all 0.3s ease
  font-size 0.9rem
  
  &:hover
    background #f57c00
    transform translateY(-1px)
  
  i
    font-size 0.9rem

.delivery-methods
  display flex
  gap 15px
  margin 0 30px 30px 30px
  margin-bottom -10px

.delivery-method
  flex 1
  padding 18px 25px
  border 2px solid #e0e0e0
  border-radius 12px
  background white
  cursor pointer
  transition all 0.3s ease
  font-weight 600
  font-size 1rem
  color #333
  
  &:hover
    border-color #d209b6
    background #f8f9fa
  
  &.active
    border-color #d209b6
    background #d209b6
    color white
    box-shadow #d209b633

// Formulario de pickup - similar a delivery-form
.pickup-form
  margin-top 30px
  padding 35px
  position relative
  overflow hidden
  background white
  border-radius 0 0 12px 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.08)
  
  &::before
    content ''
    position absolute
    top 0
    left 0
    right 0
    height 4px
    background #d209b6
  
  &::after
    content ''
    position absolute
    top 0
    right 0
    width 60px
    height 60px
    background radial-gradient(circle at 100% 0%, rgba(255, 140, 0, 0.1) 0%, transparent 70%)
    border-radius 0 0 0 100%

.pickup-section
  margin-bottom 30px
  
  h4
    color #9f00ad
    font-size 1.3rem
    font-weight 700
    margin-bottom 25px
    padding 15px 20px
    background #d209b633
    border-radius 12px
    border-left 4px solid #d209b6
    position relative
    margin-bottom 0
    margin 0

.pickup-select
  width 100%
  padding 12px 15px
  border 2px solid #e0e0e0
  border-radius 8px
  font-size 1rem
  transition all 0.3s ease
  background white
  margin-top 20px
  box-sizing border-box
  
  &:focus
    outline none
    border-color #667eea

.maps-indicator
  margin-left 8px
  color #f59e0b
  font-size 0.8rem
  
  i
    animation pulse 2s infinite

@keyframes pulse
  0%
    opacity 1
  50%
    opacity 0.5
  100%
    opacity 1

.map-container
  margin-bottom 30px

.map-and-location-container
  margin-bottom 30px

.map-location-vertical
  display grid
  grid-template-columns 1fr 1fr
  gap 20px
  align-items start
  
  // Para móviles, cambiar a layout vertical
  @media (max-width: 768px)
    display flex !important
    flex-direction column !important
    gap 15px
    grid-template-columns none !important

.map-section
  .map-container
    margin-bottom 0
    
  // Asegurar que el mapa se vea bien en móviles
  @media (max-width: 768px)
    order 1
    width 100%
    
    #map
      height 250px !important
      border-radius 8px

.office-info-section
  background #f8f9fa
  border-radius 12px
  padding 20px
  border 1px solid #e9ecef
  
  // En móviles, esta sección va debajo del mapa
  @media (max-width: 768px)
    order 2
    width 100%
    margin-top 10px
  
  .office-header
    margin-bottom 15px
    
    h4
      color #333
      font-size 1.2rem
      font-weight 600
      margin 0
      color #9f00ad
  
  .office-details
    background white
    border-radius 10px
    padding 18px
    border 1px solid #e8e8e8
    box-shadow 0 2px 8px rgba(0,0,0,0.06)
    margin-top 15px
  
  .office-item
    display flex
    justify-content space-between
    align-items flex-start
    margin-bottom 12px
    padding 10px
    background #fafafa
    border-radius 6px
    border-left 3px solid #d209b6
    
    &:last-child
      margin-bottom 0
    
    .office-label
      font-weight 600
      color #d209b6
      font-size 0.9rem
      min-width 70px
      margin-right 12px
    
    .office-value
      font-weight 500
      color #333
      font-size 0.9rem
      flex 1
      line-height 1.3
  
  .location-main
    text-align center
    margin-bottom 18px
    padding-bottom 15px
    border-bottom 1px solid #ffe4d6
    
    strong
      color #333
      font-weight 700
      font-size 1.1rem
      letter-spacing 0.3px
  
  .location-item
    display flex
    justify-content space-between
    align-items flex-start
    margin-bottom 12px
    padding 10px
    background #fafafa
    border-radius 6px
    border-left 3px solid #ff8c00
    
    &:last-child
      margin-bottom 0
    
    .location-label
      font-weight 600
      color #ff8c00
      font-size 0.9rem
      min-width 70px
      margin-right 12px
    
    .location-value
      font-weight 500
      color #333
      font-size 0.9rem
      flex 1
      line-height 1.3
      
      .whatsapp-icon
        color #25d366
        margin-left 6px
        font-size 1rem
        vertical-align middle

  // Responsive para móviles
  @media (max-width: 768px)
    .office-info-section
      padding 15px
      
      .office-details
        padding 15px
    
    .office-item
      flex-direction column
      align-items flex-start
      
      .office-label
        margin-bottom 6px
        margin-right 0
        min-width auto

.map-section
  border-radius 8px
  overflow hidden

.map-header
  background #f8f9fa
  padding 12px 15px
  border-bottom 1px solid #e0e0e0
  
  h4
    margin 0
    font-size 1rem
    color #333
    font-weight 600

.map-content
  .map-embed
    width 100%
    
    iframe
      border-radius 12px
      box-shadow 0 4px 20px rgba(0,0,0,0.15)
      transition all 0.3s ease
      
      &:hover
        box-shadow 0 6px 25px rgba(0,0,0,0.2)
        transform translateY(-2px)

.map-info
  padding 12px 15px
  background white
  
  .location-name
    font-weight 500
    color #333
    margin-bottom 8px
  
  .map-link
    color #ff9800
    text-decoration none
    font-weight 500
    
    &:hover
      text-decoration underline
    margin-bottom 15px
  
  p
    font-size 1.1rem
    color #333
    margin-bottom 5px
  
  small
    color #666

.map-link
  color #ff9800
  text-decoration none
  font-weight 500
  
  &:hover
    text-decoration underline

.map-placeholder
  display flex
  flex-direction column
  align-items center
  justify-content center
  height 300px
  background linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
  border 2px dashed #dee2e6
  border-radius 12px
  color #6c757d
  padding 20px
  text-align center
  
  i
    font-size 3.5rem
    margin-bottom 20px
    color #ff8c00
    opacity 0.7
  
  p
    margin 0 0 10px 0
    font-size 1.1rem
    font-weight 600
    color #495057
  
  small
    font-size 0.9rem
    color #6c757d
    line-height 1.4
    max-width 250px

.location-info
  margin-top 20px

.location-header
  margin-bottom 15px
  
  h3
    color #333
    font-size 1.1rem
    font-weight 600
    margin 0

.location-details
  background #f8f9fa
  border-radius 8px
  padding 15px
  border 1px solid #e0e0e0


.location-item
  margin-bottom 8px
  font-size 0.9rem
  
  &:last-child
    margin-bottom 0
  
  strong
    color #333
    font-weight 600
  
  span
    font-weight 500
    color #333

.step-actions
  display flex
  justify-content space-between
  align-items center
  margin-top 40px
  padding-top 20px
  border-top 1px solid #e0e0e0

.back-btn
  background #d209b6
  color white
  border none
  padding 12px 25px
  border-radius 8px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  
  &:hover
    background #9f00ad

.continue-btn, .process-btn
  background #d209b6
  color white
  border none
  padding 14px 32px
  border-radius 8px
  font-weight 700
  cursor pointer
  transition all 0.3s ease
  font-size 1.05rem
  
  &:hover:not(:disabled)
    background #9f00ad
    transform translateY(-2px)
  
  &:disabled
    background #f8f9fa
    color #6c757d
    border-color #dee2e6
    cursor not-allowed
    transform none
    opacity 0.7

// Formulario de facturación
.billing-form
  .form-row
    display grid
    grid-template-columns 1fr 1fr
    gap 20px
    margin-bottom 20px

// Formulario de delivery
.delivery-form
  margin-top 30px
  padding 35px
  position relative
  overflow hidden
  
  &::before
    content ''
    position absolute
    top 0
    left 0
    right 0
    height 4px
    background #d209b6
  
  &::after
    content ''
    position absolute
    top 0
    right 0
    width 60px
    height 60px
    background linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, transparent 100%)
    border-radius 0 20px 0 60px

  .form-section
    margin-bottom 30px
    
    h4
      color #9f00ad
      font-size 1.3rem
      font-weight 700
      margin-bottom 25px
      padding 15px 20px
      background #d209b633
      border-radius 12px
      border-left 4px solid #d209b6
      position relative
      


  .form-row
    display grid
    grid-template-columns 1fr 1fr
    gap 20px
    margin-bottom 20px

  .form-group
    margin-bottom 20px
    
    label
      display block
      margin-bottom 8px
      font-weight 600
      color #333
      font-size 0.95rem
    
    .input-with-icon
      position relative
      
      input, .form-select
        width 100%
        min-width 200px
        padding 20px 18px
        border 2px solid #e8e8e8
        border-radius 12px
        font-size 1rem
        transition all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
        color #333
        background linear-gradient(135deg, #ffffff 0%, #fafafa 100%)
        box-shadow 0 2px 8px rgba(0,0,0,0.08)
        
        &:hover
          border-color #d209b6
          box-shadow 0 4px 16px rgba(255, 140, 0, 0.15)
          transform translateY(-1px)
        
        &:focus
          outline none
          border-color #d209b6
          box-shadow 0 6px 24px rgba(255,140,0,0.2)
          transform translateY(-2px)
          background-color #fff
      
      i
        position absolute
        right 15px
        top 50%
        transform translateY(-50%)
        color #333
        font-size 1rem

  .form-select
    background linear-gradient(135deg, #ffffff 0%, #fafafa 100%)
    cursor pointer
    color #333
    font-weight 500
    box-shadow 0 2px 8px rgba(0,0,0,0.08)
    border 2px solid #e8e8e8
    border-radius 12px
    padding 20px 18px
    font-size 1rem
    min-width 333px
    transition all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    position relative
    appearance none
    background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff8c00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E")
    background-repeat no-repeat
    background-position right 15px center
    background-size 16px
    
    &:hover
      border-color #d209b6
      box-shadow 0 4px 16px rgba(255, 140, 0, 0.15)
      transform translateY(-1px)
    
    &:focus
      outline none
      border-color #d209b6
      box-shadow 0 6px 24px rgba(255,140,0,0.2)
      transform translateY(-2px)
      background-color #fff

  .form-select
    background white
    cursor pointer
    
  .district-select
    min-width 200px !important
    width 100%
    
  .agency-select
    min-width 200px !important
    width 100%

  // Estilos específicos para campos de ubicación
  .department-field, .province-field
    .form-select
      min-width 200px !important
      width 100%

  .delivery-note
    margin-top 30px
    padding 0
    background transparent
    border-radius 0
    border-left none
    position relative
    box-shadow none
    
    p
      margin 0
      font-size 0.95rem
      color #555
      font-weight 500
      line-height 1.5

  // Estilos para la sección de agencia
  .agency-section
    margin-top 25px
    padding 0
    background transparent
    border-radius 0
    border none
    
    h4
      color #9f00ad
      font-size 1.3rem
      font-weight 700
      margin-bottom 25px
      padding 15px 20px
      background #d209b633
      border-radius 12px
      border-left 4px solid #d209b6
      position relative

  .form-group
  margin-bottom 20px
  
  label
    display block
    margin-bottom 8px
    font-weight 500
    color #333
  
  input
    width 100%
    padding 12px 15px
    border 2px solid #e0e0e0
    border-radius 8px
    font-size 1rem
    transition all 0.3s ease
    
    &:focus
      outline none
      border-color #667eea

// Estilos para el paso 2 - Comprobante de Compra
.proof-section
  background #d209b614
  padding 0
  border-radius 20px
  border 2px solid #d209b633
  box-shadow 0 8px 32px #d209b633
  overflow hidden
  margin-top 20px

.proof-type-selection
  display flex
  gap 20px
  margin 0 30px 30px 30px

  .proof-option
    flex 1
    
    input[type="radio"]
      display none
    
    .proof-label
      display block
      padding 15px 20px
      text-align center
      background #f0f0f0
      border 2px solid #e0e0e0
      border-radius 8px
      cursor pointer
      transition all 0.3s ease
      font-weight 600
      color #333
      
      &:hover
        border-color #d209b6
        background #f8f9fa
      
      span
        font-size 1rem
        font-weight 600
    
    input[type="radio"]:checked + .proof-label
      background #d209b6
      color white
      border-color #d209b6

// Header naranja del comprobante
.proof-header
  background #d209b6
  padding 20px 30px
  margin 0
  
  h3
    color white
    font-size 1.3rem
    font-weight 700
    margin 0
    text-align left

.proof-description
  margin 25px 30px 25px 30px
  
  p
    color #333
    font-size 1rem
    font-weight 500
    margin 0
    text-align left

// Estilos específicos para el campo de documento en el comprobante
.proof-form .form-group
  label
    display block
    margin-bottom 12px
    font-weight 600
    color #333
    font-size 1.1rem
    letter-spacing 0.5px

// Estilos para los campos de boleta
.boleta-fields
  margin -10px 0 15px 0
  padding 0 30px
  background transparent
  border-radius 0
  border none
  
  .form-group
    margin-bottom 20px
    
    label
      display block
      margin-bottom 8px
      font-weight 600
      color #333
      font-size 1rem
    
    .input-with-icon
      position relative
      
      input
        width 100%
        padding 20px 18px
        border 2px solid #d209b6
        border-radius 12px
        font-size 1rem
        transition all 0.3s ease
        background white
        box-shadow 0 2px 8px rgba(0,0,0,0.08)
        
        &:focus
          outline none
          border-color #d209b6
          box-shadow 0 6px 24px rgba(255,140,0,0.2)
          transform translateY(-2px)
          background-color #fff
      
      i
        position absolute
        right 15px
        top 50%
        transform translateY(-50%)
        color #333
        font-size 1rem

// Estilos para los campos de factura
.factura-fields
  margin -10px 0 15px 0
  padding 0 30px
  background transparent
  border-radius 0
  border none
  
  .form-row
    display grid
    grid-template-columns 1fr 1fr
    gap 20px
    margin-bottom 20px
  
  .form-group
    margin-bottom 20px
    
    label
      display block
      margin-bottom 8px
      font-weight 600
      color #333
      font-size 1rem
    
    .input-with-icon
      position relative
      
      input
        width 100%
        padding 12px 15px
        border 2px solid #e0e0e0
        border-radius 8px
        font-size 1rem
        transition all 0.3s ease
        background white
        
        &:focus
          outline none
          border-color #d209b6
          box-shadow 0 4px 16px rgba(255,140,0,0.15)
      
      i
        position absolute
        right 15px
        top 50%
        transform translateY(-50%)
        color #333
        font-size 1rem

// Métodos de pago
@media (max-width: 768px) {
  .factura-fields .form-row {
    display block
  }
}

.transfer-info
  background #f8f9fa
  border-radius 10px
  padding 20px
  margin-bottom 30px

.yape-info
  background #f8f9fa
  border-radius 10px
  padding 20px
  margin-bottom 30px

.yape-details
  background #f8f9fa
  border-radius 8px
  padding 20px
  margin-bottom 25px
  border 1px solid #e0e0e0

.yape-info-item
  display flex
  justify-content space-between
  margin-bottom 10px
  font-size 0.95rem
  padding 8px 0
  
  &:last-child
    margin-bottom 0
  
  .yape-label
    font-weight 600
    color #333
    min-width 80px
  
  .yape-value
    color #333
    font-weight 500

// Estilos para los métodos de pago
.payment-methods
  margin-top 15px

.payment-method
  margin-bottom 15px
  
  &:last-child
    margin-bottom 0
  
  input[type="radio"]
    display none
    
  label
    display flex
    align-items center
    font-weight 500
    color #333
    cursor pointer
    padding 12px 15px
    border 2px solid #e0e0e0
    border-radius 8px
    background #f8f9fa
    transition all 0.3s ease
    
    &:hover
      border-color #d209b6
      background #fff8f0
    
    i
      margin-right 12px
      font-size 1.1rem
      color #d209b6
      width 20px
      text-align center
      
    span
      font-size 0.9rem
      color #555
      
  input[type="radio"]:checked + label
    background #9f00ad
    border-color #d209b633
    color white
    
    i
      color white
      
    span
      color white

.bank-details-simple
  background #f8f9fa
  border-radius 8px
  padding 20px
  margin-bottom 25px
  border 1px solid #e0e0e0

.bank-info-item
  display flex
  justify-content space-between
  margin-bottom 10px
  font-size 0.95rem
  padding 8px 0
  
  &:last-child
    margin-bottom 0
  
  strong
    font-weight 600
    color #333
    min-width 80px

.payment-form-simple
  background #f8f9fa
  border-radius 8px
  padding 20px
  margin-bottom 25px
  border 1px solid #e0e0e0

.form-field-simple
  margin-bottom 20px
  
  &:last-child
    margin-bottom 0
  
  label
    display block
    margin-bottom 8px
    font-weight 600
    color #333
    font-size 0.95rem
  
  input[type="text"], input[type="date"]
    width 100%
    padding 12px 15px
    border 1px solid #e0e0e0
    border-radius 6px
    font-size 0.95rem
    background white
    transition all 0.3s ease
    
    &:focus
      outline none
      border-color #ff8c00
      box-shadow 0 0 0 2px rgba(255, 140, 0, 0.1)
    
    &::placeholder
      color #999
      font-size 0.9rem

.file-upload-simple
  position relative
  
  input[type="file"]
    display none
  
  .file-label-simple
    display flex
    align-items center
    justify-content center
    padding 12px 15px
    border 2px dashed #d209b633
    border-radius 6px
    background white
    cursor pointer
    transition all 0.3s ease
    font-size 0.95rem
    color #666
    
    &:hover
      border-color #d209b6
      background #fafafa
    
    i
      margin-right 8px
      color #d209b6
      font-size 1rem

.final-summary
  background #f8f9fa
  border-radius 10px
  padding 20px

.summary-details
  .summary-item
    display flex
    justify-content space-between
    margin-bottom 10px
    font-size 0.95rem
    
    // Estilos para Total productos
    &:nth-child(1)
      font-weight 700
      span:first-child
        color #333
      span:last-child
        color #333
        font-weight 700
    
    // Estilos para Puntos
    &:nth-child(2)
      font-weight 700
      span:first-child
        color #333
      span:last-child
        color #ff8c00
        font-weight 700
    
    // Estilos para Subtotal
    &:nth-child(3)
      span:first-child
        color #333
        font-weight 600
      span:last-child
        color #666
        font-weight 500
    
    // Estilos para Envío
    &:nth-child(4)
      span:first-child
        color #333
        font-weight 600
      span:last-child
        color #666
        font-weight 500
    
    &.total
      font-weight 700
      font-size 1.1rem
      color #388e3c
      border-top 1px solid #e0e0e0
      padding-top 10px
      margin-top 10px
      
      span:first-child
        color #333
      span:last-child
        color #388e3c

// Modal de confirmación
.confirmation-modal
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  background rgba(0,0,0,0.5)
  display flex
  align-items center
  justify-content center
  z-index 1000

.modal-content
  background white
  border-radius 15px
  padding 40px
  text-align center
  max-width 500px
  width 90%

.modal-header
  margin-bottom 25px
  
  i
    font-size 4rem
    color #28a745
    margin-bottom 15px
  
  h3
    color #333
    font-size 1.5rem

.modal-body
  margin-bottom 30px
  
  p
    margin-bottom 10px
    color #666
    
    strong
      color #333

.dashboard-btn
  background #28a745
  color white
  border none
  padding 12px 30px
  border-radius 8px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  
  &:hover
    background #218838

// Responsive design
@media (max-width: 1024px)
  .checkout-content
    grid-template-columns 1fr
    gap 20px
    margin-top -20px
  
  .top-progress-bar
    padding 30px 25px
    margin-right auto
    max-width 600px
    margin-bottom 15px
    
    &::before, &::after
      left 35px
      right 35px
      height 7px
      border-radius 5px
      top 50%
      transform translateY(-50%)
    
    &::after
      left 35px
      width calc((100% - 70px) * (var(--current-step, 1) / 3))
    
    .progress-step
      .step-number
        width 52px
        height 52px
        font-size 1.15rem
        border 3px solid #e0e0e0
        box-shadow 0 3px 12px rgba(0,0,0,0.1)
      
      .step-label
        font-size 1rem
        font-weight 600
        margin-top 10px
        letter-spacing 0.3px
      
      &.active
        .step-number
          border-color #d209b6
          box-shadow #d209b633
          transform scale(1.05)
        
        .step-label
          color #333
          font-weight 700

@media (max-width: 768px)
  .checkout-page
    padding 15px
  
  .checkout-header
    h1
      font-size 2rem
    
    p
      font-size 1rem
  
  .top-progress-bar
    padding 25px 20px
    margin-right auto
    margin-bottom 30px
    
    &::before, &::after
      left 25px
      right 25px
      height 8px
      border-radius 6px
      top 50%
      transform translateY(-50%)
    
    &::after
      left 25px
      width calc((100% - 50px) * (var(--current-step, 1) / 3))
    
    .progress-step
      .step-number
        width 50px
        height 50px
        font-size 1.1rem
        font-weight 700
        border 3px solid #e0e0e0
        box-shadow 0 3px 12px rgba(0,0,0,0.1)
      
      .step-label
        font-size 0.95rem
        font-weight 600
        margin-top 8px
        letter-spacing 0.2px
      
      &.active
        .step-number
          border-color #d209b633
          box-shadow 0 4px 16px rgba(255,140,0,0.3)
          transform scale(1.05)
        
        .step-label
          color #d209b633
          font-weight 700
  
  // Intercambiar posición del carrito con método de pago en móvil
  .checkout-content
    display flex
    flex-direction column
    gap 20px
    
  .cart-summary
    order 2
    width 100%
    max-width 100%
    margin 0
    padding 25px
    min-height auto
    height auto
    max-height 85vh
    overflow-y auto
    background white
    border-radius 12px
    box-shadow 0 4px 20px rgba(0,0,0,0.1)
    
    .cart-title
      position sticky
      top 0
      background white
      z-index 10
      padding-bottom 15px
      margin-bottom 15px
      border-bottom 1px solid #e0e0e0
      
      h2
        font-size 1.3rem
        margin-bottom 8px
        color #9f00ad
        
      p
        font-size 0.9rem
        color #666
        margin 0
    
    .cart-items
      max-height calc(85vh - 120px)
      overflow-y auto
      padding-right 5px
      
      // Scroll personalizado
      &::-webkit-scrollbar
        width 6px
        
      &::-webkit-scrollbar-track
        background #f1f1f1
        border-radius 3px
        
      &::-webkit-scrollbar-thumb
        background #d209b6
        border-radius 3px
        
      &::-webkit-scrollbar-thumb:hover
        background #b8079a
    
    .cart-item
      background white
      border 1px solid #e8e8e8
      border-radius 12px
      padding 15px
      margin-bottom 15px
      display flex
      align-items center
      justify-content space-between
      box-shadow 0 2px 8px rgba(0,0,0,0.05)
      transition all 0.3s ease
      
      &:hover
        box-shadow 0 4px 12px rgba(0,0,0,0.1)
        transform translateY(-2px)
      
      .cart-item-image
        width 60px
        height 60px
        margin-right 15px
        flex-shrink 0
        
        img
          width 100%
          height 100%
          object-fit cover
          border-radius 8px
      
      .cart-item-details
        flex 1
        display flex
        flex-direction column
        gap 4px
        
        .cart-item-quantity
          display none // Ocultar cantidad en móvil
          
        .cart-item-name
          font-weight 700
          color #333
          font-size 1rem
          margin-bottom 4px
          
        .cart-item-price
          color #d209b6
          font-weight 600
          font-size 1.1rem
          
        .cart-item-points
          color #d209b6
          font-weight 600
          font-size 1rem
      
      .cart-item-controls
        display flex
        flex-direction column
        align-items center
        gap 8px
        
        .quantity-controls
          display flex
          align-items center
          gap 5px
          
          .qty-btn
            width 30px
            height 30px
            border none
            border-radius 6px
            background #ff8c00
            color white
            font-weight bold
            cursor pointer
            display flex
            align-items center
            justify-content center
            transition all 0.3s ease
            
            &:hover
              background #e65100
              transform scale(1.1)
          
          .qty-display
            width 30px
            height 30px
            background white
            border 1px solid #e0e0e0
            border-radius 6px
            display flex
            align-items center
            justify-content center
            font-weight 600
            color #333
            font-size 0.9rem
        
        .delete-btn
          width 30px
          height 30px
          border none
          border-radius 6px
          background #f44336
          color white
          cursor pointer
          display flex
          align-items center
          justify-content center
          transition all 0.3s ease
          
          &:hover
            background #d32f2f
            transform scale(1.1)
    
    .order-summary
      position sticky
      bottom 0
      background white
      padding-top 15px
      border-top 1px solid #e0e0e0
      margin-top 15px
    
  .checkout-process
    order 1
    width 100%
    max-width 100%
    margin 0
    margin-top 20px
    
  // Mejoras específicas para opciones de despacho en móvil
  .delivery-options
    margin-bottom 20px
    margin-top -20px

  // Mejoras específicas para facturación en móvil
  .proof-section
    margin-top -20px
    
  .delivery-header
    padding 15px 20px
    
    h3
      font-size 1.2rem
      text-align center
  
  .delivery-content
    padding 20px 0
    
  .delivery-description
    padding 0 20px 15px 20px
    
    p
      font-size 0.95rem
      text-align center
  
  .delivery-methods
    flex-direction column
    margin 0 20px 20px 20px
    gap 12px
  
  .delivery-method
    padding 16px 20px
    font-size 0.95rem
    text-align center
    min-height 50px
    display flex
    align-items center
    justify-content center
  
  .pickup-center
    padding 0 20px
    
  .pickup-selector
    margin-bottom 20px
    margin-top 0
    
    label
      font-size 0.95rem
      margin-bottom 10px
      text-align center
      display block
      font-weight 600
      color #333
  
  .pickup-select
    padding 14px 15px
    font-size 0.95rem
    border-radius 10px
    min-height 50px
  
  .billing-form
    .form-row
      grid-template-columns 1fr
  
  // Arreglar formularios de delivery en móvil
  .delivery-form
    padding 20px
    margin-top 20px
    
    .form-section
      margin-bottom 25px
      
      h4
        font-size 1.1rem
        margin-bottom 15px
        color #9f00ad
        font-weight 600
    
    .form-row
      display flex
      flex-direction column
      gap 15px
      margin-bottom 15px
    
    .form-group
      margin-bottom 15px
      width 100%

  // Arreglar formularios de pickup en móvil
  .pickup-form
    padding 30px 20px
    margin-top 20px
    
    .pickup-section
      margin-bottom 25px
      
      h4
        font-size 1.1rem
        margin-bottom 15px
        color #9f00ad
        font-weight 600
    
    .form-row
      display flex
      flex-direction column
      gap 15px
      margin-bottom 15px
    
    .form-group
      margin-bottom 15px
      width 100%
      
      label
        font-size 0.9rem
        margin-bottom 6px
        color #333
        font-weight 600
      
      .input-with-icon
        input, .form-select
          width 100%
          min-width auto
          padding 14px 16px
          font-size 0.9rem
          border-radius 8px
          border 2px solid #e8e8e8
          
          &:focus
            border-color #ff8c00
            box-shadow 0 0 0 3px rgba(255, 140, 0, 0.1)
        
        i
          font-size 0.9rem
          right 12px
      
      .form-select
        min-width auto
        width 100%
        padding 14px 16px
        font-size 0.9rem
        border-radius 8px
        background white
        cursor pointer
        
        &:focus
          border-color #ff8c00
          box-shadow 0 0 0 3px rgba(255, 140, 0, 0.1)
    
    // Campos específicos para ubicación
    .department-field, .province-field
      .form-select
        min-width auto
        width 100%
    
    .district-select, .agency-select
      min-width auto
      width 100%
  
  .step-actions
    flex-direction column
    gap 15px
    margin-top -2px
    
    button
      width 100%
    
    // Cambiar orden de botones en móvil: Confirmar y Pagar primero, Volver después
    .process-btn
      order 1
    
    .back-btn
      order 2

@media (max-width: 480px)
  .checkout-process
    padding 20px
  
  .cart-summary
    padding 20px
    min-width 100%
    min-height auto
    height auto
    z-index 10
    margin-top 0
    order 2
    
  .checkout-process
    order 1
    width 100%
    max-width 100%
    margin 0
    margin-top -35px
  
  .top-progress-bar
    padding 20px 15px
    margin-right auto
    max-width 400px
    margin-bottom 25px
    margin-top -15px
    
    &::before, &::after
      left 20px
      right 20px
      height 7px
      border-radius 5px
      top 50%
      transform translateY(-50%)
    
    &::after
      left 20px
      width calc((100% - 40px) * (var(--current-step, 1) / 3))
      max-width calc(100% - 40px)
    
    .progress-step
      .step-number
        width 45px
        height 45px
        font-size 1rem
        font-weight 700
        border 2px solid #e0e0e0
        box-shadow 0 2px 10px rgba(0,0,0,0.08)
      
      .step-label
        font-size 0.9rem
        font-weight 600
        margin-top 6px
        letter-spacing 0.1px
      
      &.active
        .step-number
          border-color #d209b6
          box-shadow 0 3px 14px #d209b633
          transform scale(1.03)
        
        .step-label
          color #333
          font-weight 700
  
  // Mejoras adicionales para pantallas muy pequeñas
  .delivery-options
    margin-bottom 15px
    border-radius 10px
    
  .delivery-header
    padding 12px 15px
    
    h3
      font-size 1.1rem
  
  .delivery-content
    padding 15px 0
    
  .delivery-description
    padding 0 15px 12px 15px
    
    p
      font-size 0.9rem
  
  .delivery-methods
    margin 0 15px 15px 15px
    gap 10px
  
  .delivery-method
    padding 14px 16px
    font-size 0.9rem
    min-height 48px
    border-radius 10px
  
  .pickup-center
    padding 0 15px
    
  .pickup-selector
    margin-bottom 15px
    
    label
      font-size 0.9rem
      margin-bottom 8px
  
  .pickup-select
    padding 12px 14px
    font-size 0.9rem
    min-height 48px
    border-radius 8px

// Fix para resetear el estado de enfoque del campo de documento
.boleta-fields .input-with-icon input:not(:focus)
  border-color #e8e8e8 !important
  box-shadow 0 2px 8px rgba(0,0,0,0.08) !important
  transform translateY(0) !important
  background linear-gradient(135deg, #ffffff 0%, #fafafa 100%) !important

// Estilos para el mapa de Leaflet
#map
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.15)
  transition all 0.3s ease
  
  &:hover
    box-shadow 0 6px 25px rgba(0,0,0,0.2)
    transform translateY(-2px)

.map-info
  padding 12px 15px
  background white
  border-radius 0 0 12px 12px
  border-top 1px solid #e0e0e0
  
  .map-location-label
    font-weight 600
    color #ff8c00
    margin-bottom 5px
    font-size 0.9rem
  
  .location-name
    font-weight 600
    color #333
    margin-bottom 8px
    font-size 1rem
  
  .map-link
    color #d209b6
    text-decoration none
    font-weight 500
    font-size 0.85rem
    
    &:hover
      text-decoration underline

.map-container
  background white
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.15)
  overflow hidden

// Estilos para el marcador personalizado
.custom-marker
  background transparent !important
  border none !important

// Estilos para el popup
.leaflet-popup-content-wrapper
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.15)

.leaflet-popup-content
  margin 0
  padding 0

// Estilos para la información de zona de delivery
.delivery-cost-info
  margin-top 25px
  animation slideInUp 0.5s ease-out

.zone-info-card
  background linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%)
  border 2px solid #ff8c00
  border-radius 15px
  padding 25px
  box-shadow 0 4px 20px rgba(255,140,0,0.15)
  position relative
  overflow hidden
  
  &::before
    content ''
    position absolute
    top 0
    left 0
    right 0
    height 4px
    background linear-gradient(90deg, #ff8c00 0%, #f57c00 100%)
  
  h4
    color #e65100
    font-size 1.2rem
    font-weight 700
    margin 0 0 15px 0
    display flex
    align-items center
    gap 8px
  
  .zone-details
    p
      margin 8px 0
      color #333
      font-size 1rem
      
      strong
        color #e65100
        font-weight 600
  
  .price-highlight
    background linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)
    color white
    padding 4px 12px
    border-radius 20px
    font-size 1.1rem
    font-weight 700
    box-shadow 0 2px 8px rgba(76,175,80,0.3)
  
  .delivery-note
    background rgba(76,175,80,0.1)
    border-left 4px solid #4caf50
    padding 10px 15px
    margin-top 15px
    border-radius 8px
    font-size 0.9rem
    color #2e7d32
    font-weight 500

// Animación para la información de zona
@keyframes slideInUp
  from
    opacity 0
    transform translateY(20px)
  to
    opacity 1
    transform translateY(0)

// Responsive para la información de delivery
@media (max-width: 768px)
  .zone-info-card
    padding 20px
    
  .zone-info-card h4
    font-size 1.1rem
    
  .price-highlight
    font-size 1rem

// Estilos para la nueva card de delivery
.delivery-card
  background linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)
  border-radius 16px
  margin 20px 0
  padding 0
  box-shadow 0 8px 25px rgba(255, 140, 0, 0.25)
  overflow hidden
  position relative
  
  &::before
    content ''
    position absolute
    top 0
    right 0
    width 120px
    height 120px
    background url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/><circle cx="30" cy="30" r="15" fill="rgba(255,255,255,0.05)"/></svg>')
    background-size contain
    opacity 0.3

.delivery-card-header
  display flex
  align-items center
  padding 20px 20px 15px 20px
  
.delivery-icon
  font-size 2rem
  margin-right 12px
  filter drop-shadow(0 2px 4px rgba(0,0,0,0.1))
  
.delivery-card-header h3
  color white
  font-size 1.3rem
  font-weight 600
  margin 0
  text-shadow 0 1px 2px rgba(0,0,0,0.1)

.delivery-card-body
  padding 0 20px 20px 20px

.delivery-info
  display flex
  justify-content space-between
  align-items center
  margin-bottom 15px

.delivery-zone, .delivery-agency
  display flex
  flex-direction column
  
.zone-label, .agency-label, .price-label
  color rgba(255,255,255,0.8)
  font-size 0.85rem
  font-weight 500
  margin-bottom 4px
  text-transform uppercase
  letter-spacing 0.5px

.zone-name, .agency-name
  color white
  font-size 1.1rem
  font-weight 600
  text-shadow 0 1px 2px rgba(0,0,0,0.1)

.delivery-price
  display flex
  flex-direction column
  align-items flex-end

.price-value
  color white
  font-size 1.4rem
  font-weight 700
  text-shadow 0 1px 2px rgba(0,0,0,0.2)
  
.delivery-note
  display flex
  align-items center
  padding 12px 16px
  background rgba(255,255,255,0.15)
  border-radius 10px
  backdrop-filter blur(10px)
  
.note-icon
  font-size 1.1rem
  margin-right 8px

.note-text
  color white
  font-size 0.9rem
  font-weight 500
  text-shadow 0 1px 2px rgba(0,0,0,0.1)

// Responsive para la card de delivery
@media (max-width: 768px)
  .delivery-card
    margin 15px 0
    
  .delivery-card-header
    padding 16px 16px 12px 16px
    
  .delivery-icon
    font-size 1.8rem
    
  .delivery-card-header h3
    font-size 1.2rem
    
  .delivery-card-body
    padding 0 16px 16px 16px
    
  .delivery-info
    flex-direction column
    align-items flex-start
    gap 12px
    
  .delivery-price
    align-items flex-start
    
  .delivery-note
    padding 10px 12px
    
  .note-text
    font-size 0.85rem

.file-label
  // ... existing code ...

.voucher-preview-img
  max-width 150px
  max-height 150px
  border-radius 8px
  margin-top 15px
  border 1px solid #e0e0e0
  box-shadow 0 2px 8px rgba(0,0,0,0.1)

.voucher-payment-fields
  background #f8f9fa
  border-radius 10px
  padding 20px
  margin 20px 0
  border 1px solid #e0e0e0

// Estilos para el desplegable de bancos
.dropdown-arrow
  margin-left auto
  transition transform 0.3s ease
  font-size 0.8rem
  color #D209B6
  
  &.rotated
    transform rotate(180deg)

.bank-options
  margin -10px 0 15px 0
  padding-left 0
  
  .bank-option-card
    background #f8f9fa
    border-radius 8px
    margin-bottom 3px
    padding 12px 15px
    border 1px solid #e0e0e0
    cursor pointer
    transition all 0.3s ease
    width 100%
    
    &:last-child
      margin-bottom 0
    
    &:hover
      background #e9ecef
      border-color #D209B6
    
    &.selected
      background #D209B6
      border-color #D209B6
      color white
      
    span
      font-size 0.95rem
      font-weight 500
      color inherit

// Estilos para la tarjeta de información del banco
.bank-info-card
  background #f8f9fa
  border-radius 8px
  padding 15px
  margin 10px 0
  border 1px solid #e0e0e0
  
  .bank-info-item
    display flex
    justify-content space-between
    margin-bottom 8px
    font-size 0.95rem
    padding 4px 0
    
    &:last-child
      margin-bottom 0
    
    strong
      font-weight 600
      color #333
      min-width 60px
  
  .form-field-simple
    margin-bottom 20px
    
    &:last-child
      margin-bottom 0
    
    label
      display block
      margin-bottom 8px
      font-weight 600
      color #333
      font-size 0.95rem
    
    input[type="text"]
      width 100%
      padding 12px 15px
      border 1px solid #e0e0e0
      border-radius 6px
      font-size 0.95rem
      color #333
      background white
      transition all 0.3s ease
      
      &:focus
        outline none
        border-color #D209B6
        box-shadow 0 0 0 2px rgba(210, 9, 182, 0.1)
      
      &::placeholder
        color #999
        font-size 0.9rem

.payment-section
  .error-message, .success-message
    display flex
    align-items center
    justify-content center
    margin-top 20px
    padding 10px 20px
    border-radius 8px
    font-size 1rem
    font-weight 600

  .error-message
    background #ffcccc
    color #cc0000

  .success-message
    background #ccffcc
    color #00cc00

.balance-option
  margin-bottom 15px

.balance-checkbox
  display flex
  align-items center
  font-weight 500
  color #333

.checkmark
  width 20px
  height 20px
  border 2px solid #d209b6
  border-radius 4px
  margin-right 10px
  transition all 0.3s ease
  position relative // Añadir para posicionar el icono
  
  &::after // Estilo para el icono de check
    content '\f00c' // Código Unicode para el icono de check de Font Awesome
    font-family '"Font Awesome 5 Free"', "Font Awesome 5 Pro" // Especificar la fuente del icono
    font-weight 900 // Para iconos sólidos de Font Awesome
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%) scale(0) // Inicialmente oculto y escalado a 0
    color white
    font-size 14px
    transition all 0.3s ease // Transición para la aparición del icono

.balance-checkbox input[type="checkbox"]
  display none

.balance-checkbox input[type="checkbox"]:checked + .checkmark
  background-color #d209b6
  border-color #d209b633
  
  &::after
    transform translate(-50%, -50%) scale(1) // Mostrar el icono cuando esté marcado

.balance-text
  font-size 0.9rem
  color #555

.balance-details
  margin-top 5px
  padding-left 15px

.balance-item
  display flex
  justify-content space-between
  margin-bottom 2px
  font-size 0.8rem
  color #666

.balance-amount
  font-weight 600
  color #333

// Contenedor para las dos cards en el paso 3
.three-cards-container
  display grid
  grid-template-columns 445px 445px
  grid-template-rows auto auto
  gap 30px
  justify-content center
  max-width 950px
  margin 0 auto
  align-items start
  
  // Primera fila: Datos de Despacho (ocupa toda la fila)
  .delivery-data-card
    grid-column 1 / 2
    grid-row 1 / 3
    align-self start
    
  // Segunda fila: Datos del Comprobante arriba de Método de Pago
  .voucher-data-card
    grid-column 2 / 3
    grid-row 1 / 2
    align-self start
    
  .payment-card
    grid-column 2 / 3
    grid-row 2 / 3
    align-self start

// Estilos para las cards principales
.delivery-data-card
  background white
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.1)
  overflow hidden
  border 1px solid #e8e8e8
  width 445px
  height auto
  min-height auto
  display flex
  flex-direction column

.payment-card
  background white
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.1)
  overflow hidden
  border 1px solid #e8e8e8
  width 445px
  height auto
  min-height 500px
  display flex
  flex-direction column

// Card de Datos del Comprobante más pequeña
.voucher-data-card
  background white
  border-radius 12px
  box-shadow 0 4px 20px rgba(0,0,0,0.1)
  overflow hidden
  border 1px solid #e8e8e8
  width 445px
  height auto
  min-height 200px
  display flex
  flex-direction column

// Headers de las cards - todos con la misma altura compacta
.delivery-data-header, .voucher-data-header, .payment-card-header
  background #d209b6
  padding 15px 20px
  margin 0
  
  h3
    color white
    font-size 1.1rem
    font-weight 600
    margin 0
    text-align left
  
  p
    color rgba(255,255,255,0.9)
    font-size 0.9rem
    margin 5px 0 0 0

// Contenido de las cards
.delivery-data-content
  padding 25px
  flex 1
  display flex
  flex-direction column
  overflow visible

// Contenido más compacto para la card de pago
.payment-card-content
  padding 15px
  flex 1
  display flex
  flex-direction column
  overflow-y auto

// Instrucción de pago dentro del contenido
.payment-instruction
  margin-bottom 20px
  
  p
    color #333
    font-size 0.9rem
    font-weight 500
    margin 0
    text-align left

// Contenido más compacto para la card de comprobante
.voucher-data-content
  padding 20px
  flex 1
  display flex
  flex-direction column
  overflow visible

.delivery-info-section
  background transparent
  padding 0

.delivery-info-item
  display flex
  flex-direction column
  margin-bottom 20px
  padding 0
  
  &:last-child
    margin-bottom 0
  
  .delivery-label
    color #d209b6
    font-size 0.9rem
    font-weight 600
    margin-bottom 8px
    text-transform none
    letter-spacing 0
  
.delivery-value
  color #333
  font-size 0.9rem
  font-weight 400
  line-height 1.5
  text-align left
  
  .whatsapp-icon
    color #25d366
    margin-left 6px
    font-size 0.9rem
    vertical-align middle

// Estilos específicos para la sección de ubicación en mapa en datos de despacho
.map-location-section
  display flex
  flex-direction column
  margin-bottom 0
  padding 0
  
  .map-location-label
    color #ff8c00
    font-size 0.9rem
    font-weight 600
    margin-bottom 5px
    text-transform none
    letter-spacing 0
    
  .map-link
    color #ff8c00
    text-decoration none
    font-weight 500
    font-size 0.85rem
    
    &:hover
      text-decoration underline

// Estilos específicos para la card de Datos del Comprobante
.voucher-info-item
  display flex
  flex-direction column
  margin-bottom 12px
  padding 8px 0
  
  &:last-child
    margin-bottom 0

// Fila para dos elementos (Serie y Correlativo)
.voucher-row
  display flex
  gap 15px
  margin-bottom 12px

// Fila para tres elementos (Tipo Documento, Serie, Correlativo)
.voucher-row-three
  display flex
  gap 15px
  margin-bottom 12px
  justify-content space-between

// Elementos de media columna
.half-width
  flex 1
  margin-bottom 0
  padding 8px 0

// Elementos de un tercio de columna
.third-width
  flex 1
  margin-bottom 0
  padding 8px 0
  
  // Elemento del medio (Serie) con más espacio
  &:nth-child(2)
    flex 1.2
    text-align center

.voucher-label
  color #d209b6
  font-size 0.85rem
  font-weight 600
  text-transform none
  letter-spacing 0
  margin-bottom 4px

.voucher-value
  color #333
  font-size 0.9rem
  font-weight 500
  text-align left
    
    .whatsapp-icon
      color #25d366
      margin-left 6px
      font-size 1rem
      vertical-align middle

.map-link
  color #ff8c00
  text-decoration none
  font-weight 500
  padding 0
  background transparent
  border-radius 0
  transition all 0.3s ease
  display inline-block
  
  &:hover
    color #9f00ad
    text-decoration underline

// Responsive para el layout de tres cards
@media (max-width: 1400px)
  .three-cards-container
    grid-template-columns 445px 445px
    gap 20px
    justify-content center
    max-width 950px

@media (max-width: 950px)
  .three-cards-container
    grid-template-columns 445px
    gap 20px
    justify-content center
    max-width 500px
    
  .delivery-data-card, .voucher-data-card, .payment-card
    margin 0
    
  .delivery-data-header, .voucher-data-header, .payment-card-header
    padding 16px 20px
    
    h3
      font-size 1.1rem
    
  .delivery-data-content, .voucher-data-content, .payment-card-content
    padding 20px
    
  .delivery-info-item
    margin-bottom 18px
    
    .delivery-label
      font-size 0.85rem
      margin-bottom 6px
    
    .delivery-value
      font-size 0.95rem

// Responsive para móvil - orden específico como en la imagen
@media (max-width: 768px)
  .three-cards-container
    display flex
    flex-direction column
    gap 15px
    max-width 100%
    width 100%
    padding 0 10px
    
  // Orden específico para móvil:
  // 1. Método de Pago (primero)
  .payment-card
    order 1
    width 100%
    max-width 100%
    margin 0
    border-radius 8px
    
  // 2. Datos del Comprobante (segundo)
  .voucher-data-card
    order 2
    width 100%
    max-width 100%
    margin 0
    border-radius 8px
    
  // 3. Datos de Despacho (tercero)
  .delivery-data-card
    order 3
    width 100%
    max-width 100%
    margin 0
    border-radius 8px
    height auto
    min-height auto
    
  // Headers más compactos para móvil
  .voucher-data-header, .payment-card-header, .delivery-data-header
    padding 12px 16px
    
    h3
      font-size 1rem
      text-align center
      font-weight 700
  
  // Contenido más compacto para móvil
  .voucher-data-content, .payment-card-content, .delivery-data-content
    padding 15px
    
  // Mejoras específicas para Datos del Comprobante en móvil
  .voucher-data-card
    .voucher-row-three
      display flex
      flex-direction column
      gap 10px
      
    .voucher-info-item
      margin-bottom 8px
      padding 6px 0
      text-align left
      
      .voucher-label
        font-size 0.85rem
        font-weight 600
        color #d209b6
        margin-bottom 4px
        
      .voucher-value
        font-size 0.9rem
        font-weight 500
        color #333
      
      // Específicamente para el campo Serie en móvil
      &.third-width:nth-child(2)
        text-align left
        flex 1
  
  // Mejoras específicas para Método de Pago en móvil
  .payment-card
    .payment-instruction
      margin-bottom 15px
      text-align center
      
      p
        font-size 0.9rem
        color #666
    
    .balance-option
      margin-bottom 15px
      
    .payment-options
      .payment-option
        margin-bottom 12px
        padding 12px
        border-radius 8px
        border 2px solid #e0e0e0
        
        &:hover
          border-color #ff8c00
          background #f8f9fa
        
        &.selected
          border-color #ff8c00
          background #fff8f0
          
        .payment-option-content
          display flex
          align-items center
          gap 10px
          
          .payment-icon
            font-size 1.2rem
            color #ff8c00
            
          .payment-text
            font-size 0.9rem
            font-weight 500
            color #333
  
  // Mejoras específicas para Datos de Despacho en móvil
  .delivery-data-card
    .delivery-info-item
      margin-bottom 12px
      padding 8px 0
      
      .delivery-label
        font-size 0.85rem
        font-weight 600
        color #666
        margin-bottom 4px
        
      .delivery-value
        font-size 0.9rem
        font-weight 500
        color #333
        
    .map-container
      margin-top 15px
      
      #map
        height 200px
        border-radius 8px

// Responsive para pantallas muy pequeñas (480px)
@media (max-width: 480px)
  .three-cards-container
    padding 0 5px
    gap 12px
    
  .voucher-data-card, .payment-card, .delivery-data-card
    border-radius 6px
    
  .voucher-data-header, .payment-card-header, .delivery-data-header
    padding 10px 12px
    
    h3
      font-size 0.95rem
  
  .voucher-data-content, .payment-card-content, .delivery-data-content
    padding 12px
    
  // Mejoras para Datos del Comprobante en pantallas muy pequeñas
  .voucher-data-card
    .voucher-row-three
      gap 8px
      
    .voucher-info-item
      margin-bottom 6px
      padding 4px 0
      text-align left
      
      .voucher-label
        font-size 0.8rem
        
      .voucher-value
        font-size 0.85rem
      
      // Específicamente para el campo Serie en pantallas muy pequeñas
      &.third-width:nth-child(2)
        text-align left
        flex 1
  
  // Mejoras para Método de Pago en pantallas muy pequeñas
  .payment-card
    .payment-instruction
      margin-bottom 12px
      
      p
        font-size 0.85rem
    
    .balance-option
      margin-bottom 12px
      
    .payment-options
      .payment-option
        margin-bottom 10px
        padding 10px
        
        .payment-option-content
          gap 8px
          
          .payment-icon
            font-size 1.1rem
            
          .payment-text
            font-size 0.85rem
  
  // Mejoras para Datos de Despacho en pantallas muy pequeñas
  .delivery-data-card
    .delivery-info-item
      margin-bottom 10px
      padding 6px 0
      
      .delivery-label
        font-size 0.8rem
        
      .delivery-value
        font-size 0.85rem
        
    .map-container
      margin-top 12px
      
      #map
        height 180px
        border-radius 6px
  
  // Mejoras adicionales para formularios de delivery en pantallas muy pequeñas
  .delivery-form
    padding 15px
    margin-top 15px
    
    .form-section
      margin-bottom 20px
      
      h4
        font-size 1rem
        margin-bottom 12px
    
    .form-row
      gap 12px
      margin-bottom 12px
    
    .form-group
      margin-bottom 12px
      
      label
        font-size 0.85rem
        margin-bottom 5px

  // Mejoras adicionales para formularios de pickup en pantallas muy pequeñas
  .pickup-form
    padding 15px
    margin-top 15px
    
    .pickup-section
      margin-bottom 20px
      
      h4
        font-size 1rem
        margin-bottom 12px
        margin-top 10px
    
    .form-row
      gap 12px
      margin-bottom 12px
    
    .form-group
      margin-bottom 12px
      
      label
        font-size 0.85rem
        margin-bottom 5px
      
      .input-with-icon
        input, .form-select
          padding 12px 14px
          font-size 0.85rem
          border-radius 6px
        
        i
          font-size 0.85rem
          right 10px
      
      .form-select
        padding 12px 14px
        font-size 0.85rem
        border-radius 6px

.small-map-container
  margin-top 10px
  
  #small-map
    border-radius 8px
    box-shadow 0 2px 12px rgba(0,0,0,0.1)
    transition all 0.3s ease
    border 1px solid #e8e8e8
    
    &:hover
      box-shadow 0 4px 16px rgba(0,0,0,0.15)
      transform translateY(-1px)
  
  .map-links
    margin-top 8px
    text-align center
    
    .map-link
      color #d209b6
      text-decoration none
      font-weight 500
      font-size 0.85rem
      padding 4px 8px
      border-radius 4px
      transition all 0.3s ease
      display inline-block
      
      &:hover
        background #d209b633
        text-decoration underline

// Estilos para el marcador pequeño
.custom-marker-small
  background transparent !important
  border none !important

// Estilos para la sección del mapa en datos de despacho
.map-section
  .map-location-label
    color #d209b6
    font-size 0.9rem
    font-weight 600
    margin-bottom 8px
    text-transform none
    letter-spacing 0
</style> 