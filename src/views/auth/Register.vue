<template>
  <Auth>
    <section>
      <div class="register-title-form">
        <h1>REGÍSTRATE</h1>
      </div>
      
      <!-- Documento de Identidad -->
      <div class="form-field">
        <input
          class="input-register-new"
          placeholder="Documento de identidad"
          oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
          v-model="dni"
          :class="{ error: error.dni }"
          @keydown="reset('dni')"
        />
      </div>

      <!-- Checkbox menor de edad -->
      <div class="checkbox-field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="younger" class="checkbox-input" />
          <span class="checkbox-text">Menor de edad / extranjero</span>
        </label>
      </div>

      <!-- Nombre y Apellido en fila -->
      <div class="form-row">
        <div class="form-field">
          <input
            class="input-register-new"
            placeholder="Nombre"
            v-model="name"
            :class="{ error: error.name }"
            @keydown="reset('name')"
          />
        </div>
        <div class="form-field">
          <input
            class="input-register-new"
            placeholder="Apellido"
            v-model="lastName"
            :class="{ error: error.lastName }"
            @keydown="reset('lastName')"
          />
        </div>
      </div>

      <!-- Celular -->
      <div class="form-field">
        <input
          class="input-register-new"
          placeholder="Celular"
          oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
          v-model="phone"
          :class="{ error: error.phone }"
          @keydown="reset('phone')"
        />
      </div>

      <!-- Correo -->
      <div class="form-field">
        <input
          class="input-register-new"
          type="email"
          placeholder="Correo"
          v-model="email"
          :class="{ error: error.email }"
          @keydown="reset('email')"
        />
      </div>

      <!-- Fecha de Nacimiento -->
      <div class="form-field">
        <input
          class="input-register-new"
          type="date"
          placeholder="dd/mm/aaaa"
          v-model="birthDate"
          :class="{ error: error.birthDate }"
          @keydown="reset('birthDate')"
        />
      </div>

      <!-- Depto, Provincia, Distrito en fila -->
      <div class="form-row">
        <div class="form-field">
          <select
            class="input-register-new select-field"
            v-model="department"
            :class="{ error: error.department }"
            @change="reset('department')"
          >
            <option value="" disabled>Depto.</option>
            <option value="Lima">Lima</option>
            <option value="Arequipa">Arequipa</option>
            <option value="Cusco">Cusco</option>
            <!-- Agregar más departamentos según necesidad -->
          </select>
        </div>
        <div class="form-field">
          <select
            class="input-register-new select-field"
            v-model="province"
            :class="{ error: error.province }"
            @change="reset('province')"
          >
            <option value="" disabled>Provincia</option>
            <!-- Opciones dinámicas según departamento -->
          </select>
        </div>
        <div class="form-field">
          <select
            class="input-register-new select-field"
            v-model="district"
            :class="{ error: error.district }"
            @change="reset('district')"
          >
            <option value="" disabled>Distrito</option>
            <!-- Opciones dinámicas según provincia -->
          </select>
        </div>
      </div>

      <!-- Contraseña -->
      <div class="form-field">
        <input
          class="input-register-new"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Contraseña"
          v-model="password"
          :class="{ error: error.password }"
          @keydown="reset('password')"
        />
      </div>

      <!-- Código de patrocinador -->
      <div class="form-field">
        <input
          class="input-register-new"
          placeholder="Código de patrocinador"
          v-model="sponsorCode"
          :class="{ error: error.sponsorCode }"
          @keydown="reset('sponsorCode')"
        />
      </div>

      <!-- Términos y condiciones -->
      <div class="terms-field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="acceptTerms" class="checkbox-input" />
          <span class="checkbox-text">Acepto los términos de uso</span>
        </label>
      </div>

      <!-- Botón de registro -->
      <button class="register-button" @click="submit" :disabled="sending">
        {{ sending ? 'Registrando...' : 'Registrarme' }}
      </button>

      <!-- Enlace de login -->
      <div class="login-link">
        <small>¿Ya tienes una cuenta? <router-link to="/login">Haz click aquí</router-link></small>
      </div>

    </section>
    <footer>
      <br />
      <header>
        <div class="social">
          <!-- <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank"></a>
          <a class="fab fa-tiktok"          :href="tk" target="_blank"></a>
          <a class="fab fa-youtube"         :href="yt" target="_blank"></a> -->
          <a
            class="fab fa-facebook-square social-icon facebook"
            :href="fb"
            target="_blank"
          ></a>
          <a
            class="fab fa-youtube social-icon youtube"
            :href="yt"
            target="_blank"
          ></a>
          <a
            class="fab fa-tiktok social-icon tiktok"
            :href="tk"
            target="_blank"
          ></a>
          <a
            class="fab fa-whatsapp social-icon whatsapp"
            :href="wsp_pe"
            target="_blank"
          ></a>
        </div>
      </header>
    </footer>
  </Auth>
