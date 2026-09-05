<template>
  <div class="legal-page">
    <header class="legal-top">
      <button type="button" class="legal-back" @click="goBack">← Volver</button>
      <span class="legal-brand">SIFRAH</span>
    </header>

    <article class="legal-card">
      <p class="legal-kicker">{{ kicker }}</p>
      <h1>{{ title }}</h1>
      <p class="legal-updated">Última actualización: 5 de septiembre de 2026</p>
      <slot />
    </article>

    <nav class="legal-foot" aria-label="Documentos legales">
      <router-link v-if="otherTo" class="legal-link" :to="otherTo">{{ otherLabel }}</router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: "LegalLayout",
  props: {
    kicker: { type: String, default: "SIFRAH" },
    title: { type: String, required: true },
    otherTo: { type: String, default: "" },
    otherLabel: { type: String, default: "" },
  },
  methods: {
    goBack() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push("/login");
    },
  },
};
</script>

<style src="@/assets/style/views/legal/Legal.css"></style>
