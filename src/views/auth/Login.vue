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

      <div class="welcome-title-form">
        <h1>BIENVENIDO</h1>
      </div>

        <label class="label-login-2" for="dni">DNI:</label>
        <div class="input-wrapper" style="position: relative; display: inline-block;">
          <input
            id="dni"
            class="input"
            style="border: solid 2px #d209b6; margin-left: 5px; padding-right: 40px;"
            placeholder="Dni"
            oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
            v-model="dni"
            :class="{ error: error.dni }"
            @keydown="reset('dni')"
          />
          <svg
            class="dni-icon"
            width="16"
            height="16"
            viewBox="0 0 53 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.5625 14.625C16.5625 20.2072 21.0211 24.75 26.5 24.75C31.9789 24.75 36.4375 20.2072 36.4375 14.625C36.4375 9.04275 31.9789 4.5 26.5 4.5C21.0211 4.5 16.5625 9.04275 16.5625 14.625ZM44.1667 47.25H46.375V45C46.375 36.3172 39.4386 29.25 30.9167 29.25H22.0833C13.5592 29.25 6.625 36.3172 6.625 45V47.25H44.1667Z" fill="#d209b6"/>
          </svg>
        </div>
        <br />
     

      <div v-if="!office_id">
        <label class="label-login" for="password">Contraseña:</label>
        <div class="input-wrapper" style="position: relative; display: inline-block;">
          <input
            id="password"
            :type="show ? 'text' : 'password'"
            class="input pass"
            style="border: solid 2px #d209b6; padding-right: 40px;"
            placeholder="*************"
            v-model="password"
            :class="{ error: error.password }"
            @keydown="reset('password')"
          />
          <svg 
            class="show" 
            width="16" 
            height="16" 
            viewBox="0 0 54 54" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            @click="show = !show"
          >
            <path d="M27 20.25C25.2098 20.25 23.4929 20.9612 22.227 22.227C20.9612 23.4929 20.25 25.2098 20.25 27C20.25 28.7902 20.9612 30.5071 22.227 31.773C23.4929 33.0388 25.2098 33.75 27 33.75C28.7902 33.75 30.5071 33.0388 31.773 31.773C33.0388 30.5071 33.75 28.7902 33.75 27C33.75 25.2098 33.0388 23.4929 31.773 22.227C30.5071 20.9612 28.7902 20.25 27 20.25ZM27 38.25C24.0163 38.25 21.1548 37.0647 19.045 34.955C16.9353 32.8452 15.75 29.9837 15.75 27C15.75 24.0163 16.9353 21.1548 19.045 19.045C21.1548 16.9353 24.0163 15.75 27 15.75C29.9837 15.75 32.8452 16.9353 34.955 19.045C37.0647 21.1548 38.25 24.0163 38.25 27C38.25 29.9837 37.0647 32.8452 34.955 34.955C32.8452 37.0647 29.9837 38.25 27 38.25ZM27 10.125C15.75 10.125 6.1425 17.1225 2.25 27C6.1425 36.8775 15.75 43.875 27 43.875C38.25 43.875 47.8575 36.8775 51.75 27C47.8575 17.1225 38.25 10.125 27 10.125Z" fill="#d209b6"/>
          </svg>
        </div>
        <br />
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
        <router-link to="/remember" style="color: #d209b6"
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
              style="color: #d209b6; text-decoration: underline"
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
        
        // Establecer sesión
        this.$store.commit("SET_SESSION", data.session);
        
        // Establecer información del usuario
        if (data.name) this.$store.commit("SET_NAME", data.name);
        if (data.lastName) this.$store.commit("SET_LAST_NAME", data.lastName);
        if (data.email) this.$store.commit("SET_EMAIL", data.email);
        if (data.photo) this.$store.commit("SET_PHOTO", data.photo);
        if (data.plan) this.$store.commit("SET_PLAN", data.plan);
        if (data.total_points !== undefined) this.$store.commit("SET_TOTAL_POINTS", data.total_points);
        
        // Establecer estado de afiliación
        this.$store.commit("SET_AFFILIATED", data.affiliated);
        
        // Redirigir según el estado de afiliación
        if (data.affiliated) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/affiliation");
        }
      } catch (e) {
        alert("Error al iniciar sesión con Google");
      }
    },
    async submit() {
      const { dni, password, office_id, path } = this;

      // Validar campos
      if (!dni) {
        return (this.error.dni = true);
      }
      if (!password) {
        return (this.error.password = true);
      }

      this.sending = true;

      try {
        const { data } = await api.login({ dni, password, office_id });
        this.sending = false;

        if (data.error) {
          this.alert = data.msg;
          return;
        }

        // IMPORTANTE: Verificar la respuesta del API ANTES de procesarla
        console.log('Login: Respuesta completa del API:', data);
        console.log('Login: Tipo de data.affiliated:', typeof data.affiliated);
        console.log('Login: Valor de data.affiliated:', data.affiliated);
        console.log('Login: ¿data.affiliated es undefined?', data.affiliated === undefined);
        console.log('Login: ¿data.affiliated es null?', data.affiliated === null);

        // Establecer sesión primero
        this.$store.commit("SET_SESSION", data.session);
        
        // Si es usuario de oficina, establecer office_id
        if (office_id) {
          this.$store.commit("SET_OFFICE_ID", { office_id, path });
        }

        // SOLUCIÓN: Si no tenemos información completa del usuario, hacer llamada adicional
        if (data.affiliated === undefined || data.affiliated === null) {
          console.log('Login: No tenemos información completa del usuario, haciendo llamada adicional...');
          
          try {
            // Hacer llamada al API de afiliación para obtener información completa
            const userData = await api.Afiliation.GET(data.session);
            console.log('Login: Información completa del usuario obtenida:', userData.data);
            
            if (userData.data.error) {
              console.error('Login: Error al obtener información del usuario:', userData.data);
              this.alert = "Error al obtener información del usuario";
              return;
            }
            
            // Usar la información completa del usuario
            const userInfo = userData.data;
            
            // Establecer información del usuario
            if (userInfo.name) this.$store.commit("SET_NAME", userInfo.name);
            if (userInfo.lastName) this.$store.commit("SET_LAST_NAME", userInfo.lastName);
            if (userInfo.email) this.$store.commit("SET_EMAIL", userInfo.email);
            if (userInfo.photo) this.$store.commit("SET_PHOTO", userInfo.photo);
            if (userInfo.plan) this.$store.commit("SET_PLAN", userInfo.plan);
            if (userInfo.total_points !== undefined) this.$store.commit("SET_TOTAL_POINTS", userInfo.total_points);
            
            // Establecer estado de afiliación y otros campos
            console.log('Login: Estableciendo affiliated en store:', userInfo.affiliated);
            this.$store.commit("SET_AFFILIATED", userInfo.affiliated);
            
            if (userInfo.tree !== undefined) this.$store.commit("SET_TREE", userInfo.tree);
            if (userInfo.activated !== undefined) this.$store.commit("SET_ACTIVATED", userInfo.activated);
            if (userInfo._activated !== undefined) this.$store.commit("SET__ACTIVATED", userInfo._activated);
            if (userInfo.country) this.$store.commit("SET_COUNTRY", userInfo.country);
            if (userInfo.balance !== undefined) this.$store.commit("SET_BALANCE", userInfo.balance);
            if (userInfo._balance !== undefined) this.$store.commit("SET__BALANCE", userInfo._balance);
            
          } catch (userError) {
            console.error('Login: Error al obtener información del usuario:', userError);
            this.alert = "Error al obtener información del usuario";
            return;
          }
        } else {
          // Si ya tenemos la información completa, usarla directamente
          console.log('Login: Usando información completa del API de login...');
          
          // Establecer información del usuario
          if (data.name) this.$store.commit("SET_NAME", data.name);
          if (data.lastName) this.$store.commit("SET_LAST_NAME", data.lastName);
          if (data.email) this.$store.commit("SET_EMAIL", data.email);
          if (data.photo) this.$store.commit("SET_PHOTO", data.photo);
          if (data.plan) this.$store.commit("SET_PLAN", data.plan);
          if (data.total_points !== undefined) this.$store.commit("SET_TOTAL_POINTS", data.total_points);
          
          // Establecer estado de afiliación y otros campos
          console.log('Login: Estableciendo affiliated en store:', data.affiliated);
          this.$store.commit("SET_AFFILIATED", data.affiliated);
          
          if (data.tree !== undefined) this.$store.commit("SET_TREE", data.tree);
          if (data.activated !== undefined) this.$store.commit("SET_ACTIVATED", data.activated);
          if (data._activated !== undefined) this.$store.commit("SET__ACTIVATED", data._activated);
          if (data.country) this.$store.commit("SET_COUNTRY", data.country);
          if (data.balance !== undefined) this.$store.commit("SET_BALANCE", data.balance);
          if (data._balance !== undefined) this.$store.commit("SET__BALANCE", data._balance);
        }

        // IMPORTANTE: Esperar a que TODOS los valores del store se establezcan
        console.log('Login: Estableciendo estado del store...');
        
        // Esperar múltiples ticks para asegurar que el store esté completamente actualizado
        await this.$nextTick();
        await this.$nextTick();
        await this.$nextTick();
        
        // Verificar que el estado se haya establecido correctamente
        console.log('Login: Estado después de commit:', {
          session: this.$store.state.session,
          affiliated: this.$store.state.affiliated,
          localStorage: {
            session: localStorage.getItem('session'),
            affiliated: localStorage.getItem('affiliated')
          }
        });

        // Verificar que affiliated esté correctamente establecido
        if (this.$store.state.affiliated === null || this.$store.state.affiliated === undefined) {
          console.error('Login: ERROR - affiliated no se estableció correctamente');
          console.log('Login: Reintentando establecer affiliated...');
          // Intentar obtener el valor desde localStorage como fallback
          const localAffiliated = localStorage.getItem('affiliated');
          if (localAffiliated !== null) {
            this.$store.commit("SET_AFFILIATED", localAffiliated === 'true');
          }
          await this.$nextTick();
        }

        // Verificación final del estado
        const estadoFinal = {
          session: this.$store.state.session,
          affiliated: this.$store.state.affiliated,
          localStorage: {
            session: localStorage.getItem('session'),
            affiliated: localStorage.getItem('affiliated')
          }
        };
        
        console.log('Login: Estado final antes de redirección:', estadoFinal);

        // Redirigir según el tipo de usuario
        if (office_id) {
          // Usuario de oficina
          console.log('Login: Redirigiendo usuario de oficina a', `/${this.path}`);
          this.$router.push(`/${this.path}`);
        } else {
          // Usuario normal - redirigir según afiliación
          if (this.$store.state.affiliated) {
            console.log('Login: Usuario afiliado, redirigiendo a /dashboard');
            this.$router.push("/dashboard");
          } else {
            console.log('Login: Usuario no afiliado, redirigiendo a /affiliation');
            this.$router.push("/affiliation");
          }
        }
      } catch (error) {
        this.sending = false;
        this.alert = "Error en el servidor. Intente nuevamente.";
        console.error("Error en login:", error);
      }
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
  background: #d209b6;
  color: white; /* Color del texto */
  border: none; /* Sin borde */
  cursor: pointer; /* Cambia el cursor al pasar sobre el botón */
  transition: background 0.3s ease;
  margin-left: 13px;
  margin-top: 10px;
  transition: all 0.3s ease; /* Transición suave para el hover */
}

