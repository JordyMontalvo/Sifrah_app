<template>
  <App :session="session" :office_id="office_id">

    <h4>AFILIACIÓN</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <div v-if="congrats">
        <img src="https://ik.imagekit.io/asu/Trofeo__CdqGzykA.png" style="width: 100%; max-width: 600px;">
      </div>

      <div v-if="!congrats">

        <div class="products-container">
          <div>

            <i class="icon fas fa-gem"></i>
            <select class="input" v-model="selected_plan" v-if="!pending">
              <option v-for="plan in plans" :value="plan">{{ plan.name }}</option>
            </select>
            <input class="input" readonly v-model="selected_plan.name" v-if="pending">
            <br>

            <i class="icon fas fa-dollar-sign"></i>
            <input class="input" readonly v-model="'$ ' + selected_plan.amount"> <br><br>

          </div>

          <img :src="selected_plan.img" style="max-width: 400px; margin: 8px 20px;">

        </div> <br>

        <section class="products">
          <div v-for="(group, i) in selected_plan.products" v-if="!group.total">

            <p>Fijos</p>

            <article class="product" v-for="(product, j) in group.list">
              <small>{{ product.name }}</small>
              <input readonly :value="product.total">
            </article>

          </div>
        </section> <br>

        <section class="products">
          <div v-for="(group, i) in selected_plan.products" v-if="group.total">

            <p>{{ group.name }}: {{ group.total }}</p>

            <article class="product" v-for="(product, j) in group.list">
              <small>{{ product.name }}</small>

              <div class="control">
                <i class="fas fa-minus-square" @click="less(group, i, j)" v-if="!pending"></i>
                <input readonly :value="product.total">
                <i class="fas fa-plus-square" @click="more(group, i, j)" v-if="!pending"></i>
              </div>

            </article>

          </div>
        </section>


        <label>
          <input type="checkbox" v-model="check">
          <small>No Deseo usar mi saldo</small>
        </label> <br>

        <div v-if="!check">
          <div v-if="plan == 'default'">
            <small>Saldo disponible: ${{ balance }}</small> <br>
            <small>Ganancias: ${{ selected_plan.pay }}</small> <br>
            <small>Restan: ${{ remaining }}</small> <br><br>
          </div>

          <div v-else>
            <small>Saldo no disponible: ${{ _balance }}</small> <br>
            <small>Saldo disponible: ${{ balance }}</small> <br>
            <small>restan: ${{ remaining }}</small> <br><br>
          </div>
        </div>


        <i class="icon fa-solid fa-piggy-bank"></i>
        <small class="input" style="color: gray;">
          <small>
            BCP: 0000000011111111 <br>
            SCOTIA: 0000000011111111 <br>
            Yape / Plinn: +00001111
          </small>
        </small> <br>

        <i class="icon fas fa-upload"></i>
        <label>
          <span class="input" v-show="!voucher">Comprobante de pago</span>

          <img class="voucher" v-show="voucher" :src="voucher">

          <input type="file" @change="change" :disabled="pending">
        </label> <br>

        <i class="icon fa-solid fa-briefcase"></i>
        <select class="input" v-model="office" v-if="!pending">
          <option value="null" disabled>Oficina</option>
          <!-- <option value="central">Central</option>
          <option value="secondary">Ledezma</option> -->
          <option v-for="office in offices" :value="office">{{ office.name }}</option>

        </select>
        <input class="input" readonly value="Central" v-if="pending && office == 'central'">
        <input class="input" readonly value="Ledezma" v-if="pending && office == 'secondary'">

        <br><br>

        <div v-if="!pending">
          <button class="button" v-show="!sending" @click="POST">Enviar Voucher</button>
          <button class="button" v-show="sending" disabled>Enviando Voucher ...</button>
        </div>

        <small v-if="pending" class="success">pendiente de aprobación</small>

        <br><br>

      </div>

      <a v-for="(affiliation, i) in affiliations" :href="`${INVOICE_ROOT}?id=${affiliation.id}`" target="_blank"
        style="color: gray;">Boleta {{ i + 1 }} &nbsp;&nbsp;</a>

      <br><br>

    </section>


  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import lib from '@/lib'

const INVOICE_ROOT = process.env.VUE_APP_INVOICE_ROOT
console.log({ INVOICE_ROOT })


export default {
  components: {
    App,
  },
  data() {
    return {
      loading: true,
      sending: false,

      plans: null,
      selected_plan: null,
      voucher: null,
      voucher_file: null,
      office: null,
      offices: null,

      pending: false,
      congrats: false,

      check: false,
      INVOICE_ROOT,
    }
  },
  computed: {
    session() { return this.$store.state.session },
    office_id() { return this.$store.state.office_id },
    plan() { return this.$store.state.plan },

    remaining() {

      if (this.plan == 'default') {

        if ((this.balance + this.selected_plan.pay) >= this.selected_plan.amount) return 0
        return this.selected_plan.amount - (this.balance + this.selected_plan.pay)

      } else {

        return this.selected_plan.amount - (this.balance + this._balance)
      }
    },
  },
  async created() {
    // GET data
    const { data } = await api.Afiliation.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if (data.error && data.msg == 'invalid session') this.$router.push('/login')

    // success
    this.$store.commit('SET_NAME', data.name)
    this.$store.commit('SET_LAST_NAME', data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED', data.activated)
    this.$store.commit('SET__ACTIVATED', data._activated)
    this.$store.commit('SET_PLAN', data.plan)
    this.$store.commit('SET_COUNTRY', data.country)
    this.$store.commit('SET_PHOTO', data.photo)
    this.$store.commit('SET_TREE', data.tree)

    this.offices = data.offices

    this.plans = data.plans
    this.selected_plan = this.plans[0]

    const affiliation = data.affiliation
    this.affiliations = data.affiliations

    if (affiliation && affiliation.status == 'pending') {
      this.pending = true
      this.selected_plan = affiliation.plan
      this.voucher = affiliation.voucher
      this.office = affiliation.office
    }

    if (affiliation && affiliation.plan.id == 'master' && affiliation.status == 'approved') this.congrats = true

    if (this.office_id) this.office = this.office_id

    this.balance = data.balance
    this._balance = data._balance

  },
  methods: {
    more(group, i, j) {

      let total = 0
      group.list.forEach(product => {
        total += product.total
      })

      if (total == group.total) return

      this.selected_plan.products[i].list[j].total += 1
    },

    less(group, i, j) {

      if (this.selected_plan.products[i].list[j].total == 0) return

      this.selected_plan.products[i].list[j].total -= 1
    },

    change(e) {
      this.voucher_file = e.target.files[0]

      const reader = new FileReader()
      reader.onload = (e) => { this.voucher = e.target.result }

      reader.readAsDataURL(this.voucher_file)
    },

    async POST() {

      let { selected_plan, voucher, office, check } = this

      let ret = false

      selected_plan.products.forEach(group => {

        let total = 0
        group.list.forEach(product => {
          total += product.total
        })

        if (total < group.total) ret = true
      })

      if (ret) return

      // if(!voucher) return
      if (!office) return


      // // POST Affiliation
      this.sending = true

      if (voucher) voucher = await lib.upload(this.voucher_file, this.voucher_file.name, 'affiliations')

      const { data } = await api.Afiliation.POST(this.session, {
        selected_plan,
        voucher,
        office: office.id,
        remaining: this.remaining,
        check
      })
      console.log({ data })

      this.sending = false

      this.pending = true
    },

  },
};
</script>
