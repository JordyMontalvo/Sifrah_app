# Configuración del Backend para Compartir Tienda

## Error de CORS

El error que estás viendo:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/public/shared-store/...' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

Significa que el backend necesita configurar los headers CORS.

## Solución: Configurar CORS en el Backend

### Si usas Express.js:

1. **Instalar el paquete cors:**
```bash
npm install cors
```

2. **Configurar CORS en tu servidor:**

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:8080',  // Frontend en desarrollo
    'http://localhost:3000',  // Si el frontend corre en otro puerto
    'https://tu-dominio.com'  // Tu dominio en producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Tus rutas aquí...
```

### Configuración Manual (sin paquete cors):

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

## Endpoint Requerido

Necesitas crear el siguiente endpoint en tu backend:

### GET /api/public/shared-store/:userId

**Descripción:** Retorna los productos y datos de la tienda del usuario especificado

**⚠️ IMPORTANTE:** Este endpoint debe usar **exactamente la misma lógica** que `/api/app/activation` para obtener productos y banners.

**Parámetros:**
- `userId` (URL param) - Session ID del usuario dueño de la tienda

**Ejemplo de implementación (Express.js):**

```javascript
// routes/public.js
const express = require('express');
const router = express.Router();

// GET /api/public/shared-store/:userId
router.get('/shared-store/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar el usuario por su session ID
    const user = await User.findOne({ session: userId });
    
    if (!user) {
      return res.json({
        error: true,
        msg: 'Usuario no encontrado'
      });
    }
    
    // ⭐ REUTILIZAR LA MISMA LÓGICA DE /api/app/activation
    // Obtener productos - USAR LA MISMA CONSULTA que en activation
    const products = await Product.find({ active: true });
    
    // Obtener banners de activación - USAR LA MISMA CONSULTA que en activation
    const activationBanners = await ActivationBanner.findOne();
    
    // Responder con los datos en el mismo formato que activation
    res.json({
      error: false,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        price_socio: p.price_socio,
        points: p.points,
        img: p.img,
        description: p.description,
        subdescription: p.subdescription,
        type: p.type
      })),
      ownerName: `${user.name} ${user.lastName}`,
      activationBanners: {
        left: activationBanners?.left || '',
        centerTop: activationBanners?.centerTop || '',
        centerBottom: activationBanners?.centerBottom || '',
        right: activationBanners?.right || ''
      }
    });
    
  } catch (error) {
    console.error('Error en /api/public/shared-store:', error);
    res.json({
      error: true,
      msg: 'Error al cargar la tienda'
    });
  }
});

module.exports = router;
```

**💡 Alternativa: Reutilizar código existente**

Si ya tienes una función que obtiene los productos y banners para activation, puedes reutilizarla:

```javascript
// Importar la lógica existente de activation
const { getActivationData } = require('./activation-controller');

router.get('/shared-store/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar el usuario
    const user = await User.findOne({ session: userId });
    
    if (!user) {
      return res.json({
        error: true,
        msg: 'Usuario no encontrado'
      });
    }
    
    // Reutilizar la misma función que usa /api/app/activation
    const activationData = await getActivationData();
    
    // Agregar el nombre del dueño
    res.json({
      error: false,
      products: activationData.products,
      ownerName: `${user.name} ${user.lastName}`,
      activationBanners: activationData.activationBanners
    });
    
  } catch (error) {
    console.error('Error en /api/public/shared-store:', error);
    res.json({
      error: true,
      msg: 'Error al cargar la tienda'
    });
  }
});
```

**Registrar la ruta en tu app principal:**

```javascript
// app.js o server.js
const publicRoutes = require('./routes/public');

app.use('/api/public', publicRoutes);
```

## Respuesta Esperada del Endpoint

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
      "img": "https://url-imagen.com/producto.jpg",
      "description": "Descripción del producto",
      "subdescription": "Subdescripción",
      "type": "Categoría"
    }
  ],
  "ownerName": "Juan Pérez",
  "activationBanners": {
    "left": "https://url-banner.com/left.jpg",
    "centerTop": "https://url-banner.com/center-top.jpg",
    "centerBottom": "https://url-banner.com/center-bottom.jpg",
    "right": "https://url-banner.com/right.jpg"
  }
}
```

## Notas Importantes

1. **Este endpoint debe ser público** - No requiere autenticación
2. **Usar el session ID como userId** - El userId en la URL es el session ID del usuario
3. **Reutilizar lógica existente** - Puedes reutilizar la lógica de `/api/app/activation` para obtener productos
4. **Optimizar consultas** - Considera cachear los productos si son los mismos para todos los usuarios

## Verificación

Para verificar que el endpoint funciona correctamente:

1. **Prueba con curl:**
```bash
curl http://localhost:3000/api/public/shared-store/TU_USER_ID
```

2. **Prueba en el navegador:**
```
http://localhost:3000/api/public/shared-store/TU_USER_ID
```

3. **Verifica los headers CORS:**
```bash
curl -I -X OPTIONS http://localhost:3000/api/public/shared-store/test \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: GET"
```

Deberías ver en la respuesta:
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## Próximos Pasos

1. Implementar el endpoint `/api/public/shared-store/:userId`
2. Configurar CORS en el backend
3. Probar el endpoint
4. Agregar el número de WhatsApp del usuario en la base de datos
5. Actualizar el frontend para usar el número de WhatsApp del usuario

## Soporte

Si tienes problemas, verifica:
- ✅ El servidor backend está corriendo en `http://localhost:3000`
- ✅ CORS está configurado correctamente
- ✅ El endpoint responde correctamente
- ✅ El userId es válido
