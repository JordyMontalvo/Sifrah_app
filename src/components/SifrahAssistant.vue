<template>
  <div v-if="shouldShow" class="sifrah-assistant-wrapper">
    <!-- PANEL 01: Pestaña flotante discreta ("Siempre a mano") -->
    <transition name="slide-tab">
      <div 
        v-if="!isChatOpen && !isGreetingOpen"
        class="floating-tab"
        @click="openGreeting"
        @touchstart="onTabTouchStart"
        @touchmove="onTabTouchMove"
        @touchend="onTabTouchEnd"
        role="button"
        aria-label="Abrir asistente SIFRAH"
        title="SIFRAH • Tu asistente personal"
      >
        <div class="tab-inner">
          <svg viewBox="410 185 230 430" fill="currentColor" class="tab-sifrah-logo">
            <path d="M480.19,445.26c-5,9.42-12.65,14.13-22.12,16.4-1.57.38-3.19.54-4.79.79-16.39,2.52-28.4-9.56-25.8-26,2.56-16.24,13-25.81,27.41-31.8,7.83-3.25,16.09-4.78,24.48-5.67,28.23-3,51.38-15.07,67.15-39.08,10-15.21,15-32.45,17.32-50.49A186.92,186.92,0,0,0,565,288.09c0-1.5-.67-3.24,1.08-4.61,2.05,1.27,2.1,3.5,2.57,5.42a347.8,347.8,0,0,1,9.73,103.41c-2.45,41.44-12.84,80.75-35.47,116-18.4,28.69-43.1,50.91-72.6,67.88a208.65,208.65,0,0,1-22.39,11.56c-2.31,1-4.7,1.75-7.06,2.62l-.6-1c3.88-3.23,7.68-6.55,11.63-9.67,26.75-21.17,48.78-46.21,62.73-77.63,7-15.82,11.11-32,3.31-49.15-9.47-20.77-27.27-30.28-48.89-27.29-6.86.95-13.67,2.46-19.36,7-4.89,3.93-7.1,9.37-5.29,13.91,1.95,4.86,8.11,8,14.14,7.08a40,40,0,0,0,16.05-6.51C475.93,446.22,477.13,444.63,480.19,445.26Z"/>
            <path d="M599.07,274.45c4.54,7.94,5.42,16.82,7.17,25.41a304.14,304.14,0,0,1,6,66.46c-.7,37-6.82,73-22.51,106.85-18.73,40.4-48,71.15-86.71,93a229.64,229.64,0,0,1-25.14,12.49,4.93,4.93,0,0,1-4.15.48c4-2.49,7.31-4.63,10.69-6.63,35.93-21.22,62.37-51.2,81.71-87.89,20-37.91,29.87-78.68,34.32-120.92a348,348,0,0,0-1.38-87.42A12.69,12.69,0,0,1,599.07,274.45Z"/>
            <path d="M506.1,372.88c-14.81.85-26-10.92-26.31-25.16-.34-14.92,11.28-26.33,26.28-26.5,13.79-.15,26,12.42,25.69,26.76C531.48,361.52,519.47,374,506.1,372.88Z"/>
            <path d="M533.69,228.15c7.68-3,15.36-2,20.78-7.49s5.15-12.89,7.35-20.66c4.17,7.11,2.58,15.16,8.38,20.61s13.26,4.37,20.44,7.63c-7.13,3.5-15.1,2.46-20.59,7.83s-4.31,13.52-7.79,20.73c-3.26-7.19-2.14-14.84-7.67-20.36S541.38,231.83,533.69,228.15Z"/>
            <path d="M610.6,252.08c-6,1.72-10.3,4.08-11,10.32-.06.5-.75.93-1.14,1.39-.45-.39-1.25-.73-1.3-1.17-.74-6.34-4.85-9.06-11.18-10.32,6.77-1.69,10.92-5.52,12.12-12.82C599.78,246.41,603.32,250.86,610.6,252.08Z"/>
          </svg>
        </div>
      </div>
    </transition>

    <!-- BACKDROP PARA CERRAR EL SALUDO AL TOCAR FUERA -->
    <div 
      v-if="isGreetingOpen && !isChatOpen" 
      class="greeting-backdrop" 
      @click="closeGreeting"
    ></div>

    <!-- PANEL 02: Saludo breve desplegable horizontal ("Un saludo para ti") -->
    <transition name="slide-greeting">
      <div 
        v-if="!isChatOpen && isGreetingOpen" 
        class="greeting-panel"
        @click="openChat"
        @touchstart="onGreetingTouchStart"
        @touchmove="onGreetingTouchMove"
        @touchend="onGreetingTouchEnd"
      >
        <div class="greeting-left">
          <svg viewBox="410 185 230 430" fill="currentColor" class="greeting-sifrah-logo">
            <path d="M480.19,445.26c-5,9.42-12.65,14.13-22.12,16.4-1.57.38-3.19.54-4.79.79-16.39,2.52-28.4-9.56-25.8-26,2.56-16.24,13-25.81,27.41-31.8,7.83-3.25,16.09-4.78,24.48-5.67,28.23-3,51.38-15.07,67.15-39.08,10-15.21,15-32.45,17.32-50.49A186.92,186.92,0,0,0,565,288.09c0-1.5-.67-3.24,1.08-4.61,2.05,1.27,2.1,3.5,2.57,5.42a347.8,347.8,0,0,1,9.73,103.41c-2.45,41.44-12.84,80.75-35.47,116-18.4,28.69-43.1,50.91-72.6,67.88a208.65,208.65,0,0,1-22.39,11.56c-2.31,1-4.7,1.75-7.06,2.62l-.6-1c3.88-3.23,7.68-6.55,11.63-9.67,26.75-21.17,48.78-46.21,62.73-77.63,7-15.82,11.11-32,3.31-49.15-9.47-20.77-27.27-30.28-48.89-27.29-6.86.95-13.67,2.46-19.36,7-4.89,3.93-7.1,9.37-5.29,13.91,1.95,4.86,8.11,8,14.14,7.08a40,40,0,0,0,16.05-6.51C475.93,446.22,477.13,444.63,480.19,445.26Z"/>
            <path d="M599.07,274.45c4.54,7.94,5.42,16.82,7.17,25.41a304.14,304.14,0,0,1,6,66.46c-.7,37-6.82,73-22.51,106.85-18.73,40.4-48,71.15-86.71,93a229.64,229.64,0,0,1-25.14,12.49,4.93,4.93,0,0,1-4.15.48c4-2.49,7.31-4.63,10.69-6.63,35.93-21.22,62.37-51.2,81.71-87.89,20-37.91,29.87-78.68,34.32-120.92a348,348,0,0,0-1.38-87.42A12.69,12.69,0,0,1,599.07,274.45Z"/>
            <path d="M506.1,372.88c-14.81.85-26-10.92-26.31-25.16-.34-14.92,11.28-26.33,26.28-26.5,13.79-.15,26,12.42,25.69,26.76C531.48,361.52,519.47,374,506.1,372.88Z"/>
            <path d="M533.69,228.15c7.68-3,15.36-2,20.78-7.49s5.15-12.89,7.35-20.66c4.17,7.11,2.58,15.16,8.38,20.61s13.26,4.37,20.44,7.63c-7.13,3.5-15.1,2.46-20.59,7.83s-4.31,13.52-7.79,20.73c-3.26-7.19-2.14-14.84-7.67-20.36S541.38,231.83,533.69,228.15Z"/>
            <path d="M610.6,252.08c-6,1.72-10.3,4.08-11,10.32-.06.5-.75.93-1.14,1.39-.45-.39-1.25-.73-1.3-1.17-.74-6.34-4.85-9.06-11.18-10.32,6.77-1.69,10.92-5.52,12.12-12.82C599.78,246.41,603.32,250.86,610.6,252.08Z"/>
          </svg>
          <span class="greeting-text">Hola, {{ userName }} 👋</span>
        </div>
        <button class="greeting-action-btn" aria-label="Abrir conversación">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>
      </div>
    </transition>

    <!-- PANEL 03: Chat a pantalla completa ("Conversa con SIFRAH") -->
    <transition name="chat-modal">
      <div 
        v-if="isChatOpen" 
        class="chat-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-header-title"
      >
        <!-- Header superior -->
        <header class="chat-header">
          <div class="chat-header-brand">
            <div class="brand-logo-wrap">
              <svg viewBox="410 185 230 430" fill="currentColor" class="chat-header-sifrah-logo">
                <path d="M480.19,445.26c-5,9.42-12.65,14.13-22.12,16.4-1.57.38-3.19.54-4.79.79-16.39,2.52-28.4-9.56-25.8-26,2.56-16.24,13-25.81,27.41-31.8,7.83-3.25,16.09-4.78,24.48-5.67,28.23-3,51.38-15.07,67.15-39.08,10-15.21,15-32.45,17.32-50.49A186.92,186.92,0,0,0,565,288.09c0-1.5-.67-3.24,1.08-4.61,2.05,1.27,2.1,3.5,2.57,5.42a347.8,347.8,0,0,1,9.73,103.41c-2.45,41.44-12.84,80.75-35.47,116-18.4,28.69-43.1,50.91-72.6,67.88a208.65,208.65,0,0,1-22.39,11.56c-2.31,1-4.7,1.75-7.06,2.62l-.6-1c3.88-3.23,7.68-6.55,11.63-9.67,26.75-21.17,48.78-46.21,62.73-77.63,7-15.82,11.11-32,3.31-49.15-9.47-20.77-27.27-30.28-48.89-27.29-6.86.95-13.67,2.46-19.36,7-4.89,3.93-7.1,9.37-5.29,13.91,1.95,4.86,8.11,8,14.14,7.08a40,40,0,0,0,16.05-6.51C475.93,446.22,477.13,444.63,480.19,445.26Z"/>
                <path d="M599.07,274.45c4.54,7.94,5.42,16.82,7.17,25.41a304.14,304.14,0,0,1,6,66.46c-.7,37-6.82,73-22.51,106.85-18.73,40.4-48,71.15-86.71,93a229.64,229.64,0,0,1-25.14,12.49,4.93,4.93,0,0,1-4.15.48c4-2.49,7.31-4.63,10.69-6.63,35.93-21.22,62.37-51.2,81.71-87.89,20-37.91,29.87-78.68,34.32-120.92a348,348,0,0,0-1.38-87.42A12.69,12.69,0,0,1,599.07,274.45Z"/>
                <path d="M506.1,372.88c-14.81.85-26-10.92-26.31-25.16-.34-14.92,11.28-26.33,26.28-26.5,13.79-.15,26,12.42,25.69,26.76C531.48,361.52,519.47,374,506.1,372.88Z"/>
                <path d="M533.69,228.15c7.68-3,15.36-2,20.78-7.49s5.15-12.89,7.35-20.66c4.17,7.11,2.58,15.16,8.38,20.61s13.26,4.37,20.44,7.63c-7.13,3.5-15.1,2.46-20.59,7.83s-4.31,13.52-7.79,20.73c-3.26-7.19-2.14-14.84-7.67-20.36S541.38,231.83,533.69,228.15Z"/>
                <path d="M610.6,252.08c-6,1.72-10.3,4.08-11,10.32-.06.5-.75.93-1.14,1.39-.45-.39-1.25-.73-1.3-1.17-.74-6.34-4.85-9.06-11.18-10.32,6.77-1.69,10.92-5.52,12.12-12.82C599.78,246.41,603.32,250.86,610.6,252.08Z"/>
              </svg>
            </div>
            <div class="brand-text-col">
              <h2 id="chat-header-title" class="brand-title">SIFRAH</h2>
              <p class="brand-subtitle">Tu asistente personal</p>
            </div>
          </div>

          <div class="chat-header-actions">
            <!-- Icono reloj historial -->
            <button 
              class="header-action-btn" 
              @click="toggleHistoryPrompt" 
              aria-label="Historial de conversación"
              title="Historial"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>

            <!-- Botón cerrar (regresar a pantalla anterior) -->
            <button 
              class="header-action-btn close-btn" 
              @click="closeChat" 
              aria-label="Cerrar chat"
              title="Cerrar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- Área de mensajes de conversación -->
        <main class="chat-messages-scroll" ref="messagesScroll">
          <div 
            v-for="(msg, index) in messages" 
            :key="'msg-' + index"
            :class="['message-item', msg.sender === 'user' ? 'message-item--user' : 'message-item--bot']"
          >
            <!-- Avatar del Asistente SIFRAH -->
            <div v-if="msg.sender === 'bot'" class="bot-avatar-badge">
              <svg viewBox="410 185 230 430" fill="currentColor" class="avatar-sifrah-icon">
                <path d="M480.19,445.26c-5,9.42-12.65,14.13-22.12,16.4-1.57.38-3.19.54-4.79.79-16.39,2.52-28.4-9.56-25.8-26,2.56-16.24,13-25.81,27.41-31.8,7.83-3.25,16.09-4.78,24.48-5.67,28.23-3,51.38-15.07,67.15-39.08,10-15.21,15-32.45,17.32-50.49A186.92,186.92,0,0,0,565,288.09c0-1.5-.67-3.24,1.08-4.61,2.05,1.27,2.1,3.5,2.57,5.42a347.8,347.8,0,0,1,9.73,103.41c-2.45,41.44-12.84,80.75-35.47,116-18.4,28.69-43.1,50.91-72.6,67.88a208.65,208.65,0,0,1-22.39,11.56c-2.31,1-4.7,1.75-7.06,2.62l-.6-1c3.88-3.23,7.68-6.55,11.63-9.67,26.75-21.17,48.78-46.21,62.73-77.63,7-15.82,11.11-32,3.31-49.15-9.47-20.77-27.27-30.28-48.89-27.29-6.86.95-13.67,2.46-19.36,7-4.89,3.93-7.1,9.37-5.29,13.91,1.95,4.86,8.11,8,14.14,7.08a40,40,0,0,0,16.05-6.51C475.93,446.22,477.13,444.63,480.19,445.26Z"/>
                <path d="M599.07,274.45c4.54,7.94,5.42,16.82,7.17,25.41a304.14,304.14,0,0,1,6,66.46c-.7,37-6.82,73-22.51,106.85-18.73,40.4-48,71.15-86.71,93a229.64,229.64,0,0,1-25.14,12.49,4.93,4.93,0,0,1-4.15.48c4-2.49,7.31-4.63,10.69-6.63,35.93-21.22,62.37-51.2,81.71-87.89,20-37.91,29.87-78.68,34.32-120.92a348,348,0,0,0-1.38-87.42A12.69,12.69,0,0,1,599.07,274.45Z"/>
                <path d="M506.1,372.88c-14.81.85-26-10.92-26.31-25.16-.34-14.92,11.28-26.33,26.28-26.5,13.79-.15,26,12.42,25.69,26.76C531.48,361.52,519.47,374,506.1,372.88Z"/>
                <path d="M533.69,228.15c7.68-3,15.36-2,20.78-7.49s5.15-12.89,7.35-20.66c4.17,7.11,2.58,15.16,8.38,20.61s13.26,4.37,20.44,7.63c-7.13,3.5-15.1,2.46-20.59,7.83s-4.31,13.52-7.79,20.73c-3.26-7.19-2.14-14.84-7.67-20.36S541.38,231.83,533.69,228.15Z"/>
                <path d="M610.6,252.08c-6,1.72-10.3,4.08-11,10.32-.06.5-.75.93-1.14,1.39-.45-.39-1.25-.73-1.3-1.17-.74-6.34-4.85-9.06-11.18-10.32,6.77-1.69,10.92-5.52,12.12-12.82C599.78,246.41,603.32,250.86,610.6,252.08Z"/>
              </svg>
            </div>

            <div class="message-bubble-wrapper">
              <!-- Burbuja de mensaje -->
              <div :class="['message-bubble', msg.sender === 'user' ? 'bubble--user' : 'bubble--bot', msg.isEmergency ? 'bubble--emergency' : '']">
                <div class="message-text" v-html="formatMessage(msg.text)"></div>

                <!-- Tarjetas de productos recomendados -->
                <div v-if="msg.products && msg.products.length" class="recommended-products-list">
                  <div 
                    v-for="(prod, pIdx) in msg.products" 
                    :key="'prod-' + pIdx" 
                    class="product-mini-card"
                  >
                    <div class="prod-badge">{{ prod.category }}</div>
                    <h4 class="prod-title">{{ prod.name }}</h4>
                    <p class="prod-benefit">{{ prod.mainBenefit }}</p>
                    <div class="prod-footer">
                      <span class="prod-price">S/ {{ prod.price }} <small>({{ prod.points }} pts)</small></span>
                      <router-link :to="prod.buyUrl" class="prod-buy-btn" @click.native="closeChat">
                        Comprar
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hora y estado de entrega -->
              <div :class="['message-meta', msg.sender === 'user' ? 'meta--user' : 'meta--bot']">
                <span>{{ msg.time }}</span>
                <span v-if="msg.sender === 'user'" class="read-receipt">✓✓</span>
              </div>
            </div>
          </div>

          <!-- Opciones sugeridas debajo del saludo inicial -->
          <div v-if="messages.length <= 1 && !isLoading" class="initial-options-container">
            <button 
              v-for="(opt, optIdx) in initialOptions" 
              :key="'opt-' + optIdx"
              class="suggested-option-card"
              @click="handleSelectOption(opt)"
            >
              <div class="option-icon-box">
                <!-- Icono de cubo para productos -->
                <svg v-if="opt.type === 'products'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>

                <!-- Icono de diamante para rango -->
                <svg v-else-if="opt.type === 'rank'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z"></path>
                  <path d="M2 9h20"></path>
                  <path d="M12 21L8 9l4-6 4 6-4 12z"></path>
                </svg>

                <!-- Icono de mensaje / cohete para impulsar negocio -->
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span class="option-label">{{ opt.label }}</span>
            </button>
          </div>

          <!-- Indicador escribiendo... -->
          <div v-if="isLoading" class="message-item message-item--bot">
            <div class="bot-avatar-badge">
              <svg viewBox="410 185 230 430" fill="currentColor" class="avatar-sifrah-icon">
                <path d="M480.19,445.26c-5,9.42-12.65,14.13-22.12,16.4-1.57.38-3.19.54-4.79.79-16.39,2.52-28.4-9.56-25.8-26,2.56-16.24,13-25.81,27.41-31.8,7.83-3.25,16.09-4.78,24.48-5.67,28.23-3,51.38-15.07,67.15-39.08,10-15.21,15-32.45,17.32-50.49A186.92,186.92,0,0,0,565,288.09c0-1.5-.67-3.24,1.08-4.61,2.05,1.27,2.1,3.5,2.57,5.42a347.8,347.8,0,0,1,9.73,103.41c-2.45,41.44-12.84,80.75-35.47,116-18.4,28.69-43.1,50.91-72.6,67.88a208.65,208.65,0,0,1-22.39,11.56c-2.31,1-4.7,1.75-7.06,2.62l-.6-1c3.88-3.23,7.68-6.55,11.63-9.67,26.75-21.17,48.78-46.21,62.73-77.63,7-15.82,11.11-32,3.31-49.15-9.47-20.77-27.27-30.28-48.89-27.29-6.86.95-13.67,2.46-19.36,7-4.89,3.93-7.1,9.37-5.29,13.91,1.95,4.86,8.11,8,14.14,7.08a40,40,0,0,0,16.05-6.51C475.93,446.22,477.13,444.63,480.19,445.26Z"/>
                <path d="M599.07,274.45c4.54,7.94,5.42,16.82,7.17,25.41a304.14,304.14,0,0,1,6,66.46c-.7,37-6.82,73-22.51,106.85-18.73,40.4-48,71.15-86.71,93a229.64,229.64,0,0,1-25.14,12.49,4.93,4.93,0,0,1-4.15.48c4-2.49,7.31-4.63,10.69-6.63,35.93-21.22,62.37-51.2,81.71-87.89,20-37.91,29.87-78.68,34.32-120.92a348,348,0,0,0-1.38-87.42A12.69,12.69,0,0,1,599.07,274.45Z"/>
                <path d="M506.1,372.88c-14.81.85-26-10.92-26.31-25.16-.34-14.92,11.28-26.33,26.28-26.5,13.79-.15,26,12.42,25.69,26.76C531.48,361.52,519.47,374,506.1,372.88Z"/>
                <path d="M533.69,228.15c7.68-3,15.36-2,20.78-7.49s5.15-12.89,7.35-20.66c4.17,7.11,2.58,15.16,8.38,20.61s13.26,4.37,20.44,7.63c-7.13,3.5-15.1,2.46-20.59,7.83s-4.31,13.52-7.79,20.73c-3.26-7.19-2.14-14.84-7.67-20.36S541.38,231.83,533.69,228.15Z"/>
                <path d="M610.6,252.08c-6,1.72-10.3,4.08-11,10.32-.06.5-.75.93-1.14,1.39-.45-.39-1.25-.73-1.3-1.17-.74-6.34-4.85-9.06-11.18-10.32,6.77-1.69,10.92-5.52,12.12-12.82C599.78,246.41,603.32,250.86,610.6,252.08Z"/>
              </svg>
            </div>
            <div class="message-bubble bubble--bot typing-bubble">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </main>

        <!-- Barra inferior para escribir y enviar -->
        <footer class="chat-input-bar">
          <button 
            type="button" 
            class="input-action-btn plus-btn" 
            @click="handlePlusClick"
            aria-label="Más opciones"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <div class="input-field-wrap">
            <input 
              v-model="inputText"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Escribe tu mensaje..."
              :disabled="isLoading"
              maxlength="300"
              ref="chatInputField"
            />
          </div>

          <button 
            type="button" 
            class="input-send-btn" 
            :disabled="isLoading || !inputText.trim()"
            @click="sendMessage"
            aria-label="Enviar mensaje"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </footer>
      </div>
    </transition>
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
      isChatOpen: false,
      isGreetingOpen: false,
      isLoading: false,
      inputText: '',
      isMobile: false,
      touchStartX: 0,
      touchEndX: 0,
      greetingAutoCloseTimer: null,
      messages: [],
      initialOptions: [
        {
          type: 'products',
          label: 'Conocer más sobre los productos.'
        },
        {
          type: 'rank',
          label: '¿Cómo voy para mi próximo rango?'
        },
        {
          type: 'business',
          label: 'Ayúdame a impulsar mi negocio.'
        }
      ]
    };
  },
  computed: {
    userName() {
      // 1. Vuex store
      const storeName = this.$store ? this.$store.state.name : null;
      if (storeName && typeof storeName === 'string') {
        const first = storeName.trim().split(' ')[0];
        if (first) return this.capitalize(first);
      }

      // 2. LocalStorage name
      const localName = localStorage.getItem('name');
      if (localName) {
        const first = localName.trim().split(' ')[0];
        if (first) return this.capitalize(first);
      }

      // 3. Objeto user
      try {
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        const candidate = userObj.name || userObj.names || userObj.username;
        if (candidate) {
          const first = candidate.trim().split(' ')[0];
          if (first) return this.capitalize(first);
        }
      } catch (e) {}

      return 'Jesús';
    },
    userRank() {
      const storeRank = this.$store ? (this.$store.state.historicalRankLabel || this.$store.state.rank) : null;
      if (storeRank) return storeRank;
      return localStorage.getItem('rank') || 'Activo';
    },
    isAuthRoute() {
      const path = (this.$route && this.$route.path) ? this.$route.path : '';
      return (
        path === '/login' ||
        path.startsWith('/login/') ||
        path === '/register' ||
        path.startsWith('/register/') ||
        path === '/welcome' ||
        path === '/sudo-login' ||
        path === '/remember' ||
        path === '/reset-password'
      );
    },
    shouldShow() {
      // Requisito estricto: Solo en la versión móvil y dentro de la aplicación
      return this.isMobile && !this.isAuthRoute;
    }
  },
  watch: {
    '$route.path'() {
      // Cerrar paneles en cambio de ruta
      this.isGreetingOpen = false;
      this.isChatOpen = false;
    }
  },
  created() {
    this.checkMobileViewport();
    window.addEventListener('resize', this.checkMobileViewport);
    this.setupInitialGreeting();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobileViewport);
    this.clearGreetingTimer();
  },
  methods: {
    checkMobileViewport() {
      this.isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    },
    capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    setupInitialGreeting() {
      this.messages = [
        {
          sender: 'bot',
          text: `Hola, ${this.userName} 👋\nTe saluda SIFRAH.\n¿En qué puedo ayudarte hoy?`,
          products: [],
          time: this.getCurrentTime()
        }
      ];
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    openGreeting() {
      this.isGreetingOpen = true;
      this.startGreetingTimer();
    },
    closeGreeting() {
      this.isGreetingOpen = false;
      this.clearGreetingTimer();
    },
    startGreetingTimer() {
      this.clearGreetingTimer();
      // Auto-colapsar suavemente tras 8 segundos sin interacción
      this.greetingAutoCloseTimer = setTimeout(() => {
        this.isGreetingOpen = false;
      }, 8000);
    },
    clearGreetingTimer() {
      if (this.greetingAutoCloseTimer) {
        clearTimeout(this.greetingAutoCloseTimer);
        this.greetingAutoCloseTimer = null;
      }
    },
    openChat() {
      this.clearGreetingTimer();
      this.isGreetingOpen = false;
      this.isChatOpen = true;
      this.$nextTick(() => {
        this.scrollToBottom();
        if (this.$refs.chatInputField) {
          this.$refs.chatInputField.focus();
        }
      });
    },
    closeChat() {
      this.isChatOpen = false;
      this.isGreetingOpen = false;
    },

    // Gestos de deslizamiento en pestaña (Swipe hacia la izquierda despliega el saludo)
    onTabTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
    },
    onTabTouchMove(e) {
      this.touchEndX = e.touches[0].clientX;
    },
    onTabTouchEnd() {
      if (this.touchStartX - this.touchEndX > 20) {
        this.openGreeting();
      }
    },

    // Gestos de deslizamiento en saludo (Swipe hacia la derecha colapsa la pestaña)
    onGreetingTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
    },
    onGreetingTouchMove(e) {
      this.touchEndX = e.touches[0].clientX;
    },
    onGreetingTouchEnd() {
      if (this.touchEndX - this.touchStartX > 25) {
        this.closeGreeting();
      }
    },

    scrollToBottom() {
      const scrollEl = this.$refs.messagesScroll;
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    },
    formatMessage(text) {
      if (!text) return '';
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
    },

    toggleHistoryPrompt() {
      // Función del botón reloj en el encabezado
      this.messages.push({
        sender: 'bot',
        text: `📅 Tu historial de conversación con SIFRAH se mantiene sincronizado durante tu sesión activa. Si deseas reiniciar la conversación, simplemente avísame.`,
        products: [],
        time: this.getCurrentTime()
      });
      this.$nextTick(this.scrollToBottom);
    },

    handlePlusClick() {
      // Mostrar opciones adicionales o menú rápido
      this.messages.push({
        sender: 'bot',
        text: `💡 **Atajos rápidos de Sifrah:**\n\n` +
          `• **Tienda:** Consulta productos y combos.\n` +
          `• **Plan de Rangos:** Revisa puntos y líneas activas.\n` +
          `• **Universidad:** Descarga materiales de estudio.\n\n` +
          `Escribe cualquier duda o dolencia y te asesoraré al instante.`,
        products: [],
        time: this.getCurrentTime()
      });
      this.$nextTick(this.scrollToBottom);
    },

    handleSelectOption(option) {
      if (this.isLoading) return;

      if (option.type === 'products') {
        this.messages.push({
          sender: 'user',
          text: 'Conocer más sobre los productos',
          products: [],
          time: this.getCurrentTime()
        });
        this.isLoading = true;
        this.$nextTick(this.scrollToBottom);

        setTimeout(() => {
          this.isLoading = false;
          this.messages.push({
            sender: 'bot',
            text: `🌿 ¡Excelente, ${this.userName}! En Sifrah contamos con suplementos nutricionales y productos de bienestar de la más alta calidad formulados para potenciar tu salud y generar puntos para tu negocio:\n\n` +
              `• **Colágeno Hidrolizado (Rejuvenece):** Regenera articulaciones, cartílagos, piel y cabello.\n` +
              `• **Salud Digestiva (Regenera T):** Alivio natural para gastritis, reflujo y acidez estomacal.\n` +
              `• **Línea Antioxidante y Energía:** Fórmulas para vitalidad celular y desintoxicación.\n\n` +
              `¿Te gustaría consultar por alguna molestia o dolencia específica (rodillas, digestión, cansancio) para recomendarte el producto ideal?`,
            products: [],
            time: this.getCurrentTime()
          });
          this.$nextTick(this.scrollToBottom);
        }, 600);

      } else if (option.type === 'rank') {
        this.messages.push({
          sender: 'user',
          text: 'Quiero revisar mi avance de rango',
          products: [],
          time: this.getCurrentTime()
        });
        this.isLoading = true;
        this.$nextTick(this.scrollToBottom);

        setTimeout(() => {
          this.isLoading = false;
          const currentRank = this.userRank || 'Activo';
          this.messages.push({
            sender: 'bot',
            text: `Claro, ${this.userName}. Revisemos tu avance y lo que te falta para tu próximo rango.\n\n` +
              `💎 **Tu Rango:** ${currentRank}\n` +
              `🎯 **Objetivo inmediato:** Calificar y maximizar el cierre mensual.\n\n` +
              `📋 **Requisitos clave que debes cuidar:**\n` +
              `• **Reconsumo personal:** Mínimo 120 pts (o 160 pts desde rango Plata).\n` +
              `• **Líneas activas:** Mantén tus directos con compras activas para abrir los niveles de comisión.\n` +
              `• **Puntos de equipo:** Duplica las activaciones en tu organización.\n\n` +
              `¡Estás en un momento ideal para consolidar tu crecimiento! ¿Deseas que revisemos alguna línea en específico de tu red?`,
            products: [],
            time: this.getCurrentTime()
          });
          this.$nextTick(this.scrollToBottom);
        }, 600);

      } else if (option.type === 'business') {
        this.messages.push({
          sender: 'user',
          text: 'Ayúdame a impulsar mi negocio',
          products: [],
          time: this.getCurrentTime()
        });
        this.isLoading = true;
        this.$nextTick(this.scrollToBottom);

        setTimeout(() => {
          this.isLoading = false;
          this.messages.push({
            sender: 'bot',
            text: `🚀 ¡Con todo gusto, ${this.userName}! Aquí tienes 3 estrategias clave para multiplicar tus resultados en Sifrah:\n\n` +
              `🛍️ **1. Comparte tu Tienda Virtual:**\n` +
              `Tienes un enlace exclusivo para venta directa. Tus clientes compran y los puntos se acreditan a tu código.\n\n` +
              `👥 **2. Enfoque en Frontales Activos:**\n` +
              `Para dar el salto a Bronce o Plata, acompaña a 2 a 3 socios a lograr sus primeras activaciones.\n\n` +
              `📚 **3. Duplicación y Educación:**\n` +
              `Capacítate en **Universidad Sifrah** y comparte los flyers oficiales generados desde Herramientas.\n\n` +
              `¿Te gustaría que te preparemos un mensaje de prospección para tus contactos?`,
            products: [],
            time: this.getCurrentTime()
          });
          this.$nextTick(this.scrollToBottom);
        }, 600);
      }
    },

    async sendMessage() {
      const query = this.inputText.trim();
      if (!query || this.isLoading) return;

      // Mensaje del usuario (burbuja fucsia a la derecha con ✓✓)
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
        let code = this.distributorCode;
        if (!code) {
          try {
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');
            code = userObj.code || userObj.username || localStorage.getItem('distributor_code') || '';
          } catch (e) {}
        }

        const history = this.messages
          .filter(m => m.text && !m.isEmergency)
          .slice(-6)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }));

        let apiUrl = (process.env.VUE_APP_SERVER ? process.env.VUE_APP_SERVER : 'https://api.serve-sifrah.xyz') + '/api/app/assistant';

        let response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              query,
              distributorCode: code,
              history
            })
          });
        } catch (fetchErr) {
          // Reintentar con ruta relativa local si falló CORS o conexión
          response = await fetch('/api/app/assistant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              query,
              distributorCode: code,
              history
            })
          });
        }

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
            text: 'Ocurrió un problema temporal al procesar tu consulta. Por favor intenta nuevamente.',
            products: [],
            time: this.getCurrentTime()
          });
        }
      } catch (err) {
        // Fallback local elegante si no hay conexión al backend
        this.handleLocalFallback(query);
      } finally {
        this.isLoading = false;
        this.$nextTick(this.scrollToBottom);
      }
    },

    handleLocalFallback(query) {
      const q = query.toLowerCase();
      let replyText = '';

      if (q.includes('rango') || q.includes('puntos') || q.includes('calificar')) {
        replyText = `Claro, ${this.userName}. Para calificar a tu próximo rango, asegúrate de cumplir con tu reconsumo mínimo (120 o 160 pts) y tus líneas activas de este ciclo.`;
      } else if (q.includes('negocio') || q.includes('impulsar') || q.includes('afiliar')) {
        replyText = `¡Excelente iniciativa, ${this.userName}! Recuerda compartir tu enlace de Tienda Virtual y apoyar a tus directos en sus activaciones mensuales.`;
      } else {
        replyText = `Entiendo tu consulta sobre "${query}". En Sifrah promovemos el bienestar integral y una nutrición balanceada. Si deseas una recomendación de suplementos, cuéntame más sobre tus objetivos o molestias.`;
      }

      this.messages.push({
        sender: 'bot',
        text: replyText,
        products: [],
        time: this.getCurrentTime()
      });
    }
  }
};
</script>

