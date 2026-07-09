<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div class="savings-checkout">
      <header class="checkout-top">
        <div class="checkout-header">
          <h1>Canje con <span class="highlight">Bono Ahorro</span></h1>
          <p>{{ step === 1 ? 'Usa tu saldo acumulado para canjear productos increíbles.' : 'Revisa y confirma tu canje para completar el proceso.' }}</p>
        </div>
      </header>

      <div class="checkout-stepper" :class="{ 'is-step-2': step === 2 }">
        <div class="stepper-track">
          <div class="stepper-line">
            <div class="stepper-line-fill"></div>
          </div>
          <div class="step" :class="{ active: step === 1, done: step > 1 }">
            <span class="step-dot">1</span>
            <span class="step-label">Preparar canje</span>
          </div>
          <div class="step" :class="{ active: step === 2 }">
            <span class="step-dot">2</span>
            <span class="step-label">Confirmar canje</span>
          </div>
        </div>
      </div>

      <div v-if="step === 1" class="checkout-body">
        <div class="checkout-layout">
          <div class="checkout-main">
            <section class="checkout-card products-card">
              <div class="card-head">
                <div class="card-title card-title--accent">
                  <i class="fas fa-shopping-cart"></i>
                  <span>Productos seleccionados</span>
                </div>
                <router-link to="/savings-bonus" class="edit-cart-link">
                  <i class="fas fa-pen"></i> Editar carrito
                </router-link>
              </div>

              <div class="products-table-wrap">
                <div class="products-list-head">
                  <span>Producto</span>
                  <span>Precio unitario</span>
                  <span>Cantidad</span>
                  <span>Subtotal</span>
                  <span aria-hidden="true"></span>
                </div>

                <div v-for="item in cart" :key="item.id" class="products-list-row">
                  <div class="products-list-product">
                    <img :src="item.img" :alt="item.name" />
                    <div class="products-list-copy">
                      <strong>{{ item.name }}</strong>
                      <span
                        class="products-list-category"
                        :class="{ 'is-placeholder': !productCategory(item) }"
                      >{{ productCategory(item) }}</span>
                    </div>
                  </div>

                  <div class="products-list-metric">
                    <span class="coin-value">
                      <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                      {{ formatCoins(item.price) }}
                    </span>
                  </div>

                  <div class="products-list-metric">
                    <div class="qty-control">
                      <button type="button" @click="changeQty(item, -1)" :disabled="(item.qty || 1) <= 1">−</button>
                      <span>{{ item.qty || 1 }}</span>
                      <button type="button" @click="changeQty(item, 1)">+</button>
                    </div>
                  </div>

                  <div class="products-list-metric">
                    <span class="coin-value">
                      <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                      {{ formatCoins(lineTotal(item)) }}
                    </span>
                  </div>

                  <div class="products-list-action">
                    <button type="button" class="remove-btn" @click="removeItem(item)" aria-label="Quitar producto">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="cart-products-mobile">
                <div v-for="item in cart" :key="'m-' + item.id" class="cart-product">
                  <img :src="item.img" :alt="item.name" class="cart-product-img" />
                  <div class="cart-product-copy">
                    <h3>{{ item.name }}</h3>
                    <p :class="{ 'is-placeholder': !productCategory(item) }">{{ productCategory(item) }}</p>
                  </div>
                  <div class="qty-control cart-product-qty">
                    <button type="button" @click="changeQty(item, -1)" :disabled="(item.qty || 1) <= 1">−</button>
                    <span>{{ item.qty || 1 }}</span>
                    <button type="button" @click="changeQty(item, 1)">+</button>
                  </div>
                  <div class="cart-product-price">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    <span>{{ formatCoins(lineTotal(item)) }}</span>
                  </div>
                </div>
              </div>

              <div class="totals-grid">
                <div class="total-cell">
                  <span class="label">Valor de los productos</span>
                  <span class="value coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(productsTotal) }}
                  </span>
                  <span class="total-hint is-placeholder" aria-hidden="true"></span>
                </div>
                <div class="total-cell">
                  <span class="label">Tu Bono Ahorro disponible</span>
                  <span class="value coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(savingsBalance) }}
                  </span>
                  <span
                    class="total-hint"
                    :class="[bonusHintClass, { 'is-placeholder': !bonusHintText }]"
                  >{{ bonusHintText }}</span>
                </div>
                <div class="total-cell">
                  <span class="label">Completa con dinero</span>
                  <span class="value cash" :class="{ 'is-zero': cashToPay === 0 }">S/ {{ formatMoney(cashToPay) }}</span>
                  <span
                    class="total-hint"
                    :class="[cashHintClass, { 'is-placeholder': !cashHintText }]"
                  >{{ cashHintText }}</span>
                </div>
              </div>

              <div v-if="productsTotal > 0" class="bonus-used-banner">
                <i class="fas fa-check-circle"></i>
                <p>
                  Vas a usar <strong>{{ formatCoins(usedBonus) }}</strong> de tus
                  <strong>{{ formatCoins(savingsBalance) }}</strong> acumuladas de tu Bono Ahorro
                </p>
              </div>
            </section>

            <section class="checkout-card">
              <div class="card-title block">
                <i class="fas fa-truck"></i>
                <span>¿Cómo deseas recibir tu canje?</span>
              </div>

              <div class="delivery-options">
                <button
                  type="button"
                  class="delivery-option"
                  :class="{ active: deliveryMethod === 'pickup' }"
                  @click="deliveryMethod = 'pickup'"
                >
                  <span class="radio-dot"></span>
                  <div>
                    <strong>Retiro en tienda</strong>
                    <p>Recoge tu pedido en un punto autorizado SIFRAH.</p>
                  </div>
                </button>
                <button
                  type="button"
                  class="delivery-option"
                  :class="{ active: deliveryMethod === 'delivery' }"
                  @click="deliveryMethod = 'delivery'"
                >
                  <span class="radio-dot"></span>
                  <div>
                    <strong>Delivery</strong>
                    <p>Recibe tu pedido en la dirección que elijas.</p>
                  </div>
                </button>
              </div>

              <div v-if="deliveryMethod === 'pickup'" class="field-block">
                <label for="pickup-office">Punto de entrega</label>
                <select id="pickup-office" v-model="selectedOfficeId" class="office-select">
                  <option v-for="office in offices" :key="office.id" :value="office.id">
                    {{ office.name }}
                  </option>
                </select>
                <p v-if="selectedOffice" class="office-address">{{ selectedOffice.address }}</p>
              </div>

              <div v-else class="delivery-note">
                <p>El delivery para canjes con Bono Ahorro se coordinará al confirmar tu solicitud.</p>
              </div>
            </section>

            <section class="checkout-card receipt-card" :class="{ expanded: receiptExpanded }">
              <button type="button" class="receipt-toggle" @click="receiptExpanded = !receiptExpanded">
                <div class="receipt-toggle-copy">
                  <div class="receipt-toggle-title">
                    <i class="fas fa-file-invoice"></i>
                    <strong>¿Necesitas comprobante?</strong>
                  </div>
                  <p>Selecciona si deseas boleta o factura. El comprobante se emitirá por el monto que completes con dinero.</p>
                </div>
                <i class="fas receipt-chevron" :class="receiptExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
              <div v-if="receiptExpanded" class="receipt-body">
                <div class="receipt-options">
                  <label><input type="radio" v-model="receiptType" value="none" /> Sin comprobante</label>
                  <label><input type="radio" v-model="receiptType" value="boleta" /> Boleta</label>
                  <label><input type="radio" v-model="receiptType" value="factura" /> Factura</label>
                </div>
              </div>
            </section>

            <div class="checkout-mobile-footer">
              <div class="checkout-summary-bar">
                <div class="checkout-summary-cell">
                  <span>Usarás de tu Bono Ahorro</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(usedBonus) }}
                  </strong>
                </div>
                <div class="checkout-summary-cell">
                  <span>Total del producto</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(productsTotal) }}
                  </strong>
                </div>
                <div class="checkout-summary-cell checkout-summary-cell--highlight">
                  <span>Total a pagar ahora</span>
                  <strong class="cash">S/ {{ formatMoney(cashToPay) }}</strong>
                </div>
              </div>

              <button type="button" class="continue-btn" @click="goToConfirm">
                Continuar el canje <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <aside class="checkout-sidebar">
            <div class="sidebar-card">
              <h2>Resumen de tu canje</h2>

              <div class="sidebar-rows">
                <div class="sidebar-row">
                  <span>Valor del producto</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(productsTotal) }}
                  </strong>
                </div>
                <div class="sidebar-row">
                  <span>Usarás de tu Bono Ahorro</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(usedBonus) }}
                  </strong>
                </div>
                <div class="sidebar-row">
                  <span>Dinero adicional a pagar</span>
                  <strong class="cash">S/ {{ formatMoney(cashToPay) }}</strong>
                </div>
              </div>

              <div class="sidebar-total">
                <span>Total a pagar ahora</span>
                <strong>S/ {{ formatMoney(cashToPay) }}</strong>
              </div>

              <div class="sidebar-mini-grid">
                <div class="mini-cell">
                  <span>Usarás de tu Bono Ahorro</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(usedBonus) }}
                  </strong>
                </div>
                <div class="mini-cell">
                  <span>Total del producto</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(productsTotal) }}
                  </strong>
                </div>
              </div>

              <button type="button" class="continue-btn" @click="goToConfirm">
                Continuar el canje <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div v-else class="checkout-body confirm-step">
        <div class="confirm-ready-banner">
          <i class="fas fa-check-circle"></i>
          <div>
            <strong>¡Todo listo para confirmar tu canje!</strong>
            <p>Revisa los detalles de abajo y confirma cuando estés listo.</p>
          </div>
        </div>

        <div class="checkout-layout confirm-layout">
          <div class="checkout-main">
            <section class="checkout-card confirm-products-card">
              <button
                type="button"
                class="confirm-section-toggle"
                @click="confirmProductsExpanded = !confirmProductsExpanded"
              >
                <span class="card-title card-title--accent">
                  <i class="fas fa-shopping-cart"></i>
                  <span>Productos que vas a recibir ({{ cartCount }})</span>
                </span>
                <i class="fas confirm-toggle-icon" :class="confirmProductsExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>

              <div class="confirm-products-body" :class="{ 'is-collapsed': !confirmProductsExpanded }">
                <div v-for="item in cart" :key="'c-' + item.id" class="confirm-product-row">
                  <img :src="item.img" :alt="item.name" />
                  <div class="confirm-product-copy">
                    <strong>{{ item.name }}</strong>
                    <span>{{ productCategory(item) || 'Producto' }}</span>
                    <em>x{{ item.qty || 1 }} unidad</em>
                  </div>
                  <span class="coin-value">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(lineTotal(item)) }}
                  </span>
                </div>

                <div class="totals-grid confirm-totals-grid">
                  <div class="total-cell">
                    <span class="label">Valor del producto</span>
                    <span class="value coins">
                      <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                      {{ formatCoins(productsTotal) }}
                    </span>
                  </div>
                  <div class="total-cell">
                    <span class="label">Tu Bono Ahorro utilizado</span>
                    <span class="value coins is-discount">
                      <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                      -{{ formatCoins(usedBonus) }}
                    </span>
                  </div>
                  <div class="total-cell">
                    <span class="label">Saldo pendiente</span>
                    <span class="value cash">S/ {{ formatMoney(cashToPay) }}</span>
                  </div>
                </div>

                <div v-if="usedBonus > 0" class="bonus-used-banner">
                  <i class="fas fa-check-circle"></i>
                  <p>
                    Vas a usar <strong>{{ formatCoins(usedBonus) }}</strong> de tus
                    <strong>{{ formatCoins(savingsBalance) }}</strong> acumuladas de tu Bono Ahorro
                  </p>
                </div>
              </div>
            </section>

            <section class="checkout-card confirm-mobile-summary">
              <h3 class="confirm-block-title">Resumen de tu canje</h3>
              <div class="confirm-mobile-totals">
                <div class="confirm-mobile-total-cell">
                  <span>Valor del producto</span>
                  <strong>S/ {{ formatMoney(productsTotal) }}</strong>
                </div>
                <div class="confirm-mobile-total-cell">
                  <span>Tu Bono Ahorro utilizado</span>
                  <strong class="is-discount">- S/ {{ formatMoney(usedBonus) }}</strong>
                </div>
                <div class="confirm-mobile-total-cell">
                  <span>Saldo pendiente</span>
                  <strong class="is-cash">S/ {{ formatMoney(cashToPay) }}</strong>
                </div>
              </div>
              <div class="confirm-pay-total-bar" :class="{ 'is-covered': hasEnoughBonus }">
                <span>{{ hasEnoughBonus ? 'Total cubierto con Bono Ahorro' : 'Total a pagar' }}</span>
                <strong v-if="hasEnoughBonus" class="coins">
                  <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                  {{ formatCoins(productsTotal) }}
                </strong>
                <strong v-else>S/ {{ formatMoney(cashToPay) }}</strong>
              </div>
            </section>

            <section v-if="cashToPay > 0" class="checkout-card confirm-payment-card confirm-mobile-only">
              <h3 class="confirm-block-title">Elige tu método de pago</h3>
              <p class="confirm-block-sub">Selecciona cómo deseas pagar el monto adicional.</p>
              <div class="confirm-payment-options">
                <button
                  type="button"
                  class="confirm-payment-option"
                  :class="{ active: payMethod === 'bank' }"
                  @click="selectPayMethod('bank')"
                >
                  <span class="radio-dot"></span>
                  <i class="fas fa-university"></i>
                  <span>{{ bankOptionLabel }}</span>
                  <i class="fas fa-chevron-down option-chevron" :class="{ rotated: payMethod === 'bank' && showBankOptions }"></i>
                </button>
                <button
                  type="button"
                  class="confirm-payment-option"
                  :class="{ active: payMethod === 'card' }"
                  @click="selectPayMethod('card')"
                >
                  <span class="radio-dot"></span>
                  <i class="fas fa-credit-card"></i>
                  <span>Tarjeta de crédito / débito</span>
                  <i class="fas fa-chevron-down option-chevron"></i>
                </button>
              </div>

              <div v-if="payMethod === 'bank' && showBankOptions" class="confirm-bank-options">
                <div v-if="loadingPaymentMethods" class="confirm-bank-state">Cargando cuentas bancarias...</div>
                <div v-else-if="!paymentMethods.length" class="confirm-bank-state">
                  No hay cuentas bancarias activas. En local, configúralas en Admin → Métodos de pago.
                </div>
                <button
                  v-for="method in paymentMethods"
                  :key="'m-bank-' + method.id"
                  type="button"
                  class="confirm-bank-option"
                  :class="{ selected: selectedBank === method.id }"
                  @click="selectBankOption(method.id)"
                >
                  {{ method.name }}
                </button>
              </div>

              <div v-if="payMethod === 'bank' && selectedBank" class="confirm-bank-info">
                <div class="confirm-bank-info-row"><strong>Banco:</strong><span>{{ getBankInfo(selectedBank).name }}</span></div>
                <div class="confirm-bank-info-row"><strong>Cuenta:</strong><span>{{ getBankInfo(selectedBank).account }}</span></div>
                <div class="confirm-bank-info-row"><strong>Titular:</strong><span>{{ getBankInfo(selectedBank).holder }}</span></div>
                <div class="confirm-bank-info-row"><strong>Tipo:</strong><span>{{ getBankInfo(selectedBank).type }}</span></div>
                <div v-if="getBankInfo(selectedBank).cci" class="confirm-bank-info-row"><strong>CCI:</strong><span>{{ getBankInfo(selectedBank).cci }}</span></div>
              </div>

              <p class="confirm-payment-note">
                <i class="fas fa-info-circle"></i>
                Una vez realizado el pago, confirma para finalizar tu canje.
              </p>
            </section>

            <div class="confirm-info-grid">
              <section class="checkout-card confirm-info-card">
                <div class="confirm-info-head">
                  <span class="card-title">
                    <i class="fas fa-truck"></i>
                    <span>Entrega</span>
                  </span>
                  <i class="fas fa-chevron-down confirm-info-chevron confirm-mobile-only"></i>
                </div>
                <p class="confirm-info-main">{{ deliveryLabel }}</p>
                <p class="confirm-info-sub">{{ deliveryDetail }}</p>
                <p v-if="deliveryMethod === 'pickup'" class="confirm-info-note">
                  Recibirás un correo con los detalles para coordinar tu recojo.
                </p>
              </section>

              <section class="checkout-card confirm-info-card">
                <div class="confirm-info-head">
                  <span class="card-title">
                    <i class="fas fa-file-invoice"></i>
                    <span>Comprobante</span>
                  </span>
                  <i class="fas fa-chevron-down confirm-info-chevron confirm-mobile-only"></i>
                </div>
                <p class="confirm-info-main">Tipo de comprobante: {{ receiptTypeLabel }}</p>
                <p class="confirm-info-sub">Nro. de documento: {{ receiptDocumentNumber }}</p>
              </section>
            </div>

            <div class="confirm-bottom-note">
              <i class="fas fa-info-circle"></i>
              <p>Al confirmar, tu canje será procesado y recibirás un correo con los detalles de tu pedido.</p>
            </div>

            <div class="confirm-mobile-footer confirm-mobile-only">
              <button type="button" class="continue-btn" :disabled="!canConfirmRedemption" @click="submitRedemption">
                {{ submitting ? 'Procesando...' : 'Confirmar canje' }}
                <i class="fas fa-arrow-right"></i>
              </button>
              <p class="confirm-secure"><i class="fas fa-lock"></i> Transacción 100% segura</p>
            </div>
          </div>

          <aside class="checkout-sidebar confirm-sidebar">
            <div class="sidebar-card">
              <h2 class="confirm-sidebar-title">Resumen de tu canje</h2>

              <div class="sidebar-rows confirm-sidebar-rows">
                <div class="sidebar-row">
                  <span>Valor del producto</span>
                  <strong class="coins">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    {{ formatCoins(productsTotal) }}
                  </strong>
                </div>
                <div class="sidebar-row">
                  <span>Tu Bono Ahorro utilizado</span>
                  <strong class="coins is-discount">
                    <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                    -{{ formatCoins(usedBonus) }}
                  </strong>
                </div>
                <div class="sidebar-row">
                  <span>Saldo pendiente</span>
                  <strong class="cash">S/ {{ formatMoney(cashToPay) }}</strong>
                </div>
              </div>

              <div class="confirm-sidebar-total" :class="{ 'is-covered': hasEnoughBonus }">
                <span>{{ hasEnoughBonus ? 'Total cubierto con Bono Ahorro' : 'Total a pagar' }}</span>
                <strong v-if="hasEnoughBonus" class="coins">
                  <img src="../../assets/img/coin-saldo-icon.png" alt="" />
                  {{ formatCoins(productsTotal) }}
                </strong>
                <strong v-else>S/ {{ formatMoney(cashToPay) }}</strong>
              </div>

              <div v-if="usedBonus > 0" class="confirm-saved-box">
                <i class="fas fa-check-circle"></i>
                <p>Has ahorrado <strong>S/ {{ formatMoney(usedBonus) }}</strong> usando tu Bono Ahorro</p>
              </div>

              <div v-if="cashToPay > 0" class="confirm-payment-block">
                <h3>Elige tu método de pago</h3>
                <div class="confirm-payment-options confirm-payment-options--sidebar">
                  <button
                    type="button"
                    class="confirm-payment-option"
                    :class="{ active: payMethod === 'bank' }"
                    @click="selectPayMethod('bank')"
                  >
                    <span class="radio-dot"></span>
                    <i class="fas fa-university"></i>
                    <span>{{ bankOptionLabel }}</span>
                    <i class="fas fa-chevron-down option-chevron" :class="{ rotated: payMethod === 'bank' && showBankOptions }"></i>
                  </button>
                  <button
                    type="button"
                    class="confirm-payment-option"
                    :class="{ active: payMethod === 'card' }"
                    @click="selectPayMethod('card')"
                  >
                    <span class="radio-dot"></span>
                    <i class="fas fa-credit-card"></i>
                    <span>Tarjeta de crédito / débito</span>
                  </button>
                </div>

                <div v-if="payMethod === 'bank' && showBankOptions" class="confirm-bank-options">
                  <div v-if="loadingPaymentMethods" class="confirm-bank-state">Cargando cuentas bancarias...</div>
                  <div v-else-if="!paymentMethods.length" class="confirm-bank-state">
                    No hay cuentas bancarias activas. En local, configúralas en Admin → Métodos de pago.
                  </div>
                  <button
                    v-for="method in paymentMethods"
                    :key="'s-bank-' + method.id"
                    type="button"
                    class="confirm-bank-option"
                    :class="{ selected: selectedBank === method.id }"
                    @click="selectBankOption(method.id)"
                  >
                    {{ method.name }}
                  </button>
                </div>

                <div v-if="payMethod === 'bank' && selectedBank" class="confirm-bank-info">
                  <div class="confirm-bank-info-row"><strong>Banco:</strong><span>{{ getBankInfo(selectedBank).name }}</span></div>
                  <div class="confirm-bank-info-row"><strong>Cuenta:</strong><span>{{ getBankInfo(selectedBank).account }}</span></div>
                  <div class="confirm-bank-info-row"><strong>Titular:</strong><span>{{ getBankInfo(selectedBank).holder }}</span></div>
                  <div class="confirm-bank-info-row"><strong>Tipo:</strong><span>{{ getBankInfo(selectedBank).type }}</span></div>
                  <div v-if="getBankInfo(selectedBank).cci" class="confirm-bank-info-row"><strong>CCI:</strong><span>{{ getBankInfo(selectedBank).cci }}</span></div>
                </div>

                <p class="confirm-payment-note">
                  <i class="fas fa-info-circle"></i>
                  Una vez realizado el pago, confirma para finalizar tu canje.
                </p>
              </div>

              <button type="button" class="continue-btn" :disabled="!canConfirmRedemption" @click="submitRedemption">
                {{ submitting ? 'Procesando...' : 'Confirmar canje' }}
                <i class="fas fa-arrow-right"></i>
              </button>
              <p class="confirm-secure"><i class="fas fa-lock"></i> Transacción 100% segura</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Swal from "sweetalert2";
