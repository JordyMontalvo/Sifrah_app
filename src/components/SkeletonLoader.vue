<template>
  <div class="skeleton-loader">
    <div
      v-for="n in lines"
      :key="n"
      class="skeleton-line"
      :style="{ width: width, height: height }"
    ></div>
  </div>
</template>

<script>
export default {
  name: "SkeletonLoader",
  props: {
    lines: { type: Number, default: 3 },
    width: { type: String, default: "100%" },
    height: { type: String, default: "16px" },
  },
};
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skeleton-line {
  background: linear-gradient(90deg, #ececec 25%, #f3f3f3 50%, #ececec 75%);
  border-radius: 6px;
  animation: skeleton-loading 1.2s infinite linear;
}
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}
</style>
