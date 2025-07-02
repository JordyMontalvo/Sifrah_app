<template>
  <App :session="session" :title="title">
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
    <br />

    <h4>INICIO</h4>

    <Spinner v-if="loading" :size="48" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="6"
      width="100%"
      height="60px"
      style="margin: 24px 0"
    />

    <transition-group
      name="card-fade"
      tag="div"
      class="boxes masonry"
      v-if="!loading"
    >
      <div class="box blue" title="Saldo disponible para usar" key="saldo">
        <i class="fas fa-wallet"></i>
        <div>
          <p>S/. {{ balance }}</p>
          <span>SALDO</span>
          <div class="progress-bar">
            <div
              class="progress"
              :style="{ width: (balance / 1000) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <div
        class="box green"
        title="Saldo aún no disponible"
        key="saldo-no-disponible"
      >
        <i class="fas fa-hand-holding-usd"></i>
        <div>
          <p>S/. {{ _balance }}</p>
          <span>SALDO NO DISPONIBLE</span>
        </div>
      </div>
      <div
        class="box green"
        title="Total ganado (incluye virtual)"
        key="total-ganado"
      >
        <i class="fas fa-hand-holding-usd"></i>
        <div>
          <p>S/. {{ Number(ins + insVirtual).toFixed(2) }}</p>
          <span>TOTAL GANADO</span>
        </div>
      </div>
      <div class="box gold" title="Tus puntos acumulados" key="puntos">
        <i class="fas fa-medal"></i>
        <div>
          <p>{{ points }}</p>
          <span>PUNTOS</span>
        </div>
      </div>
      <div
        class="box purple"
        v-if="plan && plan !== ''"
        title="Tu paquete de afiliación"
        key="paquete"
      >
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ plan }}</p>
          <span>PAQUETE DE AFILIACIÓN</span>
        </div>
      </div>
      <div
        class="box purple"
        v-if="rank && rank !== ''"
        title="Rango cerrado actual"
        key="rango-cerrado"
      >
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ rank | _rank }}</p>
          <span>RANGO CERRADO</span>
        </div>
      </div>
      <div
        class="box orange"
        v-if="directs && Array.isArray(directs)"
        title="Cantidad de directos"
        key="directos"
      >
        <i class="fas fa-user-shield"></i>
        <div>
          <p>{{ directs.length }}</p>
          <span>DIRECTOS</span>
        </div>
      </div>
      <div
        class="box purple"
        v-if="node && node.rank"
        title="Rango actual"
        key="rango-actual"
      >
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ node.rank | _rank }}</p>
          <span>RANGO ACTUAL</span>
        </div>
      </div>
      <div
        class="box pink"
        v-if="node && node.next_rank && node.next_rank.name"
        title="Siguiente rango"
        key="siguiente-rango"
      >
        <i class="fa fa-tachometer"></i>
        <div>
          <p>{{ node.next_rank.name | _rank }}</p>
          <span>SIGUIENTE RANGO</span>
        </div>
      </div>
    </transition-group>
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
      if (val == "star") return "MASTER";
      if (val == "master") return "PLATA";
      if (val == "silver") return "PLATINO";
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
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-auto-rows: 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
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
