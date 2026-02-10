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
import api from "@/api";

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
        console.log('AppInitializer: Sesión encontrada, verificando estado en servidor...');
        
        let affiliated = null;
        
        try {
          // Obtener datos frescos del servidor
          const { data } = await api.Afiliation.GET(session);
          
          if (data && !data.error) {
            console.log('AppInitializer: Datos de usuario actualizados desde servidor');
            
            // Actualizar store con datos frescos
            const userInfo = data;
            
            if (userInfo.name) this.$store.commit("SET_NAME", userInfo.name);
            if (userInfo.lastName) this.$store.commit("SET_LAST_NAME", userInfo.lastName);
            if (userInfo.email) this.$store.commit("SET_EMAIL", userInfo.email);
            if (userInfo.photo) this.$store.commit("SET_PHOTO", userInfo.photo);
            if (userInfo.plan) this.$store.commit("SET_PLAN", userInfo.plan);
            if (userInfo.total_points !== undefined) this.$store.commit("SET_TOTAL_POINTS", userInfo.total_points);
            
            // Establecer estado de afiliación y otros campos
            this.$store.commit("SET_AFFILIATED", userInfo.affiliated);
            
            if (userInfo.tree !== undefined) this.$store.commit("SET_TREE", userInfo.tree);
            if (userInfo.activated !== undefined) this.$store.commit("SET_ACTIVATED", userInfo.activated);
            if (userInfo._activated !== undefined) this.$store.commit("SET__ACTIVATED", userInfo._activated);
            if (userInfo.country) this.$store.commit("SET_COUNTRY", userInfo.country);
            if (userInfo.balance !== undefined) this.$store.commit("SET_BALANCE", userInfo.balance);
            if (userInfo._balance !== undefined) this.$store.commit("SET__BALANCE", userInfo._balance);
            
            // Usar el valor fresco de afiliación
            affiliated = userInfo.affiliated;
            
            // Esperar a que el store se actualice
            await this.$nextTick();
            
          } else {
             console.warn('AppInitializer: No se pudieron obtener datos frescos, usando caché local');
             throw new Error('API Error or no data');
          }
        } catch (e) {
          console.error('AppInitializer: Error al obtener datos del servidor:', e);
          // Fallback a lógica original (localStorage/Store actual)
          if (this.$store.state.affiliated !== null && this.$store.state.affiliated !== undefined) {
            affiliated = this.$store.state.affiliated;
          } else {
            const localAffiliated = localStorage.getItem('affiliated');
            affiliated = localAffiliated === 'true';
            if (affiliated !== null) {
              this.$store.commit('SET_AFFILIATED', affiliated);
            }
          }
        }
        
        console.log('AppInitializer: Estado de afiliación final:', affiliated);
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
        // Solo redirigir si es necesario y no estamos ya en la ruta correcta
        // Permitir acceso a checkout y activation para que usuarios nuevos puedan pagar su paquete de afiliación
        else if (!affiliated) {
          const allowedRoutesForNonAffiliated = ['/affiliation', '/profile', '/password', '/security', '/checkout', '/activation'];
          if (!allowedRoutesForNonAffiliated.includes(this.$route.path)) {
            console.log('AppInitializer: Usuario no afiliado, redirigiendo a affiliation...');
            this.$router.push('/affiliation');
          }
        }
      } else {
        console.log('AppInitializer: No hay sesión activa');
        
        // Permitir acceso directo a registro con código de referido sin redireccionar
        if (this.$route.path.startsWith('/register/')) {
          console.log('AppInitializer: Permitiendo acceso directo a registro con código de referido sin sesión activa');
          // No redirigir
        }
        // Permitir acceso a tienda compartida sin sesión
        else if (this.$route.path.startsWith('/tienda/')) {
          console.log('AppInitializer: Permitiendo acceso a tienda compartida sin sesión');
          // No redirigir
        }
        // Si no hay sesión y no está en login, redirigir a login
        else if (this.$route.path !== '/login' && this.$route.path !== '/welcome' && this.$route.path !== '/register' && this.$route.path !== '/remember' && this.$route.path !== '/reset-password') {
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
        // Permitir acceso a checkout y activation para que usuarios nuevos puedan pagar su paquete de afiliación
        const allowedRoutesForNonAffiliated = ['/affiliation', '/profile', '/password', '/security', '/checkout', '/activation'];
        if (!affiliated && !allowedRoutesForNonAffiliated.includes(this.$route.path)) {
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
