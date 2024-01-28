<template>
  <App :session="session">

    <h4>PERSONA DE CONFIANZA</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading"> <br>
      
      <div v-if="state == 'default'">
      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Nombre"
      	v-model="name"> <br>

      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Apellido"
      	v-model="lastName"> <br>

      	<i class="icon fas fa-id-card"></i>
      	<input class="input" placeholder="Documento de identidad"
      	v-model="dni"> <br>

      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Parentesco"
      	v-model="relation"> <br>

      	<i class="icon fas fa-mobile-alt"></i>
      	<input class="input" placeholder="Teléfono"
      	v-model="phone"> <br>

      	<small v-if="success" class="success">Persona guardada</small> <br>

      	<button class="button" v-show="!sending" @click="UPDATE">Guardar</button>
      	<button class="button" v-show= "sending" disabled>Actualizando persona ...</button>
      </div>

      <div v-if="state == 'exists'">
      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Nombre" :readonly="name" 
      	v-model="name"> <br>

      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Apellido" :readonly="lastName" 
      	v-model="lastName"> <br>

      	<i class="icon fas fa-id-card"></i>
      	<input class="input" placeholder="Documento de identidad" :readonly="dni" 
      	v-model="dni"> <br>

      	<i class="icon fas fa-user"></i>
      	<input class="input" placeholder="Parentesco" :readonly="relation" 
      	v-model="relation"> <br>

      	<i class="icon fas fa-mobile-alt"></i>
      	<input class="input" placeholder="Teléfono" :readonly="phone" 
      	v-model="phone"> <br>
      </div>

      
    </section>

  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

export default {
  components: {
    App,
  },
  data() {
    return {
      name:    	null,
      lastName: null,
      dni:    	null,
      relation: null,
      phone: 	null,

      loading: true,
      sending: false,

      alert: null,

      success: false,
    }
  },
  computed: {
    session() { return this.$store.state.session },
  },
  async created() {
    // GET data
    const { data } = await api.Security.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')
    if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED',  data.activated)

    this.state = 'default'

    if (data.security) {
      this.state 	  = 'exists'
      this.name 	  = data.security.name
      this.lastName   = data.security.lastName
	  this.dni 	  	  = data.security.dni
	  this.relation   = data.security.relation
	  this.phone 	  = data.security.phone	
    }

  },
  methods: {
    async UPDATE() {

      const { name, lastName, dni, relation, phone } = this

      if(!name) 	return
      if(!lastName) return
      if(!dni) 		return
      if(!relation) return
      if(!phone) 	return

      // UPDATE Person
      this.sending = true

      const { data } = await api.Security.POST(this.session, {
        name,
        lastName,
        dni,
        relation,
        phone,
      }); console.log({ data })

      this.sending = false

      // success
      this.success = true
      this.state   = 'exists'
    },
  },
};
</script>
