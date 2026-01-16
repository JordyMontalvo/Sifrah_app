# Resumen: Implementación del Backend para Compartir Tienda

## 🎯 Objetivo

Crear un endpoint público que permita a cualquier persona ver la tienda de un usuario sin necesidad de autenticación.

## 📊 Flujo de Datos

```
Usuario Vendedor (ID: abc123)
    ↓
Comparte link: /tienda/abc123
    ↓
Visitante accede al link
    ↓
Frontend llama: GET /api/public/shared-store/abc123
    ↓
Backend busca usuario con session = 'abc123'
    ↓
Backend usa MISMA LÓGICA que /api/app/activation
    ↓
Retorna: productos + banners + nombre del dueño
    ↓
Visitante ve la tienda completa
```

## ⭐ Punto Clave

**El endpoint `/api/public/shared-store/:userId` debe usar EXACTAMENTE la misma lógica que `/api/app/activation`**

### ¿Por qué?

- Los productos son los mismos para todos los usuarios
- Los banners son los mismos para todos los usuarios
- Solo cambia el "dueño" de la tienda compartida
- Evita duplicación de código
- Garantiza consistencia

## 🔧 Implementación Recomendada

### Opción 1: Reutilizar función existente (RECOMENDADO)

```javascript
// Si ya tienes una función que obtiene datos de activation
const { getActivationData } = require('./activation-controller');

router.get('/shared-store/:userId', async (req, res) => {
  const user = await User.findOne({ session: req.params.userId });
  
  if (!user) {
    return res.json({ error: true, msg: 'Usuario no encontrado' });
  }
  
  // Reutilizar la misma función
  const data = await getActivationData();
  
  res.json({
    ...data,
    ownerName: `${user.name} ${user.lastName}`
  });
});
```

### Opción 2: Copiar la lógica

```javascript
router.get('/shared-store/:userId', async (req, res) => {
  const user = await User.findOne({ session: req.params.userId });
  
  if (!user) {
    return res.json({ error: true, msg: 'Usuario no encontrado' });
  }
  
  // Copiar EXACTAMENTE la misma consulta que usa /api/app/activation
  const products = await Product.find({ active: true });
  const banners = await ActivationBanner.findOne();
  
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
      left: banners?.left || '',
      centerTop: banners?.centerTop || '',
      centerBottom: banners?.centerBottom || '',
      right: banners?.right || ''
    }
  });
});
```

## ✅ Checklist de Implementación

- [ ] Configurar CORS en el servidor
- [ ] Crear ruta `/api/public/shared-store/:userId`
- [ ] Reutilizar lógica de `/api/app/activation`
- [ ] Buscar usuario por session ID
- [ ] Retornar productos + banners + ownerName
- [ ] Probar el endpoint con curl o Postman
- [ ] Verificar que el frontend funcione

## 🧪 Pruebas

### 1. Probar con curl

```bash
curl http://localhost:3000/api/public/shared-store/TU_SESSION_ID
```

### 2. Verificar respuesta

Debe retornar:
```json
{
  "error": false,
  "products": [...],
  "ownerName": "Juan Pérez",
  "activationBanners": {...}
}
```

### 3. Verificar CORS

```bash
curl -I -X OPTIONS http://localhost:3000/api/public/shared-store/test \
  -H "Origin: http://localhost:8080"
```

Debe incluir:
```
Access-Control-Allow-Origin: http://localhost:8080
```

## 📝 Notas Importantes

1. **No requiere autenticación** - Es un endpoint público
2. **userId = session ID** - El parámetro es el session del usuario
3. **Mismos datos que activation** - Productos y banners idénticos
4. **Solo agrega ownerName** - Único dato adicional necesario

## 🆘 Problemas Comunes

### Error 404
- Verifica que la ruta esté registrada correctamente
- Verifica que el servidor esté corriendo

### Error CORS
- Configura CORS en el servidor
- Ver `BACKEND_COMPARTIR_TIENDA.md` para detalles

### Usuario no encontrado
- Verifica que el userId sea un session ID válido
- Verifica la consulta a la base de datos

## 📚 Archivos de Referencia

- `BACKEND_COMPARTIR_TIENDA.md` - Guía completa
- `README_COMPARTIR_TIENDA.md` - Documentación general
- `/api/app/activation` - Endpoint de referencia
