<template>
  <App :session="session" :office_id="office_id" :title="title">
    <h4 class="tabs">
      <router-link class="tab" to="/transfer"> Monedero </router-link>
      &nbsp;&nbsp;
      <router-link class="tab" to="/transfers" v-if="!office_id">
        Transferencias
      </router-link>
    </h4>
    <div class="transfer-soft-bg">
      <section class="transfer-soft-section">
        <h4 class="transfer-title">MONEDERO SIFRAH</h4>
        <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
        <div v-if="!loading">
          <form
            v-if="!confirmation"
            class="transfer-soft-form"
            @submit.prevent="validate"
          >
            <div class="transfer-soft-balance">
              <small>Total disponible: S/. {{ balance }}</small>
            </div>
            <div class="soft-form-group">
              <label>Usuario receptor (DNI)</label>
              <input
                v-model="dni"
                placeholder="Usuario receptor"
                oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
                @keydown="error = null"
              />
            </div>
            <div class="soft-form-group">
              <label>Monto a enviar</label>
              <input
                v-model.number="amount"
                placeholder="Monto a enviar"
                oninput="this.value=this.value.replace(/(?![0-9, '.'])./gmi,'')"
                @keydown="error = null"
              />
            </div>
            <transition name="fade">
              <span v-if="error" class="soft-alert">{{ error }}</span>
            </transition>
            <div class="soft-form-group">
              <label>Motivo de transferencia</label>
              <textarea
                v-model="desc"
                placeholder="Motivo de transferencia"
                maxlength="30"
              ></textarea>
            </div>
            <button class="soft-btn" :disabled="validating">
              <span v-if="!validating">Transferir</span>
              <span v-else
                ><i class="fas fa-spinner fa-spin"></i> Validando...</span
              >
            </button>
          </form>
          <form
            v-if="confirmation"
            class="transfer-soft-form"
            @submit.prevent="send"
          >
            <div class="transfer-soft-confirm">
              <img :src="_photo" class="transfer-soft-avatar" v-if="_photo" />
              <p class="transfer-soft-name">{{ _name }}</p>
              <div class="soft-form-group">
                <label>Confirmar Password</label>
                <div class="transfer-soft-pass-group">
                  <input
                    :type="show ? 'text' : 'password'"
                    class="pass"
                    placeholder="Confirmar Password"
                    v-model="password"
                    @keydown="error2 = null"
                  />
                  <i class="show far fa-eye" @click="show = !show"></i>
                </div>
              </div>
              <transition name="fade">
                <span v-if="error2" class="soft-alert">{{ error2 }}</span>
              </transition>
              <div class="transfer-soft-summary">
                <small>Monto a enviar: S/. {{ amount }}</small
                ><br />
                <span
                  ><i>{{ desc }}</i></span
                >
              </div>
              <div v-show="!end" class="transfer-soft-actions">
                <small
                  @click="confirmation = false"
                  class="transfer-soft-cancel"
                  ><i class="fa fa-arrow-left"></i> Cancelar</small
                >
                <button class="soft-btn" :disabled="sending">
                  <span v-if="!sending">Confirmar</span>
                  <span v-else
                    ><i class="fas fa-spinner fa-spin"></i> Confirmando...</span
                  >
                </button>
              </div>
              <small class="soft-success" v-show="end"
                >Transferencia exitosa</small
              >
            </div>
          </form>
        </div>
      </section>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
      confirmation: false,
      validating: false,
      sending: false,

      dni: null,
      amount: null,
      desc: null,

      _name: null,
      _photo: null,
      password: null,

      error: null,
      error2: null,

      show: false,

      end: false,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
  },
  async created() {
    // GET data
    const { data } = await api.Transfer.GET(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");

    // success
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);

    this.balance = data.balance;
  },
  methods: {
    async validate() {
      let { dni, amount, desc } = this;
      console.log({ dni, amount, desc });

      if (!dni) return (this.error = "ingresar dni");
      if (!amount) return (this.error = "ingresar monto");

      if (amount > this.balance) return (this.error = "monto inválido");

      this.validating = true;

      const { data } = await api.Transfer.POST(this.session, {
        dni,
        amount,
        desc,
        type: "validate",
      });
      console.log({ data });

      this.validating = false;

      if (data.error) return (this.error = "usuario inválido");

      this.confirmation = true;

      this._name = data._name;
      this._photo = data._photo;
    },

    async send() {
      let { dni, amount, desc, password } = this;
      console.log({ password });

      if (!password) return (this.error2 = "ingresar password");

      this.sending = true;

      const { data } = await api.Transfer.POST(this.session, {
        dni,
        amount,
        desc,
        password,
        type: "send",
      });
      console.log({ data });

      this.sending = false;

      if (data.error) return (this.error2 = "password inválido");

      this.end = true;
    },
  },
};
</script>

<style scoped>
.transfer-soft-bg {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 0;
}
.transfer-soft-section {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  max-width: 420px;
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
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}
.tab {
  display: flex;
  align-items: center;
  font-size: 1.18rem;
  font-weight: 600;
  color: #fff;
  background: #9F00AD;
  border-radius: 18px;
  padding: 10px 28px;
  margin: 0 6px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.07);
  transition: all 0.18s;
  text-decoration: none;
  position: relative;
}
.tab:hover,
.tab.router-link-exact-active {
  background: #d209b6;
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 0, 221, 0.13);
  transform: translateY(-2px) scale(1.04);
}
.transfer-title {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: #9F00AD;
  margin-bottom: 18px;
  letter-spacing: 1px;
}
.transfer-soft-balance {
  margin-bottom: 18px;
  text-align: right;
  color: #888;
  font-size: 1.02rem;
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
  background: #fb8c00;
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
.transfer-soft-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.transfer-soft-avatar {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}
.transfer-soft-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 8px;
}
.transfer-soft-pass-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.transfer-soft-summary {
  margin: 10px 0 18px 0;
  text-align: center;
  color: #888;
  font-size: 1.02rem;
}
.transfer-soft-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;
}
.transfer-soft-cancel {
  color: #e53935;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.01rem;
  transition: color 0.18s;
}
.transfer-soft-cancel:hover {
  color: #b71c1c;
}
@media (max-width: 600px) {
  .transfer-soft-section {
    max-width: 98vw;
    margin: 16px 0;
  }
}
</style>
