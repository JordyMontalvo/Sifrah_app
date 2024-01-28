<template></template>

<script>
import api from '@/api'

export default {
  computed: {
    session()   { return this.$store.state.session   },
    office_id() { return this.$store.state.office_id },
  },
  created() {
    if(this.office_id) this.logout()
    else               this.logout2()
  },
};
</script>