import {
  loadBonusCart,
  saveBonusCart,
  clearBonusCart,
} from "@/utils/savingsBonusCart";

export default {
  components: { App },
  data() {
    return {
      step: 1,
      cart: [],
      savingsBalance: 0,
      balanceLoaded: false,
      offices: [],
      selectedOfficeId: "",
      deliveryMethod: "pickup",
      receiptExpanded: false,
      receiptType: "none",
      submitting: false,
      payMethod: "bank",
      confirmProductsExpanded: true,
      paymentMethods: [],
      loadingPaymentMethods: false,
      showBankOptions: false,
      selectedBank: "",
    };
  },
  computed: {
    session() { return this.$store.state.session; },
    office_id() { return this.$store.state.office_id; },
    title() { return "Canje Bono Ahorro"; },
    cartCount() {
      return this.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    },
    receiptTypeLabel() {
      const map = { none: "Sin comprobante", boleta: "Boleta", factura: "Factura" };
      return map[this.receiptType] || "Sin comprobante";
    },
    receiptDocumentNumber() {
      return this.$store.state.dni || "—";
    },
    deliveryLabel() {
      return this.deliveryMethod === "pickup" ? "Retiro en tienda" : "Delivery";
    },
    deliveryDetail() {
      if (this.deliveryMethod === "pickup" && this.selectedOffice) {
        const address = this.selectedOffice.address ? `: ${this.selectedOffice.address}` : "";
        return `${this.selectedOffice.name}${address}`;
      }
      if (this.deliveryMethod === "delivery") {
        return "Recibirás tu pedido en la dirección que elijas.";
      }
      return "Selecciona un punto de entrega.";
    },
    productsTotal() {
      return this.cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1),
        0
      );
    },
    usedBonus() {
      return Math.min(this.savingsBalance, this.productsTotal);
    },
    cashToPay() {
      return Math.max(0, this.productsTotal - this.savingsBalance);
    },
    hasEnoughBonus() {
      return this.productsTotal > 0 && this.savingsBalance >= this.productsTotal;
    },
    canConfirmRedemption() {
      if (this.submitting || !this.balanceLoaded) return false;
      if (!this.hasEnoughBonus) return false;
      if (this.deliveryMethod === "pickup" && !this.selectedOfficeId) return false;
      return true;
    },
    bonusHintText() {
      if (this.hasEnoughBonus) return "Suficiente para tu canje";
      if (this.productsTotal > 0) return "Saldo insuficiente";
      return "";
    },
    bonusHintClass() {
      if (this.hasEnoughBonus) return "success";
      if (this.productsTotal > 0) return "warn";
      return "";
    },
    cashHintText() {
      if (this.productsTotal > 0 && this.cashToPay === 0) return "No es necesario";
      return "";
    },
    cashHintClass() {
      if (this.productsTotal > 0 && this.cashToPay === 0) return "success";
      return "";
    },
    selectedOffice() {
      return this.offices.find((o) => o.id === this.selectedOfficeId) || null;
    },
    bankOptionLabel() {
      if (this.payMethod === "bank" && this.selectedBank) {
        return this.getBankDisplayName(this.selectedBank);
      }
      return "Transferencia bancaria";
    },
  },
  watch: {
    cart: {
      deep: true,
      handler(cart) {
        saveBonusCart(this.session, cart);
      },
    },
  },
  async created() {
    this.cart = loadBonusCart(this.session);
    if (!this.cart.length) {
      this.$router.replace("/savings-bonus");
      return;
    }
    await Promise.all([this.fetchBalance(), this.loadOffices()]);
  },
  methods: {
    async fetchBalance() {
      try {
        const { data } = await api.SavingsBonus.GET(this.session);
        if (data && !data.error && data.savingsBalance != null) {
          this.savingsBalance = Number(data.savingsBalance) || 0;
        }
      } catch (e) {
        console.error("Error cargando saldo:", e);
      } finally {
        this.balanceLoaded = true;
      }
    },
    async loadOffices() {
      try {
        const { data } = await api.Offices.GET();
        if (data && data.offices && data.offices.length) {
          this.offices = data.offices.map((office) => ({
            id: office.id,
            name: office.name,
            address: office.address || "",
          }));
        }
      } catch (e) {
        console.error("Error cargando oficinas:", e);
      }
      if (!this.offices.length) {
        this.offices = [
          { id: "central", name: "SIFRAH – San Juan de Lurigancho", address: "Av. El Sol 527, San Carlos, San Juan de Lurigancho 15434, Lima" },
        ];
      }
      if (!this.selectedOfficeId && this.offices.length) {
        this.selectedOfficeId = this.offices[0].id;
      }
    },
    categoryLabel(product) {
      const aliases = {
        SALUD: "Salud y Bienestar",
        BELLEZA: "Salud y Bienestar",
        BIENESTAR: "Salud y Bienestar",
        HOGAR: "Hogar",
        TECNOLOGIA: "Tecnología",
        TECNOLOGÍA: "Tecnología",
        ELECTRODOMESTICOS: "Electrodomésticos",
        ELECTRODOMÉSTICOS: "Electrodomésticos",
        ACCESORIOS: "Accesorios",
        BENEFICIOS: "Beneficios",
      };
      const raw = String(product.sub || product.type || "").trim();
      if (!raw) return "";
      const upper = raw.toUpperCase();
      if (aliases[upper]) return aliases[upper];
      return raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    },
    productCategory(product) {
      return this.categoryLabel({ ...product, sub: "" });
    },
    formatCoins(value) {
      const n = Number(value);
      const safe = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
      return safe.toLocaleString("es-PE");
    },
    formatMoney(value) {
      const n = Number(value);
      const safe = Number.isFinite(n) ? Math.max(0, n) : 0;
      return safe.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    lineTotal(item) {
      return (Number(item.price) || 0) * (item.qty || 1);
    },
    changeQty(item, delta) {
      const next = (item.qty || 1) + delta;
      if (next < 1) return;
      this.$set(item, "qty", next);
    },
    removeItem(item) {
      const idx = this.cart.findIndex((p) => p.id === item.id);
      if (idx === -1) return;
      this.cart.splice(idx, 1);
      if (!this.cart.length) {
        this.$router.replace("/savings-bonus");
      }
    },
    async goToConfirm() {
      if (this.deliveryMethod === "pickup" && !this.selectedOfficeId) {
        Swal.fire({
          icon: "warning",
          title: "Punto de entrega",
          text: "Selecciona un punto de recojo para continuar.",
          confirmButtonColor: "#e91e63",
        });
        return;
      }
      await this.fetchBalance();
      this.step = 2;
      if (this.cashToPay > 0) {
        if (this.payMethod === "bank") {
          this.showBankOptions = true;
        }
        this.loadPaymentMethods();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    selectPayMethod(method) {
      if (this.payMethod === method) {
        if (method === "bank") {
          this.showBankOptions = !this.showBankOptions;
          if (this.showBankOptions && !this.paymentMethods.length) {
            this.loadPaymentMethods();
          }
        }
        return;
      }
      this.payMethod = method;
      if (method === "bank") {
        this.showBankOptions = true;
        if (!this.paymentMethods.length) {
          this.loadPaymentMethods();
        }
      } else {
        this.showBankOptions = false;
        this.selectedBank = "";
      }
    },
    async loadPaymentMethods() {
      if (this.loadingPaymentMethods) return;
      this.loadingPaymentMethods = true;
      try {
        const { data } = await api.PaymentMethods.GET(this.session);
        this.paymentMethods = (data && data.paymentMethods) ? data.paymentMethods : [];
      } catch (e) {
        console.error("Error al cargar métodos de pago:", e);
        this.paymentMethods = [];
      } finally {
        this.loadingPaymentMethods = false;
      }
    },
    selectBankOption(bankId) {
      this.selectedBank = bankId;
      this.showBankOptions = false;
    },
    getBankDisplayName(bankId) {
      const method = this.paymentMethods.find((m) => m.id === bankId);
      return method ? method.name : "Transferencia bancaria";
    },
    getBankInfo(bankId) {
      const method = this.paymentMethods.find((m) => m.id === bankId);
      if (!method) {
        return { name: "", account: "", holder: "", type: "", cci: "" };
      }
      return {
        name: method.name,
        account: method.account,
        holder: method.holder,
        type: method.type,
        cci: method.cci || "",
      };
    },
    async submitRedemption() {
      if (this.deliveryMethod === "pickup" && !this.selectedOfficeId) {
        Swal.fire({
          icon: "warning",
          title: "Punto de entrega",
          text: "Selecciona un punto de recojo para continuar.",
          confirmButtonColor: "#e91e63",
        });
        return;
      }

      await this.fetchBalance();

      if (!this.hasEnoughBonus) {
        await Swal.fire({
          icon: "warning",
          title: "Saldo insuficiente",
          html: `Necesitas <strong>${this.formatCoins(this.productsTotal)}</strong> monedas de Bono Ahorro y tienes <strong>${this.formatCoins(this.savingsBalance)}</strong>. Reduce el carrito o acumula más saldo para confirmar el canje.`,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#e91e63",
        });
        return;
      }

      const products = this.cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        total: item.qty || 1,
      }));

      this.submitting = true;
      try {
        const { data } = await api.SavingsBonus.POST(this.session, {
          products,
          office: this.selectedOfficeId,
          deliveryMethod: this.deliveryMethod,
          deliveryInfo: {
            officeId: this.selectedOfficeId,
            receiptType: this.receiptType,
          },
        });

        if (data.error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.msg || "No se pudo registrar el canje",
            confirmButtonColor: "#e91e63",
          });
          return;
        }

        clearBonusCart(this.session);
        await Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: "Tu canje está pendiente de aprobación.",
          confirmButtonColor: "#e91e63",
        });
        this.$router.push("/savings-bonus");
      } catch (e) {
        console.error("Error en canje:", e);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo procesar el canje. Intenta de nuevo.",
          confirmButtonColor: "#e91e63",
        });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
