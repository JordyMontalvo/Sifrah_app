<template>
  <div class="sifrah-assistant-container">
    <!-- Botón flotante -->
    <button 
      v-if="!isOpen" 
      @click="toggleChat" 
      class="assistant-bubble-btn" 
      aria-label="Abrir Asistente de Bienestar"
      title="Asistente de Bienestar Sifrah"
    >
      <span class="bubble-icon">🌿</span>
      <span class="bubble-badge" v-if="unreadBadge">1</span>
    </button>

    <!-- Modal / Ventana de Chat -->
    <div v-if="isOpen" class="assistant-modal" role="dialog" aria-modal="true">
      <!-- Header -->
      <div class="assistant-header">
        <div class="header-info">
          <div class="avatar-container">
            <span class="avatar-icon">🩺</span>
            <span class="status-dot"></span>
          </div>
          <div>
            <h3 class="header-title">Asistente Sifrah</h3>
            <p class="header-subtitle">Orientación en Salud y Suplementos</p>
          </div>
        </div>
        <button @click="toggleChat" class="close-btn" aria-label="Cerrar chat">✕</button>
      </div>

      <!-- Disclaimer legal superior -->
      <div class="assistant-disclaimer">
        ℹ️ Orientación informativa sobre bienestar. No reemplaza diagnóstico médico.
      </div>

      <!-- Historial de mensajes -->
      <div class="assistant-messages" ref="messagesContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message-row', msg.sender === 'user' ? 'user-row' : 'bot-row']"
        >
          <div :class="['message-bubble', msg.sender === 'user' ? 'user-bubble' : 'bot-bubble', msg.isEmergency ? 'emergency-bubble' : '']">
            <!-- Texto del mensaje -->
            <div class="message-content" v-html="formatMessage(msg.text)"></div>

            <!-- Tarjetas de productos recomendados -->
            <div v-if="msg.products && msg.products.length" class="products-carousel">
              <div 
                v-for="(prod, pIdx) in msg.products" 
                :key="pIdx" 
                class="product-recommendation-card"
              >
                <div class="card-badge">{{ prod.category }}</div>
                <h4 class="card-title">{{ prod.name }}</h4>
                <p class="card-benefit">{{ prod.mainBenefit }}</p>
                <div class="card-footer">
                  <span class="card-price">S/ {{ prod.price }} <small>({{ prod.points }} pts)</small></span>
                  <router-link :to="prod.buyUrl" class="card-action-btn" @click.native="closeOnNav">
                    Comprar
                  </router-link>
                </div>
              </div>
            </div>

            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>

        <!-- Indicador de escribiendo -->
        <div v-if="isLoading" class="message-row bot-row">
          <div class="message-bubble bot-bubble typing-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- Preguntas rápidas -->
      <div class="quick-prompts" v-if="messages.length <= 1">
        <button 
          v-for="(prompt, qIdx) in quickPrompts" 
          :key="qIdx" 
          @click="sendQuickPrompt(prompt)"
          class="quick-pill"
        >
          {{ prompt }}
        </button>
      </div>

      <!-- Input de envío -->
      <div class="assistant-input-area">
        <input 
          v-model="inputText" 
          @keyup.enter="sendMessage" 
          type="text" 
          placeholder="Escribe tu molestia o consulta..." 
          :disabled="isLoading"
          maxlength="250"
          ref="inputField"
        />
        <button 
          @click="sendMessage" 
          :disabled="isLoading || !inputText.trim()" 
          class="send-btn"
          aria-label="Enviar consulta"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SifrahAssistant',
  props: {
    distributorCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isOpen: false,
      isLoading: false,
      unreadBadge: false,
      inputText: '',
      messages: [
        {
          sender: 'bot',
          text: '¡Hola! 👋 Soy tu Asistente de Bienestar Sifrah.\n\nCuéntame qué dolencia o molestia estás sintiendo (por ejemplo: _dolor de rodillas_, _ardor en el estómago_, _caída de cabello_, _cansancio_), y te orientaré con los suplementos y hábitos ideales para ti.',
          products: [],
          time: this.getCurrentTime()
        }
      ],
      quickPrompts: [
        'Me duelen las rodillas',
        'Tengo acidez y gastritis',
        'Se me cae el cabello',
        'Siento mucho cansancio'
      ]
    };
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.unreadBadge = false;
        this.$nextTick(() => {
          this.scrollToBottom();
          if (this.$refs.inputField) this.$refs.inputField.focus();
        });
      }
    },
    closeOnNav() {
      this.isOpen = false;
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    formatMessage(text) {
      if (!text) return '';
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    sendQuickPrompt(promptText) {
      this.inputText = promptText;
      this.sendMessage();
    },
    async sendMessage() {
      const query = this.inputText.trim();
      if (!query || this.isLoading) return;

      // Agregar mensaje del usuario
      this.messages.push({
        sender: 'user',
        text: query,
        products: [],
        time: this.getCurrentTime()
      });

      this.inputText = '';
      this.isLoading = true;
      this.$nextTick(this.scrollToBottom);

      try {
        const token = localStorage.getItem('token') || '';
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        const code = this.distributorCode || userObj.code || userObj.username || localStorage.getItem('distributor_code') || '';

        const apiUrl = (process.env.VUE_APP_SERVER ? process.env.VUE_APP_SERVER : 'https://api.serve-sifrah.xyz') + '/api/app/assistant';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            query,
            distributorCode: code
          })
        });

        const resData = await response.json();

        if (resData.status && resData.data) {
          const { reply, message, recommendedProducts, isEmergency } = resData.data;
          this.messages.push({
            sender: 'bot',
            text: reply || message || 'No obtuve respuesta.',
            products: recommendedProducts || [],
            isEmergency: !!isEmergency,
            time: this.getCurrentTime()
          });
        } else {
          this.messages.push({
            sender: 'bot',
            text: 'Ocurrió un problema temporal al procesar tu consulta. Por favor, intenta nuevamente.',
            products: [],
            time: this.getCurrentTime()
          });
        }
      } catch (err) {
        this.messages.push({
          sender: 'bot',
          text: 'No fue posible conectar con el servidor de asistencia. Verifica tu conexión a internet.',
          products: [],
          time: this.getCurrentTime()
        });
      } finally {
        this.isLoading = false;
        this.$nextTick(this.scrollToBottom);
      }
    }
  }
};
</script>

