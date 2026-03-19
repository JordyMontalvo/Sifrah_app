<template>
  <transition name="reader-anim">
    <div v-if="active" class="book-reader-overlay" :class="{ 'dark-mode': darkMode }">
      <!-- Layout Container -->
      <div class="reader-layout" :class="{ 'sidebar-open': sidebarOpen }">
        <button class="back-circle-btn" @click="closeReader" title="Volver">
          <i class="fas fa-arrow-left"></i>
        </button>
        
        <!-- Sidebar (Thumbnails / Chapters) -->
        <aside class="reader-sidebar" v-if="sidebarOpen">
          <div class="sidebar-header">
            <h3>Contenido</h3>
            <button class="close-sidebar-btn" @click="sidebarOpen = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="sidebar-content">
            <div class="chapter-list">
              <div 
                v-for="(chap, idx) in chapters" 
                :key="idx" 
                class="chapter-item"
                :class="{ active: currentPage >= chap.page && (idx === chapters.length - 1 || currentPage < chapters[idx+1].page) }"
                @click="jumpToChapter(idx)"
              >
                <div class="chap-num">{{ idx + 1 }}</div>
                <div class="chap-info">
                  <span class="chap-title">{{ chap.title }}</span>
                  <span class="chap-page">Pág. {{ chap.page }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <div class="reader-main">
          <!-- Top Bar -->
          <header class="reader-header">
            <div class="header-left">
              <button class="icon-btn" @click="closeReader" title="Volver">
                <i class="fas fa-arrow-left"></i>
              </button>
              <button class="icon-btn menu-toggle" @click="sidebarOpen = !sidebarOpen">
                <i class="fas fa-bars"></i>
              </button>
              <h2 class="document-title" v-if="showPdf">{{ book.title || 'Documento' }}</h2>
            </div>
            
            <div class="header-center desk-only">
              <div class="zoom-controls">
                <button @click="changeZoom(-0.1)"><i class="fas fa-minus"></i></button>
                <span class="zoom-val">{{ Math.round(zoom * 100) }}%</span>
                <button @click="changeZoom(0.1)"><i class="fas fa-plus"></i></button>
              </div>
            </div>

            <div class="header-right">
              <button class="icon-btn" @click="toggleSettings"><i class="fas fa-cog"></i></button>
            </div>
          </header>

          <!-- Viewer Content -->
          <main class="reader-body">
            <!-- Initial Cover State -->
            <div v-if="!showPdf" class="book-cover-view">
              <div class="cover-glow"></div>
              <img :src="book.image || defaultImage" alt="Cover" class="large-cover" />
              <div class="book-details">
                <h1 class="book-h1">{{ book.title }}</h1>
                <p class="book-author-p">{{ book.author }}</p>
                <button class="start-read-btn" @click="startReading" :disabled="loadingPdf">
                  <template v-if="loadingPdf">
                    <i class="fas fa-spinner fa-spin"></i> Cargando Lector...
                  </template>
                  <template v-else>
                    <i class="fas fa-book-open"></i> Continuar Lectura
                  </template>
                </button>
              </div>
            </div>
            
            <!-- Custom Canvas-based Scroll Viewer -->
            <div 
              v-else 
              ref="pdfContainer" 
              class="pdf-custom-viewer" 
              @scroll="handleScroll"
            >
              <div class="pdf-pages-stack" :style="{ width: viewerWidth }">
                <div 
                  v-for="pageNum in pages" 
                  :key="pageNum" 
                  :id="'page-' + pageNum"
                  class="pdf-page-wrapper"
                >
                  <canvas :id="'canvas-' + pageNum" class="pdf-canvas"></canvas>
                  <div class="page-loader" v-if="!renderedPages.includes(pageNum)">
                    <i class="fas fa-spinner fa-spin"></i>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <!-- Floating Functional Progress Bar (The "Barita") -->
          <div class="floating-controls-wrap" v-if="showPdf">
            <div class="reader-glass-card">
              <div class="card-row card-header-row" @click="sidebarOpen = true">
                <div class="index-label">
                  <span class="label-text">Índice</span>
                  <i class="fas fa-chevron-up"></i>
                </div>
                <div class="percent-label">{{ Math.round(progress) }}%</div>
              </div>

              <!-- Functional Slider -->
              <div class="card-row slider-row">
                <input 
                  type="range" 
                  class="modern-slider" 
                  v-model="progress" 
                  min="0" 
                  max="100"
                  step="1"
                  @change="handleSliderChange"
                />
              </div>

              <div class="card-row page-counter-row">
                <span class="page-num">{{ currentPage }} / {{ pages }}</span>
              </div>

              <div class="card-row toolbar-row">
                <button class="tool-btn" @click="toggleBookmark">
                  <i :class="isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'"></i>
                </button>
                <button class="tool-btn" @click="showSearch = !showSearch"><i class="fas fa-search"></i></button>
                <button class="tool-btn" @click="sidebarOpen = true"><i class="fas fa-list-ul"></i></button>
                <button class="tool-btn" @click="darkMode = !darkMode">
                  <i :class="darkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// PDF.js CDN Links
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default {
  props: {
    active: Boolean,
    book: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      progress: 0,
      pages: 0,
      currentPage: 1,
      showPdf: false,
      sidebarOpen: false,
      darkMode: false,
      zoom: 1.0,
      loadingPdf: false,
      renderedPages: [],
      isBookmarked: false,
      showSearch: false,
      pdfDoc: null,
      observer: null,
      defaultImage: "https://via.placeholder.com/300x450?text=Libro",
      chapters: [
        { title: "Introducción", page: 1 },
        { title: "Visión General", page: 5 },
        { title: "Capítulo I", page: 12 },
        { title: "Conclusión", page: 40 }
      ]
    };
  },
  computed: {
    viewerWidth() {
      // Limit max width on desktop but keep it responsive
      const baseWidth = window.innerWidth > 1024 ? 800 : window.innerWidth * 0.95;
      return (baseWidth * this.zoom) + 'px';
    }
  },
  methods: {
    closeReader() {
      this.cleanupPdf();
      this.$emit('close');
    },
    cleanupPdf() {
      if (this.pdfDoc) {
        this.pdfDoc.destroy();
        this.pdfDoc = null;
      }
      if (this.observer) {
        this.observer.disconnect();
      }
      this.renderedPages = [];
      this.showPdf = false;
    },
    async loadPdfScripts() {
      if (window.pdfjsLib) return;
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = PDFJS_URL;
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
          resolve();
        };
        document.head.appendChild(script);
      });
    },
    async startReading() {
      const originalUrl = this.book.pdfUrl || this.book.url;
      if (!originalUrl) return;
      
      this.loadingPdf = true;
      try {
        await this.loadPdfScripts();
        
        // Proxy URL to bypass CORS (Backend is on Heroku)
        const BACKEND_URL = 'https://sifrah-server-0920254d8662.herokuapp.com/api';
        const proxyUrl = `${BACKEND_URL}/pdf-proxy?url=${encodeURIComponent(originalUrl)}`;

        this.pdfDoc = await window.pdfjsLib.getDocument(proxyUrl).promise;
        this.pages = this.pdfDoc.numPages;
        this.showPdf = true;
        this.loadingPdf = false;
        
        // Wait for DOM then init observer
        this.$nextTick(() => {
          this.initObserver();
        });
      } catch (err) {
        console.error("Reader Error:", err);
        alert("No se pudo cargar el PDF. Revisa que el enlace sea accesible o prueba recargando.");
        this.loadingPdf = false;
      }
    },
    initObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.id.split('-')[1]);
            this.currentPage = pageNum;
            this.renderPage(pageNum);
            // Pre-render next and prev
            if (pageNum + 1 <= this.pages) this.renderPage(pageNum + 1);
            if (pageNum - 1 >= 1) this.renderPage(pageNum - 1);
          }
        });
      }, {
        root: this.$refs.pdfContainer,
        threshold: 0.1
      });

      this.$nextTick(() => {
        document.querySelectorAll('.pdf-page-wrapper').forEach(el => {
          this.observer.observe(el);
        });
      });
    },
    async renderPage(num) {
      if (this.renderedPages.includes(num)) return;
      if (!this.pdfDoc) return;

      try {
        const page = await this.pdfDoc.getPage(num);
        const canvas = document.getElementById('canvas-' + num);
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.5 * this.zoom });
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        this.renderedPages.push(num);
      } catch (err) {
        console.warn("Render error for page", num, err);
      }
    },
    handleScroll() {
      const container = this.$refs.pdfContainer;
      if (!container) return;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      if (scrollHeight > 0) {
        this.progress = (container.scrollTop / scrollHeight) * 100;
      }
    },
    handleSliderChange() {
      const container = this.$refs.pdfContainer;
      if (!container) return;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      container.scrollTop = (this.progress / 100) * scrollHeight;
    },
    changeZoom(delta) {
      this.zoom = Math.max(0.5, Math.min(2.0, this.zoom + delta));
      // Re-render visible pages
      this.renderedPages = [];
      this.renderPage(this.currentPage);
    },
    jumpToChapter(idx) {
      const chap = this.chapters[idx];
      this.scrollToPage(chap.page);
      this.sidebarOpen = false;
    },
    scrollToPage(num) {
      const el = document.getElementById('page-' + num);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    toggleBookmark() {
      this.isBookmarked = !this.isBookmarked;
    },
    toggleSettings() {}
  },
  watch: {
    book: {
      immediate: true,
      handler() {
        this.cleanupPdf();
      }
    },
    active(val) {
      if (!val) this.cleanupPdf();
      document.body.style.overflow = val ? 'hidden' : '';
      if (val) {
        document.body.classList.add('book-reader-open');
        this.darkMode = false; // Always start in day mode
      } else {
        document.body.classList.remove('book-reader-open');
      }
    }
  },
  beforeDestroy() {
    this.cleanupPdf();
  }
};
</script>

