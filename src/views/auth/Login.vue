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
        <h1
          style="
            font-size: 30px;
            font-style: roboto;
            color: rgba(137, 136, 141, 1);
            margin-bottom: 0;
          "
        >
          Bienvenido
        </h1>
        <img
          src="@/assets/img/logo/logo 2 sifrah NARANJA LOGIN.svg"
          style="
            width: 369px;
            height: auto;
            margin-top: -65px;
            transition: all 0.3s ease;
          "
        />
      </div>
      <div>
        <label class="label-login-2" for="dni">DNI:</label>
        <input
          id="dni"
          class="input"
          style="border: solid 1px rgba(255, 107, 0, 1); margin-left: 5px"
          placeholder="Dni"
          oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
          v-model="dni"
          :class="{ error: error.dni }"
          @keydown="reset('dni')"
        />
        <i
          class="icon fa-solid fa-user-tie"
          style="
            margin-top: 14px;
            margin-left: -33px;
            cursor: pointer;
            padding: 4px;
            font-size: 14px;
            opacity: 0.75;
            color: #fe7f0e;
          "
        ></i>
        <br />
      </div>

      <div v-if="!office_id">
        <label class="label-login" for="password">Contraseña:</label>
        <input
          id="password"
          :type="show ? 'text' : 'password'"
          class="input pass"
          style="border: solid 1px rgba(255, 107, 0, 1)"
          placeholder="*************"
          v-model="password"
          :class="{ error: error.password }"
          @keydown="reset('password')"
        />
        <i class="show far fa-eye" @click="show = !show"></i> <br />
      </div>

      <p class="alert">{{ alert | alert }}</p>

      <button class="login-button" v-show="!sending" @click="submit">
        Iniciar sesión
      </button>
      <button class="button" v-show="sending" disabled>
        Validando datos ...
      </button>
      <br /><br />

     <!-- <button class="google-login-btn" id="g_id_signin"></button> -->
     <!-- <br /><br /> -->

      <small style="color: rgba(137, 136, 141, 1)"
        >¿Olvidaste tu contraseña?
        <router-link to="/remember" style="color: rgba(254, 127, 14, 1)"
          >Ingresa Aquí</router-link
        ></small
      >
      <br /><br />
    </section>
    <footer>
      <br />
      <header>
        <div class="social" style="margin-top: -15px">
          <a
            class="fab fa-facebook-square social-icon facebook"
            :href="fb"
            target="_blank"
          ></a>
          <!-- <a
            class="fab fa-instagram social-icon instagram"
            :href="is"
            target="_blank"
          ></a>-->
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
        <br />
        <div>
          <small style="color: rgba(137, 136, 141, 1)">
            ¿No tienes cuenta?
            <router-link
              to="/register"
              style="color: rgba(254, 127, 14, 1); text-decoration: underline"
              >Regístrate</router-link
            >
          </small>
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
      // username:    null,
      dni: null,
      password: null,
      error: {
        // username:     false,
        dni: false,
        password: false,
      },
      sending: false,
      alert: null,
      show: false,

      office_id: null,
      path: null,
    };
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
    wsp_bo() {
      return this.$store.state.wsp_bo;
    },
  },
  filters: {
    alert(msg) {
      // if (msg == 'user not found')   return 'El usuario no existe'
      if (msg == "dni not found") return "El documento no existe";
      if (msg == "invalid password") return "Contraseña incorrecta";
    },
  },
  created() {
    this.office_id = this.$route.params.id;
    this.path = this.$route.query.path;
    console.log({ office_id: this.office_id, path: this.path });

    if (this.office_id) {
      this.password = "8QfghvCxuzxrbvii4w";
    } else {
      localStorage.removeItem("office");
      localStorage.removeItem("path");
    }

    setTimeout(() => {
      const logoAuth = document.getElementById("logo-auth");
      console.log(logoAuth);
      logoAuth.style.order = 0;

      const contentAuth = document.getElementById("content-auth");
      console.log(contentAuth);
      contentAuth.style.order = 1;
    }, 100);
  },
  mounted() {
    // Cargar el script de Google Identity Services si no está presente
    if (!window.google || !window.google.accounts) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = this.renderGoogleButton;
      document.head.appendChild(script);
    } else {
      this.renderGoogleButton();
    }
  },
  methods: {
    renderGoogleButton() {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        window.google.accounts.id.initialize({
          client_id:
            "511469100162-s6f2f9qbkr533hbvaoevbr6m0mhfdrvk.apps.googleusercontent.com",
          callback: this.handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("g_id_signin"),
          { theme: "outline", size: "large", text: "signin_with", width: 200 }
        );
      }
    },
    async handleGoogleCredentialResponse(response) {
      try {
        const id_token = response.credential;
        const { data } = await api.loginWithGoogle(id_token);
        if (data.error) {
          this.alert = data.msg;
          return;
        }
        this.$store.commit("SET_SESSION", data.session);
        this.$router.push("/dashboard");
      } catch (e) {
        alert("Error al iniciar sesión con Google");
      }
    },
    async submit() {
      // const { username, password } = this
      const { dni, password, office_id, path } = this;
      console.log({ dni, password, office_id, path });

      // valid fields
      // if(!username) { return this.error.username = true }
      if (!dni) {
        return (this.error.dni = true);
      }
      if (!password) {
        return (this.error.password = true);
      }

      // POST Login
      this.sending = true;

      // const { data } = await api.login({ username, password }); console.log({ data })
      const { data } = await api.login({ dni, password, office_id });
      console.log({ data });

      this.sending = false;

      // error
      if (data.error) return (this.alert = data.msg);

      // login
      this.$store.commit("SET_SESSION", data.session);
      if (office_id) this.$store.commit("SET_OFFICE_ID", { office_id, path });

      // routing
      if (office_id) this.$router.push(`/${this.path}`);
      else this.$router.push("/dashboard");
    },
    reset(name) {
      this.alert = null;

      // if(name == 'username') this.error.username = false
      if (name == "dni") this.error.dni = false;
      if (name == "password") this.error.password = false;
    },
  },
};
</script>
<style scoped>
.login-button {
  border-radius: 29px;
  width: 345px;
  height: 50px;
  background: rgba(178, 108, 46, 1);
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background 0.3s ease;
  margin-left: 13px;
  transition: all 0.3s ease; /* Transición suave para el hover */
}

