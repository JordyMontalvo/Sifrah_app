<template>
  <div v-if="!initialized" class="app-initializer">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Inicializando aplicación...</p>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AppInitializer',
  data() {
    return {
      initialized: false
    }
  },
  async created() {
    try {
      console.log('AppInitializer: Iniciando verificación de estado...');
      
      // Esperar un poco para que el router se inicialice completamente
      await this.$nextTick();
      
      // Verificar si hay una sesión activa
      const session = this.$store.state.session || localStorage.getItem('session');
      
      if (session) {
        console.log('AppInitializer: Sesión encontrada, verificando estado de afiliación...');
        
        // Verificar estado de afiliación con mejor sincronización
        let affiliated = null;
        if (this.$store.state.affiliated !== null && this.$store.state.affiliated !== undefined) {
          affiliated = this.$store.state.affiliated;
        } else {
          const localAffiliated = localStorage.getItem('affiliated');
          affiliated = localAffiliated === 'true';
          // Sincronizar el store si no está definido
          if (affiliated !== null) {
            this.$store.commit('SET_AFFILIATED', affiliated);
            console.log('AppInitializer: Estado de afiliación sincronizado desde localStorage:', affiliated);
          }
        }
        
        console.log('AppInitializer: Estado de afiliación:', affiliated);
        console.log('AppInitializer: Ruta actual:', this.$route.path);
        console.log('AppInitializer: Store state:', {
          session: this.$store.state.session,
          affiliated: this.$store.state.affiliated
        });
        console.log('AppInitializer: localStorage:', {
          session: localStorage.getItem('session'),
          affiliated: localStorage.getItem('affiliated')
        });
        
        // Permitir acceso a registro con código de referido incluso con sesión activa
        if (this.$route.path.startsWith('/register/')) {
          console.log('AppInitializer: Permitiendo acceso a registro con código de referido a pesar de sesión activa');
          // No redirigir
        }
        // Solo redirigir si es necesario y no estamos ya en la ruta correcta
        else if (!affiliated && this.$route.path !== '/affiliation' && this.$route.path !== '/profile' && this.$route.path !== '/password' && this.$route.path !== '/security') {
          console.log('AppInitializer: Usuario no afiliado, redirigiendo a affiliation...');
          this.$router.push('/affiliation');
        }
        // Si está afiliado y está en la página de afiliación, redirigir al dashboard
        else if (affiliated && this.$route.path === '/affiliation') {
          console.log('AppInitializer: Usuario afiliado, redirigiendo a dashboard...');
          this.$router.push('/dashboard');
        }
        // Si está afiliado y está en la raíz, redirigir al dashboard
        else if (affiliated && this.$route.path === '/') {
          console.log('AppInitializer: Usuario afiliado en raíz, redirigiendo a dashboard...');
          this.$router.push('/dashboard');
        }
      } else {
        console.log('AppInitializer: No hay sesión activa');
        
        // Si no hay sesión y no está en login, redirigir a login
        if (this.$route.path !== '/login' && this.$route.path !== '/welcome' && this.$route.path !== '/register' && this.$route.path !== '/remember' && this.$route.path !== '/reset-password') {
          console.log('AppInitializer: No hay sesión, redirigiendo a login...');
          this.$router.push('/login');
        }
      }
      
      this.initialized = true;
      console.log('AppInitializer: Inicialización completada');
      
    } catch (error) {
      console.error('AppInitializer: Error durante la inicialización:', error);
      this.initialized = true; // Continuar aunque haya error
    }
  },
  
  // También verificar cuando cambie la ruta
  watch: {
    '$route'(to, from) {
      console.log('AppInitializer: Ruta cambiada de', from.path, 'a', to.path);
      
      // Solo verificar si ya está inicializado
      if (this.initialized) {
        this.checkAndRedirect();
      }
    }
  },
  
  methods: {
    checkAndRedirect() {
      const session = this.$store.state.session || localStorage.getItem('session');
      
      if (session) {
        const affiliated = this.$store.state.affiliated !== null 
          ? this.$store.state.affiliated 
          : (localStorage.getItem('affiliated') === 'true');
        
        // Permitir acceso a registro con código de referido incluso con sesión activa
        if (this.$route.path.startsWith('/register/')) {
          console.log('AppInitializer: Permitiendo acceso a registro con código de referido a pesar de sesión activa');
          // No redirigir
          return;
        }
        
        // Si no está afiliado y no está en una ruta permitida
        if (!affiliated && this.$route.path !== '/affiliation' && this.$route.path !== '/profile' && this.$route.path !== '/password' && this.$route.path !== '/security') {
          console.log('AppInitializer: Redirección por cambio de ruta - usuario no afiliado');
          this.$router.push('/affiliation');
        }
        // IMPORTANTE: NO redirigir usuarios afiliados desde afiliación
        // Ellos pueden querer acceder para hacer upgrade o ver historial
      }
    }
  }
}
</script>

<style scoped>
.app-initializer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-container p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
