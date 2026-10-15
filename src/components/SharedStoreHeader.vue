<template>
  <header class="shared-store-topbar">
    <div class="topbar-inner">
      <!-- Izquierda: Logo SIFRAH -->
      <router-link :to="homeLink" class="topbar-brand" title="Ir a la tienda">
        <img src="@/assets/img/logo/logo.svg" alt="SIFRAH" class="topbar-logo" />
      </router-link>

      <!-- Derecha: Información del socio (Nombres, apellidos y foto) -->
      <div class="topbar-partner" :title="fullName">
        <div class="partner-meta">
          <span class="partner-tag">Tu Distribuidor</span>
          <span class="partner-name">{{ fullName }}</span>
        </div>
        <div class="partner-avatar-wrapper">
          <img
            v-if="hasPhoto && !photoError"
            :src="ownerPhoto"
            :alt="fullName"
            class="partner-avatar-img"
            @error="onPhotoError"
          />
          <div v-else class="partner-avatar-fallback">
            {{ initials }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "SharedStoreHeader",
  props: {
    ownerName: {
      type: String,
      default: ""
    },
    ownerLastName: {
      type: String,
      default: ""
    },
    ownerFullName: {
      type: String,
      default: ""
    },
    ownerPhoto: {
      type: String,
      default: null
    },
    ownerId: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      photoError: false
    };
  },
  watch: {
    ownerPhoto() {
      this.photoError = false;
    }
  },
  computed: {
    homeLink() {
      return this.ownerId ? `/tienda/${this.ownerId}` : "/";
    },
    fullName() {
      if (this.ownerFullName && this.ownerFullName.trim()) {
        return this.ownerFullName.trim();
      }
      const combined = `${this.ownerName || ""} ${this.ownerLastName || ""}`.trim();
      return combined || "Distribuidor Sifrah";
    },
    hasPhoto() {
      return (
        !!this.ownerPhoto &&
        typeof this.ownerPhoto === "string" &&
        this.ownerPhoto.trim() !== "" &&
        !this.ownerPhoto.includes("undefined") &&
        !this.ownerPhoto.includes("null")
      );
    },
    initials() {
      const first = (this.ownerName || "").trim();
      const last = (this.ownerLastName || "").trim();
      if (first && last) {
        return (first[0] + last[0]).toUpperCase();
      }
      if (this.fullName) {
        const parts = this.fullName.split(" ").filter(Boolean);
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        if (parts.length === 1 && parts[0].length >= 1) {
          return parts[0].slice(0, 2).toUpperCase();
        }
      }
      return "S";
    }
  },
  methods: {
    onPhotoError() {
      this.photoError = true;
    }
  }
};
</script>

<style scoped>
.shared-store-topbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10005;
  box-sizing: border-box;
}

.topbar-inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
}

/* Logo SIFRAH a la izquierda */
.topbar-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
}

.topbar-brand:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.topbar-logo {
  height: 42px;
  width: auto;
  max-width: 170px;
  object-fit: contain;
  display: block;
}

/* Socio a la derecha */
.topbar-partner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  max-width: 60%;
}

.partner-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 0;
}

.partner-tag {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #00ae62;
  line-height: 1.2;
  margin-bottom: 2px;
}

.partner-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.partner-avatar-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  border: 2px solid #00ae62;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partner-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.partner-avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00ae62 0%, #001c50 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .topbar-inner {
    padding: 8px 16px;
  }

  .topbar-logo {
    height: 36px;
    max-width: 140px;
  }

  .partner-avatar-wrapper {
    width: 38px;
    height: 38px;
  }

  .partner-name {
    font-size: 13px;
    max-width: 160px;
  }

  .partner-tag {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .topbar-inner {
    padding: 8px 12px;
  }

  .topbar-logo {
    height: 32px;
    max-width: 120px;
  }

  .partner-avatar-wrapper {
    width: 34px;
    height: 34px;
  }

  .partner-avatar-fallback {
    font-size: 12px;
  }

  .partner-name {
    font-size: 12px;
    max-width: 125px;
  }

  .partner-tag {
    font-size: 9px;
    letter-spacing: 0.3px;
  }
}
</style>
