<template>
</template>

<script>
import api from '@/api'

export default {
  async created() {

    // valid check string
    const check = this.$route.params.check
    if(!check) return this.$router.push('/login')

    // POST check string
    const { data } = await api.check(check);

    // error
    if(data.error) return this.$router.push('/login')

    // success
    this.$router.push('/dashboard')
  },
};
</script>
