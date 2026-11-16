<template>
  <div class="lr-page">
    <main class="lr-card">
      <!-- Encabezado -->
      <header class="lr-head">
        <svg class="lr-head__icon" viewBox="0 0 64 48" aria-hidden="true">
          <path d="M4 6c9-3 19-3 28 3v35c-9-6-19-6-28-3z" />
          <path d="M60 6c-9-3-19-3-28 3v35c9-6 19-6 28-3z" />
          <path d="M8 44c8-2 16-1 24 3 8-4 16-5 24-3" />
        </svg>
        <span class="lr-head__divider" aria-hidden="true"></span>
        <h1 class="lr-head__title">Libro de<br />Reclamaciones</h1>
      </header>

      <section class="lr-company" aria-label="Datos de la empresa">
        <div class="lr-company__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v3h4a1 1 0 0 1 1 1v12h1v2H2v-2zm2 0h3v-3h2v3h2V6H6zm9 0h3V10h-3zM8 8h2v2H8zm0 4h2v2H8zm4-4h0zm-1 0h2v2h-2zm0 4h2v2h-2zm5 0h1v2h-1zm0 4h1v2h-1z" /></svg>
        </div>
        <div>
          <p class="lr-company__name">{{ company.name }}</p>
          <p class="lr-company__line"><strong>RUC:</strong> {{ company.ruc }}</p>
          <p class="lr-company__line lr-company__addr">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
            <span>Dirección: {{ company.address }}</span>
          </p>
        </div>
      </section>

      <form class="lr-form" novalidate @submit.prevent="submit">
        <!-- 1. Consumidor -->
        <h2 class="lr-section">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z" /></svg>
          Información del consumidor
        </h2>

        <div class="lr-grid">
          <div class="lr-field lr-field--wide" :class="fieldClass('names')">
            <label for="lr-names">Nombres <span class="req">*</span></label>
            <input id="lr-names" v-model="form.names" type="text" maxlength="80" autocomplete="given-name" placeholder="Escribe tus nombres" @input="clear('names')" />
            <p v-if="errors.names" class="lr-error">{{ errors.names }}</p>
          </div>

          <div class="lr-field" :class="fieldClass('last_name_father')">
            <label for="lr-lnf">Apellido Paterno <span class="req">*</span></label>
            <input id="lr-lnf" v-model="form.last_name_father" type="text" maxlength="60" autocomplete="family-name" placeholder="Escribe tu apellido paterno" @input="clear('last_name_father')" />
            <p v-if="errors.last_name_father" class="lr-error">{{ errors.last_name_father }}</p>
          </div>

          <div class="lr-field" :class="fieldClass('last_name_mother')">
            <label for="lr-lnm">Apellido Materno <span class="req">*</span></label>
            <input id="lr-lnm" v-model="form.last_name_mother" type="text" maxlength="60" placeholder="Escribe tu apellido materno" @input="clear('last_name_mother')" />
            <p v-if="errors.last_name_mother" class="lr-error">{{ errors.last_name_mother }}</p>
          </div>
        </div>

        <div class="lr-minor" :class="{ 'is-active': form.is_minor }">
          <label class="lr-minor__toggle">
            <input v-model="form.is_minor" type="checkbox" @change="clear('guardian')" />
            <svg class="lr-minor__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.5A2.5 2.5 0 1 0 7 .5a2.5 2.5 0 0 0 0 5zM16.5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 7h4a2 2 0 0 1 2 2v6H9.5v8h-5v-8H3V9a2 2 0 0 1 2-2zm9.5 4h4a1.5 1.5 0 0 1 1.5 1.5V17h-1v6h-5v-6h-1v-4.5a1.5 1.5 0 0 1 1.5-1.5z" /></svg>
            <span class="lr-minor__title">En caso de ser menor de edad</span>
          </label>
          <p class="lr-minor__hint">Marca la casilla si eres menor de edad.</p>
          <div class="lr-field" :class="fieldClass('guardian')">
            <label for="lr-guardian">
              Nombre y Apellido de padre/madre o representante
              <span v-if="form.is_minor" class="req">*</span>
            </label>
            <input id="lr-guardian" v-model="form.guardian" type="text" maxlength="120" :disabled="!form.is_minor" placeholder="Escribe el nombre y apellido" @input="clear('guardian')" />
            <p v-if="errors.guardian" class="lr-error">{{ errors.guardian }}</p>
          </div>
        </div>

        <div class="lr-grid">
          <div class="lr-field lr-field--wide" :class="fieldClass('address')">
            <label for="lr-address">Domicilio <span class="req">*</span></label>
            <input id="lr-address" v-model="form.address" type="text" maxlength="200" autocomplete="street-address" placeholder="Escribe tu domicilio" @input="clear('address')" />
            <p v-if="errors.address" class="lr-error">{{ errors.address }}</p>
          </div>

          <div class="lr-field" :class="fieldClass('doc_type')">
            <label for="lr-doctype">Tipo de documento <span class="req">*</span></label>
            <select id="lr-doctype" v-model="form.doc_type" @change="clear('doc_type'); clear('doc_number')">
              <option value="" disabled>Selecciona un tipo de documento</option>
              <option v-for="d in docTypes" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
            <p v-if="errors.doc_type" class="lr-error">{{ errors.doc_type }}</p>
          </div>

          <div class="lr-field" :class="fieldClass('doc_number')">
            <label for="lr-docnum">N° de documento <span class="req">*</span></label>
            <input id="lr-docnum" v-model="form.doc_number" type="text" :inputmode="form.doc_type === 'dni' ? 'numeric' : 'text'" :maxlength="form.doc_type === 'dni' ? 8 : 15" placeholder="Escribe el número de documento" @input="clear('doc_number')" />
            <p v-if="errors.doc_number" class="lr-error">{{ errors.doc_number }}</p>
          </div>

          <div class="lr-field lr-field--wide" :class="fieldClass('contact')">
            <label for="lr-contact">Correo Electrónico / Número de teléfono <span class="req">*</span></label>
            <input id="lr-contact" v-model="form.contact" type="text" maxlength="120" autocomplete="email" placeholder="Escribe tu correo o número de teléfono" @input="clear('contact')" />
            <p v-if="errors.contact" class="lr-error">{{ errors.contact }}</p>
            <p v-else class="lr-help">Si escribes un correo, te enviaremos una copia de tu registro.</p>
          </div>
        </div>

        <!-- 2. Producto -->
        <h2 class="lr-section">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM1 2v2h2l3.6 7.6-1.4 2.4A2 2 0 0 0 7 17h12v-2H7.4l1.1-2h7.5a2 2 0 0 0 1.7-1l3.6-6.5A1 1 0 0 0 20.4 4H5.2l-.9-2z" /></svg>
          Información del producto
        </h2>

        <div class="lr-grid">
          <div class="lr-field" :class="fieldClass('operation_type')">
            <label for="lr-op">Tipo de operación <span class="req">*</span></label>
            <select id="lr-op" v-model="form.operation_type" @change="clear('operation_type')">
              <option value="" disabled>Selecciona el tipo de operación</option>
              <option value="afiliacion">Afiliación</option>
              <option value="recompra">Recompra (Reconsumo)</option>
            </select>
            <p v-if="errors.operation_type" class="lr-error">{{ errors.operation_type }}</p>
          </div>

          <div class="lr-field" :class="fieldClass('amount')">
            <label for="lr-amount">Monto pagado <span class="opt">(opcional)</span></label>
            <div class="lr-money">
              <span class="lr-money__prefix">S/</span>
              <input id="lr-amount" v-model="form.amount" type="text" inputmode="decimal" maxlength="12" placeholder="Ej. 350.00" @input="clear('amount')" />
            </div>
            <p v-if="errors.amount" class="lr-error">{{ errors.amount }}</p>
          </div>

          <div class="lr-field lr-field--wide" :class="fieldClass('products')">
            <label for="lr-products">Producto <span class="req">*</span></label>
            <input id="lr-products" v-model="form.products" type="text" maxlength="300" placeholder="Escribe el producto" @input="clear('products')" />
            <p v-if="errors.products" class="lr-error">{{ errors.products }}</p>
          </div>
        </div>

        <!-- 3. Detalle -->
        <h2 class="lr-section">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2zm3 7a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 7 10zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z" /></svg>
          Detalle del reclamo
        </h2>

        <div class="lr-field" :class="fieldClass('kind')">
          <div class="lr-radios" role="radiogroup" aria-label="Tipo de registro">
            <label class="lr-radio" :class="{ 'is-checked': form.kind === 'reclamo' }">
              <input v-model="form.kind" type="radio" name="kind" value="reclamo" @change="clear('kind')" />
              <span class="lr-radio__dot" aria-hidden="true"></span>
              <span>
                <strong>Reclamo</strong>
                <small>Disconformidad relacionada a los productos.</small>
              </span>
            </label>
            <label class="lr-radio" :class="{ 'is-checked': form.kind === 'queja' }">
              <input v-model="form.kind" type="radio" name="kind" value="queja" @change="clear('kind')" />
              <span class="lr-radio__dot" aria-hidden="true"></span>
              <span>
                <strong>Queja</strong>
                <small>Disconformidad no relacionada a los productos o malestar o descontento en la atención al público.</small>
              </span>
            </label>
          </div>
          <p v-if="errors.kind" class="lr-error">{{ errors.kind }}</p>
        </div>

        <div class="lr-field" :class="fieldClass('description')">
          <label for="lr-desc">Descripción de los hechos <span class="req">*</span></label>
          <textarea id="lr-desc" v-model="form.description" rows="5" :maxlength="limits.description" placeholder="Describe de forma clara y detallada lo sucedido." @input="clear('description')"></textarea>
          <div class="lr-meta">
            <p v-if="errors.description" class="lr-error">{{ errors.description }}</p>
            <span class="lr-count">{{ form.description.length }} / {{ limits.description }}</span>
          </div>
        </div>

        <div class="lr-field" :class="fieldClass('request')">
          <label for="lr-req">Solicitud de solución <span class="req">*</span></label>
          <textarea id="lr-req" v-model="form.request" rows="4" :maxlength="limits.request" placeholder="Indica la solución que esperas." @input="clear('request')"></textarea>
          <div class="lr-meta">
            <p v-if="errors.request" class="lr-error">{{ errors.request }}</p>
            <span class="lr-count">{{ form.request.length }} / {{ limits.request }}</span>
          </div>
        </div>

        <p v-if="submitError" class="lr-alert" role="alert">{{ submitError }}</p>

        <button type="submit" class="lr-submit" :disabled="sending">
          <span v-if="sending" class="lr-spinner" aria-hidden="true"></span>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          {{ sending ? "Enviando..." : "Enviar reclamación" }}
        </button>

        <p class="lr-legal">
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es
          requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá dar respuesta
          al reclamo en un plazo no mayor a quince (15) días hábiles.
        </p>
      </form>
    </main>

    <!-- Pop-up de confirmación -->
    <div v-if="registered" class="lr-modal" role="dialog" aria-modal="true" aria-labelledby="lr-modal-title" @click.self="closeModal">
      <div class="lr-modal__box">
        <div class="lr-modal__check" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
        </div>
        <h2 id="lr-modal-title" class="lr-modal__title">¡Reclamo registrado!</h2>
        <p class="lr-modal__text">Tu reclamo ha sido enviado correctamente.</p>
        <dl class="lr-modal__data">
          <div><dt>N.º de registro</dt><dd>{{ registered.code }}</dd></div>
          <div><dt>Fecha</dt><dd>{{ formatDate(registered.created_at) }}</dd></div>
          <div><dt>Hora</dt><dd>{{ formatTime(registered.created_at) }}</dd></div>
        </dl>
        <p v-if="registered.email_sent" class="lr-modal__mail">Enviamos una copia a {{ registered.consumer.email }}.</p>
        <button type="button" class="lr-submit" @click="downloadPdf">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16l-5-5 1.4-1.4 2.6 2.6V3h2v9.2l2.6-2.6L17 11zM5 19h14v2H5z" /></svg>
          Descargar PDF
        </button>
        <button type="button" class="lr-modal__close" @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from "jspdf";

