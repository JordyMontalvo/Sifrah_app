<template>
  <div
    class="auth"
    :class="{
      'register-page': isRegister,
      'office-embed': isOfficeEmbed,
    }"
  >
    <div class="auth-visual" aria-hidden="true"></div>

    <AuthTabs variant="desk" />

    <section class="auth-welcome">
      <div class="welcome-content">
        <h2 class="welcome-subtitle">Bienvenido a</h2>
        <h1 class="welcome-title">SIFRAH</h1>
        <p class="welcome-slogan">"Tu momento de brillar es ahora."</p>
      </div>
    </section>

    <div class="auth-mobile-copy">
      <div class="auth-mobile-headline">
        <img
          class="auth-mobile-logo"
          src="@/assets/img/logo/logo-figure-blanco.svg"
          alt=""
        />
        <h1>BIENVENIDO</h1>
      </div>
      <p>"Tu momento de brillar es ahora."</p>
    </div>

    <section id="content-auth" class="auth-panel">
      <AuthTabs variant="mobile" />
      <div class="content">
        <div class="form">
          <slot />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import AuthTabs from "@/components/auth/AuthTabs";

export default {
  components: { AuthTabs },
  computed: {
    isRegister() {
      return this.$route.path.startsWith("/register");
    },
    isOfficeEmbed() {
      const q = this.$route.query || {};
      return !!(
        this.$route.params.id ||
        q.office_id ||
        q.embed === "office"
      );
    },
  },
};
</script>