</template>

<script>
import Auth from "@/views/layouts/Auth";
import api from "@/api";

export default {
  components: { Auth },
  data() {
    return {
      // country: 'Perú',
      // country: 'Bolivia',
      // country: 'Ecuador',
      country: null,

      younger: false,
      dni: null,
      name: null,
      lastName: null,
      // username: null,
      birthDate: null,
      email: null,
      phone: null,
      password: "",
      sponsorCode: null,
      acceptTerms: false,
      showPassword: false,
      department: "",
      province: "",
      district: "",
      code: null,
      check: false,
      error: {
        country: false,
        dni: false,
        name: false,
        lastName: false,
        birthDate: false,
        email: false,
        phone: false,
        department: false,
        province: false,
        district: false,
        password: false,
        sponsorCode: false,
        code: false,
      },
      sending: false,
      alert: null,
      disabled: false,
      show: false,
    };
  },
  filters: {
      alert(msg) {
        if (msg === "dni already use") return "El documento ya existe";
        if (msg === "code not found") return "El código de invitación no existe";
        return msg;
      },
    },
  computed: {
    // social
    fb() {
      return this.$store.state.fb;
    },
    is() {
      return this.$store.state.is;
    },
    tk() {
      return this.$store.state.tk;
    },
    yt() {
      return this.$store.state.yt;
    },
    wsp_pe() {
      return this.$store.state.wsp_pe;
    },

    prefix() {
      if (this.country == "Ecuador") return "+593";
      if (this.country == "Perú") return "+51";
      if (this.country == "Argentina") return "+54";
      if (this.country == "Bolivia") return "+591";
      if (this.country == "Colombia") return "+57";
      if (this.country == "Costa Rica") return "+506";
      if (this.country == "Chile") return "+56";
    },
  },
  created() {
    console.log("Register");

    this.code = this.$route.params.code;

    if (this.code) this.disabled = true;

    setTimeout(() => {
      const logoAuth = document.getElementById("logo-auth");
      console.log(logoAuth);
      logoAuth.style.order = 1;
      logoAuth.style.transition = "all 0.80s ease";

      const contentAuth = document.getElementById("content-auth");
      console.log(contentAuth);
      contentAuth.style.order = 0;
      contentAuth.style.transition = "all 0.80s ease";
    }, 100);

    setTimeout(() => {
      const tabs = document.getElementById("tabs");
      console.log(tabs);
      tabs.style.transform = "translateX(170%)";
      tabs.style.right = "25%";
      tabs.style.transition = "all 0.80s ease";
    }, 100);

    // const logoAuth = document.getElementById("logo-auth");
    // console.log(logoAuth);
    // logoAuth.style.order = 1;

    // const contentAuth = document.getElementById("content-auth");
    // console.log(contentAuth);
    // contentAuth.style.order = 0;
  },
  watch: {
    /* async dni(dni) {
      if(this.country != 'Perú' || this.younger) return

      if(dni.length < 8) return

      const response = await fetch(`https://dniruc.apisperu.com/api/v1/dni/${dni}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImhhbnNldmFuZ2VsaXN0YUBnbWFpbC5jb20ifQ.Fa2w9sYLXtcgMbtM58YRiwYvomChYwwMAoIDmYmo1H8`)

      var data = await response.json()
      console.log(data)

      if(data.success == false) {
        console.log('person not found ...')
        this.error.name = true
        return
      }

      this.error.name = false

      this.name     = data.nombres
      this.lastName = data.apellidoPaterno + ' ' + data.apellidoMaterno
    } */
  },
  methods: {
    async submit() {
      const { dni, name, lastName, password, phone, code, check } = this;

      if (!dni) {
        this.error.dni = true;
        this.alert = "El documento se requiere";
        return;
      }
      if (!name) {
        this.error.name = true;
        this.alert = "El nombre se requiere";
        return;
      }
      if (!lastName) {
        this.error.lastName = true;
        this.alert = "El apellido se requiere";
        return;
      }
      if (!password) {
        this.error.password = true;
        this.alert = "password required";
        return;
      }
      if (!code) {
        this.error.code = true;
        this.alert = "code required";
        return;
      }
      if(!phone) {
        this.error.phone = true;
        this.alert = "El telefono se requiere";
        return;
      }
      if (!check) {
        this.alert = "Debes aceptar los términos.";
        return;
      }

      this.sending = true;

      try {
        const { data } = await api.register({
          dni,
          name,
          lastName,
          password,
          phone,
          code,
        });

        this.sending = false;

        if (data.error) {
          this.alert = data.msg;
          return;
        }

        const session = localStorage.getItem("session");
        if (session) {
          localStorage.removeItem("session");
          api.logout(this.session);
        }

        this.$store.commit("SET_SESSION", data.session);
        
        // Redirigir según el estado de afiliación
        if (data.affiliated) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/affiliation");
        }
      } catch (err) {
        this.sending = false;
      }
    },

    reset(name) {
      this.alert = null;

      if (name == "dni") this.error.dni = false;
      if (name == "name") this.error.name = false;
      if (name == "lastName") this.error.lastName = false;
      if(name == "phone") this.error.phone = false;
      // if(name == 'username') this.error.username = false
      // if(name == 'email')    this.error.email    = false
      if (name == "password") this.error.password = false;
      if (name == "code") this.error.code = false;
    },
  },
};
</script>
<style scoped>
input[type="checkbox"]:checked {
  accent-color: #d209b6; /* Cambia el color del checkbox a verde en navegadores compatibles */
}

