<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  created() {
    console.log('App! ...')
    this.$store.commit('SET_SESSION', localStorage.getItem('session'))
    this.$store.commit('SET_OFFICE_ID', {
      office_id: localStorage.getItem('office_id'),
      path:      localStorage.getItem('path')
    })
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