@import "../../assets/style/vars.styl"

tablet-break = 900px

.savings-checkout
  max-width 1280px
  margin 0 auto
  padding 24px 20px 40px
  font-family 'Inter', sans-serif
  color #2d3436

  @media (min-width tablet-break)
    padding 28px 32px 48px

.checkout-top
  margin-bottom 20px

  @media (min-width tablet-break)
    margin-bottom 28px

.checkout-header
  text-align left

  h1
    margin 0 0 6px
    font-size 1.75rem
    font-weight 800
    line-height 1.2

    @media (min-width tablet-break)
      font-size 2.15rem

  .highlight
    color #e91e63

  p
    margin 0
    color #636e72
    font-size 0.95rem

    @media (min-width tablet-break)
      font-size 1rem

.checkout-stepper
  margin 0 auto 28px
  max-width 420px

  @media (min-width tablet-break)
    max-width 720px
    margin-bottom 36px

.stepper-track
  position relative
  display flex
  justify-content space-between
  align-items flex-start
  padding 0 8px

  @media (min-width tablet-break)
    padding 0 24px

.stepper-line
  position absolute
  top 18px
  left 52px
  right 52px
  height 3px
  background #eceff1
  border-radius 999px
  z-index 0

  @media (min-width tablet-break)
    top 22px
    left 72px
    right 72px
    height 4px

