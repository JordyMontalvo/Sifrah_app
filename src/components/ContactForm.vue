<template>
  <div class="contact-form-container">
    <div class="contact-header">
      <h2>📧 Contáctanos</h2>
      <p>¿Tienes alguna pregunta? ¡Estamos aquí para ayudarte!</p>
    </div>

    <form @submit.prevent="submitForm" class="contact-form">
      <div class="form-group">
        <label for="name">Nombre completo *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Tu nombre completo"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="tu@email.com"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="subject">Asunto *</label>
        <input
          id="subject"
          v-model="form.subject"
          type="text"
          required
          placeholder="¿En qué podemos ayudarte?"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="message">Mensaje *</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="5"
          required
          placeholder="Escribe tu mensaje aquí..."
          :disabled="loading"
        ></textarea>
      </div>

      <button 
        type="submit" 
        class="submit-btn"
        :disabled="loading || !isFormValid"
      >
        <span v-if="!loading">Enviar mensaje</span>
        <span v-else class="loading-text">
          <i class="fas fa-spinner fa-spin"></i> Enviando...
        </span>
      </button>
    </form>

    <!-- Mensaje de éxito -->
    <div v-if="success" class="success-message">
      <i class="fas fa-check-circle"></i>
      <h3>¡Mensaje enviado!</h3>
      <p>Gracias por contactarnos. Te responderemos pronto.</p>
      <button @click="resetForm" class="reset-btn">Enviar otro mensaje</button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Error al enviar</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="reset-btn">Intentar de nuevo</button>
    </div>

    <!-- Información de contacto -->
    <div class="contact-info">
      <div class="info-item">
        <i class="fas fa-envelope"></i>
        <div>
          <h4>Email</h4>
          <p>soporte@sifrah.com</p>
        </div>
      </div>
      <div class="info-item">
        <i class="fas fa-clock"></i>
        <div>
          <h4>Horario de atención</h4>
          <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
        </div>
      </div>
      <div class="info-item">
        <i class="fas fa-map-marker-alt"></i>
        <div>
          <h4>Ubicación</h4>
          <p>Ciudad de México, México</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'ContactForm',
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      loading: false,
      success: false,
      error: null
    };
  },
  computed: {
    isFormValid() {
      return this.form.name.trim() && 
             this.form.email.trim() && 
             this.form.subject.trim() && 
             this.form.message.trim();
    }
  },
  methods: {
    async submitForm() {
      if (!this.isFormValid) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/email/contact', this.form);
        
        if (response.data.success) {
          this.success = true;
          this.resetForm();
        } else {
          this.error = response.data.error || 'Error desconocido al enviar el mensaje';
        }
      } catch (error) {
        console.error('Error enviando formulario:', error);
        this.error = (error.response && error.response.data && error.response.data.error) || 'Error de conexión. Intenta de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      this.success = false;
      this.error = null;
    },

    clearError() {
      this.error = null;
    }
  }
};
</script>

<style scoped>
.contact-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.contact-header {
  text-align: center;
  margin-bottom: 30px;
}

.contact-header h2 {
  color: #4a4a4a;
  font-size: 28px;
  margin: 0 0 10px 0;
}

.contact-header p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.contact-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a4a4a;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.success-message,
.error-message {
  text-align: center;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.success-message i,
.error-message i {
  font-size: 48px;
  margin-bottom: 15px;
}

.success-message h3,
.error-message h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.success-message p,
.error-message p {
  margin: 0 0 20px 0;
  font-size: 16px;
}

.reset-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.reset-btn:hover {
  background: #5a6268;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e9ecef;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-item i {
  font-size: 24px;
  color: #28a745;
  width: 40px;
  text-align: center;
}

.info-item h4 {
  margin: 0 0 5px 0;
  color: #4a4a4a;
  font-size: 16px;
}

.info-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-form-container {
    padding: 15px;
    margin: 10px;
  }
  
  .contact-header h2 {
    font-size: 24px;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    padding: 15px;
  }
}
</style> 