.register-button {
  /* Color de fondo normal */
  background: #d209b6;
  width: 280px; /* Ancho del botón */
  height: 50px; /* Altura del botón */
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background 0.3s ease;
  border-radius: 18px;
  margin: 8px 0;
  transition: all 0.3s ease; /* Transición suave para el hover */
}

.register-button:hover {
  background: #9f00ad; /* Color de fondo al hacer hover */
}
.tab-login {
  font-size: 15px;
  color: rgba(137, 136, 141, 1);
  text-decoration: none;
  padding: 10px 20px;
  border-bottom: solid 2px rgba(137, 136, 141, 1);
  transition: all 0.3s ease;
}

.tab-login.active {
  color: #4b2e12; /* marrón oscuro */
  border-bottom: solid 4px #ffb57a; /* barra amarilla más gruesa */
  font-weight: bold;
  transition: all 0.1s ease;
  position: relative;
}

.tab-login.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%; /* Barra que cubre todo el ancho de la pestaña */
  height: 4px;
  background-color: #FFD900;
  border-radius: 2px;
}
@media (min-width: 1260px) {
  .tab-login {
    display: none;
  }
}
@media (max-width: 1260px) {
  .logos {
    display: none;
  }
}
@media (max-width: 1260px) {
  .label-register {
    margin-left: 20px;
    /* margin-top: 5px; */
    white-space: nowrap;
  }
}
@media (max-width: 1024px) {
  .register-button {
    margin-left: 15px;
  }
}
</style>
