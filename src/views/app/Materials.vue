<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading" class="materials-container">
      <div class="materials-card">
        <div class="icon-container">
          <i class="fas fa-folder-open"></i>
        </div>
        <h2>Kit de Materiales Sifrah</h2>
        <p class="description">
          Accede a nuestros materiales de marketing, videos de YouTube,
          enlaces de WhatsApp y más recursos para tu negocio.
        </p>
        
        <button @click="openMaterials" class="open-button">
          <i class="fas fa-external-link-alt"></i>
          Abrir Materiales
        </button>
        
        <p class="note">
          <i class="fas fa-info-circle"></i>
          Se abrirá en una nueva pestaña para mejor visualización
        </p>
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
      window.open('https://beacons.ai/sifrahcorp/mediakit', '_blank', 'noopener,noreferrer');
    },
  },
};
</script>

<style lang="stylus" scoped>
.materials-container
  display flex
  justify-content center
  align-items center
  min-height calc(100vh - 200px)
  padding 20px

.materials-card
  background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  border-radius 20px
  padding 60px 40px
  text-align center
  max-width 500px
  width 100%
  box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)
  color white
  transition transform 0.3s ease, box-shadow 0.3s ease
  
  &:hover
    transform translateY(-5px)
    box-shadow 0 25px 70px rgba(0, 0, 0, 0.4)

.icon-container
  background rgba(255, 255, 255, 0.2)
  width 100px
  height 100px
  border-radius 50%
  display flex
  align-items center
  justify-content center
  margin 0 auto 30px
  backdrop-filter blur(10px)
  
  i
    font-size 48px
    color white

h2
  font-size 32px
  font-weight 700
  margin 0 0 20px 0
  color white

.description
  font-size 16px
  line-height 1.6
  margin-bottom 30px
  opacity 0.95
  color white

.open-button
  background white
  color #667eea
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
  margin-bottom 20px
  
  &:hover
    transform translateY(-2px)
    box-shadow 0 12px 30px rgba(0, 0, 0, 0.25)
    background linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
    color white
  
  &:active
    transform translateY(0)
  
  i
    font-size 16px

.note
  font-size 14px
  opacity 0.9
  color rgba(255, 255, 255, 0.9)
  display flex
  align-items center
  justify-content center
  gap 8px
  
  i
    font-size 16px
</style>

