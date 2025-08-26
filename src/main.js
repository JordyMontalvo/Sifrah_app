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
      // Limpiar localStorage completamente
      localStorage.removeItem("session");
      localStorage.removeItem("affiliated");
      localStorage.removeItem("name");
      localStorage.removeItem("lastName");
      localStorage.removeItem("email");
      localStorage.removeItem("photo");
      localStorage.removeItem("plan");
      localStorage.removeItem("total_points");
      localStorage.removeItem("token");
      localStorage.removeItem("tree");
      localStorage.removeItem("activated");
      localStorage.removeItem("_activated");
      localStorage.removeItem("country");
      localStorage.removeItem("address");
      localStorage.removeItem("city");
      localStorage.removeItem("birthdate");
      
      api.logout(this.session);

      const office = localStorage.getItem("office");

      if (office == "true") {
        const office_id = localStorage.getItem("office_id");
        const path = localStorage.getItem("path");

        const url = `/login/${office_id}?path=${path}`;
        console.log({ url });

        localStorage.removeItem("office_id");
        localStorage.removeItem("office");
        localStorage.removeItem("path");

        this.$router.push(url);
      } else {
        this.$router.push("/login");
      }
    },
    logout2() {
      // Limpiar localStorage completamente
      localStorage.removeItem("session");
      localStorage.removeItem("affiliated");
      localStorage.removeItem("name");
      localStorage.removeItem("lastName");
      localStorage.removeItem("email");
      localStorage.removeItem("photo");
      localStorage.removeItem("plan");
      localStorage.removeItem("total_points");
      localStorage.removeItem("token");
      localStorage.removeItem("tree");
      localStorage.removeItem("activated");
      localStorage.removeItem("_activated");
      localStorage.removeItem("country");
      localStorage.removeItem("address");
      localStorage.removeItem("city");
      localStorage.removeItem("birthdate");
      
      api.logout(this.session);

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

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
