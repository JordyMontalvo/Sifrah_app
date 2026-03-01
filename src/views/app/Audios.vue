<template>
  <App :session="session" title="Audios">
    <div class="audios-view">
    <!-- Header -->
    <header class="audios-header">
      <div class="header-top">
        <button class="back-btn" @click="$router.push('/dashboard')">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="header-title">Audios</h1>
        <div class="header-actions">
          <i class="far fa-bell"></i>
          <i class="fas fa-share-alt"></i>
        </div>
      </div>
      <p class="header-subtitle">Escucha y aprende en minutos</p>
    </header>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Buscar audio..." v-model="searchQuery" />
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab" 
        :class="['tab-item', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Category Chips -->
    <div class="category-chips">
      <button 
        v-for="cat in categories" 
        :key="cat" 
        :class="['chip-item', { active: activeCategory === cat }]"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Audio List -->
    <div class="audio-list">
      <div v-for="audio in filteredAudios" :key="audio.id" class="audio-card">
        <div class="audio-icon-wrapper">
          <div class="audio-icon-ping">
            <i class="fas fa-microphone"></i>
          </div>
        </div>
        <div class="audio-info">
          <h3 class="audio-title">{{ audio.title }}</h3>
          <div class="audio-meta">
            <span class="audio-tag" :class="audio.categoryClass">{{ audio.category }}</span>
            <span class="audio-duration">{{ audio.duration }}</span>
          </div>
          <p class="audio-author">{{ audio.author }}</p>
        </div>
        <div class="audio-actions">
          <button class="fav-btn" @click.stop="toggleFavorite(audio._id)">
            <i :class="[isFavorite(audio._id) ? 'fas fa-heart active' : 'far fa-heart']"></i>
          </button>
          <button class="play-btn-list" @click="playAudio(audio)">
            <i :class="isPlaying && currentAudio && currentAudio._id === audio._id ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mini Player -->
    <div v-if="currentAudio" class="mini-player">
      <div class="player-content">
        <div class="player-icon-wrapper">
          <div class="player-icon">
             <i class="fas fa-microphone"></i>
          </div>
        </div>
        <div class="player-info">
          <h4 class="player-title" v-if="!playbackError">{{ currentAudio.title }}</h4>
          <h4 class="player-title" v-else style="color: #ff5252; font-size: 10px;">{{ playbackError }}</h4>
          <div class="player-time-row" v-if="!playbackError">
            <span class="time-current">{{ formattedCurrentTime }}</span>
            <div class="progress-bar-container" @click="seek">
              <div class="progress-bg"></div>
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              <div class="progress-knob" :style="{ left: progressPercent + '%' }"></div>
            </div>
            <span class="time-total">{{ currentAudio.duration }}</span>
          </div>
        </div>
        <div class="player-controls">
          <button class="pause-btn" v-if="isPlaying" @click="togglePlay">
            <i class="fas fa-pause"></i>
          </button>
          <button class="play-btn-main" v-else @click="togglePlay">
            <i class="fas fa-play"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden Audio Player -->
    <audio 
      ref="audioPlayer" 
      :src="currentAudio ? currentAudio.url : ''"
      @timeupdate="updateProgress"
      @loadedmetadata="onLoadedMetadata"
      @ended="onAudioEnded"
      @error="onPlaybackError"
    ></audio>

  </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

