<template>
  <nav class="auth-tabs" :class="'auth-tabs--' + variant">
    <router-link
      to="/login"
      class="auth-tab"
      :class="{ active: $route.path === '/login' || $route.path.startsWith('/login/') }"
    >
      <span class="auth-tab-label">INICIO</span>
      <span class="auth-tab-line" aria-hidden="true"></span>
    </router-link>
    <router-link
      to="/register"
      class="auth-tab"
      :class="{ active: $route.path.startsWith('/register') }"
    >
      <span class="auth-tab-label">REGISTRO</span>
      <span class="auth-tab-line" aria-hidden="true"></span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: "AuthTabs",
  props: {
    variant: {
      type: String,
      default: "desk",
    },
  },
};
</script>
