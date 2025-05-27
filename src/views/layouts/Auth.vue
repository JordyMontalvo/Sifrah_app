<template>
  <div class="auth">
    <div>
      <img
        src="@/assets/img/logo/logo sifrah BLANCO LOGIN.svg"
        style="width: 699px; height: auto"
      />
    </div>
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
    <section>
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
