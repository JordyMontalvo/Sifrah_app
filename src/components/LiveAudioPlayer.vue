<template>
  <div class="live-audio">
    <!-- No se pudo comprobar el estado: no asumir que esta fuera del aire -->
    <div v-if="statusError" id="live-status-error" class="live-card live-card--neutral" role="status">
      <div class="live-card__icon"><i class="fas fa-wifi"></i></div>
      <h3 class="live-card__title">No pudimos comprobar la transmisión</h3>
      <p class="live-card__text">Revisa tu conexión e inténtalo nuevamente.</p>
      <button id="live-retry-btn" class="live-btn live-btn--outline" @click="$emit('retry')">
        <i class="fas fa-redo"></i> Reintentar
      </button>
    </div>

    <!-- Fuera del aire -->
    <div v-else-if="!live" id="live-offair" class="live-card live-card--offair" role="status">
      <div class="live-card__icon"><i class="fas fa-microphone-slash"></i></div>
      <h3 class="live-card__title">Estamos fuera del aire</h3>
      <p class="live-card__text">Pronto volveremos a conectar</p>
      <button class="live-btn live-btn--disabled" disabled aria-disabled="true">
        <i class="fas fa-play"></i> Escuchar
      </button>
    </div>

    <!-- En vivo (antes de escuchar / conectando / escuchando) -->
    <div v-else id="live-onair" class="live-card live-card--onair">
      <div class="live-card__top">
        <span class="live-badge" aria-label="En vivo"><span class="live-badge__dot"></span> EN VIVO</span>
        <span v-if="listeners !== null" class="live-listeners">
          <i class="fas fa-headphones"></i> {{ listeners }}
        </span>
      </div>

      <div class="live-card__body">
        <img v-if="live.image" :src="live.image" :alt="live.title" class="live-cover" />
        <div v-else class="live-cover live-cover--placeholder"><i class="fas fa-broadcast-tower"></i></div>
        <div class="live-info">
          <h3 class="live-title">{{ live.title }}</h3>
          <p class="live-author">con {{ live.author }}</p>
          <p v-if="live.description" class="live-desc">{{ live.description }}</p>
        </div>
      </div>

      <!-- Esperando al expositor: SIFRAH lo marco en vivo pero AzuraCast aun no recibe audio -->
      <div v-if="waitingForStreamer" class="live-state" role="status">
        <span class="live-spinner"></span> Esperando al expositor…
      </div>

      <!-- Conectando / reconectando: nunca decir "escuchando" sin audio real -->
      <div v-else-if="state === 'connecting'" class="live-state" role="status">
        <span class="live-spinner"></span> {{ reconnectAttempts > 0 ? 'Reconectando…' : 'Conectando…' }}
      </div>

      <div v-else-if="state === 'playing'" class="live-state live-state--playing" role="status">
        <div class="live-waves" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        Estás escuchando en vivo
      </div>

      <div v-else-if="state === 'error'" class="live-state live-state--error" role="alert">
        No se pudo reproducir la transmisión. Intenta nuevamente.
      </div>

      <div class="live-controls">
        <button
          v-if="state === 'playing' || state === 'connecting'"
          id="live-pause-btn"
          class="live-btn live-btn--light"
          @click="pause"
        >
          <i class="fas fa-pause"></i> Pausar
        </button>
        <button
          v-else
          id="live-listen-btn"
          class="live-btn live-btn--light"
          :disabled="waitingForStreamer || !streamUrl"
          @click="listen"
        >
          <i class="fas fa-play"></i> Escuchar
        </button>

        <label class="live-volume" for="live-volume-input">
          <i class="fas fa-volume-up" aria-hidden="true"></i>
          <input
            id="live-volume-input"
            type="range"
            min="0"
            max="1"
            step="0.05"
            v-model.number="volume"
            aria-label="Volumen"
          />
        </label>
      </div>
    </div>

    <!-- Proximas transmisiones -->
    <section v-if="upcoming && upcoming.length" class="live-upcoming" aria-labelledby="live-upcoming-title">
      <h4 id="live-upcoming-title" class="live-upcoming__title">Próximas transmisiones</h4>
      <div v-for="b in upcoming" :key="b.id" class="upcoming-item">
        <div class="upcoming-info">
          <p class="upcoming-title">{{ b.title }}</p>
          <p class="upcoming-meta">{{ b.author }}</p>
          <p class="upcoming-meta upcoming-date">
            <i class="far fa-calendar"></i> {{ formatDate(b.scheduled_start) }}
          </p>
        </div>
        <div class="upcoming-actions">
          <button
            :id="'remind-btn-' + b.id"
            class="remind-btn"
            :disabled="!b.scheduled_start"
            @click="toggleRemind(b.id)"
          >
            <i class="far fa-bell"></i> Recordarme
          </button>
          <div v-if="remindOpen === b.id" class="remind-menu" role="menu">
            <a role="menuitem" :href="googleCalendarUrl(b)" target="_blank" rel="noopener" @click="remindOpen = null">
              <i class="fab fa-google"></i> Google Calendar
            </a>
            <button role="menuitem" @click="downloadIcs(b)">
              <i class="far fa-calendar-plus"></i> Apple / Outlook (.ics)
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Audio oculto. El src se asigna solo al escuchar para no descargar en segundo plano. -->
    <audio
      ref="liveAudio"
      preload="none"
      @playing="onPlaying"
      @waiting="onWaiting"
      @stalled="onWaiting"
      @error="onError"
      @ended="onError"
    ></audio>
  </div>
