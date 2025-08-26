// Script de prueba para el problema de timing en el login
// Ejecutar en la consola del navegador

console.log('=== PRUEBA DE TIMING EN LOGIN ===');

// Función para simular el problema exacto
function simularProblemaTiming() {
  console.log('\n--- SIMULANDO EL PROBLEMA DE TIMING ---');
  
  // Paso 1: Limpiar estado
  console.log('1️⃣  Limpiando estado...');
  store.dispatch('clearState');
  
  // Paso 2: Simular establecimiento parcial del store (como en el login real)
  console.log('2️⃣  Estableciendo session primero...');
  store.commit('SET_SESSION', 'session_test_' + Date.now());
  
  console.log('Estado después de establecer session:');
  console.log('  session:', store.state.session);
  console.log('  affiliated:', store.state.affiliated);
  
  // Paso 3: Simular delay (como en el login real)
  console.log('3️⃣  Simulando delay del API...');
  setTimeout(() => {
    console.log('4️⃣  Estableciendo affiliated ahora...');
    store.commit('SET_AFFILIATED', true);
    
    console.log('Estado después de establecer affiliated:');
    console.log('  session:', store.state.session);
    console.log('  affiliated:', store.state.affiliated);
    
    // Paso 4: Verificar redirección
    console.log('5️⃣  Verificando redirección...');
    const deberiaIrA = store.state.affiliated ? '/dashboard' : '/affiliation';
    console.log(`Debería ir a: ${deberiaIrA}`);
    
    if (deberiaIrA === '/dashboard') {
      console.log('✅ CORRECTO: Usuario afiliado, debería ir a /dashboard');
    } else {
      console.log('❌ INCORRECTO: Usuario afiliado pero va a /affiliation');
    }
  }, 100);
}

// Función para simular la solución
function simularSolucion() {
  console.log('\n--- SIMULANDO LA SOLUCIÓN ---');
  
  // Paso 1: Limpiar estado
  console.log('1️⃣  Limpiando estado...');
  store.dispatch('clearState');
  
  // Paso 2: Establecer todos los valores de una vez
  console.log('2️⃣  Estableciendo todos los valores de una vez...');
  
  const mockData = {
    session: 'session_solucion_' + Date.now(),
    affiliated: true,
    name: 'Usuario Test',
    lastName: 'Apellido Test'
  };
  
  // Establecer todo de una vez
  store.commit('SET_SESSION', mockData.session);
  store.commit('SET_NAME', mockData.name);
  store.commit('SET_LAST_NAME', mockData.lastName);
  store.commit('SET_AFFILIATED', mockData.affiliated);
  
  console.log('Estado después de establecer todo:');
  console.log('  session:', store.state.session);
  console.log('  affiliated:', store.state.affiliated);
  
  // Paso 3: Verificar redirección
  console.log('3️⃣  Verificando redirección...');
  const deberiaIrA = store.state.affiliated ? '/dashboard' : '/affiliation';
  console.log(`Debería ir a: ${deberiaIrA}`);
  
  if (deberiaIrA === '/dashboard') {
    console.log('✅ CORRECTO: Usuario afiliado, debería ir a /dashboard');
  } else {
    console.log('❌ INCORRECTO: Usuario afiliado pero va a /affiliation');
  }
}

// Función para verificar estado actual
function verificarEstadoActual() {
  console.log('\n--- ESTADO ACTUAL DEL SISTEMA ---');
  
  console.log('📊 Store State:');
  console.log('  session:', store.state.session);
  console.log('  affiliated:', store.state.affiliated, `(${typeof store.state.affiliated})`);
  
  console.log('\n💾 LocalStorage:');
  console.log('  session:', localStorage.getItem('session'));
  console.log('  affiliated:', localStorage.getItem('affiliated'), `(${typeof localStorage.getItem('affiliated')})`);
  
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

// Función para probar el flujo completo
function probarFlujoCompleto() {
  console.log('\n--- PROBANDO FLUJO COMPLETO ---');
  
  console.log('\n🔄 Escenario 1: Problema de timing (como antes)');
  simularProblemaTiming();
  
  setTimeout(() => {
    console.log('\n🔄 Escenario 2: Solución implementada');
    simularSolucion();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n🔄 Escenario 3: Verificación final');
    verificarEstadoActual();
  }, 4000);
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('\n=== FUNCIONES DISPONIBLES ===');
  console.log('simularProblemaTiming() - Simular el problema original');
  console.log('simularSolucion() - Simular la solución implementada');
  console.log('verificarEstadoActual() - Verificar estado actual');
  console.log('probarFlujoCompleto() - Probar todos los escenarios');
  console.log('mostrarAyuda() - Mostrar esta ayuda');
  
  console.log('\n=== EJEMPLOS DE USO ===');
  console.log('simularProblemaTiming()     // Ver el problema original');
  console.log('simularSolucion()           // Ver la solución');
  console.log('probarFlujoCompleto()       // Probar todo el flujo');
}

// Ejecutar verificación inicial
console.log('Ejecutando verificación inicial...');
verificarEstadoActual();

// Mostrar ayuda
mostrarAyuda();

console.log('\n=== PRUEBA DE TIMING LISTA ===');
console.log('Usa las funciones anteriores para probar el problema de timing');
