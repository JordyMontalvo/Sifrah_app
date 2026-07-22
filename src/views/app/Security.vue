<template>
  <App :session="session" title="Legado SIFRAH">
    <div class="legado-view">
      <i class="load" v-if="loading"></i>

      <template v-else>
        <header class="legado-top">
          <div class="legado-brand">
            <div class="legado-brand-text">
              <h1 class="legado-title">
                Legado <span>SIFRAH</span>
                <i class="fas fa-shield-alt legado-brand-icon" aria-hidden="true"></i>
              </h1>
              <p class="legado-tagline">
                Tu negocio, tu esfuerzo y tus logros pueden trascender generaciones.
              </p>
            </div>
          </div>
        </header>

        <section class="legado-hero">
          <div class="legado-hero-bg" aria-hidden="true">
            <img
              src="../../assets/img/legado-hero-family.png"
              alt=""
            />
          </div>
          <div class="legado-hero-shade" aria-hidden="true"></div>
          <div class="legado-hero-copy">
            <h2>
              Tu legado puede <em>inspirar</em> y <em>transformar vidas.</em>
            </h2>
            <p>
              Configura tu legado en SIFRAH y asegura que tu organización y tus
              beneficios lleguen a quien tú elijas.
            </p>
            <button type="button" class="legado-btn-info" @click="showInfoModal = true">
              Conoce más sobre el Legado SIFRAH
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </section>

        <section class="legado-section">
          <div class="legado-section-head">
            <div class="legado-section-icon" aria-hidden="true">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="legado-section-copy">
              <h3>Beneficiarios designados</h3>
              <p>
                Puedes designar hasta 2 personas de confianza que heredarán tu
                negocio SIFRAH en caso de fallecimiento o incapacidad permanente.
              </p>
            </div>
          </div>

          <!-- Estado registrado -->
          <div v-if="isRegistered" class="legado-cards">
            <article class="legado-card">
              <div class="legado-card-head">
                <h4>Beneficiario Principal</h4>
                <span class="legado-status">
                  Registrado <i class="fas fa-check-circle"></i>
                </span>
              </div>
              <dl class="legado-dl">
                <div><dt>Nombre</dt><dd>{{ primary.fullName }}</dd></div>
                <div><dt>Parentesco</dt><dd>{{ primary.relation }}</dd></div>
                <div><dt>Documento</dt><dd>{{ primary.dni }}</dd></div>
                <div><dt>Celular</dt><dd>{{ primary.phone }}</dd></div>
                <div v-if="primary.email"><dt>Email</dt><dd>{{ primary.email }}</dd></div>
                <div v-if="primary.registeredAt">
                  <dt>Fecha de registro</dt>
                  <dd>{{ formatDate(primary.registeredAt) }}</dd>
                </div>
              </dl>
              <button type="button" class="legado-btn-outline" @click="openDetail(primary, 'Principal')">
                <i class="fas fa-eye"></i> Ver información
              </button>
            </article>

            <article class="legado-card" :class="{ 'legado-card--empty': !secondary }">
              <div class="legado-card-head">
                <h4>Beneficiario Secundario <small>(Opcional)</small></h4>
                <span v-if="secondary" class="legado-status">
                  Registrado <i class="fas fa-check-circle"></i>
                </span>
                <span v-else class="legado-status legado-status--muted">Sin registrar</span>
              </div>
              <template v-if="secondary">
                <dl class="legado-dl">
                  <div><dt>Nombre</dt><dd>{{ secondary.fullName }}</dd></div>
                  <div><dt>Parentesco</dt><dd>{{ secondary.relation }}</dd></div>
                  <div><dt>Documento</dt><dd>{{ secondary.dni }}</dd></div>
                  <div><dt>Celular</dt><dd>{{ secondary.phone }}</dd></div>
                  <div v-if="secondary.email"><dt>Email</dt><dd>{{ secondary.email }}</dd></div>
                  <div v-if="secondary.registeredAt">
                    <dt>Fecha de registro</dt>
                    <dd>{{ formatDate(secondary.registeredAt) }}</dd>
                  </div>
                </dl>
                <button type="button" class="legado-btn-outline" @click="openDetail(secondary, 'Secundario')">
                  <i class="fas fa-eye"></i> Ver información
                </button>
              </template>
              <p v-else class="legado-empty-note">
                No designaste un beneficiario secundario.
              </p>
            </article>
          </div>

          <!-- Formulario de registro -->
          <div v-else class="legado-forms">
            <div class="legado-form-card">
              <h4>Beneficiario Principal</h4>
              <div class="legado-form-grid">
                <label>
                  <span>Nombre completo</span>
                  <input v-model="form.primary.fullName" type="text" placeholder="Ej. María Fernanda Ramirez" />
                </label>
                <label>
                  <span>Parentesco</span>
                  <input v-model="form.primary.relation" type="text" placeholder="Ej. Hija" />
                </label>
                <label>
                  <span>Documento</span>
                  <input v-model="form.primary.dni" type="text" placeholder="Nro. de documento" />
                </label>
                <label>
                  <span>Celular</span>
                  <input v-model="form.primary.phone" type="text" placeholder="+51 900 000 000" />
                </label>
                <label class="legado-form-full">
                  <span>Email (opcional)</span>
                  <input v-model="form.primary.email" type="email" placeholder="correo@ejemplo.com" />
                </label>
              </div>
            </div>

            <div class="legado-form-card">
              <h4>Beneficiario Secundario <small>(Opcional)</small></h4>
              <div class="legado-form-grid">
                <label>
                  <span>Nombre completo</span>
                  <input v-model="form.secondary.fullName" type="text" placeholder="Ej. Carlos Alberto Ramirez" />
                </label>
                <label>
                  <span>Parentesco</span>
                  <input v-model="form.secondary.relation" type="text" placeholder="Ej. Hermano" />
                </label>
                <label>
                  <span>Documento</span>
                  <input v-model="form.secondary.dni" type="text" placeholder="Nro. de documento" />
                </label>
                <label>
                  <span>Celular</span>
                  <input v-model="form.secondary.phone" type="text" placeholder="+51 900 000 000" />
                </label>
                <label class="legado-form-full">
                  <span>Email (opcional)</span>
                  <input v-model="form.secondary.email" type="email" placeholder="correo@ejemplo.com" />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section class="legado-protected">
          <div class="legado-protected-copy">
            <i class="fas fa-lock"></i>
            <div>
              <h4>Información protegida</h4>
              <p>
                Una vez registrados, los datos de tus beneficiarios no se pueden
                modificar desde la app. Cualquier cambio requiere contactar a
                soporte para un proceso de validación.
              </p>
            </div>
          </div>
          <div class="legado-protected-art" aria-hidden="true">
            <img
              src="../../assets/img/legado-lock-shield.svg"
              alt=""
              class="legado-protected-img"
            />
          </div>
        </section>

        <footer class="legado-footer">
          <label class="legado-terms">
            <input v-model="termsAccepted" type="checkbox" :disabled="isRegistered" />
            <span>
              He leído y acepto los
              <button
                type="button"
                class="legado-terms-link"
                @click.stop.prevent="showTermsModal = true"
              >
                Términos y Condiciones
              </button>
              del Legado SIFRAH.
            </span>
          </label>

          <div class="legado-footer-actions">
            <button
              v-if="isRegistered"
              type="button"
              class="legado-btn-primary"
              @click="requestChange"
            >
              Solicitar cambio de beneficiario
              <i class="fas fa-arrow-right"></i>
            </button>
            <button
              v-else
              type="button"
              class="legado-btn-primary"
              :disabled="sending || !termsAccepted"
              @click="saveBeneficiaries"
            >
              <span v-if="sending"><i class="fas fa-spinner fa-spin"></i> Guardando...</span>
              <span v-else>Registrar beneficiarios <i class="fas fa-arrow-right"></i></span>
            </button>
          </div>
        </footer>

        <p v-if="alert" class="legado-alert" :class="alert.type">{{ alert.text }}</p>
      </template>
    </div>

    <!-- Modal info -->
    <div v-if="showInfoModal" class="legado-modal" @click.self="showInfoModal = false">
      <div class="legado-modal-card">
        <h3>¿Qué es el Legado SIFRAH?</h3>
        <p>
          El Legado SIFRAH te permite designar hasta dos beneficiarios para que,
          ante una eventualidad, tu negocio, tus logros y tus beneficios puedan
          continuar con las personas que elijas.
        </p>
        <ul>
          <li>Beneficiario principal obligatorio.</li>
          <li>Beneficiario secundario opcional.</li>
          <li>Los datos quedan protegidos y solo se modifican con soporte.</li>
        </ul>
        <button type="button" class="legado-btn-primary" @click="showInfoModal = false">
          Entendido
        </button>
      </div>
    </div>

    <!-- Modal términos -->
    <div v-if="showTermsModal" class="legado-modal" @click.self="showTermsModal = false">
      <div class="legado-modal-card">
        <h3>Términos y Condiciones del Legado SIFRAH</h3>
        <div class="legado-terms-body">
          <p>
            Al registrar beneficiarios, declaras que la información proporcionada
            es verídica y que las personas designadas están de tu entera confianza.
          </p>
          <p>
            Una vez confirmado el registro, no podrás editar los datos desde la
            plataforma. Cualquier modificación requerirá validación con el equipo
            de soporte SIFRAH.
          </p>
          <p>
            SIFRAH podrá solicitar documentación adicional para acreditar
            parentesco o identidad antes de aplicar un cambio de beneficiario.
          </p>
        </div>
        <button type="button" class="legado-btn-primary" @click="showTermsModal = false">
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal detalle -->
    <div v-if="detailPerson" class="legado-modal" @click.self="detailPerson = null">
      <div class="legado-modal-card">
        <h3>Beneficiario {{ detailRole }}</h3>
        <dl class="legado-dl legado-dl--modal">
          <div><dt>Nombre</dt><dd>{{ detailPerson.fullName }}</dd></div>
          <div><dt>Parentesco</dt><dd>{{ detailPerson.relation }}</dd></div>
          <div><dt>Documento</dt><dd>{{ detailPerson.dni }}</dd></div>
          <div><dt>Celular</dt><dd>{{ detailPerson.phone }}</dd></div>
          <div v-if="detailPerson.email"><dt>Email</dt><dd>{{ detailPerson.email }}</dd></div>
          <div v-if="detailPerson.registeredAt">
            <dt>Fecha de registro</dt>
            <dd>{{ formatDate(detailPerson.registeredAt) }}</dd>
          </div>
        </dl>
        <button type="button" class="legado-btn-primary" @click="detailPerson = null">
          Cerrar
        </button>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