const COMPANY = {
  name: "SIFRAH CORP S.A.C.",
  ruc: "20612589454",
  address: "Calle Loma Real 262, Santiago de Surco, Lima.",
};

const DOC_PATTERNS = {
  dni: { re: /^\d{8}$/, msg: "El DNI debe tener 8 dígitos." },
  ce: { re: /^[A-Za-z0-9]{6,12}$/, msg: "El carné de extranjería debe tener entre 6 y 12 caracteres alfanuméricos." },
  cedula: { re: /^[A-Za-z0-9-]{5,15}$/, msg: "La cédula debe tener entre 5 y 15 caracteres." },
  pasaporte: { re: /^[A-Za-z0-9]{6,12}$/, msg: "El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos." },
};

const FIELD_ORDER = [
  "names", "last_name_father", "last_name_mother", "guardian", "address", "doc_type",
  "doc_number", "contact", "operation_type", "amount", "products", "kind", "description", "request",
];

function emptyForm() {
  return {
    names: "",
    last_name_father: "",
    last_name_mother: "",
    is_minor: false,
    guardian: "",
    address: "",
    doc_type: "",
    doc_number: "",
    contact: "",
    operation_type: "",
    products: "",
    amount: "",
    kind: "",
    description: "",
    request: "",
  };
}

