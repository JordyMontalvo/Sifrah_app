<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <SkeletonLoader
      v-if="loading"
      :lines="6"
      width="100%"
      height="28px"
      style="margin: 24px 0"
    />
    <div class="scroll" v-if="!loading">
      <h4>BONIFICACIONES</h4>

      <i class="load" v-if="loading"></i>

      <h4>Bono Logro</h4>

      <div v-for="(pay, i) in pays">
        <spam v-if="pay.name == 'DOBLE DIAMANTE'">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
        </spam>

        <spam v-else-if="pay.name == 'TRIPLE DIAMANTE'">
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
        </spam>

        <spam v-else-if="pay.name == 'DIAMANTE ESTRELLA'">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <i class="icon fas fa-star" :class="{ green: pay.payed }"></i>
        </spam>

        <spam v-else>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <i class="icon fas fa-gem" :class="{ green: pay.payed }"></i>
        </spam>

        <input
          class="input"
          readonly
          :value="pay._name"
          v-bind:style="{ width: 150 + 15 * i + 'px' }"
          :class="[pay.payed ? pay.name : '']"
        />
        <br />
      </div>

      <br />
      <br />

      <h4>Rango Zafiro: 6/9</h4>
      <table>
        <thead>
          <tr>
            <th v-for="(bonus, i) in sapphire">{{ i + 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="bonus in sapphire">{{ bonus }}</td>
          </tr>
        </tbody>
      </table>
      <br />

      <h4>Rango Rubi: 6/12</h4>
      <table>
        <thead>
          <tr>
            <th v-for="(bonus, i) in ruby">{{ i + 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="bonus in ruby">{{ bonus }}</td>
          </tr>
        </tbody>
      </table>
      <br />

      <h4>Rango ORO: 21/24</h4>
      <table>
        <thead>
          <tr>
            <th v-for="(bonus, i) in gold">{{ i + 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="bonus in gold">{{ bonus }}</td>
          </tr>
        </tbody>
      </table>
      <br />

      <h4>Rango Diamante: 6/9</h4>
      <table>
        <thead>
          <tr>
            <th v-for="(bonus, i) in diamond">{{ i + 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="bonus in diamond">{{ bonus }}</td>
          </tr>
        </tbody>
      </table>
      <br />
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
      loading: false,
      pays: [],
      sapphire: [],
      ruby: [],
      gold: [],
      diamond: [],
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
  },
  async created() {
    const { data } = await api.bonuses(this.session);
    let n;

    this.pays = data.pays;

    for (const pay of this.pays) {
      if (pay.name == "star") pay._name = "ESTRELLA $15";
      if (pay.name == "master") pay._name = "MASTER $30";
      if (pay.name == "silver") pay._name = "PLATA $45";
      if (pay.name == "gold") pay._name = "ORO $100";
      if (pay.name == "sapphire") pay._name = "ZAFIRO $200";
      if (pay.name == "RUBI") pay._name = "RUBI $300";
      if (pay.name == "DIAMANTE") pay._name = "DIAMANTE $5.000";
      if (pay.name == "DOBLE DIAMANTE") pay._name = "DOBLE DIAMANTE $10.000";
      if (pay.name == "TRIPLE DIAMANTE") pay._name = "TRIPLE DIAMANTE $15.000";
      if (pay.name == "DIAMANTE ESTRELLA")
        pay._name = "DIAMANTE ESTRELLA $25.000";
    }

    this.sapphire = data.bonuses.sapphire;
    this.ruby = data.bonuses.ruby;
    this.gold = data.bonuses.gold;
    this.diamond = data.bonuses.diamond;

    n = 9 - this.sapphire.length;
    for (let i = 0; i < n; i++) this.sapphire.push("-");

    n = 12 - this.ruby.length;
    for (let i = 0; i < n; i++) this.ruby.push("-");

    n = 24 - this.gold.length;
    for (let i = 0; i < n; i++) this.gold.push("-");

    n = 9 - this.diamond.length;
    for (let i = 0; i < n; i++) this.diamond.push("-");
  },
};
</script>

<style>
.fa-gem.green {
  color: #06d6a0;
}

.input.green {
  background-color: #06d6a0;
}

.input.star {
  background-color: yellow;
}
.input.master {
  background-color: #06d6a0;
}
.input.silver {
  background-color: #aaa;
}
.input.gold {
  background-color: #d4af37;
}
.input.sapphire {
  background-color: blue;
}
/*.input.star {
    background-color: yellow;
  }
  .input.star {
    background-color: yellow;
  }
  .input.star {
    background-color: yellow;
  }
  .input.star {
    background-color: yellow;
  }
  .input.star {
    background-color: yellow;
  }
  .input.star {
    background-color: yellow;
  }*/
</style>
