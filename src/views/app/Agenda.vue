<template>
  <App :session="session" title="Agenda">
    <div class="agenda-view">
      <!-- Calendar Header (Month + Weekly Strip) -->
      <aside :class="['agenda-header', { expanded: isExpanded }]">
        <div class="header-controls">
          <button class="month-toggle" @click="toggleCalendar">
            {{ currentMonthName }} {{ currentYear }}
            <i :class="['fas', isExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
          </button>
          <div class="agenda-actions">
            <i class="fas fa-search"></i>
            <i class="fas fa-plus-circle"></i>
          </div>
        </div>

        <!-- Monthly Grid -->
        <div :class="['monthly-container', { expanded: isExpanded }]">
          <div class="monthly-grid">
            <div v-for="day in daysShort" :key="'label-' + day" class="grid-day-label">
              {{ day }}
            </div>
            <div 
              v-for="n in calendarDays" 
              :key="'day-' + n.date" 
              :class="['grid-day-num', { active: n.isSelected, today: n.isToday }]"
              @click="selectDay(n)"
            >
              {{ n.num }}
            </div>
          </div>
        </div>

        <!-- Weekly Strip -->
        <nav class="weekly-strip">
          <div 
            v-for="day in weekDays" 
            :key="'week-' + day.date" 
            :class="['week-day-col', { selected: day.isSelected }]"
            @click="selectDay(day)"
          >
            <span class="day-name-short">{{ day.nameShort }}</span>
            <span class="day-number-large">{{ day.num }}</span>
          </div>
        </nav>
      </aside>

      <!-- Events List -->
      <main class="agenda-layout">
        <div class="timeline-labels">
          <span class="label-time">Hora</span>
          <span>Evento / Clase</span>
        </div>

        <div class="events-timeline">
          <transition-group name="fade-slide" tag="div">
            <div v-for="event in filteredEvents" :key="event.id" class="event-row">
              <div class="event-time-col">{{ event.time }}</div>
              
              <div class="event-card" :style="{ borderLeftColor: event.color }">
                <div class="event-info">
                  <h3>{{ event.title }}</h3>
                  <p><i class="far fa-clock"></i> {{ event.start }} - {{ event.end }}</p>
                  <p v-if="event.location"><i class="fas fa-map-marker-alt"></i> {{ event.location }}</p>
                </div>
                <div class="event-more-btn">
                  <i class="fas fa-ellipsis-h"></i>
                </div>

                <!-- Active Time Indicator -->
                <div v-if="event.isCurrent" class="now-line"></div>
              </div>
            </div>
          </transition-group>

          <!-- Empty State -->
          <div v-if="filteredEvents.length === 0" class="empty-agenda">
            <i class="fas fa-calendar-day"></i>
            <p>No tienes eventos programados para este día.</p>
            <button class="btn-primary">Añadir Recordatorio</button>
          </div>
        </div>
      </main>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

export default {
  name: "Agenda",
  components: {
    App
  },
  data() {
    return {
      isExpanded: false,
      currentDate: new Date(),
      selectedDate: new Date(),
      daysShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      events: []
    };
  },
  async mounted() {
    await this.fetchEvents();
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    currentMonthName() {
      return this.selectedDate.toLocaleString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + 
             this.selectedDate.toLocaleString('es-ES', { month: 'long' }).slice(1);
    },
    currentYear() {
      return this.selectedDate.getFullYear();
    },
    calendarDays() {
      // Mock calendar days for the current month
      return Array.from({ length: 30 }, (_, i) => {
        const d = i + 1;
        return {
          num: d,
          date: d,
          isSelected: d === this.selectedDate.getDate(),
          isToday: d === new Date().getDate()
        };
      });
    },
    weekDays() {
      // Generate a week strip around the selected date
      const days = [];
      const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      for (let i = -2; i <= 4; i++) {
        const d = new Date(this.selectedDate);
        d.setDate(this.selectedDate.getDate() + i);
        days.push({
          nameShort: names[d.getDay()],
          num: d.getDate(),
          date: d.toISOString(),
          isSelected: d.getDate() === this.selectedDate.getDate()
        });
      }
      return days;
    },
    filteredEvents() {
      return this.events.filter(e => 
        e.day === this.selectedDate.getDate() &&
        e.month === this.selectedDate.getMonth() &&
        e.year === this.selectedDate.getFullYear()
      );
    }
  },
  methods: {
    async fetchEvents() {
      try {
        const { data } = await api.Agenda.GET();
        if (data && data.events) {
          this.events = data.events.map(e => {
            const d = new Date(e.date + "T00:00:00");
            const [hours, minutes] = (e.time || "00:00").split(':');
            const endHour = String((parseInt(hours) + 1) % 24).padStart(2, '0');
            const endStr = `${endHour}:${minutes}`;
            
            return {
              id: e.id,
              day: d.getDate(),
              month: d.getMonth(),
              year: d.getFullYear(),
              time: e.time,
              start: e.time,
              end: endStr,
              title: e.title,
              location: e.link || e.modality,
              color: this.getTypeColor(e.type),
              isCurrent: false,
              ...e
            };
          });
        }
      } catch (err) {
        console.error("Error loading agenda", err);
      }
    },
    getTypeColor(type) {
      const colors = {
        "Presentación": "#6b46c1",
        "Taller": "#3182ce",
        "Capacitación": "#38a169",
        "Reunión": "#dd6b20",
        "Lanzamiento": "#e53e3e"
      };
      return colors[type] || "#718096";
    },
    toggleCalendar() {
      this.isExpanded = !this.isExpanded;
    },
    selectDay(day) {
      const newDate = new Date(this.selectedDate);
      if (typeof day.num === 'number') {
        newDate.setDate(day.num);
      } else {
        const d = new Date(day.date);
        newDate.setDate(d.getDate());
      }
      this.selectedDate = newDate;
    }
  }
};
</script>

<style scoped src="../../assets/style/views/app/Agenda.css"></style>

<style scoped>
.empty-agenda {
  text-align: center;
  padding: 60px 20px;
  color: var(--agenda-text-muted);
}

.empty-agenda i {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.2;
}

.btn-primary {
  background: var(--agenda-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 70, 160, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