function newRequestId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
}

export default {
  name: "LibroReclamaciones",
  data() {
    return {
      company: COMPANY,
      form: emptyForm(),
      errors: {},
      sending: false,
      submitError: "",
      registered: null,
      requestId: newRequestId(),
      limits: { description: 500, request: 300 },
      docTypes: [
        { value: "dni", label: "DNI" },
        { value: "ce", label: "Carné de extranjería" },
        { value: "cedula", label: "Cédula" },
        { value: "pasaporte", label: "Pasaporte" },
      ],
    };
  },
  mounted() {
    document.title = "Libro de Reclamaciones | SIFRAH";
  },
  methods: {
    fieldClass(key) {
      return { "has-error": !!this.errors[key] };
    },
    clear(key) {
      if (this.errors[key]) this.$delete(this.errors, key);
      this.submitError = "";
    },
    validate() {
      const f = this.form;
      const e = {};
      const t = (v) => String(v || "").trim();
      if (!t(f.names)) e.names = "Escribe tus nombres.";
      if (!t(f.last_name_father)) e.last_name_father = "Escribe tu apellido paterno.";
      if (!t(f.last_name_mother)) e.last_name_mother = "Escribe tu apellido materno.";
      if (f.is_minor && t(f.guardian).length < 3) {
        e.guardian = "Escribe el nombre y apellido del padre, madre o representante.";
      }
      if (!t(f.address)) e.address = "Escribe tu domicilio.";
      const doc = t(f.doc_number).replace(/\s/g, "");
      if (!f.doc_type) e.doc_type = "Selecciona un tipo de documento.";
      else if (!doc) e.doc_number = "Escribe el número de documento.";
      else if (!DOC_PATTERNS[f.doc_type].re.test(doc)) e.doc_number = DOC_PATTERNS[f.doc_type].msg;
      const contact = t(f.contact);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
      const isPhone = /^\+?\d{6,15}$/.test(contact.replace(/[\s().-]/g, ""));
      if (!contact) e.contact = "Escribe tu correo electrónico o número de teléfono.";
      else if (!isEmail && !isPhone) e.contact = "Escribe un correo válido o un teléfono de 6 a 15 dígitos.";
      if (!f.operation_type) e.operation_type = "Selecciona el tipo de operación.";
      if (!t(f.products)) e.products = "Escribe el producto o productos relacionados.";
      if (t(f.amount)) {
        const n = Number(t(f.amount).replace(",", "."));
        if (!Number.isFinite(n) || n < 0) e.amount = "El monto debe ser un número válido mayor o igual a 0.";
      }
      if (!f.kind) e.kind = "Selecciona si es un reclamo o una queja.";
      if (!t(f.description)) e.description = "Describe lo sucedido.";
      if (!t(f.request)) e.request = "Indica la solución que esperas.";
      return e;
    },
    focusFirstError() {
      this.$nextTick(() => {
        const first = FIELD_ORDER.find((k) => this.errors[k]);
        const el = first && this.$el.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        }
      });
    },
    async submit() {
      // Bloqueo inmediato: varios clics seguidos no generan varios registros
      if (this.sending) return;
      this.submitError = "";
      this.errors = this.validate();
      if (Object.keys(this.errors).length) {
        this.submitError = "Revisa los campos marcados antes de enviar.";
        this.focusFirstError();
        return;
      }

      this.sending = true;
      try {
        const { data } = await axios.post("/public/complaints", {
          ...this.form,
          client_request_id: this.requestId,
        });
        if (!data || data.error) {
          if (data && data.fields) this.errors = { ...data.fields };
          this.submitError = (data && data.msg) || "No se pudo registrar tu reclamo. Inténtalo nuevamente.";
          this.focusFirstError();
          return;
        }
        this.registered = data.complaint;
      } catch (err) {
        const msg = err && err.response && err.response.data && err.response.data.msg;
        this.submitError = msg || "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.";
      } finally {
        this.sending = false;
      }
    },
    closeModal() {
      this.registered = null;
      this.form = emptyForm();
      this.errors = {};
      this.requestId = newRequestId();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    formatDate(value) {
      return new Date(value).toLocaleDateString("es-PE", {
        timeZone: "America/Lima", day: "2-digit", month: "2-digit", year: "numeric",
      });
    },
    formatTime(value) {
      return new Date(value).toLocaleTimeString("es-PE", {
        timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", hour12: true,
      });
    },
    downloadPdf() {
      const r = this.registered;
      if (!r) return;
      const c = r.consumer;
      const p = r.product;
      const d = r.detail;
      const company = r.company || COMPANY;

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 16;
      const brand = [233, 30, 99];
      let y = 0;

      const ensure = (h) => {
        if (y + h > H - 16) {
          doc.addPage();
          y = 18;
        }
      };

      // Franja y encabezado
      doc.setFillColor(...brand);
      doc.rect(0, 0, W, 6, "F");
      y = 20;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 17, 17);
      doc.setFontSize(18);
      doc.text("LIBRO DE RECLAMACIONES", M, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.text(`${company.name}  ·  RUC: ${company.ruc}`, M, y);
      y += 5;
      doc.text(`Dirección: ${company.address}`, M, y);
      y += 8;

      // Recuadro con n.º, fecha y hora
      doc.setFillColor(252, 228, 236);
      doc.setDrawColor(...brand);
      doc.roundedRect(M, y, W - 2 * M, 18, 3, 3, "FD");
      const colW = (W - 2 * M) / 3;
      [["N.º de registro", r.code], ["Fecha", this.formatDate(r.created_at)], ["Hora", this.formatTime(r.created_at)]].forEach(([label, value], i) => {
        const x = M + 6 + i * colW;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(label, x, y + 7);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 17, 17);
        doc.text(String(value), x, y + 13.5);
      });
      y += 26;

      const section = (title) => {
        ensure(14);
        doc.setFillColor(...brand);
        doc.roundedRect(M, y, W - 2 * M, 8, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), M + 4, y + 5.5);
        y += 12;
      };

      const field = (label, value) => {
        const text = value == null || value === "" ? "—" : String(value);
        const lines = doc.splitTextToSize(text, W - 2 * M - 58);
        ensure(lines.length * 5 + 3);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(80, 80, 80);
        doc.text(label, M + 2, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(17, 17, 17);
        doc.text(lines, M + 58, y);
        y += lines.length * 5 + 3;
      };

      const block = (label, value) => {
        const lines = doc.splitTextToSize(String(value || "—"), W - 2 * M - 4);
        ensure(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(80, 80, 80);
        doc.text(label, M + 2, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(17, 17, 17);
        lines.forEach((line) => {
          ensure(5);
          doc.text(line, M + 2, y);
          y += 5;
        });
        y += 3;
      };

      section("Información del consumidor");
      field("Nombres", c.names);
      field("Apellido paterno", c.last_name_father);
      field("Apellido materno", c.last_name_mother);
      if (c.is_minor) field("Padre, madre o representante", c.guardian);
      field("Domicilio", c.address);
      field("Tipo de documento", c.doc_type_label);
      field("N.º de documento", c.doc_number);
      field(c.contact_type === "phone" ? "Teléfono" : "Correo electrónico", c.email || c.phone);
      y += 2;

      section("Información del producto");
      field("Tipo de operación", p.operation_type_label);
      field("Producto(s)", p.products);
      field("Monto pagado", p.amount == null ? "—" : `S/ ${Number(p.amount).toFixed(2)}`);
      y += 2;

      section("Detalle del reclamo");
      field("Tipo", d.kind_label);
      block("Descripción de los hechos", d.description);
      block("Solicitud de solución", d.request);

      const legal = doc.splitTextToSize(
        "La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles.",
        W - 2 * M
      );
      ensure(legal.length * 4 + 6);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(legal, M, y);

      doc.save(`Reclamo-SIFRAH-${r.code}.pdf`);
    },
  },
};
</script>

<style scoped>
.lr-page {
  --lr-brand: #e91e63;
  --lr-brand-dark: #c2185b;
  --lr-brand-light: #fce4ec;
  --lr-black: #111111;
  --lr-text: #2b2b2b;
  --lr-muted: #6b6b6b;
  --lr-border: #d6d6d6;
  --lr-error: #c62828;
  min-height: 100vh;
  background: #f4f4f5;
  padding: 24px 16px 48px;
  box-sizing: border-box;
  color: var(--lr-text);
  font-family: "Open Sans", Arial, sans-serif;
}
.lr-page *,
.lr-page *::before,
.lr-page *::after {
  box-sizing: border-box;
}
.lr-card {
  max-width: 820px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 28px 22px 32px;
}

/* Encabezado */
.lr-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}
.lr-head__icon {
  width: 72px;
  height: 54px;
  flex-shrink: 0;
  fill: none;
  stroke: var(--lr-brand);
  stroke-width: 3.2;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.lr-head__divider {
  width: 2px;
  align-self: stretch;
  background: var(--lr-brand);
  border-radius: 2px;
}
.lr-head__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--lr-black);
}

