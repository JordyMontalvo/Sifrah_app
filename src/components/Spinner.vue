<template>
  <div
    class="spinner"
    :style="{ width: size + 'px', height: size + 'px', borderColor: color }"
  ></div>
</template>

<script>
export default {
  name: "Spinner",
  props: {
    size: { type: Number, default: 40 },
    color: { type: String, default: "#086eb6" },
  },
};
</script>

<style scoped>
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #086eb6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