.login-button:hover {
  background: #9f00ad; /* Color de fondo al hacer hover */
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
  margin-right: 460px;
  margin-top: 10px;
}
.label-login {
  font-size: 12px;
  color: rgba(137, 136, 141, 1);
  display: block;
  margin-right: 430px;
}

.tab-login.active {
  color: #9F00AD; /* marrón oscuro */
  border-bottom: solid 4px #FFD900; /* barra amarilla más gruesa */
  font-weight: bold;
  transition: all 0.3s ease;
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
    margin-top: 10px;
  }
}

/* Espaciado uniforme en móvil */
@media (max-width: 768px) {
  .label-login {
    margin-right: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 8px !important;
    text-align: left !important;
    display: block !important;
    margin-left: 45px !important;
  }
  
  .label-login-2 {
    margin-right: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 8px !important;
    text-align: left !important;
    display: block !important;
    margin-left: 45px !important;
  }
}

@media (max-width: 480px) {
  .label-login {
    margin-bottom: -6px !important;
    font-size: 11px !important;
    margin-left: 23px !important;
  }
  
  .label-login-2 {
    margin-bottom: -6px !important;
    font-size: 11px !important;
    margin-left: 23px !important;
  }
}

@media (max-width: 375px) {
  .label-login {
    margin-bottom: 5px !important;
    font-size: 10px !important;
    margin-left: 30px !important;
  }
  
  .label-login-2 {
    margin-bottom: 5px !important;
    font-size: 10px !important;
    margin-left: 30px !important;
  }
}

