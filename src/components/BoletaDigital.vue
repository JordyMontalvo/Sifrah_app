<template>
  <div class="boleta-wrapper">
    <!-- Botones de acción -->
    <div class="boleta-actions" v-if="showActions">
      <button class="boleta-btn boleta-btn--pdf" @click="downloadPDF" :disabled="generating">
        <i class="fas" :class="generating ? 'fa-spinner fa-spin' : 'fa-file-pdf'"></i>
        {{ generating ? 'Generando...' : 'Descargar PDF' }}
      </button>
      <button class="boleta-btn boleta-btn--whatsapp" @click="shareWhatsApp" :disabled="generating">
        <i class="fas" :class="generating ? 'fa-spinner fa-spin' : 'fab fa-whatsapp'"></i>
        {{ generating ? 'Preparando PDF...' : 'Compartir WhatsApp' }}
      </button>
    </div>

    <!-- Contenedor de la boleta (diseño 1080px, escala al ancho disponible) -->
    <div class="boleta-scale-wrapper" ref="scaleWrap" :style="scaleWrapStyle">
      <div class="boleta-card" ref="boletaCard" id="boleta-digital-card" :style="cardStyle">

        <!-- Cabecera -->
        <div class="boleta-header">
          <div class="boleta-logo">
            <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#e91e63"/>
              <path d="M24.2028 0.240206C23.9626 1.43345 23.73 1.94377 23.3022 2.22144C23.1746 2.304 22.8294 2.43908 22.5442 2.50662C21.5536 2.76178 21.3885 2.80681 21.3885 2.85934C21.3885 2.92689 21.7112 3.04696 22.4016 3.23458C23.4823 3.51976 23.745 3.78992 24.0527 4.99818C24.2403 5.70362 24.3378 5.92876 24.4279 5.84621C24.4504 5.8237 24.563 5.43345 24.6756 4.97567C24.9908 3.72989 25.2084 3.50475 26.3416 3.21957C27.0921 3.03946 27.3172 2.9494 27.3172 2.85934C27.3172 2.7843 26.7318 2.58917 26.3041 2.52163C25.5161 2.40906 24.9908 1.96628 24.8031 1.28336C24.4804 0.067598 24.3003 -0.240094 24.2028 0.240206Z" fill="white"/>
              <path d="M27.9476 4.16516C27.8275 4.64546 27.4523 5.05822 27.002 5.19331C26.6493 5.29837 26.6418 5.37342 26.9645 5.43346C27.3322 5.501 27.7525 5.88374 27.8425 6.23646C27.9026 6.44659 27.9626 6.52914 28.0677 6.52914C28.1727 6.52914 28.2328 6.44659 28.2928 6.23646C28.3829 5.89875 28.7881 5.51601 29.1333 5.44096C29.426 5.37342 29.396 5.29837 29.0433 5.1783C28.6906 5.05822 28.4504 4.81807 28.1953 4.31526L28.0076 3.94002L27.9476 4.16516Z" fill="white"/>
              <path d="M28.0677 7.70738C28.0677 7.78242 28.0977 8.04509 28.1352 8.29274C28.3604 9.76366 28.4729 11.9175 28.4129 13.8087C28.3904 14.6942 28.3529 15.5198 28.3378 15.6473C28.3228 15.7674 28.2853 16.1051 28.2628 16.3978C27.9476 19.8124 27.0621 23.6398 25.9514 26.4166C23.8275 31.6924 20.6906 35.5123 16.3078 38.1614C15.715 38.5216 15.2347 38.8443 15.2347 38.8894C15.2347 38.9419 15.3322 38.9494 15.4973 38.9269C15.82 38.8744 17.336 38.2064 17.336 38.1164C17.336 38.0789 17.3585 38.0563 17.396 38.0638C17.426 38.0714 17.5311 38.0338 17.6362 37.9738C17.9138 37.8162 18.3266 37.5835 18.7168 37.3809C18.9045 37.2759 19.0621 37.1708 19.0621 37.1333C19.0621 37.1032 19.0996 37.0732 19.1521 37.0732C19.2196 37.0732 19.9326 36.6305 20.3754 36.3078C20.9682 35.8725 22.4542 34.6417 22.8894 34.2139C26.169 31.0019 28.2853 26.8068 29.1108 21.8687C29.5836 19.0545 29.6737 16.0226 29.3735 13.1558C29.2609 12.0301 28.8181 9.39593 28.6305 8.7055C28.4129 7.93252 28.0677 7.30963 28.0677 7.70738Z" fill="white"/>
              <path d="M24.6155 8.59292C24.563 8.65296 24.5405 8.78054 24.563 8.8706C24.638 9.14827 24.4729 11.2796 24.3078 12.1351C23.6024 15.895 21.4861 18.6117 18.4016 19.7374C17.6211 20.0226 17.0733 20.1426 15.7525 20.3378C14.4542 20.5254 13.9814 20.638 13.2384 20.9456C12.0752 21.4335 11.2647 22.1464 10.8444 23.062C10.5292 23.7524 10.4016 24.3753 10.4617 24.9381C10.6418 26.6792 12.1953 27.4072 14.229 26.7017C14.7769 26.5141 15.2647 26.1764 15.6249 25.7261C16.2253 24.9907 15.9851 24.8481 15.0771 25.4034C14.4467 25.7862 13.7037 26.0038 13.2909 25.9288C12.4129 25.7637 12.0302 25.0057 12.4804 24.3228C12.8932 23.7074 13.7637 23.3096 15.017 23.167C16.1953 23.032 17.336 23.3246 18.199 23.9775C19.2647 24.788 20.0677 26.259 20.1652 27.5873C20.2478 28.7055 19.9251 29.8912 19.0621 31.6323C17.7712 34.2515 15.9026 36.4879 12.9983 38.8744C12.3303 39.4297 11.8125 39.91 11.8425 39.94C11.9251 40.0226 12.6831 39.8575 12.6831 39.7599C12.6831 39.7149 12.7056 39.6999 12.7356 39.7224C12.7581 39.7524 12.8932 39.6999 13.0358 39.6173C13.1709 39.5348 13.2834 39.4822 13.2834 39.5123C13.2834 39.5348 13.4861 39.4522 13.7337 39.3171C13.9814 39.1895 14.184 39.047 14.184 39.0094C14.184 38.9719 14.214 38.9569 14.2515 38.9794C14.2891 39.0019 14.3566 38.9719 14.4091 38.9119C14.4617 38.8518 14.5292 38.8218 14.5667 38.8443C14.6043 38.8668 14.6343 38.8443 14.6343 38.8068C14.6343 38.7618 14.6793 38.7243 14.7318 38.7243C14.7769 38.7243 15.0771 38.5592 15.3923 38.364C15.6999 38.1689 16.1202 37.9062 16.3228 37.7862C16.5255 37.6586 16.7431 37.5085 16.8031 37.4485C16.8707 37.3884 17.0208 37.2909 17.1258 37.2308C17.2384 37.1708 17.426 37.0357 17.5386 36.9306C17.6512 36.8181 17.8838 36.638 18.0489 36.5179C18.5067 36.1877 18.7168 35.9925 19.7375 34.9719C23.0771 31.6248 25.1709 27.167 25.8463 21.9813C26.3641 18.0488 26.1315 13.6661 25.2009 9.64358C24.9382 8.49537 24.8407 8.32276 24.6155 8.59292Z" fill="white"/>
              <path d="M17.5536 12.5554C17.0133 12.7805 16.7281 12.9907 16.4354 13.3509C15.7375 14.244 15.6474 15.4672 16.2178 16.4879C16.4879 16.9607 16.8632 17.2984 17.411 17.5535C17.7712 17.7186 17.9213 17.7487 18.5742 17.7487C19.2272 17.7487 19.3772 17.7186 19.7375 17.5535C20.2628 17.3059 20.7281 16.8256 21.0283 16.2177C21.2384 15.8049 21.2684 15.6699 21.2684 15.1295C21.2684 14.6792 21.2234 14.4091 21.0958 14.0939C20.8857 13.5535 20.3303 12.9381 19.7975 12.6455C19.4523 12.4578 19.3097 12.4203 18.6868 12.4053C18.0714 12.3828 17.9138 12.4053 17.5536 12.5554Z" fill="white"/>
            </svg>
          </div>
          <h1 class="boleta-brand">SIFRAH</h1>
          <h2 class="boleta-title">COMPROBANTE DE COMPRA</h2>
          <p class="boleta-subtitle">No válido como comprobante fiscal</p>
        </div>

        <!-- Línea separadora superior -->
        <div class="boleta-divider boleta-divider--top"></div>

        <!-- Info de orden: 2 columnas -->
        <div class="boleta-info-grid">
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-calendar-alt"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Fecha</span>
              <span class="boleta-info-value">{{ formattedDate }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-file-alt"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Comprobante N°</span>
              <span class="boleta-info-value boleta-info-value--small">{{ orderData.id }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-clock"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Hora</span>
              <span class="boleta-info-value">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="boleta-info-item">
            <div class="boleta-info-icon">
              <i class="far fa-bookmark"></i>
            </div>
            <div class="boleta-info-content">
              <span class="boleta-info-label">Orden de compra</span>
              <span class="boleta-info-value">{{ orderData.orderNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Sección: Datos del Cliente -->
        <div class="boleta-section">
          <div class="boleta-section-header">
            <div class="boleta-section-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <h3 class="boleta-section-title">DATOS DEL CLIENTE</h3>
          </div>
          <div class="boleta-client-data">
            <div class="boleta-client-row">
              <span class="boleta-client-label">Nombre:</span>
              <span class="boleta-client-value">{{ clientData.fullName }}</span>
            </div>
            <div class="boleta-client-row">
              <span class="boleta-client-label">Código de empresario:</span>
              <span class="boleta-client-value">{{ clientData.code }}</span>
            </div>
            <div class="boleta-client-row">
              <span class="boleta-client-label">Sucursal:</span>
              <span class="boleta-client-value">{{ clientData.branch }}</span>
            </div>
          </div>
        </div>

        <!-- Sección: Detalle de Productos -->
        <div class="boleta-section">
          <div class="boleta-section-header">
            <div class="boleta-section-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h3 class="boleta-section-title">DETALLE DE PRODUCTOS</h3>
          </div>

          <!-- Tabla de productos -->
          <div class="boleta-table">
            <div class="boleta-table-header">
              <span class="boleta-col-product">Producto</span>
              <span class="boleta-col-qty">Cant.</span>
              <span class="boleta-col-price">P. Unit.</span>
              <span class="boleta-col-total">Total</span>
            </div>
            <div
              v-for="(item, idx) in products"
              :key="idx"
              class="boleta-table-row"
              :class="{ 'boleta-table-row--alt': idx % 2 !== 0 }"
            >
              <span class="boleta-col-product">{{ item.name }}</span>
              <span class="boleta-col-qty">{{ item.qty }}</span>
              <span class="boleta-col-price">S/ {{ formatAmount(item.unitPrice) }}</span>
              <span class="boleta-col-total">S/ {{ formatAmount(item.total) }}</span>
            </div>
          </div>

          <!-- Totales -->
          <div class="boleta-totals">
            <div class="boleta-total-row">
              <span class="boleta-total-label">Subtotal sin IGV:</span>
              <span class="boleta-total-value">S/ {{ formatAmount(subtotalSinIGV) }}</span>
            </div>
            <div class="boleta-total-row">
              <span class="boleta-total-label">IGV (18%):</span>
              <span class="boleta-total-value">S/ {{ formatAmount(igv) }}</span>
            </div>
          </div>
          <div class="boleta-grand-total">
            <span class="boleta-grand-label">TOTAL:</span>
            <span class="boleta-grand-value">S/ {{ formatAmount(orderData.total) }}</span>
          </div>
        </div>

        <!-- Sección: Método de pago -->
        <div class="boleta-payment">
          <div class="boleta-payment-left">
            <div class="boleta-payment-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div>
              <span class="boleta-payment-meta">MÉTODO DE PAGO</span>
              <span class="boleta-payment-method">{{ paymentMethodLabel }}</span>
            </div>
          </div>
          <div class="boleta-payment-right">
            <span class="boleta-payment-meta">TOTAL PAGADO</span>
            <span class="boleta-payment-amount">S/ {{ formatAmount(orderData.total) }}</span>
          </div>
        </div>

        <!-- Agradecimiento -->
        <div class="boleta-thanks">
          <div class="boleta-thanks-icon">
            <i class="fas fa-gift"></i>
          </div>
          <div class="boleta-thanks-text">
            <p class="boleta-thanks-main">¡Gracias por tu compra!</p>
            <p class="boleta-thanks-sub">Sueña sin límites.</p>
          </div>
        </div>

        <!-- Línea separadora inferior -->
        <div class="boleta-divider boleta-divider--bottom"></div>

        <!-- Pie: redes sociales -->
        <div class="boleta-footer">
          <a :href="socialLinks.facebook || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a :href="socialLinks.instagram || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-instagram"></i>
          </a>
          <a :href="socialLinks.whatsapp || '#'" target="_blank" class="boleta-social-link">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BoletaDigital',
  props: {
    // Datos de la orden
    orderData: {
      type: Object,
      required: true,
      // { id, orderNumber, date, total, payMethod, type: 'activation'|'affiliation' }
    },
    // Datos del cliente
    clientData: {
      type: Object,
      required: true,
      // { fullName, code, branch }
    },
    // Productos de la orden
    products: {
      type: Array,
      required: true,
      // [{ name, qty, unitPrice, total }]
    },
    // Links de redes sociales
    socialLinks: {
      type: Object,
      default: () => ({
        facebook: 'https://www.facebook.com',
        instagram: 'https://www.instagram.com',
        whatsapp: 'https://wa.me/'
      })
    },
    // Mostrar botones de acción
    showActions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      generating: false,
      scale: 0.5,
      scaledHeight: 0
    }
  },
  watch: {
    products: { handler() { this.scheduleScaleUpdate() }, deep: true },
    orderData: { handler() { this.scheduleScaleUpdate() }, deep: true }
  },
  mounted() {
    this.scheduleScaleUpdate()
    this._onResize = () => this.scheduleScaleUpdate()
    window.addEventListener('resize', this._onResize)
    this.$nextTick(() => {
      if (typeof ResizeObserver !== 'undefined' && this.$refs.scaleWrap) {
        this._resizeObserver = new ResizeObserver(() => this.scheduleScaleUpdate())
        this._resizeObserver.observe(this.$refs.scaleWrap)
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
    if (this._resizeObserver) this._resizeObserver.disconnect()
    if (this._scaleTimer) clearTimeout(this._scaleTimer)
  },
  computed: {
    cardStyle() {
      return {
        transform: `scale(${this.scale})`
      }
    },
    scaleWrapStyle() {
      if (!this.scaledHeight) return {}
      return { height: `${this.scaledHeight}px` }
    },
    subtotalSinIGV() {
      const total = parseFloat(this.orderData.total) || 0
      return total / 1.18
    },
    igv() {
      const total = parseFloat(this.orderData.total) || 0
      return total - (total / 1.18)
    },
    formattedDate() {
      if (!this.orderData.date) return ''
      const d = new Date(this.orderData.date)
      if (isNaN(d.getTime())) return this.orderData.date
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    },
    formattedTime() {
      if (!this.orderData.date) return ''
      const d = new Date(this.orderData.date)
      if (isNaN(d.getTime())) return ''
      let h = d.getHours()
      const m = String(d.getMinutes()).padStart(2, '0')
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      return `${h}:${m} ${ampm}`
    },
    paymentMethodLabel() {
      const map = {
        bank: 'Transferencia Bancaria',
        cash: 'Efectivo',
        balance: 'Saldo Disponible'
      }
      return map[this.orderData.payMethod] || this.orderData.payMethod || 'Efectivo'
    }
  },
  methods: {
    scheduleScaleUpdate() {
      this.$nextTick(() => {
        if (this._scaleTimer) clearTimeout(this._scaleTimer)
        this._scaleTimer = setTimeout(() => this.updateScale(), 50)
      })
    },

    updateScale() {
      const wrap = this.$refs.scaleWrap
      const card = this.$refs.boletaCard
      if (!wrap || !card) return

      const available = wrap.clientWidth || 540
      const scale = Math.min(available / 1080, 1)
      this.scale = scale
      this.scaledHeight = card.offsetHeight * scale
    },

    formatAmount(val) {
      const n = parseFloat(val) || 0
      return n.toFixed(2)
    },

    getPdfFileName() {
      return `boleta-sifrah-${this.orderData.id || 'compra'}.pdf`
    },

    async renderBoletaCanvas() {
      const html2canvas = (await import('html2canvas')).default
      const el = this.$refs.boletaCard
      const scaleWrap = this.$refs.scaleWrap
      const prevTransform = el.style.transform
      const prevParentHeight = scaleWrap ? scaleWrap.style.height : undefined

      el.style.transform = 'none'
      if (scaleWrap) scaleWrap.style.height = 'auto'

      try {
        return await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 1080,
          scrollX: 0,
          scrollY: 0
        })
      } finally {
        el.style.transform = prevTransform
        if (scaleWrap && prevParentHeight !== undefined) {
          scaleWrap.style.height = prevParentHeight
        }
        this.scheduleScaleUpdate()
      }
    },

    async buildPDFBlob() {
      const jsPDF = (await import('jspdf')).default
      const canvas = await this.renderBoletaCanvas()
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1080, canvas.height / 2]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, 1080, canvas.height / 2)
      return pdf.output('blob')
    },

    savePDFBlob(blob, fileName) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    async downloadPDF() {
      this.generating = true
      try {
        const blob = await this.buildPDFBlob()
        this.savePDFBlob(blob, this.getPdfFileName())
      } catch (e) {
        console.error('Error al generar PDF:', e)
        alert('Error al generar el PDF. Por favor intenta nuevamente.')
      } finally {
        this.generating = false
      }
    },

    async shareWhatsApp() {
      this.generating = true
      try {
        const fileName = this.getPdfFileName()
        const blob = await this.buildPDFBlob()
        const file = new File([blob], fileName, { type: 'application/pdf' })
        const shareData = {
          files: [file],
          title: 'Comprobante SIFRAH',
          text: `Comprobante de compra SIFRAH N° ${this.orderData.id}`
        }

        if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
          await navigator.share(shareData)
          return
        }

        this.savePDFBlob(blob, fileName)
        const msg = encodeURIComponent(
          `Comprobante de compra SIFRAH\n` +
          `N°: ${this.orderData.id}\n` +
          `Total: S/ ${this.formatAmount(this.orderData.total)}\n\n` +
          `Se descargo el PDF. Abre WhatsApp y adjunta el archivo desde Descargas.`
        )
        window.open(`https://wa.me/?text=${msg}`, '_blank')
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error al compartir PDF:', e)
          alert('No se pudo compartir el PDF. Usa "Descargar PDF" y adjuntalo manualmente en WhatsApp.')
        }
      } finally {
        this.generating = false
      }
    }
  }
}
</script>

