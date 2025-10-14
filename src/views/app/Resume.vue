<template>
  <App :session="session" :office_id="office_id" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="8"
      width="100%"
      height="32px"
      style="margin: 24px 0"
    />
    <h4>RESUMEN</h4>

    <i class="load" v-if="loading"></i>

    <div v-if="!loading">
      <!-- <div id="body">

        <div class="tree-container">
          <i v-if="node.parent && node.id != id" class="fas fa-arrow-left" @click="GET(node.parent)" style="position: absolute; right: 0; margin-right: 80px; z-index: 1;"></i>
          <ul class="tree">
            <li>

              <span @click="click(node)">
                <i class="fas fa-user-tie" :class="{'act': node.activated, 'aff': node.affiliated}"></i>
                <i class="fas fa-gem" :class="node.rank"></i> <br>
                {{ node.name }}
                <p>total: {{ node.closed_points_arr }}</p>
              </span>

              <ul v-if="node._childs">
                <li v-for="_child1 in node._childs">

                  <span @click="click(_child1)">
                    <i class="fas fa-user-tie" :class="{'act': _child1.activated, 'aff': _child1.affiliated}"></i>
                    <i class="fas fa-gem" :class="_child1.rank"></i> <br>
                    {{ _child1.name }} <br>
                    <small>compras: {{ _child1.points }}</small> <br>
                    <small v-if="_child1.affiliation_points">afill: {{ _child1.affiliation_points }}</small>
                  </span>

                  <ul v-if="_child1._childs">
                    <li v-for="_child2 in _child1._childs">

                      <span @click="click(_child2)">
                        <i class="fas fa-user-tie" :class="{'act': _child2.activated, 'aff': _child2.affiliated}"></i>
                        <i class="fas fa-gem" :class="_child2.rank"></i> <br>
                        {{ _child2.name }} <br>
                        <small>compras: {{ _child2.points }}</small> <br>
                        <small v-if="_child2.affiliation_points">afill: {{ _child2.affiliation_points }}</small>
                      </span>

                      <ul v-if="_child2._childs">
                        <li v-for="_child3 in _child2._childs">

                          <span @click="click(_child3)">
                            <i class="fas fa-user-tie" :class="{'act': _child3.activated, 'aff': _child3.affiliated}"></i>
                            <i class="fas fa-gem" :class="_child3.rank"></i> <br>
                            {{ _child3.name }} <br>
                            <small>compras: {{ _child3.points }}</small> <br>
                            <small v-if="_child3.affiliation_points">afill: {{ _child3.affiliation_points }}</small>
                          </span>

                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div> -->

      <div class="modal" :class="{ open }">
        <div class="inner" @click.stop="">
          <button class="close-btn" @click="closed">&times;</button>
          <img class="photo" :src="selec_node.photo" />
          <div class="user-info">
            <p class="country">{{ selec_node.country }}</p>
            <div class="info-grid">
              <div><strong>ID:</strong> {{ selec_node.dni }}</div>
              <div><strong>Nombre:</strong> {{ selec_node.name }}</div>
              <div><strong>Apellido:</strong> {{ selec_node.lastName }}</div>
              <div><strong>Teléfono:</strong> {{ selec_node.phone }}</div>
              <div><strong>Correo:</strong> {{ selec_node.email }}</div>
              <div><strong>Rango Cerrado:</strong> {{ selec_node._rank }}</div>
              <div>
                <strong>Puntos Personales:</strong> {{ selec_node.points }}
              </div>
              <div>
                <strong>Puntos Grupales:</strong>
                {{ selec_node.closed_points_arr }}
              </div>
            </div>
          </div>
          <div class="compras">
            <p><strong>Últimas compras:</strong></p>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="activation in selec_node.last_activations
                    .slice()
                    .reverse()"
                >
                  <td>{{ activation.date | date }}</td>
                  <td>{{ activation.price }}</td>
                  <td>{{ activation.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  components: {
    App,
    Spinner,
    SkeletonLoader,
  },
  data() {
    return {
      loading: true,
      id: null,
      node: null,
      count: 0,
      selec_node: {},
      // open: false,
      open: true,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    name() {
      return this.$store.state.name;
    },
    activated() {
      return this.$store.state.activated;
    },
  },

  filters: {
    date(val) {
      return new Date(val).toLocaleDateString();
      // return new Date(val).toLocaleString()
    },
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
    const { data } = await api.tree(this.session, null);
    console.log({ data });

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
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);

    this.id = data.id;
    // this.nodes = data.nodes
    this.node = data.node;
    this.selec_node = data.node;
  },
  methods: {
    click(node) {
      this.count += 1;
      setTimeout(() => {
        if (this.count == 1) {
          console.log("click ...");
          this.selec_node = node;
          this.open = true;
        } else {
          console.log("double click ...");
          this.GET(node.id);
        }
        this.count = 0;
      }, 300);
    },
    async GET(id) {
      console.log("GET ... ", id);
      this.loading = true;

      // GET data by id
      const { data } = await api.tree(this.session, id);
      console.log({ data });

      this.loading = false;

      // success
      // this.nodes = data.nodes
      this.node = data.node;
    },

    closed() {
      console.log("closed ...");
      this.open = false;
    },
  },
};
</script>


<style lang="stylus">
@import '../../assets/style/views/app/Resume.styl'
</style>
