<template>
  <App :session="session" title="Cambiar contraseña">
    <div v-cloak>
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando...</p>
      </div>

      <div v-else class="profile-glass-bg">
        <div class="profile-glass-card password-glass-card">
          <div class="profile-glass-header">
            <div class="profile-glass-title">
              <i class="fas fa-key profile-glass-icon"></i>
              <span>Cambiar contraseña</span>
            </div>
            <router-link to="/profile" class="password-back-link">
              <i class="fas fa-arrow-left"></i> Volver
            </router-link>
          </div>

          <section class="profile-glass-section">
            <p class="password-glass-hint">
              Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
            </p>

            <div class="glass-form-group">
              <label for="old-password">Contraseña actual</label>
              <div class="password-input-wrap">
                <input
                  id="old-password"
                  :type="showOld ? 'text' : 'password'"
                  v-model="oldPassword"
                  placeholder="Tu contraseña actual"
                  autocomplete="current-password"
                  @keydown="resetError"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showOld = !showOld"
                  :aria-label="showOld ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <i :class="showOld ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="glass-form-group">
              <label for="new-password">Nueva contraseña</label>
              <div class="password-input-wrap">
                <input
                  id="new-password"
                  :type="showNew ? 'text' : 'password'"
                  v-model="newPassword"
                  placeholder="Mín. 5 caracteres, letras y números"
                  autocomplete="new-password"
                  @keydown="resetError"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showNew = !showNew"
                  :aria-label="showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <i :class="showNew ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="glass-form-group">
              <label for="confirm-password">Confirmar nueva contraseña</label>
              <div class="password-input-wrap">
                <input
                  id="confirm-password"
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="Repite la nueva contraseña"
                  autocomplete="new-password"
                  @keydown="resetError"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  @click="showConfirm = !showConfirm"
                  :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <i :class="showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <p v-if="errorMessage" class="password-alert">
              <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
            </p>

            <p v-if="success" class="password-success">
              <i class="fas fa-check-circle"></i> Contraseña actualizada correctamente
            </p>

            <button
              class="password-submit-btn"
              :disabled="sending"
              @click="UPDATE"
            >
              <span v-if="!sending"><i class="fas fa-save"></i> Actualizar contraseña</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Actualizando...</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'

const WEAK_PASSWORD_MSG =
  'La nueva contraseña debe tener al menos 5 caracteres, incluir al menos una letra y al menos un número'

function isValidPassword(password) {
  const value = String(password || '')
  if (value.length < 5) return false
  const hasLetter = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value)
  const hasNumber = /\d/.test(value)
  return hasLetter && hasNumber
}

const ERROR_MESSAGES = {
  'invalid password': 'La contraseña actual no coincide',
  'missing fields': 'Completa todos los campos',
  'weak password': WEAK_PASSWORD_MSG,
}

export default {
  components: {
    App,
  },
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOld: false,
      showNew: false,
      showConfirm: false,
      loading: true,
      sending: false,
      errorMessage: '',
      success: false,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  async created() {
    const { data } = await api.Password.GET(this.session)

    this.loading = false

    if (data.error && data.msg === 'invalid session') this.$router.push('/login')
    if (data.error && data.msg === 'unverified user') this.$router.push('/verify')

    if (!data.error) {
      this.$store.commit('SET_NAME', data.name)
      this.$store.commit('SET_LAST_NAME', data.lastName)
      this.$store.commit('SET_AFFILIATED', data.affiliated)
      this.$store.commit('SET_ACTIVATED', data.activated)
      this.$store.commit('SET__ACTIVATED', data._activated)
    }
  },
  methods: {
    resetError() {
      this.errorMessage = ''
      this.success = false
    },
    validateForm() {
      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        this.errorMessage = ERROR_MESSAGES['missing fields']
        return false
      }
      if (!isValidPassword(this.newPassword)) {
        this.errorMessage = WEAK_PASSWORD_MSG
        return false
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'La confirmación no coincide con la nueva contraseña'
        return false
      }
      if (this.oldPassword === this.newPassword) {
        this.errorMessage = 'La nueva contraseña debe ser diferente a la actual'
        return false
      }
      return true
    },
    async UPDATE() {
      this.resetError()
      if (!this.validateForm()) return

      this.sending = true

      try {
        const { data } = await api.Password.UPDATE(this.session, {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        })

        if (data.error) {
          this.errorMessage = ERROR_MESSAGES[data.msg] || 'No se pudo actualizar la contraseña'
          return
        }

        this.success = true
        this.oldPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
      } catch (e) {
        console.error('Error updating password:', e)
        this.errorMessage = 'Error de conexión. Intenta nuevamente.'
      } finally {
        this.sending = false
      }
    },
  },
}
</script>

<style scoped src="../../assets/style/views/app/Profile.css"></style>
<style scoped>
.password-glass-card {
  max-width: 520px;
}

.password-back-link {
  color: #e91e63;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.password-back-link:hover {
  color: #1a1a1a;
}

.password-glass-hint {
  color: #444;
  font-size: 0.98rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrap input {
  width: 100%;
  padding-right: 48px;
}

.password-glass-card .glass-form-group input:focus {
  border: 2px solid #e91e63;
  box-shadow: 0 4px 16px rgba(233, 30, 99, 0.12) inset,
    0 2px 12px rgba(233, 30, 99, 0.08);
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #e91e63;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
}

.password-alert {
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.08);
  border: 1px solid rgba(211, 47, 47, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  margin: 8px 0 16px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-success {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.08);
  border: 1px solid rgba(46, 125, 50, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  margin: 8px 0 16px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-submit-btn {
  width: 100%;
  margin-top: 8px;
  background: #e91e63;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 24px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(233, 30, 99, 0.25);
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s, opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.password-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #c2185b;
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.32);
}

.password-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-container {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
}

.loading-spinner-large {
  width: 42px;
  height: 42px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e91e63;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