/* Ajuste de posición para desktop */
@media (min-width: 769px) {
  .dni-icon {
    transform: translateY(-60%) !important;
  }
  
  .show {
    transform: translateY(-60%) !important;
  }
}

/* Posicionamiento de iconos dentro de campos en móvil */
@media (max-width: 768px) {
  .input-wrapper {
    position: relative !important;
    display: inline-block !important;
    width: 100% !important;
    max-width: 350px !important;
  }
  
  .icon {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
  }
  
  .dni-icon {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
    z-index: 10 !important;
  }
}

/* Ocultar BIENVENIDO solo en móvil */
@media (max-width: 768px) {
  .welcome-title-form {
    display: none !important;
  }
  
  .show {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
    z-index: 10 !important;
    cursor: pointer !important;
    pointer-events: auto !important;
    color: #d209b6 !important;
    font-size: 16px !important;
    opacity: 0.8 !important;
  }
  
  .input {
    padding-right: 40px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
  }
  
  .input.pass {
    padding-right: 40px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* Ajustes adicionales para móviles más pequeños */
@media (max-width: 480px) {
  .input-wrapper {
    max-width: 320px !important;
  }
  
  .icon {
    right: 10px !important;
    font-size: 14px !important;
  }
  
  .dni-icon {
    right: 10px !important;
    width: 14px !important;
    height: 14px !important;
  }
  
  .show {
    right: 10px !important;
    font-size: 14px !important;
  }
  
  .input {
    padding-right: 35px !important;
  }
  
  .input.pass {
    padding-right: 35px !important;
  }
}

@media (max-width: 375px) {
  .input-wrapper {
    max-width: 300px !important;
  }
  
  .icon {
    right: 8px !important;
    font-size: 13px !important;
  }
  
  .dni-icon {
    right: 8px !important;
    width: 13px !important;
    height: 13px !important;
  }
  
  .show {
    right: 8px !important;
    font-size: 13px !important;
  }
  
  .input {
    padding-right: 30px !important;
  }
  
  .input.pass {
    padding-right: 30px !important;
  }
}
</style>
