<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <h4 class="tabs">
      <router-link class="tab" exact to="/collect">Nuevo Retiro</router-link>
      <router-link class="tab" to="/collects">Historial de Retiros</router-link>
    </h4>
    <div class="collect-soft-bg">
      <section class="collect-soft-section">
        <div v-if="!loading" class="collect-soft-form">
          <div class="collect-soft-col">
            <div class="collect-soft-radios">
              <label
                :class="['soft-radio', { checked: withdrawType === 'cash' }]"
                @click.prevent="selectWithdrawType('cash')"
              >
                <input type="radio" :checked="withdrawType === 'cash'" />
                <span class="soft-radio-custom"></span>
                <span>Retirar en efectivo</span>
              </label>
              <label
                :class="['soft-radio', { checked: withdrawType === 'bank' }]"
                @click.prevent="selectWithdrawType('bank')"
              >
                <input type="radio" :checked="withdrawType === 'bank'" />
                <span class="soft-radio-custom"></span>
                <span>Retirar en cuenta bancaria</span>
              </label>
              <label
                :class="['soft-radio', { checked: withdrawType === 'transfer' }]"
                @click.prevent="selectWithdrawType('transfer')"
              >
                <input type="radio" :checked="withdrawType === 'transfer'" />
                <span class="soft-radio-custom"></span>
                <span>Transferir saldo</span>
              </label>
            </div>
            <template v-if="withdrawType !== 'transfer'">
            <div class="soft-form-group">
              <label>Oficina</label>
              <select
                v-model="office"
                :class="{ error: error.office }"
                @change="reset('office')"
                disabled
              >
                <option value="null" disabled>Oficina</option>
                <option value="central">Central</option>
                <option value="secondary">Ledezma</option>
              </select>
            </div>
            <div v-if="cash" class="soft-form-row">
              <div class="soft-form-group">
                <label>Banco</label>
                <input
                  readonly
                  placeholder="Banco"
                  v-model="bank"
                  :class="{ error: error.bank }"
                  @keydown="reset('bank')"
                />
              </div>
              <div class="soft-form-group">
                <label>Tipo de cuenta</label>
                <input
                  readonly
                  placeholder="Tipo de cuenta"
                  v-model="account_type"
                  :class="{ error: error.bank }"
                  @keydown="reset('bank')"
                />
              </div>
            </div>
            </template>
          </div>
          <form class="collect-soft-col" v-if="withdrawType !== 'transfer'" @submit.prevent="POST">
            <div v-if="cash" class="soft-form-group">
              <label>Número de cuenta</label>
              <input
                readonly
                placeholder="Número de cuenta"
                v-model="account"
                :class="{ error: error.account }"
                @keydown="reset('account')"
              />
            </div>
            <div class="collect-soft-balance">
              <small>Saldo disponible para retiro: S/. {{ balance }}</small>
            </div>
            <div class="soft-form-group">
              <label>Monto a retirar</label>
              <input
                placeholder="Monto a retirar"
                oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')"
                v-model.number="amount"
                :class="{ error: error.amount }"
                @keydown="reset('amount')"
              />
            </div>
            <div class="soft-form-group">
              <label>Descripción</label>
              <textarea
                v-model="desc"
                placeholder="Descripción"
                maxlength="30"
              ></textarea>
            </div>
            <transition name="fade">
              <p class="soft-alert" v-if="alert">{{ alert | alert }}</p>
            </transition>
            <transition name="fade">
              <small v-if="success" class="soft-success">Retiro Enviado</small>
            </transition>
            <button class="soft-btn" :disabled="sending">
              <span v-if="!sending">Solicitar retiro</span>
              <span v-else
                ><i class="fas fa-spinner fa-spin"></i> Guardando...</span
              >
            </button>
          </form>
          <div class="collect-soft-col" v-else>
            <form
              v-if="!transferConfirmation"
              class="collect-transfer-form"
              @submit.prevent="validateTransfer"
            >
              <div class="collect-soft-balance">
                <small>Total disponible: S/. {{ balance }}</small>
              </div>
              <div class="soft-form-row">
                <div class="soft-form-group">
                  <label>DNI</label>
                  <input
                    v-model="dni"
                    placeholder="Receptor"
                    inputmode="numeric"
                    oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                    @keydown="transferError = null"
                  />
                </div>
                <div class="soft-form-group">
                  <label>Monto</label>
                  <input
                    v-model.number="transferAmount"
                    placeholder="S/. 0.00"
                    inputmode="decimal"
                    oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')"
                    @keydown="transferError = null"
                  />
                </div>
              </div>
              <transition name="fade">
                <span v-if="transferError" class="soft-alert">{{ transferError }}</span>
              </transition>
              <div class="soft-form-group">
                <label>Motivo</label>
                <textarea
                  v-model="transferDesc"
                  placeholder="Motivo de la transferencia"
                  maxlength="30"
                ></textarea>
              </div>
              <button class="soft-btn" :disabled="validatingTransfer">
                <span v-if="!validatingTransfer">Transferir</span>
                <span v-else
                  ><i class="fas fa-spinner fa-spin"></i> Validando...</span
                >
              </button>
            </form>
            <form
              v-else
              class="collect-transfer-form"
              @submit.prevent="sendTransfer"
            >
              <div class="collect-transfer-confirm">
                <img
                  v-if="transferPhoto"
                  :src="transferPhoto"
                  class="collect-transfer-avatar"
                />
                <p class="collect-transfer-name">{{ transferName }}</p>
                <div class="soft-form-group">
                  <label>Contraseña</label>
                  <div class="collect-transfer-pass">
                    <input
                      :type="showTransferPass ? 'text' : 'password'"
                      placeholder="Confirmar contraseña"
                      v-model="transferPassword"
                      @keydown="transferError2 = null"
                    />
                    <i
                      class="show far"
                      :class="showTransferPass ? 'fa-eye-slash' : 'fa-eye'"
                      @click="showTransferPass = !showTransferPass"
                    ></i>
                  </div>
                </div>
                <transition name="fade">
                  <span v-if="transferError2" class="soft-alert">{{ transferError2 }}</span>
                </transition>
                <div class="collect-transfer-summary">
                  <small>Monto a enviar: S/. {{ transferAmountDisplay }}</small>
                  <br />
                  <span><i>{{ transferDesc }}</i></span>
                </div>
                <div v-show="!transferDone" class="collect-transfer-actions">
                  <small
                    @click="transferConfirmation = false"
                    class="collect-transfer-cancel"
                  >
                    <i class="fa fa-arrow-left"></i> Cancelar
                  </small>
                  <button class="soft-btn" :disabled="sendingTransfer">
                    <span v-if="!sendingTransfer">Confirmar</span>
                    <span v-else
                      ><i class="fas fa-spinner fa-spin"></i> Confirmando...</span
                    >
                  </button>
                </div>
                <small class="soft-success" v-show="transferDone"
                  >Transferencia exitosa</small
                >
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      withdrawType: "bank",
      cash: true,
      bank: null,
      account: null,
      account_type: null,
      // interbank_code: null,
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
    transferAmountDisplay() {
      const n = Number(this.transferAmount);
      return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    },
  },
  filters: {
    alert(msg) {
      if (msg == "amount exceeds the balance")
        return "Excede la cantidad disponible";
    },
  },
  async created() {
    // GET data
    const { data } = await api.Collect.GET(this.session);

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");
    if (data.error && data.msg == "unverified user")
      this.$router.push("/verify");

    // success
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);

    this.bank = data.bank;
    this.account = data.account;
    this.account_type = data.account_type;
    // this.ibk     = data.ibk
    const available = Math.max(0, Number(data.balance) || 0);
    this.balance = available.toFixed(2);
    // this.amount  = data.balance
  },
  methods: {
    isMobile() {
      return typeof window !== "undefined" && window.innerWidth <= 900;
    },
    selectWithdrawType(type) {
      if (type === "transfer" && !this.isMobile()) {
        this.$router.push("/transfer");
        return;
      }
      this.withdrawType = type;
      this.cash = type === "bank";
      if (type !== "transfer") {
        this.transferConfirmation = false;
        this.transferError = null;
        this.transferError2 = null;
        this.transferDone = false;
      }
    },
    async POST() {
      if (this.withdrawType === "transfer") return;
      const {
        cash,
        bank,
        account,
        account_type,
        amount,
        desc,
        balance,
        office,
      } = this;

      // validate fields
      if (cash && !bank) {
        return (this.error.bank = true);
      }
      if (cash && !account) {
        return (this.error.account = true);
      }
      if (!office) {
        return (this.error.office = true);
      }
      if (!amount) {
        return (this.error.amount = true);
      }

      const available = Math.max(0, Number(balance) || 0);
      if (amount > available) {
        return (this.alert = "amount exceeds the balance");
      }

      // POST Collect
      this.sending = true;

      const { data } = await api.Collect.POST(this.session, {
        cash,
        bank,
        account,
        account_type,
        amount,
        desc,
        office,
      });

      this.sending = false;

      // error
      if (data.error) return (this.alert = data.msg);

      // success
      this.success = true;
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
      if (amount > Number(this.balance))
        return (this.transferError = "Monto inválido");

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
      if (!this.transferPassword)
        return (this.transferError2 = "Ingresar contraseña");

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

<style scoped>
.collect-soft-bg {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 0;
}
.collect-soft-section {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  width: 100%;
  padding: 36px 24px 48px 24px;
  margin: 0 auto;
  animation: card-fadein-up 0.7s cubic-bezier(0.23, 1.02, 0.32, 1) both;
}
@keyframes card-fadein-up {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.tabs {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 24px;
}
.tabs .tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  height: 44px;
  padding: 0 20px;
  margin: 0 6px;
  box-sizing: border-box;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: #e91e63;
  background: #fce4ec;
  border: none;
  border-radius: 18px;
  text-decoration: none;
  box-shadow: none;
  transform: none !important;
  transition: background-color 0.18s, color 0.18s;
}
.tabs .tab:hover,
.tabs .tab:focus,
.tabs .tab.router-link-active,
.tabs .tab.router-link-exact-active {
  background: #e91e63;
  color: #fff;
  box-shadow: none;
  transform: none !important;
}
.collect-soft-form {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 32px;
}
.soft-form-row {
  display: flex;
  flex-direction: column;
}
.collect-soft-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.collect-soft-radios {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.soft-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 1.08rem;
  color: #444;
  cursor: pointer;
  position: relative;
  user-select: none;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 10px;
  background: transparent;
  box-shadow: none;
  transform: none;
  transition: background-color 0.18s;
}
.soft-radio.checked,
.soft-radio:hover {
  background: #fce4ec;
  box-shadow: none;
  transform: none;
}
.soft-radio input[type="radio"] {
  display: none;
}
.soft-radio-custom {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #e91e63;
  background: #fff;
  box-shadow: none;
  position: relative;
  transition: border 0.18s, box-shadow 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.soft-radio.checked .soft-radio-custom::after {
  content: "";
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e91e63;
  box-shadow: none;
  margin: auto;
}
@keyframes radio-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  80% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
.soft-form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
  position: relative;
}
.soft-form-group label {
  font-size: 1.08rem;
  color: #444;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.soft-form-group input,
.soft-form-group select,
.soft-form-group textarea {
  background: #f8f9fc;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1.08rem;
  color: #222;
  padding: 14px 16px;
  outline: none;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) inset;
  transition: box-shadow 0.22s, background-color 0.22s, border-color 0.22s;
}
.soft-form-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 44px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px 16px;
  cursor: pointer;
}
.soft-form-group select::-ms-expand {
  display: none;
}
.soft-form-group input:focus,
.soft-form-group select:focus,
.soft-form-group textarea:focus {
  background: #fff;
  border: 1.5px solid #e91e63;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) inset,
    0 0 0 3px rgba(233, 30, 99, 0.12);
}
.soft-form-group textarea {
  min-height: 48px;
  resize: vertical;
}
.collect-soft-balance {
  margin: 10px 0 18px 0;
  text-align: right;
  color: #888;
  font-size: 1.02rem;
}
.soft-btn {
  width: 100%;
  background: #e91e63;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  font-size: 1.13rem;
  font-weight: 700;
  margin-top: 18px;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.18);
  cursor: pointer;
  transition: background 0.22s, box-shadow 0.22s, transform 0.22s;
  animation: button-fadein 0.7s 0.2s both;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.soft-btn:active {
  background: #cf1658;
}
.soft-btn:hover:not(:disabled) {
  background: #cf1658;
  box-shadow: 0 6px 24px rgba(233, 30, 99, 0.22);
  transform: translateY(-2px);
}
.soft-alert {
  color: #e53935;
  background: rgba(255, 0, 0, 0.07);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 10px 0 0 0;
  font-size: 1.04rem;
  animation: shake 0.4s;
}
@keyframes shake {
  10%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  80% {
    transform: translateX(4px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-8px);
  }
  40%,
  60% {
    transform: translateX(8px);
  }
}
.soft-success {
  color: #43a047;
  background: rgba(67, 160, 71, 0.08);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 10px 0 0 0;
  font-size: 1.04rem;
  animation: pulse 0.6s;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
@keyframes button-fadein {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.collect-transfer-form {
  width: 100%;
}
.collect-transfer-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.collect-transfer-avatar {
  height: 84px;
  width: 84px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.12);
}
.collect-transfer-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e91e63;
  margin: 0;
}
.collect-transfer-pass {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.collect-transfer-pass input {
  flex: 1;
  min-width: 0;
}
.collect-transfer-pass i {
  color: #888;
  cursor: pointer;
}
.collect-transfer-summary {
  margin: 4px 0 8px;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}
.collect-transfer-actions {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
}
.collect-transfer-cancel {
  color: #e53935;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
}
.collect-transfer-confirm .soft-form-group {
  width: 100%;
}
@media (max-width: 900px) {
  .tabs {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 0 0 14px;
    padding: 0;
  }
  .tabs .tab,
  .tabs .tab:hover,
  .tabs .tab.router-link-active,
  .tabs .tab.router-link-exact-active {
    width: 100%;
    margin: 0;
    height: 44px;
    min-height: 44px;
    padding: 0 16px;
    font-size: 0.95rem;
    border-radius: 14px;
    transform: none !important;
    box-shadow: none;
  }
  .collect-soft-bg {
    min-height: auto;
    padding: 8px 0 28px;
  }
  .collect-soft-section {
    animation: none;
    padding: 16px 14px 24px;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  }
  .collect-soft-form {
    flex-direction: column;
    gap: 0;
  }
  .collect-soft-col {
    width: 100%;
  }
  .collect-soft-radios {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }
  .soft-radio {
    width: 100%;
    min-height: 44px;
    height: 44px;
    padding: 0 12px;
    font-size: 0.95rem;
    margin: 0;
  }
  .soft-form-row {
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
  }
  .soft-form-row .soft-form-group {
    flex: 1;
    min-width: 0;
  }
  .soft-form-group {
    margin-bottom: 12px;
  }
  .soft-form-group label {
    font-size: 0.92rem;
    margin-bottom: 6px;
  }
  .soft-form-group input,
  .soft-form-group select,
  .soft-form-group textarea {
    padding: 11px 14px;
    font-size: 1rem;
    border-radius: 12px;
  }
  .soft-form-group select {
    padding-right: 40px;
    background-position: right 14px center;
    background-size: 14px 14px;
  }
  .collect-soft-balance {
    margin: 4px 0 12px;
    text-align: left;
    font-size: 0.92rem;
  }
  .soft-btn {
    margin-top: 8px;
    padding: 13px 0;
    font-size: 1.05rem;
    transform: none;
  }
  .soft-btn:hover:not(:disabled) {
    transform: none;
  }
}
</style>
