<template>
  <App :session="session" title="Retiros">
    <div class="wd-page">
      <h1 class="wd-title">Retiros</h1>
      <nav class="wd-tabs" aria-label="Secciones de retiros">
        <router-link class="wd-tab" exact to="/collect">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 7.6 15.8 4.7v2.9"/>
            <path d="M4 7.6h13.3A2.3 2.3 0 0 1 19.6 9.9v2.3"/>
            <path d="M4 7.6v9.3A1.7 1.7 0 0 0 5.7 18.6h6.5"/>
            <path d="M15.3 12.2h4.3v3.5h-4.3a1.75 1.75 0 0 1 0-3.5Z"/>
            <path d="M13.2 18.6h7.3"/>
            <path d="M18.2 16.1 20.8 18.6 18.2 21.1"/>
          </svg>
          Nuevo retiro
        </router-link>
        <router-link class="wd-tab" exact to="/collects">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
            <path d="M12 8v4.2l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Historial de retiros
        </router-link>
      </nav>

      <div v-if="loading" class="wd-loading">
        <Spinner :size="40" :color="'#e91e63'" />
      </div>

      <div v-else class="wd-layout" :class="{ 'wd-layout--single': collectStep === 'detalle' || (withdrawType !== 'transfer' && !hasDestination) }">
        <template v-if="collectStep !== 'detalle'">
        <section class="wd-block">
          <h2>¿Cómo deseas recibir tu retiro?</h2>
          <p>Selecciona el método de retiro que prefieras.</p>
          <div class="wd-methods">
            <button type="button" class="wd-method" :class="{ selected: withdrawType === 'bank' }" @click="selectWithdrawType('bank')">
              <span class="wd-method-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 10h16M5 10v8M9 10v8M15 10v8M19 10v8M3.5 18.5h17M12 4l8 5H4l8-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="wd-method-text">
                <strong>Cuenta bancaria</strong>
                <span>Recibe el pago en tu cuenta bancaria.</span>
              </span>
              <span class="wd-radio">
                <svg v-if="withdrawType === 'bank'" viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </button>

            <button type="button" class="wd-method" :class="{ selected: withdrawType === 'yape' }" @click="selectWithdrawType('yape')">
              <span class="wd-method-icon" aria-hidden="true">
                <img src="@/assets/img/mixtoo.png" alt="" />
              </span>
              <span class="wd-method-text">
                <strong>Yape / Plin</strong>
                <span>Recibe el pago en tu billetera digital.</span>
              </span>
              <span class="wd-radio">
                <svg v-if="withdrawType === 'yape'" viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </button>

            <button type="button" class="wd-method" :class="{ selected: withdrawType === 'transfer' }" @click="selectWithdrawType('transfer')">
              <span class="wd-method-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5.5 10.8A7 7 0 0 1 18.4 9.2"/>
                  <path d="M15.6 6.8 18.5 9.2 15.4 11.1"/>
                  <path d="M18.5 13.2A7 7 0 0 1 5.6 14.8"/>
                  <path d="M8.4 17.2 5.5 14.8 8.6 12.9"/>
                </svg>
              </span>
              <span class="wd-method-text">
                <strong>Transferir saldo</strong>
                <span>Transfiere tu saldo a otra cuenta SIFRAH.</span>
              </span>
              <span class="wd-radio">
                <svg v-if="withdrawType === 'transfer'" viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </button>
          </div>

          <aside v-if="withdrawType !== 'transfer' && !hasDestination" class="wd-notice">
            <span class="wd-notice-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 10.6v5.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <div>
              <strong>Aún no tienes configurados tus datos</strong>
              <p>Para solicitar un retiro, primero debes registrar tu cuenta bancaria o billetera digital.</p>
              <router-link to="/profile?tab=bancarios">Ir a mi perfil →</router-link>
            </div>
          </aside>
        </section>

        <section v-if="withdrawType !== 'transfer' && hasDestination" class="wd-block">
          <h2>Destino de retiro</h2>
          <p>Usaremos los datos que tienes guardados.</p>

          <div class="wd-dest">
            <div class="wd-dest-top">
              <span class="wd-bank-logo" :class="destinationLogoClass">
                <img v-if="bankLogoSrc" :src="bankLogoSrc" alt="" />
                <template v-else>{{ bankShort }}</template>
              </span>
              <div class="wd-dest-info">
                <div class="wd-dest-head">
                  <strong>{{ destinationTitle }}</strong>
                  <span class="wd-verified">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3.2 19.4 6.2v5.8c0 4.7-3.2 8.4-7.4 9.6-4.2-1.2-7.4-4.9-7.4-9.6V6.2L12 3.2z" fill="none" stroke="currentColor" stroke-width="1.7"/>
                      <path d="M8.2 12.2 10.8 14.7 16 9.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    Verificada
                  </span>
                </div>
                <span class="wd-dest-meta">{{ destinationNumber }}</span>
                <em v-if="destinationHolder" class="wd-dest-meta">Titular: {{ destinationHolder }}</em>
              </div>
            </div>
            <div v-if="withdrawType === 'yape' && yape && plin" class="wd-wallet-picks">
              <button type="button" :class="{ selected: walletChoice === 'yape' }" @click="walletChoice = 'yape'">Yape</button>
              <button type="button" :class="{ selected: walletChoice === 'plin' }" @click="walletChoice = 'plin'">Plin</button>
            </div>
            <router-link class="wd-change" to="/profile?tab=bancarios">Cambiar cuenta →</router-link>
          </div>

          <button type="button" class="wd-btn" :disabled="!hasDestination" @click="goToDetail">Siguiente</button>
        </section>
        </template>

        <section v-if="collectStep === 'detalle'" class="wd-block">
          <button type="button" class="wd-back" @click="collectStep = 'destino'">← Volver</button>
          <h2>Detalle del retiro</h2>
          <p>Completa la información para solicitar tu retiro.</p>

          <div class="wd-balance-card">
            <span class="wd-balance-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 8h13.2A2.3 2.3 0 0 1 19.5 10.3v8.2H4z"/>
                <path d="M4 8 15.8 5.2v2.8"/>
                <path d="M15.2 12.4h4.3v3.6h-4.3a1.8 1.8 0 0 1 0-3.6Z"/>
              </svg>
            </span>
            <div class="wd-balance-text">
              <span>Saldo disponible</span>
              <strong>S/ {{ balance }}</strong>
            </div>
          </div>

          <form @submit.prevent="openSummary">
            <div class="wd-field">
              <label for="wd-amount">Monto a retirar</label>
              <div class="wd-amount">
                <span>S/</span>
                <input
                  id="wd-amount"
                  v-model="amount"
                  type="text"
                  inputmode="decimal"
                  placeholder="Ingresa el monto a retirar"
                  :class="{ error: error.amount }"
                  @keydown="reset('amount')"
                  oninput="this.value=this.value.replace(/(?![0-9.])./gmi,'')"
                />
              </div>
              <div class="wd-limits">
                <span>Máximo: S/ {{ balance }}</span>
              </div>
            </div>

            <div class="wd-field">
              <label>Comprobante / Factura</label>
              <p class="wd-field-hint">Adjunta tu factura o boleta, de corresponder.</p>
              <input
                ref="receiptInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                class="wd-file-input"
                @change="onReceiptChange"
              />
              <button type="button" class="wd-upload" @click="$refs.receiptInput.click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 16.5V7.2"/>
                  <path d="M8.6 10.2 12 6.8l3.4 3.4"/>
                  <path d="M5 16.2v2.2A1.6 1.6 0 0 0 6.6 20h10.8A1.6 1.6 0 0 0 19 18.4v-2.2"/>
                </svg>
                <strong>{{ receiptName || "Subir archivo" }}</strong>
                <span>PDF, JPG o PNG (Máx. 10 MB)</span>
              </button>
              <p class="wd-alert" v-if="fileError">{{ fileError }}</p>
            </div>

            <div class="wd-field">
              <label for="wd-note">Nota (opcional)</label>
              <p class="wd-field-hint">Agrega una indicación adicional sobre tu retiro.</p>
              <div class="wd-note-wrap">
                <textarea
                  id="wd-note"
                  v-model="desc"
                  maxlength="200"
                  placeholder="Escribe aquí cualquier indicación adicional (opcional)"
                ></textarea>
                <span class="wd-note-count">{{ noteLength }}/200</span>
              </div>
            </div>

            <p class="wd-alert" v-if="alert">{{ alert | alert }}</p>
            <button class="wd-btn wd-btn-icon" type="submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 7.6 15.8 4.7v2.9"/>
                <path d="M4 7.6h13.3A2.3 2.3 0 0 1 19.6 9.9v2.3"/>
                <path d="M4 7.6v9.3A1.7 1.7 0 0 0 5.7 18.6h6.5"/>
                <path d="M15.3 12.2h4.3v3.5h-4.3a1.75 1.75 0 0 1 0-3.5Z"/>
                <path d="M13.2 18.6h7.3"/>
                <path d="M18.2 16.1 20.8 18.6 18.2 21.1"/>
              </svg>
              <span>Solicitar retiro</span>
            </button>
            <p class="wd-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
                <rect x="5.2" y="11" width="13.6" height="9" rx="1.8"/>
                <path d="M8 11V8.2a4 4 0 0 1 8 0V11"/>
              </svg>
              Tu información está protegida.
            </p>
          </form>
        </section>

        <section v-if="collectStep !== 'detalle' && withdrawType === 'transfer'" class="wd-block">
          <h2>Transferir saldo</h2>
          <p>Envía saldo a otra cuenta SIFRAH.</p>
          <form v-if="!transferConfirmation" @submit.prevent="validateTransfer">
            <p class="wd-balance">Total disponible: S/. {{ balance }}</p>
            <div class="wd-field">
              <label for="wd-dni">DNI del receptor</label>
              <input
                id="wd-dni"
                v-model="dni"
                placeholder="DNI"
                inputmode="numeric"
                oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                @keydown="transferError = null"
              />
            </div>
            <div class="wd-field">
              <label for="wd-tamount">Monto</label>
              <input
                id="wd-tamount"
                v-model.number="transferAmount"
                placeholder="S/. 0.00"
                inputmode="decimal"
                oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')"
                @keydown="transferError = null"
              />
            </div>
            <div class="wd-field">
              <label for="wd-motivo">Motivo</label>
              <textarea id="wd-motivo" v-model="transferDesc" placeholder="Motivo de la transferencia" maxlength="30"></textarea>
            </div>
            <p class="wd-alert" v-if="transferError">{{ transferError }}</p>
            <button class="wd-btn" :disabled="validatingTransfer">
              <span v-if="!validatingTransfer">Transferir</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Validando...</span>
            </button>
          </form>
          <form v-else class="wd-transfer-confirm" @submit.prevent="sendTransfer">
            <img v-if="transferPhoto" :src="transferPhoto" class="wd-transfer-avatar" />
            <p class="wd-transfer-name">{{ transferName }}</p>
            <div class="wd-field" style="width:100%">
              <label>Contraseña</label>
              <div class="wd-pass">
                <input
                  :type="showTransferPass ? 'text' : 'password'"
                  placeholder="Confirmar contraseña"
                  v-model="transferPassword"
                  @keydown="transferError2 = null"
                />
                <button type="button" @click="showTransferPass = !showTransferPass" aria-label="Mostrar contraseña">
                  <i class="far" :class="showTransferPass ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
            <p class="wd-alert" v-if="transferError2">{{ transferError2 }}</p>
            <p class="wd-balance">Monto a enviar: S/. {{ transferAmountDisplay }}</p>
            <template v-if="!transferDone">
              <button type="button" class="wd-cancel" @click="transferConfirmation = false">Cancelar</button>
              <button class="wd-btn" :disabled="sendingTransfer">
                <span v-if="!sendingTransfer">Confirmar</span>
                <span v-else><i class="fas fa-spinner fa-spin"></i> Confirmando...</span>
              </button>
            </template>
            <p class="wd-ok" v-show="transferDone">Transferencia exitosa</p>
          </form>
        </section>
      </div>

      <div v-if="showSummary" class="wd-modal-overlay" @click.self="closeSummary">
        <div class="wd-modal" role="dialog" aria-labelledby="wd-summary-title">
          <div class="wd-modal-head">
            <div>
              <h3 id="wd-summary-title">Resumen de retiro</h3>
              <p>Revisa la información antes de continuar.</p>
            </div>
            <button type="button" class="wd-modal-close" aria-label="Cerrar" @click="closeSummary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
                <path d="M7 7l10 10M17 7 7 17"/>
              </svg>
            </button>
          </div>

          <div class="wd-summary">
            <div class="wd-summary-row">
              <span>Método de retiro</span>
              <strong class="wd-summary-pink">{{ methodLabel }}</strong>
            </div>
            <div class="wd-summary-row wd-summary-dest">
              <span>Destino</span>
              <div class="wd-summary-dest-val">
                <span class="wd-bank-logo" :class="destinationLogoClass">
                  <img v-if="bankLogoSrc" :src="bankLogoSrc" alt="" />
                  <template v-else>{{ bankShort }}</template>
                </span>
                <div>
                  <strong>{{ summaryDestTitle }}</strong>
                  <em>{{ summaryDestType }}</em>
                </div>
              </div>
            </div>
            <div class="wd-summary-row" v-if="summaryHolder">
              <span>Titular</span>
              <strong>{{ summaryHolder }}</strong>
            </div>
            <div class="wd-summary-row">
              <span>Saldo disponible</span>
              <strong class="wd-summary-pink">S/ {{ balance }}</strong>
            </div>
            <div class="wd-summary-row">
              <span>Monto a retirar</span>
              <strong class="wd-summary-pink">S/ {{ amountDisplay }}</strong>
            </div>
            <div class="wd-summary-row">
              <span>Comprobante / Factura</span>
              <strong :class="receiptName ? '' : 'wd-summary-warn'">{{ receiptName || "No adjuntado" }}</strong>
            </div>
            <div class="wd-summary-row">
              <span>Nota</span>
              <strong>{{ desc && desc.trim() ? desc : "—" }}</strong>
            </div>
          </div>

          <aside class="wd-notice wd-summary-notice">
            <span class="wd-notice-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 10.6v5.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
                <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <p>Tu solicitud será revisada por nuestro equipo y el pago se procesará según el método seleccionado.</p>
          </aside>

          <p class="wd-alert" v-if="alert">{{ alert | alert }}</p>
          <button type="button" class="wd-btn wd-btn-icon" :disabled="sending" @click="POST">
            <svg v-if="!sending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 8h13.2A2.3 2.3 0 0 1 19.5 10.3v8.2H4z"/>
              <path d="M4 8 15.8 5.2v2.8"/>
              <path d="M15.2 12.4h4.3v3.6h-4.3a1.8 1.8 0 0 1 0-3.6Z"/>
            </svg>
            <span v-if="!sending">Confirmar retiro</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Confirmando...</span>
          </button>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import yapeLogo from "@/assets/img/yape.png";