</template>

<script>
const TZ = "America/Lima";
const MAX_RECONNECT = 5;
// Duracion por defecto si el encuentro no tiene hora de fin (para el calendario).
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

export default {
  name: "LiveAudioPlayer",
  props: {
    live: { type: Object, default: null },
    upcoming: { type: Array, default: () => [] },
    azuracast: { type: Object, default: () => ({}) },
    statusError: { type: Boolean, default: false },
  },
  data() {
    return {
      // idle | connecting | playing | error
      state: "idle",
      wantsToPlay: false,
      reconnectAttempts: 0,
      reconnectTimer: null,
      volume: 1,
      remindOpen: null,
    };
  },
  computed: {
    streamUrl() {
      return this.live ? this.live.stream_url || "" : "";
    },
    listeners() {
      const a = this.azuracast || {};
      // Se oculta cuando no hay nadie escuchando.
      return a.reachable && typeof a.listeners === "number" && a.listeners > 0 ? a.listeners : null;
    },
    // Solo si AzuraCast respondio y dice explicitamente que no hay DJ conectado.
    // Si no se pudo consultar, no se bloquea al socio.
    waitingForStreamer() {
      const a = this.azuracast || {};
      return !!(this.live && a.configured && a.reachable && a.onair === false);
    },
  },
  watch: {
    volume(v) {
      if (this.$refs.liveAudio) this.$refs.liveAudio.volume = v;
    },
    // Si la emision termina (o cambia) mientras se escucha, se detiene.
    live(newVal, oldVal) {
      const changed = !newVal || !oldVal || newVal.id !== oldVal.id;
      if (changed && this.wantsToPlay) this.stop();
    },
    waitingForStreamer(waiting) {
      if (waiting && this.wantsToPlay) this.stop();
    },
  },
  methods: {
    listen() {
      if (!this.streamUrl) return;
      this.wantsToPlay = true;
      this.reconnectAttempts = 0;
      this.$emit("play");
      this.connect();
    },
    // Retomar el directo = reconectar al punto en vivo (no continuar lo almacenado).
    connect() {
      const el = this.$refs.liveAudio;
      if (!el) return;
      this.state = "connecting";
      const sep = this.streamUrl.includes("?") ? "&" : "?";
      el.src = `${this.streamUrl}${sep}_t=${Date.now()}`;
      el.volume = this.volume;
      el.play().catch((e) => {
        console.error("[live] play() rechazado:", e);
        this.onError();
      });
    },
    pause() {
      this.stop();
    },
    stop() {
      this.wantsToPlay = false;
      clearTimeout(this.reconnectTimer);
      const el = this.$refs.liveAudio;
      if (el) {
        el.pause();
        // Corta la descarga del stream.
        el.removeAttribute("src");
        el.load();
      }
      this.state = "idle";
    },
    onPlaying() {
      if (!this.wantsToPlay) return;
      this.state = "playing";
      this.reconnectAttempts = 0;
    },
    onWaiting() {
      if (this.wantsToPlay && this.state === "playing") this.state = "connecting";
    },
    onError() {
      if (!this.wantsToPlay) return;
      if (this.reconnectAttempts >= MAX_RECONNECT) {
        this.wantsToPlay = false;
        this.state = "error";
        return;
      }
      this.reconnectAttempts += 1;
      this.state = "connecting";
      clearTimeout(this.reconnectTimer);
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
      this.reconnectTimer = setTimeout(() => {
        if (this.wantsToPlay) this.connect();
      }, delay);
    },

    // --- Proximas / calendario ---
    formatDate(value) {
      if (!value) return "Fecha por confirmar";
      const d = new Date(value);
      if (isNaN(d)) return "Fecha por confirmar";
      const txt = d.toLocaleString("es-PE", {
        timeZone: TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      // Solo la primera letra en mayuscula: "Viernes, 23 de octubre, ..."
      return `${txt.charAt(0).toUpperCase()}${txt.slice(1)} (hora de Perú)`;
    },
    toggleRemind(id) {
      this.remindOpen = this.remindOpen === id ? null : id;
    },
    eventTimes(b) {
      const start = new Date(b.scheduled_start);
      const end = b.scheduled_end ? new Date(b.scheduled_end) : new Date(start.getTime() + DEFAULT_DURATION_MS);
      return { start, end };
    },
    // Formato UTC compacto de calendario: 20261021T190000Z
    calStamp(d) {
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    },
    returnLink() {
      return `${window.location.origin}/audios?tab=en-vivo`;
    },
    eventDescription(b) {
      return [b.description, `Expositor: ${b.author}`, `Escúchalo en SIFRAH: ${this.returnLink()}`]
        .filter(Boolean)
        .join("\n\n");
    },
    googleCalendarUrl(b) {
      if (!b.scheduled_start) return "#";
      const { start, end } = this.eventTimes(b);
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: b.title,
        dates: `${this.calStamp(start)}/${this.calStamp(end)}`,
        details: this.eventDescription(b),
        location: this.returnLink(),
        ctz: TZ,
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    },
    icsEscape(text) {
      return String(text || "")
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");
    },
    downloadIcs(b) {
      if (!b.scheduled_start) return;
      const { start, end } = this.eventTimes(b);
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SIFRAH//Audio en vivo//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${b.id}@sifrah`,
        `DTSTAMP:${this.calStamp(new Date())}`,
        `DTSTART:${this.calStamp(start)}`,
        `DTEND:${this.calStamp(end)}`,
        `SUMMARY:${this.icsEscape(b.title)}`,
        `DESCRIPTION:${this.icsEscape(this.eventDescription(b))}`,
        `URL:${this.returnLink()}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sifrah-en-vivo-${b.id}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.remindOpen = null;
    },
  },
  beforeDestroy() {
    this.stop();
  },
};
</script>

<style scoped>
.live-audio {
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
}

.live-card {
  border-radius: 20px;
  padding: 22px 20px;
  margin-bottom: 22px;
  text-align: center;
}

.live-card--offair,
.live-card--neutral {
  background: #f0f0f0;
  color: #555;
}

.live-card--onair {
  background: linear-gradient(135deg, #e91e63 0%, #ff4081 100%);
  color: #fff;
  text-align: left;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.28);
}

.live-card__icon {
  font-size: 30px;
  color: #999;
  margin-bottom: 8px;
}

.live-card__title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 4px;
}

.live-card__text {
  font-size: 13px;
  margin: 0 0 16px;
}

.live-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.live-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  animation: live-pulse 1.4s infinite;
}

.live-listeners {
  font-size: 12px;
  opacity: 0.9;
}

.live-card__body {
  display: flex;
  gap: 14px;
  align-items: center;
}

.live-cover {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
}

.live-cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.live-info {
  min-width: 0;
}

.live-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 2px;
  line-height: 1.25;
}

.live-author {
  font-size: 13px;
  margin: 0;
  opacity: 0.92;
}

.live-desc {
  font-size: 12px;
  margin: 6px 0 0;
  opacity: 0.85;
}

.live-state {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 500;
}

.live-state--error {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 10px;
}

.live-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.live-btn {
  border: none;
  border-radius: 24px;
  padding: 10px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.live-btn--light {
  background: #fff;
  color: #e91e63;
}

.live-btn--light:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.live-btn--outline {
  background: transparent;
  border: 1.5px solid #999;
  color: #555;
}

.live-btn--disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
}

.live-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 120px;
}

.live-volume input {
  flex: 1;
  accent-color: #fff;
}

.live-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: live-spin 0.8s linear infinite;
}

.live-waves {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.live-waves span {
  width: 3px;
  background: #fff;
  border-radius: 2px;
  animation: live-wave 1s ease-in-out infinite;
}

.live-waves span:nth-child(2) { animation-delay: 0.15s; }
.live-waves span:nth-child(3) { animation-delay: 0.3s; }
.live-waves span:nth-child(4) { animation-delay: 0.45s; }
.live-waves span:nth-child(5) { animation-delay: 0.6s; }

.live-upcoming__title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.upcoming-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.upcoming-info {
  min-width: 0;
}

.upcoming-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px;
}

.upcoming-meta {
  font-size: 12px;
  color: #777;
  margin: 0;
}

.upcoming-date {
  margin-top: 4px;
  color: #e91e63;
}

.upcoming-actions {
  position: relative;
  flex-shrink: 0;
}

.remind-btn {
  background: #fff0f5;
  color: #e91e63;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.remind-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remind-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 20;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  overflow: hidden;
}

.remind-menu a,
.remind-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
}

.remind-menu a:hover,
.remind-menu button:hover {
  background: #fff0f5;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@keyframes live-spin {
  to { transform: rotate(360deg); }
}

@keyframes live-wave {
  0%, 100% { height: 4px; }
  50% { height: 18px; }
}
</style>
