<template>
  <App :session="session" :title="title">
    <div v-cloak>
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando perfil...</p>
      </div>
      
      <div v-else class="profile-glass-bg">
        <div class="profile-glass-card">
          <div class="profile-glass-header">
            <div class="profile-glass-title">
              <i class="fas fa-user-circle profile-glass-icon"></i>
              <span>Perfil</span>
            </div>
            <button
              class="profile-glass-save"
              :disabled="sending"
              @click="UPDATE"
            >
              <span v-if="!sending"><i class="fas fa-save"></i> Guardar</span>
              <span v-else
                ><i class="fas fa-spinner fa-spin"></i> Guardando...</span
              >
            </button>
          </div>
          <main class="profile-glass-main profile-glass-columns">
            <div class="profile-glass-col">
              <section class="profile-glass-section">
                <h3>Datos personales</h3>
                <div class="glass-form-group">
                  <label>Nombre</label>
                  <input v-model="name" type="text" readonly/>
                </div>
                <div class="glass-form-group">
                  <label>Apellido</label>
                  <input v-model="lastName" type="text" readonly />
                </div>
                <div class="glass-form-group">
                  <label>DNI</label>
                  <input v-model="dni" type="text" readonly />
                </div>
                <div class="glass-form-group">
                  <label>Fecha de nacimiento</label>
                  <input v-model="birthdate" type="date" />
                </div>
              </section>
              <hr class="glass-separator" />
              <section class="profile-glass-section">
                <h3>Contacto</h3>
                <div class="glass-form-group">
                  <label>Email</label>
                  <input v-model="email" type="email" />
                </div>
                <div class="glass-form-group">
                  <label>Teléfono</label>
                  <input v-model="phone" type="text" />
                </div>
                <div class="glass-form-group">
                  <label>País</label>
                  <select v-model="country" @change="updateCities">
                    <option value="null" disabled>Selecciona un país</option>
                    <option value="Perú">Perú</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brazil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="United States">Estados Unidos</option>
                  </select>
                </div>
                <div class="glass-form-group">
                  <label>Ciudad</label>
                  <select v-model="city">
                    <option value="null" disabled>Ciudad</option>
                    <option v-for="city in cities" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
                <div class="glass-form-group">
                  <label>Dirección</label>
                  <input v-model="address" type="text" />
                </div>
              </section>
            </div>
            <div class="profile-glass-col">
              <section class="profile-glass-section">
                <h3>Seguridad</h3>
                <div class="profile-glass-links">
                  <router-link to="/password" class="profile-glass-link">
                    <i class="fas fa-key"></i> Cambiar contraseña
                  </router-link>
                  <router-link to="/security" class="profile-glass-link">
                    <i class="fas fa-user-shield"></i> Persona de confianza
                  </router-link>
                </div>
                <div v-if="token" class="profile-glass-invite">
                  <div class="glass-form-group">
                    <label>Código de invitación</label>
                    <input
                      readonly
                      @click="copy_token"
                      id="token"
                      v-model="token"
                    />
                    <span class="glass-copy" v-if="c_token"
                      >copiado <i class="fas fa-check"></i
                    ></span>
                  </div>
                  <div class="glass-form-group">
                    <label>Link de registro</label>
                    <input readonly @click="copy_link" id="link" v-model="link" />
                    <span class="glass-copy" v-if="c_link"
                      >copiado <i class="fas fa-check"></i
                    ></span>
                    <a v-bind:href="link" class="profile-glass-link">Registrar</a>
                  </div>
                </div>
              </section>
              <hr class="glass-separator" />
              <section class="profile-glass-section">
                <h3>Datos bancarios</h3>
                <div class="glass-form-group">
                  <label>Banco</label>
                  <select v-model="bank">
                    <option value="null" disabled>Banco</option>
                    <option value="BCP">BCP</option>
                    <option value="INTERBANK">INTERBANK</option>
                    <option value="BBVA">BBVA</option>
                  </select>
                </div>
                <div class="glass-form-group">
                  <label>Tipo de cuenta</label>
                  <select v-model="account_type">
                    <option value="null" disabled>Tipo de cuenta</option>
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
                <div class="glass-form-group">
                  <label>Número de cuenta</label>
                  <input v-model="account" type="text" />
                </div>
              </section>
            </div>
          </main>
          <transition name="fade">
            <div v-if="showToast" class="glass-toast">
              ¡Datos guardados correctamente!
            </div>
          </transition>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";
