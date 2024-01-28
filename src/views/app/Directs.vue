<template>
  <App :session="session" :office_id="office_id">

    <h4>Apalancamiento</h4><br>

      <table>
        <thead>
          <tr>
            <th>FRONTALES</th>
            <!-- <th>Der</th> -->
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="radio" v-model="coverage" :value="{id}" name="coverage">
            </td>
            <!-- <td>
              <input type="radio" v-model="coverage" :value="{id}" name="coverage">
            </td> -->
          </tr>
        </tbody>
      </table> <br>


    <h4>DIRECTOS</h4>

    <i class="load" v-if="loading"></i>

    <div class="scroll" v-if="!loading">

      <table v-if="directs.length">
        <thead>
          <tr>
            <!-- <th>Inscripción</th> -->

            <th>Nombre</th>
            <!-- <th>Plan</th> -->
            <th>Email</th>
            <th>Teléfono</th>

            <th>Afiliado</th>
            <th>Activo</th>

            <th>Apalancar</th>
            <!-- <th>Der</th> -->

          </tr>
        </thead>
        <tbody>
          <tr v-for="direct in directs">
            <!-- <td>{{ direct.affiliationDate | date }}</td> -->

            <td>{{ direct.name }} {{ direct.lastName }}</td>
            <!-- <td>
              <span v-if="direct.activated" style="color: #14ec42">Activado</span>
              <span v-else-if="direct.affiliated" style="color: #ffe400">Afiliado</span>
              <span v-else>Registrado</span>

              <span v-else-if="!direct.verified" style="color: #ef476f">Pendiente</span>
              <span v-else-if="direct.verified">Verificado</span>
            </td> -->
            <!-- <td>{{ direct.plan }}</td> -->
            <td>{{ direct.email }}</td>
            <td>{{ direct.phone }}</td>


            <td>
              <span v-if="direct.affiliated">Si</span>
              <span v-else>No</span>
            </td>
            <td>
              <span v-if="direct.activated">Si</span>
              <span v-else>No</span>
            </td>


            <td v-if="direct.tree">
              <input type="radio" v-model="coverage" :value="{id: direct.id}" name="coverage">
            </td>
            <!-- <td v-if="direct.tree">
              <input type="radio" v-model="coverage" :value="{id: direct.id, branch: 1}" name="coverage">
            </td> -->

          </tr>
        </tbody>
      </table>
    </div>


    <h4>APALANCADOS</h4>

    <table v-if="frontals.length">
      <thead>
        <tr>

          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>

          <th>Afiliado</th>
          <th>Activo</th>

          <th>Apalancar</th>

        </tr>
      </thead>
      <tbody>
        <tr v-for="frontal in frontals">

          <td>{{ frontal.name }} {{ frontal.lastName }}</td>
          <td>{{ frontal.email }}</td>
          <td>{{ frontal.phone }}</td>

          <td>
            <span v-if="frontal.affiliated">Si</span>
            <span v-else>No</span>
          </td>
          <td>
            <span v-if="frontal.activated">Si</span>
            <span v-else>No</span>
          </td>

          <td v-if="frontal.affiliated">
            <input type="radio" v-model="coverage" :value="{id: frontal.id, branch: 0}" name="coverage">
          </td>

        </tr>
      </tbody>
    </table> <br>
    
    <a v-bind:href="link">
      <button class="button">Nuevo Registro</button>
    </a> <br>


    <i class="icon fas fa-user-shield"></i>
    <input class="input" readonly @click="copy_token" id="token"
    v-model="token">
    <i class="copy" v-if="c_token">código copiado <i class="fas fa-check"></i></i><br>

    <i class="icon fas fa-share-alt"></i>
    <input class="input" readonly @click="copy_link" id="link"
    v-model="link">
    <i class="copy" v-if="c_link">link copiado <i class="fas fa-check"></i></i>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

const ROOT = process.env.VUE_APP_ROOT
console.log({ ROOT })

export default {
  components: {
    App,
  },
  data() {
    return {
      id:      null,
      directs: null,
      frontals: [],
      loading: true,
      // branch: null,
      coverage: null,
      token: null,

      c_token: false,
      c_link:  false,
    }
  },
  computed: {
    session() { return this.$store.state.session },
    office_id() { return this.$store.state.office_id },
    link()    { return `${ROOT}/register/${this.token}`},
  },
  watch: {
    async coverage(a, b) {
      const { data } = await api.coverage(this.session, { coverage: this.coverage }); console.log({ data })
    },
  },
  async created() {
    // GET data
    const { data } = await api.directs(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME',       data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET__ACTIVATED',  data._activated)
    this.$store.commit('SET_ACTIVATED',  data.activated)
    this.$store.commit('SET_PLAN',       data.plan)
    this.$store.commit('SET_COUNTRY',    data.country)
    this.$store.commit('SET_PHOTO',      data.photo)
    this.$store.commit('SET_TREE',       data.tree)


    // this.branch = data.branch
    this.token    = data.token
    this.id       = data.id
    this.coverage = data.coverage
    // this.directs  = data.directs.reverse()
    this.directs  = data.directs
    this.frontals  = data.frontals
    // this.childs = data.childs
    // this.names  = data.names

  },

  methods: {
    // async change(e) {
    //   // const { branch } = this
    //   // console.log({ branch })
    //   // await api.branch(this.session, { branch })
    //   const val = e.target.value

    //   console.log({ val })
    // }

    copy_token() {
      lib.copy('token')
      this.c_token = true
      setTimeout(() => this.c_token = false, 4000)
    },
    copy_link() {
      lib.copy('link')
      this.c_link = true
      setTimeout(() => this.c_link = false, 4000)
    },
  },

  filters: {
    date(val) {
      if(!val) return ''
      return new Date(val).toLocaleDateString()
    },
  },
};
</script>