export default {
  components: {
    App
  },
  data() {
    return {
      searchQuery: "",
      activeTab: "Todos",
      activeCategory: "Todos",
      loading: true,
      tabs: ["Todos", "Nuevos", "Favoritos", "Descargados"],
      categories: ["Todos", "Bienvenida", "Prospección", "Presentación", "Seguimiento", "Liderazgo", "Producto", "Mentalidad"],
      currentAudio: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackError: null,
      favorites: JSON.parse(localStorage.getItem('audio_favorites') || '[]'),
      audios: []
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    progressPercent() {
      if (this.playbackError) return 0;
      return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
    },
    formattedCurrentTime() {
      return this.formatTime(this.currentTime);
    },
    filteredAudios() {
      return this.audios.filter(audio => {
        const matchesSearch = audio.title.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Tab filtering
        let matchesTab = true;
        if (this.activeTab === "Favoritos") matchesTab = this.isFavorite(audio._id);
        if (this.activeTab === "Nuevos") {
           matchesTab = this.isRecent(audio.created_at);
        }

        const matchesCategory = this.activeCategory === "Todos" || audio.category === this.activeCategory;
        
        return matchesSearch && matchesCategory && matchesTab;
      });
    }
  },
  methods: {
    isRecent(date) {
      if (!date) return false;
      const created = new Date(date);
      const now = new Date();
      return (now - created) < (24 * 60 * 60 * 1000); // 24 hours
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    updateProgress() {
      this.currentTime = this.$refs.audioPlayer.currentTime;
    },
    onLoadedMetadata() {
      this.duration = this.$refs.audioPlayer.duration;
      
      // Update the current audio duration in the UI if it was previously 00:00
      if (this.currentAudio && (this.currentAudio.duration === "00:00" || !this.currentAudio.duration)) {
        this.currentAudio.duration = this.formatTime(this.duration);
      }
    },
    onAudioEnded() {
      this.isPlaying = false;
      this.currentTime = 0;

      // Auto-play logic: find next audio in the filtered list
      if (this.currentAudio) {
        const currentIndex = this.filteredAudios.findIndex(a => a._id === this.currentAudio._id);
        if (currentIndex !== -1 && currentIndex < this.filteredAudios.length - 1) {
          const nextAudio = this.filteredAudios[currentIndex + 1];
          this.$nextTick(() => {
            this.playAudio(nextAudio);
          });
        }
      }
    },
    onPlaybackError() {
      this.isPlaying = false;
      this.playbackError = "Error: El link no es un archivo de audio directo (procura que termine en .mp3)";
      console.error("Link de audio inválido:", this.currentAudio ? this.currentAudio.url : "N/A");
    },
    togglePlay() {
      if (!this.currentAudio) return;
      this.playbackError = null;
      
      const player = this.$refs.audioPlayer;
      if (this.isPlaying) {
        player.pause();
      } else {
        player.play().catch(e => {
          console.error("Playback error:", e);
          this.onPlaybackError();
        });
      }
      this.isPlaying = !this.isPlaying;
    },
    async fetchAudios() {
      try {
        this.loading = true;
        const res = await api.Audios.GET();
        if (res.data && res.data.audios) {
          this.audios = res.data.audios.map(a => ({
            ...a,
            categoryClass: (a.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          }));
        }
      } catch (err) {
        console.error("Error fetching audios:", err);
      } finally {
        this.loading = false;
      }
    },
    playAudio(audio) {
      if (this.currentAudio && this.currentAudio._id === audio._id) {
        this.togglePlay();
      } else {
        this.currentAudio = audio;
        this.isPlaying = false;
        this.$nextTick(() => {
          this.togglePlay();
        });
      }
    },
    toggleFavorite(audioId) {
      const index = this.favorites.indexOf(audioId);
      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(audioId);
      }
      localStorage.setItem('audio_favorites', JSON.stringify(this.favorites));
    },
    isFavorite(audioId) {
      return this.favorites.includes(audioId);
    },
    seek(event) {
      if (!this.currentAudio || !this.duration) return;
      
      const container = event.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left; // x position within the element
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, x / width));
      
      this.$refs.audioPlayer.currentTime = percentage * this.duration;
    },
    handleNavigationClick() {
      // Logic for navigation clicks if needed
    }
  },
  async created() {
    await this.fetchAudios();
  }
};
</script>

<style scoped src="../../assets/style/views/app/Audios.css"></style>
