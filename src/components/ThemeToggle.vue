<template>
  <button class="theme-toggle" title="Modo claro">
    <span>☀️</span>
  </button>
</template>

<script>
export default {
  name: "ThemeToggle",
  mounted() {
    // Forzar siempre modo claro al cargar el componente
    document.setTheme("light");
  },
};
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  margin: 0 8px;
  transition: color 0.2s;
}
.theme-toggle:focus {
  outline: 2px solid #086eb6;
}
</style>
