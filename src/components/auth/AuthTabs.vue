<template>
  <nav class="auth-tabs" :class="'auth-tabs--' + variant">
    <router-link
      to="/login"
      class="auth-tab"
      :class="{ active: $route.path === '/login' || $route.path.startsWith('/login/') }"
    >
      INICIO
    </router-link>
    <router-link
      to="/register"
      class="auth-tab"
      :class="{ active: $route.path.startsWith('/register') }"
    >
      REGISTRO
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
