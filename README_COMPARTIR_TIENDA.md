# Funcionalidad de Compartir Tienda

## Descripción General

Se ha implementado una nueva funcionalidad que permite a los usuarios compartir su tienda Sifrah mediante un enlace único. Esta funcionalidad está disponible en el menú de **Herramientas** como una opción separada llamada **"Compartir Tienda"**, ubicada debajo de "Generador de Links de WhatsApp".

## Características Implementadas

### 1. Opción "Compartir Tienda" en el Menú de Herramientas

**Ubicación:** Menú lateral → Herramientas → Compartir Tienda

**Ruta:** `/share-store`

**Funcionalidades:**

- Generación automática de URL única basada en el ID del usuario
- Botón para copiar el link al portapapeles
- Botones de compartir en redes sociales:
  - WhatsApp
  - Facebook
  - Twitter
  - Telegram
  - Email
- Vista previa de la tienda
- Consejos para compartir efectivamente

### 2. Vista Pública de Tienda Compartida

**Ruta:** `/tienda/:userId`

**Características:**

- **Sin autenticación requerida** - Cualquier persona puede acceder
- **Interfaz limpia** - Solo muestra la tienda, sin navegación ni menús
- **Catálogo completo** - Muestra todos los productos disponibles
- **Carrito de compras funcional** - Los visitantes pueden agregar productos
- **Sistema de filtros** - Búsqueda y filtrado por categorías
- **Responsive** - Funciona perfectamente en móviles y desktop
- **Contacto directo** - Botón para contactar al dueño vía WhatsApp con el carrito

### 3. Flujo de Compra

1. El visitante accede al link compartido (`/tienda/:userId`)
2. Navega por el catálogo de productos
3. Agrega productos al carrito
4. Al hacer clic en "Contactar para Comprar", se abre WhatsApp con:
   - Lista de productos seleccionados
   - Cantidades
   - Precios
   - Total

## Archivos Creados/Modificados

### Archivos Nuevos:

1. **`/src/views/app/SharedStore.vue`** - Vista pública de la tienda compartida
2. **`/src/views/app/ShareStore.vue`** - Componente para compartir la tienda

### Archivos Modificados:

1. **`/src/views/app/Tools.vue`** - Agregado sistema de tabs
2. **`/src/router.js`** - Agregada ruta pública `/tienda/:userId`
3. **`/src/api.js`** - Agregada clase `SharedStore` para el endpoint público

## Estructura de Rutas

```javascript
// Ruta pública (sin autenticación)
{
  path: '/tienda/:userId',
  component: SharedStore,
  meta: { requiresNoAuth: false, public: true }
}

// Ruta de herramientas (con autenticación)
{
  path: '/tools',
  component: Tools,
  meta: { requiresAuth: true, requiresAffiliation: true }
}
```

## API Endpoints Requeridos

### Endpoint Público para Tienda Compartida

**Endpoint:** `GET /public/shared-store/:userId`

**Descripción:** Retorna los productos y datos de la tienda del usuario especificado

**Parámetros:**

- `userId` (URL param) - ID del usuario dueño de la tienda

**Respuesta esperada:**

```json
{
  "error": false,
  "products": [
    {
      "id": "product_id",
      "name": "Nombre del Producto",
      "price": 100,
      "price_socio": 80,
      "points": 10,
      "img": "url_imagen",
      "description": "Descripción del producto",
      "subdescription": "Subdescripción",
      "type": "Categoría"
    }
  ],
  "ownerName": "Nombre del Usuario",
  "activationBanners": {
    "left": "url_banner",
    "centerTop": "url_banner",
    "centerBottom": "url_banner",
    "right": "url_banner"
  }
}
```

**Nota:** Este endpoint debe ser público (no requiere autenticación)

**⚠️ IMPORTANTE:** El endpoint debe usar **exactamente la misma lógica** que `/api/app/activation`:
- Misma consulta de productos
- Mismos banners de activación
- Mismo formato de respuesta
- Solo agregar el `ownerName` del usuario

Esto asegura que la tienda compartida muestre exactamente los mismos productos y banners que ve el usuario en su propia vista de activaciones.

## Uso de la Funcionalidad

### Para el Usuario (Vendedor)

1. Ir a **Herramientas** en el menú lateral
2. Hacer clic en **"Compartir Tienda"** (debajo de "Generador de Links de WhatsApp")
3. Copiar el link generado o usar los botones de compartir
4. Compartir el link en redes sociales, WhatsApp, etc.

### Para el Visitante (Comprador)

1. Acceder al link compartido
2. Navegar por los productos
3. Agregar productos al carrito
4. Hacer clic en "Contactar para Comprar"
6. Contactar directamente con el vendedor

## Ventajas de la Implementación

1. **Simplicidad** - Link único y fácil de compartir
2. **Sin fricción** - No requiere registro para ver productos
3. **Conversión directa** - Botón de WhatsApp para contacto inmediato
4. **Personalización** - Cada usuario tiene su propia tienda
5. **Responsive** - Funciona en todos los dispositivos
6. **SEO Friendly** - URLs limpias y descriptivas

## Próximos Pasos Sugeridos

1. **Implementar el endpoint backend** `/public/shared-store/:userId`
2. **Agregar número de WhatsApp** del usuario en la base de datos
3. **Implementar analytics** para trackear visitas a las tiendas compartidas
4. **Agregar QR Code** para compartir la tienda
5. **Personalización adicional** - Permitir al usuario personalizar colores/logo

## Notas Técnicas

- La ruta `/tienda/:userId` es completamente pública
- El router guard permite acceso sin autenticación a rutas marcadas como `public: true`
- Los estilos de la tienda compartida reutilizan los de `Activation.vue`
- El carrito es local (no se persiste en el servidor)
- La comunicación final es vía WhatsApp (no hay checkout en línea)

## Soporte

Para cualquier duda o problema con esta funcionalidad, contactar al equipo de desarrollo.
