<template>
  <App :session="session">

    <h4>PERSONA DE CONFIANZA</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading"> <br>

      <div v-if="state == 'default'">
        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Nombre" v-model="name"> <br>

        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Apellido" v-model="lastName"> <br>

        <i class="icon fas fa-id-card"></i>
        <input class="input" placeholder="Documento de identidad" v-model="dni"> <br>

        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Parentesco" v-model="relation"> <br>

        <i class="icon fas fa-mobile-alt"></i>
        <input class="input" placeholder="Teléfono" v-model="phone"> <br>

        <small v-if="success" class="success">Persona guardada</small> <br>

        <button class="button" v-show="!sending" @click="UPDATE">Guardar</button>
        <button class="button" v-show="sending" disabled>Actualizando persona ...</button>
      </div>

      <div v-if="state == 'exists'">
        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Nombre" :readonly="name" v-model="name"> <br>

        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Apellido" :readonly="lastName" v-model="lastName"> <br>

        <i class="icon fas fa-id-card"></i>
        <input class="input" placeholder="Documento de identidad" :readonly="dni" v-model="dni"> <br>

        <i class="icon fas fa-user"></i>
        <input class="input" placeholder="Parentesco" :readonly="relation" v-model="relation"> <br>

        <i class="icon fas fa-mobile-alt"></i>
        <input class="input" placeholder="Teléfono" :readonly="phone" v-model="phone"> <br>
      </div>


    </section>

    <!-- DISPOSITIVOS CONECTADOS -->
    <div v-if="!loading" class="devices-section">
      <div class="devices-header">
        <div class="devices-title-group">
          <div class="devices-title-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h4 class="devices-title">Dispositivos Conectados</h4>
            <p class="devices-subtitle">{{ sessions.length }} sesión{{ sessions.length !== 1 ? 'es' : '' }} activa{{ sessions.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>
      </div>

      <div v-if="sessions.length === 0" class="no-sessions">
        <i class="fas fa-check-circle no-sessions-icon"></i>
        <p>No hay otras sesiones activas</p>
      </div>

      <div v-for="sess in sessions" :key="sess._id" class="device-card" :class="{ 'device-current': sess.is_current }">
        <!-- OS Icon -->
        <div class="device-icon-wrapper" :class="osClass(sess.os)">
          <i class="fab" :class="osIcon(sess.os)"></i>
        </div>

        <!-- Info -->
        <div class="device-info">
          <div class="device-name">
            {{ sess.os }}
            <span class="device-browser">· {{ sess.browser }}</span>
          </div>
          <div class="device-meta">
            <span class="device-meta-item">
              <i class="fas fa-network-wired"></i> {{ sess.ip }}
            </span>
            <span class="device-meta-item">
              <i class="far fa-clock"></i> {{ formatDate(sess.created_at) }}
            </span>
          </div>
        </div>

        <!-- Badge / Action -->
        <div class="device-action">
          <span v-if="sess.is_current" class="badge-current">
            <i class="fas fa-circle pulse-dot"></i> Activo
          </span>
          <button v-else class="btn-close-session" @click="closeSession(sess._id)">
            <i class="fas fa-power-off"></i>
          </button>
        </div>
      </div>
    </div>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

export default {
  components: {
    App,
  },
  data() {
    return {
      name: null,
      lastName: null,
      dni: null,
      relation: null,
      phone: null,

      loading: true,
      sending: false,

      alert: null,

      success: false,
      sessions: [],
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  async created() {
    // GET data
    const { data } = await api.Security.GET(this.session);

    this.loading = false

    // error
    if (data.error && data.msg == 'invalid session') this.$router.push('/login')
    if (data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME', data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED', data.activated)
    this.$store.commit('SET__ACTIVATED', data._activated)

    this.state = 'default'

    if (data.security) {
      this.state = 'exists'
      this.name = data.security.name
      this.lastName = data.security.lastName
      this.dni = data.security.dni
      this.relation = data.security.relation
      this.phone = data.security.phone
    }

    await this.fetchSessions();
  },
  methods: {
    osIcon(os) {
      if (os === 'MacOS' || os === 'iOS') return 'fa-apple'
      if (os === 'Windows') return 'fa-windows'
      if (os === 'Android') return 'fa-android'
      if (os === 'Linux') return 'fa-linux'
      return 'fa-globe'
    },
    osClass(os) {
      if (os === 'MacOS' || os === 'iOS') return 'os-apple'
      if (os === 'Windows') return 'os-windows'
      if (os === 'Android') return 'os-android'
      if (os === 'Linux') return 'os-linux'
      return 'os-other'
    },
    formatDate(dateStr) {
      if (!dateStr) return 'Desconocido'
      const d = new Date(dateStr)
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    async UPDATE() {
      const { name, lastName, dni, relation, phone } = this
      if (!name) return
      if (!lastName) return
      if (!dni) return
      if (!relation) return
      if (!phone) return

      this.sending = true
      const { data } = await api.Security.POST(this.session, { name, lastName, dni, relation, phone });
      this.sending = false
      this.success = true
      this.state = 'exists'
    },
    async fetchSessions() {
      try {
        const { data } = await api.Sessions.GET(this.session);
        if (data && !data.error) {
          this.sessions = data.sessions || [];
        }
      } catch (e) {}
    },
    async closeSession(sessionId) {
      if (confirm('¿Cerrar la sesión en este dispositivo?')) {
        try {
          const { data } = await api.Sessions.DELETE(this.session, sessionId);
          if (!data.error) {
            this.sessions = this.sessions.filter(s => String(s._id) !== String(sessionId));
          } else {
            alert(data.error);
          }
        } catch (e) {
          alert('Error al cerrar la sesión');
        }
      }
    }
  },
};
</script>

<style scoped>
/* ── Devices Section ── */
.devices-section {
  margin-top: 28px;
}

.devices-header {
  margin-bottom: 16px;
}

.devices-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.devices-title-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.devices-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  padding: 0;
  border: none;
  letter-spacing: 0.5px;
}

.devices-subtitle {
  font-size: 0.78rem;
  color: #8e9aaf;
  margin: 2px 0 0 0;
}

/* ── No Sessions ── */
.no-sessions {
  text-align: center;
  padding: 32px 16px;
  color: #a0aec0;
}
.no-sessions-icon {
  font-size: 2.5rem;
  color: #48bb78;
  margin-bottom: 10px;
  display: block;
}
.no-sessions p {
  font-size: 0.9rem;
  margin: 0;
}

/* ── Device Card ── */
.device-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1.5px solid #f0f0f5;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.2s;
}

.device-card:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.device-current {
  border-color: #667eea;
  background: linear-gradient(135deg, #f5f7ff 0%, #fff 100%);
}

/* ── OS Icon ── */
.device-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  color: white;
}

.os-apple   { background: linear-gradient(135deg, #434343, #000000); }
.os-windows { background: linear-gradient(135deg, #0078d4, #00b4d8); }
.os-android { background: linear-gradient(135deg, #3ddc84, #00897b); }
.os-linux   { background: linear-gradient(135deg, #ffa726, #ef6c00); }
.os-other   { background: linear-gradient(135deg, #a29bfe, #6c5ce7); }

/* ── Device Info ── */
.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-browser {
  font-weight: 400;
  color: #8e9aaf;
  font-size: 0.85rem;
}

.device-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.device-meta-item {
  font-size: 0.75rem;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Badge & Close Button ── */
.device-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.badge-current {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #56ab2f, #a8e063);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.pulse-dot {
  font-size: 0.5rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

.btn-close-session {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ff6b6b, #ee0979);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 3px 10px rgba(238,9,121,0.3);
}

.btn-close-session:hover {
  transform: scale(1.12);
  box-shadow: 0 6px 18px rgba(238,9,121,0.45);
}
</style>
