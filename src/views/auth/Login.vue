<template>
  <Auth>
    <section v-if="office_id && (sending || embedAutoLogin)" class="office-embed-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Abriendo sesión del socio…</p>
    </section>

    <section v-else>
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
            style="border: solid 2px #e91e63;  padding-right: 40px;"
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
            <path d="M16.5625 14.625C16.5625 20.2072 21.0211 24.75 26.5 24.75C31.9789 24.75 36.4375 20.2072 36.4375 14.625C36.4375 9.04275 31.9789 4.5 26.5 4.5C21.0211 4.5 16.5625 9.04275 16.5625 14.625ZM44.1667 47.25H46.375V45C46.375 36.3172 39.4386 29.25 30.9167 29.25H22.0833C13.5592 29.25 6.625 36.3172 6.625 45V47.25H44.1667Z" fill="#e91e6382"/>
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
            style="border: solid 2px #e91e63; padding-right: 40px;"
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
            <path d="M27 20.25C25.2098 20.25 23.4929 20.9612 22.227 22.227C20.9612 23.4929 20.25 25.2098 20.25 27C20.25 28.7902 20.9612 30.5071 22.227 31.773C23.4929 33.0388 25.2098 33.75 27 33.75C28.7902 33.75 30.5071 33.0388 31.773 31.773C33.0388 30.5071 33.75 28.7902 33.75 27C33.75 25.2098 33.0388 23.4929 31.773 22.227C30.5071 20.9612 28.7902 20.25 27 20.25ZM27 38.25C24.0163 38.25 21.1548 37.0647 19.045 34.955C16.9353 32.8452 15.75 29.9837 15.75 27C15.75 24.0163 16.9353 21.1548 19.045 19.045C21.1548 16.9353 24.0163 15.75 27 15.75C29.9837 15.75 32.8452 16.9353 34.955 19.045C37.0647 21.1548 38.25 24.0163 38.25 27C38.25 29.9837 37.0647 32.8452 34.955 34.955C32.8452 37.0647 29.9837 38.25 27 38.25ZM27 10.125C15.75 10.125 6.1425 17.1225 2.25 27C6.1425 36.8775 15.75 43.875 27 43.875C38.25 43.875 47.8575 36.8775 51.75 27C47.8575 17.1225 38.25 10.125 27 10.125Z" fill="#e91e6382"/>
          </svg>
        </div>
        <br />
      </div>

      <p class="alert">{{ alert | alert }}</p>

      <button class="login-button" v-show="!sending" @click="submit">
        Iniciar sesión
      </button>
      <button class="login-button" v-show="sending" disabled>
        Validando datos ...
      </button>
      <br /><br />

     <!-- <button class="google-login-btn" id="g_id_signin"></button> -->
     <!-- <br /><br /> -->

      <small style="color: rgba(137, 136, 141, 1)"
        >¿Olvidaste tu contraseña?
        <router-link to="/remember" style="color: #e91e63"
          >Ingresa Aquí</router-link
        ></small
      >
      <br /><br />
    </section>
    <footer v-if="!office_id">
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
        <div class="login-link">
          <small style="color: rgba(137, 136, 141, 1)">
            ¿No tienes cuenta?
            <router-link
              to="/register"
              style="text-decoration: underline"
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
import Swal from "sweetalert2";

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
      embedAutoLogin: false,
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
      if (msg == "dni not found") return "El documento no existe";
      if (msg == "invalid password") return "Contraseña incorrecta";
      return msg;
    },
  },
  created() {
    this.office_id = this.$route.params.id;
    this.path = this.$route.query.path;
    if (this.$route.query.dni) {
      this.dni = String(this.$route.query.dni).trim();
    }

    if (this.office_id) {
      this.password =
        process.env.VUE_APP_OFFICE_PASSWORD || "8QfghvCxuzxrbvii4w";
      if (this.dni) {
        this.embedAutoLogin = true;
        setTimeout(() => {
          if (this.embedAutoLogin) this.submit();
        }, 500);
      }
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
    applyUserToStore(userInfo) {
      if (!userInfo) return;
      if (userInfo.name) this.$store.commit("SET_NAME", userInfo.name);
      if (userInfo.lastName) this.$store.commit("SET_LAST_NAME", userInfo.lastName);
      if (userInfo.email) this.$store.commit("SET_EMAIL", userInfo.email);
      if (userInfo.photo) this.$store.commit("SET_PHOTO", userInfo.photo);
      if (userInfo.plan) this.$store.commit("SET_PLAN", userInfo.plan);
      if (userInfo.total_points !== undefined) {
        this.$store.commit("SET_TOTAL_POINTS", userInfo.total_points);
      }
      if (userInfo.affiliated !== undefined && userInfo.affiliated !== null) {
        this.$store.commit("SET_AFFILIATED", userInfo.affiliated);
      }
      if (userInfo.tree !== undefined) this.$store.commit("SET_TREE", userInfo.tree);
      if (userInfo.activated !== undefined) {
        this.$store.commit("SET_ACTIVATED", userInfo.activated);
      }
      if (userInfo._activated !== undefined) {
        this.$store.commit("SET__ACTIVATED", userInfo._activated);
      }
      if (userInfo.country) this.$store.commit("SET_COUNTRY", userInfo.country);
      if (userInfo.balance !== undefined) {
        this.$store.commit("SET_BALANCE", userInfo.balance);
      }
      if (userInfo._balance !== undefined) {
        this.$store.commit("SET__BALANCE", userInfo._balance);
      }
    },
    async submit() {
      const { dni, password, office_id, path } = this;

      if (!dni) return (this.error.dni = true);
      if (!password) return (this.error.password = true);

      this.embedAutoLogin = false;
      this.sending = true;
      this.alert = null;

      try {
        const { data } = await api.login({ dni, password, office_id });

        if (data.error) {
          if (data.code === "ACCOUNT_BLOCKED") {
            this.showUnlockModal(data.dni, data.msg);
            return;
          }
          this.alert = data.msg;
          return;
        }

        this.$store.commit("SET_SESSION", data.session);
        if (office_id) {
          this.$store.commit("SET_OFFICE_ID", { office_id, path });
        }

        this.applyUserToStore(data);

        if (data.affiliated === undefined || data.affiliated === null) {
          try {
            const userData = await api.Afiliation.GET(data.session);
            if (!userData.data.error) {
              this.applyUserToStore(userData.data);
            }
          } catch (userError) {
            console.warn("Login: no se pudo cargar perfil de afiliación", userError);
          }
        }

        await this.$nextTick();

        if (office_id) {
          this.$router.push(`/${this.path}`);
        } else if (this.$store.state.affiliated) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/affiliation");
        }
      } catch (error) {
        this.alert = "Error en el servidor. Intente nuevamente.";
        console.error("Error en login:", error);
      } finally {
        this.sending = false;
      }
    },
    async showUnlockModal(dni, msg) {
      const { value: formValues } = await Swal.fire({
        title: 'Cuenta Bloqueada',
        html: `
          <p style="font-size: 14px; margin-bottom: 15px;">${msg}</p>
          <div style="text-align: left; margin-bottom: 10px;">
            <label style="font-size: 12px; font-weight: bold; color: #555;">Motivo para solicitar desbloqueo (Obligatorio)</label>
            <textarea id="swal-reason" class="swal2-textarea" style="margin: 5px 0; width: 100%; box-sizing: border-box;" placeholder="Explica brevemente..."></textarea>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar Solicitud',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e91e63',
        backdrop: `rgba(0,0,0,0.4)`,
        showClass: {
          popup: 'swal2-noanimation',
          backdrop: 'swal2-noanimation'
        },
        hideClass: {
          popup: '',
          backdrop: ''
        },
        preConfirm: () => {
          const reason = document.getElementById('swal-reason').value;
          if (!reason || reason.trim() === '') {
            Swal.showValidationMessage('El motivo es obligatorio');
            return false;
          }
          return { reason };
        }
      });

      if (formValues) {
        this.sending = true;
        try {
          // Reutilizamos el endpoint reactivations pero solo enviando motivo
          const { data } = await api.reactivateRequest({
            dni,
            reason: formValues.reason
          });
          
          this.sending = false;
          if (data.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.msg,
              showClass: { popup: 'swal2-noanimation', backdrop: 'swal2-noanimation' },
              hideClass: { popup: '', backdrop: '' }
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Solicitud Enviada',
              text: 'Tu solicitud de desbloqueo ha sido enviada al administrador.',
              showClass: { popup: 'swal2-noanimation', backdrop: 'swal2-noanimation' },
              hideClass: { popup: '', backdrop: '' }
            });
          }
        } catch (error) {
          this.sending = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar la solicitud',
            showClass: { popup: 'swal2-noanimation', backdrop: 'swal2-noanimation' },
            hideClass: { popup: '', backdrop: '' }
          });
        }
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
<style scoped lang="stylus">
@import '~@/assets/style/login.styl';

.office-embed-loading
  text-align center
  padding 48px 24px
  color #666
  i
    font-size 2rem
    color #e91e63
    margin-bottom 16px
  p
    margin 0
    font-size 1rem
</style>