.stepper-line-fill
  width 50%
  height 100%
  background #e91e63
  border-radius 999px
  transition width 0.3s ease

.checkout-stepper.is-step-2 .stepper-line-fill
  width 100%

.step
  position relative
  z-index 1
  display flex
  flex-direction column
  align-items center
  gap 8px
  min-width 88px
  color #b2bec3

  @media (min-width tablet-break)
    gap 12px
    min-width 120px

  &.active, &.done
    .step-dot
      background #e91e63
      color #fff
      border-color #e91e63
      box-shadow 0 4px 14px rgba(233, 30, 99, 0.28)

    .step-label
      color #2d3436
      font-weight 700

  .step-dot
    width 36px
    height 36px
    border-radius 50%
    border 2px solid #dfe6e9
    display flex
    align-items center
    justify-content center
    font-size 0.95rem
    font-weight 700
    background #fff

    @media (min-width tablet-break)
      width 44px
      height 44px
      font-size 1.05rem

  .step-label
    font-size 0.82rem
    font-weight 500
    text-align center
    line-height 1.25

    @media (min-width tablet-break)
      font-size 1rem

.checkout-layout
  display block

  @media (min-width tablet-break)
    display grid
    grid-template-columns minmax(0, 1.55fr) minmax(300px, 0.72fr)
    gap 22px
    align-items start

