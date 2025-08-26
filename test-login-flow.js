// Script de prueba para el flujo de login y redirección
// Ejecutar en la consola del navegador

console.log('=== PRUEBA DE FLUJO DE LOGIN Y REDIRECCIÓN ===');

// Función para simular el flujo completo de login
function simularLoginCompleto(esAfiliado = true) {
  console.log(`\n--- SIMULANDO LOGIN COMPLETO (afiliado: ${esAfiliado}) ---`);
  
  // Paso 1: Simular respuesta del API
  const mockData = {
    session: 'session_' + Date.now(),
    affiliated: esAfiliado,
    name: 'Usuario Test',
    lastName: 'Apellido Test',
    plan: esAfiliado ? 'master' : null
  };
  
  console.log('📡 Datos del API:', mockData);
  
  // Paso 2: Establecer en el store (simulando Login.vue)
  console.log('\n🔧 Estableciendo estado en el store...');
  
  store.commit('SET_SESSION', mockData.session);
  store.commit('SET_NAME', mockData.name);
  store.commit('SET_LAST_NAME', mockData.lastName);
  store.commit('SET_PLAN', mockData.plan);
  
  // Importante: Establecer affiliated al final
  store.commit('SET_AFFILIATED', mockData.affiliated);
  
  console.log('✅ Estado del store establecido');
  
  // Paso 3: Verificar estado
  console.log('\n🔍 Verificando estado después del login...');
  mostrarEstadoCompleto();
  
  // Paso 4: Simular redirección
  console.log('\n🛣️  Simulando redirección...');
  const rutaDestino = esAfiliado ? '/dashboard' : '/affiliation';
  console.log(`Debería redirigir a: ${rutaDestino}`);
  
  // Simular navegación
  setTimeout(() => {
    console.log('\n📱 Navegando a la ruta...');
    router.push(rutaDestino);
    
    setTimeout(() => {
      console.log('\n✅ Navegación completada');
      mostrarEstadoCompleto();
    }, 200);
  }, 100);
}

// Función para verificar el estado del sistema
function verificarEstadoSistema() {
  console.log('\n--- VERIFICACIÓN DEL ESTADO DEL SISTEMA ---');
  
  const session = store.state.session || localStorage.getItem('session');
  const affiliated = store.state.affiliated !== null && store.state.affiliated !== undefined 
    ? store.state.affiliated 
    : (localStorage.getItem('affiliated') === 'true');
  
  console.log('📊 Estado actual:');
  console.log('  ✅ Sesión:', !!session);
  console.log('  ✅ Afiliado:', affiliated);
  console.log('  ✅ Ruta actual:', router.currentRoute.path);
  
  console.log('\n🔍 Análisis de redirección:');
  if (!session) {
    console.log('  ❌ No hay sesión → Debería ir a /login');
  } else if (!affiliated) {
    console.log('  ⚠️  Sesión activa pero NO afiliado → Debería ir a /affiliation');
  } else {
    console.log('  ✅ Sesión activa y afiliado → Debería ir a /dashboard');
  }
  
  console.log('\n🛣️  Ruta actual vs. Ruta esperada:');
  const rutaEsperada = !session ? '/login' : !affiliated ? '/affiliation' : '/dashboard';
  const rutaActual = router.currentRoute.path;
  
  if (rutaActual === rutaEsperada) {
    console.log(`  ✅ Correcto: Estás en ${rutaActual}`);
  } else {
    console.log(`  ❌ Incorrecto: Estás en ${rutaActual}, deberías estar en ${rutaEsperada}`);
  }
}

// Función para probar diferentes escenarios
function probarEscenarios() {
  console.log('\n--- PROBANDO DIFERENTES ESCENARIOS ---');
  
  console.log('\n1️⃣  Escenario: Usuario NO afiliado');
  simularLoginCompleto(false);
  
  setTimeout(() => {
    console.log('\n2️⃣  Escenario: Usuario SÍ afiliado');
    simularLoginCompleto(true);
  }, 3000);
  
  setTimeout(() => {
    console.log('\n3️⃣  Escenario: Limpiar estado');
    store.dispatch('clearState');
    verificarEstadoSistema();
  }, 6000);
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('\n=== FUNCIONES DISPONIBLES ===');
  console.log('simularLoginCompleto(boolean) - Simular login completo');
  console.log('verificarEstadoSistema() - Verificar estado del sistema');
  console.log('probarEscenarios() - Probar todos los escenarios');
  console.log('mostrarAyuda() - Mostrar esta ayuda');
  
  console.log('\n=== EJEMPLOS DE USO ===');
  console.log('simularLoginCompleto(false)  // Usuario no afiliado');
  console.log('simularLoginCompleto(true)   // Usuario afiliado');
  console.log('verificarEstadoSistema()     // Verificar estado actual');
  console.log('probarEscenarios()           // Probar todos los escenarios');
}

// Función para mostrar estado completo (reutilizada del script anterior)
function mostrarEstadoCompleto() {
  console.log('\n--- ESTADO COMPLETO DEL SISTEMA ---');
  
  console.log('\n📊 Store State:');
  console.log('  session:', store.state.session);
  console.log('  affiliated:', store.state.affiliated, `(${typeof store.state.affiliated})`);
  console.log('  name:', store.state.name);
  console.log('  lastName:', store.state.lastName);
  console.log('  plan:', store.state.plan);
  
  console.log('\n💾 LocalStorage:');
  console.log('  session:', localStorage.getItem('session'));
  console.log('  affiliated:', localStorage.getItem('affiliated'), `(${typeof localStorage.getItem('affiliated')})`);
  console.log('  name:', localStorage.getItem('name'));
  console.log('  lastName:', localStorage.getItem('lastName'));
  console.log('  plan:', localStorage.getItem('plan'));
  
  console.log('\n🛣️  Router:');
  console.log('  Ruta actual:', router.currentRoute.path);
  
  console.log('\n🔍 Análisis:');
  const session = store.state.session || localStorage.getItem('session');
  const affiliated = store.state.affiliated !== null && store.state.affiliated !== undefined 
    ? store.state.affiliated 
    : (localStorage.getItem('affiliated') === 'true');
  
  console.log('  ¿Hay sesión?', !!session);
  console.log('  ¿Está afiliado?', affiliated);
  console.log('  ¿Debería redirigir?', session && affiliated ? 'A /dashboard' : session ? 'A /affiliation' : 'A /login');
}

// Ejecutar verificación inicial
console.log('Ejecutando verificación inicial...');
verificarEstadoSistema();

// Mostrar ayuda
mostrarAyuda();

console.log('\n=== PRUEBA DE FLUJO LISTA ===');
console.log('Usa las funciones anteriores para probar el flujo de login y redirección');