<style scoped>
/* ===== WRAPPER Y ESCALA ===== */
.boleta-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background: #f0f0f0;
  min-height: 100%;
}

.boleta-scale-wrapper {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

/* ===== BOTONES DE ACCIÓN ===== */
.boleta-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.boleta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.boleta-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.boleta-btn--pdf {
  background: #e91e63;
  color: white;
  box-shadow: 0 4px 14px rgba(210, 9, 182, 0.35);
}

.boleta-btn--pdf:hover:not(:disabled) {
  background: #cf1658;
  transform: translateY(-2px);
}

.boleta-btn--whatsapp {
  background: #25D366;
  color: white;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
}

.boleta-btn--whatsapp:hover {
  background: #1DA851;
  transform: translateY(-2px);
}

/* ===== TARJETA BOLETA ===== */
.boleta-card {
  width: 1080px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  overflow: hidden;
  transform-origin: top left;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
}

/* ===== CABECERA ===== */
.boleta-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px 60px 50px;
  background: #ffffff;
}

.boleta-logo {
  margin-bottom: 16px;
}

.boleta-brand {
  font-size: 52px;
  font-weight: 800;
  letter-spacing: 10px;
  color: #e91e63;
  margin: 0 0 20px;
}

.boleta-title {
  font-size: 36px;
  font-weight: 700;
  color: #e91e63;
  margin: 0 0 10px;
  text-align: center;
}