const emptyPerson = () => ({
  fullName: "",
  relation: "",
  dni: "",
  phone: "",
  email: "",
});

export default {
  components: { App },
  data() {
    return {
      loading: true,
      sending: false,
      primary: null,
      secondary: null,
      termsAccepted: false,
      form: {
        primary: emptyPerson(),
        secondary: emptyPerson(),
      },
      alert: null,
      showInfoModal: false,
      showTermsModal: false,
      detailPerson: null,
      detailRole: "",
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    isRegistered() {
      return !!this.primary;
    },
    userFullName() {
      const n = this.$store.state.name || "";
      const ln = this.$store.state.lastName || "";
      return `${n} ${ln}`.trim() || "Usuario";
    },
  },
  async created() {
    const { data } = await api.Security.GET(this.session);
    this.loading = false;

    if (data.error && data.msg == "invalid session") {
      this.$router.push("/login");
      return;
    }
    if (data.error && data.msg == "unverified user") {
      this.$router.push("/verify");
      return;
    }

    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    if (data.photo) this.$store.commit("SET_PHOTO", data.photo);

    const sec = data.security || {};
    this.primary = sec.primary || null;
    this.secondary = sec.secondary || null;
    this.termsAccepted = !!sec.termsAcceptedAt || !!this.primary;
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    openDetail(person, role) {
      this.detailPerson = person;
      this.detailRole = role;
    },
    personPayload(person) {
      const fullName = String(person.fullName || "").trim();
      if (!fullName && !person.dni && !person.relation && !person.phone) return null;
      const parts = fullName.split(/\s+/);
      return {
        fullName,
        name: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        relation: String(person.relation || "").trim(),
        dni: String(person.dni || "").trim(),
        phone: String(person.phone || "").trim(),
        email: String(person.email || "").trim(),
      };
    },
    async saveBeneficiaries() {
      this.alert = null;
      if (!this.termsAccepted) {
        this.alert = {
          type: "error",
          text: "Debes aceptar los Términos y Condiciones del Legado SIFRAH.",
        };
        return;
      }

      const primary = this.personPayload(this.form.primary);
      if (!primary || !primary.fullName || !primary.dni || !primary.relation || !primary.phone) {
        this.alert = {
          type: "error",
          text: "Completa los datos del beneficiario principal.",
        };
        return;
      }

      const secondaryRaw = this.personPayload(this.form.secondary);
      let secondary = null;
      if (secondaryRaw) {
        if (!secondaryRaw.fullName || !secondaryRaw.dni || !secondaryRaw.relation || !secondaryRaw.phone) {
          this.alert = {
            type: "error",
            text: "Si agregas beneficiario secundario, completa todos sus datos obligatorios.",
          };
          return;
        }
        secondary = secondaryRaw;
      }

      this.sending = true;
      try {
        const { data } = await api.Security.POST(this.session, {
          primary,
          secondary,
          termsAccepted: true,
        });
        if (data.error) {
          this.alert = { type: "error", text: data.msg || data.error || "No se pudo guardar." };
          return;
        }
        const sec = data.security || {};
        this.primary = sec.primary || {
          ...primary,
          registeredAt: new Date().toISOString(),
        };
        this.secondary = sec.secondary
          ? sec.secondary
          : secondary
            ? { ...secondary, registeredAt: new Date().toISOString() }
            : null;
        this.alert = { type: "success", text: "Beneficiarios registrados correctamente." };
      } catch (e) {
        this.alert = { type: "error", text: "Error al guardar. Intenta de nuevo." };
      } finally {
        this.sending = false;
      }
    },
    requestChange() {
      const msg = encodeURIComponent(
        `Hola, soy ${this.userFullName}. Deseo solicitar un cambio de beneficiario del Legado SIFRAH.`
      );
      window.open(`https://wa.me/message/JCHJIVLZGG6MK1?text=${msg}`, "_blank");
    },
  },
};
</script>

<style scoped>
.legado-view,
.legado-modal {
  --pink: #e91e63;
  --pink-dark: #c2185b;
  --ink: #1a1a2e;
  --muted: #6b7280;
  --line: #eceff1;
}

.legado-view {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 8px 0 40px;
  box-sizing: border-box;
}

@media (min-width: 861px) {
  .legado-hero {
    border-radius: 18px;
  }
}

.legado-top {
  margin-bottom: 20px;
}

.legado-brand {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.legado-brand-text {
  min-width: 0;
}

.legado-title {
  margin: 0;
  font-size: 1.55rem;
  color: var(--ink);
  font-weight: 800;
  letter-spacing: -0.02em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.legado-title span {
  color: var(--pink);
}

.legado-brand-icon {
  color: var(--pink);
  font-size: 1.05rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
}

.legado-tagline {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  max-width: 420px;
  line-height: 1.4;
}

@media (min-width: 861px) {
  .legado-title {
    flex-wrap: nowrap;
  }

  .legado-brand-icon {
    font-size: 1.15rem;
  }

  .legado-tagline {
    max-width: none;
    white-space: nowrap;
  }
}

.legado-hero {
  position: relative;
  display: block;
  border-radius: 20px;
  overflow: hidden;
  min-height: 320px;
  margin-bottom: 28px;
  background: #050208;
  box-shadow:
    0 10px 28px rgba(20, 4, 18, 0.28),
    0 2px 8px rgba(20, 4, 18, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.legado-hero-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 28%;
  z-index: 0;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.15) 12%,
    rgba(0, 0, 0, 0.55) 28%,
    rgba(0, 0, 0, 0.9) 48%,
    #000 68%,
    #000 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.15) 12%,
    rgba(0, 0, 0, 0.55) 28%,
    rgba(0, 0, 0, 0.9) 48%,
    #000 68%,
    #000 100%
  );
}

.legado-hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 58% 38%;
  display: block;
}

.legado-hero-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(
      90deg,
      #050208 0%,
      #050208 34%,
      rgba(5, 2, 8, 0.92) 42%,
      rgba(5, 2, 8, 0.72) 50%,
      rgba(5, 2, 8, 0.42) 58%,
      rgba(5, 2, 8, 0.18) 68%,
      rgba(5, 2, 8, 0.05) 78%,
      transparent 90%
    ),
    linear-gradient(
      180deg,
      rgba(5, 2, 8, 0.22) 0%,
      transparent 28%,
      transparent 72%,
      rgba(5, 2, 8, 0.32) 100%
    );
}

