<template>
  <Auth>
    <section v-if="isOfficeEmbed" class="office-embed-panel">
      <div v-if="officeEmbedError" class="office-embed-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ officeEmbedError }}</p>
      </div>
      <div v-else class="office-embed-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ sending ? "Abriendo sesión del socio…" : "Conectando con el socio…" }}</p>
      </div>
    </section>

    <section v-else>
      <div class="welcome-title-form">
        <h1>BIENVENIDO</h1>
      </div>

        <label class="label-login-2" for="dni">DNI:</label>
        <div class="input-wrapper">
          <input
            id="dni"
            class="input"
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
     

      <div v-if="!office_id">
        <label class="label-login" for="password">Contraseña:</label>
        <div class="input-wrapper">
          <input
            id="password"
            :type="show ? 'text' : 'password'"
            class="input pass"
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
      </div>

      <p class="alert">{{ alert | alert }}</p>

      <button class="login-button" v-show="!sending" @click="submit">
        Iniciar sesión
      </button>
      <button class="login-button" v-show="sending" disabled>
        Validando datos ...
      </button>

     <!-- <button class="google-login-btn" id="g_id_signin"></button> -->

      <small class="forgot-password"
        >¿Olvidaste tu contraseña?
        <router-link to="/remember">Ingresa Aquí</router-link>
      </small>
    </section>
    <footer v-if="!office_id">
      <AuthSocial />
      <div class="login-link">
        <small>
          ¿No tienes cuenta?
          <router-link to="/register">Regístrate</router-link>
        </small>
      </div>
    </footer>
  </Auth>
</template>