.boleta-subtitle {
  font-size: 26px;
  color: #888;
  margin: 0;
}

/* ===== DIVISORES ===== */
.boleta-divider {
  height: 6px;
  background: linear-gradient(90deg, #e91e63, #ff7bf2, #e91e63);
  margin: 0;
}

.boleta-divider--top {
  margin-bottom: 0;
}

.boleta-divider--bottom {
  margin-top: 0;
}

/* ===== GRID INFO ===== */
.boleta-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 40px 60px;
  border-bottom: 2px solid #fbf0fa;
}

.boleta-info-item {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  margin: 6px;
  background: #fafafa;
}

.boleta-info-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fbf0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #e91e63;
  flex-shrink: 0;
}

.boleta-info-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boleta-info-label {
  font-size: 22px;
  color: #888;
  font-weight: 500;
}

.boleta-info-value {
  font-size: 26px;
  color: #2d2d2d;
  font-weight: 700;
}

.boleta-info-value--small {
  font-size: 20px;
  word-break: break-all;
}

/* ===== SECCIONES ===== */
.boleta-section {
  margin: 0;
  padding: 0 60px 40px;
}

.boleta-section-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 36px 0 24px;
}

.boleta-section-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.boleta-section-title {
  font-size: 32px;
  font-weight: 800;
  color: #e91e63;
  margin: 0;
  letter-spacing: 2px;
}