.legado-hero-copy {
  position: relative;
  z-index: 2;
  width: min(520px, 58%);
  padding: 36px 28px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  color: #fff;
  min-height: 320px;
}

.legado-hero-copy h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.9rem);
  line-height: 1.22;
  font-weight: 800;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.legado-hero-copy h2 em {
  font-style: normal;
  color: #ff4f8b;
}

.legado-hero-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.92rem;
  line-height: 1.45;
  max-width: 38ch;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}

.legado-btn-info {
  align-self: flex-start;
  border: none;
  background: #e91e63;
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  margin-top: 6px;
  box-shadow:
    0 6px 16px rgba(233, 30, 99, 0.42),
    0 2px 4px rgba(0, 0, 0, 0.25);
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
}

.legado-btn-info:hover {
  background: #c2185b;
  box-shadow:
    0 8px 20px rgba(233, 30, 99, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.28);
  transform: translateY(-1px);
}

.legado-btn-info:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(233, 30, 99, 0.35);
}

.legado-section-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.legado-section-icon {
  width: 42px;
  height: 48px;
  background: #e91e63;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  clip-path: polygon(50% 0%, 92% 12%, 92% 58%, 50% 100%, 8% 58%, 8% 12%);
  box-shadow: 0 6px 14px rgba(233, 30, 99, 0.28);
}

