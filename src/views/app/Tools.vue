<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading">
      <iframe class="_iframe" src="https://claseflix.io/educacion"></iframe>
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
      tools:
        "https://drive.google.com/drive/folders/12Vd2jVrn7QUNhe3G0NTideUfK4NiI5mK?usp=share_link",
      presentation:
        "https://drive.google.com/drive/folders/1qwooLRceDXMxMr3I_Sm2K6QpUQmyJoZ5?usp=share_link",
      videos:
        "https://drive.google.com/drive/folders/1aUs465WhQnoOPl6cMeHgnLT9j8wZz6IG?usp=share_link",

      loading: true,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    title() {
      return "Educación";
    },
  },
  async created() {
    // GET data
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
  },
};
</script>


<style lang="stylus">
@import '../../assets/style/views/app/Tools.styl'
</style>