<script>
import Auth from "@/views/layouts/Auth";
import AuthSocial from "@/components/auth/AuthSocial";
import api from "@/api";
import Swal from "sweetalert2";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export default {
  components: { Auth, AuthSocial },
  data() {
    return {
      dni: null,
      password: null,
      error: {
        dni: false,
        password: false,
      },
      sending: false,
      alert: null,
      show: false,

      office_id: null,
      path: null,
      officeEmbedError: null,
    };
  },
  computed: {
    isOfficeEmbed() {
      const q = this.$route.query || {};
      return !!(
        q.embed === "office" ||
        this.office_id ||
        q.office_id ||
        this.$route.params.id ||
        (q.dni && (q.office_id || this.$route.params.id || q.embed === "office"))
      );
    },
    effectiveOfficeId() {
      return this.office_id || this.$route.query.office_id || "central";
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
    this.office_id = this.$route.params.id || this.$route.query.office_id || null;
    this.path = this.$route.query.path;
    if (this.$route.query.dni) {
      this.dni = String(this.$route.query.dni).trim();
    }

    if (this.isOfficeEmbed) {
      const embedDni = String(this.dni || "").trim();
      this.$store.dispatch("resetForOfficeEmbed", embedDni);
      if (this.dni) {
        setTimeout(() => this.submit(), 400);
      } else {
        this.officeEmbedError = "Falta el DNI del socio.";
      }
    } else {
      localStorage.removeItem("office");
      localStorage.removeItem("path");
    }

  },
  watch: {
    "$route.query.dni"(nextDni) {
      if (!this.isOfficeEmbed || !nextDni) return;
      const dni = String(nextDni).trim();
      if (!dni || dni === this.dni) return;
      this.dni = dni;
      this.officeEmbedError = null;
      this.$store.dispatch("resetForOfficeEmbed", dni);
      setTimeout(() => this.submit(), 200);
    },
  },
  mounted() {
    if (this.isOfficeEmbed) return;
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
      const button = document.getElementById("g_id_signin");
      if (
        button &&
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        window.google.accounts.id.initialize({
          client_id:
            "511469100162-s6f2f9qbkr533hbvaoevbr6m0mhfdrvk.apps.googleusercontent.com",
          callback: this.handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(button, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 200,
        });
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
    async registerFCMToken(dni) {
      // Solo en dispositivos Android/iOS
      if (Capacitor.getPlatform() !== 'android' && Capacitor.getPlatform() !== 'ios') return;
      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== 'granted') return;

        // Escuchar el token UNA VEZ
        await new Promise((resolve) => {
          PushNotifications.addListener('registration', async (token) => {
            console.log('[Login] FCM token obtenido:', token.value.substring(0, 30));
            try {
              await api.registerNotificationToken({ dni: dni, fcmToken: token.value });
              console.log('[Login] Token FCM guardado en BD con dni:', dni);
            } catch(e) {
              console.error('[Login] Error guardando token:', e);
            }
            resolve();
          });
          PushNotifications.addListener('registrationError', (err) => {
            console.error('[Login] Error obteniendo token FCM:', err);
            resolve();
          });
          PushNotifications.register();
        });
      } catch(e) {
        console.error('[Login] Error en registerFCMToken:', e);
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
      // Guardar dni y user_id en el store para que initPushNotifications pueda registrar el token FCM
      if (userInfo.dni) this.$store.commit("SET_DNI", userInfo.dni);
      if (userInfo.id) this.$store.commit("SET_USER_ID", userInfo.id);
    },
    getOfficePasswordCandidates() {
      const fromEnv = process.env.VUE_APP_OFFICE_PASSWORD;
      return [...new Set([fromEnv, "8QfghvCxuzxrbvii4w", "2374", "098"].filter(Boolean))];
    },
    async submit() {
      const dni = String(this.dni || "").trim();
      const office_id = this.isOfficeEmbed ? this.effectiveOfficeId : this.office_id;
      const path = this.path;

      if (!dni) {
        if (this.isOfficeEmbed) {
          this.officeEmbedError = "Falta el DNI del socio.";
        } else {
          this.error.dni = true;
        }
        return;
      }

      if (!this.isOfficeEmbed && !this.password) {
        return (this.error.password = true);
      }

      this.sending = true;
      this.officeEmbedError = null;
      this.alert = null;

      try {
        const passwords = this.isOfficeEmbed
          ? this.getOfficePasswordCandidates()
          : [this.password];

        let data = null;
        let lastError = null;

        for (const password of passwords) {
          const response = await api.login({ dni, password, office_id });
          data = response.data;
          if (!data.error) break;
          lastError = data;
        }

        if (!data || data.error) {
          if (data && data.code === "ACCOUNT_BLOCKED") {
            this.showUnlockModal(data.dni, data.msg);
            return;
          }
          const msg =
            (data && (data.msg || data.error)) ||
            (lastError && lastError.msg) ||
            "No se pudo abrir la sesión";
          if (this.isOfficeEmbed) {
            this.officeEmbedError = this.$options.filters.alert(msg) || msg;
          } else {
            this.alert = msg;
          }
          return;
        }

        this.$store.commit("SET_SESSION", data.session);
        if (dni) {
          this.$store.commit("SET_DNI", dni);
        }
        if (office_id) {
          this.$store.commit("SET_OFFICE_ID", { office_id, path });
        }

        this.applyUserToStore(data);
        if (dni) {
          this.$store.commit("SET_DNI", dni);
        }

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

        // Registrar token FCM al hacer login (tenemos el DNI disponible aquí)
        this.registerFCMToken(dni).catch(err => console.warn('FCM register failed:', err));

        if (office_id) {
          const dest =
            !path || path === "dashboard" ? "/dashboard" : `/${path}`;
          this.$router.push(dest);
        } else if (this.$store.state.affiliated) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/affiliation");
        }
      } catch (error) {
        const msg = "Error en el servidor. Intente nuevamente.";
        if (this.isOfficeEmbed) {
          this.officeEmbedError = msg;
        } else {
          this.alert = msg;
        }
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

      if (name == "dni") this.error.dni = false;
      if (name == "password") this.error.password = false;
    },
  },
};
</script>
<style scoped lang="stylus">
@import '~@/assets/style/login.styl';

.office-embed-panel
  min-height 280px
  display flex
  align-items center
  justify-content center
  padding 48px 24px

.office-embed-loading
  text-align center
  color #666
  i
    font-size 2.2rem
    color #e91e63
    margin-bottom 16px
    display block
  p
    margin 0
    font-size 1rem

.office-embed-error
  text-align center
  color #c0392b
  max-width 360px
  i
    font-size 2rem
    margin-bottom 12px
    display block
  p
    margin 0
    line-height 1.5
</style>
