<template>
  <button class="theme-toggle" @click="toggleTheme">
    <span v-if="theme === 'dark'" title="Modo claro">🌙</span>
    <span v-else title="Modo oscuro">☀️</span>
  </button>
</template>

<script>
export default {
  name: "ThemeToggle",
  data() {
    return {
      theme:
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"),
    };
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.setTheme(this.theme);
    },
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
