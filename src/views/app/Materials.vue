<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading" class="materials-wrapper">
      <div class="header-section">
        <h2>Herramientas</h2>
        <p>Recursos útiles para el negocio</p>
      </div>

      <div class="materials-grid">
        <div 
          v-for="(item, index) in materials" 
          :key="index" 
          class="material-card"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.title">
          </div>
          <div class="card-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
          <div class="card-action">
            <a :href="item.link" target="_blank" class="btn-ver">Ver</a>
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
      materials: []
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
        // Fetch user state
        const { data: userData } = await api.tools(this.session); 

        // error
        if (userData.error && userData.msg == "invalid session")
          this.$router.push("/login");
        if (userData.error && userData.msg == "unverified user")
          this.$router.push("/verify");

        // success
        this.$store.commit("SET_NAME", userData.name);
        this.$store.commit("SET_LAST_NAME", userData.lastName);
        this.$store.commit("SET_AFFILIATED", userData.affiliated);
        this.$store.commit("SET_ACTIVATED", userData.activated);
        this.$store.commit("SET__ACTIVATED", userData._activated);
        this.$store.commit("SET_PLAN", userData.plan);
        this.$store.commit("SET_COUNTRY", userData.country);
        this.$store.commit("SET_PHOTO", userData.photo);
        this.$store.commit("SET_TREE", userData.tree);

        // Fetch dynamic materials
        const { data: materialsData } = await api.Materials.GET();
        this.materials = materialsData.materials;

        this.loading = false;
    } catch (e) {
        this.loading = false;
        console.error(e);
    }
  },
};
</script>

<style lang="stylus" scoped>
.materials-wrapper
  padding 20px
  max-width 1200px
  margin 0 auto
  width 100%

.header-section
  margin-bottom 30px
  h2
    font-size 28px
    font-weight bold
    color #000
    margin-bottom 5px
  p
    font-size 16px
    color #666

.materials-grid
  display grid
  grid-template-columns repeat(auto-fill, minmax(400px, 1fr))
  gap 20px

.material-card
  background white
  border-radius 12px
  padding 20px
  display flex
  align-items center
  box-shadow 0 4px 6px rgba(0,0,0,0.05)
  transition transform 0.2s ease, box-shadow 0.2s ease
  border 1px solid #eee
  
  &:hover
    transform translateY(-2px)
    box-shadow 0 6px 12px rgba(0,0,0,0.1)

.card-image
  width 80px
  height 80px
  flex-shrink 0
  margin-right 20px
  border-radius 8px
  overflow hidden
  background #f5f5f5
  display flex
  align-items center
  justify-content center
  
  img
    width 100%
    height 100%
    object-fit cover

.card-content
  flex 1
  margin-right 20px
  
  h3
    font-size 18px
    font-weight bold
    color #000
    margin-bottom 5px
    line-height 1.2
    
  p
    font-size 14px
    color #666
    line-height 1.4

.card-action
  flex-shrink 0

.btn-ver
  background #e91d76
  color white
  border none
  padding 8px 24px
  border-radius 6px
  font-weight bold
  cursor pointer
  text-decoration none
  display inline-block
  font-size 14px
  transition background 0.2s
  
  &:hover
    background #c61563

@media (max-width: 768px)
  .materials-grid
    grid-template-columns 1fr
  
  .material-card
    padding 22px
    
  .card-image
    width 60px
    height 60px
    margin-right 12px
    
  .card-content
    margin-right 10px
    h3
      font-size 16px
    p
      font-size 13px

  .btn-ver
    padding 6px 16px
    font-size 13px

</style>
