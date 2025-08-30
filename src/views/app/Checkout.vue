<template>
  <App>
    <div class="checkout-page">


    <!-- Barra de progreso superior -->
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
              <span>Concepto:</span>
              <span>Sin Pack</span>
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
          <div class="billing-section">
            <div class="section-header">
              <h3>Información de Facturación</h3>
              <p>Completa tus datos para la facturación.</p>
            </div>
            
            <div class="billing-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nombres</label>
                  <input v-model="billingData.firstName" type="text" placeholder="Ingresa tus nombres" />
                </div>
                <div class="form-group">
                  <label>Apellidos</label>
                  <input v-model="billingData.lastName" type="text" placeholder="Ingresa tus apellidos" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input v-model="billingData.email" type="email" placeholder="Ingresa tu email" />
              </div>
              
              <div class="form-group">
                <label>Teléfono</label>
                <input v-model="billingData.phone" type="tel" placeholder="Ingresa tu teléfono" />
              </div>
              
              <div class="form-group">
                <label>Dirección</label>
                <input v-model="billingData.address" type="text" placeholder="Ingresa tu dirección" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Ciudad</label>
                  <input v-model="billingData.city" type="text" placeholder="Ciudad" />
                </div>
                <div class="form-group">
                  <label>Código Postal</label>
                  <input v-model="billingData.zipCode" type="text" placeholder="Código postal" />
                </div>
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
        <div v-if="currentStep === 3" class="checkout-step">
          <div class="payment-section">
            <div class="section-header">
              <h3>Método de Pago</h3>
              <p>Selecciona tu método de pago preferido.</p>
            </div>
            
            <div class="payment-methods">
              <div class="payment-method">
                <input 
                  type="radio" 
                  id="cash" 
                  v-model="paymentMethod" 
                  value="cash"
                />
                <label for="cash">
                  <i class="fas fa-money-bill-wave"></i>
                  Efectivo
                </label>
              </div>
              
              <div class="payment-method">
                <input 
                  type="radio" 
                  id="transfer" 
                  v-model="paymentMethod" 
                  value="transfer"
                />
                <label for="transfer">
                  <i class="fas fa-university"></i>
                  Transferencia Bancaria
                </label>
              </div>
              
              <div class="payment-method">
                <input 
                  type="radio" 
                  id="balance" 
                  v-model="paymentMethod" 
                  value="balance"
                />
                <label for="balance">
                  <i class="fas fa-wallet"></i>
                  Saldo Disponible (S/ {{ userBalance.toFixed(2) }})
                </label>
              </div>
            </div>

            <!-- Información de transferencia -->
            <div v-if="paymentMethod === 'transfer'" class="transfer-info">
              <div class="section-header">
                <h4>Información Bancaria</h4>
              </div>
              
              <div class="bank-details">
                <div class="bank-item">
                  <span>Banco:</span> BCP
                </div>
                <div class="bank-item">
                  <span>Cuenta:</span> 123-456789-0-12
                </div>
                <div class="bank-item">
                  <span>Titular:</span> SIFRAH SAC
                </div>
                <div class="bank-item">
                  <span>Tipo:</span> Cuenta Corriente
                </div>
              </div>
            </div>

            <!-- Resumen final -->
            <div class="final-summary">
              <div class="summary-header">
                <h4>Resumen de tu orden</h4>
              </div>
              
              <div class="summary-details">
                <div class="summary-item">
                  <span>Subtotal:</span>
                  <span>S/ {{ (cartTotal / 1.18).toFixed(2) }}</span>
                </div>
                <div class="summary-item">
                  <span>IGV (18%):</span>
                  <span>S/ {{ (cartTotal - cartTotal / 1.18).toFixed(2) }}</span>
                </div>
                <div class="summary-item total">
                  <span>Total a pagar:</span>
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
  </div>
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
      userBalance: 150.00
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
        return this.deliveryMethod && 
               (this.deliveryMethod === 'delivery' || this.selectedPickupPoint);
      }
      if (this.currentStep === 2) {
        return this.billingData.firstName && 
               this.billingData.lastName && 
               this.billingData.email && 
               this.billingData.phone;
      }
      return true;
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
  margin-right 510px
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
  min-width 400px
  width 100%
  border 1px solid #e8e8e8
  position relative
  z-index 10
  margin-top -150px

.cart-title
  text-align center
  margin-bottom 30px
  padding 25px
  background #fdf6f0
  border-radius 12px
  border 2px solid #ffe4d6
  
  h2
    margin 0 0 12px 0
    font-size 2rem
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

  h3
    margin-bottom 15px
    font-size 1.1rem
    color #333
    font-weight 600
    text-align center

.summary-details
  .summary-row
    display flex
    justify-content space-between
    margin-bottom 10px
    font-size 0.95rem
    align-items center
    
    &.total
      font-weight 700
      font-size 1.1rem
      color #388e3c
      border-top 1px solid #e0e0e0
      padding-top 10px
      margin-top 10px

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
  background #ff9800
  color white
  border 1px solid #ff9800
  padding 12px 30px
  border-radius 8px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  
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