<template>
  <component :is="layoutTag" v-bind="layoutProps">
    <div class="boleta-view-page" :class="{ 'boleta-view-page--embedded': useAppLayout }">
      <!-- Estado: Cargando -->
      <div v-if="loading" class="boleta-state boleta-state--loading">
        <div class="boleta-spinner"></div>
        <p>Cargando comprobante...</p>
      </div>

      <!-- Estado: Error -->
      <div v-else-if="error" class="boleta-state boleta-state--error">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Error al cargar el comprobante</h2>
        <p>{{ error }}</p>
        <button @click="loadBoleta" class="boleta-retry-btn">
          <i class="fas fa-redo"></i> Reintentar
        </button>
      </div>

      <!-- Boleta cargada -->
      <div v-else-if="orderData" class="boleta-view-content">
        <BoletaDigital
          :order-data="orderData"
          :client-data="clientData"
          :products="products"
          :social-links="socialLinks"
          :show-actions="true"
        />
      </div>
    </div>
  </component>
</template>

<script>
import App from '@/views/layouts/App.vue'
import BoletaDigital from '@/components/BoletaDigital.vue'
import api from '@/api'

export default {
  name: 'BoletaView',
  components: { App, BoletaDigital },
  data() {
    return {
      loading: true,
      error: null,
      orderData: null,
      clientData: null,
      products: [],
      socialLinks: {
        facebook:  this.$store.state.fb  || 'https://www.facebook.com',
        instagram: this.$store.state.is  || 'https://www.instagram.com',
        whatsapp:  this.$store.state.wsp_pe || 'https://wa.me/'
      }
    }
  },
  computed: {
    queryId()           { return this.$route.query.id },
    queryType()         { return this.$route.query.type || 'activation' },
    queryAdminSession() { return this.$route.query.admin_session || null },
    session() {
      return this.$store.state.session
    },
    useAppLayout() {
      if (this.queryAdminSession) return false
      return Boolean(this.session || (typeof localStorage !== 'undefined' && localStorage.getItem('session')))
    },
    layoutTag() {
      return this.useAppLayout ? 'App' : 'div'
    },
    layoutProps() {
      if (!this.useAppLayout) return {}
      return {
        session: this.session,
        title: 'Comprobante'
      }
    }
  },
  async mounted() {
    await this.loadBoleta()
  },
  methods: {
    async loadBoleta() {
      this.loading = true
      this.error   = null

      if (!this.queryId) {
        this.error   = 'No se especificó el ID del comprobante.'
        this.loading = false
        return
      }

      try {
        const session = this.$store.state.session || localStorage.getItem('session')
        const { data } = await api.getBoleta({
          session:       this.queryAdminSession ? null : session,
          admin_session: this.queryAdminSession,
          id:            this.queryId,
          type:          this.queryType
        })

        if (data.error) {
          this.error = data.msg || 'Error al obtener el comprobante.'
          return
        }

        this.orderData  = data.orderData
        this.clientData = data.clientData
        this.products   = data.products || []
      } catch (e) {
        console.error('BoletaView error:', e)
        this.error = 'Error de conexión. Por favor intenta nuevamente.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.boleta-view-page {
  min-height: 100vh;
  background: #f0f0f0;
}

.boleta-view-page--embedded {
  min-height: auto;
  padding: 8px 0 32px;
  background: #f5f5f7;
}

.boleta-view-page--embedded >>> .boleta-wrapper {
  background: transparent;
  min-height: auto;
  padding-top: 0;
}

.boleta-view-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* ── Estados ── */
.boleta-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.boleta-view-page:not(.boleta-view-page--embedded) .boleta-state {
  min-height: 100vh;
}

.boleta-state--loading {
  color: #e91e63;
}

.boleta-spinner {
  width: 56px;
  height: 56px;
  border: 5px solid #f9d8f5;
  border-top-color: #e91e63;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.boleta-state--error {
  color: #c0392b;
  text-align: center;
  padding: 40px;
}

.boleta-state--error i {
  font-size: 48px;
  margin-bottom: 12px;
}

.boleta-state--error h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.boleta-state--error p {
  font-size: 16px;
  color: #666;
  max-width: 400px;
}

.boleta-retry-btn {
  margin-top: 16px;
  padding: 12px 28px;
  background: #e91e63;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.boleta-retry-btn:hover {
  background: #cf1658;
}
</style>