/* ===== DATOS CLIENTE ===== */
.boleta-client-data {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.boleta-client-row {
  display: flex;
  gap: 20px;
  font-size: 26px;
  padding: 4px 0;
}

.boleta-client-label {
  font-weight: 700;
  color: #2d2d2d;
  min-width: 300px;
  flex-shrink: 0;
}

.boleta-client-value {
  color: #444;
  font-weight: 400;
}

/* ===== TABLA DE PRODUCTOS ===== */
.boleta-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0;
}

.boleta-table-header {
  display: grid;
  grid-template-columns: 1fr 140px 200px 200px;
  background: #e91e63;
  color: white;
  font-size: 26px;
  font-weight: 700;
  padding: 22px 28px;
  gap: 10px;
}

.boleta-table-row {
  display: grid;
  grid-template-columns: 1fr 140px 200px 200px;
  font-size: 25px;
  padding: 20px 28px;
  gap: 10px;
  border-bottom: 1px solid #fbf0fa;
  background: #ffffff;
  transition: background 0.2s;
}

.boleta-table-row--alt {
  background: #fdf8fd;
}

.boleta-col-product { text-align: left; }
.boleta-col-qty     { text-align: center; }
.boleta-col-price   { text-align: right; }
.boleta-col-total   { text-align: right; font-weight: 600; }

