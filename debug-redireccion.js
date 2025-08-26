// Script de debug para el problema de redirección automática
// Ejecutar en la consola del navegador después de hacer login

console.log('=== DEBUG DE REDIRECCIÓN AUTOMÁTICA ===');

// Función para mostrar el estado completo
function mostrarEstadoCompleto() {
  console.log('\n--- ESTADO COMPLETO DEL SISTEMA ---');
  
  console.log('\n📊 Store State:');
  console.log('  session:', store.state.session);
  console.log('  affiliated:', store.state.affiliated, `(${typeof store.state.affiliated})`);
  console.log('  office_id:', store.state.office_id);
  
  console.log('\n💾 LocalStorage:');
  console.log('  session:', localStorage.getItem('session'));
  console.log('  affiliated:', localStorage.getItem('affiliated'), `(${typeof localStorage.getItem('affiliated')})`);
  console.log('  office_id:', localStorage.getItem('office_id'));
  
  console.log('\n🛣️  Router:');
  console.log('  Ruta actual:', router.currentRoute.path);
  console.log('  Ruta anterior:', router.currentRoute.name || 'N/A');
  
  console.log('\n🔍 Análisis:');
  const session = store.state.session || localStorage.getItem('session');
  const affiliated = store.state.affiliated !== null && store.state.affiliated !== undefined 
    ? store.state.affiliated 
    : (localStorage.getItem('affiliated') === 'true');
  
  console.log('  ¿Hay sesión?', !!session);
  console.log('  ¿Está afiliado?', affiliated);
  console.log('  ¿Debería redirigir?', session && affiliated ? 'A /dashboard' : session ? 'A /affiliation' : 'A /login');
}

// Función para forzar sincronización
function forzarSincronizacion() {
  console.log('\n--- FORZANDO SINCRONIZACIÓN ---');
  
  const localAffiliated = localStorage.getItem('affiliated');
  if (localAffiliated !== null) {
    const affiliatedValue = localAffiliated === 'true';
    store.commit('SET_AFFILIATED', affiliatedValue);
    console.log('✅ Estado de afiliación sincronizado:', affiliatedValue);
  } else {
    console.log('⚠️  No hay estado de afiliación en localStorage');
  }
  
  mostrarEstadoCompleto();
}

// Función para simular cambio de afiliación
function cambiarAfiliacion(esAfiliado) {
  console.log(`\n--- CAMBIANDO AFILIACIÓN A: ${esAfiliado} ---`);
  
  store.commit('SET_AFFILIATED', esAfiliado);
  
  console.log('✅ Estado cambiado, verificando...');
  setTimeout(() => {
    mostrarEstadoCompleto();
  }, 100);
}

// Función para limpiar y reiniciar
function limpiarYReiniciar() {
  console.log('\n--- LIMPIANDO Y REINICIANDO ---');
  
  store.dispatch('clearState');
  localStorage.clear();
  
  console.log('✅ Estado limpiado');
  mostrarEstadoCompleto();
}

// Función para verificar logs del router
function verificarLogsRouter() {
  console.log('\n--- VERIFICANDO LOGS DEL ROUTER ---');
  console.log('Revisa la consola para ver los logs del Router Guard');
  console.log('Deberías ver algo como: "Router Guard: { to: "/affiliation", ... }"');
}

// Función para verificar logs del AppInitializer
function verificarLogsAppInitializer() {
  console.log('\n--- VERIFICANDO LOGS DEL APP INITIALIZER ---');
  console.log('Revisa la consola para ver los logs del AppInitializer');
  console.log('Deberías ver algo como: "AppInitializer: Estado de afiliación: ..."');
}

// Función para navegar y ver qué pasa
function navegarYVerificar(ruta) {
  console.log(`\n--- NAVEGANDO A: ${ruta} ---`);
  
  router.push(ruta);
  
  setTimeout(() => {
    console.log('✅ Navegación completada');
    mostrarEstadoCompleto();
  }, 200);
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('\n=== FUNCIONES DISPONIBLES ===');
  console.log('mostrarEstadoCompleto() - Mostrar estado completo del sistema');
  console.log('forzarSincronizacion() - Forzar sincronización del estado');
  console.log('cambiarAfiliacion(boolean) - Cambiar estado de afiliación');
  console.log('limpiarYReiniciar() - Limpiar todo el estado');
  console.log('verificarLogsRouter() - Verificar logs del router');
  console.log('verificarLogsAppInitializer() - Verificar logs del AppInitializer');
  console.log('navegarYVerificar(ruta) - Navegar y verificar estado');
  console.log('mostrarAyuda() - Mostrar esta ayuda');
  
  console.log('\n=== EJEMPLOS DE USO ===');
  console.log('mostrarEstadoCompleto()           // Ver estado actual');
  console.log('forzarSincronizacion()           // Sincronizar estado');
  console.log('cambiarAfiliacion(true)          // Hacer afiliado');
  console.log('cambiarAfiliacion(false)         // Quitar afiliación');
  console.log('navegarYVerificar("/dashboard")  // Ir a dashboard y verificar');
}

// Ejecutar verificación inicial
console.log('Ejecutando verificación inicial...');
mostrarEstadoCompleto();

// Mostrar ayuda
mostrarAyuda();

console.log('\n=== DEBUG LISTO ===');
console.log('Usa las funciones anteriores para diagnosticar el problema de redirección');
