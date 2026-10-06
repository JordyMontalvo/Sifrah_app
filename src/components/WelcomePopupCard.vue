<template>
  <div class="wpc" :class="{ 'is-preview': preview }">
    <div class="wpc-confetti" aria-hidden="true">
      <span v-for="n in 14" :key="n" :class="'c' + n"></span>
    </div>
    <button class="wpc-close" type="button" aria-label="Cerrar" @click="$emit('close')">×</button>
    <h2 class="wpc-title" v-html="titleHtml"></h2>
    <p v-if="message" class="wpc-message">{{ message }}</p>

    <div v-if="video" class="wpc-video" :class="{ playing: playing, 'is-embed': !!embedSrc }">
      <iframe
        v-if="embedSrc"
        :src="embedSrc"
        title="Video de bienvenida"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      ></iframe>
      <template v-else>
        <video
          ref="player"
          :src="video"
          playsinline
          @timeupdate="onTime"
          @loadedmetadata="onMeta"
          @ended="playing = false"
          @click="togglePlay"
        ></video>
        <button v-if="!playing" class="wpc-play" type="button" aria-label="Reproducir" @click="togglePlay">
          <svg viewBox="7 4 13 16" aria-hidden="true"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg>
        </button>
        <div class="wpc-bar">
          <button type="button" class="wpc-bar-play" @click="togglePlay">{{ playing ? "❚❚" : "▶" }}</button>
          <span>{{ timeLabel }}</span>
          <i></i>
          <span class="wpc-vol">🔊</span>
          <span class="wpc-full">⛶</span>
        </div>
      </template>
      <div class="wpc-badge">
        <span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10l9-5-9-5z" fill="currentColor"/></svg>
        </span>
        Video de bienvenida
      </div>
    </div>

    <div v-if="footerText" class="wpc-note">
      <span class="wpc-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      </span>
      <p v-html="footerHtml"></p>
    </div>

    <button v-if="primaryText" class="wpc-primary" type="button" @click="$emit('primary')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
      {{ primaryText }}
    </button>
    <button v-if="secondaryText" class="wpc-secondary" type="button" @click="$emit('secondary')">{{ secondaryText }}</button>
  </div>
</template>

<script>
function embedVideoUrl(value) {
  const url = String(value || "").trim();
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtube) return "https://www.youtube.com/embed/" + youtube[1];
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return "https://player.vimeo.com/video/" + vimeo[1];
  return "";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default {
  name: "WelcomePopupCard",
  props: {
    title: { type: String, default: "" },
    message: { type: String, default: "" },
    video: { type: String, default: "" },
    icon: { type: String, default: "" },
    footerText: { type: String, default: "" },
    primaryText: { type: String, default: "" },
    secondaryText: { type: String, default: "" },
    preview: { type: Boolean, default: false },
  },
  data() {
    return { playing: false, current: 0, duration: 0 };
  },
  computed: {
    titleHtml() {
      const title = escapeHtml(this.title);
      const match = title.match(/^(.*?)(\s+a\s+SIFRAH!?)$/i);
      if (match) {
        return match[1] + "<br><span class=\"wpc-pink\">" + match[2].trim() + "</span>";
      }
      return title.replace(/SIFRAH/gi, "<span class=\"wpc-pink\">SIFRAH</span>");
    },
    footerHtml() {
      return escapeHtml(this.footerText).replace(/lo esencial/gi, "<b class=\"wpc-pink\">lo esencial</b>");
    },
    embedSrc() {
      return embedVideoUrl(this.video);
    },
    timeLabel() {
      const fmt = (s) => {
        const n = Math.max(0, Math.floor(s || 0));
        return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0");
      };
      return fmt(this.current) + " / " + fmt(this.duration);
    },
  },
  watch: {
    video() {
      this.playing = false;
      this.current = 0;
      this.duration = 0;
    },
  },
  methods: {
    onMeta() {
      const el = this.$refs.player;
      this.duration = el && el.duration ? el.duration : 0;
    },
    onTime() {
      const el = this.$refs.player;
      this.current = el ? el.currentTime : 0;
    },
    togglePlay() {
      const el = this.$refs.player;
      if (!el) return;
      if (el.paused) {
        el.play();
        this.playing = true;
      } else {
        el.pause();
        this.playing = false;
      }
    },
  },
};
</script>