/* ===== TOTALES ===== */
.boleta-totals {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px 28px 10px;
  border-top: 2px solid #fbf0fa;
}

.boleta-total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  font-size: 26px;
  color: #555;
}

.boleta-total-label {
  min-width: 280px;
  text-align: right;
}

.boleta-total-value {
  min-width: 160px;
  text-align: right;
}

.boleta-grand-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 40px;
  padding: 24px 28px 30px;
  border-top: 3px solid #e91e63;
  margin-top: 10px;
}

.boleta-grand-label {
  font-size: 42px;
  font-weight: 900;
  color: #2d2d2d;
  letter-spacing: 2px;
}

.boleta-grand-value {
  font-size: 52px;
  font-weight: 900;
  color: #e91e63;
  min-width: 240px;
  text-align: right;
}

/* ===== MÉTODO DE PAGO ===== */
.boleta-payment {
  margin: 0 60px 40px;
  border: 2px solid #e8e8e8;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  background: #fafafa;
}

.boleta-payment-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.boleta-payment-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #e91e63;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #e91e63;
  flex-shrink: 0;
}

.boleta-payment-meta {
  display: block;
  font-size: 20px;
  color: #888;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.boleta-payment-method {
  font-size: 28px;
  font-weight: 800;
  color: #2d2d2d;
}

.boleta-payment-right {
  text-align: right;
}

.boleta-payment-amount {
  font-size: 36px;
  font-weight: 800;
  color: #e91e63;
}

/* ===== AGRADECIMIENTO ===== */
.boleta-thanks {
  margin: 0 60px 60px;
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 10px 0;
}

.boleta-thanks-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fbf0fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #e91e63;
  flex-shrink: 0;
}

.boleta-thanks-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boleta-thanks-main {
  font-size: 32px;
  font-weight: 800;
  color: #2d2d2d;
  margin: 0;
}

.boleta-thanks-sub {
  font-size: 24px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

/* ===== PIE REDES ===== */
.boleta-footer {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 60px 60px 70px;
  background: #fafafa;
}

.boleta-social-link {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.boleta-social-link:hover {
  background: #e91e63;
  color: white;
  border-color: #e91e63;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(210, 9, 182, 0.3);
}
</style>