<style scoped>
/* Contenedor general */
.sifrah-assistant-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

/* 1. PANEL 01: PESTAÑA FLOTANTE DISCRETA ("Siempre a mano") */
.floating-tab {
  position: fixed;
  right: 0;
  bottom: 110px;
  width: 44px;
  height: 56px;
  background: #ffffff;
  border: 1.5px solid #ffccd9;
  border-right: none;
  border-radius: 20px 0 0 20px;
  box-shadow: -3px 6px 18px rgba(233, 30, 99, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9990;
  cursor: pointer;
  touch-action: pan-y;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.floating-tab:active {
  transform: scale(0.96) translateX(-3px);
}

.tab-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 3px;
}

.tab-sifrah-logo {
  width: 25px;
  height: 25px;
  color: #e91e63;
  display: block;
}

/* 2. PANEL 02: SALUDO BREVE HORIZONTAL ("Un saludo para ti") */
.greeting-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  z-index: 9991;
  backdrop-filter: blur(1px);
}

.greeting-panel {
  position: fixed;
  right: 12px;
  bottom: 110px;
  height: 52px;
  background: #ffffff;
  border: 1.5px solid #ffccd9;
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(233, 30, 99, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 8px 6px 16px;
  z-index: 9992;
  cursor: pointer;
  touch-action: pan-y;
  max-width: calc(100vw - 24px);
}

.greeting-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.greeting-sifrah-logo {
  width: 24px;
  height: 24px;
  color: #e91e63;
  flex-shrink: 0;
}

.greeting-text {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.greeting-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e91e63;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(233, 30, 99, 0.35);
  transition: transform 0.2s ease;
}

.greeting-panel:active .greeting-action-btn {
  transform: scale(0.92);
}

/* 3. PANEL 03: CHAT A PANTALLA COMPLETA ("Conversa con SIFRAH") */
.chat-fullscreen-modal {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #f8f9fa;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.chat-header {
  background: #ffffff;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.chat-header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-header-sifrah-logo {
  width: 28px;
  height: 28px;
  color: #e91e63;
}

.brand-text-col {
  display: flex;
  flex-direction: column;
}

.brand-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  letter-spacing: -0.2px;
}

