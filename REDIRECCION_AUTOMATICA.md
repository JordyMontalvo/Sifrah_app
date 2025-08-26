# Sistema de Redirección Automática - Sifrah App

## Descripción

Este documento describe la implementación del sistema de redirección automática que se encarga de dirigir a los usuarios a las vistas correctas según su estado de autenticación y afiliación.

## Funcionamiento

### 1. Inicialización de la Aplicación

- **main.js**: Restaura el estado del store desde localStorage antes de crear la instancia de Vue
- **AppInitializer.vue**: Componente que verifica el estado del usuario y redirige automáticamente
- **Router Guard**: Protege las rutas y maneja redirecciones adicionales

### 2. Flujo de Redirección

#### Usuario NO Autenticado:
- Se redirige a `/login`
- Puede acceder a: `/welcome`, `/register`, `/remember`, `/reset-password`

#### Usuario Autenticado pero NO Afiliado:
- Se redirige automáticamente a `/affiliation`
- Puede acceder a: `/profile`, `/password`, `/security`

#### Usuario Autenticado y Afiliado:
- Se redirige automáticamente a `/dashboard`
- Puede acceder a todas las rutas protegidas

### 3. Componentes Clave

#### AppInitializer.vue
- Se ejecuta al cargar la aplicación
- Verifica el estado del usuario
- Maneja redirecciones automáticas
- Incluye un indicador de carga durante la inicialización

#### Router Guard (router.js)
- Protege rutas según meta tags
- Maneja redirecciones de seguridad
- Verifica permisos de afiliación

#### Store (store.js)
- Mantiene el estado de la aplicación
- Sincroniza con localStorage
- Acción `restoreState` para restaurar estado al cargar

## Estructura de Archivos Modificados

```
src/
├── main.js                 # Inicialización asíncrona del store
├── App.vue                 # Wrapper con AppInitializer
├── router.js              # Guard de navegación mejorado
├── store.js               # Acción restoreState asíncrona
└── components/
    └── AppInitializer.vue # Componente de inicialización
```

## Logs de Debug

El sistema incluye logs detallados para facilitar el debugging:

- **AppInitializer**: Logs de inicialización y redirección
- **Router Guard**: Logs de navegación y permisos
- **Store**: Logs de restauración de estado

## Casos de Uso

### 1. Usuario que se loguea por primera vez
1. Se autentica exitosamente
2. Se establece `affiliated: false` en el store
3. Se redirige automáticamente a `/affiliation`

### 2. Usuario que ya está afiliado
1. Se autentica exitosamente
2. Se establece `affiliated: true` en el store
3. Se redirige automáticamente a `/dashboard`

### 3. Usuario que recarga la página
1. Se restaura el estado desde localStorage
2. Se verifica el estado de afiliación
3. Se redirige según corresponda

### 4. Usuario que cambia de ruta manualmente
1. Se detecta el cambio de ruta
2. Se verifica si tiene permisos para la nueva ruta
3. Se redirige si es necesario

## Configuración

### Meta Tags de Rutas

```javascript
{
  path: '/dashboard',
  component: Dashboard,
  meta: { 
    requiresAuth: true,        // Requiere autenticación
    requiresAffiliation: true  // Requiere afiliación
  }
}
```

### Estados del Store

```javascript
state: {
  session: null,      // ID de sesión
  affiliated: null,   // Estado de afiliación (boolean)
  // ... otros campos
}
```

## Troubleshooting

### Problemas Comunes

1. **Redirección infinita**: Verificar que no haya loops en la lógica de redirección
2. **Estado no sincronizado**: Verificar que `restoreState` se ejecute correctamente
3. **Permisos incorrectos**: Verificar los meta tags de las rutas

### Debug

1. Abrir consola del navegador
2. Verificar logs de AppInitializer
3. Verificar logs del Router Guard
4. Verificar estado del store en Vue DevTools

## Mejoras Futuras

- [ ] Cache de estado de afiliación
- [ ] Redirección inteligente según historial
- [ ] Manejo de roles y permisos más granular
- [ ] Tests automatizados para flujos de redirección
