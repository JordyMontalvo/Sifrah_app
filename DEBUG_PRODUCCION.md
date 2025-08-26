# 🔧 Debugging en Producción - Sifrah MLM

## Problema Identificado
En producción, después del login, el estado de afiliación no se restaura correctamente, causando que los usuarios afiliados no puedan acceder al dashboard.

## Solución Implementada

### 1. **Restauración Automática del Estado**
- Se implementó restauración automática del estado desde localStorage
- Se agregaron logs de debugging para monitorear el proceso
- Se implementó verificación de consistencia entre store y localStorage

### 2. **Utilidades de Debugging**
Se creó un sistema de debugging que funciona tanto en desarrollo como en producción:

#### Comandos Disponibles en Consola del Navegador:

```javascript
// Habilitar debugging
window.enableDebug()

// Ver estado actual del usuario
window.showUserState()

// Ver contenido de localStorage
window.showLocalStorage()

// Verificar estado de afiliación
window.checkAffiliation()
```

### 3. **Cómo Usar en Producción**

#### Paso 1: Abrir Consola del Navegador
- Presionar `F12` o `Ctrl+Shift+I`
- Ir a la pestaña "Console"

#### Paso 2: Habilitar Debug
```javascript
window.enableDebug()
```

#### Paso 3: Verificar Estado
```javascript
// Ver estado completo
window.showUserState()

// Ver localStorage
window.showLocalStorage()

// Verificar afiliación
window.checkAffiliation()
```

### 4. **Logs Automáticos**
El sistema ahora genera logs automáticos que incluyen:
- ✅ Estado de afiliación
- ✅ Restauración desde localStorage
- ✅ Inconsistencias detectadas
- ✅ Timestamps para seguimiento

### 5. **Verificación de Estado**

#### Estado Normal (Usuario Afiliado):
```javascript
{
  session: true,
  affiliated: true,
  name: "Juan",
  lastName: "Pérez",
  email: "juan@email.com",
  plan: "Premium",
  total_points: 1500,
  tree: true
}
```

#### Estado Problemático:
```javascript
{
  session: true,
  affiliated: null,  // ❌ PROBLEMA: Debería ser true
  name: null,        // ❌ PROBLEMA: Debería tener valor
  // ... otros campos null
}
```

### 6. **Solución de Problemas Comunes**

#### Problema: `affiliated: null` después del login
**Solución:**
```javascript
// Verificar localStorage
window.showLocalStorage()

// Si hay datos en localStorage pero no en store, restaurar
window.checkAffiliation()
```

#### Problema: Usuario no redirige al dashboard
**Solución:**
```javascript
// Verificar estado completo
window.showUserState()

// Verificar ruta actual
console.log('Ruta actual:', window.location.pathname)

// Verificar router
console.log('Router state:', this.$router.currentRoute)
```

### 7. **Monitoreo Continuo**

Para monitorear en tiempo real:
```javascript
// Verificar cada 5 segundos
setInterval(() => {
  window.showUserState()
}, 5000)
```

### 8. **Comandos de Emergencia**

Si el sistema no responde:
```javascript
// Forzar restauración completa
localStorage.clear()
location.reload()

// O verificar sesión específica
console.log('Session:', localStorage.getItem('session'))
console.log('Affiliated:', localStorage.getItem('affiliated'))
```

## Estructura de Archivos Modificados

- ✅ `app/src/App.vue` - Restauración automática del estado
- ✅ `app/src/store.js` - Persistencia en localStorage
- ✅ `app/src/utils/debug.js` - Utilidades de debugging
- ✅ `app/src/views/layouts/App.vue` - Verificación de estado
- ✅ `app/src/main.js` - Limpieza completa en logout

## Verificación de Funcionamiento

1. **Login exitoso** → Estado se guarda en localStorage
2. **Recarga de página** → Estado se restaura automáticamente
3. **Navegación** → Usuario afiliado va al dashboard
4. **Logout** → localStorage se limpia completamente

## Notas Importantes

- 🔍 **Debug siempre disponible**: `window.enableDebug()` funciona en producción
- 📱 **Responsive**: Funciona en móvil y desktop
- 🚀 **Performance**: No afecta el rendimiento en producción
- 🔒 **Seguridad**: Solo expone información de debugging, no datos sensibles

## Contacto para Soporte

Si persisten los problemas, proporcionar:
1. Logs de la consola del navegador
2. Estado del usuario (`window.showUserState()`)
3. Contenido de localStorage (`window.showLocalStorage()`)
4. Pasos para reproducir el problema