.legado-section-icon i {
  font-size: 0.95rem;
  margin-top: -2px;
}

.legado-section-copy {
  min-width: 0;
  padding-top: 1px;
}

.legado-section-head h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--ink);
  font-weight: 800;
  line-height: 1.25;
}

.legado-section-head p {
  margin: 6px 0 0;
  color: #4b5563;
  font-size: 0.92rem;
  line-height: 1.45;
  max-width: 62ch;
}

@media (min-width: 861px) {
  .legado-section-head p {
    max-width: none;
    white-space: nowrap;
  }
}

.legado-cards,
.legado-forms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.legado-card,
.legado-form-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 18px 18px 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.legado-card-head,
.legado-form-card h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.legado-card-head h4,
.legado-form-card h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--ink);
  font-weight: 800;
}

.legado-card-head small,
.legado-form-card h4 small {
  font-weight: 500;
  color: var(--muted);
  font-size: 0.78rem;
}

.legado-status {
  color: var(--pink);
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.legado-status--muted {
  color: #9aa3af;
  font-weight: 600;
}

.legado-dl {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
}

.legado-dl div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  font-size: 0.88rem;
}

.legado-dl dt {
  color: var(--muted);
  font-weight: 500;
}

.legado-dl dd {
  margin: 0;
  color: var(--ink);
  font-weight: 600;
  word-break: break-word;
}

