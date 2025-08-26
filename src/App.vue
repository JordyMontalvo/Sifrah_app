<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { debug, restoreUserState, checkAffiliationStatus } from './utils/debug.js'

export default {
  created() {
    debug.log('App! Inicializando estado desde localStorage...')
    
    // Restaurar sesión
    const session = localStorage.getItem('session')
    this.$store.commit('SET_SESSION', session)
    
    // Restaurar office_id y path
    const office_id = localStorage.getItem('office_id')
    const path = localStorage.getItem('path')
    this.$store.commit('SET_OFFICE_ID', { office_id, path })
    
    // Restaurar estado completo del usuario
    restoreUserState(this.$store)
    
    // Verificar consistencia
    debug.checkConsistency(this.$store)
    
    // Log del estado final
    debug.logUserState(this.$store)
    
    // Agregar comando global para debugging
    window.enableDebug = () => {
      debug.enable();
      console.log('Para habilitar debug en producción, ejecuta: window.enableDebug()');
      console.log('Para ver el estado actual: window.showUserState()');
      console.log('Para ver localStorage: window.showLocalStorage()');
    };
    
    window.showUserState = () => {
      debug.logUserState(this.$store);
    };
    
    window.showLocalStorage = () => {
      debug.logLocalStorage();
    };
    
    window.checkAffiliation = () => {
      checkAffiliationStatus(this.$store);
    };
    
    // Mostrar comandos de debugging en consola
    if (debug.enabled) {
      console.log('🔧 Comandos de debugging disponibles:');
      console.log('window.enableDebug() - Habilitar debug');
      console.log('window.showUserState() - Ver estado del usuario');
      console.log('window.showLocalStorage() - Ver localStorage');
      console.log('window.checkAffiliation() - Verificar afiliación');
    }
  },
};
</script>

<style lang="stylus">

  @import 'assets/style/reset.styl'
  
  @import 'assets/style/vars.styl'

  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap')

  #app
    font-family 'Open Sans', sans-serif
    // color c-gray
    // color c-main-red
    // color c-main-light-green
    color c-main-green
    

  @import 'assets/style/elements/inputs.styl'
  @import 'assets/style/elements/icons.styl'
  @import 'assets/style/elements/buttons.styl'
  @import 'assets/style/elements/images.styl'
  @import 'assets/style/elements/texts.styl'

  @import 'assets/style/auth.styl'
  @import 'assets/style/app.styl'

</style>
