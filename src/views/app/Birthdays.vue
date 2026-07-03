<template>
  <App :session="session" :office_id="office_id" title="Cumpleaños">
    <Spinner v-if="loading" :size="40" color="#e91e63" />

    <div v-else class="birthdays-view">
      <header class="birthdays-hero">
        <div class="birthdays-hero-text">
          <h1 class="birthdays-title">
            <i class="fas fa-birthday-cake"></i>
            Cumpleaños
          </h1>
          <p class="birthdays-subtitle">
            Próximos cumpleaños de tu red. ¡Felicítalos y fortalece tu equipo!
          </p>
        </div>
        <div class="birthdays-hero-action">
          <button type="button" class="btn-create-flyer" @click="goToFlyerEditor()">
            <i class="fas fa-id-card"></i>
            Crear flyer
          </button>
          <span class="flyer-hint">Genera un saludo personalizado</span>
        </div>
      </header>

      <section class="birthdays-list-section">
        <div class="section-header">
          <h2>Próximos cumpleaños</h2>
          <button type="button" class="btn-filter" @click="showFilter = !showFilter">
            <i class="fas fa-filter"></i>
            Filtrar
          </button>
        </div>

        <div v-if="showFilter" class="filter-panel">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Buscar por nombre..."
            class="filter-search"
          />
          <select v-model="roleFilter" class="filter-select">
            <option value="">Todos los roles</option>
            <option v-for="role in availableRoles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>

        <div v-if="filteredBirthdays.length" class="birthdays-list">
          <router-link
            v-for="person in filteredBirthdays"
            :key="person.id"
            :to="`/birthdays/${person.id}`"
            class="birthday-card"
          >
            <div class="card-member">
              <div class="card-avatar-wrap">
                <img
                  v-if="person.photo"
                  :src="person.photo"
                  :alt="person.fullName"
                  class="card-avatar"
                />
                <div v-else class="card-avatar card-avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>
              </div>

              <div class="card-info">
                <h3 class="card-name">{{ person.fullName }}</h3>
                <p class="card-role">{{ person.planLabel }}</p>
                <p v-if="person.affiliationDateFormatted" class="card-member-since">
                  <i class="fas fa-gem"></i>
                  Miembro desde {{ person.affiliationDateFormatted }}
                </p>
              </div>
            </div>

            <div class="card-date-row">
              <div class="date-badge">
                <span class="date-badge-day">{{ formatBirthDay(person) }}</span>
                <span class="date-badge-month">{{ formatBirthMonth(person) }}</span>
              </div>
              <div class="card-proximity">
                <span class="proximity-primary" :class="{ today: person.isToday }">
                  {{ proximityPrimary(person) }}
                </span>
                <span v-if="!person.isToday" class="proximity-secondary">
                  {{ proximityDaysLabel(person) }}
                </span>
              </div>
              <i class="fas fa-chevron-right card-chevron"></i>
            </div>
          </router-link>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-birthday-cake"></i>
          <p v-if="hasActiveFilters">No hay resultados con los filtros aplicados.</p>
          <p v-else>No hay cumpleaños próximos en tu red.</p>
          <p class="empty-hint">
            <template v-if="hasActiveFilters">Prueba con otro nombre o rol.</template>
            <template v-else>Los miembros sin fecha de nacimiento registrada no aparecen aquí.</template>
          </p>
        </div>
      </section>

      <footer class="birthdays-info-banner">
        <i class="fas fa-calendar-alt"></i>
        <p>
          Los cumpleaños se muestran desde hoy en adelante. Se actualizan automáticamente cada día.
        </p>
      </footer>
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
      birthdays: [],
      searchTerm: "",
      roleFilter: "",
      showFilter: false,
      refreshTimer: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    availableRoles() {
      const roles = new Set(this.birthdays.map((b) => b.planLabel).filter(Boolean));
      return [...roles].sort((a, b) => a.localeCompare(b, "es"));
    },
    filteredBirthdays() {
      let list = this.birthdays;
      const q = this.searchTerm.trim().toLowerCase();
      if (q) {
        list = list.filter((p) => p.fullName.toLowerCase().includes(q));
      }
      if (this.roleFilter) {
        list = list.filter((p) => p.planLabel === this.roleFilter);
      }
      return list;
    },
    hasActiveFilters() {
      return !!(this.searchTerm.trim() || this.roleFilter);
    },
  },
  async created() {
    await this.loadBirthdays();
    this.scheduleRefresh();
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  },
  beforeDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  },
  methods: {
    async loadBirthdays() {
      try {
        const { data } = await api.Birthdays.GET(this.session);
        if (data.error && data.msg === "invalid session") {
          this.$router.push("/login");
          return;
        }
        if (!data.error) {
          this.birthdays = data.birthdays || [];
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    scheduleRefresh() {
      this.refreshTimer = setInterval(() => {
        this.loadBirthdays();
      }, 60 * 60 * 1000);
    },
    onVisibilityChange() {
      if (document.visibilityState === "visible") {
        this.loadBirthdays();
      }
    },
    goToFlyerEditor(name) {
      const query = { category: "Cumpleaños" };
      if (name) query.nombre = name;
      this.$router.push({ path: "/flyer-editor", query });
    },
    formatBirthDay(person) {
      const day = person.birthDay;
      if (day == null) {
        const parts = (person.dateBadge || "").split(" ");
        return parts[0] || "";
      }
      return String(day).padStart(2, "0");
    },
    formatBirthMonth(person) {
      const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
      if (person.birthMonth) return months[person.birthMonth - 1] || "";
      const parts = (person.dateBadge || "").split(" ");
      return parts[1] || "";
    },
    proximityPrimary(person) {
      if (person.isToday) return "¡Hoy!";
      if (person.daysUntil === 1) return "Mañana";
      return `En ${person.daysUntil} días`;
    },
    proximityDaysLabel(person) {
      if (person.daysUntil === 1) return "1 día";
      return `${person.daysUntil} días`;
    },
  },
};
</script>

<style scoped>
@import "../../assets/style/views/app/Birthdays.css";
</style>
