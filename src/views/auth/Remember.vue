<template>
  <Auth>
    <div class="remember-container">
      <!-- Header -->
      <div class="remember-header">
        <div class="logo-container">
          <img src="@/assets/img/logo/logo sifrah BLANCO LOGIN.svg" alt="Sifrah Logo" class="logo" />
        </div>
        <h1>¿Olvidaste tu contraseña?</h1>
        <p>No te preocupes, te ayudaremos a recuperarla</p>
      </div>

      <!-- Formulario de recuperación -->
      <div v-if="!loading" class="remember-form">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="email">Email de tu cuenta</label>
            <div class="input-container">
              <i class="fas fa-envelope"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@email.com"
                :class="{ 'error': errors.email }"
                @input="errors.email = ''"
                @blur="validateEmail"
              />
            </div>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            <i class="fas fa-paper-plane"></i>
            Enviar instrucciones
          </button>
        </form>

        <!-- Enlaces de ayuda -->
        <div class="help-links">
          <router-link to="/login" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Volver al login
          </router-link>
          <router-link to="/register" class="register-link">
            ¿No tienes cuenta? Regístrate
          </router-link>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Enviando instrucciones...</h3>
        <p>Por favor espera un momento</p>
      </div>


    </div>
    
    <!-- Notificación flotante -->
    <FloatingNotification
      :show="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      :duration="4000"
      @close="hideNotification"
    />
  </Auth>
</template>

<script>
import Auth from '@/views/layouts/Auth'
import api from '@/api'
import FloatingNotification from '@/components/FloatingNotification.vue'

export default {
  name: 'Remember',
  components: { 
    Auth,
    FloatingNotification
  },
  data() {
    return {
      form: {
        email: ''
      },
      errors: {},
      loading: false,
      // Notificación flotante
      showNotification: false,
      notificationType: 'info',
      notificationTitle: '',
      notificationMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return this.form.email.trim() && !this.errors.email
    }
  },
  methods: {
    validateEmail() {
      const email = this.form.email.trim()
      this.errors.email = ''

      if (!email) {
        this.errors.email = 'El email es requerido'
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        this.errors.email = 'Formato de email inválido'
        return false
      }

      return true
    },

    apiErrorMessage(data, fallback) {
      if (!data) return fallback
      if (typeof data.msg === 'string' && data.msg) return data.msg
      if (typeof data.error === 'string' && data.error) return data.error
      return fallback
    },

    async submitForm() {
      if (!this.validateEmail()) return

      this.loading = true
      const email = String(this.form.email || '').trim()

      try {
        const response = await api.forgotPassword({ email })
        const data = (response && response.data) || {}

        if (!data.error) {
          this.showSuccessNotification('Si el email está registrado, recibirás las instrucciones en tu bandeja de entrada.')
          this.form.email = ''
          this.errors = {}
        } else {
          this.showErrorNotification(this.apiErrorMessage(data, 'Error al enviar el correo. Intenta de nuevo.'))
        }
      } catch (error) {
        const data = error && error.response && error.response.data
        this.showErrorNotification(this.apiErrorMessage(data, 'Error de conexión. Intenta de nuevo.'))
      } finally {
        this.loading = false
      }
    },

    generateResetToken() {
      // Generar token temporal de 16 caracteres
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let token = ''
      for (let i = 0; i < 16; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return token
    },

    resetForm() {
      this.form.email = ''
      this.errors = {}
      this.emailSent = false
      this.error = null
    },

    // Métodos de notificación
    showSuccessNotification(message) {
      this.notificationType = 'success'
      this.notificationTitle = '¡Éxito!'
      this.notificationMessage = message
      this.showNotification = true
    },

    showErrorNotification(message) {
      this.notificationType = 'error'
      this.notificationTitle = 'Error'
      this.notificationMessage = message
      this.showNotification = true
    },

    hideNotification() {
      this.showNotification = false
    }
  }
}
</script>

<style scoped>
.remember-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.remember-header {
  margin-bottom: 30px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  height: 60px;
  width: auto;
}

.remember-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.remember-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.remember-form {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.input-container {
  position: relative;
}

.input-container i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: #999;
}

.form-group input:focus {
  outline: none;
  border-color: #ffd200;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #ffd200 0%, #f7971e 100%);
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 210, 0, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.help-links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.help-links a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.help-links a:hover {
  color: #f7971e;
}

.back-link {
  color: #999 !important;
}

.register-link {
  color: #f7971e !important;
}

.legal-inline {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: #888;
}

.legal-inline a {
  color: #e91e63 !important;
  font-weight: inherit;
  display: inline !important;
  gap: 0;
}

.legal-inline span {
  margin: 0 6px;
  color: #ccc;
}

/* Estados de carga, éxito y error */
.loading-state,
.success-state,
.error-state {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #ffd200;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-icon,
.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.success-icon {
  color: #28a745;
}

.error-icon {
  color: #dc3545;
}

.loading-state h3,
.success-state h3,
.error-state h3 {
  color: #333;
  font-size: 24px;
  margin: 0 0 15px 0;
}

.loading-state p,
.success-state p,
.error-state p {
  color: #666;
  font-size: 16px;
  margin: 0 0 15px 0;
}

.email-sent {
  background: #e8f5e8;
  border: 1px solid #c3e6cb;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.email-sent strong {
  color: #28a745;
  font-size: 18px;
}

.instructions {
  font-size: 14px !important;
  color: #666 !important;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  flex-direction: column;
}

.primary-btn,
.secondary-btn,
.retry-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-block;
  text-align: center;
}

.primary-btn {
  background: linear-gradient(135deg, #ffd200 0%, #f7971e 100%);
  color: #333;
}

.secondary-btn {
  background: #6c757d;
  color: #fff;
  border: 2px solid #6c757d;
}

.retry-btn {
  background: #dc3545;
  color: #fff;
}

.primary-btn:hover,
.secondary-btn:hover,
.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 480px) {
  .remember-container {
    padding: 15px;
  }
  
  .remember-form,
  .loading-state,
  .success-state,
  .error-state {
    padding: 25px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
