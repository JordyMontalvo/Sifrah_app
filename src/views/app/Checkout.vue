<template>
  <App>
    <!-- Contenedor padre unificado para prevenir distorsión con zoom -->
    <div class="checkout-unified-wrapper">
      


      <div class="checkout-container">
        
        <div class="checkout-content">
          <!-- Columna izquierda - Resumen del carrito -->
          <div class="cart-summary">
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
                  <div class="cart-item-price">S/ {{ getProductPrice(item) }} - {{ item.points }} pts</div>
                </div>
              </div>
            </div>

            <!-- Resumen de la orden -->
            <div class="order-summary">
              <div class="summary-row">
                <span>Total productos:</span>
                <span>{{ cartItems.length }} items</span>
              </div>
              <div class="summary-row">
                <span>Puntos:</span>
                <span>{{ cartPoints.toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>S/ {{ cartTotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Botón para volver a la tienda -->
            <div class="return-to-store">
              <p>¿Olvidaste algún producto?</p>
              <button @click="returnToStore" class="return-btn">
                Volver a la tienda
              </button>
            </div>
          </div>

          <!-- Columna derecha - Proceso de checkout -->
          <div class="checkout-process">

            <!-- Barra de progreso (siempre visible) -->
            <div class="top-progress-bar" :style="{ '--current-step': currentStep }">
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
            
            <div class="delivery-description">
              <p>Elije tu método de despacho preferido.</p>
            </div>
                
                <div class="delivery-methods">
                  <button 
                    @click="selectDeliveryMethod('pickup')" 
                    :class="['delivery-method', { active: deliveryMethod === 'pickup' }]"
                  >
                    Retira tu compra
                  </button>
                  <button 
                    @click="selectDeliveryMethod('delivery')" 
                    :class="['delivery-method', { active: deliveryMethod === 'delivery' }]"
                  >
                    Delivery
                  </button>
                </div>
                
                <!-- Formulario de Delivery -->
                <div v-if="deliveryMethod === 'delivery'" class="delivery-form">
                  <div class="form-section">
                    <h4>Información del Receptor</h4>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label>Nombre Receptor</label>
                        <div class="input-with-icon">
                          <input v-model="deliveryData.recipientName" type="text" placeholder="Nombre Completo" required />
                          <i class="fas fa-user"></i>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Documento</label>
                        <div class="input-with-icon">
                          <input v-model="deliveryData.document" type="text" placeholder="Nro. de Documento" required />
                          <i class="fas fa-list"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Celular Receptor</label>
                      <div class="input-with-icon">
                        <input v-model="deliveryData.recipientPhone" type="tel" placeholder="Celular Receptor" required />
                        <i class="fas fa-phone"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-section">
                    <h4>Ubicación de Entrega</h4>
                    
                    <div class="form-row">
                                              <div class="form-group">
                          <label>Departamento</label>
                          <select v-model="deliveryData.department" class="form-select" @change="onDepartmentChange">
                            <option value="">Selecciona</option>
                            <option value="lima">Lima</option>
                            <option value="arequipa">Arequipa</option>
                            <option value="cusco">Cusco</option>
                            <option value="piura">Piura</option>
                            <option value="la-libertad">La Libertad</option>
                            <option value="lambayeque">Lambayeque</option>
                            <option value="junin">Junín</option>
                          </select>
                        </div>
                        
                        <div class="form-group">
                          <label>Provincia</label>
                          <select v-model="deliveryData.province" class="form-select" @change="onProvinceChange">
                            <option value="">Selecciona</option>
                            <option v-for="province in availableProvinces" :key="province.value" :value="province.value">
                              {{ province.name }}
                            </option>
                          </select>
                        </div>
                      
                        <div class="form-group">
                          <label>Distrito</label>
                          <select v-model="deliveryData.district" class="form-select">
                            <option value="">Selecciona</option>
                            <option v-for="district in availableDistricts" :key="district" :value="district">
                              {{ district }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Campo de Agencia (solo para envíos fuera de Lima) -->
                    <div v-if="showAgencyField" class="form-section agency-section">
                      <h4>Agencia de Transporte</h4>
                      <div class="form-group">
                        <label>Agencia</label>
                        <select v-model="deliveryData.agency" class="form-select">
                          <option value="">Seleccione el PDE</option>
                          <option value="olva">Olva Courier</option>
                          <option value="serpost">Serpost</option>
                          <option value="dhl">DHL Express</option>
                          <option value="fedex">FedEx</option>
                          <option value="cruz-del-sur">Cruz del Sur</option>
                        </select>
                      </div>
                    </div>
                    
                    <div v-if="showAgencyField" class="delivery-note">
                      <p>*En caso de no haber cargo por delivery, el pago del delivery será al momento de la entrega.</p>
                    </div>
                </div>
              </div>

              <!-- Centro de Recojo -->
              <div v-if="deliveryMethod === 'pickup'" class="pickup-center">
                <div class="section-header">
                  <h3>Centro de Recojo</h3>
                </div>
                
                <div class="pickup-selector">
                  <label>Seleccione el PDE</label>
                  <select v-model="selectedPickupPoint" class="pickup-select">
                    <option value="">Selecciona un punto de entrega</option>
                    <option v-for="point in pickupPoints" :key="point.id" :value="point.id">
                      {{ point.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Ubicación en mapa y información -->
              <div v-if="selectedPickupPoint && deliveryMethod === 'pickup'" class="map-and-location-container">
                <div class="section-header">
                  <h3>Ubicación en mapa</h3>
                </div>
                
                <div class="map-location-grid">
                  <!-- Columna izquierda: Mapa -->
                  <div class="map-column">
                    <div class="map-container">
                      <div class="map-embed">
                        <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3904.1234567890123!2d-77.01234567890123!3d-12.01234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAwJzQ0LjQiUyA3N8KwMDAnNDQuNCJX!5e0!3m2!1ses!2spe!4v1234567890123"
                          width="100%" 
                          height="300" 
                          style="border:0;" 
                          allowfullscreen="" 
                          loading="lazy" 
                          referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                      </div>
                      <div class="map-info">
                        <div class="location-name">Agatas, San Juan de Lurigancho 15434</div>
                        <a href="#" class="map-link">Ampliar el mapa</a>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Columna derecha: Información de ubicación -->
                  <div class="location-column">
                    <div class="location-header">
                      <h3>Ubicación</h3>
                    </div>
                    
                    <div class="location-details">
                      <div class="location-main">
                        <strong>LIMA - LIMA - ATE - CERES</strong>
                      </div>
                      
                      <div class="location-item">
                        <span class="location-label">Dirección:</span>
                        <span class="location-value">Av. Nicolás Ayllón N° 5024 - Ate</span>
                      </div>
                      
                      <div class="location-item">
                        <span class="location-label">Teléfono:</span>
                        <span class="location-value">+51 959 141 444 <i class="fab fa-whatsapp whatsapp-icon"></i></span>
                      </div>
                      
                      <div class="location-item">
                        <span class="location-label">Horario:</span>
                        <span class="location-value">Atención previa coordinación por WhatsApp</span>
                      </div>
                      
                      <div class="location-item">
                        <span class="location-label">Días:</span>
                        <span class="location-value">L - V: 9 am a 6 pm</span>
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
                        <input v-model="proofData.document" type="text" placeholder="Nro. de Documento" required />
                        <i class="fas fa-user"></i>
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
                          <input v-model="proofData.ruc" type="text" placeholder="Número de RUC" required />
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
                <button @click="previousStep" class="back-btn">
                  << Regresar
                </button>
                <button 
                  @click="processOrder" 
                  :disabled="!canProceedToProofStep"
                  class="continue-btn"
                >
                  Terminar Pedido
                </button>
              </div>
            </div>

            <!-- Paso 3: Facturación -->
            <div v-if="currentStep === 3" class="checkout-step">
              <div class="billing-section">
                <div class="section-header">
                  <h3>Información de Facturación</h3>
                  <p>Completa tus datos para la facturación.</p>
                </div>
                
                <div class="billing-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Nombre</label>
                      <input v-model="billingData.firstName" type="text" placeholder="Tu nombre" required />
                    </div>
                    <div class="form-group">
                      <label>Apellido</label>
                      <input v-model="billingData.lastName" type="text" placeholder="Tu apellido" required />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Email</label>
                    <input v-model="billingData.email" type="email" placeholder="tu@email.com" required />
                  </div>
                  
                  <div class="form-group">
                    <label>Teléfono</label>
                    <input v-model="billingData.phone" type="tel" placeholder="+51 999 999 999" required />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>Ciudad</label>
                      <input v-model="billingData.city" type="text" placeholder="Lima" required />
                    </div>
                    <div class="form-group">
                      <label>Código Postal</label>
                      <input v-model="billingData.zipCode" type="text" placeholder="15001" />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Dirección</label>
                    <textarea v-model="billingData.address" placeholder="Tu dirección completa" required></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Botones de navegación -->
              <div class="step-actions">
                <button @click="previousStep" class="back-btn">
                  << Volver
                </button>
                <button 
                  @click="nextStep" 
                  :disabled="!canProceedToNextStep"
                  class="continue-btn"
                >
                  Continuar >>
                </button>
              </div>
            </div>

            <!-- Paso 3: Pago -->
            <div v-if="currentStep === 4" class="checkout-step">
              <div class="payment-section">
                <div class="section-header">
                  <h3>Método de Pago</h3>
                  <p>Selecciona tu método de pago preferido.</p>
                </div>
                
                <div class="payment-methods">
                  <div class="payment-method">
                    <input 
                      type="radio" 
                      id="credit-card" 
                      name="payment" 
                      value="credit-card"
                      v-model="paymentMethod"
                    />
                    <label for="credit-card">
                      <i class="fas fa-credit-card"></i>
                      <span>Tarjeta de Crédito/Débito</span>
                    </label>
                  </div>
                  
                  <div class="payment-method">
                    <input 
                      type="radio" 
                      id="transfer" 
                      name="payment" 
                      value="transfer"
                      v-model="paymentMethod"
                    />
                    <label for="transfer">
                      <i class="fas fa-university"></i>
                      <span>Transferencia Bancaria</span>
                    </label>
                  </div>
                  
                  <div class="payment-method">
                    <input 
                      type="radio" 
                      id="cash" 
                      name="payment" 
                      value="cash"
                      v-model="paymentMethod"
                    />
                    <label for="cash">
                      <i class="fas fa-money-bill-wave"></i>
                      <span>Efectivo</span>
                    </label>
                  </div>
                </div>
                
                <!-- Información de transferencia -->
                <div v-if="paymentMethod === 'transfer'" class="transfer-info">
                  <div class="section-header">
                    <h3>Datos Bancarios</h3>
                  </div>
                  
                  <div class="bank-details">
                    <div class="bank-item">
                      <strong>Banco:</strong> Banco de Crédito del Perú
                    </div>
                    <div class="bank-item">
                      <strong>Cuenta:</strong> 193-12345678-0-12
                    </div>
                    <div class="bank-item">
                      <strong>Titular:</strong> SIFRAH SAC
                    </div>
                    <div class="bank-item">
                      <strong>Tipo:</strong> Cuenta Corriente
                    </div>
                  </div>
                </div>
                
                <!-- Resumen final -->
                <div class="final-summary">
                  <div class="summary-header">
                    <h3>Resumen de tu Orden</h3>
                  </div>
                  
                  <div class="summary-details">
                    <div class="summary-item">
                      <span>Subtotal:</span>
                      <span>S/ {{ cartTotal.toFixed(2) }}</span>
                    </div>
                    <div class="summary-item">
                      <span>Envío:</span>
                      <span>S/ 0.00</span>
                    </div>
                    <div class="summary-item total">
                      <span>Total:</span>
                      <span>S/ {{ cartTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botones finales -->
              <div class="step-actions">
                <button @click="previousStep" class="back-btn">
                  << Volver
                </button>
                <button 
                  @click="processOrder" 
                  :disabled="!canProcessOrder"
                  class="process-btn"
                >
                  Confirmar y Pagar
                </button>
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
      paymentMethod: '',
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
      
      // Puntos de recogida
      pickupPoints: [
        {
          id: 1,
          name: 'Agatas - San Juan de Lurigancho',
          address: 'Jr las Agatas 449 - Urb. San Carlos',
          phone: '+51 908 804 551',
          hours: 'L - V: 9 am - 6:00pm'
        },
        {
          id: 2,
          name: 'Centro - Lima',
          address: 'Av. Arequipa 123 - Lima',
          phone: '+51 908 804 552',
          hours: 'L - S: 9 am - 8:00pm'
        }
      ],
      
      // Datos del usuario (simulados)
      userBalance: 150.00,
      
      // Datos geográficos del Perú
      peruData: {
        lima: {
          name: 'Lima',
          provincias: {
            lima: {
              name: 'Lima',
              distritos: ['Lima', 'Miraflores', 'San Isidro', 'Barranco', 'Chorrillos', 'Surco', 'San Borja', 'La Molina', 'Santiago de Surco', 'Villa El Salvador']
            },
            callao: {
              name: 'Callao',
              distritos: ['Callao', 'Bellavista', 'Carmen de la Legua', 'La Perla', 'La Punta', 'Ventanilla']
            }
          }
        },
        arequipa: {
          name: 'Arequipa',
          provincias: {
            arequipa: {
              name: 'Arequipa',
              distritos: ['Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vitor', 'Yanahuara', 'Yarabamba', 'Yura']
            },
            camana: {
              name: 'Camaná',
              distritos: ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Piérola', 'Ocoña', 'Quilca']
            }
          }
        },
        cusco: {
          name: 'Cusco',
          provincias: {
            cusco: {
              name: 'Cusco',
              distritos: ['Cusco', 'Ccorca', 'Poroy', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Wanchaq']
            },
            urubamba: {
              name: 'Urubamba',
              distritos: ['Urubamba', 'Chinchero', 'Huayllabamba', 'Machupicchu', 'Maras', 'Ollantaytambo', 'Yucay']
            }
          }
        },
        piura: {
          name: 'Piura',
          provincias: {
            piura: {
              name: 'Piura',
              distritos: ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallán', 'La Arena', 'La Unión', 'Las Lomas', 'Tambo Grande', 'Veintiséis de Octubre']
            },
            talara: {
              name: 'Talara',
              distritos: ['Talara', 'El Alto', 'La Brea', 'Lobitos', 'Los Organos', 'Mancora', 'Pariñas']
            }
          }
        },
        'la-libertad': {
          name: 'La Libertad',
          provincias: {
            trujillo: {
              name: 'Trujillo',
              distritos: ['Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Victor Larco Herrera']
            },
            chepen: {
              name: 'Chepén',
              distritos: ['Chepén', 'Pacanga', 'Pueblo Nuevo']
            }
          }
        },
        lambayeque: {
          name: 'Lambayeque',
          provincias: {
            chiclayo: {
              name: 'Chiclayo',
              distritos: ['Chiclayo', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefú', 'Nueva Arica', 'Oyotún', 'Picsi', 'Pimentel', 'Reque', 'Santa Rosa', 'Saña', 'Tuman']
            },
            lambayeque: {
              name: 'Lambayeque',
              distritos: ['Lambayeque', 'Chochope', 'Illimo', 'Jayanca', 'Mochumi', 'Mórrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Tucume']
            }
          }
        },
        junin: {
          name: 'Junín',
          provincias: {
            huancayo: {
              name: 'Huancayo',
              distritos: ['Huancayo', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupaca', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancan', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucara', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunan', 'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques']
            },
            tarma: {
              name: 'Tarma',
              distritos: ['Tarma', 'Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tapo']
            }
          }
        }
      }
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
    
    canProceedToNextStep() {
      if (this.currentStep === 1) {
        if (this.deliveryMethod === 'delivery') {
          // Para delivery, validar que se complete la información básica
          const basicInfo = this.deliveryData.recipientName && 
                           this.deliveryData.document && 
                           this.deliveryData.recipientPhone &&
                           this.deliveryData.department &&
                           this.deliveryData.province &&
                           this.deliveryData.district;
          
          // Si es fuera de Lima, también validar que se seleccione agencia
          if (this.showAgencyField) {
            return basicInfo && this.deliveryData.agency;
          }
          
          return basicInfo;
        }
        return this.deliveryMethod && this.selectedPickupPoint;
      }
      if (this.currentStep === 2) {
        return this.proofData.type && this.proofData.document;
      }
      if (this.currentStep === 3) {
        return this.billingData.firstName && 
               this.billingData.lastName && 
               this.billingData.email && 
               this.billingData.phone;
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
    
    // Obtener provincias del departamento seleccionado
    availableProvinces() {
      if (!this.deliveryData.department) return [];
      const dept = this.peruData[this.deliveryData.department];
      if (!dept) return [];
      
      return Object.keys(dept.provincias).map(key => ({
        value: key,
        name: dept.provincias[key].name
      }));
    },
    
    // Obtener distritos de la provincia seleccionada
    availableDistricts() {
      if (!this.deliveryData.department || !this.deliveryData.province) return [];
      const dept = this.peruData[this.deliveryData.department];
      if (!dept) return [];
      
      const province = dept.provincias[this.deliveryData.province];
      if (!province) return [];
      
      return province.distritos;
    },
    
    canProceedToProofStep() {
      // Para boleta solo requiere documento
      if (this.proofData.type === 'boleta') {
        return this.proofData.document;
      }
      // Para factura requiere RUC, Razón Social y Dirección Fiscal
      if (this.proofData.type === 'factura') {
        return this.proofData.ruc && 
               this.proofData.razonSocial && 
               this.proofData.direccionFiscal;
      }
      return false;
    },
    
    canProcessOrder() {
      return this.paymentMethod && this.cartItems.length > 0;
    }
  },
  
  methods: {
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
    
    selectDeliveryMethod(method) {
      this.deliveryMethod = method;
      if (method === 'delivery') {
        this.selectedPickupPoint = '';
      }
    },
    
    onDepartmentChange() {
      // Resetear provincia, distrito y agencia cuando cambia el departamento
      this.deliveryData.province = '';
      this.deliveryData.district = '';
      this.deliveryData.agency = '';
      console.log('Departamento cambiado:', this.deliveryData.department);
      console.log('Provincias disponibles:', this.availableProvinces);
      console.log('showAgencyField:', this.showAgencyField);
    },
    
    onProvinceChange() {
      // Resetear distrito y agencia cuando cambia la provincia
      this.deliveryData.district = '';
      this.deliveryData.agency = '';
      console.log('Provincia cambiada:', this.deliveryData.province);
      console.log('showAgencyField:', this.showAgencyField);
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
      
      // Generar número de orden
      this.orderNumber = 'ORD-' + Date.now();
      
      // Simular procesamiento
      setTimeout(() => {
        this.showConfirmation = true;
      }, 1000);
    },
    
    goToDashboard() {
      this.$router.push('/dashboard');
    }
  },
  
  mounted() {
    // Verificar si hay productos en el carrito
    if (this.cartItems.length === 0) {
      this.$router.push('/activation');
    }
  }
}
</script>

<style lang="stylus" scoped>
.checkout-page
  min-height 100vh
  background linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
  padding 20px
  margin-top 20px

.top-progress-bar
  display flex
  justify-content space-between
  align-items center
  margin-bottom 20px
  max-width 600px
  margin-left auto
  margin-right 90px
  background #fdf6f0
  padding 35px 45px
  border-radius 20px
  box-shadow 0 4px 20px rgba(0,0,0,0.08)
  position relative
  border 1px solid #ffe4d6
  
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
    background linear-gradient(90deg, #ff8c00 0%, #ffa726 100%)
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
      background #ff8c00
      color white
      border-color #ff8c00
      box-shadow 0 6px 20px rgba(255,140,0,0.35)
      transform scale(1.05)
    
    .step-label
      color #ff8c00
      font-weight 600
      transform translateY(-1px)



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
  margin 0 auto
  background white
  border-radius 15px
  box-shadow 0 4px 20px rgba(0,0,0,0.08)
  overflow visible

.checkout-main-header
  background white
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
  grid-template-columns 1.2fr 1.8fr
  gap 30px
  margin-top -25px
  position relative
  overflow visible
// Columna izquierda - Resumen del carrito
.cart-summary
  background linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)
  padding 35px
  height fit-content
  min-height 600px
  border-radius 18px
  box-shadow 0 8px 32px rgba(0,0,0,0.12)
  min-width 350px
  width 90%
  border 1px solid #e8e8e8
  position relative
  z-index 10
  margin-top 20px

.cart-title
  text-align center
  margin-bottom 30px
  padding 25px
  background #fdf6f0
  border-radius 12px
  border 2px solid #ffe4d6
  
  h2
    margin 0 0 12px 0
    font-size 1.6rem
    font-weight 700
    color #ff8c00
    text-shadow 0 1px 2px rgba(255, 140, 0, 0.1)
  
  p
    margin 0
    font-size 1.1rem
    color #555
    font-weight 500
    line-height 1.4

.cart-header
  display flex
  justify-content space-between
  align-items center
  margin-bottom 15px
  padding-bottom 15px
  border-bottom 1px solid #e0e0e0

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
  max-height 350px /* Altura máxima para el scroll */
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
    border-color #ff8c00
    box-shadow 0 6px 20px rgba(255, 140, 0,0.15)
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
  font-size 1rem
  color #666
  margin-bottom 5px

.cart-item-name
  font-weight 700
  margin-bottom 8px
  color #333
  font-size 1.1rem
  line-height 1.3

.cart-item-price
  font-size 1.1rem
  color #388e3c
  font-weight 600
  margin-bottom 8px

.cart-item-points
  font-size 0.8rem
  color #ff9800
  font-weight 600
  background rgba(255, 152, 0, 0.1)
  padding 2px 6px
  border-radius 4px
  display inline-block
  width fit-content

.order-summary
  border-top 2px solid #ffe4d6
  padding-top 25px
  margin-bottom 30px
  background linear-gradient(135deg, #ffffff 0%, #fefefe 100%)
  padding 28px
  border-radius 14px
  box-shadow 0 4px 16px rgba(0,0,0,0.08)
  border 1px solid #f0f0f0

  .summary-row
    display flex
    justify-content space-between
    margin-bottom 10px
    font-size 0.95rem
    align-items center
    
    span:first-child
      font-weight 600
      color #333
    
    span:last-child
      font-weight 500
      color #666
    
    // Colores específicos para cada tipo de información
    &:nth-child(1) // Total productos
      font-size 1.1rem
      span:first-child
        color #333
        font-weight 700
      span:last-child
        color #333
        font-weight 700
    
    &:nth-child(2) // Puntos
      font-size 1.1rem
      span:first-child
        color #333
        font-weight 700
      span:last-child
        color #ff8c00
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
        color #388e3c

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
  margin-top 30px
  padding 20px
  background rgba(255, 140, 0, 0.03)
  border-radius 12px
  border 1px solid rgba(255, 140, 0, 0.1)
  
  p
    margin-bottom 20px
    color #555
    font-size 1.05rem
    font-weight 500

.return-btn
  background linear-gradient(135deg, #ff8c00 0%, #ff9800 100%)
  color white
  border none
  padding 16px 32px
  border-radius 12px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  width 100%
  box-shadow 0 4px 16px rgba(255, 140, 0, 0.25)
  font-size 1.05rem
  
  &:hover
    background linear-gradient(135deg, #ff7f00 0%, #ff8c00 100%)
    transform translateY(-3px)
    box-shadow 0 6px 24px rgba(255, 140, 0, 0.35)

// Columna derecha - Proceso de checkout
.checkout-process
  background white
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

.delivery-header
  background #ff9800
  color white
  padding 25px 20px
  border-radius 8px 8px 0 0
  margin-bottom 0
  
  h3
    margin 0
    font-size 1.2rem
    font-weight 600

.delivery-description
  background #f8f9fa
  padding 15px 20px
  border 1px solid #e0e0e0
  border-top none
  border-radius 0 0 8px 8px
  margin-bottom 20px
  
  p
    margin 0
    color #666
    font-size 0.95rem

.section-header
  margin-bottom 25px
  
  h3
    color #333
    margin-bottom 8px
    font-size 1.3rem
  
  p
    color #666
    font-size 0.95rem

.delivery-methods
  display flex
  gap 15px
  margin-bottom 30px

.delivery-method
  flex 1
  padding 15px 20px
  border 2px solid #e0e0e0
  border-radius 10px
  background white
  cursor pointer
  transition all 0.3s ease
  font-weight 500
  
  &:hover
    border-color #ff9800
  
  &.active
    border-color #ff9800
    background #ff9800
    color white

.pickup-selector
  margin-bottom 30px
  
  label
    display block
    margin-bottom 8px
    font-weight 500
    color #333

.pickup-select
  width 100%
  padding 12px 15px
  border 2px solid #e0e0e0
  border-radius 8px
  font-size 1rem
  transition all 0.3s ease
  
  &:focus
    outline none
    border-color #667eea

.map-container
  margin-bottom 30px

.map-and-location-container
  margin-bottom 30px

.map-location-grid
  display grid
  grid-template-columns 1fr 1fr
  gap 20px
  align-items start

.map-column
  .map-container
    margin-bottom 0

.location-column
  .location-header
    margin-bottom 15px
    
    h3
      color #333
      font-size 1.1rem
      font-weight 600
      margin 0
  
  .location-details
    background white
    border-radius 10px
    padding 18px
    border 1px solid #e8e8e8
    box-shadow 0 2px 8px rgba(0,0,0,0.06)
    margin-top 15px
  
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
    .map-location-grid
      grid-template-columns 1fr
      gap 15px
    
    .map-column
      order 1
    
    .location-column
      order 2
    
    .location-details
      padding 15px
    
    .location-item
      flex-direction column
      align-items flex-start
      
      .location-label
        margin-bottom 6px
        margin-right 0
        min-width auto

.map-section
  border 1px solid #e0e0e0
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
      border-radius 0
      border none

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
  background #ff9800
  color white
  border none
  padding 12px 25px
  border-radius 8px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  
  &:hover
    background #f57c00

.continue-btn, .process-btn
  background #ff8c00
  color white
  border none
  padding 14px 32px
  border-radius 8px
  font-weight 700
  cursor pointer
  transition all 0.3s ease
  font-size 1.05rem
  
  &:hover:not(:disabled)
    background #f57c00
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
  background linear-gradient(145deg, #ffffff 0%, #fafafa 50%, #f8f9fa 100%)
  border-radius 20px
  border 2px solid #ffe4d6
  box-shadow 0 8px 32px rgba(255, 140, 0, 0.12), 0 4px 16px rgba(0,0,0,0.08)
  position relative
  overflow hidden
  
  &::before
    content ''
    position absolute
    top 0
    left 0
    right 0
    height 4px
    background linear-gradient(90deg, #ff8c00 0%, #ffa726 50%, #ff8c00 100%)
  
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
      color #ff8c00
      font-size 1.3rem
      font-weight 700
      margin-bottom 25px
      padding 15px 20px
      background linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, rgba(255, 140, 0, 0.03) 100%)
      border-radius 12px
      border-left 4px solid #ff8c00
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
        padding 14px 18px
        border 2px solid #e8e8e8
        border-radius 12px
        font-size 1rem
        transition all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
        color #333
        background linear-gradient(135deg, #ffffff 0%, #fafafa 100%)
        box-shadow 0 2px 8px rgba(0,0,0,0.08)
        
        &:hover
          border-color #ffb74d
          box-shadow 0 4px 16px rgba(255, 140, 0, 0.15)
          transform translateY(-1px)
        
        &:focus
          outline none
          border-color #ff8c00
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
    padding 14px 18px
    font-size 1rem
    transition all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
    position relative
    appearance none
    background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff8c00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E")
    background-repeat no-repeat
    background-position right 15px center
    background-size 16px
    
    &:hover
      border-color #ffb74d
      box-shadow 0 4px 16px rgba(255, 140, 0, 0.15)
      transform translateY(-1px)
    
    &:focus
      outline none
      border-color #ff8c00
      box-shadow 0 6px 24px rgba(255,140,0,0.2)
      transform translateY(-2px)
      background-color #fff

  .form-select
    background white
    cursor pointer

  .delivery-note
    margin-top 30px
    padding 20px 25px
    background linear-gradient(135deg, rgba(255, 140, 0, 0.12) 0%, rgba(255, 140, 0, 0.06) 100%)
    border-radius 16px
    border-left 5px solid #ff8c00
    position relative
    box-shadow 0 4px 20px rgba(255, 140, 0, 0.15)
    
    &::before
      content '💡'
      position absolute
      left 20px
      top 50%
      transform translateY(-50%)
      font-size 1.2rem
    
    p
      margin 0 0 0 35px
      font-size 0.95rem
      color #555
      font-weight 500
            line-height 1.5

  // Estilos para la sección de agencia
  .agency-section
    margin-top 25px
    padding 25px
    background linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, rgba(255, 140, 0, 0.03) 100%)
    border-radius 16px
    border 2px solid #ffe4d6
    
    h4
      color #ff8c00
      font-size 1.2rem
      font-weight 700
      margin-bottom 20px
      padding 12px 18px
      background rgba(255, 140, 0, 0.1)
      border-radius 10px
      border-left 4px solid #ff8c00

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
  background #fdf6f0
  padding 0
  border-radius 20px
  border 2px solid #ffe4d6
  box-shadow 0 8px 32px rgba(255, 140, 0, 0.15)
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
        border-color #ff8c00
        background #f8f9fa
      
      span
        font-size 1rem
        font-weight 600
    
    input[type="radio"]:checked + .proof-label
      background #ff8c00
      color white
      border-color #ff8c00

// Header naranja del comprobante
.proof-header
  background #ff8c00
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
  margin 0 30px 30px 30px
  padding 25px
  background linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(255, 140, 0, 0.02) 100%)
  border-radius 12px
  border 1px solid rgba(255, 140, 0, 0.2)

// Estilos para los campos de factura
.factura-fields
  margin 0 30px 30px 30px
  padding 25px
  background linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(255, 140, 0, 0.02) 100%)
  border-radius 12px
  border 1px solid rgba(255, 140, 0, 0.2)
  
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
          border-color #ff8c00
          box-shadow 0 4px 16px rgba(255,140,0,0.15)
      
      i
        position absolute
        right 15px
        top 50%
        transform translateY(-50%)
        color #333
        font-size 1rem

// Métodos de pago
.payment-methods
  margin-bottom 30px

.payment-method
  display flex
  align-items center
  padding 15px
  border 2px solid #e0e0e0
  border-radius 10px
  margin-bottom 15px
  cursor pointer
  transition all 0.3s ease
  
  &:hover
    border-color #667eea
  
  input[type="radio"]
    margin-right 15px
    transform scale(1.2)
  
  label
    display flex
    align-items center
    cursor pointer
    font-weight 500
    
    i
      margin-right 10px
      color #667eea
      font-size 1.1rem

.transfer-info
  background #f8f9fa
  border-radius 10px
  padding 20px
  margin-bottom 30px

.bank-details
  .bank-item
    display flex
    justify-content space-between
    margin-bottom 10px
    font-size 0.95rem
    
    span
      font-weight 500
      color #333

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
    
    &.total
      font-weight 700
      font-size 1.1rem
      color #667eea
      border-top 1px solid #e0e0e0
      padding-top 10px
      margin-top 10px

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
    padding 25px
    margin-right auto
    max-width 600px
    
    &::before, &::after
      left 30px
      right 30px
      height 6px
      border-radius 4px
    
    &::after
      left 30px
      width calc((100% - 60px) * (var(--current-step, 1) / 3))

@media (max-width: 768px)
  .checkout-page
    padding 15px
  
  .checkout-header
    h1
      font-size 2rem
    
    p
      font-size 1rem
  
  .top-progress-bar
    padding 20px
    margin-right auto
    
    &::before, &::after
      left 20px
      right 20px
      height 6px
      border-radius 4px
    
    &::after
      left 20px
      width calc((100% - 40px) * (var(--current-step, 1) / 3))
    
    .progress-step
      .step-number
        width 45px
        height 45px
      
      .step-label
        font-size 0.9rem
  
  .delivery-methods
    flex-direction column
  
  .billing-form
    .form-row
      grid-template-columns 1fr
  
  .step-actions
    flex-direction column
    gap 15px
    
    button
      width 100%

@media (max-width: 480px)
  .checkout-process
    padding 20px
  
  .cart-summary
    padding 25px
    min-width 100%
    min-height 650px
    z-index 10
    margin-top -10px
  
  .top-progress-bar
    padding 15px
    margin-right auto
    max-width 400px
    
    &::before, &::after
      left 15px
      right 15px
      height 6px
      border-radius 4px
    
    &::after
      left 15px
      width calc((100% - 30px) * (var(--current-step, 1) / 3))
    
    .progress-step
      .step-number
        width 40px
        height 40px
      
      .step-label
        font-size 0.85rem
</style> 