.lr-company {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--lr-brand-light);
  border: 1px solid rgba(233, 30, 99, 0.25);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 26px;
}
.lr-company__badge {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(233, 30, 99, 0.12);
  display: grid;
  place-items: center;
}
.lr-company__badge svg {
  width: 34px;
  height: 34px;
  fill: var(--lr-brand);
}
.lr-company__name {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 800;
  color: var(--lr-black);
}
.lr-company__line {
  margin: 2px 0;
  font-size: 15px;
  color: var(--lr-black);
}
.lr-company__addr {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}
.lr-company__addr svg {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  fill: var(--lr-brand);
}

/* Secciones */
.lr-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 0 16px;
  padding: 12px 18px;
  border-radius: 14px;
  background: var(--lr-brand);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.lr-section svg {
  width: 24px;
  height: 24px;
  fill: #fff;
  flex-shrink: 0;
}

.lr-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0 18px;
}

/* Campos */
.lr-field {
  margin-bottom: 16px;
}
.lr-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--lr-black);
}
.req {
  color: var(--lr-brand);
}
.opt {
  font-weight: 400;
  color: var(--lr-muted);
}
.lr-field input[type="text"],
.lr-field select,
.lr-field textarea {
  width: 100%;
  border: 1.5px solid var(--lr-border);
  border-radius: 12px;
  background: #fff;
  padding: 12px 16px;
  font-size: 16px; /* 16px evita el zoom automático en iOS */
  font-family: inherit;
  color: var(--lr-black);
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
  appearance: none;
}
.lr-field select {
  padding-right: 42px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23111' d='M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 22px;
  cursor: pointer;
}
.lr-field select:invalid,
.lr-field select option[value=""] {
  color: var(--lr-muted);
}
.lr-field textarea {
  resize: vertical;
  min-height: 110px;
  line-height: 1.45;
}
.lr-field input::placeholder,
.lr-field textarea::placeholder {
  color: #8a8a8a;
}
.lr-field input:focus,
.lr-field select:focus,
.lr-field textarea:focus {
  outline: none;
  border-color: var(--lr-brand);
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.15);
}
.lr-field input:disabled {
  background: #f4f4f4;
  color: #9a9a9a;
  cursor: not-allowed;
}
.has-error input[type="text"],
.has-error select,
.has-error textarea,
.has-error .lr-money {
  border-color: var(--lr-error);
}
.lr-error {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--lr-error);
}
.lr-help {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--lr-muted);
}
.lr-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.lr-count {
  margin-left: auto;
  margin-top: 6px;
  font-size: 13px;
  color: var(--lr-muted);
  white-space: nowrap;
}

