<template>
  <svg viewBox="0 0 100 60" class="rank-gauge-icon" :class="svgClass">
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4a4a4a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f5f5f5" stroke-width="10" />
    <path d="M 12 45 A 38 38 0 0 1 28 18" fill="none" stroke="#f953c6" stroke-width="9" />
    <path d="M 32 16 A 38 38 0 0 1 48 12" fill="none" stroke="#ff9800" stroke-width="9" />
    <path d="M 52 12 A 38 38 0 0 1 68 16" fill="none" stroke="#a08c35" stroke-width="9" />
    <path d="M 72 18 A 38 38 0 0 1 88 45" fill="none" stroke="#444" stroke-width="9" />
    <circle cx="50" cy="50" r="2" fill="#ccc" />
    <g class="rank-gauge-needle" :style="{ transform: `rotate(${needleRotation}deg)` }">
      <path d="M 50 50 L 47 50 L 50 10 L 53 50 Z" :fill="`url(#${gradientId})`" />
      <circle cx="50" cy="50" r="6" fill="#333" />
      <circle cx="50" cy="50" r="2" fill="#666" />
    </g>
  </svg>
</template>

<script>
let gaugeIdCounter = 0;

export default {
  name: "RankGaugeIcon",
  props: {
    percentage: {
      type: Number,
      default: 70,
    },
    svgClass: {
      type: String,
      default: "",
    },
  },
  data() {
    gaugeIdCounter += 1;
    return {
      gradientId: `rankGaugeNeedle-${gaugeIdCounter}`,
    };
  },
  computed: {
    needleRotation() {
      const value = Math.max(0, Math.min(100, this.percentage));
      return (value / 100) * 180 - 90;
    },
  },
};
</script>

<style scoped>
.rank-gauge-icon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

.rank-gauge-needle {
  transform-origin: 50px 50px;
  transition: transform 1.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