.legado-empty-note {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 8px 0 0;
}

.legado-btn-outline {
  width: 100%;
  border: 1.5px solid var(--pink);
  background: #fff;
  color: var(--pink);
  border-radius: 12px;
  padding: 11px 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.legado-btn-outline:hover {
  background: #fff0f5;
}

.legado-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.legado-form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}

.legado-form-full {
  grid-column: 1 / -1;
}

.legado-form-grid input {
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.92rem;
  color: var(--ink);
  outline: none;
}

.legado-form-grid input:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.12);
}

.legado-protected {
  margin-top: 22px;
  background: #fff0f5;
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #f8bbd0;
  position: relative;
  overflow: visible;
}

.legado-protected-copy {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  padding-right: 0;
}

.legado-protected-copy > i {
  color: var(--pink);
  font-size: 1.2rem;
  margin-top: 3px;
  flex-shrink: 0;
}

.legado-protected-copy h4 {
  margin: 0 0 4px;
  color: var(--ink);
  font-size: 0.98rem;
}

.legado-protected-copy p {
  margin: 0;
  color: #6d5770;
  font-size: 0.88rem;
  line-height: 1.45;
  max-width: 62ch;
}

.legado-protected-art {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}

.legado-protected-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 6px 12px rgba(233, 30, 99, 0.2));
}