/* Menor de edad */
.lr-minor {
  background: var(--lr-brand-light);
  border-radius: 16px;
  padding: 16px 16px 4px;
  margin: 4px 0 18px;
}
.lr-minor__toggle {
  display: flex !important;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 2px !important;
}
.lr-minor__toggle input {
  width: 20px;
  height: 20px;
  accent-color: var(--lr-brand);
  cursor: pointer;
  flex-shrink: 0;
}
.lr-minor__icon {
  width: 26px;
  height: 26px;
  fill: var(--lr-brand);
  flex-shrink: 0;
}
.lr-minor__title {
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--lr-black);
}
.lr-minor__hint {
  margin: 0 0 10px 30px;
  font-size: 12.5px;
  color: var(--lr-muted);
}
.lr-minor .lr-field label {
  font-weight: 600;
}

/* Monto */
.lr-money {
  display: flex;
  border: 1.5px solid var(--lr-border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.lr-money:focus-within {
  border-color: var(--lr-brand);
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.15);
}
.lr-money__prefix {
  display: grid;
  place-items: center;
  padding: 0 16px;
  background: #eeeeee;
  font-weight: 700;
  color: var(--lr-black);
  border-right: 1.5px solid var(--lr-border);
}
.lr-field .lr-money input[type="text"] {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

/* Reclamo / Queja */
.lr-radios {
  display: grid;
  gap: 12px;
}
.lr-radio {
  position: relative;
  display: flex !important;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 14px;
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 400 !important;
  margin: 0 !important;
  transition: background 0.15s, border-color 0.15s;
}
.lr-radio:hover {
  background: #fafafa;
}
.lr-radio.is-checked {
  border-color: rgba(233, 30, 99, 0.35);
  background: #fff7fa;
}
.lr-radio input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.lr-radio__dot {
  width: 26px;
  height: 26px;
  margin-top: 1px;
  border: 2px solid #8a8a8a;
  border-radius: 50%;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition: border-color 0.15s;
}
.lr-radio.is-checked .lr-radio__dot {
  border-color: var(--lr-brand);
}
.lr-radio.is-checked .lr-radio__dot::after {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--lr-brand);
}
.lr-radio input:focus-visible + .lr-radio__dot {
  box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.25);
}
.lr-radio strong {
  display: block;
  font-size: 16px;
  color: var(--lr-black);
}
.lr-radio small {
  display: block;
  font-size: 14px;
  line-height: 1.4;
  color: var(--lr-muted);
}
.has-error .lr-radios {
  border-radius: 12px;
  outline: 1.5px solid var(--lr-error);
  outline-offset: 2px;
}