.brand-subtitle {
  margin: 2px 0 0 0;
  font-size: 11.5px;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.15;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-action-btn {
  background: transparent;
  border: none;
  color: #374151;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.header-action-btn:active {
  background: #f3f4f6;
}

/* Área de conversación con scroll */
.chat-messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f8f9fa;
  -webkit-overflow-scrolling: touch;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 100%;
}

.message-item--bot {
  justify-content: flex-start;
  align-items: flex-start;
}

.message-item--user {
  justify-content: flex-end;
  align-items: flex-end;
}

.bot-avatar-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #ffccd9;
  box-shadow: 0 2px 6px rgba(233, 30, 99, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-sifrah-icon {
  width: 20px;
  height: 20px;
  color: #e91e63;
}

.message-bubble-wrapper {
  max-width: 82%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 12px 16px;
  font-size: 13.5px;
  line-height: 1.48;
  word-break: break-word;
}

/* Burbuja del asistente: fondo blanco, borde y texto oscuro */
.bubble--bot {
  background: #ffffff;
  color: #1f2937;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Burbuja del usuario: fucsia con texto blanco */
.bubble--user {
  background: #e91e63;
  color: #ffffff;
  border-radius: 18px 18px 4px 18px;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.25);
}

.bubble--emergency {
  background: #fef2f2 !important;
  color: #991b1b !important;
  border: 1px solid #f87171 !important;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

.meta--bot {
  justify-content: flex-start;
  padding-left: 4px;
}

.meta--user {
  justify-content: flex-end;
  padding-right: 4px;
}

.read-receipt {
  font-size: 10px;
  color: #0284c7;
  font-weight: bold;
}

/* 3 Tarjetas de opciones sugeridas */
.initial-options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
  padding-left: 40px; /* Alineado con la burbuja del bot */
}

.suggested-option-card {
  background: #fff0f5;
  border: 1px solid #ffccd9;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(233, 30, 99, 0.05);
}

.suggested-option-card:active {
  background: #ffe4ed;
  transform: scale(0.98);
}

.option-icon-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e91e63;
  flex-shrink: 0;
}