@media (min-width: 861px) {
  .legado-protected-copy {
    padding-right: 110px;
  }

  .legado-protected-art {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 140px;
    height: 140px;
    pointer-events: none;
  }

  .legado-protected-img {
    filter: drop-shadow(0 8px 14px rgba(233, 30, 99, 0.22));
  }
}

.legado-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.legado-terms {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--ink);
  max-width: 420px;
  cursor: pointer;
}

.legado-terms input {
  margin-top: 3px;
  accent-color: var(--pink);
  flex-shrink: 0;
}

.legado-terms-link {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  color: var(--pink);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.legado-terms-link:hover {
  color: var(--pink-dark);
  text-decoration: none;
}

@media (min-width: 861px) {
  .legado-terms {
    max-width: none;
    white-space: nowrap;
    align-items: center;
  }

  .legado-terms input {
    margin-top: 0;
  }
}

.legado-footer-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.legado-btn-ghost {
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legado-btn-primary {
  border: none;
  background: #e91e63;
  color: #fff !important;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 18px rgba(233, 30, 99, 0.28);
}

.legado-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.legado-btn-primary:not(:disabled):hover {
  background: #c2185b;
}

.legado-alert {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.legado-alert.error {
  background: #fdecea;
  color: #b71c1c;
}

.legado-alert.success {
  background: #e8f5e9;
  color: #1b5e20;
}

.legado-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 10, 20, 0.55);
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 16px;
}

.legado-modal-card {
  background: #fff;
  border-radius: 18px;
  padding: 24px 22px 20px;
  width: min(520px, 100%);
  position: relative;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.legado-modal-card h3 {
  margin: 0 0 12px;
  color: var(--ink);
  font-size: 1.15rem;
}

.legado-modal-card p,
.legado-terms-body p {
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.5;
}

.legado-modal-card ul {
  margin: 0 0 18px;
  padding-left: 18px;
  color: var(--muted);
  font-size: 0.92rem;
}

.legado-dl--modal {
  margin-bottom: 18px;
}

.legado-terms-body {
  max-height: 40vh;
  overflow: auto;
  margin-bottom: 16px;
}

@media (max-width: 860px) {
  .legado-view {
    max-width: 100%;
    margin: 0 auto;
    padding: 8px 4px 40px;
  }

  .legado-hero {
    min-height: 340px;
  }

  .legado-hero-bg {
    left: 0;
    -webkit-mask-image: linear-gradient(
      180deg,
      #000 0%,
      #000 35%,
      rgba(0, 0, 0, 0.7) 55%,
      rgba(0, 0, 0, 0.25) 75%,
      transparent 100%
    );
    mask-image: linear-gradient(
      180deg,
      #000 0%,
      #000 35%,
      rgba(0, 0, 0, 0.7) 55%,
      rgba(0, 0, 0, 0.25) 75%,
      transparent 100%
    );
  }

  .legado-hero-bg img {
    object-position: center 30%;
  }

  .legado-hero-shade {
    background:
      linear-gradient(
        180deg,
        rgba(5, 2, 8, 0.15) 0%,
        rgba(8, 2, 10, 0.45) 35%,
        rgba(8, 2, 10, 0.88) 62%,
        #050208 100%
      );
  }

  .legado-hero-copy {
    width: 100%;
    min-height: 340px;
    justify-content: flex-end;
    padding-top: 40px;
  }

  .legado-cards,
  .legado-forms,
  .legado-form-grid {
    grid-template-columns: 1fr;
  }

  .legado-dl div {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .legado-protected {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 16px 14px;
  }

  .legado-protected-copy {
    gap: 10px;
  }

  .legado-protected-copy > i {
    display: none;
  }

  .legado-protected-copy p {
    font-size: 0.82rem;
  }

  .legado-protected-art {
    width: 72px;
    height: 72px;
    margin-right: 0;
    align-self: center;
  }

  .legado-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .legado-footer-actions {
    flex-direction: column;
  }

  .legado-btn-primary,
  .legado-btn-ghost {
    justify-content: center;
    width: 100%;
  }
}
</style>
