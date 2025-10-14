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
          <!-- Nivel Actual -->
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Nivel Actual</h3>
            </div>
            <div class="level-card">
              <div class="level-icon">
                <div class="medal-icon">
                  <i class="fas fa-gem"></i>
                  <span class="medal-text">{{ rank | _rank }}</span>
                </div>
              </div>
              <div class="level-info">
                <!-- <h4>{{ plan }}</h4> -->
              </div>
            </div>
            <div class="metrics-grid">
              <div class="metric-card">
                <i class="fas fa-user"></i>
                <div class="metric-content">
                  <span class="metric-value">{{ points || 0 }}</span>
                  <span class="metric-label">Puntos Personales</span>
                </div>
              </div>
              <div class="metric-card">
                <i class="fas fa-users"></i>
                <div class="metric-content">
                  <span class="metric-value">{{ directs ? directs.length : 0 }}</span>
                  <span class="metric-label">Directos</span>
                </div>
              </div>
              <div class="metric-card">
                <i class="fas fa-star"></i>
                <div class="metric-content">
                  <span class="metric-value">{{ rank | _rank }}</span>
                  <span class="metric-label">Rango Actual</span>
                </div>
              </div>
              <div class="metric-card">
                <i class="fas fa-users"></i>
                <div class="metric-content">
                  <span class="metric-value">{{ total_points }}</span>
                  <span class="metric-label">Puntos Grupales</span>
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
              <p>Completa los porcentajes y ¡disfruta el viaje!</p>
            </div>
            <div class="travel-bonus">
              <div class="travel-progress">
                <div class="travel-circle">
                  <div class="travel-fill" :style="{ transform: `rotate(${15 * 3.6}deg)` }"></div>
                  <div class="travel-center">
                    <span class="travel-percentage">15%</span>
                  </div>
                </div>
                <span class="travel-label">Internacional</span>
              </div>
              <div class="travel-progress">
                <div class="travel-circle">
                  <div class="travel-fill orange" :style="{ transform: `rotate(${46 * 3.6}deg)` }"></div>
                  <div class="travel-center">
                    <span class="travel-percentage">46%</span>
                  </div>
                </div>
                <span class="travel-label">Nacional</span>
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

    // Iniciar autoplay del banner si corresponde
    this.setupBannerAutoplay();
  },
  beforeDestroy() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  },
};
</script>

<style scoped src="../../assets/style/views/app/Dashboard.css"></style>
