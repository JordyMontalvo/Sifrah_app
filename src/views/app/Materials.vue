<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading" class="materials-wrapper">
      <!-- Botón flotante para abrir en nueva ventana -->
      <div class="floating-button-container">
        <button @click="openMaterials" class="floating-open-button" title="Abrir en nueva ventana">
          <i class="fas fa-external-link-alt"></i>
          Abrir en nueva ventana
        </button>
      </div>
      
      <!-- Iframe con configuración para abrir links en nueva ventana -->
      <div class="iframe-container">
        <iframe 
          class="materials-iframe" 
          :src="materialsUrl"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        ></iframe>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
      materialsUrl: 'https://beacons.ai/sifrahcorp/mediakit',
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    title() {
      return "Materiales";
    },
  },
  async created() {
    try {
        const { data } = await api.tools(this.session); 

        this.loading = false;

        // error
        if (data.error && data.msg == "invalid session")
          this.$router.push("/login");
        if (data.error && data.msg == "unverified user")
          this.$router.push("/verify");

        // success
        this.$store.commit("SET_NAME", data.name);
        this.$store.commit("SET_LAST_NAME", data.lastName);
        this.$store.commit("SET_AFFILIATED", data.affiliated);
        this.$store.commit("SET_ACTIVATED", data.activated);
        this.$store.commit("SET__ACTIVATED", data._activated);
        this.$store.commit("SET_PLAN", data.plan);
        this.$store.commit("SET_COUNTRY", data.country);
        this.$store.commit("SET_PHOTO", data.photo);
        this.$store.commit("SET_TREE", data.tree);
    } catch (e) {
        this.loading = false;
        console.error(e);
    }
  },
  methods: {
    openMaterials() {
      window.open(this.materialsUrl, '_blank', 'noopener,noreferrer');
    },
  },
};
</script>

<style lang="stylus" scoped>
.materials-wrapper
  position relative
  width 100%
  height calc(100vh - 80px)
  overflow hidden

.floating-button-container
  position absolute
  top 20px
  right 20px
  z-index 1000

.floating-open-button
  background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  color white
  border none
  padding 12px 24px
  font-size 14px
  font-weight 600
  border-radius 50px
  cursor pointer
  box-shadow 0 4px 15px rgba(102, 126, 234, 0.4)
  display flex
  align-items center
  gap 8px
  transition all 0.3s ease
  
  &:hover
    transform translateY(-2px)
    box-shadow 0 6px 20px rgba(102, 126, 234, 0.6)
    background linear-gradient(135deg, #764ba2 0%, #667eea 100%)
  
  &:active
    transform translateY(0)
  
  i
    font-size 14px

.iframe-container
  position relative
  width 100%
  height 100%

.materials-iframe
  width 100%
  height 100%
  border 0
  display block

@keyframes slideIn
  from
    opacity 0
    transform translateY(-30px)
  to
    opacity 1
    transform translateY(0)
</style>



