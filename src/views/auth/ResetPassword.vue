<template>
  <Auth>
    <div class="reset-container">
      <!-- Header -->
      <div class="reset-header">
        <div class="logo-container">
          <img src="@/assets/img/logo/logo sifrah BLANCO LOGIN.svg" alt="Sifrah Logo" class="logo" />
        </div>
        <h1>Restablecer Contraseña</h1>
        <p>Ingresa tu nueva contraseña</p>
      </div>

      <!-- Formulario de restablecimiento -->
      <div v-if="!passwordReset && !loading" class="reset-form">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <div class="input-container">
              <i class="fas fa-lock"></i>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                placeholder="Tu nueva contraseña"
                :class="{ 'error': errors.password }"
                @blur="validatePassword"
              />
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="input-container">
              <i class="fas fa-lock"></i>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="Confirma tu nueva contraseña"
                :class="{ 'error': errors.confirmPassword }"
                @blur="validateConfirmPassword"
              />
            </div>
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            <i class="fas fa-key"></i>
            Cambiar contraseña
          </button>
        </form>

        <!-- Enlaces de ayuda -->
        <div class="help-links">
          <router-link to="/login" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Volver al login
          </router-link>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Cambiando contraseña...</h3>
        <p>Por favor espera un momento</p>
      </div>

      <!-- Estado de éxito -->
      <div v-if="passwordReset" class="success-state">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>¡Contraseña cambiada!</h3>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
        <div class="action-buttons">
          <router-link to="/login" class="primary-btn">
            Iniciar sesión
          </router-link>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-if="error" class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3>Error al cambiar contraseña</h3>
        <p>{{ error }}</p>
        <div class="action-buttons">
          <button @click="clearError" class="retry-btn">
            Intentar de nuevo
          </button>
          <router-link to="/remember" class="secondary-btn">
            Solicitar nuevo token
          </router-link>
        </div>
      </div>
    </div>
  </Auth>
</template>

<script>
import Auth from '@/views/layouts/Auth'
import api from '@/api'

export default {
  name: 'ResetPassword',
  components: { Auth },
  data() {
    return {
      form: {
        password: '',
        confirmPassword: ''
      },
      errors: {},
      loading: false,
      passwordReset: false,
      error: null,
      resetToken: null
    }
  },
  computed: {
    isFormValid() {
      return this.form.password.trim() && 
             this.form.confirmPassword.trim() && 
             !this.errors.password && 
             !this.errors.confirmPassword
    }
  },
  mounted() {
    // Obtener token de la URL o localStorage
    this.resetToken = this.$route.query.token || localStorage.getItem('resetToken')
    
    if (!this.resetToken) {
      this.error = 'Token de restablecimiento no válido o expirado'
    }
  },
  methods: {
    validatePassword() {
      const password = this.form.password.trim()
      this.errors.password = ''

      if (!password) {
        this.errors.password = 'La contraseña es requerida'
        return false
      }

      if (password.length < 8) {
        this.errors.password = 'La contraseña debe tener al menos 8 caracteres'
        return false
      }

      // Validar que contenga al menos una letra y un número
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /\d/.test(password)
      
      if (!hasLetter || !hasNumber) {
        this.errors.password = 'La contraseña debe contener letras y números'
        return false
      }

      return true
    },

    validateConfirmPassword() {
      const confirmPassword = this.form.confirmPassword.trim()
      this.errors.confirmPassword = ''

      if (!confirmPassword) {
        this.errors.confirmPassword = 'Confirma tu contraseña'
        return false
      }

      if (confirmPassword !== this.form.password) {
        this.errors.confirmPassword = 'Las contraseñas no coinciden'
        return false
      }

      return true
    },

    async submitForm() {
      if (!this.validatePassword() || !this.validateConfirmPassword()) return

      this.loading = true
      this.error = null

      try {
        // Aquí deberías hacer la llamada al backend para cambiar la contraseña
        // Por ahora simulamos el éxito
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.passwordReset = true
        
        // Limpiar token del localStorage
        localStorage.removeItem('resetToken')
        
        // En producción, aquí harías:
        // const response = await api.post('/api/auth/reset-password', {
        //   token: this.resetToken,
        //   password: this.form.password
        // })
        
      } catch (error) {
        console.error('Error cambiando contraseña:', error)
        this.error = (error.response && error.response.data && error.response.data.error) || 'Error al cambiar la contraseña. Intenta de nuevo.'
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
}
</script>

<style scoped>
.reset-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.reset-header {
  margin-bottom: 30px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  height: 60px;
  width: auto;
}

.reset-header h1 {
  color: #333;
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.reset-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.reset-form {
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
  .reset-container {
    padding: 15px;
  }
  
  .reset-form,
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