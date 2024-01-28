<template>
  <App :session="session" :office_id="office_id">

    <h4>AFILIACIÓN</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <div v-if="congrats">
        <img class="_img" src="https://ik.imagekit.io/asu/cbm/Trofeo__CdqGzykA.png">
      </div>

      <div v-else>

        <div v-if="pending">

          <i class="icon fas fa-gem"></i>
          <input class="input" readonly :value="affiliation.plan.name"> <br>

          <i class="icon fas fa-dollar-sign"></i>
          <input class="input" readonly v-model="affiliation.plan.amount"> <br>

          <small>
            Resumen:
            <p v-for="(product, i) in affiliation.products" v-if="product.total > 0">
              {{ product.total }} {{ product.name }}
            </p>
          </small> <br>


          <small>
            Total: <span class="_strong">${{ affiliation.price }}</span>
          </small> <br><br>

          <small class="success">pendiente de aprovación</small>

        </div>

        <div v-else>

          <i class="icon fas fa-gem"></i>
          <select class="input" v-model="selec_plan">
            <option v-for="plan in plans" :value="plan">{{ plan.name }}</option>
          </select> <br>

          <i class="icon fas fa-dollar-sign"></i>
          <input class="input" readonly v-model="selec_plan.amount"> <br><br>


          <article class="product">
            <small><p>Kit de inicio ${{ selec_plan.kit }}</p></small>
            <div class="control"><input readonly value="1"></div>
          </article>

          <img class="_product" :src="product.img">

          <div class="_tabs">
            <p class="_tab" v-for="(category, i) in categories" @click="tab = category" :class="{'selected': tab == categories[i]}">{{ category }}</p>
          </div>

          <div class="_tab_content" v-for="(category, i) in categories" v-show="tab == categories[i]">
            <article class="product" v-for="(product, i) in products" v-if="product.type == category" @click="touch(i)">
              <small>
                <p>{{ product.name }}</p>
                <span>$ {{ product.price }}</span>
              </small>

              <div class="control">
                <i class="fas fa-minus-square" @click="less(product)"></i>
                <input v-model="product.total" readonly>
                <i class="fas fa-plus-square" @click="more(product)"></i>
              </div>
            </article>
          </div>

          <small>
            Resumen:
            <p v-for="(product, i) in products" v-if="product.total > 0">
              {{ product.total }} {{ product.name }}
            </p>
          </small> <br>

          <small>
            Total: <span class="_strong">${{ price }} - {{ final_plan_name }}</span>
          </small> <br><br>

          <i class="icon fa-solid fa-briefcase"></i>
          <select class="input" v-model="office">
            <option value="null" disabled>Oficina</option>
            <option v-for="office in offices" :value="office">{{ office.name }}</option>
          </select> <br>

          <small v-if="office">{{ office.address }}</small> <br>

          <div v-if="office">
            <textarea readonly class="input" style="color: gray; width: 300px;" rows="5">{{ office.accounts }}</textarea> <br><br>
          </div>


          <label>
            <input type="checkbox" v-model="check">
            <small>No Deseo usar mi saldo</small>
          </label> <br>

          <div v-if="!check">
            <div v-if="plan == 'default'">
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Saldo disponible: ${{ balance }}</small> <br>
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ganancias: ${{ selec_plan.pay }}</small> <br>
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Restan: ${{ remaining }}</small>
            </div>

            <div v-else>
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Saldo no disponible: ${{ _balance }}</small> <br>
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Saldo disponible: ${{ balance }}</small> <br>
              <small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;restan: ${{ remaining }}</small>
            </div>
          </div>

          <br>
          <small>Medio de Pago</small>
          <br>

          <div v-if="!check">
            <small v-if="plan == 'default'">Cash: {{ balance + selec_plan.pay }}</small>
            <small v-else>                  Cash: {{_balance + balance        }}</small>

            <br>
          </div>

          <label>
            <input type="radio" :value="'bank'" v-model="pay_method">
            <small>Banco</small>
          </label> <br>

          <label>
            <input type="radio" :value="'cash'" v-model="pay_method">
            <small>Efectivo</small>
          </label> <br>

          <br>

          <div v-if="pay_method == 'bank'">
            <small>Monto: {{ remaining }}</small> <br>

            <input class="input" v-model="bank" placeholder="Banco"> <br>
            <input class="input" v-model="date" placeholder="Fecha" type="date"> <br>
            <input class="input" v-model="voucher_number" placeholder="Número de Voucher" oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"> <br>

            <label>
              <span class="input" v-show="!voucher">Comprobante de pago</span>

              <img class="voucher" v-show="voucher" :src="voucher">

              <input type="file" @change="change" :disabled="pending">
            </label>
          </div>

          <div v-if="pay_method == 'cash'">
            <small>Monto: {{ remaining }}</small> <br>
          </div>

          <br>

          <small v-if="error" style="color: red;">{{ error }}<br></small>
          <small class="alert" v-if="error_price">Agregue más productos <br></small>

          <button class="button" v-show="!sending" @click="POST">Enviar Afiliación</button>
          <button class="button" v-show= "sending" disabled>Enviando Voucher ...</button>

          <small v-if="pending" class="success">pendiente de aprovación</small>

        </div>

      </div> <br><br>

      <a v-for="(affiliation, i) in affiliations" :href=" `${INVOICE_ROOT}?id=${affiliation.id}` " target="_blank" style="color: gray;">Boleta {{ i + 1 }} &nbsp;&nbsp;</a>

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

      plans:        null,
      selec_plan:   null,
      voucher:      null,
      voucher_file: null,
      office:       null,
      offices:      null,

      pay_method: null,

      pending:  false,
      congrats: false,

      check: false,
      INVOICE_ROOT,

      tab:      null,
      products: null,
      product:  null,

      error_price: false,

      error: null,

      bank: null,
      date: null,
      voucher_number: null,
    }
  },
  computed: {
    session()   { return this.$store.state.session   },
    office_id() { return this.$store.state.office_id },
    plan()      { return this.$store.state.plan      },

    categories() {
      return this.products
                 .map(x => x.type)
                 .filter((v, i, self) => i == self.indexOf(v))
    },
    price() { return this.selec_plan.kit + this.products.reduce((a, b) => a + b.price * b.total, 0) },

    final_plan() {
      let ret = null

      for(let plan of this.plans) if(this.price >= plan.amount) ret = plan.id

      return ret
    },

    final_plan_name() {
      for(let plan of this.plans) if(plan.id == this.final_plan) return plan.name
    },

    remaining() {
      if(!this.check) {
        if(this.plan == 'default') {
          if ((this.balance + this.selec_plan.pay) >= this.price) return 0
          return this.price - (this.balance + this.selec_plan.pay)

        } else {
          return this.price - (this.balance + this._balance)
        }
      } else {
        return this.price
      }
    },
  },
  watch:{
    selec_plan(){
      if(!this.selec_plan) return
      this.prices()
      this.totals()
    }
  },
  async created() {
    // GET data
    const { data } = await api.Afiliation.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')

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

    this.plans      = data.plans
    this.selec_plan = this.plans[0]


    this.products = data.products
    this.products = data.products.map(a => ({ ...a, total: 0 }))
    this.product  = this.products[0]
    this.tab      = this.categories[0]

    this.balance  = data.balance
    this._balance = data._balance

    this.offices = data.offices
    // this.office  = this.offices[0]

    this.affiliation = data.affiliation

    if(this.affiliation &&
       this.affiliation.plan.id == 'master' &&
       this.affiliation.status == 'approved') this.congrats = true


    if(this.affiliation && this.affiliation.status == 'pending') this.pending = true


    this.affiliations = data.affiliations
  },

  methods: {

    prices() {

      const i = ['basic', 'standard', 'business', 'master'].findIndex(e => e == this.selec_plan.id)

      this.products.forEach(product => {
        product.price = product.aff_price[i]
      })
    },

    totals() {
      this.products.forEach(p => { p.total = 0 })

      for(let p of this.selec_plan.products) {
        const i = this.products.findIndex((e) => e.id == p.id)
        this.products[i].total = p.total
      }
    },

    touch(i) {
      this.product     = this.products[i]
      this.error_price = false
    },

    more(product) {
      if (product.total == 10) return
      console.log(product)

      product.total += 1
    },
    less(product) {
      if (product.total == 0) return
      product.total -= 1
    },

    change(e) {
      this.voucher_file = e.target.files[0]

      const reader = new FileReader()
      reader.onload = (e) => { this.voucher = e.target.result }

      reader.readAsDataURL(this.voucher_file)
    },

    async POST() {

      let { products, price, final_plan, voucher, office, check, pay_method, bank, date, voucher_number } = this

      if (pay_method == 'bank') {
        if (!bank) {
          this.error = 'Nombre de banco'
          return
        }
        if (!date) {
          this.error = 'Fecha de voucher'
          return
        }
        if (!voucher_number) {
          this.error = 'Número de voucher'
          return
        }
        if (!voucher) {
          this.error = 'Voucher de pago'
          return
        }
      }

      if (!final_plan) {
        this.error_price = true
        return
      }

      if (!office) {
        this.error = 'Seleccione oficina'
        return
      }

      this.error = null

      // // POST Affiliation
      this.sending = true

      if (voucher) voucher = await lib.upload(this.voucher_file, this.voucher_file.name, 'affiliations')

      const { data } = await api.Afiliation.POST(this.session, {
        products,
        price,
        final_plan,
        voucher,
        office: office.id,
        check,
        remaining: this.remaining,
        pay_method,
        bank,
        date,
        voucher_number,
      })
      console.log({ data })

      this.sending = false
      this.pending = true

      this.affiliation = {
        plan:     this.selec_plan,
        products: this.products,
      }
    },

  },
};
</script>


<style lang="stylus">

  ._img
    width 100%
    max-width 600px

  ._plan
    max-width 400px
    margin 8px 0

  ._product
    max-width 240px
    margin 8px 0
    max-height 240px

  ._strong
    font-weight 600

</style>