.checkout-sidebar
  display none

  @media (min-width tablet-break)
    display block
    position sticky
    top 18px

.checkout-mobile-footer
  display block

  @media (min-width tablet-break)
    display none

.products-table-wrap
  display none

  @media (min-width tablet-break)
    display block
    margin-bottom 4px

.products-list-head,
.products-list-row
  display grid
  grid-template-columns minmax(0, 1.7fr) 110px 120px 110px 40px
  align-items center
  column-gap 12px

.products-list-head
  padding 0 4px 12px
  border-bottom 1px solid #f1f2f6
  margin-bottom 2px

  span
    font-size 0.78rem
    font-weight 600
    color #636e72

    &:not(:first-child)
      text-align center

    &:last-child
      width 40px

.products-list-row
  padding 16px 4px
  border-bottom 1px solid #f8f9fa

  &:last-child
    border-bottom none

.products-list-product
  display flex
  align-items center
  gap 12px
  min-width 0

  img
    width 56px
    height 56px
    object-fit contain
    border-radius 8px
    background #fafafa
    flex-shrink 0

.products-list-copy
  display flex
  flex-direction column
  justify-content center
  gap 3px
  min-width 0

  strong
    display block
    font-size 0.92rem
    font-weight 700
    line-height 1.25
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

.products-list-category
  display block
  font-size 0.78rem
  color #636e72
  line-height 1.25
  min-height 1.15em
  white-space nowrap
  overflow hidden
  text-overflow ellipsis

  &.is-placeholder
    visibility hidden

.products-list-metric
  display flex
  align-items center
  justify-content center
  min-height 56px

.products-list-action
  display flex
  align-items center
  justify-content center
  min-height 56px

.cart-products-mobile
  display block

  @media (min-width tablet-break)
    display none

.checkout-card
  background #fff
  border 1px solid #eceff1
  border-radius 16px
  padding 18px 20px
  margin-bottom 16px
  box-shadow 0 8px 24px rgba(0,0,0,0.04)

  @media (min-width tablet-break)
    padding 20px 22px

