<template>
  <footer class="shared-store-footer">
    <div class="footer-container">
      <div class="footer-columns">
        <!-- Columna 1: Soporte -->
        <div class="footer-col footer-col-support">
          <h4 class="footer-col-title">Soporte</h4>
          <div class="support-content">
            <div class="support-icon-box">
              <i class="fab fa-whatsapp"></i>
            </div>
            <p class="support-text">
              En caso tengas alguna duda o consulta puedes contactarte con nosotros por WhatsApp.
            </p>
          </div>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-contact-whatsapp"
          >
            <i class="fab fa-whatsapp"></i>
            <span>Contáctanos por WhatsApp</span>
          </a>
        </div>

        <!-- Columna 2: Comunidad -->
        <div class="footer-col footer-col-community">
          <h4 class="footer-col-title">Comunidad</h4>
          <p class="community-subtitle">
            Síguenos en todas nuestras redes desde aquí
          </p>
          <div class="social-links-row">
            <a
              href="https://www.facebook.com/sifrahperu"
              target="_blank"
              rel="noopener noreferrer"
              class="social-circle-btn"
              title="Facebook"
            >
              <i class="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/sifrahperu"
              target="_blank"
              rel="noopener noreferrer"
              class="social-circle-btn"
              title="Instagram"
            >
              <i class="fab fa-instagram"></i>
            </a>
            <a
              href="https://www.youtube.com/@sifrah"
              target="_blank"
              rel="noopener noreferrer"
              class="social-circle-btn"
              title="YouTube"
            >
              <i class="fab fa-youtube"></i>
            </a>
            <a
              href="https://www.tiktok.com/@sifrahperu"
              target="_blank"
              rel="noopener noreferrer"
              class="social-circle-btn"
              title="TikTok"
            >
              <i class="fab fa-tiktok"></i>
            </a>
          </div>
        </div>

        <!-- Columna 3: Métodos de pago -->
        <div class="footer-col footer-col-payments">
          <h4 class="footer-col-title">Métodos de pago</h4>
          <p class="payments-subtitle">Paga de forma segura con:</p>
          <div class="payment-badges-row">
            <!-- VISA -->
            <div class="payment-badge badge-visa" title="Visa">
              <svg viewBox="0 0 48 32" class="badge-svg">
                <rect width="48" height="32" rx="4" fill="#ffffff"/>
                <path d="M19.4 21.6h-2.9l1.8-11.2h2.9l-1.8 11.2zm12-11l-2.7 7.7-.3-1.6-.9-4.8s-.2-1.3-1.6-1.3h-4.3l-.1.4c.9.2 1.9.6 2.5 1 1.1.7 1.2 1.1 1.2 1.1l2.9 8.5h3.1l4.7-11h-4.8zm-7.6 11h2.8l1.7-11.2h-2.8l-1.7 11.2zm-9.3-11.2l-3.3 8.3-.4-1.9c-.6-2.2-2.5-4.6-4.6-5.7l2.8 10.5h3.1l4.6-11.2h-2.2z" fill="#00579f"/>
              </svg>
            </div>

            <!-- MASTERCARD -->
            <div class="payment-badge badge-mastercard" title="Mastercard">
              <svg viewBox="0 0 48 32" class="badge-svg">
                <rect width="48" height="32" rx="4" fill="#ffffff"/>
                <circle cx="19" cy="16" r="8.5" fill="#eb001b"/>
                <circle cx="29" cy="16" r="8.5" fill="#f79e1b" fill-opacity="0.9"/>
                <path d="M24 10.3a8.47 8.47 0 00-3 5.7 8.47 8.47 0 003 5.7 8.47 8.47 0 003-5.7 8.47 8.47 0 00-3-5.7z" fill="#ff5f00"/>
              </svg>
            </div>

            <!-- AMEX -->
            <div class="payment-badge badge-amex" title="American Express">
              <svg viewBox="0 0 48 32" class="badge-svg">
                <rect width="48" height="32" rx="4" fill="#006fcf"/>
                <text x="24" y="14" fill="#ffffff" font-size="5" font-weight="900" text-anchor="middle" letter-spacing="0.5">AMERICAN</text>
                <text x="24" y="21" fill="#ffffff" font-size="5" font-weight="900" text-anchor="middle" letter-spacing="0.5">EXPRESS</text>
              </svg>
            </div>

            <!-- Transferencia bancaria -->
            <div class="payment-transfer-badge" title="Transferencia bancaria">
              <i class="fas fa-university transfer-icon"></i>
              <div class="transfer-labels">
                <span>Transferencia</span>
                <span>bancaria</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra inferior legal -->
      <div class="footer-bottom-bar">
        <router-link to="/terminos-y-condiciones" class="legal-link">
          Términos y condiciones
        </router-link>
        <span class="legal-separator">|</span>
        <router-link to="/politica-de-privacidad" class="legal-link">
          Política de privacidad
        </router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "SharedStoreFooter",
  props: {
    whatsappPhone: {
      type: String,
      default: "51999999999"
    },
    ownerName: {
      type: String,
      default: ""
    }
  },
  computed: {
    whatsappUrl() {
      const cleanPhone = (this.whatsappPhone || "").replace(/\D/g, "") || "51999999999";
      const message = encodeURIComponent(
        `Hola, me gustaría recibir asesoría sobre los productos de la tienda SIFRAH.`
      );
      return `https://wa.me/${cleanPhone}?text=${message}`;
    }
  }
};
</script>

<style scoped>
.shared-store-footer {
  width: 100%;
  background-color: #171d24;
  color: #f1f5f9;
  padding: 48px 24px 28px;
  box-sizing: border-box;
  margin-top: auto;
  font-family: inherit;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
  align-items: start;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-col-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 14px 0;
  letter-spacing: 0.2px;
}

/* Soporte */
.support-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.support-icon-box {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #25d366;
  font-size: 24px;
}

.support-text {
  font-size: 13px;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0;
}

.btn-contact-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-contact-whatsapp i {
  font-size: 16px;
  color: #25d366;
}

.btn-contact-whatsapp:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #25d366;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Comunidad */
.community-subtitle {
  font-size: 13px;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0 0 18px 0;
}

.social-links-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.social-circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.04);
}

.social-circle-btn:hover {
  background-color: #e60064;
  border-color: #e60064;
  color: #ffffff;
  transform: translateY(-2px);
}

/* Métodos de Pago */
.payments-subtitle {
  font-size: 13px;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0 0 16px 0;
}

.payment-badges-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.payment-badge {
  width: 52px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.payment-transfer-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  padding: 4px 6px;
}

.payment-transfer-badge .transfer-icon {
  font-size: 20px;
  color: #94a3b8;
}

.transfer-labels {
  display: flex;
  flex-direction: column;
  font-size: 10px;
  line-height: 1.15;
  color: #cbd5e1;
  font-weight: 500;
}

/* Barra inferior legal */
.footer-bottom-bar {
  padding-top: 22px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.legal-link {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

.legal-separator {
  color: #64748b;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 900px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