import Spinner from "@/components/Spinner.vue";

const ROOT = process.env.VUE_APP_ROOT;

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      country: null,
      name: null,
      lastName: null,
      email: null,
      phone: null,
      birthdate: null,
      address: null,
      token: null,
      city: null,
      city_disabled: false,
      bank: null,
      account_type: null,
      account: null,
      ibk: null,
      bank_disabled: false,
      account_type_disabled: false,
      account_disabled: false,
      ibk_disabled: false,
      loading: true,
      sending: false,
      c_token: false,
      c_link: false,
      showToast: false,
      cities: [],
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    link() {
      return `${ROOT}/register/${this.token}`;
    },
  },
  async created() {
    const { data } = await api.Profile.GET(this.session);
    this.loading = false;
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");
    if (data.error && data.msg == "unverified user")
      this.$router.push("/verify");
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.$store.commit("SET_CITY", data.city);
    this.$store.commit("SET_EMAIL", data.email);
    this.$store.commit("SET_BIRTHDATE", data.birthdate);
    this.$store.commit("SET_DNI", data.dni);
    this.$store.commit("SET_TOKEN", data.token);
    this.country = data.country;
    this.dni = data.dni;
    this.name = data.name;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.birthdate = data.birthdate;
    this.address = data.address;
    this.token = data.token;
    this.bank = data.bank;
    this.account_type = data.account_type;
    this.account = data.account;
    this.ibk = data.ibk;
    this.city = data.city;
    this.updateCities();
    if (this.bank) this.bank_disabled = true;
    if (this.account_type) this.account_type_disabled = true;
    if (this.account) this.account_disabled = true;
    if (this.ibk) this.ibk_disabled = true;
  },
  methods: {
    updateCities() {
      const countryCities = {
        Argentina: ["Buenos Aires", "Córdoba", "Rosario"],
        Bolivia: ["La Paz", "Santa Cruz", "Cochabamba"],
        Brazil: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
        Chile: ["Santiago", "Valparaíso", "Concepción"],
        Colombia: ["Bogotá", "Medellín", "Cali"],
        Ecuador: ["Quito", "Guayaquil", "Cuenca"],
        Paraguay: ["Asunción", "Ciudad del Este", "Encarnación"],
        Perú: [
          "Lima",
          "Arequipa",
          "Trujillo",
          "Cusco",
          "Piura",
          "Chiclayo",
          "Iquitos",
          "Huancayo",
          "Puno",
          "Tacna",
          "Juliaca",
          "Chimbote",
          "Callao",
          "Ayacucho",
          "Huánuco",
          "Cajamarca",
          "Tumbes",
          "Loreto",
          "Moquegua",
          "Pasco",
          "San Martín",
          "Apurímac",
          "Amazonas",
          "Ancash",
          "Junín",
          "Lambayeque",
          "La Libertad",
          "Ucayali",
          "Madre de Dios",
        ],
        Uruguay: ["Montevideo", "Salto", "Paysandú"],
        Venezuela: ["Caracas", "Maracaibo", "Valencia"],
        "United States": ["New York", "Los Angeles", "Chicago"],
      };
      this.cities = countryCities[this.country] || [];
    },
    async UPDATE() {
      const {
        email,
        phone,
        birthdate,
        address,
        bank,
        account_type,
        account,
        ibk,
        city,
        country,
      } = this;
      this.sending = true;
      const { data } = await api.Profile.UPDATE(this.session, {
        email,
        phone,
        birthdate,
        address,
        bank,
        account_type,
        account,
        ibk,
        city,
        country,
      });
      this.sending = false;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 3000);
    },
    copy_token() {
      lib.copy("token");
      this.c_token = true;
      setTimeout(() => (this.c_token = false), 4000);
    },
    copy_link() {
      lib.copy("link");
      this.c_link = true;
      setTimeout(() => (this.c_link = false), 4000);
    },
  },
};
</script>

<style scoped src="../../assets/style/views/app/Profile.css"></style>
