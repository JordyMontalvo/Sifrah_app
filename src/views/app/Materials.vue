<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading">
      <iframe class="_iframe" src="https://beacons.ai/sifrahcorp/mediakit"></iframe>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    title() {
      return "Materiales";
    },
  },
  async created() {
    try {
        const { data } = await api.tools(this.session); 

        this.loading = false;

        // error
        if (data.error && data.msg == "invalid session")
          this.$router.push("/login");
        if (data.error && data.msg == "unverified user")
          this.$router.push("/verify");

        // success
        this.$store.commit("SET_NAME", data.name);
        this.$store.commit("SET_LAST_NAME", data.lastName);
        this.$store.commit("SET_AFFILIATED", data.affiliated);
        this.$store.commit("SET_ACTIVATED", data.activated);
        this.$store.commit("SET__ACTIVATED", data._activated);
        this.$store.commit("SET_PLAN", data.plan);
        this.$store.commit("SET_COUNTRY", data.country);
        this.$store.commit("SET_PHOTO", data.photo);
        this.$store.commit("SET_TREE", data.tree);
    } catch (e) {
        this.loading = false;
        console.error(e);
    }
  },
};
</script>

<style lang="stylus" scoped>
._iframe
  border 0
  width 100%
  height 100vh
</style>