.sidebar-card
  background #fff
  border 1px solid #eceff1
  border-radius 16px
  padding 20px 22px
  box-shadow 0 10px 28px rgba(0,0,0,0.05)

  h2
    margin 0 0 18px
    font-size 1.15rem
    font-weight 800
    color #e91e63

.sidebar-rows
  display flex
  flex-direction column
  gap 12px
  margin-bottom 16px

.sidebar-row
  display flex
  align-items center
  justify-content space-between
  gap 12px
  font-size 0.9rem

  span
    color #636e72

  strong
    font-weight 700

  .cash
    color #e91e63

.sidebar-total
  display flex
  align-items flex-end
  justify-content space-between
  gap 12px
  padding 16px 0 18px
  border-top 1px solid #f1f2f6
  border-bottom 1px solid #f1f2f6
  margin-bottom 16px

  span
    font-size 0.92rem
    color #636e72
    font-weight 500

  strong
    font-size 1.75rem
    font-weight 800
    color #e91e63
    line-height 1

.sidebar-mini-grid
  display grid
  grid-template-columns 1fr 1fr
  gap 10px
  margin-bottom 18px

.mini-cell
  background #f8f9fa
  border-radius 10px
  padding 12px 10px
  display flex
  flex-direction column
  gap 8px
  min-width 0

  span
    font-size 0.72rem
    color #636e72
    line-height 1.3
    min-height 2.6em

  strong.coins
    display inline-flex
    align-items center
    gap 5px
    font-size 0.95rem
    line-height 1
    font-weight 800

    img
      width 1em
      height 1em
      object-fit contain
      flex-shrink 0

.coin-value
  display inline-flex
  align-items center
  justify-content center
  gap 6px
  font-weight 700
  font-size 0.92rem

  img
    width 20px
    height 20px
    object-fit contain

.remove-btn
  border none
  background transparent
  color #b2bec3
  cursor pointer
  padding 8px
  font-size 0.9rem
  transition 0.2s
  display inline-flex
  align-items center
  justify-content center
  margin 0 auto

  &:hover
    color #e91e63

.coins
  display inline-flex
  align-items center
  gap 5px
  line-height 1
  font-weight 800

  img
    width 1em
    height 1em
    object-fit contain
    flex-shrink 0

.card-head
  display flex
  align-items center
  justify-content space-between
  gap 12px
  margin-bottom 16px

.card-title
  display flex
  align-items center
  gap 10px
  font-weight 700
  font-size 1rem

  i
    color #e91e63

  &.card-title--accent
    span
      color #e91e63

  &.block
    margin-bottom 14px

.edit-cart-link
  color #e91e63
  font-size 0.85rem
  font-weight 600
  text-decoration none
  display flex
  align-items center
  gap 6px

.cart-product
  display grid
  grid-template-columns 64px minmax(0, 1fr) auto auto
  gap 10px 8px
  align-items center
  padding 14px 0
  border-bottom 1px solid #f1f2f6

  &:last-of-type
    border-bottom none

.cart-product-img
  width 64px
  height 64px
  object-fit contain
  border-radius 10px
  background #fafafa

.cart-product-copy
  min-width 0

  h3
    margin 0 0 3px
    font-size 0.9rem
    font-weight 700
    line-height 1.25

  p
    margin 0
    font-size 0.76rem
    color #636e72
    line-height 1.25

    &.is-placeholder
      visibility hidden

.cart-product-qty
  flex-shrink 0

  button
    width 28px
    height 28px
    font-size 0.95rem

  span
    min-width 24px
    font-size 0.85rem

.cart-product-price
  display inline-flex
  align-items center
  gap 4px
  font-weight 800
  font-size 0.95rem
  line-height 1
  flex-shrink 0

  img
    width 1em
    height 1em
    object-fit contain

.qty-control
  display inline-flex
  align-items center
  border 1px solid #f3d1df
  border-radius 8px
  overflow hidden
  background #fff

  button
    width 30px
    height 30px
    border none
    background transparent
    cursor pointer
    font-size 1rem
    color #e91e63

    &:disabled
      opacity 0.4
      cursor not-allowed

  span
    min-width 28px
    text-align center
    font-weight 600
    font-size 0.9rem

.cart-product-price
  display flex
  align-items center
  gap 6px
  font-weight 800
  font-size 1.05rem

  img
    width 22px
    height 22px
    object-fit contain

.totals-grid
  display grid
  grid-template-columns repeat(3, minmax(0, 1fr))
  grid-template-rows auto auto minmax(1.1em, auto)
  row-gap 9px
  column-gap 0
  margin-top 16px
  padding-top 16px
  border-top 1px solid #f1f2f6

.total-cell
  display grid
  grid-template-rows subgrid
  grid-row span 3
  align-items start
  justify-items center
  text-align center
  padding 10px 8px
  min-width 0
  box-sizing border-box

  &:not(:last-child)
    border-right 1px solid #f1f2f6

  .label
    font-size 0.78rem
    color #636e72
    font-weight 500
    line-height 1.3
    width 100%
    padding 0 4px

  .value
    font-weight 800
    font-size 1rem
    justify-content center
    margin 0 auto

    @media (min-width tablet-break)
      font-size 1.35rem

    &.coins
      display inline-flex
      align-items center
      gap 7px
      width auto
      justify-content center

      img
        width 1em
        height 1em
        flex-shrink 0
        object-fit contain

    &.cash
      color #e91e63
      display block
      width 100%
      text-align center

      &.is-zero
        color #2d3436

  .total-hint
    font-size 0.78rem
    font-weight 500
    line-height 1.2
    min-height 1.1em
    width 100%

    &.success
      color #27ae60

    &.warn
      color #e67e22

    &.is-placeholder
      visibility hidden

.bonus-used-banner
  margin-top 14px
  background #e8f8ef
  border 1px solid #b7e4c7
  color #2d6a4f
  border-radius 10px
  padding 12px 14px
  font-size 0.88rem
  display flex
  align-items center
  gap 8px

  i
    font-size 1.1rem
    flex-shrink 0

  p
    margin 0
    line-height 1.45

  strong
    font-weight 800
    color #1b7a43

.delivery-options
  display grid
  grid-template-columns 1fr 1fr
  gap 12px
  margin-bottom 16px

.delivery-option
  display flex
  gap 12px
  align-items flex-start
  text-align left
  padding 14px
  border 2px solid #eceff1
  border-radius 12px
  background #fff
  cursor pointer
  transition 0.2s

  &.active
    border-color #e91e63
    background #fff5f8

    .radio-dot
      border-color #e91e63

      &::after
        opacity 1

  strong
    display block
    margin-bottom 4px
    font-size 0.92rem

  p
    margin 0
    font-size 0.8rem
    color #636e72
    line-height 1.4

.radio-dot
  width 18px
  height 18px
  border-radius 50%
  border 2px solid #cfd8dc
  margin-top 2px
  flex-shrink 0
  position relative

  &::after
    content ''
    position absolute
    inset 3px
    border-radius 50%
    background #e91e63
    opacity 0

.field-block
  label
    display block
    font-size 0.85rem
    font-weight 600
    margin-bottom 8px

.office-select
  width 100%
  border 1px solid #e0e0e0
  border-radius 10px
  padding 10px 40px 10px 12px
  font-size 0.9rem
  background #fff
  appearance none
  -webkit-appearance none
  -moz-appearance none
  background-image url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23636e72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E")
  background-repeat no-repeat
  background-position right 18px center
  background-size 14px
  cursor pointer

  &:focus
    outline none
    border-color #e91e63

