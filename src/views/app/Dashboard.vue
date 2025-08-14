<template>
  <App :session="session" :title="title">
    <!-- Banner slider (mantener el existente) -->
    <div v-if="bannerImages.length > 0" class="banner-slider">
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
    <div v-else class="no-banners-msg">
      <p>No hay banners para mostrar.</p>
    </div>

    <Spinner v-if="loading" :size="48" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="6"
      width="100%"
      height="60px"
      style="margin: 24px 0"
    />

    <!-- Nuevo Dashboard Design -->
    <div v-if="!loading" class="dashboard-container">
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
              <h4>{{ plan }}</h4>
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
                <span class="metric-value">{{ node && node.total_points ? node.total_points : 0 }}</span>
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
                <div class="progress-fill" :style="{ transform: `rotate(${68 * 3.6}deg)` }"></div>
                <div class="progress-center">
                  <i class="fas fa-medal"></i>
                </div>
              </div>
              <div class="progress-text">
                <span class="progress-percentage">68%</span>
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
                  <span class="metric-value">{{ node && node.total_points ? node.total_points : 0 }}</span>
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
  },
  async created() {
    // GET data
    const { data } = await api.dashboard(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");

    // success
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

    this.plans = data.plans.map((a) => ({ ...a, total: 0 }));
    this.plan = data.plan;

    const time = 4000;
    let i = 0;
    const n = 3;

    setInterval(() => {
      i += 1;
      console.log(i);

      if (i == 0) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op = 1;
      }

      if (i == 1) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op2 = 1;
      }

      if (i == 2) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op3 = 1;
      }

      if (i == n - 1) i = -1;
    }, time);

    // Slider automático
    if (this.bannerInterval) clearInterval(this.bannerInterval);
    this.bannerInterval = setInterval(() => {
      if (this.bannerImages.length > 1) this.nextBanner();
    }, 4000);
  },
  beforeUnmount() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  },
};
</script>

<style scoped>
/* Nuevo Dashboard Styles */
.dashboard-container {
  background: #f5f2e9;
  min-height: 100vh;
  padding: 20px;
}

.dashboard-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  color: #4a4a4a;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.section-header p {
  color: #888;
  font-size: 14px;
  margin: 0;
}

/* Nivel Actual */
.level-card {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  border-radius: 12px;
  color: white;
}

.level-icon {
  margin-right: 20px;
}