<style scoped>
.book-reader-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: #f1f3f6;
  font-family: 'Inter', sans-serif;
  color: #1a1a1c;
  overflow: hidden;
  transition: all 0.3s;
}

@media (min-width: 768px) {
  .book-reader-overlay {
    left: 300px;
  }
}

@media (max-width: 767px) {
  .book-reader-overlay {
    position: fixed;
    left: 0;
  }
}

.book-reader-overlay.dark-mode {
  background: #121214;
  color: #e4e4e7;
}

.reader-layout { display: flex; width: 100%; height: 100%; position: relative; }

.reader-sidebar {
  width: 280px; background: #fff; border-right: 1px solid #e2e8f0;
  z-index: 200; overflow-y: auto; display: flex; flex-direction: column;
}
.dark-mode .reader-sidebar { background: #1a1a1c; border-right-color: #2d2d30; }

.sidebar-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }

.reader-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.reader-header {
  height: 60px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: #fff; border-bottom: 1px solid #e2e8f0;
}
.dark-mode .reader-header { background: #1a1a1c; border-bottom-color: #27272a; }

.document-title { font-size: 15px; font-weight: 700; color: #e11d48; margin-left: 10px; }

.icon-btn { background: none; border: none; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: inherit; }
.icon-btn:hover { background: rgba(0,0,0,0.05); }

.zoom-controls { display: flex; align-items: center; background: #f1f5f9; padding: 4px 12px; border-radius: 20px; gap: 8px; }
.dark-mode .zoom-controls { background: #27272a; }

/* Viewer Content Area */
.reader-body { flex: 1; position: relative; overflow: hidden; display: flex; justify-content: center; }

/* Custom Scroll Viewer */
.pdf-custom-viewer {
  flex: 1; overflow-y: auto; background: #cbd5e1;
  padding: 40px 10px; display: flex; flex-direction: column; align-items: center;
}
.dark-mode .pdf-custom-viewer { background: #1e1e21; }

.pdf-pages-stack { display: flex; flex-direction: column; gap: 30px; transition: width 0.2s; }

.pdf-page-wrapper {
  background: white; border-radius: 2px; position: relative;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  min-height: 500px; display: flex; align-items: center; justify-content: center;
}

.pdf-canvas { width: 100%; height: auto; display: block; border-radius: 2px; }

.page-loader { position: absolute; color: #e11d48; font-size: 30px; }

/* Improved Barita (Floating Progress Bar) */
.floating-controls-wrap {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
  width: 90%; max-width: 440px; z-index: 1000; pointer-events: none;
}
.reader-glass-card {
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
  border-radius: 28px; padding: 18px 24px; pointer-events: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.dark-mode .reader-glass-card { background: rgba(30, 30, 35, 0.92); border: 1px solid rgba(255,255,255,0.05); }

.card-header-row { display: flex; justify-content: space-between; cursor: pointer; margin-bottom: 10px; }
.index-label { font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 6px; }
.percent-label { font-weight: 700; color: #e11d48; }

.modern-slider { width: 100%; appearance: none; height: 6px; background: #f1f5f9; border-radius: 3px; outline: none; }
.dark-mode .modern-slider { background: #334155; }
.modern-slider::-webkit-slider-thumb {
  appearance: none; width: 22px; height: 22px; background: #e11d48; border: 4px solid #fff;
  border-radius: 50%; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.page-counter-row { font-size: 13px; color: #64748b; text-align: center; margin: 12px 0; font-weight: 700; }

.toolbar-row { display: flex; justify-content: space-around; padding-top: 12px; border-top: 1px solid #f1f5f9; }
.dark-mode .toolbar-row { border-top-color: #2d2d30; }

.tool-btn { background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer; transition: 0.2s; }
.tool-btn:hover { color: #e11d48; transform: translateY(-2px); }
.dark-mode .tool-btn { color: #94a3b8; }

/* Chapter List */
.chapter-list { padding: 10px; }
.chapter-item { display: flex; padding: 12px; border-radius: 10px; cursor: pointer; margin-bottom: 4px; transition: 0.2s; }
.chapter-item:hover { background: #f1f5f9; }
.chapter-item.active { background: #fff1f2; color: #e11d48; }

/* Cover State UI */
.book-cover-view { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
.book-details { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-top: 20px; z-index: 10; }
.book-h1 { margin-bottom: 5px; font-size: 32px; font-weight: 700; color: #1a1a1c; margin-top: 15px; }
.book-author-p { margin-bottom: 25px; font-size: 18px; color: #666; }
.large-cover { width: 280px; border-radius: 6px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); z-index: 5; transition: width 0.3s; }
@media (max-width: 767px) { .large-cover { width: 220px; } }
.cover-glow { position: absolute; width: 400px; height: 400px; background: #e11d48; filter: blur(100px); opacity: 0.1; }
.start-read-btn { background: #e11d48; color: #fff; border: none; padding: 14px 40px; border-radius: 30px; font-weight: 800; margin-top: 10px; cursor: pointer; transition: 0.3s; z-index: 10; }
.start-read-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(225, 29, 72, 0.3); }

/* Back Button Overlay */
.back-circle-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 40px;
  height: 40px;
  background: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10005;
  color: #1a1a1c;
  transition: all 0.3s ease;
}
.back-circle-btn:hover { transform: scale(1.1); box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25); }
.dark-mode .back-circle-btn { background: #27272a; color: #fff; }

@media (max-width: 767px) {
  .back-circle-btn { top: 10px; left: 10px; width: 36px; height: 36px; }
}

/* Animations */
.reader-anim-enter-active, .reader-anim-leave-active { transition: 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); }
.reader-anim-enter, .reader-anim-leave-to { opacity: 0; transform: translateY(30px); }
</style>