.office-address
  margin 8px 0 0
  font-size 0.82rem
  color #636e72

.delivery-note
  font-size 0.85rem
  color #636e72

.receipt-card
  padding 0
  overflow hidden
  background #fff8f0
  border-color #f5e6d6

.receipt-toggle
  width 100%
  display flex
  align-items flex-start
  justify-content space-between
  gap 14px
  padding 16px 20px
  border none
  background transparent
  cursor pointer
  text-align left

.receipt-toggle-copy
  flex 1
  min-width 0

.receipt-toggle-title
  display flex
  align-items center
  gap 10px
  margin-bottom 6px

  i
    color #f0a500
    font-size 1rem
    flex-shrink 0

  strong
    font-size 0.98rem
    font-weight 700
    color #2d3436
    line-height 1.3

.receipt-toggle-copy p
  margin 0
  font-size 0.85rem
  color #636e72
  line-height 1.45

  @media (min-width tablet-break)
    white-space nowrap
    font-size 0.82rem

.receipt-chevron
  color #636e72
  font-size 0.85rem
  margin-top 4px
  flex-shrink 0

.receipt-body
  padding 0 20px 18px
  background transparent

.receipt-options
  display flex
  flex-wrap wrap
  gap 16px
  font-size 0.88rem

  label
    display flex
    align-items center
    gap 6px
    cursor pointer

.checkout-summary-bar
  display grid
  grid-template-columns repeat(3, 1fr)
  gap 12px
  background #fff
  border 1px solid #eceff1
  border-radius 14px
  padding 16px 18px
  margin 0 0 14px

  .checkout-summary-cell
    display flex
    flex-direction column
    gap 8px
    font-size 0.82rem
    color #636e72
    min-width 0
    border-bottom none

    span
      line-height 1.3
      font-size 0.72rem
      min-height 2.6em

    strong
      font-size 1rem
      color #2d3436
      line-height 1

      &.coins
        display inline-flex
        align-items center
        gap 5px
        font-weight 800

        img
          width 1em
          height 1em
          object-fit contain
          flex-shrink 0

    &--highlight strong.cash
      color #e91e63
      font-size 1.35rem

.continue-btn
  width 100%
  border none
  border-radius 12px
  background #e91e63
  color #fff
  font-size 1rem
  font-weight 700
  padding 14px 20px
  cursor pointer
  display flex
  align-items center
  justify-content center
  gap 10px
  transition 0.2s

  &:hover
    background #d81b60

  &:disabled
    opacity 0.7
    cursor not-allowed

.confirm-desktop-only
  display none

  @media (min-width tablet-break)
    display block

.confirm-mobile-only
  display block

  @media (min-width tablet-break)
    display none

.confirm-ready-banner
  display flex
  align-items flex-start
  gap 12px
  background #e8f8ef
  border 1px solid #b7e4c7
  border-radius 12px
  padding 14px 16px
  margin-bottom 16px

  > i
    color #27ae60
    font-size 1.2rem
    margin-top 2px
    flex-shrink 0

  strong
    display block
    font-size 0.95rem
    margin-bottom 4px

  p
    margin 0
    font-size 0.85rem
    color #636e72
    line-height 1.4

.confirm-section-toggle
  width 100%
  display flex
  align-items center
  justify-content space-between
  gap 12px
  border none
  background transparent
  padding 0
  margin-bottom 0
  cursor pointer
  text-align left

.confirm-toggle-icon
  color #636e72
  font-size 0.85rem
  flex-shrink 0

  @media (min-width tablet-break)
    display none

.confirm-products-body
  margin-top 16px

  &.is-collapsed
    display none

  @media (min-width tablet-break)
    display block !important

.confirm-product-row
  display grid
  grid-template-columns 56px minmax(0, 1fr) auto
  gap 12px
  align-items center
  padding 14px 0
  border-bottom 1px solid #f1f2f6

  &:last-of-type
    border-bottom none

  > img
    width 56px
    height 56px
    object-fit contain
    border-radius 8px
    background #fafafa

  .coin-value
    font-size 0.92rem
    font-weight 800
    line-height 1

    img
      width 1em
      height 1em

.confirm-product-copy
  min-width 0

  strong
    display block
    font-size 0.92rem
    margin-bottom 3px

  span
    display block
    font-size 0.78rem
    color #636e72
    margin-bottom 6px

  em
    display inline-block
    font-style normal
    font-size 0.72rem
    font-weight 600
    color #e91e63
    background #fff5f8
    border 1px solid #f3d1df
    border-radius 999px
    padding 2px 8px

.confirm-totals-grid
  margin-top 4px
  padding-top 10px
  grid-template-rows auto auto
  row-gap 4px

  @media (max-width 899px)
    display none

  .total-cell
    grid-template-rows auto auto
    grid-row span 2
    padding 4px 2px
    row-gap 4px
    align-content start

  .value.coins.is-discount
    color #e91e63

.confirm-mobile-summary
  display block

  @media (min-width tablet-break)
    display none

.confirm-block-title
  margin 0 0 12px
  font-size 1rem
  font-weight 700
  color #2d3436

.confirm-block-sub
  margin -6px 0 12px
  font-size 0.82rem
  color #636e72

.confirm-mobile-totals
  display flex
  gap 0
  margin-bottom 10px

.confirm-mobile-total-cell
  flex 1 1 0
  min-width 0
  text-align center
  padding 0 4px
  display flex
  flex-direction column
  align-items center
  justify-content flex-start

  span
    display block
    font-size 0.62rem
    color #636e72
    line-height 1.2
    min-height 2.2em
    margin-bottom 7px
    padding 0 2px
    width 100%

  strong
    display inline-flex
    align-items center
    justify-content center
    gap 5px
    font-size 0.88rem
    font-weight 800
    line-height 1

    &.is-discount
      color #e91e63

    &.is-cash
      color #e91e63
      font-size 0.95rem

.confirm-pay-total-bar
  display flex
  align-items center
  justify-content space-between
  gap 12px
  background #fff5f8
  border-radius 10px
  padding 12px 14px
  margin-top 12px

  span
    font-size 0.9rem
    font-weight 600

  strong
    font-size 1.15rem
    font-weight 800
    color #e91e63

  &.is-covered
    background #e8f8ef
    border 1px solid #b7e4c7

    strong.coins
      display inline-flex
      align-items center
      gap 4px
      color #27ae60

      img
        width 1em
        height 1em

.confirm-payment-options
  display grid
  gap 10px

  &--sidebar
    margin-bottom 12px

.confirm-payment-option
  display flex
  align-items center
  gap 10px
  width 100%
  padding 12px 14px
  border 2px solid #eceff1
  border-radius 12px
  background #fff
  cursor pointer
  text-align left
  font-size 0.88rem
  font-weight 600
  color #2d3436
  transition 0.2s

  i:not(.option-chevron)
    color #636e72
    font-size 1rem
    width 18px
    text-align center

  .option-chevron
    margin-left auto
    color #b2bec3
    font-size 0.75rem
    transition transform 0.2s

    &.rotated
      transform rotate(180deg)

  &.active
    border-color #e91e63
    background #fff5f8

    .radio-dot
      border-color #e91e63

      &::after
        opacity 1

    i:not(.option-chevron)
      color #e91e63

