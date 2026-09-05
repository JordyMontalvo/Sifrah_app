<template>
  <LegalLayout
    title="Términos y condiciones"
    other-to="/privacidad"
    other-label="Ver política de privacidad →"
  >
    <p>
      Estos términos regulan el uso de la plataforma SIFRAH (sitio web y aplicación),
      incluyendo registro, afiliación, compras, red, retiros y servicios asociados.
      Al crear una cuenta o marcar “Acepto”, confirmas que leíste y aceptas este documento.
    </p>

    <h2>1. Quién puede usar SIFRAH</h2>
    <p>
      Debes proporcionar datos verídicos (nombre, DNI, correo, celular y demás datos
      de perfil). El uso de la plataforma implica cumplir las reglas de conducta,
      pagos y red de SIFRAH.
    </p>

    <h2>2. Tu cuenta</h2>
    <ul>
      <li>Eres responsable de tu contraseña y del uso de tu sesión.</li>
      <li>El código de patrocinador identifica a quien te invita a la red.</li>
      <li>SIFRAH puede pedir verificación adicional de identidad cuando sea necesario.</li>
    </ul>

    <h2>3. Compras, afiliación y pagos</h2>
    <p>
      Los pedidos, paquetes de afiliación y canjes se procesan según el método de pago
      que elijas (saldo, transferencia, pago en oficina, tarjeta u otros habilitados).
      Los montos, puntos y estados del pedido se muestran en tu cuenta. Un pago no
      se considera confirmado hasta que SIFRAH o el procesador lo validen.
    </p>

    <h2>4. Retiros y transferencias de saldo</h2>
    <p>
      Solo puedes retirar o transferir el saldo disponible. El Bono Ahorro y otros
      saldos restringidos no se mezclan con el retiro. SIFRAH puede pedir datos
      bancarios, Yape o Plin para entregar el dinero y rechazar solicitudes incompletas
      o que superen el disponible.
    </p>

    <h2>5. Red y contenidos</h2>
    <p>
      La información de tu red, comisiones y materiales se muestra para gestionar tu
      actividad en SIFRAH. No está permitido usar la plataforma para fraude, spam o
      suplantación de identidad.
    </p>

    <h2>6. Limitación</h2>
    <p>
      SIFRAH procura que el servicio esté disponible, pero puede haber mantenimientos,
      cortes o demoras de terceros (bancos, pasarelas, mensajería). El contenido de
      estos términos puede actualizarse; la versión vigente es la publicada en esta página.
    </p>

    <h2>7. Contacto</h2>
    <p>
      Si tienes dudas sobre estos términos, escríbenos por los canales de soporte
      de SIFRAH publicados en la aplicación.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from "./LegalLayout.vue";

export default {
  name: "Terms",
  components: { LegalLayout },
};
</script>
