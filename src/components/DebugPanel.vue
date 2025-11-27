<template>
  <div v-if="showDebugPanel" class="debug-panel">
    <div class="debug-header">
      <h3>🔧 Panel de Debug</h3>
      <button @click="closePanel" class="close-btn">×</button>
    </div>
    
    <div class="debug-content">
      <div class="debug-section">
        <h4>Estado del Usuario</h4>
        <div class="debug-item">
          <strong>Session:</strong> {{ !!userState.session }}
        </div>
        <div class="debug-item">
          <strong>Affiliated:</strong> 
          <span :class="{ 'status-ok': userState.affiliated, 'status-error': !userState.affiliated }">
            {{ userState.affiliated }}
          </span>
        </div>
        <div class="debug-item">
          <strong>Tree:</strong> 
          <span :class="{ 'status-ok': userState.tree, 'status-error': !userState.tree }">
            {{ userState.tree }}
          </span>
        </div>
        <div class="debug-item">
          <strong>Name:</strong> {{ userState.name || 'null' }}
        </div>
        <div class="debug-item">
          <strong>Plan:</strong> {{ userState.plan || 'null' }}
        </div>
        <div class="debug-item">
          <strong>Country:</strong> {{ userState.country || 'null' }}
        </div>
      </div>
      
      <div class="debug-section">
        <h4>LocalStorage</h4>
        <div class="debug-item">
          <strong>Session:</strong> {{ localStorageData.session ? '✅' : '❌' }}
        </div>
        <div class="debug-item">
          <strong>Affiliated:</strong> {{ localStorageData.affiliated || 'null' }}
        </div>
        <div class="debug-item">
          <strong>Tree:</strong> {{ localStorageData.tree || 'null' }}
        </div>
        <div class="debug-item">
          <strong>Name:</strong> {{ localStorageData.name || 'null' }}
        </div>
      </div>
      
      <div class="debug-section">
        <h4>Acciones</h4>
        <button @click="refreshState" class="debug-btn">🔄 Refrescar Estado</button>
        <button @click="checkAffiliation" class="debug-btn">🔍 Verificar Afiliación</button>
        <button @click="showLocalStorage" class="debug-btn">📦 Ver LocalStorage</button>
        <button @click="forceRestore" class="debug-btn">⚡ Forzar Restauración</button>
      </div>
      
      <div class="debug-section">
        <h4>Ruta Actual</h4>
        <div class="debug-item">
          <strong>Path:</strong> {{ currentRoute }}
        </div>
        <div class="debug-item">
          <strong>Expected:</strong> 
          <span v-if="userState.affiliated" class="status-ok">/dashboard</span>
          <span v-else class="status-error">/affiliation</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Botón flotante para mostrar el panel -->
  <button 
    v-if="!showDebugPanel" 
    @click="showPanel" 
    class="debug-toggle-btn"
    title="Abrir Panel de Debug"
  >
    🔧
  </button>
</template>

<script>
export default {
  name: 'DebugPanel',
  data() {
    return {
      showDebugPanel: false,
      userState: {},
      localStorageData: {},
      currentRoute: ''
    }
  },
  mounted() {
    this.refreshState()
    this.currentRoute = this.$route.path
    
    // Actualizar ruta cuando cambie
    this.$watch(() => this.$route.path, (newPath) => {
      this.currentRoute = newPath
    })
  },
  methods: {
    showPanel() {
      this.showDebugPanel = true
      this.refreshState()
    },
    closePanel() {
      this.showDebugPanel = false
    },
    refreshState() {
      // Obtener estado del store
      this.userState = {
        session: this.$store.state.session,
        affiliated: this.$store.state.affiliated,
        tree: this.$store.state.tree,
        name: this.$store.state.name,
        plan: this.$store.state.plan,
        country: this.$store.state.country
      }
      
      // Obtener datos de localStorage
      this.localStorageData = {
        session: localStorage.getItem('session'),
        affiliated: localStorage.getItem('affiliated'),
        tree: localStorage.getItem('tree'),
        name: localStorage.getItem('name'),
        plan: localStorage.getItem('plan'),
        country: localStorage.getItem('country')
      }
    },
    checkAffiliation() {
      // Verificar estado de afiliación
      const storedAffiliated = localStorage.getItem('affiliated')
      const currentAffiliated = this.$store.state.affiliated
      
      if (storedAffiliated !== null && currentAffiliated !== (storedAffiliated === 'true')) {
        this.$store.commit('SET_AFFILIATED', storedAffiliated === 'true')
        this.refreshState()
        alert('✅ Estado de afiliación restaurado correctamente')
      } else {
        alert('ℹ️ No fue necesario restaurar el estado')
      }
    },
    showLocalStorage() {
      alert('📦 Revisa la consola para ver el contenido de localStorage')
    },
    forceRestore() {
      // Restaurar estado desde localStorage
      this.$store.dispatch('restoreState')
      this.refreshState()
      alert('⚡ Estado restaurado completamente. Revisa la consola para más detalles.')
    }
  }
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 2px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.debug-header {
  background: #333;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px 10px 0 0;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-content {
  padding: 15px;
}

.debug-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 13px;
  font-weight: bold;
}

.debug-item {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.debug-item strong {
  color: #666;
}

.status-ok {
  color: #4CAF50;
  font-weight: bold;
}

.status-error {
  color: #f44336;
  font-weight: bold;
}

.debug-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 12px;
  margin: 2px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background 0.3s;
}

.debug-btn:hover {
  background: #1976D2;
}

.debug-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #333;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  transition: all 0.3s;
}

.debug-toggle-btn:hover {
  background: #555;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .debug-panel {
    width: 90vw;
    right: 5vw;
    left: 5vw;
  }
}
</style>