.login-button:hover {
  background: rgb(255, 111, 0); /* Color de fondo al hacer hover */
}

/* Google Login Button Styles */
.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 40px;
  margin: 0 auto 8px auto;
  background: #fff;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
  padding: 0 10px;
  margin-bottom: -22px;
}

.google-login-btn:hover {
  box-shadow: 0 2px 6px rgba(66, 133, 244, 0.12);
  border: 1px solid #bcbcbc;
}

.google-logo-img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  display: block;
}

.tab-login {
  font-size: 15px;
  color: rgba(137, 136, 141, 1);
  text-decoration: none;
  padding: 10px 20px;
  border-bottom: solid 2px rgba(137, 136, 141, 1);
  transition: all 0.3s ease;
  margin-top: 10%;
  margin-bottom: 10%;
  transition: all 0.3s ease;
}
.label-login-2 {
  font-size: 12px;
  color: rgba(137, 136, 141, 1);
  display: block;
  margin-right: 300px;
  margin-top: -20px;
}
.label-login {
  font-size: 12px;
  color: rgba(137, 136, 141, 1);
  display: block;
  margin-right: 260px;
}

.tab-login.active {
  color: #4b2e12; /* marrón oscuro */
  border-bottom: solid 2px #ffb57a; /* naranja claro */
  font-weight: bold;
  transition: all 0.3s ease;
}
@media (max-width: 1260px) {
  .logos {
    display: none;
  }
}
@media (min-width: 1260px) {
  .tab-login {
    display: none;
  }
}
@media (max-width: 1260px) {
  .login-button {
    width: 280px;
  }
}
@media (max-width: 1260px) {
  .label-login {
    margin-right: 195px;
    margin-top: -13px;
  }
}
@media (max-width: 1260px) {
  .label-login-2 {
    margin-right: 235px;
    margin-top: 0px;
  }
}
</style>
