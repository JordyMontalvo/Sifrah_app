<template>
  <transition name="notification">
    <div v-if="show" class="floating-notification" :class="type">
      <div class="notification-content">
        <div class="notification-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="notification-text">
          <h4>{{ title }}</h4>
          <p>{{ message }}</p>
        </div>
        <button class="notification-close" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-progress" :style="{ width: progressWidth + '%' }"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'FloatingNotification',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      progressWidth: 100,
      progressInterval: null
    }
  },
  computed: {
    iconClass() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[this.type] || icons.info
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.autoClose) {
        this.startProgress()
      } else {
        this.stopProgress()
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    startProgress() {
      this.progressWidth = 100
      this.progressInterval = setInterval(() => {
        this.progressWidth -= (100 / (this.duration / 50))
        if (this.progressWidth <= 0) {
          this.close()
        }
      }, 50)
    },
    stopProgress() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
        this.progressInterval = null
      }
    }
  },
  beforeUnmount() {
    this.stopProgress()
  }
}
</script>

<style scoped>
.floating-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 9999;
  overflow: hidden;
  border-left: 4px solid;
}

.floating-notification.success {
  border-left-color: #28a745;
}

.floating-notification.error {
  border-left-color: #dc3545;
}

.floating-notification.warning {
  border-left-color: #ffc107;
}

.floating-notification.info {
  border-left-color: #17a2b8;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.floating-notification.success .notification-icon {
  color: #28a745;
}

.floating-notification.error .notification-icon {
  color: #dc3545;
}

.floating-notification.warning .notification-icon {
  color: #ffc107;
}

.floating-notification.info .notification-icon {
  color: #17a2b8;
}

.notification-icon i {
  font-size: 20px;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.notification-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: #f5f5f5;
  color: #666;
}

.notification-close i {
  font-size: 14px;
}

.notification-progress {
  height: 3px;
  background: #e9ecef;
  transition: width 0.05s linear;
}

.floating-notification.success .notification-progress {
  background: #28a745;
}

.floating-notification.error .notification-progress {
  background: #dc3545;
}

.floating-notification.warning .notification-progress {
  background: #ffc107;
}

.floating-notification.info .notification-progress {
  background: #17a2b8;
}

/* Animaciones */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-enter-to,
.notification-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* Responsive */
@media (max-width: 480px) {
  .floating-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
  
  .notification-content {
    padding: 16px;
    gap: 12px;
  }
  
  .notification-text h4 {
    font-size: 15px;
  }
  
  .notification-text p {
    font-size: 13px;
  }
}
</style> 