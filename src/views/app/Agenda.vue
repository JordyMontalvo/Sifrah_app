<template>
  <App :session="session" title="Agenda">
    <div class="agenda-view">
      <!-- Calendar Header (Month + Weekly Strip) -->
      <aside :class="['agenda-header', { expanded: isExpanded }]">
        <div class="header-controls">
          <div class="month-toggle-select" @click="isExpanded = true">
            <select v-model="selectedMonthYearValue">
              <option v-for="opt in monthOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <i class="fas fa-chevron-down"></i>
          </div>
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
              v-for="(n, i) in calendarDays" 
              :key="'day-' + i" 
              :class="['grid-day-num', { active: n.isSelected, today: n.isToday, 'has-events': n.hasEvents, 'is-empty': n.empty }]"
              @click="n.empty ? null : selectDay(n)"
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
                <div class="event-main">
                  <div class="event-icon" :style="{ backgroundColor: event.color + '1A', color: event.color }">
                    <i :class="getTypeIcon(event.type)"></i>
                  </div>
                  <div class="event-info">
                  <h3>{{ event.title }}</h3>
                  <p><i class="far fa-clock"></i> {{ event.start }} - {{ event.end }}</p>
                    <p v-if="eventLocationLine(event)"><i class="fas fa-map-marker-alt"></i> {{ eventLocationLine(event) }}</p>
                  </div>
                </div>
                <div class="event-more-btn" @click.stop="openEventModal(event)" style="cursor: pointer; padding: 10px;">
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
          </div>
        </div>
      </main>

      <!-- Event Detail Modal -->
      <div v-if="showModal && selectedEvent" class="event-modal-overlay" @click.self="closeEventModal">
        <div class="event-modal-card">
          <button class="modal-close-btn" @click="closeEventModal">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-header">
            <div class="modal-header-top">
              <div class="modal-icon-chip">
                <i :class="getTypeIcon(selectedEvent.type)" class="modal-type-icon"></i>
              </div>
              <span class="modal-type-badge">{{ selectedEvent.type }}</span>
            </div>
          </div>
          
          <div class="modal-body">
            <h2 class="modal-title">{{ selectedEvent.title }}</h2>
            
            <div class="modal-details">
              <div class="detail-item">
                <i class="far fa-calendar-alt"></i>
                <span style="text-transform: capitalize;">{{ formatDate(selectedEvent.date) }}</span>
              </div>
              <div class="detail-item">
                <i class="far fa-clock"></i>
                <span>{{ selectedEvent.start }} - {{ selectedEvent.end }}</span>
              </div>
              <div class="detail-item" v-if="selectedEvent.link || selectedEvent.location">
                <i class="fas fa-video"></i>
                <span>
                  {{ selectedEvent.location || 'Enlace del evento' }}
                  <span v-if="selectedEvent.link" class="detail-link">{{ selectedEvent.link }}</span>
                  <span v-if="selectedEvent.modality"> ({{ selectedEvent.modality }})</span>
                </span>
              </div>
            </div>
            
            <div class="modal-description" v-if="selectedEvent.description">
              <h3>Descripción</h3>
              <p>{{ selectedEvent.description }}</p>
            </div>
            
            <div class="modal-actions">
              <!-- Virtual -->
              <a v-if="selectedEvent.modality === 'Virtual' && selectedEvent.link" 
                 :href="selectedEvent.link" target="_blank" 
                 class="btn-primary is-fullwidth modal-cta">
                <i class="fas fa-video"></i>
                <span>Unirse al Evento</span>
              </a>
              
              <!-- Mixto/Mixta -->
              <div v-if="selectedEvent.modality === 'Mixto' || selectedEvent.modality === 'Mixta'">
                <div class="modality-notice mixta-notice" :style="{ color: selectedEvent.color }">
                  <i class="fas fa-info-circle"></i> 
                  <span>Este evento es de modalidad mixta. Puedes asistir presencialmente o unirte de forma virtual.</span>
                </div>
                <a v-if="selectedEvent.link" 
                   :href="selectedEvent.link" target="_blank" 
                   class="btn-primary is-fullwidth mt-3 modal-cta">
                  <i class="fas fa-video"></i>
                  <span>Unirse al Evento</span>
                </a>
              </div>
              
              <!-- Presencial -->
              <div v-if="selectedEvent.modality === 'Presencial'" class="modality-notice presencial-notice">
                <i class="fas fa-building"></i> 
                <span>Evento 100% Presencial. Te esperamos en la ubicación indicada.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      events: [],
      showModal: false,
      selectedEvent: null
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
    monthOptions() {
      const options = [];
      const d = new Date();
      // Empezar desde el mes actual y generar los próximos 12 meses
      for(let i=0; i<12; i++) {
        const value = `${d.getFullYear()}-${d.getMonth()}`;
        const label = d.toLocaleString('es-ES', { month: 'long' }).charAt(0).toUpperCase() + d.toLocaleString('es-ES', { month: 'long' }).slice(1) + " " + d.getFullYear();
        options.push({ value, label });
        d.setMonth(d.getMonth() + 1);
      }
      return options;
    },
    selectedMonthYearValue: {
      get() {
        return `${this.selectedDate.getFullYear()}-${this.selectedDate.getMonth()}`;
      },
      set(val) {
        const [year, month] = val.split('-');
        const newDate = new Date(this.selectedDate);
        newDate.setFullYear(parseInt(year), parseInt(month), 1);
        this.selectedDate = newDate;
      }
    },
    calendarDays() {
      const year = this.selectedDate.getFullYear();
      const month = this.selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
      
      const days = [];
      
      for (let i = 0; i < firstDay; i++) {
        days.push({ empty: true });
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
        const hasEvents = this.events.some(e => e.day === d && e.month === month && e.year === year);
        
        days.push({
          empty: false,
          num: d,
          date: d,
          isSelected: d === this.selectedDate.getDate(),
          isToday: d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
          hasEvents: hasEvents
        });
      }
      return days;
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
    eventLocationLine(event) {
      if (!event) return "";
      const modality = event.modality || "";
      const link = event.link || "";
      if (modality && link) return `${modality} - ${link}`;
      return modality || link || "";
    },
    parseEventDate(dateStr) {
      if (!dateStr) return null;
      // Soportar "YYYY-MM-DD" y también ISO con hora ("YYYY-MM-DDTHH:mm:ssZ")
      const s = String(dateStr);
      const d = s.includes("T") ? new Date(s) : new Date(s + "T00:00:00");
      if (!isNaN(d)) return d;
      const fallback = new Date(s);
      return isNaN(fallback) ? null : fallback;
    },
    async fetchEvents() {
      try {
        const { data } = await api.Agenda.GET();
        if (data && data.events) {
          this.events = data.events.map(e => {
            const d = this.parseEventDate(e.date);
            const [hours, minutes] = (e.time || "00:00").split(':');
            const endHour = String((parseInt(hours) + 1) % 24).padStart(2, '0');
            const endStr = `${endHour}:${minutes}`;
            
            return {
              id: e.id,
              day: d ? d.getDate() : null,
              month: d ? d.getMonth() : null,
              year: d ? d.getFullYear() : null,
              time: e.time,
              start: e.time,
              end: endStr,
              title: e.title,
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
    getTypeIcon(type) {
      const icons = {
        "Presentación": "fas fa-video",
        "Taller": "fas fa-graduation-cap",
        "Capacitación": "fas fa-users",
        "Reunión": "fas fa-handshake",
        "Lanzamiento": "fas fa-rocket"
      };
      return icons[type] || "fas fa-calendar";
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = this.parseEventDate(dateStr);
      return isNaN(d) ? dateStr : d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },
    openEventModal(event) {
      this.selectedEvent = event;
      this.showModal = true;
    },
    closeEventModal() {
      this.showModal = false;
      this.selectedEvent = null;
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

/* Event Detail Modal */
.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.event-modal-card {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalPop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.35);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s;
  backdrop-filter: blur(6px);
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.1);
}

.modal-header {
  padding: 44px 24px;
  min-height: 140px;
  color: white;
  background:
    radial-gradient(900px 220px at 85% 25%, rgba(255, 45, 140, 0.32) 0%, rgba(255, 45, 140, 0) 60%),
    linear-gradient(135deg, #0b0b10 0%, #1a0b14 55%, #0b0b10 100%);
  position: relative;
  overflow: hidden;
}

.modal-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 46%;
  background-image: radial-gradient(rgba(255, 45, 140, 0.55) 1px, rgba(255, 45, 140, 0) 1px);
  background-size: 8px 8px;
  opacity: 0.55;
  pointer-events: none;
  mask-image: linear-gradient(270deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
}

.modal-header-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon-chip {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff2d8c 0%, #b01268 100%);
  box-shadow: 0 10px 28px rgba(255, 45, 140, 0.25);
  flex-shrink: 0;
}

.modal-type-icon {
  font-size: 1.75rem;
  opacity: 1;
}

.modal-type-badge {
  background: rgba(255, 45, 140, 0.16);
  border: 1px solid rgba(255, 45, 140, 0.35);
  color: #e91e63;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
}

.modal-body {
  padding: 24px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  line-height: 1.3;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 24px;
  background: #f8fafc;
  padding: 0;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #475569;
  font-size: 0.95rem;
  padding: 14px 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item i {
  color: #ff2d8c;
  width: 22px;
  text-align: center;
  font-size: 1.1rem;
}

.detail-link {
  color: #c21874;
  font-weight: 700;
  word-break: break-all;
}

.modal-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: linear-gradient(90deg, #b01268 0%, #ff2d8c 100%);
  box-shadow: 0 12px 30px rgba(176, 18, 104, 0.25);
}

.modal-cta i {
  font-size: 1.05rem;
  margin-right: 0;
}
.modal-description h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.modal-description p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.modal-actions {
  margin-top: 24px;
}

.btn-primary.is-fullwidth {
  width: 100%;
  display: block;
  text-align: center;
  text-decoration: none;
  font-size: 1.05rem;
  padding: 14px;
}

.modality-notice {
  padding: 14px;
  border-radius: 10px;
  font-size: 0.95rem;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.modality-notice i {
  font-size: 1.2rem;
  margin-top: 2px;
}

.mixta-notice {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.presencial-notice {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.mt-3 {
  margin-top: 16px;
}

.month-toggle-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  cursor: pointer;
}

.month-toggle-select select {
  background: transparent;
  border: none;
  color: white;
  padding: 8px 30px 8px 16px;
  font-weight: 600;
  font-size: 1rem;
  appearance: none;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
}

.month-toggle-select select option {
  color: #1e293b;
  font-weight: 500;
}

.month-toggle-select i {
  position: absolute;
  right: 12px;
  color: white;
  pointer-events: none;
  font-size: 0.85rem;
}

.grid-day-num.is-empty {
  visibility: hidden;
  pointer-events: none;
}

.grid-day-num.has-events {
  position: relative;
  font-weight: 700;
}

.grid-day-num.has-events::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.25);
}

.grid-day-num.active.has-events::after {
  background-color: var(--agenda-primary);
  box-shadow: none;
}
</style>