<style scoped>
.wpc {
  position: relative;
  background: linear-gradient(180deg, #fff5f9 0%, #ffffff 42%);
  border-radius: 28px;
  padding: 28px 18px 16px;
  text-align: center;
  overflow: hidden;
}
.wpc-confetti span {
  position: absolute;
  width: 7px;
  height: 11px;
  border-radius: 2px;
  opacity: 0.9;
}
.wpc-confetti .c1 { top: 18px; left: 18px; background: #f472b6; transform: rotate(18deg); }
.wpc-confetti .c2 { top: 36px; left: 40px; background: #fbbf24; transform: rotate(-20deg); }
.wpc-confetti .c3 { top: 22px; right: 54px; background: #fb7185; transform: rotate(28deg); }
.wpc-confetti .c4 { top: 48px; right: 28px; background: #f59e0b; transform: rotate(-12deg); }
.wpc-confetti .c5 { top: 70px; left: 22px; background: #f9a8d4; transform: rotate(40deg); }
.wpc-confetti .c6 { top: 86px; right: 18px; background: #fcd34d; transform: rotate(8deg); }
.wpc-confetti .c7 { top: 12px; left: 48%; background: #f472b6; transform: rotate(-30deg); }
.wpc-confetti .c8 { top: 58px; left: 52%; background: #fbbf24; transform: rotate(15deg); }
.wpc-confetti .c9 { top: 96px; left: 12%; background: #fb7185; width: 6px; height: 6px; border-radius: 50%; }
.wpc-confetti .c10 { top: 110px; right: 16%; background: #f472b6; width: 6px; height: 6px; border-radius: 50%; }
.wpc-confetti .c11 { top: 8px; right: 22%; background: #fcd34d; transform: rotate(50deg); }
.wpc-confetti .c12 { top: 130px; left: 8%; background: #f9a8d4; transform: rotate(-25deg); }
.wpc-confetti .c13 { top: 40px; left: 62%; background: #fb7185; transform: rotate(12deg); }
.wpc-confetti .c14 { top: 78px; left: 72%; background: #f59e0b; transform: rotate(-40deg); }
.wpc-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.12);
  color: #64748b;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  z-index: 3;
}
.wpc-title {
  margin: 8px 18px 8px;
  font-size: 2rem;
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #111827;
}
.wpc >>> .wpc-pink { color: #e91e63; }
.wpc-message {
  margin: 0 auto 16px;
  max-width: 320px;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.45;
}
.wpc-video {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #1f2937;
  aspect-ratio: 16 / 9;
}
.wpc-video video,
.wpc-video iframe {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border: 0;
  background: #111;
}
.wpc-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 82px;
  height: 82px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.wpc-play svg {
  width: 46px;
  height: 46px;
  margin-left: 4px;
}
.wpc-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(17, 24, 39, 0.62);
  color: #fff;
  border-radius: 999px;
  padding: 4px 12px 4px 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}
.wpc-badge span {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  color: #e91e63;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.wpc-badge svg {
  width: 12px;
  height: 12px;
  margin-left: 1px;
}
.wpc-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
  font-size: 11px;
}
.wpc-bar-play { background: none; border: 0; color: #fff; cursor: pointer; }
.wpc-bar i {
  flex: 1;
  height: 4px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.35);
}
.wpc-note {
  display: flex;
  gap: 12px;
  text-align: left;
  background: #fff1f6;
  border-radius: 18px;
  padding: 12px;
  margin: 14px 0 8px;
}
.wpc-icon {
  width: 44px;
  height: 44px;
  border: 1.5px solid #f9a8d4;
  border-radius: 50%;
  color: #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #fff;
}
.wpc-icon svg, .wpc-icon img { width: 24px; height: 24px; object-fit: contain; }
.wpc-note p { margin: 0; color: #334155; font-size: 0.9rem; line-height: 1.4; }
.wpc-primary, .wpc-secondary {
  width: 100%;
  border-radius: 999px;
  padding: 13px 16px;
  font-family: "Segoe UI", "Inter", "Open Sans", sans-serif;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  margin-top: 8px;
  cursor: pointer;
}
.wpc-primary {
  background: #e91e63;
  color: #fff;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.wpc-primary svg { width: 18px; height: 18px; }
.wpc-secondary {
  background: #fff;
  color: #e91e63;
  border: 1.5px solid #e91e63;
}
.is-preview .wpc-play, .is-preview .wpc-bar { pointer-events: none; }
</style>
