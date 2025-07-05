<template>
  <App :session="session" :office_id="office_id" :title="title">
    <h4>EQUIPO</h4>

    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading">
      <div id="body">
        <div class="tree-container">
          <i
            v-if="node.parent && node.id != id"
            class="fas fa-arrow-left"
            @click="GET(node.parent)"
            style="position: absolute; right: 0; margin-right: 80px; z-index: 1"
          ></i>
          <ul class="tree">
            <li>
              <span @click="click(node)">
                <i
                  class="fas fa-user-tie"
                  :class="{ act: node.activated, aff: node.affiliated }"
                ></i>
                <i class="fas fa-gem" :class="node.rank"></i> <br />
                {{ node.name }}
                <p>total: {{ node.closed_points_arr }}</p>
              </span>

              <ul v-if="node._childs">
                <li v-for="_child1 in node._childs">
                  <span @click="click(_child1)">
                    <i
                      class="fas fa-user-tie"
                      :class="{
                        act: _child1.activated,
                        aff: _child1.affiliated,
                      }"
                    ></i>
                    <i class="fas fa-gem" :class="_child1.rank"></i> <br />
                    {{ _child1.name }} <br />
                    <small>compras: {{ _child1.points }}</small> <br />
                    <small v-if="_child1.affiliation_points"
                      >afill: {{ _child1.affiliation_points }}</small
                    >
                  </span>

                  <ul v-if="_child1._childs">
                    <li v-for="_child2 in _child1._childs">
                      <span @click="click(_child2)">
                        <i
                          class="fas fa-user-tie"
                          :class="{
                            act: _child2.activated,
                            aff: _child2.affiliated,
                          }"
                        ></i>
                        <i class="fas fa-gem" :class="_child2.rank"></i> <br />
                        {{ _child2.name }} <br />
                        <small>compras: {{ _child2.points }}</small> <br />
                        <small v-if="_child2.affiliation_points"
                          >afill: {{ _child2.affiliation_points }}</small
                        >
                      </span>

                      <ul v-if="_child2._childs">
                        <li v-for="_child3 in _child2._childs">
                          <span @click="click(_child3)">
                            <i
                              class="fas fa-user-tie"
                              :class="{
                                act: _child3.activated,
                                aff: _child3.affiliated,
                              }"
                            ></i>
                            <i class="fas fa-gem" :class="_child3.rank"></i>
                            <br />
                            {{ _child3.name }} <br />
                            <small>compras: {{ _child3.points }}</small> <br />
                            <small v-if="_child3.affiliation_points"
                              >afill: {{ _child3.affiliation_points }}</small
                            >
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
      </div>

      <div class="modal" :class="{ open }" @click="closed">
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
              <div>
                <strong>Rango Cerrado:</strong> {{ selec_node._rank | _rank }}
              </div>
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

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
      id: null,
      node: null,
      count: 0,
      selec_node: {},
      open: false,
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
    title() {
      return "Organización";
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
      if (val == "star") return "BRONCE";
      if (val == "silver") return "PLATA";
      if (val == "ruby") return "RUBY";
      if (val == "gold") return "ORO";
      if (val == "emerald") return "ESMERALDA";
      return "Ninguno";
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
.modal
  background rgba(#000, 0.72)
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  padding 80px 20px
  display none
  z-index 2
  overflow auto
  &.open
    display block
  .inner
    background #fff
    border-radius 20px
    padding 32px 32px 32px 32px
    max-width 480px
    margin auto
    box-shadow 0 8px 32px rgba(0,0,0,0.18)
    position relative
    display flex
    flex-direction column
    align-items center
    .close-btn
      position absolute
      top 16px
      right 16px
      background transparent
      border none
      font-size 2rem
      color #888
      cursor pointer
      transition color 0.2s
      &:hover
        color #ff5722
    .photo
      width 120px
      height 120px
      object-fit cover
      border-radius 50%
      margin 0 auto 16px auto
      display block
      box-shadow 0 2px 8px rgba(0,0,0,0.10)
    .user-info
      width 100%
      .country
        text-align center
        font-weight 600
        color #086eb6
        margin-bottom 12px
      .info-grid
        display grid
        grid-template-columns 1fr 1fr
        gap 8px 16px
        margin-bottom 16px
        font-size 0.98rem
        color #333
    .compras
      width 100%
      p
        margin-bottom 8px
        font-weight 600
        color #333
      table
        width 100%
        border-collapse collapse
        th, td
          padding 6px 8px
          text-align left
        th
          background #f5f5f5
          color #333
        tr:nth-child(even)
          background #fafafa
        tr:hover
          background #e3f2fd
</style>

<style>
/* https://codepen.io/ea-ger/pen/rNJjxYr
https://codepen.io/team/amcharts/pen/poPxojR */

/*  @import url('https://fonts.googleapis.com/css2?family=Oxygen:wght@300&display=swap');*/

#body {
  margin: 0;
  padding: 0;
  /*    background: #fafafa;*/
  /*    font-family: 'Oxygen', sans-serif;*/
  letter-spacing: 0.2px;
  /*    height: 100vh;*/
  /*    width: 100vw;*/
  /*    background-color: var(--bg-1);*/
  position: relative;
}

:root {
  --col-1: #c8ddef;
  --col-2: #c8ddef;
  --bg-1: #0e182d;
  --highlighted: #ff5722;
}

.tree-container {
  /*display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;*/

  overflow: auto;

  width: 100%;
  /*padding-top: 5em;
    padding-bottom: 5em;*/
}

.tree-container > h1 {
  color: var(--col-1);
  font-weight: 400;
}

.tree,
.tree ul,
.tree li {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.tree {
  /*    margin: 0 0 1em;*/
  text-align: center;
}

.tree,
.tree ul {
  display: table;
  margin: auto;
  width: 100%;
}

.tree ul {
  width: 100%;
}

.tree li {
  display: table-cell;
  padding: 0.5em 0;
  vertical-align: top;
}

.tree li:before {
  outline: solid 1px var(--col-2);
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  direction: rtl;
}

/*.tree li:hover:before {
    outline: solid 1px var(--col-1);
  }*/

.tree li:first-child:before {
  left: 50%;
}

.tree li:last-child:before {
  right: 50%;
}

.tree code,
.tree span {
  /*    border: solid .1em var(--col-1);*/
  border-radius: 0.2em;
  display: inline-block;
  margin: 0 0.2em 0.5em;
  padding: 0.2em 0.5em;
  position: relative;
  /*    background-color: var(--bg-1);*/
  transition: all 0.2s ease;
  /*    color: var(--col-1);*/
  /*    font-size: 14px;*/
  font-size: 12px;
}

.tree span i {
  font-size: 32px;
  color: #fff;
}
.tree span i.aff {
  color: #ffe400;
}
.tree span i.act {
  color: #14ec42;
}

.tree span i.fa-gem {
  font-size: 18px;
  position: absolute;
  transform: translateY(10px);
  display: none;
}

.tree span i.fa-gem.star {
  display: inline;
  color: #ffe400; /*yellow*/
}

.tree span i.fa-gem.master {
  display: inline;
  color: #14ec42; /*green*/
}

.tree span i.fa-gem.silver {
  display: inline;
  color: #d3d3d3; /*silver*/
}

.tree span i.fa-gem.gold {
  display: inline;
  color: #d4af37; /*gold*/
}

/*.tree span:hover {
    background-color: var(--col-1);
    color: var(--bg-1);
  }

  .tree li:hover>span {
    background-color: var(--col-1);
    color: var(--bg-1);
  }

  .tree span:hover::after,
  .tree li:hover>span::after {
    box-shadow: 0 0 5px 8px var(--col-1) inset;
  }*/

.tree ul:before,
.tree code:before,
.tree span:before {
  outline: solid 1px var(--col-2);
  content: "";
  height: 0.5em;
  left: 50%;
  position: absolute;
}

/*  .tree ul:hover:before,
  .tree code:hover:before,
  .tree li:hover>span:before {
    outline: solid 1px var(--col-1);
  }*/

.tree span::after {
  outline: solid 1px var(--col-1);
  content: "";
  top: -8px;
  left: calc(50% - 5px);
  width: 8px;
  height: 8px;
  /*    background-color: var(--bg-1);*/
  background-color: #888;
  border: 1px solid var(--col-1);
  position: absolute;
  opacity: 1;
  border-radius: 100%;
  transition: all 0.2s ease;
}

.tree ul:before {
  top: -0.5em;
}

.tree code:before,
.tree span:before {
  top: -0.55em;
}

.tree > li {
  margin-top: 0;
}

.tree > li:before,
.tree > li:after,
.tree > li > code:before,
.tree > li > span:before,
.tree > li > span:after {
  outline: none;
  display: none;
}

.highlighted {
  border: 2px solid var(--highlighted) !important;
}

/*.highlighted:hover {
    background-color: var(--highlighted) !important;
  }*/
</style>
