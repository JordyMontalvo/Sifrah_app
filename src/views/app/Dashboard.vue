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

            <!-- Bottom Stats Row -->
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">Saldo Ganado</span>
                </div>
                <span class="stat-value">S/ {{ Number(ins + insVirtual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">Total de Personas</span>
                </div>
                <div class="stat-row-item">
                  <span class="stat-value">{{ n_affiliates || 0 }}</span>
                  <i class="fas fa-users pink-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Rango Diamante -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Rango Diamante</h3>
            </div>
            <div class="rank-progress">
              <div class="circular-progress">
                <div class="progress-circle">
                  <div class="progress-fill" :style="{ transform: `rotate(${75 * 4.6}deg)` }"></div>
                  <div class="progress-center">
                    <i class="fas fa-medal"></i>
                  </div>
                </div>
                <div class="progress-text">
                  <span class="progress-percentage">75%</span>
                  <span class="progress-label">Avance actual</span>
                  <span class="progress-subtitle">a 32% de subir a Segundo Diamante</span>
                </div>
              </div>
              <div class="rank-metrics">
                <div class="metric-card">
                  <i class="fas fa-user"></i>
                  <div class="metric-content">
                    <span class="metric-value">{{ points || 0 }}</span>
                    <span class="metric-label">Puntos Personales</span>
                    <div class="metric-progress">
                      <div class="progress-bar" style="width: 60%"></div>
                    </div>
                  </div>
                </div>
                <div class="metric-card dark">
                  <i class="fas fa-users"></i>
                  <div class="metric-content">
                    <span class="metric-value">{{ directs ? directs.length : 0 }}</span>
                    <span class="metric-label">Directos</span>
                    <div class="metric-progress">
                      <div class="progress-bar" style="width: 75%"></div>
                    </div>
                  </div>
                </div>
                <div class="metric-card">
                  <i class="fas fa-star"></i>
                  <div class="metric-content">
                    <span class="metric-value">{{ rank | _rank }}</span>
                    <span class="metric-label">Rango Actual</span>
                    <div class="metric-progress">
                      <div class="progress-bar" style="width: 45%"></div>
                    </div>
                  </div>
                </div>
                <div class="metric-card dark">
                  <i class="fas fa-users"></i>
                  <div class="metric-content">
                    <span class="metric-value">{{ total_points }}</span>
                    <span class="metric-label">Puntos Grupales</span>
                    <div class="metric-progress">
                      <div class="progress-bar" style="width: 80%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Row -->
        <div class="dashboard-row">
          <!-- Pack de Afiliación -->
          <div class="dashboard-section">
            <div class="affiliation-pack">
              <div class="pack-content">
                <h4>Pack de Afiliación</h4>
                <p v-if="userPlan && userPlan.name">{{ userPlan.name }}</p>
                <p v-else>{{ plan }}</p>
              </div>
              <div class="pack-icon">
                <img v-if="userPlan && userPlan.img" :src="userPlan.img" alt="Imagen del plan" style="width: 40px; height: 40px; border-radius: 50%; background: #fff; padding: 5px;" />
                <i v-else class="fas fa-medal"></i>
              </div>
            </div>
          </div>

          <!-- Comisiones -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Comisiones</h3>
              <p>Completa los porcentajes y ¡disfruta el viaje!</p>
            </div>
            <div class="commissions-grid">
              <div class="commission-card">
                <div class="commission-icon gold">
                  <i class="fas fa-medal"></i>
                </div>
                <div class="commission-content">
                  <span class="commission-value">{{ balance || 0 }}</span>
                  <span class="commission-label">Saldo Disponible</span>
                </div>
              </div>
              <div class="commission-card">
                <div class="commission-icon blue">
                  <i class="fas fa-medal"></i>
                </div>
                <div class="commission-content">
                  <span class="commission-value">{{ _balance || 0 }}</span>
                  <span class="commission-label">Saldo No Disponible</span>
                </div>
              </div>
              <div class="commission-card">
                <div class="commission-icon purple">
                  <i class="fas fa-medal"></i>
                </div>
                <div class="commission-content">
                  <span class="commission-value">{{ Number(ins + insVirtual).toFixed(2) }}</span>
                  <span class="commission-label">Total Ganado</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bono Viaje -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Bono Viaje</h3>
              <p>Estado y progreso del socio</p>
            </div>
            <div class="travel-bonus-info">
              <div class="travel-bonus-text">
                <p>{{ travelBonusText || 'Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="dashboard-row">
          <!-- Últimos Ingresos -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Últimos Ingresos</h3>
            </div>
            <div class="latest-incomes">
              <div v-if="directs && directs.length > 0" v-for="direct in directs.slice(0, 4)" :key="direct.id" class="income-item">
                <div class="income-avatar">
                  <img v-if="direct.photo" :src="direct.photo" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
                  <i v-else class="fas fa-user"></i>
                </div>
                <div class="income-content">
                  <span class="income-name">{{ direct.name }} {{ direct.lastName }}</span>
                  <span class="income-pack">{{ direct.plan || 'Usuario' }}</span>
                </div>
              </div>
              <div v-if="!directs || directs.length === 0" class="income-item">
                <div class="income-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="income-content">
                  <span class="income-name">No hay directos</span>
                  <span class="income-pack">Aún no tienes afiliados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comisiones Card -->
          <div class="dashboard-section">
            <div class="commissions-summary">
              <div class="summary-icon">
                <i class="fas fa-bullseye"></i>
              </div>
              <div class="summary-content">
                <span class="summary-value">{{ Number(ins + insVirtual).toFixed(2) }}</span>
                <span class="summary-label">Total Ganado</span>
              </div>
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
      plan: null ,
      total_points: null,
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
    plan() {
      if (this.$store.state.plan == "early") return "CLIENTE PREFERENTE";
      if (this.$store.state.plan == "basic") return "EJECUTIVO";
      if (this.$store.state.plan == "standard") return "DISTRIBUIDOR";
      if (this.$store.state.plan == "master") return "EMPRESARIO";
      return this.$store.state.plan;
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
      if (val == "none") return "Ninguno";
      if (val == "active") return "ACTIVO";
      if (val == "star") return "BRONCE";
      if (val == "silver") return "PLATA";
      if (val == "si") return "PLATINO";
      if (val == "gold") return "ORO";
      if (val == "sapphire") return "ZAFIRO";
      if (val == "ruby") return "RUBY";
      if (val == "emerald") return "ESMERALDA";
      if (val == "diamond") return "DIAMANTE";
      if (val == "master") return "MASTER";
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
    this.directs = data.directs || [];
    this.frontals = data.frontals || [];
    this.total_points = data.total_points;
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
