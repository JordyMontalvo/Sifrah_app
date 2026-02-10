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
          ref="materialsFrame"
          class="materials-iframe" 
          :src="materialsUrl"
          @error="handleIframeError"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        ></iframe>
        
        <!-- Mensaje de error si el iframe no carga -->
        <div v-if="iframeError" class="iframe-error">
          <div class="error-card">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>No se puede cargar el contenido aquí</h3>
            <p>Algunos servicios externos bloquean su visualización embebida por seguridad.</p>
            <button @click="openMaterials" class="error-button">
              <i class="fas fa-external-link-alt"></i>
              Abrir Materiales en nueva ventana
            </button>
          </div>
        </div>
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
      iframeError: false,
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
  mounted() {
    // Detectar si el iframe no carga después de 5 segundos
    setTimeout(() => {
      if (this.$refs.materialsFrame && !this.$refs.materialsFrame.contentDocument) {
        this.iframeError = true;
      }
    }, 5000);
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
    handleIframeError() {
      this.iframeError = true;
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

.iframe-error
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  background rgba(248, 249, 250, 0.98)
  display flex
  align-items center
  justify-content center
  z-index 100
  backdrop-filter blur(10px)

.error-card
  background linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
  border-radius 20px
  padding 60px 40px
  text-align center
  max-width 500px
  width 90%
  box-shadow 0 20px 60px rgba(245, 87, 108, 0.3)
  color white
  animation slideIn 0.5s ease-out
  
  i
    font-size 64px
    margin-bottom 20px
    opacity 0.9
  
  h3
    font-size 28px
    font-weight 700
    margin 0 0 15px 0
    color white
  
  p
    font-size 16px
    line-height 1.6
    margin-bottom 30px
    opacity 0.95
    color white

.error-button
  background white
  color #f5576c
  border none
  padding 16px 40px
  font-size 18px
  font-weight 600
  border-radius 50px
  cursor pointer
  transition all 0.3s ease
  box-shadow 0 8px 20px rgba(0, 0, 0, 0.15)
  display inline-flex
  align-items center
  gap 10px
  
  &:hover
    transform translateY(-2px)
    box-shadow 0 12px 30px rgba(0, 0, 0, 0.25)
    background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    color white
  
  &:active
    transform translateY(0)
  
  i
    font-size 16px

@keyframes slideIn
  from
    opacity 0
    transform translateY(-30px)
  to
    opacity 1
    transform translateY(0)
</style>


