// Script de prueba para verificar la lógica de redirección automática
// Este archivo se puede ejecutar en la consola del navegador para probar la funcionalidad

console.log('=== PRUEBA DE REDIRECCIÓN AUTOMÁTICA ===');

// Función para simular diferentes estados de usuario
function testRedireccion() {
  console.log('\n--- Estado actual del store ---');
  console.log('Session:', store.state.session);
  console.log('Affiliated:', store.state.affiliated);
  console.log('Ruta actual:', router.currentRoute.path);
  
  console.log('\n--- Estado del localStorage ---');
  console.log('Session:', localStorage.getItem('session'));
  console.log('Affiliated:', localStorage.getItem('affiliated'));
  
  console.log('\n--- Verificación de redirección ---');
  
  const session = store.state.session || localStorage.getItem('session');
  const affiliated = store.state.affiliated !== null 
    ? store.state.affiliated 
    : (localStorage.getItem('affiliated') === 'true');
  
  if (!session) {
    console.log('❌ No hay sesión - Debería redirigir a /login');
  } else if (!affiliated) {
    console.log('⚠️  Sesión activa pero NO afiliado - Debería redirigir a /affiliation');
  } else {
    console.log('✅ Sesión activa y afiliado - Debería redirigir a /dashboard');
  }
}

// Función para simular login exitoso
function simularLogin(esAfiliado = false) {
  console.log(`\n--- Simulando login (afiliado: ${esAfiliado}) ---`);
  
  // Simular datos de respuesta del API
  const mockData = {
    session: 'session_' + Date.now(),
    affiliated: esAfiliado,
    name: 'Usuario Test',
    lastName: 'Apellido Test'
  };
  
  // Establecer en el store
  store.commit('SET_SESSION', mockData.session);
  store.commit('SET_AFFILIATED', mockData.affiliated);
  store.commit('SET_NAME', mockData.name);
  store.commit('SET_LAST_NAME', mockData.lastName);
  
  console.log('✅ Estado del store actualizado');
  testRedireccion();
}

// Función para simular logout
function simularLogout() {
  console.log('\n--- Simulando logout ---');
  
  // Limpiar store
  store.dispatch('clearState');
  
  console.log('✅ Estado del store limpiado');
  testRedireccion();
}

// Función para cambiar estado de afiliación
function cambiarAfiliacion(esAfiliado) {
  console.log(`\n--- Cambiando afiliación a: ${esAfiliado} ---`);
  
  store.commit('SET_AFFILIATED', esAfiliado);
  
  console.log('✅ Estado de afiliación cambiado');
  testRedireccion();
}

// Función para navegar a una ruta
function navegarA(ruta) {
  console.log(`\n--- Navegando a: ${ruta} ---`);
  
  router.push(ruta);
  
  setTimeout(() => {
    console.log('✅ Navegación completada');
    testRedireccion();
  }, 100);
}

// Función para mostrar todas las funciones disponibles
function mostrarAyuda() {
  console.log('\n=== FUNCIONES DISPONIBLES ===');
  console.log('testRedireccion() - Ver estado actual');
  console.log('simularLogin(boolean) - Simular login (true=afiliado, false=no afiliado)');
  console.log('simularLogout() - Simular logout');
  console.log('cambiarAfiliacion(boolean) - Cambiar estado de afiliación');
  console.log('navegarA(ruta) - Navegar a una ruta específica');
  console.log('mostrarAyuda() - Mostrar esta ayuda');
  
  console.log('\n=== EJEMPLOS DE USO ===');
  console.log('simularLogin(false)  // Usuario no afiliado');
  console.log('simularLogin(true)   // Usuario afiliado');
  console.log('navegarA("/")        // Ir a raíz');
  console.log('navegarA("/dashboard") // Ir a dashboard');
}

// Ejecutar prueba inicial
console.log('Ejecutando prueba inicial...');
testRedireccion();

// Mostrar ayuda
mostrarAyuda();

console.log('\n=== PRUEBA LISTA ===');
console.log('Usa las funciones anteriores para probar la redirección automática');
