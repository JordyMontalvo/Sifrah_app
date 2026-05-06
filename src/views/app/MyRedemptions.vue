<template>
  <App :session="session" :office_id="office_id" :title="title">
    <div class="empty-view">
      <i class="fas fa-box-open"></i>
      <h2>Mis Canjes</h2>
      <p>Aquí aparecerán los productos que hayas canjeado con tu Bono Ahorro.</p>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
export default {
  components: { App },
  computed: {
    session() { return this.$store.state.session; },
    office_id() { return this.$store.state.office_id; },
    title() { return "Mis Canjes"; }
  }
};
</script>

<style scoped>
.empty-view {
  padding: 50px;
  text-align: center;
  color: #636e72;
}
.empty-view i {
  font-size: 60px;
  margin-bottom: 20px;
  color: #e91e63;
}
</style>
