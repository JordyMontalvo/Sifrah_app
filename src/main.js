import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import api from "./api";
import GAuth from "vue-google-oauth2";

Vue.config.productionTip = false;

const gauthOption = {
  clientId:
    "511469100162-s6f2f9qbkr533hbvaoevbr6m0mhfdrvk.apps.googleusercontent.com",
  scope: "profile email",
  prompt: "select_account",
};
Vue.use(GAuth, gauthOption);

// Global Logout Mixin
Vue.mixin({
  methods: {
    logout() {
      // Limpiar todos los mensajes de notificación del DOM
      const notifications = document.querySelectorAll('.affiliation-required-notification, .affiliation-notification');
      notifications.forEach(notification => {
        if (notification.parentElement) {
          notification.remove();
        }
      });
      
      // Limpiar store
      this.$store.dispatch('clearState');
      
      // Limpiar localStorage
      localStorage.clear();
      
      // Logout en API
      api.logout(this.session);

      // Redirigir según el tipo de usuario
      const office = localStorage.getItem("office");
      if (office == "true") {
        const office_id = localStorage.getItem("office_id");
        const path = localStorage.getItem("path");
        const url = `/login/${office_id}?path=${path}`;
        this.$router.push(url);
      } else {
        this.$router.push("/login");
      }
    },
    logout2() {
      // Limpiar todos los mensajes de notificación del DOM
      const notifications = document.querySelectorAll('.affiliation-required-notification, .affiliation-notification');
      notifications.forEach(notification => {
        if (notification.parentElement) {
          notification.remove();
        }
      });
      
      // Limpiar store
      this.$store.dispatch('clearState');
      
      // Limpiar localStorage
      localStorage.clear();
      
      // Logout en API
      api.logout(this.session);

      // Redirigir a login
      this.$router.push("/login");
    },
  },
});

// Modo oscuro/claro toggle
function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");
  }
}

// Inicializar tema al cargar
const savedTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");
setTheme(savedTheme);

// Método global para cambiar tema
document.setTheme = setTheme;

// Función para inicializar la aplicación después de restaurar el estado
async function initializeApp() {
  try {
    // Restaurar el estado del store antes de crear la instancia de Vue
    await store.dispatch('restoreState');
    
    // Crear la instancia de Vue después de restaurar el estado
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    // Crear la instancia de Vue incluso si hay error
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  }
}

// Inicializar la aplicación
initializeApp();
