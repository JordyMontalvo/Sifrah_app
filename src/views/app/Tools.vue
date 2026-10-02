<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#e91e63'" />

    <div v-else class="uni">
      <div v-if="detailOpen && activeModule" class="detail">
        <button type="button" class="detail-back" @click="closeDetail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <polyline points="15 6 9 12 15 18" />
          </svg>
          {{ activeModule.badge }}
        </button>

        <div class="detail-hero" :class="'theme-' + activeModule.theme">
          <span class="pill">{{ activeModule.badge }}</span>
          <h2>{{ activeModule.title }}</h2>
          <p>{{ activeModule.lead }}</p>
        </div>

        <section class="progress-card">
          <div class="progress-copy">
            <strong>Tu progreso en este módulo</strong>
            <span>{{ doneCount(activeModule) }} de {{ activeModule.videos.length }} clases completadas</span>
          </div>
          <div class="progress detail-progress">
            <span class="progress-track"><span class="progress-fill" :style="{ width: progressPct(activeModule) + '%' }"></span></span>
            <span class="progress-pct">{{ progressPct(activeModule) }}%</span>
          </div>
        </section>

        <div class="detail-layout">
          <section class="lessons">
            <div class="block-head">
              <h3>Clases del módulo</h3>
              <span class="count-label">{{ activeModule.videos.length }} clases</span>
            </div>
            <article
              v-for="(video, index) in activeModule.videos"
              :key="video.id || video.title || index"
              class="lesson"
              :class="statusOf(video, index)"
              @click="playLesson(video, activeModule)"
              style="cursor: pointer;"
            >
              <span class="lesson-thumb" :class="'theme-' + (video.theme || activeModule.theme)">
                <img v-if="video.thumbnail" :src="video.thumbnail" class="thumb-img-cover" alt="" />
                <span class="play-btn"></span>
                <span class="duration">{{ video.duration }}</span>
              </span>
              <span class="lesson-body">
                <span class="lesson-no">{{ pad(index + 1) }}.</span>
                <strong>{{ video.title }}</strong>
                <span class="lesson-desc">{{ video.desc || "Clase de este módulo." }}</span>
              </span>
              <span class="lesson-state">
                <span class="state-ico" :class="statusOf(video, index)">
                  <svg v-if="statusOf(video, index) === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">
                    <polyline points="5 12 10 17 19 7" />
                  </svg>
                  <span v-else class="play-mini"></span>
                </span>
                <span class="state-label">{{ statusLabel(statusOf(video, index)) }}</span>
              </span>
            </article>
          </section>

          <section class="materials">
            <div class="block-head">
              <h3>Material complementario</h3>
              <span class="count-label">{{ (activeModule.files || []).length }} archivos</span>
            </div>
            <a
              v-for="file in (activeModule.files || [])"
              :key="file.name"
              :href="file.url || '#'"
              :target="file.url ? '_blank' : '_self'"
              class="file-row"
              style="text-decoration: none; color: inherit;"
            >
              <span class="file-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z" />
                  <path d="M14 3.5V9h5.5" />
                </svg>
              </span>
              <span class="file-copy">
                <strong>{{ file.name }}</strong>
                <span>{{ file.meta }}</span>
              </span>
              <span class="file-down" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 4v11" />
                  <path d="M7 11l5 5 5-5" />
                  <path d="M5 19h14" />
                </svg>
              </span>
            </a>
          </section>
        </div>
      </div>

      <template v-else>
      <header class="uni-top">
        <div class="uni-top-copy">
          <h1>Universidad SIFRAH</h1>
          <p>Aprende, aplica y avanza en tu negocio.</p>
        </div>
        <button
          type="button"
          class="uni-search-btn"
          :class="{ on: searchOpen }"
          aria-label="Buscar"
          @click="toggleSearch"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.5" y2="16.5" />
          </svg>
        </button>
      </header>

      <div v-if="searchOpen" class="uni-search">
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          placeholder="Buscar módulo o video"
          @keydown.esc="clearSearch"
        />
        <button v-if="query" type="button" class="uni-search-clear" @click="query = ''">Limpiar</button>
      </div>

      <section
        v-if="!query"
        class="hero"
        :class="'theme-' + currentSlide.theme"
        @touchstart.passive="onHeroStart"
        @touchend="onHeroEnd"
      >
        <div class="hero-sky" aria-hidden="true">
          <span v-if="currentSlide.theme === 'sunset'" class="hero-sun"></span>
          <span class="hero-mark">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="32" cy="22" r="7" />
              <path d="M32 29c8 2 14 8 16 16" />
              <path d="M22 48c2-8 6-14 10-17" />
              <path d="M46 18l4-8M50 22l8-2" />
            </svg>
          </span>
          <svg v-if="currentSlide.theme === 'sunset'" class="hero-person" viewBox="0 0 160 180" aria-hidden="true">
            <ellipse cx="80" cy="168" rx="46" ry="8" fill="rgba(0,0,0,.18)" />
            <path d="M58 78c8-18 36-18 44 0l8 28-14 6-6-16-8 34h-16l-8-34-6 16-14-6 8-28z" fill="#2b211c" />
            <circle cx="80" cy="58" r="16" fill="#3a2a24" />
            <path d="M52 96h56l-4 22H62l-6-22z" fill="#1f2933" />
            <path d="M48 100c-10 4-16 14-14 24l16-6 4-18h-6z" fill="#111827" />
            <path d="M112 100c10 4 16 14 14 24l-16-6-4-18h6z" fill="#111827" />
          </svg>
        </div>
        <div class="hero-copy">
          <span class="hero-kicker">{{ currentSlide.kicker }}</span>
          <h2>{{ currentSlide.title }}</h2>
          <p>{{ currentSlide.text }}</p>
          <button type="button" class="hero-cta" @click="onSlideCta">
            <span class="play-ico"></span>
            {{ currentSlide.cta }}
          </button>
        </div>
        <div class="hero-dots">
          <button
            v-for="(slide, index) in slides"
            :key="slide.title"
            type="button"
            :class="{ on: index === slideIndex }"
            :aria-label="'Diapositiva ' + (index + 1)"
            @click="goSlide(index)"
          />
        </div>
      </section>

      <button v-if="!query && continueModule && continueVideo" type="button" class="continue" @click="playLesson(continueVideo, continueModule)">
        <span class="continue-kicker">Continúa aprendiendo</span>
        <span class="continue-body">
          <span class="thumb theme-speaker">
            <img v-if="continueVideo.thumbnail" :src="continueVideo.thumbnail" class="thumb-img-cover" alt="" />
            <span class="play-btn"></span>
            <span class="duration">{{ continueVideo.duration }}</span>
          </span>
          <span class="continue-info">
            <span class="continue-mod">{{ continueModule.badge }}</span>
            <strong>{{ continueModule.title }}</strong>
            <span class="continue-meta">Video {{ continueIndex + 1 }} de {{ (continueModule.videos || []).length }} · {{ continueVideo.title }}</span>
            <span class="progress">
              <span class="progress-track"><span class="progress-fill" style="width: 35%"></span></span>
              <span class="progress-pct">35%</span>
            </span>
          </span>
          <svg class="continue-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </button>

      <section v-if="filteredModules.length" class="block">
        <div class="block-head">
          <h3>Empieza por aquí</h3>
          <button v-if="!isDesktop" type="button" class="see-all" @click="modulesExpanded = !modulesExpanded">
            {{ modulesExpanded ? "Ver menos" : "Ver todos" }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
        <div class="scroller modules" :class="{ 'is-expanded': modulesExpanded || isDesktop }">
          <button
            v-for="mod in filteredModules"
            :key="mod.id"
            type="button"
            class="mod-card"
            @click="openModule(mod)"
          >
            <span class="mod-art" :class="'theme-' + mod.theme">
              <span class="pill">{{ mod.badge }}</span>
              <span class="mod-count">{{ mod.videos.length }} videos</span>
            </span>
            <span class="mod-title">{{ mod.title }}</span>
          </button>
        </div>
      </section>

      <section
        v-for="mod in filteredModules"
        :key="'row-' + mod.id"
        :ref="'mod-' + mod.id"
        class="block"
        v-show="videosFor(mod).length"
      >
        <div class="block-head">
          <h3>{{ mod.title }} · {{ mod.badge }}</h3>
          <button
            v-if="mod.videos.length > (isDesktop ? 4 : 2)"
            type="button"
            class="see-all"
            @click="toggleRow(mod.id)"
          >
            {{ expandedRows[mod.id] ? "Ver menos" : "Ver todos" }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
        <div class="scroller videos" :class="{ 'is-expanded': expandedRows[mod.id || mod.badge] || isDesktop }">
          <button
            v-for="(video, index) in shownVideos(mod)"
            :key="(mod.id || mod.badge) + '-' + index"
            type="button"
            class="vid-card"
            @click="playLesson(video, mod)"
          >
            <span class="vid-art" :class="'theme-' + (video.theme || mod.theme)">
              <img v-if="video.thumbnail" :src="video.thumbnail" class="thumb-img-cover" alt="" />
              <span class="play-btn"></span>
              <span class="duration">{{ video.duration }}</span>
            </span>
            <span class="vid-title">{{ index + 1 }}. {{ video.title }}</span>
          </button>
        </div>
      </section>

      <p v-if="query && !filteredModules.length" class="empty">Sin resultados para «{{ query }}».</p>
      </template>

      <!-- Video Player Modal -->
      <div v-if="playerOpen && activeVideo" class="player" @click.self="closePlayer">
        <div class="player-card">
          <button type="button" class="player-close" @click="closePlayer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div class="player-screen" :class="'theme-' + (activeVideo.theme || (activeModule && activeModule.theme) || 'sunset')">
            <video
              v-if="isDirectVideo(activeVideo.videoUrl)"
              :src="activeVideo.videoUrl"
              :poster="activeVideo.thumbnail"
              controls
              autoplay
              playsinline
              class="player-video-el"
            ></video>
            <iframe
              v-else-if="activeVideo.videoUrl"
              :src="getEmbedUrl(activeVideo.videoUrl)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              class="player-video-el"
            ></iframe>
            <div v-else class="empty-video-msg">
              <span class="play-btn lg"></span>
              <p style="margin-top: 40px; font-weight: 700; font-size: 13px;">Video en preparación</p>
            </div>
          </div>
          <p class="player-mod">{{ activeModule ? activeModule.badge : 'Universidad SIFRAH' }}</p>
          <h3>{{ activeVideo.title }}</h3>
          <p class="player-meta">{{ activeVideo.duration }} · Clase</p>
          <p class="player-note">{{ activeVideo.desc || 'Clase disponible en Universidad SIFRAH.' }}</p>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

const MODULES = [
  {
    id: 0,
    badge: "Módulo 0",
    title: "Bienvenido a SIFRAH",
    theme: "sunset",
    lead: "Tu punto de partida en esta gran oportunidad.",
    files: [
      { name: "Guía de bienvenida", meta: "PDF · 4.2 MB" },
      { name: "Hoja de trabajo – Mis primeros pasos", meta: "PDF · 1.8 MB" },
    ],
    videos: [
      { title: "Gracias por tomar esta decisión", duration: "10:25", theme: "sunset", status: "done", desc: "Un mensaje de bienvenida, la visión de SIFRAH y lo que puedes lograr." },
      { title: "Tu punto de partida", duration: "08:40", theme: "notes", status: "next", desc: "Qué hacer ahora, primeros pasos y recomendaciones." },
      { title: "Cómo aprovechar la Universidad SIFRAH", duration: "06:15", theme: "laptop", status: "pending", desc: "Cómo utilizar la plataforma, navegar los módulos y sacar el máximo provecho." },
      { title: "Tu camino en SIFRAH", duration: "07:20", theme: "portrait", status: "pending", desc: "Lo que viene, mentalidad, disciplina y próximos pasos." },
    ],
  },
  {
    id: 1,
    badge: "Módulo 1",
    title: "Conoce la industria",
    theme: "city",
    lead: "Entiende el negocio antes de dar el siguiente paso.",
    files: [{ name: "Guía de la industria", meta: "PDF · 2.4 MB" }],
    videos: [
      { title: "Qué es el Network Marketing", duration: "12:30", theme: "people" },
      { title: "Mitos y realidades", duration: "09:20", theme: "climb" },
      { title: "Oportunidades del mercado", duration: "11:05", theme: "market" },
      { title: "Historia de la industria", duration: "08:30", theme: "history" },
      { title: "El camino de la industria", duration: "07:45", theme: "city" },
    ],
  },
  {
    id: 2,
    badge: "Módulo 2",
    title: "Conoce SIFRAH",
    theme: "products",
    lead: "La propuesta, los productos y la comunidad.",
    files: [{ name: "Presentación SIFRAH", meta: "PDF · 3.1 MB" }],
    videos: [
      { title: "Qué es SIFRAH", duration: "09:10", theme: "products" },
      { title: "La propuesta de valor", duration: "08:05", theme: "products" },
      { title: "Productos principales", duration: "11:20", theme: "products" },
      { title: "La comunidad", duration: "07:35", theme: "people" },
      { title: "Cómo se crece en SIFRAH", duration: "10:00", theme: "chart" },
      { title: "Tu siguiente paso", duration: "06:40", theme: "handshake" },
    ],
  },
  {
    id: 3,
    badge: "Módulo 3",
    title: "Plan de compensación",
    theme: "chart",
    lead: "Cómo se construye tu ingreso dentro del plan.",
    files: [{ name: "Resumen del plan", meta: "PDF · 1.6 MB" }],
    videos: [
      { title: "Introducción al plan", duration: "08:15", theme: "chart" },
      { title: "Cómo funciona el residual", duration: "12:30", theme: "speaker" },
      { title: "Bono por afiliación", duration: "09:40", theme: "chart" },
      { title: "Bono generacional", duration: "10:05", theme: "chart" },
      { title: "Bono de logro", duration: "07:55", theme: "chart" },
      { title: "Cierres y periodos", duration: "08:20", theme: "notes" },
      { title: "Cómo leer tus movimientos", duration: "11:10", theme: "laptop" },
      { title: "Preguntas frecuentes", duration: "06:50", theme: "people" },
    ],
  },
  {
    id: 4,
    badge: "Módulo 4",
    title: "Activación y primeros pasos",
    theme: "handshake",
    lead: "Lo que necesitas para activarte y empezar.",
    files: [{ name: "Checklist de activación", meta: "PDF · 0.8 MB" }],
    videos: [
      { title: "Qué significa activarte", duration: "08:00", theme: "handshake" },
      { title: "Tu primer pedido", duration: "09:25", theme: "products" },
      { title: "Cómo usar tu saldo", duration: "07:15", theme: "laptop" },
      { title: "Primeros 7 días", duration: "10:40", theme: "sunrise" },
      { title: "Errores que debes evitar", duration: "08:55", theme: "history" },
      { title: "Checklist de activación", duration: "06:20", theme: "notes" },
    ],
  },
];

export default {
  components: { App, Spinner },
  data() {
    return {
      loading: true,
      modules: MODULES,
      query: "",
      searchOpen: false,
      slideIndex: 0,
      modulesExpanded: false,
      expandedRows: {},
      isDesktop: false,
      touchX: 0,
      slideTimer: null,
      detailOpen: false,
      playerOpen: false,
      activeVideo: null,
      activeModule: null,
      slides: [
        {
          kicker: "Bienvenido a",
          title: "Universidad SIFRAH",
          text: "Da el primer paso en tu formación.",
          cta: "Ver video de bienvenida",
          theme: "sunset",
          action: "welcome",
        },
        {
          kicker: "Sigue tu ruta",
          title: "Plan de compensación",
          text: "Entiende cómo funciona el residual.",
          cta: "Continuar módulo 3",
          theme: "chart",
          action: "continue",
        },
        {
          kicker: "Empieza por aquí",
          title: "Cinco módulos",
          text: "De la bienvenida a tu activación.",
          cta: "Ver módulos",
          theme: "city",
          action: "modules",
        },
      ],
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    title() {
      return "Universidad SIFRAH";
    },
    currentSlide() {
      return this.slides[this.slideIndex];
    },
    continueModule() {
      return (this.modules && this.modules.length > 3 ? this.modules[3] : (this.modules && this.modules[0])) || null;
    },
    continueVideo() {
      if (!this.continueModule || !this.continueModule.videos || !this.continueModule.videos.length) return null;
      return this.continueModule.videos[1] || this.continueModule.videos[0];
    },
    continueIndex() {
      return 1;
    },
    filteredModules() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.modules;
      return this.modules.filter((mod) => {
        const inTitle = mod.title.toLowerCase().includes(q) || mod.badge.toLowerCase().includes(q);
        const inVideo = mod.videos.some((video) => video.title.toLowerCase().includes(q));
        return inTitle || inVideo;
      });
    },
  },
  async created() {
    try {
      const { data } = await api.tools(this.session);
      if (data.error && data.msg == "invalid session") return this.$router.push("/login");
      if (data.error && data.msg == "unverified user") return this.$router.push("/verify");
      this.$store.commit("SET_NAME", data.name);
      this.$store.commit("SET_LAST_NAME", data.lastName);
      this.$store.commit("SET_AFFILIATED", data.affiliated);
      this.$store.commit("SET_ACTIVATED", data.activated);
      this.$store.commit("SET__ACTIVATED", data._activated);
      this.$store.commit("SET_PLAN", data.plan);
      this.$store.commit("SET_COUNTRY", data.country);
      this.$store.commit("SET_PHOTO", data.photo);
      this.$store.commit("SET_TREE", data.tree);
    } catch (e) {}

    try {
      const uniRes = await api.University.GET();
      if (uniRes.data && uniRes.data.modules && uniRes.data.modules.length > 0) {
        this.modules = uniRes.data.modules;
      }
    } catch (e) {
      console.warn("Could not fetch university modules:", e);
    }

    this.loading = false;
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.onResize);
    this.startSlides();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    this.stopSlides();
  },
  methods: {
    onResize() {
      this.isDesktop = window.innerWidth >= 960;
    },
    startSlides() {
      this.stopSlides();
      this.slideTimer = setInterval(() => {
        this.slideIndex = (this.slideIndex + 1) % this.slides.length;
      }, 6500);
    },
    stopSlides() {
      if (this.slideTimer) clearInterval(this.slideTimer);
    },
    goSlide(index) {
      this.slideIndex = index;
      this.startSlides();
    },
    onHeroStart(event) {
      this.touchX = event.changedTouches[0].clientX;
    },
    onHeroEnd(event) {
      const dx = event.changedTouches[0].clientX - this.touchX;
      if (Math.abs(dx) < 40) return;
      const next = dx < 0 ? this.slideIndex + 1 : this.slideIndex - 1;
      this.goSlide((next + this.slides.length) % this.slides.length);
    },
    onSlideCta() {
      if (this.currentSlide.action === "continue") {
        this.openVideo(this.continueVideo, this.continueModule);
        return;
      }
      if (this.currentSlide.action === "modules") {
        this.scrollToModule(0);
        return;
      }
      this.openVideo(this.modules[0].videos[0], this.modules[0]);
    },
    toggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) this.query = "";
      else this.$nextTick(() => this.$refs.searchInput && this.$refs.searchInput.focus());
    },
    clearSearch() {
      this.query = "";
      this.searchOpen = false;
    },
    videosFor(mod) {
      const q = this.query.trim().toLowerCase();
      if (!q) return mod.videos;
      const titleHit = mod.title.toLowerCase().includes(q) || mod.badge.toLowerCase().includes(q);
      if (titleHit) return mod.videos;
      return mod.videos.filter((video) => video.title.toLowerCase().includes(q));
    },
    shownVideos(mod) {
      const videos = this.videosFor(mod);
      if (this.query || this.expandedRows[mod.id]) return videos;
      if (this.isDesktop) return videos.slice(0, 4);
      return videos;
    },
    toggleRow(id) {
      this.$set(this.expandedRows, id, !this.expandedRows[id]);
    },
    scrollToModule(id) {
      const ref = this.$refs["mod-" + id];
      const el = Array.isArray(ref) ? ref[0] : ref;
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    openModule(mod) {
      this.openVideo(mod.videos[0], mod);
    },
    openVideo(video, mod) {
      this.activeVideo = video;
      this.activeModule = mod || this.modules.find((item) => item.videos.includes(video)) || this.modules[0];
      this.detailOpen = true;
      this.stopSlides();
      this.$nextTick(() => {
        const scroller = this.$el && this.$el.closest(".content");
        if (scroller) scroller.scrollTop = 0;
      });
    },
    closeDetail() {
      this.detailOpen = false;
      this.startSlides();
    },
    statusOf(video, index) {
      if (video.status) return video.status;
      return index === 0 ? "next" : "pending";
    },
    statusLabel(status) {
      if (status === "done") return "Completado";
      if (status === "next") return "Continuar";
      return "Pendiente";
    },
    doneCount(mod) {
      return mod.videos.filter((video) => video.status === "done").length;
    },
    progressPct(mod) {
      if (!mod.videos.length) return 0;
      return Math.round((this.doneCount(mod) / mod.videos.length) * 100);
    },
    pad(n) {
      return String(n).padStart(2, "0");
    },
    playLesson(video, mod) {
      this.activeVideo = video;
      this.activeModule = mod;
      this.playerOpen = true;
    },
    closePlayer() {
      this.playerOpen = false;
    },
    isDirectVideo(url) {
      if (!url) return false;
      return (
        url.endsWith(".mp4") ||
        url.endsWith(".webm") ||
        url.endsWith(".m4v") ||
        url.includes("b-cdn.net") ||
        url.includes("storage.bunnycdn.com")
      );
    },
    getEmbedUrl(url) {
      if (!url) return "";
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
      }
      const vmMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
      if (vmMatch) {
        return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1`;
      }
      return url;
    },
  },
};
</script>

<style scoped>
.thumb-img-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  position: absolute;
  inset: 0;
}
.player-video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}
.empty-video-msg {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}
.uni {
  color: #161616;
  padding: 4px 0 12px;
  font-family: "Segoe UI", sans-serif;
}

.uni-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.uni-top h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.uni-top p {
  margin: 4px 0 0;
  color: #8d8d8d;
  font-size: 14px;
}
.uni-search-btn {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: #f6f6f7;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.uni-search-btn svg { width: 20px; height: 20px; }
.uni-search-btn.on { background: #fce4ec; color: #e91e63; }

.uni-search {
  display: flex;
  gap: 8px;
  margin: -4px 0 14px;
}
.uni-search input {
  flex: 1;
  border: 1.5px solid #f0f0f0;
  background: #f7f7f8;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
}
.uni-search input:focus { border-color: #e91e63; background: #fff; }
.uni-search-clear {
  border: 0;
  background: transparent;
  color: #e91e63;
  font-weight: 700;
  cursor: pointer;
}

.hero {
  position: relative;
  overflow: hidden;
  height: 240px;
  border-radius: 18px;
  color: #fff;
  margin-bottom: 14px;
}
.theme-sunset { background: linear-gradient(115deg, #4a1268 0%, #c2185b 46%, #ff8a3d 100%); }
.theme-chart { background: linear-gradient(145deg, #6a1b4d 0%, #e91e63 55%, #ff80ab 100%); }
.theme-city { background: linear-gradient(160deg, #12082a 0%, #311b92 42%, #ff6d00 100%); }
.theme-products { background: linear-gradient(160deg, #1b5e20, #43a047 70%, #c8e6c9); }
.theme-handshake { background: linear-gradient(145deg, #e65100, #ffcc80 80%); }
.theme-notes { background: linear-gradient(160deg, #d7ccc8, #8d6e63); }
.theme-laptop { background: linear-gradient(145deg, #311b92, #e91e63); }
.theme-portrait { background: linear-gradient(160deg, #37474f, #90a4ae); }
.theme-people { background: linear-gradient(160deg, #263238, #607d8b 60%, #ffcc80); }
.theme-climb { background: linear-gradient(160deg, #bf360c, #ffab91); }
.theme-market { background: linear-gradient(160deg, #0d47a1, #7c4dff); }
.theme-history { background: linear-gradient(160deg, #3e2723, #ff8a65); }
.theme-speaker { background: linear-gradient(160deg, #1a237e, #5c6bc0 55%, #eceff1); }
.theme-sunrise { background: linear-gradient(160deg, #f57c00, #ffe082); }

.hero-sky { position: absolute; inset: 0; }
.hero-sun {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  right: 28%;
  top: 36px;
  background: radial-gradient(circle, #fff8e1 0%, #ffcc80 70%);
  box-shadow: 0 0 36px rgba(255, 204, 128, 0.85);
}
.hero-mark {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  color: rgba(255,255,255,.92);
}
.hero-mark svg { width: 100%; height: 100%; }
.hero-person {
  position: absolute;
  right: 8px;
  bottom: 0;
  width: 132px;
  height: 150px;
}
.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 62%;
  padding: 18px 16px 36px;
}
.hero-kicker {
  display: block;
  font-size: 11px;
  letter-spacing: 1.4px;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.9;
}
.hero-copy h2 {
  margin: 2px 0 6px;
  font-size: 28px;
  line-height: 1.02;
  font-weight: 800;
}
.hero-copy p {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.35;
  max-width: 180px;
}
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: #fff;
  color: #111;
  border-radius: 999px;
  padding: 8px 12px 8px 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.play-ico {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e91e63;
  position: relative;
  flex-shrink: 0;
}
.play-ico:after {
  content: "";
  position: absolute;
  left: 8px;
  top: 6px;
  border-style: solid;
  border-width: 5px 0 5px 8px;
  border-color: transparent transparent transparent #fff;
}
.hero-dots {
  position: absolute;
  left: 16px;
  bottom: 12px;
  display: flex;
  gap: 6px;
  z-index: 1;
}
.hero-dots button {
  width: 16px;
  height: 4px;
  border: 0;
  border-radius: 99px;
  background: rgba(255,255,255,.45);
  padding: 0;
  cursor: pointer;
}
.hero-dots button.on {
  width: 28px;
  background: #fff;
}

.continue {
  width: 100%;
  text-align: left;
  border: 0;
  background: #fff5f8;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 18px;
  cursor: pointer;
  box-shadow: 0 1px 8px rgba(233, 30, 99, 0.06);
}
.continue-kicker {
  display: block;
  color: #e91e63;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.continue-body {
  display: flex;
  align-items: center;
  gap: 10px;
}
.thumb, .vid-art, .mod-art {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 12px;
}
.thumb {
  width: 92px;
  height: 78px;
  flex-shrink: 0;
}
.continue-info { flex: 1; min-width: 0; }
.continue-mod {
  display: block;
  color: #e91e63;
  font-size: 12px;
  font-weight: 700;
}
.continue-info strong {
  display: block;
  font-size: 15px;
  margin-top: 1px;
}
.continue-meta {
  display: block;
  margin-top: 2px;
  color: #8a8a8a;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 99px;
  background: #f8c5d6;
  overflow: hidden;
}
.progress-fill {
  display: block;
  height: 100%;
  background: #e91e63;
  border-radius: 99px;
}
.progress-pct {
  color: #e91e63;
  font-size: 12px;
  font-weight: 800;
}
.continue-chevron {
  width: 18px;
  height: 18px;
  color: #c4c4c4;
  flex-shrink: 0;
}

.block { margin-bottom: 18px; }
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.block-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}
.see-all {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 0;
  background: transparent;
  color: #e91e63;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.see-all svg { width: 14px; height: 14px; }

.scroller {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.scroller::-webkit-scrollbar { display: none; }
@media (max-width: 959px) {
  .scroller.is-expanded {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    overflow: visible;
    scroll-snap-type: none;
  }
  .scroller.is-expanded .mod-card,
  .scroller.is-expanded .vid-card {
    width: auto;
    min-width: 0;
  }
  .scroller.is-expanded .mod-art,
  .scroller.is-expanded .vid-art {
    height: auto;
    aspect-ratio: 16 / 10;
  }
}

.mod-card, .vid-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
  flex: 0 0 auto;
  scroll-snap-align: start;
}
.mod-card { width: 132px; }
.mod-art {
  height: 112px;
  border-radius: 16px;
}
.pill {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255,255,255,.92);
  color: #222;
  font-size: 10px;
  font-weight: 800;
  border-radius: 999px;
  padding: 3px 7px;
}
.mod-count {
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,.35);
}
.mod-title, .vid-title {
  display: block;
  margin-top: 6px;
  min-height: 2.5em;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.25;
  color: #222;
}
.vid-card { width: 168px; }
.vid-art {
  height: 104px;
  border-radius: 14px;
}
.play-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border-radius: 50%;
  background: rgba(255,255,255,.92);
}
.play-btn:after {
  content: "";
  position: absolute;
  left: 13px;
  top: 10px;
  border-style: solid;
  border-width: 7px 0 7px 11px;
  border-color: transparent transparent transparent #222;
}
.play-btn.lg {
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
}
.play-btn.lg:after {
  left: 20px;
  top: 16px;
  border-width: 11px 0 11px 16px;
}
.duration {
  position: absolute;
  right: 8px;
  bottom: 7px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 4px rgba(0,0,0,.45);
}

.empty {
  text-align: center;
  color: #999;
  padding: 28px 8px;
}

.player {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
}
.player-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 18px;
  padding: 14px;
  position: relative;
}
.player-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(255,255,255,.92);
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.player-close svg { width: 16px; height: 16px; }
.player-screen {
  height: 190px;
  border-radius: 14px;
  position: relative;
  margin-bottom: 12px;
}
.player-mod {
  margin: 0;
  color: #e91e63;
  font-size: 12px;
  font-weight: 800;
}
.player-card h3 {
  margin: 2px 36px 4px 0;
  font-size: 18px;
}
.player-meta, .player-note {
  margin: 0;
  color: #888;
  font-size: 13px;
}
.player-note { margin-top: 8px; }

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #e91e63;
  font-size: 18px;
  font-weight: 800;
  padding: 0 0 12px;
  cursor: pointer;
}
.detail-back svg { width: 22px; height: 22px; }
.detail-hero {
  position: relative;
  height: 188px;
  border-radius: 18px;
  color: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 12px;
  overflow: hidden;
}
.detail-hero .pill { position: static; align-self: flex-start; margin-bottom: 8px; }
.detail-hero h2 {
  margin: 0 0 6px;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 800;
  max-width: 240px;
}
.detail-hero p {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  max-width: 230px;
}
.progress-card {
  background: #fff5f8;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 18px;
}
.progress-copy strong { display: block; font-size: 15px; }
.progress-copy span { display: block; margin-top: 2px; color: #9a9a9a; font-size: 13px; }
.detail-progress { margin-top: 12px; }
.lessons, .materials { margin-bottom: 18px; }
.count-label { color: #9a9a9a; font-size: 13px; font-weight: 600; }
.lesson {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid #f4f4f4;
}
.lesson-thumb {
  width: 108px;
  height: 72px;
  border-radius: 12px;
  flex-shrink: 0;
}
.lesson-body { flex: 1; min-width: 0; }
.lesson-no {
  color: #e91e63;
  font-size: 12px;
  font-weight: 800;
}
.lesson-body strong {
  display: block;
  font-size: 14px;
  line-height: 1.25;
  margin-top: 1px;
}
.lesson-desc {
  display: block;
  margin-top: 3px;
  color: #9a9a9a;
  font-size: 12px;
  line-height: 1.35;
}
.lesson-state {
  width: 74px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.state-ico {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.state-ico.done, .state-ico.next { background: #e91e63; color: #fff; }
.state-ico.pending { background: #f1f1f1; color: #c5c5c5; }
.state-ico svg { width: 18px; height: 18px; }
.play-mini {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 9px;
  border-color: transparent transparent transparent currentColor;
  margin-left: 2px;
}
.state-label { font-size: 11px; font-weight: 700; text-align: center; }
.lesson.done .state-label, .lesson.next .state-label { color: #e91e63; }
.lesson.pending .state-label { color: #b0b0b0; }
.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafafa;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 8px;
}
.file-ico {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fde7ef;
  color: #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.file-ico svg, .file-down svg { width: 18px; height: 18px; }
.file-copy { flex: 1; min-width: 0; }
.file-copy strong { display: block; font-size: 14px; }
.file-copy span { display: block; margin-top: 2px; color: #9a9a9a; font-size: 12px; }
.file-down { color: #9a9a9a; display: flex; }

@media (min-width: 960px) {
  .uni { padding-top: 8px; }
  .uni-top h1 { font-size: 32px; }
  .hero { height: 320px; border-radius: 22px; }
  .hero-copy { max-width: 520px; padding: 36px 32px 48px; }
  .hero-copy h2 { font-size: 46px; }
  .hero-copy p { font-size: 16px; max-width: 280px; }
  .hero-person { width: 210px; height: 240px; right: 48px; }
  .hero-sun { width: 84px; height: 84px; right: 24%; top: 54px; }
  .continue { padding: 16px; }
  .thumb { width: 148px; height: 108px; }
  .continue-info strong { font-size: 18px; }
  .scroller.modules,
  .scroller.videos {
    display: grid;
    overflow: visible;
    scroll-snap-type: none;
  }
  .scroller.modules { grid-template-columns: repeat(5, 1fr); }
  .scroller.videos { grid-template-columns: repeat(4, 1fr); }
  .mod-card, .vid-card { width: auto; }
  .mod-art { height: 140px; }
  .vid-art { height: 176px; }
  .mod-title, .vid-title { font-size: 14px; }
  .player { align-items: center; }
  .player-screen { height: 260px; }
  .detail-hero { height: 280px; border-radius: 22px; }
  .detail-hero h2 { font-size: 40px; max-width: 460px; }
  .detail-hero p { font-size: 16px; max-width: 420px; }
  .detail-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 28px;
    align-items: start;
  }
  .lesson-thumb { width: 132px; height: 84px; }
  .lesson-body strong { font-size: 16px; }
}
</style>