.option-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 1.35;
}

/* Indicador de escritura animado */
.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 12px 18px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typingBounce 1.2s infinite both;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1.15); }
}

/* Tarjetas de recomendación de productos */
.recommended-products-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-mini-card {
  background: #fff5f8;
  border: 1px solid #fbcfe8;
  border-radius: 12px;
  padding: 10px 12px;
}

.prod-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #be185d;
  letter-spacing: 0.5px;
}

.prod-title {
  margin: 3px 0 2px 0;
  font-size: 13px;
  color: #831843;
  font-weight: 700;
}

.prod-benefit {
  margin: 0;
  font-size: 11px;
  color: #4b5563;
  line-height: 1.35;
}

.prod-footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prod-price {
  font-size: 12px;
  font-weight: 700;
  color: #e91e63;
}

.prod-buy-btn {
  background: #e91e63;
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
}

/* Barra inferior de entrada */
.chat-input-bar {
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 10px 14px;
  padding-bottom: max(10px, env(safe-area-inset-bottom, 10px));
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.input-action-btn.plus-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.input-action-btn.plus-btn:active {
  background: #e5e7eb;
}

.input-field-wrap {
  flex: 1;
}

.input-field-wrap input {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  background: #f3f4f6;
  border-radius: 20px;
  border: 1px solid transparent;
  padding: 0 16px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

.input-field-wrap input:focus {
  background: #ffffff;
  border-color: #ffccd9;
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.08);
}

.input-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e91e63;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
  transition: transform 0.15s ease, background 0.2s ease;
}

.input-send-btn:active {
  transform: scale(0.92);
}

.input-send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

/* Transiciones */
.slide-tab-enter-active, .slide-tab-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-tab-enter, .slide-tab-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-greeting-enter-active, .slide-greeting-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
}
.slide-greeting-enter, .slide-greeting-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

.chat-modal-enter-active, .chat-modal-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.chat-modal-enter, .chat-modal-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* REGLA CRÍTICA: SOLO EN DISPOSITIVOS MÓVILES */
@media (min-width: 769px) {
  .sifrah-assistant-wrapper {
    display: none !important;
  }
}
</style>