.medal-icon {
  position: relative;
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal-icon i {
  font-size: 24px;
  color: white;
}

.medal-text {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: bold;
  background: white;
  color: #f7971e;
  padding: 2px 6px;
  border-radius: 4px;
}

.level-info h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.metric-card.dark {
  background: #28a745;
  color: white;
}

.metric-card i {
  font-size: 20px;
  margin-right: 12px;
  color: #28a745;
}

.metric-card.dark i {
  color: white;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.metric-card.dark .metric-value {
  color: white;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.metric-card.dark .metric-label {
  color: rgba(255,255,255,0.8);
}

.metric-progress {
  margin-top: 8px;
  height: 4px;
  background: rgba(0,0,0,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.metric-card.dark .metric-progress {
  background: rgba(255,255,255,0.2);
}

.progress-bar {
  height: 100%;
  background: #28a745;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Rango Diamante */
.rank-progress {
  display: flex;
  gap: 20px;
}

.circular-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(#28a745 0deg 245deg, #e9ecef 245deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-center {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-center i {
  font-size: 20px;
  color: #28a745;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
}

.progress-percentage {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #28a745;
}

.progress-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.progress-subtitle {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 4px;
}

.rank-metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Pack de Afiliación */
.affiliation-pack {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #28a745;
  border-radius: 12px;
  color: white;
}

.pack-content h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.pack-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.pack-icon i {
  font-size: 40px;
  color: #ffd200;
}

/* Comisiones */
.commissions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.commission-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.commission-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.commission-icon.gold {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
}

.commission-icon.blue {
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
}

.commission-icon.purple {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.commission-icon i {
  font-size: 20px;
  color: white;
}

.commission-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.commission-label {
  font-size: 12px;
  color: #666;
}

/* Bono Viaje */
.travel-bonus {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.travel-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.travel-circle {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(#28a745 0deg 54deg, #e9ecef 54deg 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.travel-circle .orange {
  background: conic-gradient(#ff512f 0deg 166deg, #e9ecef 166deg 360deg);
}

.travel-center {
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.travel-percentage {
  font-size: 14px;
  font-weight: bold;
  color: #28a745;
}

.travel-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* Últimos Ingresos */
.latest-incomes {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.income-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.income-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #28a745;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.income-avatar i {
  font-size: 16px;
  color: white;
}

.income-content {
  display: flex;
  flex-direction: column;
}

.income-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.income-pack {
  font-size: 12px;
  color: #666;
}

/* Comisiones Summary */
.commissions-summary {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #28a745;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.summary-icon i {
  font-size: 20px;
  color: white;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-row {
    grid-template-columns: 1fr;
  }
  
  .rank-progress {
    flex-direction: column;
  }
  
  .commissions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .travel-bonus {
    flex-direction: column;
    align-items: center;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .rank-metrics {
    grid-template-columns: 1fr;
  }
}
.box {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1.5px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  min-height: 120px;
  margin: 0;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.box.blue {
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
}
.box.green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
.box.gold {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
}
.box.purple {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}
.box.orange {
  background: linear-gradient(135deg, #ff512f 0%, #f09819 100%);
}
.box.pink {
  background: linear-gradient(135deg, #f953c6 0%, #b91d73 100%);
}
.box:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 3px 8px rgba(0, 0, 0, 0.09),
    0 0 16px #21cbf3;
}
.box i {
  font-size: 2.5rem;
  margin-right: 1.2rem;
  transition: color 0.2s, transform 0.2s;
}
.box:hover i {
  animation: bounce 0.5s;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.2) rotate(-10deg);
  }
  50% {
    transform: scale(0.95) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}
.box p {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0;
}
.box span {
  font-size: 1rem;
  color: #f3f3f3;
}
.progress-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  height: 8px;
  margin-top: 8px;
  width: 100%;
  overflow: hidden;
}
.progress {
  background: #fff;
  height: 100%;
  border-radius: 8px;
  transition: width 0.4s;
}
.card-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.card-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.card-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.banner-slider {
  position: relative;
  width: 100%;
  max-width: 850px;
  margin: 0 auto 24px auto;
}
.slider-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}
.banner-slide {
  width: 100%;
  height: 260px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}
.banner-img {
  width: 100%;
  height: 260px;
  border-radius: 16px;
}
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}
.nav.left {
  left: 12px;
}
.nav.right {
  right: 12px;
}
.nav:hover {
  background: rgba(0, 0, 0, 0.6);
}
.dots {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  gap: 8px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #bbb;
  cursor: pointer;
  transition: background 0.2s;
}
.dot.active {
  background: #2196f3;
}
@media (max-width: 600px) {
  .banner-slide,
  .banner-img {
    height: 140px;
  }
}
.no-banners-msg {
  text-align: center;
  color: #888;
  margin: 24px 0;
  font-size: 1.2rem;
}
/* Animación tipo carousel 3D para el banner */
.carousel-3d-enter-active,
.carousel-3d-leave-active {
  transition: opacity 1s cubic-bezier(0.4, 1.2, 0.6, 1),
    transform 1s cubic-bezier(0.4, 1.2, 0.6, 1),
    filter 1s cubic-bezier(0.4, 1.2, 0.6, 1);
}
.carousel-3d-enter-from {
  opacity: 0;
  transform: perspective(800px) translateX(80px) scale(0.92) rotateY(30deg);
  filter: blur(8px) brightness(1.2);
}
.carousel-3d-leave-to {
  opacity: 0;
  transform: perspective(800px) translateX(-80px) scale(0.92) rotateY(-30deg);
  filter: blur(8px) brightness(1.2);
}
.carousel-3d-enter-to,
.carousel-3d-leave-from {
  opacity: 1;
  transform: perspective(800px) translateX(0) scale(1) rotateY(0);
  filter: blur(0) brightness(1);
}
</style>