/* Envío */
.lr-alert {
  margin: 8px 0 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdecea;
  color: var(--lr-error);
  font-size: 14px;
}
.lr-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 0;
  border-radius: 14px;
  background: var(--lr-brand);
  color: #fff;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
}
.lr-submit:hover:not(:disabled) {
  background: var(--lr-brand-dark);
}
.lr-submit:active:not(:disabled) {
  transform: translateY(1px);
}
.lr-submit:disabled {
  opacity: 0.7;
  cursor: progress;
}
.lr-submit svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}
.lr-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lr-spin 0.8s linear infinite;
}
@keyframes lr-spin {
  to {
    transform: rotate(360deg);
  }
}
.lr-legal {
  margin: 18px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--lr-muted);
  text-align: center;
}

/* Pop-up */
.lr-modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(17, 17, 17, 0.55);
}
.lr-modal__box {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 22px 18px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  animation: lr-pop 0.18s ease-out;
}
@keyframes lr-pop {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.lr-modal__check {
  width: 68px;
  height: 68px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #2e9d48;
  display: grid;
  place-items: center;
}
.lr-modal__check svg {
  width: 40px;
  height: 40px;
  fill: #fff;
}
.lr-modal__title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  color: var(--lr-black);
}
.lr-modal__text {
  margin: 0 0 18px;
  font-size: 15px;
  color: var(--lr-muted);
}
.lr-modal__data {
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--lr-brand-light);
  text-align: left;
}
.lr-modal__data div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
}
.lr-modal__data dt {
  color: var(--lr-muted);
  font-size: 14px;
}
.lr-modal__data dd {
  margin: 0;
  font-weight: 800;
  color: var(--lr-black);
  font-size: 15px;
}
.lr-modal__mail {
  margin: -4px 0 14px;
  font-size: 13px;
  color: var(--lr-muted);
  word-break: break-word;
}
.lr-modal__close {
  margin-top: 8px;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--lr-black);
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border-radius: 12px;
}
.lr-modal__close:hover {
  background: #f4f4f4;
}

/* Pantallas pequeñas */
@media (max-width: 420px) {
  .lr-card {
    padding: 22px 14px 26px;
    border-radius: 16px;
  }
  .lr-head__icon {
    width: 58px;
    height: 44px;
  }
  .lr-head__title {
    font-size: 24px;
  }
  .lr-company {
    padding: 14px;
    gap: 12px;
  }
  .lr-company__badge {
    width: 52px;
    height: 52px;
  }
  .lr-section {
    font-size: 15px;
    padding: 11px 14px;
  }
}

/* Tablet y escritorio: dos columnas */
@media (min-width: 768px) {
  .lr-page {
    padding: 40px 24px 64px;
  }
  .lr-card {
    padding: 40px 44px 44px;
  }
  .lr-head__title {
    font-size: 34px;
  }
  .lr-grid {
    grid-template-columns: 1fr 1fr;
  }
  .lr-field--wide {
    grid-column: 1 / -1;
  }
  .lr-radios {
    grid-template-columns: 1fr 1fr;
  }
  .lr-submit {
    max-width: 420px;
    margin: 8px auto 0;
  }
}
</style>
