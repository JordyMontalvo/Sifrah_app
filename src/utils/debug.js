// Utilidades para debugging en producción
export const debug = {
  // Habilitar/deshabilitar logs
  enabled: process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true',
  
  // Log con timestamp
  log: (message, data = null) => {
    if (debug.enabled) {
      const timestamp = new Date().toISOString();
      if (data) {
        console.log(`[${timestamp}] ${message}`, data);
      } else {
        console.log(`[${timestamp}] ${message}`);
      }
    }
  },
  
  // Log de estado del usuario
  logUserState: (store) => {
    if (debug.enabled) {
      debug.log('Estado actual del usuario:', {
        session: !!store.state.session,
        affiliated: store.state.affiliated,
        name: store.state.name,
        lastName: store.state.lastName,
        email: store.state.email,
        plan: store.state.plan,
        total_points: store.state.total_points,
        tree: store.state.tree,
        activated: store.state.activated,
        _activated: store.state._activated
      });
    }
  },
  
  // Log de localStorage
  logLocalStorage: () => {
    if (debug.enabled) {
      const keys = ['session', 'affiliated', 'name', 'lastName', 'email', 'plan', 'total_points', 'token', 'tree', 'activated', '_activated', 'country', 'address', 'city', 'birthdate'];
      const storage = {};
      keys.forEach(key => {
        storage[key] = localStorage.getItem(key);
      });
      debug.log('Contenido de localStorage:', storage);
    }
  },
  
  // Verificar consistencia entre store y localStorage
  checkConsistency: (store) => {
    if (debug.enabled) {
      const inconsistencies = [];
      
      // Verificar afiliación
      const storedAffiliated = localStorage.getItem('affiliated');
      if (storedAffiliated !== null && store.state.affiliated !== (storedAffiliated === 'true')) {
        inconsistencies.push({
          field: 'affiliated',
          store: store.state.affiliated,
          localStorage: storedAffiliated
        });
      }
      
      // Verificar otros campos importantes
      const fields = ['name', 'lastName', 'email', 'plan', 'total_points'];
      fields.forEach(field => {
        const stored = localStorage.getItem(field);
        if (stored !== null && store.state[field] !== stored) {
          inconsistencies.push({
            field,
            store: store.state[field],
            localStorage: stored
          });
        }
      });
      
      if (inconsistencies.length > 0) {
        debug.log('Inconsistencias detectadas entre store y localStorage:', inconsistencies);
      } else {
        debug.log('Store y localStorage están sincronizados');
      }
      
      return inconsistencies;
    }
    return [];
  },
  
  // Habilitar debugging manualmente
  enable: () => {
    localStorage.setItem('debug', 'true');
    debug.enabled = true;
    debug.log('Debug habilitado manualmente');
  },
  
  // Deshabilitar debugging
  disable: () => {
    localStorage.removeItem('debug');
    debug.enabled = false;
    console.log('Debug deshabilitado');
  }
};

// Función para verificar el estado de afiliación
export const checkAffiliationStatus = (store) => {
  debug.log('Verificando estado de afiliación...');
  
  const storedAffiliated = localStorage.getItem('affiliated');
  const currentAffiliated = store.state.affiliated;
  
  debug.log('Estado almacenado vs actual:', {
    stored: storedAffiliated,
    current: currentAffiliated,
    session: store.state.session
  });
  
  // Si hay sesión pero el estado no coincide, restaurar desde localStorage
  if (store.state.session && storedAffiliated !== null && currentAffiliated !== (storedAffiliated === 'true')) {
    debug.log('Restaurando estado de afiliación desde localStorage');
    store.commit('SET_AFFILIATED', storedAffiliated === 'true');
    return true; // Se restauró
  }
  
  return false; // No se restauró
};

// Función para restaurar todo el estado del usuario
export const restoreUserState = (store) => {
  debug.log('Restaurando estado completo del usuario desde localStorage...');
  
  const fields = [
    'name', 'lastName', 'email', 'photo', 'plan', 'total_points', 
    'token', 'country', 'address', 'city', 'birthdate'
  ];
  
  fields.forEach(field => {
    const value = localStorage.getItem(field);
    if (value !== null) {
      const mutationName = `SET_${field.toUpperCase()}`;
      if (store._mutations[mutationName]) {
        store.commit(mutationName, value);
        debug.log(`Restaurado ${field}:`, value);
      }
    }
  });
  
  // Restaurar campos booleanos
  const booleanFields = ['affiliated', 'tree', 'activated', '_activated'];
  booleanFields.forEach(field => {
    const value = localStorage.getItem(field);
    if (value !== null) {
      const mutationName = `SET_${field.toUpperCase()}`;
      if (store._mutations[mutationName]) {
        store.commit(mutationName, value === 'true');
        debug.log(`Restaurado ${field}:`, value === 'true');
      }
    }
  });
  
  debug.log('Estado del usuario restaurado completamente');
};
