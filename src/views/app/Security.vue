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

    <hr v-if="!loading" style="margin: 30px 0; border: 0; border-top: 1px solid #ddd;">

    <h4 v-if="!loading">DISPOSITIVOS CONECTADOS</h4>
    
    <section v-if="!loading">
      <div v-if="sessions.length === 0" style="color: #888;">
        No hay otras sesiones activas.
      </div>
      <div v-for="sess in sessions" :key="sess._id" class="box" style="margin-bottom: 15px; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-weight: 600; font-size: 1.1rem; color: #2c3e50;">
              <i class="fas" :class="sess.os === 'MacOS' || sess.os === 'iOS' ? 'fa-apple' : sess.os === 'Windows' ? 'fa-windows' : sess.os === 'Android' ? 'fa-android' : 'fa-laptop'" style="margin-right: 8px;"></i>
              {{ sess.os }} - {{ sess.browser }}
            </div>
            <div style="font-size: 0.9rem; color: #7f8c8d; margin-top: 5px;">
              <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i> IP: {{ sess.ip }}
            </div>
            <div style="font-size: 0.85rem; color: #95a5a6; margin-top: 3px;">
              <i class="far fa-clock" style="margin-right: 5px;"></i> Iniciado: {{ new Date(sess.created_at).toLocaleString() }}
            </div>
          </div>
          <div>
            <span v-if="sess.is_current" class="tag is-success" style="font-weight: 600; color: #fff; background: #2ecc71; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Este dispositivo</span>
            <button v-else @click="closeSession(sess._id)" class="button is-danger is-small" style="background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-sign-out-alt" style="margin-right: 5px;"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </section>

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
    async UPDATE() {

      const { name, lastName, dni, relation, phone } = this

      if (!name) return
      if (!lastName) return
      if (!dni) return
      if (!relation) return
      if (!phone) return

      // UPDATE Person
      this.sending = true

      const { data } = await api.Security.POST(this.session, {
        name,
        lastName,
        dni,
        relation,
        phone,
      });

      this.sending = false

      // success
      this.success = true
      this.state = 'exists'
    },
    async fetchSessions() {
      try {
        const { data } = await api.Sessions.GET(this.session);
        if (data && !data.error) {
          this.sessions = data.sessions || [];
        }
      } catch (e) {
        console.error("Error fetching sessions", e);
      }
    },
    async closeSession(sessionId) {
      if (confirm('¿Estás seguro de que deseas cerrar la sesión en ese dispositivo?')) {
        try {
          const { data } = await api.Sessions.DELETE(this.session, sessionId);
          if (!data.error) {
            this.sessions = this.sessions.filter(s => s._id !== sessionId);
            alert('Sesión cerrada exitosamente');
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