.confirm-payment-note
  display flex
  align-items flex-start
  gap 8px
  margin 12px 0 0
  font-size 0.78rem
  color #e91e63
  line-height 1.35

  i
    margin-top 2px
    flex-shrink 0

.confirm-bank-options
  display grid
  gap 6px
  margin-top 10px

.confirm-bank-state
  background #f8f9fa
  border 1px solid #eceff1
  border-radius 10px
  padding 12px 14px
  font-size 0.82rem
  color #636e72
  line-height 1.4

.confirm-bank-option
  width 100%
  border 1px solid #e0e0e0
  border-radius 10px
  background #f8f9fa
  padding 12px 14px
  text-align left
  font-size 0.88rem
  font-weight 600
  color #2d3436
  cursor pointer
  transition 0.2s

  &:hover
    border-color #e91e63
    background #fff5f8

  &.selected
    background #e91e63
    border-color #e91e63
    color #fff

.confirm-bank-info
  background #f8f9fa
  border 1px solid #eceff1
  border-radius 10px
  padding 12px 14px
  margin-top 10px

.confirm-bank-info-row
  display flex
  justify-content space-between
  gap 12px
  font-size 0.82rem
  padding 4px 0

  strong
    color #636e72
    font-weight 600
    flex-shrink 0

  span
    text-align right
    color #2d3436
    word-break break-word

.confirm-info-grid
  display grid
  grid-template-columns 1fr 1fr
  gap 12px
  margin-bottom 16px

  @media (max-width 899px)
    grid-template-columns 1fr
    gap 10px
    margin-bottom 12px

.confirm-info-card
  margin-bottom 0

.confirm-info-head
  display flex
  align-items center
  justify-content space-between
  gap 10px
  margin-bottom 10px

.confirm-info-chevron
  color #b2bec3
  font-size 0.8rem

.confirm-info-main
  margin 0 0 6px
  font-size 0.88rem
  font-weight 700
  line-height 1.35

.confirm-info-sub
  margin 0
  font-size 0.8rem
  color #636e72
  line-height 1.4

.confirm-info-note
  margin 8px 0 0
  font-size 0.78rem
  color #636e72
  line-height 1.35

.confirm-bottom-note
  display flex
  align-items flex-start
  gap 10px
  background #fff5f8
  border 1px solid #f3d1df
  border-radius 12px
  padding 12px 14px
  margin-bottom 16px

  i
    color #e91e63
    margin-top 2px
    flex-shrink 0

  p
    margin 0
    font-size 0.82rem
    color #636e72
    line-height 1.4

.confirm-sidebar-title
  margin 0 0 16px
  font-size 1.05rem
  font-weight 800
  color #e91e63

.confirm-sidebar-rows .sidebar-row strong.is-discount
  color #e91e63

.confirm-sidebar-total
  display flex
  align-items center
  justify-content space-between
  gap 12px
  background #fff5f8
  border-radius 10px
  padding 14px 16px
  margin 16px 0

  span
    font-size 0.9rem
    font-weight 600
    color #636e72

  strong
    font-size 1.35rem
    font-weight 800
    color #e91e63

  &.is-covered
    background #e8f8ef
    border 1px solid #b7e4c7

    span
      color #2d3436

    strong.coins
      display inline-flex
      align-items center
      gap 4px
      color #27ae60
      font-size 1.15rem

      img
        width 1em
        height 1em

.confirm-saved-box
  display flex
  align-items flex-start
  gap 10px
  background #e8f8ef
  border 1px solid #b7e4c7
  border-radius 10px
  padding 12px 14px
  margin-bottom 18px

  i
    color #27ae60
    margin-top 2px

  p
    margin 0
    font-size 0.85rem
    line-height 1.4
    color #2d6a4f

  strong
    color #1b7a43

.confirm-payment-block
  margin-bottom 18px

  h3
    margin 0 0 12px
    font-size 0.95rem
    font-weight 700

.confirm-mobile-footer
  margin-top 4px

  .continue-btn
    margin-bottom 10px

.confirm-secure
  display flex
  align-items center
  justify-content center
  gap 6px
  margin 0
  font-size 0.78rem
  color #636e72

  i
    font-size 0.72rem

.confirm-sidebar
  @media (min-width tablet-break)
    display block

.confirm-layout
  @media (min-width tablet-break)
    align-items start

@media (max-width 899px)
  .savings-checkout
    padding 16px 14px 28px

  .checkout-header h1
    font-size 1.45rem

  .checkout-card
    padding 16px 14px
    margin-bottom 12px
    border-radius 14px

  .card-head
    margin-bottom 12px

  .edit-cart-link
    font-size 0.78rem
    white-space nowrap

  .total-cell
    padding 10px 6px

    .label
      font-size 0.62rem
      line-height 1.2

    .value
      font-size 0.88rem

      &.coins img
        width 1em
        height 1em

      &.cash
        font-size 0.88rem

    .total-hint
      font-size 0.62rem
      min-height 1em

  .bonus-used-banner
    font-size 0.8rem
    padding 10px 12px

  .delivery-options
    gap 8px

  .delivery-option
    padding 10px
    gap 8px

    strong
      font-size 0.8rem
      margin-bottom 2px

    p
      font-size 0.68rem
      line-height 1.3

    .radio-dot
      width 16px
      height 16px

  .field-block label
    font-size 0.82rem

  .office-select
    font-size 0.85rem
    padding 10px 36px 10px 12px

  .office-address
    font-size 0.78rem

  .receipt-toggle
    padding 14px 16px

  .receipt-toggle-title strong
    font-size 0.9rem

  .receipt-toggle-copy p
    font-size 0.78rem
    line-height 1.35

  .checkout-summary-bar
    display flex
    align-items stretch
    gap 0
    padding 12px 6px
    border-radius 12px

    .checkout-summary-cell
      flex 1 1 0
      min-width 0
      padding 0 5px
      gap 6px
      align-items center
      text-align center

      span
        font-size 0.62rem
        min-height 2.6em
        line-height 1.2
        width 100%
        display block

      strong
        font-size 0.88rem
        width 100%
        text-align center

        &.coins
          justify-content center

      &--highlight strong.cash
        font-size 1.05rem

  .confirm-ready-banner
    padding 12px 14px
    margin-bottom 12px

    strong
      font-size 0.88rem

    p
      font-size 0.78rem

  .confirm-totals-grid
    margin-top 2px
    padding-top 8px
    row-gap 2px

    .total-cell
      padding 2px 1px
      row-gap 2px

      .label
        font-size 0.56rem
        line-height 1.15
        padding 0

      .value
        font-size 0.78rem

        &.coins
          gap 4px

  .confirm-products-card
    .bonus-used-banner
      display none

  .confirm-products-body
    margin-top 10px

  .confirm-product-row
    grid-template-columns 52px minmax(0, 1fr) auto
    gap 8px
    padding 8px 0

    > img
      width 52px
      height 52px

    .coin-value img
      width 1em
      height 1em

  .confirm-mobile-totals
    margin-bottom 10px

  .confirm-mobile-total-cell
    padding 0 4px

    span
      margin-bottom 7px
      min-height 2.2em

    strong
      font-size 0.86rem

      &.is-cash
        font-size 0.92rem

  .confirm-info-main
    font-size 0.82rem

  .confirm-info-sub
    font-size 0.75rem

  .confirm-bottom-note
    padding 10px 12px
    margin-bottom 12px

    p
      font-size 0.78rem

  .continue-btn
    padding 13px 18px
    font-size 0.95rem
    border-radius 10px
</style>
