<template>
  <div v-if="visible && popup" class="sp-overlay" role="dialog" aria-modal="true">
    <div class="sp-card" :class="popup.type === 'welcome' ? 'is-welcome' : 'is-image'">
      <WelcomePopupCard
        v-if="popup.type === 'welcome'"
        :title="popup.title"
        :message="popup.message"
        :video="popup.video"
        :icon="popup.icon"
        :footer-text="popup.footerText"
        :primary-text="popup.primaryButton && popup.primaryButton.text"
        :secondary-text="popup.secondaryButton && popup.secondaryButton.text"
        @close="dismiss"
        @primary="runAction(popup.primaryButton)"
        @secondary="runAction(popup.secondaryButton)"
      />
      <template v-else>
        <button class="sp-close" type="button" aria-label="Cerrar" @click="dismiss">×</button>
        <img class="sp-image" :src="popup.image" alt="Mensaje SIFRAH" />
      </template>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import WelcomePopupCard from "@/components/WelcomePopupCard.vue";

const SKIP_PATHS = ["/checkout"];

export default {
  name: "SystemPopups",
  components: { WelcomePopupCard },
  props: {
    session: { type: String, default: "" },
  },
  data() {
    return {
      popup: null,
      visible: false,
    };
  },
  watch: {
    session() {
      this.load();
    },
    "$store.state.affiliated"() {
      this.load();
    },
    "$route.path"() {
      if (this.shouldSkip()) this.visible = false;
      else if (this.popup && !this.visible) this.maybeShow(this.popup);
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    shouldSkip() {
      const path = (this.$route && this.$route.path) || "";
      return SKIP_PATHS.some((item) => path === item || path.startsWith(item + "/"));
    },
    sessionKey(type) {
      return "sifrah_popup_" + (this.session || "na") + "_" + type;
    },
    alreadyShown(type) {
      try {
        return sessionStorage.getItem(this.sessionKey(type)) === "1";
      } catch (e) {
        return false;
      }
    },
    markShown(type) {
      try {
        sessionStorage.setItem(this.sessionKey(type), "1");
      } catch (e) {}
    },
    async load() {
      if (!this.session) return;
      if (this.shouldSkip()) return;
      try {
        const { data } = await api.Popups.GET(this.session);
        const popup = data && data.popup;
        if (!popup || !popup.type) {
          this.popup = null;
          this.visible = false;
          return;
        }
        this.maybeShow(popup);
      } catch (e) {
        this.popup = null;
        this.visible = false;
      }
    },
    maybeShow(popup) {
      if (this.shouldSkip()) return;
      if (popup.type !== "welcome" && this.alreadyShown(popup.type)) {
        if (!this.visible) this.popup = null;
        return;
      }
      this.popup = popup;
      this.visible = true;
      if (popup.type !== "welcome") this.markShown(popup.type);
    },
    async dismiss() {
      const type = this.popup && this.popup.type;
      this.visible = false;
      if (type === "welcome") {
        try {
          await api.Popups.POST(this.session, { action: "dismiss", type: "welcome" });
        } catch (e) {}
      } else if (type) {
        this.markShown(type);
      }
      this.popup = null;
    },
    async runAction(button) {
      const action = (button && button.action) || "close";
      const link = button && button.link;
      await this.dismiss();
      if (action === "tools") this.$router.push("/tools");
      else if (action === "rango") this.$router.push("/rango");
      else if (action === "dashboard") this.$router.push("/dashboard");
      else if (action === "profile") this.$router.push("/profile");
      else if (action === "link" && link) {
        if (link.startsWith("/")) this.$router.push(link);
        else window.open(link, "_blank");
      }
    },
  },
};
</script>

<style scoped>
.sp-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px 12px 90px;
  overflow: auto;
}
.sp-card {
  position: relative;
  width: min(390px, 100%);
  margin-top: 18px;
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}
.sp-card.is-welcome {
  background: transparent;
  box-shadow: none;
}
.sp-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #64748b;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.16);
}
.sp-image {
  display: block;
  width: 100%;
  background: #fff;
}
@media (min-width: 960px) {
  .sp-overlay {
    align-items: center;
    padding: 24px;
  }
  .sp-card {
    margin-top: 0;
  }
}
</style>
