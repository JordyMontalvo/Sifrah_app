<template>
  <transition name="reader-anim">
    <div v-if="active" class="book-reader-overlay" :class="{ 'dark-mode': darkMode }">
      <!-- Layout Container -->
      <div class="reader-layout" :class="{ 'sidebar-open': sidebarOpen }">
        
        <!-- Sidebar (Thumbnails / Table of Contents) -->
        <aside class="reader-sidebar">
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
                :class="{ active: currentChapter === idx }"
                @click="jumpToChapter(idx)"
              >
                <div class="chap-num">{{ idx + 1 }}</div>
                <div class="chap-info">
                  <span class="chap-title">{{ chap.title }}</span>
                  <span class="chap-page">Pág. {{ chap.page }}</span>
                </div>
              </div>
            </div>
            
            <div class="thumbnail-grid" v-if="showThumbnails">
              <div v-for="n in 12" :key="n" class="thumb-item">
                <div class="thumb-placeholder">{{ n }}</div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Workspace -->
        <div class="reader-main">
          <!-- Top Bar -->
          <header class="reader-header">
            <div class="header-left">
              <button class="icon-btn" @click="$emit('close')" title="Volver">
                <i class="fas fa-arrow-left"></i>
              </button>
              <button class="icon-btn menu-toggle" @click="sidebarOpen = !sidebarOpen">
                <i class="fas fa-bars"></i>
              </button>
              <h2 class="document-title">{{ book.title || 'Documento' }}</h2>
            </div>
            
            <div class="header-center desk-only">
              <div class="zoom-controls">
                <button @click="zoomOut"><i class="fas fa-minus"></i></button>
                <span class="zoom-val">{{ zoom }}%</span>
                <button @click="zoomIn"><i class="fas fa-plus"></i></button>
              </div>
              <div class="layout-toggles">
                <button class="active"><i class="fas fa-file"></i></button>
                <button><i class="fas fa-columns"></i></button>
              </div>
            </div>

            <div class="header-right">
              <button class="icon-btn desk-only"><i class="fas fa-share-alt"></i></button>
              <button class="icon-btn desk-only"><i class="fas fa-download"></i></button>
              <button class="icon-btn" @click="toggleSettings"><i class="fas fa-ellipsis-v"></i></button>
            </div>
          </header>

          <!-- Viewer Content -->
          <main class="reader-body" :class="{ 'view-info': !showPdf }">
            <!-- Cover View (Initial State) -->
            <div v-if="!showPdf" class="book-cover-view">
              <div class="cover-glow"></div>
              <img :src="book.image || defaultImage" alt="Cover" class="large-cover" />
              <div class="book-details">
                <h1 class="book-h1">{{ book.title }}</h1>
                <p class="book-author-p">{{ book.author }}</p>
                <button class="start-read-btn" @click="startReading">
                  <i class="fas fa-book-open"></i> Continuar Lectura
                </button>
              </div>
            </div>
            
            <!-- Real PDF Viewer -->
            <div v-else class="pdf-workspace">
              <iframe 
                :src="pdfViewerUrl" 
                class="pdf-view-frame" 
                frameborder="0"
                allowfullscreen
              ></iframe>
              <button class="overlay-close-btn" @click="showPdf = false" title="Cerrar Lector">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </main>

          <!-- Floating Control Card (Image 2 Redesign) -->
          <div class="floating-controls-wrap" v-if="showPdf">
            <div class="reader-glass-card">
              <!-- Card Top: Index Selector -->
              <div class="card-row card-header-row" @click="toggleIndexList">
                <div class="index-label">
                  <span class="label-text">Índice</span>
                  <i class="fas fa-chevron-down" :class="{ rotate: indexListVisible }"></i>
                </div>
                <div class="percent-label">{{ progress }}%</div>
              </div>

              <!-- Card Middle: Progress Slider -->
              <div class="card-row slider-row">
                <input 
                  type="range" 
                  class="modern-slider" 
                  v-model="progress" 
                  min="0" 
                  max="100"
                />
              </div>

              <!-- Card Info: Page Counter -->
              <div class="card-row page-counter-row">
                <span class="page-num">{{ currentPage }} / {{ pages }}</span>
              </div>

              <!-- Card Bottom: Toolbar -->
              <div class="card-row toolbar-row">
                <button class="tool-btn" title="Marcador"><i class="far fa-bookmark"></i></button>
                <button class="tool-btn" title="Buscar"><i class="fas fa-search"></i></button>
                <button class="tool-btn" @click="sidebarOpen = true" title="Tabla de Contenidos">
                  <i class="fas fa-bars"></i>
                </button>
                <button class="tool-btn" @click="darkMode = !darkMode" title="Modo Oscuro">
                  <i class="fas" :class="darkMode ? 'fa-sun' : 'fa-moon'"></i>
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
      progress: 6,
      pages: 100,
      showPdf: false,
      sidebarOpen: false,
      darkMode: false,
      zoom: 100,
      indexListVisible: false,
      showThumbnails: false,
      currentChapter: 0,
      defaultImage: "https://via.placeholder.com/300x450?text=Libro",
      chapters: [
        { title: "Introducción", page: 1 },
        { title: "Capítulo 1: El Comienzo", page: 12 },
        { title: "Capítulo 2: Profundizando", page: 34 },
        { title: "Capítulo 3: La Verdad", page: 56 },
        { title: "Capítulo 4: Conclusión", page: 89 }
      ]
    };
  },
  computed: {
    currentPage() {
      return Math.floor(this.progress * this.pages / 100) || 1;
    },
    pdfViewerUrl() {
      let url = this.book.pdfUrl || this.book.url;
      if (!url) return '';
      // Enhance with theme or page if possible (depends on viewer)
      return url;
    }
  },
  methods: {
    startReading() {
      this.showPdf = true;
    },
    zoomIn() {
      if (this.zoom < 200) this.zoom += 10;
    },
    zoomOut() {
      if (this.zoom > 50) this.zoom -= 10;
    },
    jumpToChapter(idx) {
      const chap = this.chapters[idx];
      this.currentChapter = idx;
      this.progress = Math.round((chap.page / this.pages) * 100);
      if (window.innerWidth < 1024) this.sidebarOpen = false;
    },
    toggleIndexList() {
      this.indexListVisible = !this.indexListVisible;
    },
    toggleSettings() {
      // Logic for more settings
    }
  },
  watch: {
    book: {
      immediate: true,
      handler(nb) {
        if (nb && nb.pages) {
          this.pages = parseInt(nb.pages.toString().replace(/\D/g, '')) || 100;
        }
        this.showPdf = false;
        this.sidebarOpen = false;
      }
    },
    active(val) {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.book-reader-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: #f8f9fa;
  font-family: 'Inter', sans-serif;
  color: #1a1a1b;
  overflow: hidden;
  transition: background 0.3s ease;
}

.book-reader-overlay.dark-mode {
  background: #0f0f10;
  color: #e4e4e7;
}

/* Layout */
.reader-layout {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reader-sidebar {
  width: 300px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  transform: translateX(-100%);
  transition: transform 0.4s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.dark-mode .reader-sidebar {
  background: #18181b;
  border-right-color: #27272a;
}

.sidebar-open .reader-sidebar {
  transform: translateX(0);
}

.reader-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Sidebar Elements */
.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.dark-mode .sidebar-header { border-bottom-color: #27272a; }

.chapter-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.chapter-item {
  display: flex;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 5px;
  transition: background 0.2s;
}

.chapter-item:hover { background: #f3f4f6; }
.dark-mode .chapter-item:hover { background: #27272a; }

.chapter-item.active {
  background: #fff1f2;
  color: #e11d48;
}

.chap-num {
  width: 24px;
  font-weight: 600;
  font-size: 14px;
}

.chap-info {
  display: flex;
  flex-direction: column;
}

.chap-title { font-weight: 500; font-size: 14px; }
.chap-page { font-size: 12px; color: #71717a; }

/* Header */
.reader-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.dark-mode .reader-header {
  background: #0f0f10;
  border-bottom-color: #27272a;
}

.header-left { display: flex; align-items: center; gap: 8px; }

.document-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.icon-btn {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: inherit;
  font-size: 18px;
}

.icon-btn:hover { background: #f3f4f6; }
.dark-mode .icon-btn:hover { background: #18181b; }

.header-center { display: flex; align-items: center; gap: 20px; }

.zoom-controls {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
  gap: 12px;
}

.dark-mode .zoom-controls { background: #18181b; }

.zoom-controls button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: inherit;
}

.zoom-val { font-size: 13px; font-weight: 600; min-width: 45px; text-align: center; }

/* Main Viewer */
.reader-body {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.book-cover-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.cover-glow {
  position: absolute;
  width: 300px;
  height: 450px;
  background: #e11d48;
  filter: blur(100px);
  opacity: 0.15;
  z-index: 0;
}

.large-cover {
  width: 240px;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  z-index: 1;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.large-cover:hover { transform: scale(1.05) rotate(2deg); }

.book-details { margin-top: 30px; text-align: center; z-index: 1; }
.book-h1 { font-size: 28px; font-weight: 800; margin-bottom: 5px; }
.book-author-p { font-size: 16px; color: #71717a; margin-bottom: 30px; }

.start-read-btn {
  background: #e11d48;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 30px rgba(225, 29, 72, 0.3);
  transition: all 0.3s;
}

.start-read-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(225, 29, 72, 0.4);
}

/* PDF Workspace */
.pdf-workspace {
  width: 100%;
  height: 100%;
  background: #525659;
}

.pdf-view-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.overlay-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Floating Redesigned Card (Image 2) */
.floating-controls-wrap {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 480px;
  z-index: 1000;
}

.reader-glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  padding: 18px 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.dark-mode .reader-glass-card {
  background: rgba(24, 24, 27, 0.85);
  border-color: rgba(63, 63, 70, 0.5);
}

.card-row { margin-bottom: 12px; width: 100%; }
.card-row:last-child { margin-bottom: 0; }

.card-header-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  cursor: pointer;
  padding: 2px 0;
}

.index-label { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; }
.index-label i { font-size: 14px; transition: transform 0.3s; color: #71717a; }
.index-label i.rotate { transform: rotate(180deg); }

.percent-label { color: #71717a; font-size: 14px; font-weight: 500; }

.modern-slider {
  width: 100%;
  appearance: none;
  height: 4px;
  background: #f1f1f1;
  border-radius: 2px;
  outline: none;
}

.dark-mode .modern-slider { background: #3f3f46; }

.modern-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border: 5px solid #e11d48;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
}

.page-counter-row { font-size: 15px; color: #a1a1aa; font-weight: 500; }

.toolbar-row {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.dark-mode .toolbar-row { border-top-color: rgba(255,255,255,0.05); }

.tool-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #3f3f46;
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .tool-btn { color: #a1a1aa; }

.tool-btn:hover { opacity: 1; transform: scale(1.1); color: #e11d48; }

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .desk-only { display: none; }
  .reader-sidebar {
    position: fixed;
    height: 100%;
    width: 85%;
    max-width: 320px;
  }
}

/* Animations */
.reader-anim-enter-active, .reader-anim-leave-active {
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.reader-anim-enter, .reader-anim-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
</style>
>
