<template>
  <App :session="session" :office_id="office_id" title="Detalle del miembro">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else-if="member" class="birthday-detail-view">
      <header class="detail-header">
        <button type="button" class="btn-back" @click="$router.push('/birthdays')">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1>Detalle del miembro</h1>
        <button type="button" class="btn-close" @click="$router.push('/birthdays')">
          <i class="fas fa-times"></i>
        </button>
      </header>

      <section class="profile-overview">
        <div class="profile-avatar-wrap">
          <img
            v-if="member.photo"
            :src="member.photo"
            :alt="member.fullName"
            class="profile-avatar"
          />
          <div v-else class="profile-avatar profile-avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
          <span class="birthday-icon-badge">
            <i class="fas fa-birthday-cake"></i>
          </span>
        </div>

        <div class="profile-title">
          <h2>{{ member.fullName }}</h2>
          <div class="profile-meta">
            <span class="role">{{ member.planLabel }}</span>
            <span class="status-pill" :class="{ active: member.statusActive }">
              {{ member.statusLabel }}
            </span>
          </div>
          <p v-if="member.affiliationDateFormatted" class="member-since">
            <i class="fas fa-gem"></i>
            Miembro desde {{ member.affiliationDateFormatted }}
            <span v-if="member.dni" class="member-id">ID: {{ member.dni }}</span>
          </p>
        </div>
      </section>

      <section class="birthday-highlight">
        <i class="fas fa-birthday-cake"></i>
        <div>
          <p v-if="member.birthdayLabel" class="birthday-date">Cumpleaños: {{ member.birthdayLabel }}</p>
          <p class="birthday-proximity">{{ member.birthdayProximityDetail }}</p>
        </div>
      </section>

      <section class="info-section">
        <h3>Información personal</h3>
        <div class="info-row" v-if="member.country">
          <span class="info-label">País</span>
          <span class="info-value">{{ member.country }}</span>
        </div>
        <div class="info-row" v-if="member.phone">
          <span class="info-label">Teléfono</span>
          <span class="info-value">{{ member.phone }}</span>
        </div>
        <div class="info-row info-row-scroll" v-if="member.email">
          <span class="info-label">Correo</span>
          <div class="info-value-scroll" tabindex="0" :aria-label="member.email">
            <span class="info-value info-value-inline">{{ member.email }}</span>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h3>Información de red</h3>
        <div class="info-row info-row-scroll" v-if="member.sponsor">
          <span class="info-label">Patrocinador</span>
          <div class="info-value-scroll" tabindex="0" :aria-label="member.sponsor.fullName">
            <span class="info-value info-value-inline sponsor-link">
              {{ member.sponsor.fullName }}
              <i class="fas fa-chevron-right"></i>
            </span>
          </div>
        </div>
        <div class="info-row" v-if="member.rankLabel">
          <span class="info-label">Rango cerrado</span>
          <span class="info-value">{{ member.rankLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Puntos actuales</span>
          <span class="info-value points">{{ member.points.toLocaleString("es-PE") }} PV</span>
        </div>
      </section>

      <section class="info-section">
        <h3>Estado del miembro</h3>
        <div class="info-row">
          <span class="info-label">Estado</span>
          <span class="info-value status-value">
            <span class="status-dot" :class="{ active: member.statusActive }"></span>
            {{ member.statusLabel }}
          </span>
        </div>
      </section>

      <button type="button" class="btn-flyer-bottom" @click="goToFlyerEditor">
        <i class="fas fa-id-card"></i>
        Crear flyer de cumpleaños
      </button>
    </div>

    <div v-else class="empty-state">
      <p>Miembro no encontrado en tu red.</p>
      <router-link to="/birthdays" class="btn-back-link">Volver al listado</router-link>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import Spinner from "@/components/Spinner.vue";
import api from "@/api";

export default {
  components: { App, Spinner },
  data() {
    return {
      loading: true,
      member: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    memberId() {
      return this.$route.params.id;
    },
  },
  async created() {
    await this.loadMember();
  },
  watch: {
    memberId() {
      this.loading = true;
      this.member = null;
      this.loadMember();
    },
  },
  methods: {
    async loadMember() {
      try {
        const { data } = await api.Birthdays.GET(this.session, this.memberId);
        if (data.error && data.msg === "invalid session") {
          this.$router.push("/login");
          return;
        }
        if (!data.error) {
          this.member = data.member;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    goToFlyerEditor() {
      if (!this.member) return;
      this.$router.push({
        path: "/flyer-editor",
        query: {
          category: "Cumpleaños",
          nombre: this.member.fullName,
        },
      });
    },
  },
};
</script>

<style scoped>
@import "../../assets/style/views/app/Birthdays.css";
</style>