import plinLogo from "@/assets/img/plin.png";
import bcpLogo from "@/assets/img/bcp.jpg";
import interbankLogo from "@/assets/img/interbank.png";
import bbvaLogo from "@/assets/img/bbva.png";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      withdrawType: "bank",
      collectStep: "destino",
      showSummary: false,
      receiptName: null,
      fileError: null,
      cash: true,
      bank: null,
      account: null,
      account_type: null,
      account_holder: null,
      yape: null,
      plin: null,
      walletChoice: "yape",
      balance: null,
      amount: null,
      desc: null,
      office: "central",
      error: {
        bank: false,
        account: false,
        amount: false,
        office: false,
      },
      loading: true,
      sending: false,
      alert: null,
      success: false,
      dni: null,
      transferAmount: null,
      transferDesc: null,
      transferPassword: null,
      transferName: null,
      transferPhoto: null,
      transferError: null,
      transferError2: null,
      transferConfirmation: false,
      validatingTransfer: false,
      sendingTransfer: false,
      transferDone: false,
      showTransferPass: false,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    noteLength() {
      return String(this.desc || "").length;
    },
    amountDisplay() {
      const n = Number(String(this.amount || "").replace(",", "."));
      return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    },
    methodLabel() {
      if (this.withdrawType === "yape") return "Yape / Plin";
      return "Cuenta bancaria";
    },
    summaryDestTitle() {
      const last = this.destinationNumber.replace(".... ", "");
      const name = this.withdrawType === "yape" ? this.walletBrand : this.bank || "Banco";
      return `${name} •••• ${last}`;
    },
    summaryDestType() {
      if (this.withdrawType === "yape") return "Billetera digital";
      const type = this.account_type ? String(this.account_type).toLowerCase() : "ahorros";
      return `Cuenta de ${type}`;
    },
    summaryHolder() {
      return this.destinationHolder;
    },
    transferAmountDisplay() {
      const n = Number(this.transferAmount);
      return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    },
    walletNumber() {
      if (this.walletChoice === "plin") return this.plin || this.yape || "";
      return this.yape || this.plin || "";
    },
    walletBrand() {
      if (this.walletChoice === "plin" && this.plin) return "Plin";
      if (this.yape) return "Yape";
      if (this.plin) return "Plin";
      return "Yape";
    },
    walletLogo() {
      return this.walletBrand === "Plin" ? plinLogo : yapeLogo;
    },
    bankLogoSrc() {
      if (this.withdrawType === "yape") return this.walletLogo;
      if (this.destinationLogoClass === "is-bcp") return bcpLogo;
      if (this.destinationLogoClass === "is-interbank") return interbankLogo;
      if (this.destinationLogoClass === "is-bbva") return bbvaLogo;
      return null;
    },
    hasDestination() {
      if (this.withdrawType === "bank") {
        return !!(String(this.bank || "").trim() && String(this.account || "").trim());
      }
      if (this.withdrawType === "yape") return !!String(this.walletNumber || "").trim();
      return true;
    },
    destinationVerified() {
      return this.hasDestination;
    },
    bankShort() {
      const b = String(this.bank || "").toUpperCase();
      if (b.includes("INTER")) return "IBK";
      if (b.includes("BBVA")) return "BBVA";
      if (b.includes("BCP")) return "BCP";
      return (this.bank || "Banco").slice(0, 4).toUpperCase();
    },
    destinationLogoClass() {
      if (this.withdrawType === "yape") {
        return this.walletBrand === "Plin" ? "is-plin" : "is-yape";
      }
      const b = String(this.bank || "").toUpperCase();
      if (b.includes("INTER")) return "is-interbank";
      if (b.includes("BBVA")) return "is-bbva";
      if (b.includes("BCP")) return "is-bcp";
      return "is-default";
    },
    destinationTitle() {
      if (this.withdrawType === "yape") return this.walletBrand;
      const type = this.account_type ? `Cuenta de ${String(this.account_type).toLowerCase()}` : "Cuenta";
      return `${this.bank || "Banco"} - ${type}`;
    },
    destinationNumber() {
      const raw = String(
        this.withdrawType === "yape" ? this.walletNumber : this.account || ""
      ).replace(/\s/g, "");
      if (raw.length < 4) return raw;
      return `.... ${raw.slice(-4)}`;
    },
    destinationHolder() {
      if (this.withdrawType === "yape") return "";
      const holder = this.account_holder || `${this.$store.state.name || ""} ${this.$store.state.lastName || ""}`.trim();
      return holder;
    },
  },
  filters: {
    alert(msg) {
      if (msg == "amount exceeds the balance") return "Excede la cantidad disponible";
      if (msg == "invalid amount") return "Monto inválido";
      if (msg == "operation in progress") return "Hay una operación en curso";
      return msg;
    },
  },
  async created() {
    const { data } = await api.Collect.GET(this.session);
    this.loading = false;
    if (data.error && data.msg == "invalid session") this.$router.push("/login");
    if (data.error && data.msg == "unverified user") this.$router.push("/verify");
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.bank = this.textValue(data.bank);
    this.account = this.textValue(data.account);
    this.account_type = this.textValue(data.account_type);
    this.account_holder = this.textValue(data.account_holder || data.titular);
    this.yape = this.textValue(data.yape);
    this.plin = this.textValue(data.plin);
    this.walletChoice = this.yape ? "yape" : "plin";
    const available = Math.max(0, Number(data.balance) || 0);
    this.balance = available.toFixed(2);
  },
  methods: {
    textValue(value) {
      if (value == null) return null;
      const text = String(value).trim();
      return text && text !== "null" && text !== "undefined" ? text : null;
    },
    goToDetail() {
      if (!this.hasDestination) return;
      this.alert = null;
      this.collectStep = "detalle";
    },
    closeSummary() {
      if (this.sending) return;
      this.showSummary = false;
    },
    openSummary() {
      this.alert = null;
      if (this.withdrawType === "transfer") return;
      const isWallet = this.withdrawType === "yape";
      const bank = isWallet ? this.walletBrand : this.bank;
      const account = isWallet ? this.walletNumber : this.account;
      const withdrawAmount = Number(String(this.amount || "").replace(",", "."));
      if (!bank || !account) return;
      if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
        this.error.amount = true;
        return (this.alert = "invalid amount");
      }
      const available = Math.max(0, Number(this.balance) || 0);
      if (withdrawAmount > available) return (this.alert = "amount exceeds the balance");
      this.showSummary = true;
    },
    onReceiptChange(event) {
      this.fileError = null;
      const file = event.target.files && event.target.files[0];
      if (!file) {
        this.receiptName = null;
        return;
      }
      const okType = /pdf|jpeg|jpg|png/i.test(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name);
      if (!okType) {
        this.receiptName = null;
        this.fileError = "Solo se permiten PDF, JPG o PNG";
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.receiptName = null;
        this.fileError = "El archivo no debe superar 10 MB";
        event.target.value = "";
        return;
      }
      this.receiptName = file.name;
    },
    selectWithdrawType(type) {
      this.withdrawType = type;
      this.cash = type === "bank" || type === "yape";
      this.alert = null;
      this.success = false;
      this.collectStep = "destino";
      if (type !== "transfer") {
        this.transferConfirmation = false;
        this.transferError = null;
        this.transferError2 = null;
        this.transferDone = false;
      }
    },
    async POST() {
      if (this.withdrawType === "transfer") return;
      const isWallet = this.withdrawType === "yape";
      const bank = isWallet ? this.walletBrand : this.bank;
      const account = isWallet ? this.walletNumber : this.account;
      const account_type = isWallet ? "Billetera digital" : this.account_type;
      const { desc, balance, office } = this;
      const withdrawAmount = Number(String(this.amount || "").replace(",", "."));

      if (!bank) return (this.error.bank = true);
      if (!account) return (this.error.account = true);
      if (!office) return (this.error.office = true);
      if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
        this.error.amount = true;
        return (this.alert = "invalid amount");
      }

      const available = Math.max(0, Number(balance) || 0);
      if (withdrawAmount > available) return (this.alert = "amount exceeds the balance");

      this.sending = true;
      const { data } = await api.Collect.POST(this.session, {
        cash: true,
        bank,
        account,
        account_type,
        amount: withdrawAmount,
        desc,
        office,
      });
      this.sending = false;
      if (data.error) return (this.alert = data.msg);
      this.success = true;
      this.showSummary = false;
      this.$router.push("/collects");
    },
    reset(name) {
      this.alert = null;
      if (name == "bank") this.error.bank = false;
      if (name == "account") this.error.account = false;
      if (name == "amount") this.error.amount = false;
      if (name == "office") this.error.office = false;
    },
    async validateTransfer() {
      const dni = this.dni;
      const amount = this.transferAmount;
      const desc = this.transferDesc;
      if (!dni) return (this.transferError = "Ingresar DNI");
      if (!amount) return (this.transferError = "Ingresar monto");
      if (amount > Number(this.balance)) return (this.transferError = "Monto inválido");
      this.validatingTransfer = true;
      const { data } = await api.Transfer.POST(this.session, {
        dni,
        amount,
        desc,
        type: "validate",
      });
      this.validatingTransfer = false;
      if (data.error) return (this.transferError = "Usuario inválido");
      this.transferConfirmation = true;
      this.transferName = data._name;
      this.transferPhoto = data._photo;
    },
    async sendTransfer() {
      if (!this.transferPassword) return (this.transferError2 = "Ingresar contraseña");
      this.sendingTransfer = true;
      const { data } = await api.Transfer.POST(this.session, {
        dni: this.dni,
        amount: this.transferAmount,
        desc: this.transferDesc,
        password: this.transferPassword,
        type: "send",
      });
      this.sendingTransfer = false;
      if (data.error) return (this.transferError2 = "Contraseña inválida");
      this.transferDone = true;
    },
  },
};
</script>

<style src="@/assets/style/views/app/Collect.css"></style>
