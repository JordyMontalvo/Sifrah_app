<template>
  <div class="auth">
    <div class="auth-tabs" id="tabs">
      <router-link
        to="/login"
        class="tab"
        :class="{ active: $route.path === '/login' }"
      >
        INICIO
      </router-link>
      <router-link
        to="/register"
        class="tab"
        :class="{ active: $route.path === '/register' }"
      >
        REGISTRO
      </router-link>
    </div>
    <div id="logo-auth">
      <img
        class="logo-auth"
        src="@/assets/img/logo/logo sifrah BLANCO LOGIN.svg"
        style="width: auto; height: auto;  transition: all 0.3s ease;"
      />
    </div>
    <img class="logo-blanco" src="@/assets/img/logo/logo 2 sifrah NARANJA LOGIN.svg" style="width: 280px; height: auto" />
    <!-- <header>
      <img class="logo" src="@/assets/img/logo-big.svg" style="width: 400px;">
      <p style="color: white; font-size: 14px; margin: 12px 0 8px 0;">Siguenos</p>
      <div class="social">
        <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
        <a class="fab fa-instagram"       :href="is" target="_blank"></a>
        <a class="fab fa-tiktok"          :href="tk" target="_blank"></a>
        <a class="fab fa-youtube"         :href="yt" target="_blank"></a>
      </div>
    </header> -->
    <section id="content-auth">
      <div class="content">
        <div class="form">
          <header>
            <!-- <img class="logo" src="@/assets/img/logo/logo.jpeg"> <br> -->
            <!-- <img class="logo-text" src="@/assets/img/logo/text.svg"> -->
          </header>

          <slot />
        </div>
        <!-- <div class="links">
          <a :href="msn"  target="_blank" class="link"><small>Ayuda</small></a>
          <a :href="site" target="_blank" class="link"><small></small></a>
          <a :href="wsp"  target="_blank" class="link"><small>Whatsapp de Ayuda</small></a>
        </div> -->
      </div>
    </section>
    <!-- <footer>
      <img class="logo--white" src="@/assets/img/logo/logo-white.png">
    </footer> -->
  </div>
</template>

<script>
export default {
  computed: {
    // msn()  { return this.$store.state.msn },
    // wsp()  { return this.$store.state.wsp_bo },
    wsp() {
      return this.$store.state.wsp_ec;
    },
    site() {
      return this.$store.state.site;
    },

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
  },
};
</script>
<style scoped>
.auth-tabs {
  position: absolute;
  top: 0;
  left: 25%;
  transform: translateX(-50%);
  display: flex;
  background-color: #d46b00; /* fondo base */
  border-radius: 0 0 37px 37px;
  overflow: hidden;
  width: fit-content;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.10s ease;
}

.tab {
  width: 170px; /* Ancho fijo */
  height: 70px; /* Altura fija */
  padding: 12px 0; /* Espaciado interno */
  text-decoration: none;
  color: white;
  font-weight: bold;
  background-color: transparent;
  transition: background 0.3s ease;
  display: flex; /* Para centrar el texto */
  align-items: center; /* Centrar verticalmente */
  justify-content: center;
  transition: all 0.10s ease;
 /* Centrar horizontalmente */
}
.tab:first-child.active {
  border-bottom-left-radius: 30px;
  transition: all 0.10s ease;
}
.tab.active {
  border-bottom-right-radius: 30px;
  transition: all 0.10s ease;
}
.tab.active {
  background-color: #ffd8a3;
  color: #222;
  transition: all 0.3s ease;
}
@media (max-width: 1260px) {
  .logo-auth {
    display: none;
  }
}
@media (max-width: 1260px) {
  .auth-tabs {
    display: none;
  }
}
@media (min-width: 1260px) {
  .logo-blanco {
    display: none;
  }
}
</style>
