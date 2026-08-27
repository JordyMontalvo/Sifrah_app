<template>
  <div class="social">
    <a
      class="fab fa-facebook-square social-icon facebook"
      :href="fb"
      target="_blank"
      rel="noopener"
    ></a>
    <a
      class="fab fa-youtube social-icon youtube"
      :href="yt"
      target="_blank"
      rel="noopener"
    ></a>
    <a
      class="fab fa-tiktok social-icon tiktok"
      :href="tk"
      target="_blank"
      rel="noopener"
    ></a>
    <a
      class="fab fa-whatsapp social-icon whatsapp"
      :href="wsp_pe"
      target="_blank"
      rel="noopener"
    ></a>
  </div>
</template>

<script>
export default {
  name: "AuthSocial",
  computed: {
    fb() {
      return this.$store.state.fb;
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
  },
};
</script>