<style scoped>
.sifrah-assistant-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Burbuja flotante */
.assistant-bubble-btn {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.assistant-bubble-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 22px rgba(16, 185, 129, 0.45);
}

.bubble-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: bold;
  border-radius: 10px;
  padding: 2px 6px;
}

/* Modal de chat */
.assistant-modal {
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 580px;
  max-height: calc(100vh - 100px);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.assistant-header {
  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
  color: white;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-container {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #34d399;
  border: 2px solid #065f46;
  border-radius: 50%;
}

.header-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 11px;
  opacity: 0.85;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Disclaimer */
.assistant-disclaimer {
  background: #f0fdf4;
  color: #166534;
  font-size: 11px;
  padding: 6px 12px;
  border-bottom: 1px solid #dcfce7;
  text-align: center;
}

/* Mensajes */
.assistant-messages {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
}

.message-row {
  display: flex;
}

.user-row {
  justify-content: flex-end;
}

.bot-row {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.user-bubble {
  background: #10b981;
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-bubble {
  background: #ffffff;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  border: 1px solid #e2e8f0;
}

.emergency-bubble {
  background: #fee2e2 !important;
  color: #991b1b !important;
  border: 1px solid #f87171 !important;
}

.message-time {
  display: block;
  font-size: 9px;
  margin-top: 4px;
  opacity: 0.6;
  text-align: right;
}

/* Tarjetas de recomendación */
.products-carousel {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-recommendation-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 8px 10px;
}

.card-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #047857;
  letter-spacing: 0.5px;
}

.card-title {
  margin: 3px 0 2px 0;
  font-size: 13px;
  color: #064e3b;
}

.card-benefit {
  margin: 0;
  font-size: 11px;
  color: #374151;
}

.card-footer {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  font-size: 12px;
  font-weight: 700;
  color: #047857;
}

.card-action-btn {
  background: #047857;
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
}

/* Typing */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: blink 1.2s infinite both;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.1); }
}

/* Quick pills */
.quick-prompts {
  padding: 8px 12px;
  background: #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-pill {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-pill:hover {
  background: #ecfdf5;
  border-color: #10b981;
  color: #047857;
}

/* Input */
.assistant-input-area {
  padding: 10px 12px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.assistant-input-area input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.assistant-input-area input:focus {
  border-color: #10b981;
}

.send-btn {
  background: #10b981;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>
