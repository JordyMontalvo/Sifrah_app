# Documentación Técnica Avanzada: Sifrah App (Affiliate Ecosystem)

<div style="background: linear-gradient(135deg, #065f46 0%, #10b981 100%); padding: 60px 40px; border-radius: 20px; color: white; text-align: center; margin-bottom: 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <h1 style="font-size: 3.5em; margin: 0; letter-spacing: 2px;">SIFRAH APP</h1>
  <h2 style="font-size: 1.5em; font-weight: 300; margin-top: 10px; opacity: 0.9;">PLATAFORMA INTEGRAL PARA EL AFILIADO</h2>
  <div style="width: 100px; height: 4px; background: #fbbf24; margin: 30px auto;"></div>
  <p style="font-size: 1.2em;">Manual Técnico de Usuario y Herramientas de Negocio</p>
  <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.7;">Versión 1.0 | Marzo 2026</p>
</div>

## 1. Introducción y Propósito

La **Sifrah App** es la interfaz principal para los distribuidores e independientes del ecosistema Sifrah. Está diseñada como una Single Page Application (SPA) para maximizar la velocidad y eficiencia en dispositivos móviles y de escritorio, permitiendo a los usuarios gestionar su red, sus compras y sus herramientas de prospección en un solo lugar.

---

## 2. Arquitectura y Flujos de Control

### 2.1 Stack de Tecnologías
*   **Frontend**: Vue.js 2.6.10.
*   **Estado Global**: Vuex 3.0.1 (Altamente sincronizado con `localStorage`).
*   **Estilos**: Stylus (para una gestión paramétrica de CSS).
*   **Autenticación**: Integración con Google OAuth2 y sistema propio basado en JWT.

### 2.2 Ciclo de Vida del Usuario (Navigation Guards)
El sistema implementa una lógica de protección de rutas robusta basada en el estado del usuario:
1.  **No Autenticado**: Acceso limitado a Login, Registro y la **Tienda Compartida Púbica**.
2.  **Autenticado pero No Afiliado**: Redirección automática al módulo de `/affiliation` para selección de paquete inicial.
3.  **Afiliado pero No Activado**: Acceso al Dashboard pero con restricciones en el cobro de bonos.
4.  **Usuario de Oficina**: Flujo simplificado para gestión interna de sucursales.

---

## 3. Módulos Core: Crecimiento y Finanzas

### 3.1 Onboarding y Afiliación
*   **Registro por Referido**: El sistema captura el código del patrocinador desde la URL (`/register/:code`) para vincular automáticamente el nuevo registro en la genealogía.
*   **Checkout de Activación**: Integración de un carrito especializado para el pago inicial del plan, gestionando puntos de volumen y montos totales en tiempo real.

### 3.2 Gestión de Red y Genealogía
*   **Visualización de Árbol**: Representación gráfica de la red binaria o de niveles (Unilevel).
*   **Directos y Frontales**: Listados detallados con estado de activación y volumen generado por cada referido inmediato.
*   **Dashboard de Bonos**: Seguimiento acumulativo de los diferentes tipos de bonificaciones (Bono de inicio rápido, residuales, etc.).

### 3.3 Monedero Digital (E-Wallet)
*   **Transferencias**: Funcionalidad de envío de saldo entre usuarios (Peer-to-Peer) dentro del ecosistema Sifrah.
*   **Historial de Transacciones**: Auditoría completa de cada movimiento financiero, incluyendo depósitos, retiros y bonos aplicados.

---

## 4. Herramientas de Venta y Prospección

### 4.1 Tienda Compartida (Shared Store)
Este es un módulo crítico de prospección externa:
*   **Public Shop**: El afiliado dispone de una URL única (`/tienda/:userId`) que puede compartir con clientes finales.
*   **Catálogo Personalizado**: Muestra productos con "Precio Socio" y permite al cliente armar un carrito.
*   **Cierre por WhatsApp**: Al finalizar el pedido, el sistema genera automáticamente un mensaje estructurado con el detalle del pedido y lo envía al WhatsApp del afiliado para cerrar la venta.
*   **Banners Dinámicos**: Soporte para banners publicitarios configurables desde el panel administrativo.

### 4.2 Marketing Digital
*   **Flyer Editor**: Herramienta interna para la creación de piezas gráficas personalizadas con los datos del distribuidor.
*   **WhatsApp Link Generator**: Facilita la creación de enlaces directos con mensajes predefinidos para campañas de captación.

---

## 5. Detalles Técnicos de Implementación

### 5.1 Gestión de Estado (Vuex Deep Dive)
El archivo `store.js` maneja persistencia avanzada:
*   **Sincronización**: Cada mutación clave (`SET_AFFILIATED`, `SET_TOKEN`) actualiza el estado reactivo y persiste los datos en `localStorage`.
*   **Restauración**: Al recargar la página, la acción `restoreState` reconstruye el perfil del usuario para evitar cierres de sesión accidentales.

### 5.2 Optimización de Imágenes
Integración con **ImageKit** para el manejo de avatares y catálogos de productos, asegurando tiempos de carga mínimos mediante la transformación dinámica de imágenes según el dispositivo.

---

## 6. Instalación y Despliegue

```bash
# Instalación de dependencias
npm install

# Servidor de desarrollo
npm run serve

# Construcción para producción
npm run build
```

---

<footer style="margin-top: 100px; text-align: center; color: #059669; border-top: 1px solid #d1fae5; padding-top: 30px;">
  <p><b>SIFRAH APP - Ecosistema Digital del Afiliado</b></p>
  <p>© 2026 Reservados todos los derechos. Documento propiedad de Sifrah corp.</p>
</footer>
