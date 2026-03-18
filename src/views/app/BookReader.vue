<template>
  <transition name="fade">
    <div v-if="active" class="book-reader-overlay">
      <!-- Top Bar -->
      <header class="reader-header">
        <button class="icon-btn close-btn" @click="$emit('close')" title="Cerrar">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-right">
          <button class="icon-btn"><i class="fas fa-search"></i></button>
          <button class="icon-btn"><i class="fas fa-share-alt"></i></button>
          <button class="icon-btn"><i class="fas fa-download"></i></button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="reader-body" :class="{ 'reading': showPdf }">
        <div v-if="!showPdf" class="book-display">
          <div class="book-cover-container">
            <img :src="book.image || defaultImage" alt="Cover" class="reader-cover" />
          </div>
          <h2 class="reader-title">{{ book.title }}</h2>
          <p class="reader-subtitle">{{ book.author }}</p>
          <button class="read-now-btn" @click="showPdf = true" v-if="book.pdfUrl || book.url">
            Comenzar Lectura
          </button>
        </div>
        
        <div v-else class="pdf-container">
          <iframe 
            :src="pdfViewerUrl" 
            class="pdf-iframe" 
            frameborder="0"
            allowfullscreen
          ></iframe>
          <button class="back-to-info" @click="showPdf = false">
            <i class="fas fa-info-circle"></i> Ver Portada
          </button>
        </div>
      </main>

      <!-- Bottom Controls Card -->
      <div class="reader-controls-container">
        <div class="reader-card">
          <!-- Index / Progress Header -->
          <div class="card-header">
            <div class="index-selector">
              <span>Índice</span>
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>

          <!-- Progress Slider -->
          <div class="progress-section">
            <input 
              type="range" 
              class="reader-slider" 
              v-model="progress" 
              min="0" 
              max="100"
            />
            <span class="progress-percent">{{ progress }}%</span>
          </div>

          <!-- Page Indicator -->
          <div class="page-indicator">
            {{ Math.floor(progress * pages / 100) || 1 }} / {{ pages }}
          </div>

          <!-- Bottom Toolbar -->
          <footer class="card-footer">
            <button class="footer-icon"><i class="far fa-bookmark"></i></button>
            <button class="footer-icon"><i class="fas fa-search"></i></button>
            <button class="footer-icon"><i class="fas fa-bars"></i></button>
            <button class="footer-icon"><i class="fas fa-sun"></i></button>
          </footer>
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
      defaultImage: "https://via.placeholder.com/300x450?text=Libro"
    };
  },
  computed: {
    pdfViewerUrl() {
      const url = this.book.pdfUrl || this.book.url;
      if (!url) return '';
      // For a better mobile experience, we can use Google Docs Viewer as a proxy if needed,
      // but a direct iframe usually works better for private/secure PDFs if the browser supports it.
      // We'll use the direct URL for now.
      return url;
    }
  },
  watch: {
    book: {
      immediate: true,
      handler(newBook) {
        if (newBook && newBook.pages) {
          this.pages = parseInt(newBook.pages.toString().replace(/\D/g, '')) || 100;
        }
        this.showPdf = false; // Reset view when book changes
      }
    }
  }
};
</script>

<style scoped>
.book-reader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: linear-gradient(180deg, #ffffff 0%, #fff0f5 100%);
  display: flex;
  flex-direction: column;
  color: #1a1a1a;
  font-family: 'Poppins', sans-serif;
  padding-bottom: 80px; /* Space for the footer-Dashboard on mobile */
}

@media (min-width: 1024px) {
  .book-reader-overlay {
    position: absolute;
    z-index: 50; /* Lower than sidebar (100) */
    padding-bottom: 0;
  }
}

/* Header */
.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* Main Content */
.reader-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  overflow: hidden;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.reader-body.reading {
  align-items: stretch;
  max-width: none;
}

.book-display {
  width: 100%;
  max-width: 400px;
}

.book-cover-container {
  margin-bottom: 30px;
  perspective: 1000px;
}

.reader-cover {
  width: 70%;
  max-width: 250px;
  aspect-ratio: 2 / 3;
  object-fit: contain;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.reader-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
  line-height:1.2;
}

.reader-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 25px 0;
}

.read-now-btn {
  background: #E91E63;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(233, 30, 99, 0.2);
  transition: transform 0.2s;
}

.read-now-btn:active {
  transform: scale(0.95);
}

/* PDF Viewer */
.pdf-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.pdf-iframe {
  width: 100%;
  flex: 1;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  background: white;
}

.back-to-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  border: 1px solid #ddd;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 11px;
  cursor: pointer;
  z-index: 5;
}

/* Bottom Controls */
.reader-controls-container {
  padding: 20px;
  padding-bottom: 40px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .reader-header {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .reader-body:not(.reading) .reader-cover {
    max-width: 300px;
  }
}

.reader-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.index-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.reader-slider {
  flex: 1;
  appearance: none;
  height: 6px;
  background: #f1f1f1;
  border-radius: 3px;
  outline: none;
}

.reader-slider::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  background: white;
  border: 4px solid #E91E63;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(233, 30, 99, 0.3);
}

.progress-percent {
  font-size: 14px;
  color: #666;
  min-width: 30px;
}

.page-indicator {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f5f5f5;
  padding-top: 15px;
}

.footer-icon {
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.footer-icon:hover {
  opacity: 1;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
