<template>
  <App :session="session" :title="title">
    <figure class="slide" style="display: flex; margin: 0">
      <img
        :src="banner.img"
        style="width: 100%; max-width: 850px; transition: all 2s"
        :style="{ opacity: op }"
      />
      <img
        :src="banner.img2"
        style="
          width: 100%;
          max-width: 850px;
          transition: all 2s;
          transform: translate(-100%);
          opacity: 0;
        "
        :style="{ opacity: op2 }"
      />
      <img
        :src="banner.img3"
        style="
          width: 100%;
          max-width: 850px;
          transition: all 2s;
          transform: translate(-200%);
          opacity: 0;
        "
        :style="{ opacity: op3 }"
      />
    </figure>
    <br />

    <h4>INICIO</h4>

    <i class="load" v-if="loading"></i>

    <div class="boxes" v-if="!loading">
      <div class="box blue">
        <i class="fas fa-wallet"></i>
        <div>
          <p>S/. {{ balance }}</p>
          <span>SALDO</span>
        </div>
      </div>

      <div class="box green">
        <i class="fas fa-hand-holding-usd"></i>
        <div>
          <p>S/. {{ _balance }}</p>
          <span>SALDO NO DISPONIBLE</span>
        </div>
      </div>

      <div class="box green">
        <i class="fas fa-hand-holding-usd"></i>
        <div>
          <p>S/. {{ Number(ins + insVirtual).toFixed(2) }}</p>
          <span>TOTAL GANADO</span>
        </div>
      </div>

      <div class="box green">
        <i class="fas fa-medal"></i>
        <div>
          <p>{{ points }}</p>
          <span>PUNTOS</span>
        </div>
      </div>

      <div class="box green" v-if="rank">
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ plan }}</p>
          <span>PAQUETE DE AFILIACIÓN</span>
        </div>
      </div>

      <div class="box green" v-if="rank">
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ rank }}</p>
          <span>RANGO CERRADO</span>
        </div>
      </div>

      <div class="box green" v-if="node">
        <i class="fas fa-gem"></i>
        <div>
          <p>{{ node.rank | _rank }}</p>
          <span>RANGO ACTUAL</span>
        </div>
      </div>

      <div class="box green" v-if="node">
        <i class="fa fa-tachometer"></i>
        <div>
          <p>{{ node.next_rank.name | _rank }}</p>
          <span>SIGUIENTE RANGO</span>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";

export default {
  components: {
    App,
  },
  data() {
    return {
      banner: { img: null },
      ins: null,
      outs: null,
      balance: null,
      _balance: null,
      team: null,
      rank: null,
      points: null,

      loading: true,

      op: 1,
      op2: 0,
      op3: 0,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    plan() {
      if(this.$store.state.plan == "early") return "CLIENTE PREFERENTE";
      if (this.$store.state.plan == "basic") return "DISTRIBUIDOR";
      if (this.$store.state.plan == "standard") return "EJECUTIVO";
      if (this.$store.state.plan == "master") return "EMPRESARIO";
      return this.$store.state.plan;
    },
    title() {
      return "Dashboard";
    },
  },
  filters: {
    _rank(val) {
      if (val == "none") return "Ninguno";
      if (val == "active") return "ACTIVO";
      if (val == "star") return "MASTER";
      if (val == "master") return "PLATA";
      if (val == "silver") return "PLATINO";
      if (val == "gold") return "ORO";
      if (val == "sapphire") return "ZAFIRO";
      if (val == "RUBI") return "DIAMANTE RUBI";
      if (val == "DIAMANTE") return "DIAMANTE ESTRELLA";
      if (val == "DOBLE DIAMANTE") return "DIAMANTE DOS ESTRELLAS";
      if (val == "TRIPLE DIAMANTE") return "DIAMANTE TRES ESTRELLAS";
      if (val == "DIAMANTE ESTRELLA") return "DIAMANTE CBM";
    },
  },
  async created() {
    // GET data
    const { data } = await api.dashboard(this.session);
    console.log({ data });

    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");

    // success
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.$store.commit("SET_EMAIL", data.email);
    this.$store.commit("SET_TOKEN", data.token);

    this.banner = data.banner;
    this.ins = data.ins;
    this.insVirtual = data.insVirtual;
    this.outs = data.outs.toFixed(2);
    this.balance = data.balance.toFixed(2);
    this._balance = data._balance.toFixed(2);
    this.team = data.team;
    this.rank = data.rank;
    this.points = data.points;
    this.node = data.node;
    this.n_affiliates = data.n_affiliates;

    const time = 4000;
    let i = 0;
    const n = 3;

    setInterval(() => {
      i += 1;
      console.log(i);

      if (i == 0) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op = 1;
      }

      if (i == 1) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op2 = 1;
      }

      if (i == 2) {
        // reset all
        this.op = 0;
        this.op2 = 0;
        this.op3 = 0;
        // show 0
        this.op3 = 1;
      }

      if (i == n - 1) i = -1;
    }, time);
  },
};
</script>
