<template>
  <LegalLayout
    title="Política de privacidad"
    other-to="/terminos"
    other-label="Ver términos y condiciones →"
    :updated="updated"
  >
    <div v-if="html" class="legal-html" v-html="html"></div>
    <div v-else>
    <p>
      Esta política explica qué datos personales trata SIFRAH, para qué los usa y
      cómo puedes ejercer tus derechos. Aplica al sitio web y a la aplicación.
    </p>

    <h2>1. Datos que recopilamos</h2>
    <ul>
      <li>Identidad: nombre, apellido, DNI, fecha de nacimiento, foto de perfil.</li>
      <li>Contacto: correo, celular, país, ciudad y dirección.</li>
      <li>Cuenta: código de invitación, contraseña (almacenada de forma segura) y sesión.</li>
      <li>Pagos y retiros: banco, tipo de cuenta, número, CCI, titular, Yape, Plin y comprobantes que subas.</li>
      <li>Actividad: pedidos, afiliación, red, comisiones, retiros y mensajes de soporte.</li>
    </ul>

    <h2>2. Para qué los usamos</h2>
    <p>
      Crear y mantener tu cuenta, procesar compras y pagos, pagar retiros, mostrar tu
      red, enviarte avisos del servicio (por ejemplo, recuperar contraseña) y cumplir
      obligaciones legales o de seguridad.
    </p>

    <h2>3. Con quién se comparten</h2>
    <p>
      No vendemos tus datos. Podemos compartirlos con procesadores de pago, hosting,
      envío de correos y con tu red solo en la medida necesaria para el funcionamiento
      de SIFRAH (por ejemplo, tu nombre visible para tu patrocinador). También si una
      autoridad competente lo requiere.
    </p>

    <h2>4. Conservación y seguridad</h2>
    <p>
      Conservamos los datos mientras tu cuenta esté activa y el tiempo adicional que
      exija la ley. Aplicamos medidas técnicas razonables; ningún sistema es 100 %
      invulnerable, así que también debes cuidar tu contraseña.
    </p>

    <h2>5. Tus derechos</h2>
    <p>
      Puedes acceder, rectificar o actualizar varios datos desde Mi perfil. Para
      eliminar la cuenta u otras solicitudes sobre tus datos, contacta a soporte SIFRAH.
      En Perú, estos derechos se ejercen conforme a la Ley N.° 29733 de Protección
      de Datos Personales.
    </p>

    <h2>6. Menores</h2>
    <p>
      El registro de menores o extranjeros sigue las reglas del formulario de alta.
      Quien registra declara que la información es veraz y que cuenta con autorización
      cuando corresponda.
    </p>

    <h2>7. Contacto</h2>
    <p>
      Para preguntas sobre privacidad, usa el soporte de SIFRAH dentro de la app o
      los canales oficiales publicados en la plataforma.
    </p>
    </div>
  </LegalLayout>
</template>

<script>
import LegalLayout from "./LegalLayout.vue";
import api from "@/api";

function formatLegalDate(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "5 de septiembre de 2026";
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return date.getDate() + " de " + months[date.getMonth()] + " de " + date.getFullYear();
}

export default {
  name: "Privacy",
  components: { LegalLayout },
  data() {
    return { html: "", updated: "5 de septiembre de 2026" };
  },
  async created() {
    try {
      const { data } = await api.Legal.GET("privacy");
      const doc = data && data.document;
      if (!doc || !doc.html) return;
      this.html = doc.html;
      if (doc.updatedAt) this.updated = formatLegalDate(doc.updatedAt);
    } catch (e) {}
  },
};
</script>
