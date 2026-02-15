<template>
  <App :session="session" :title="title">
    <div v-cloak>
      <!-- Banner slider (mantener el existente) -->
      <div v-if="!loading && bannerImages.length > 0" class="banner-slider">
        <div class="slider-wrapper">
          <transition name="carousel-3d" mode="out-in">
            <div class="banner-slide" :key="currentBanner">
              <img :src="bannerImages[currentBanner]" class="banner-img" />
            </div>
          </transition>
          <button
            v-if="bannerImages.length > 1"
            class="nav left"
            @click="prevBanner"
          >
            &#8592;
          </button>
          <button
            v-if="bannerImages.length > 1"
            class="nav right"
            @click="nextBanner"
          >
            &#8594;
          </button>
        </div>
        <div v-if="bannerImages.length > 1" class="dots">
          <span
            v-for="(img, idx) in bannerImages"
            :key="'dot-' + idx"
            :class="['dot', { active: currentBanner === idx }]"
            @click="goToBanner(idx)"
          ></span>
        </div>
      </div>
      <div v-else-if="!loading" class="no-banners-msg">
        <p>No hay banners para mostrar.</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
      
      <SkeletonLoader
        v-if="loading"
        :lines="6"
        width="100%"
        height="60px"
        style="margin: 24px 0"
      />

      <!-- Nuevo Dashboard Design -->
      <div v-else class="dashboard-container">
        <!-- Top Row -->
        <div class="dashboard-row">
          <!-- Nivel Actual Rediseñado -->
          <div class="dashboard-section nivel-actual-section">
            
            <!-- Shortcuts Row -->
            <div class="shortcuts-row">
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-graduation-cap"></i></div>
                <span>Educación</span>
              </router-link>
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-headphones"></i></div>
                <span>Audios</span>
              </router-link>
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-book"></i></div>
                <span>Libros</span>
              </router-link>
              <router-link to="/flyer-editor" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-bullhorn rotate-icon"></i></div>
                <span>Flyers</span>
              </router-link>
              <a href="https://www.youtube.com/playlist?list=PLWYJViqkAe6HpJyjfc1vw01o5lThSUulM" target="_blank" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-quote-left"></i></div>
                <span>Testimonios</span>
              </a>
            </div>

            <!-- Max Rank Banner -->
            <div class="max-rank-banner">
              <div class="banner-info">
                <span class="banner-title">Rango Máximo Alcanzado</span>
                <span class="banner-rank">{{ rank | _rank }}</span>
              </div>
              <div class="rank-badge">
                <i class="fas fa-gem gem-icon"></i>
                <span class="sparkle s1"></span>
                <span class="sparkle s2"></span>
                <span class="sparkle s3"></span>
                <span class="sparkle s4"></span>
              </div>
            </div>

            <!-- Bottom Stats Row (Keeping for reference as requested, but maybe user wanted to replace them? I will keep them but focus the 8 new cards below) -->
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">Saldo Ganado</span>
                </div>
                <span class="stat-value">S/ {{ Number(ins + insVirtual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">Total de Personas</span>
                </div>
                <div class="stat-row-item">
                  <span class="stat-value">{{ n_affiliates_total || 0 }}</span>
                </div>
                <div class="stat-icon"><i class="fas fa-users"></i></div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Info Cards Grid (8 Cards) -->
        <div class="new-dashboard-grid">
          <!-- 1. Próximo Rango -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-chart-line"></i></div>
            <div class="info-content">
              <span class="info-title">Próximo Rango</span>
              <span class="info-value">{{ provisionalRank | _rank }}</span>
              <div class="progress-container">
                <div class="progress-bar-new" :style="{ width: nextRankPercentage + '%' }"></div>
              </div>
              <span class="info-subtitle">{{ nextRankPercentage }}% para alcanzar {{ nextRankName | _rank }}</span>
            </div>
          </div>

          <!-- 2. Saldo disponible -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-wallet"></i></div>
            <div class="info-content">
              <span class="info-title">Saldo Disponible</span>
              <span class="info-value">S/ {{ (balance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <!-- 3. Total Ganado -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-dollar-sign"></i></div>
            <div class="info-content">
              <span class="info-title">Total Ganado</span>
              <span class="info-value">S/ {{ Number(ins + insVirtual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <!-- 4. Rango Cerrado -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-award"></i></div>
            <div class="info-content">
              <span class="info-title">Rango Cerrado</span>
              <span class="info-value">{{ rank | _rank }}</span>
            </div>
          </div>

          <!-- 5. Personas en tu Red -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-network-wired"></i></div>
            <div class="info-content">
              <span class="info-title">Personas en tu Red</span>
              <span class="info-value">{{ n_affiliates_total || 0 }}</span>
              <span class="info-subtitle">Cantidad de personas en tu red</span>
            </div>
          </div>

          <!-- 6. Saldo no disponible -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-lock"></i></div>
            <div class="info-content">
              <span class="info-title">Saldo No Disponible</span>
              <span class="info-value">S/ {{ (_balance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <!-- 7. Pack afiliación -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-box-open"></i></div>
            <div class="info-content">
              <span class="info-title">Pack Afiliación</span>
              <span class="info-value">{{ formattedPlan }}</span>
            </div>
          </div>

          <!-- 8. Total de puntos grupales -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-star"></i></div>
            <div class="info-content">
              <span class="info-title">Total de Puntos Grupales</span>
              <span class="info-value">{{ total_points || 0 }}</span>
            </div>
          </div>

          <!-- 9. Bono Ahorro -->
          <div class="info-card">
            <div class="info-icon"><i class="fas fa-piggy-bank"></i></div>
            <div class="info-content">
              <span class="info-title">Bono Ahorro</span>
              <span class="info-value">S/ 0.00</span>
              <span class="info-subtitle">Saldo Canjeable</span>
            </div>
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
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  components: {
    App,
    Spinner,
    SkeletonLoader,
  },
  data() {
    return {
      banner: { img: null },
      ins: null,
      outs: null,
      balance: null,
      _balance: null,
      team: null,
      rank: "",
      points: null,
      directs: [],
      frontals: [],
      loading: true,
      plans: null,
      total_points: null,
      n_affiliates_total: 0,
      nextRankName: "",
      nextRankPercentage: 0,
      provisionalRank: "",
      travelBonusText: null,

      op: 1,
      op2: 0,
      op3: 0,
      node: {},
      currentBanner: 0,
      bannerInterval: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    formattedPlan() {
      const p = this.$store.state.plan || this.plan;
      if (!p || p === 'none') return "Ninguno";
      const v = p.toLowerCase();
      if (v == "early") return "Cliente preferente";
      if (v == "basic") return "Ejecutivo";
      if (v == "standard") return "Distribuidor";
      if (v == "business") return "Empresarial";
      if (v == "master") return "Empresario";
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    },
    userPlan() {
      if (!this.plans) return null;
      // Buscar por nombre o id según corresponda
      return this.plans.find(p => p.name === this.plan || p.id === this.plan);
    },
    title() {
      return "Dashboard";
    },
    bannerImages() {
      return [this.banner.img, this.banner.img2, this.banner.img3].filter(
        (img) => typeof img === "string" && img.trim() !== ""
      );
    },
  },
  filters: {
    _rank(val) {
      if (!val) return "Ninguno";
      const v = val.toLowerCase();
      let result = "";
      if (v == "none") result = "Ninguno";
      else if (v == "active") result = "Activo";
      else if (v == "star") result = "Bronce";
      else if (v == "master") result = "Master";
      else if (v == "silver") result = "Plata";
      else if (v == "si") result = "Platino";
      else if (v == "gold") result = "Oro";
      else if (v == "sapphire") result = "Zafiro";
      else if (v == "rubi" || v == "ruby") result = "Ruby";
      else if (v == "emerald") result = "Esmeralda";
      else if (v == "diamond" || v == "diamante") result = "Diamante";
      else if (v.includes("doble diamante")) result = "Doble diamante";
      else if (v.includes("triple diamante")) result = "Triple diamante";
      else if (v.includes("diamante estrella")) result = "Diamante estrella";
      else result = v;

      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    },
  },
  methods: {
    nextBanner() {
      this.currentBanner = (this.currentBanner + 1) % this.bannerImages.length;
    },
    prevBanner() {
      this.currentBanner =
        (this.currentBanner - 1 + this.bannerImages.length) %
        this.bannerImages.length;
    },
    goToBanner(idx) {
      this.currentBanner = idx;
    },
    setupBannerAutoplay() {
      // Reiniciar cualquier intervalo previo
      if (this.bannerInterval) {
        clearInterval(this.bannerInterval);
        this.bannerInterval = null;
      }
      // Iniciar autoplay solo si hay más de una imagen
      if (this.bannerImages.length > 1) {
        this.bannerInterval = setInterval(() => {
          // Proteger contra longitud 0
          if (this.bannerImages.length > 0) {
            this.nextBanner();
          }
        }, 5000);
      }
    },
  },
  async created() {
    // GET data
    const { data } = await api.dashboard(this.session);
    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session") {
      this.$router.push("/login");
      return;
    }

    // success - actualizar store
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.$store.commit("SET_EMAIL", data.email);
    this.$store.commit("SET_TOKEN", data.token);
    this.$store.commit("SET_TOTAL_POINTS", data.total_points);

    // Verificar afiliación
    if (!data.affiliated) {
      this.$router.push("/affiliation");
      return;
    }

    // Cargar datos del dashboard
    this.banner = data.banner;
    this.ins = data.ins;
    this.insVirtual = data.insVirtual;
    this.outs = data.outs ? data.outs.toFixed(2) : "0.00";
    this.balance = data.balance ? data.balance.toFixed(2) : "0.00";
    this._balance = data._balance ? data._balance.toFixed(2) : "0.00";
    this.team = data.team;
    this.rank = data.rank || "";
    this.points = data.points;
    this.node = data.node || {};
    this.n_affiliates = data.n_affiliates;
    this.n_affiliates_total = data.n_affiliates_total || 0;
    this.directs = data.directs || [];
    this.frontals = data.frontals || [];
    this.total_points = data.total_points;
    this.nextRankName = data.nextRankName || "";
    this.nextRankPercentage = data.nextRankPercentage || 0;
    this.provisionalRank = data.provisionalRank || "none";
    this.travelBonusText = data.travelBonusText || 'Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!';

    // Iniciar autoplay del banner si corresponde
    this.setupBannerAutoplay();
  },
  beforeDestroy() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  },
};
</script>

<style scoped src="../../assets/style/views/app/Dashboard.css"></style>
