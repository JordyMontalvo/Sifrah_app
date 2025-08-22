<template>
  <Auth>
    <section>
      <div style="display: flex; justify-content: center">
        <router-link
          to="/login"
          class="tab-login"
          :class="{ active: $route.path === '/login' }"
        >
          INICIO
        </router-link>
        <router-link
          to="/register"
          class="tab-login"
          :class="{ active: $route.path === '/register' }"
        >
          REGISTRO
        </router-link>
      </div>
      <div class="logos">
        <img
          src="@/assets/img/logo/logo 2 sifrah NARANJA LOGIN.svg"
          style="
            width: 340px;
            height: auto;
            margin-top: -45px;
            margin-bottom: -60px;
          "
        />
        <h2
          style="
            font-size: 16px;
            font-style: roboto;
            color: rgba(137, 136, 141, 1);
            margin-bottom: -35px;
          "
        >
          ¿No tienes cuenta?
        </h2>
        <h1
          style="
            font-size: 35px;
            font-style: roboto;
            color: rgba(40, 167, 69, 1);
            text-decoration: underline;
            margin-bottom: 0px;
          "
        >
          ¡REGÍSTRATE AQUÍ!
        </h1>
      </div>
      <br />

      <!-- <i class="icon fa fa-flag"></i>
      <select class="input" v-model="country"
        :class="{'error': error.country}"
        @change="reset('country')">
        <option value="null" disabled>País</option>
        <option value="Perú"      >🇵🇪 Perú</option>
         <option value="Ecuador"   >🇪🇨 Ecuador</option>
        <option value="Argentina" >🇦🇷 Argentina</option>
        <option value="Bolivia"   >🇧🇴 Bolivia</option>
        <option value="Colombia"  >🇨🇴 Colombia</option>
        <option value="Costa Rica">🇨🇷 Costa Rica</option>
        <option value="Chile"     >🇨🇱 Chile</option> 
      </select> <br> -->

      <input
        class="input-register"
        style="margin-bottom: 12px"
        placeholder="Documento de identidad"
        oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
        v-model="dni"
        :class="{ error: error.dni }"
        @keydown="reset('dni')"
      />
      <i class="icon-register fa fa-id-card"></i>
      <br />
      <div style="margin-right: 140px">
        <label class="label-register" style="margin-top: 5px">
          <small style="color: rgba(102, 108, 104, 1)">
            <input type="checkbox" v-model="younger" />menor de edad /
            extranjero
          </small>
        </label>
      </div>

      <!-- <input class="input" placeholder="Nombre"
      v-model="name"
      :class="{'error': error.name}"
      @keydown="reset('name')"
      :disabled="country == 'Perú' && !younger"> <br> -->

      <input
        class="input-register"
        placeholder="Nombre"
        v-model="name"
        :class="{ error: error.name }"
        @keydown="reset('name')"
      />
      <i class="icon-register fa-solid fa-user-tie"></i>
      <br />
      <input
        class="input-register"
        placeholder="Apellidos"
        v-model="lastName"
        :class="{ error: error.lastName }"
        @keydown="reset('lastName')"
      />
      <i class="icon-register fa-solid fa-user-tie"></i>
      <br />

      <!-- <i class="icon fa-solid fa-user-tie"></i>
      <input class="input" placeholder="Apellidos"
      v-model="lastName"
      :class="{'error': error.lastName}"
      @keydown="reset('lastName')"
      :disabled="country == 'Perú' && !younger"> <br> -->

      <!--<i class="icon fa fa-calendar"></i>
      <input type="date" class="input" placeholder="Fecha de Nacimiento"
      v-model="date"> <br>-->

      <small
        v-if="country"
        style="min-width: 25px; margin-right: 8px; display: inline-block"
        >{{ prefix }}</small
      >
      <div>
        <input
          class="input-register"
          placeholder="Celular"
          maxlength="12"
          v-model="phone"
        />
        <i class="icon-register fa-solid fa-mobile-retro" v-if="!country"></i>
        <br />
      </div>

      <!--<i class="icon fa-solid fa-envelope-open"></i>
      <input class="input" placeholder="Correo"
      v-model.trim="email"> <br>-->

      <!-- <i class="icon-register fa-solid fa-key"></i>-->
      <div>
        <input
          :type="show ? 'text' : 'password'"
          class="input-register"
          style="margin-left: 8px"
          placeholder="Contraseña"
          v-model="password"
          :class="{ error: error.password }"
          @keydown="reset('password')"
        />
        <i class="icon-register show far fa-eye" @click="show = !show"></i>
        <br />
      </div>
      <div>
        <input
          class="input-register"
          placeholder="Código de patrocinador"
          style="margin-left: 8px"
          :disabled="disabled"
          v-model="code"
          :class="{ error: error.code }"
          @keydown="reset('code')"
        />
        <i class="icon-register fa-solid fa-paper-plane"></i>
      </div>
      <br />

      <p class="alert">{{ alert | alert }}</p>

      <small style="color: rgba(255, 107, 0, 1)"
        ><input type="checkbox" v-model="check" style="color: green" />Acepto
        los
        <a
          href=""
          target="_blank"
          style="color: rgba(137, 136, 141, 1); font-weight: 600"
          >términos de uso</a
        ></small
      >
      <br />

      <button class="register-button" v-show="!sending" @click="submit">
        Registrarme
      </button>
      <button class="button" v-show="sending" disabled>
        Creando cuenta ...</button
      ><br />
      <small style="color: rgba(137, 136, 141, 1)"
        >¿Ya tienes una cuenta?
        <router-link to="/login" style="color: rgba(255, 107, 0, 1)"
          >Haz click aquí</router-link
        ></small
      >
      <br />
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
            style="padding: 5px"
            class="fab fa-facebook-square social-icon-register facebook"
            :href="fb"
            target="_blank"
          ></a>
          <a
            style="padding: 5px"
            class="fab fa-tiktok social-icon-register tiktok"
            :href="tk"
            target="_blank"
          ></a>
          <!-- <a class="fab fa-tiktok"          target="_blank"></a> -->
          <a
            style="padding: 5px"
            class="fab fa-youtube social-icon-register youtube"
            :href="yt"
            target="_blank"
          ></a>
          <a
            style="padding: 5px"
            class="fab fa-whatsapp social-icon-register whatsapp"
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
      date: null,
      email: null,
      phone: null,
      password: "123456",
      code: null,
      check: false,
      error: {
        country: false,
        dni: false,
        name: false,
        lastName: false,
        // username: false,
        email: false,
        phone: false,
        password: false,
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
        // Verificar si el usuario está afiliado
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
  accent-color: green; /* Cambia el color del checkbox a verde en navegadores compatibles */
}

.register-button {
  /* Color de fondo normal */
  background: rgba(178, 108, 46, 1);
  width: 280px; /* Ancho del botón */
  height: 35px; /* Altura del botón */
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background 0.3s ease;
  border-radius: 18px;
  margin: 8px 0;
  transition: all 0.3s ease; /* Transición suave para el hover */
}

.register-button:hover {
  background: rgb(255, 111, 0); /* Color de fondo al hacer hover */
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
  border-bottom: solid 2px #ffb57a; /* naranja claro */
  font-weight: bold;
  transition: all 0.1s ease;
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
