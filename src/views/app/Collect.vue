<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <h4 class="tabs">
      <router-link class="tab" to="/collect"> Nuevo Retiro </router-link>
      &nbsp;&nbsp;
      <router-link class="tab" to="/collects">
        Historial de Retiros
      </router-link>
    </h4>
    <div class="collect-soft-bg">
      <section class="collect-soft-section">
        <form v-if="!loading" class="collect-soft-form" @submit.prevent="POST">
          <div class="collect-soft-col">
            <div class="collect-soft-radios">
              <label :class="['soft-radio', { checked: !cash }]">
                <input type="radio" :value="false" v-model="cash" />
                <span class="soft-radio-custom"></span>
                <span>Retirar en efectivo</span>
              </label>
              <label :class="['soft-radio', { checked: cash }]">
                <input type="radio" :value="true" v-model="cash" />
                <span class="soft-radio-custom"></span>
                <span>Retirar en cuenta bancaria</span>
              </label>
              <router-link to="/transfer">
                <label class="soft-radio">
                  <input type="radio" disabled />
                  <span class="soft-radio-custom"></span>
                  <span>Transferir saldo</span>
                </label>
              </router-link>
            </div>
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
            <div v-if="cash">
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
          </div>
          <div class="collect-soft-col">
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
              <small>Total disponible: S/. {{ balance }}</small>
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
          </div>
        </form>
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
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
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
    console.log({ data });

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
    this.balance = data.balance.toFixed(2);
    // this.amount  = data.balance
  },
  methods: {
    async POST() {
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

      // validate amount
      if (amount > balance) {
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
      console.log({ data });

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
.collect-soft-form {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 32px;
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
  font-size: 1.08rem;
  color: #444;
  cursor: pointer;
  position: relative;
  user-select: none;
  padding: 6px 12px;
  border-radius: 10px;
  transition: background 0.18s, box-shadow 0.18s;
}
.soft-radio.checked,
.soft-radio:hover {
  background: #f8f9fc;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.07);
}
.soft-radio input[type="radio"] {
  display: none;
}
.soft-radio-custom {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d209b6;
  background: #fff;
  box-shadow: 0 1px 4px rgba(255, 152, 0, 0.08);
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
  background: #9F00AD;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.13);
  margin: auto;
  animation: radio-pop 0.25s;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) inset;
  transition: box-shadow 0.22s, background 0.22s, border 0.22s;
}
.soft-form-group input:focus,
.soft-form-group select:focus,
.soft-form-group textarea:focus {
  background: #fff;
  border: 2px solid #ff9800;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.1),
    0 4px 16px rgba(255, 152, 0, 0.13) inset;
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
  background: #d209b6;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  font-size: 1.13rem;
  font-weight: 700;
  margin-top: 18px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
  cursor: pointer;
  transition: background 0.22s, box-shadow 0.22s, transform 0.22s;
  animation: button-fadein 0.7s 0.2s both;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.soft-btn:active {
  background: #9F00AD;
}
.soft-btn:hover:not(:disabled) {
  background: #9F00AD;
  box-shadow: 0 6px 24px rgba(255, 152, 0, 0.18);
  transform: translateY(-2px) scale(1.03);
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
@media (max-width: 900px) {
  .collect-soft-form {
    flex-direction: column;
    gap: 0;
  }
  .collect-soft-col {
    width: 100%;
  }
}
</style>
