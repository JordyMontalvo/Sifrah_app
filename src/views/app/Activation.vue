<template>
  <App :session="session" :office_id="office_id">

    <h4 class="tabs">
      <router-link class="tab" to="/activation">
        Comprar
      </router-link> &nbsp;&nbsp;
      <router-link class="tab" to="/activations" v-if="!office_id">
        Historial
      </router-link>
    </h4>

    <h4>Puntos: {{ current_points }}</h4>
    <h4>PRODUCTOS</h4>

    <i class="load" v-if="loading"></i>

    <section v-if="!loading">

      <div class="flex">
        <div style="width: 100%">

          <img :src="product.img" style="max-width: 200px; margin: 12px 0; max-height: 200px;">

          <div class="_tabs">
            <p class="_tab" v-for="(category, i) in categories" @click="tab = category" :class="{'selected': tab == categories[i]}">{{ category }}</p>
          </div>

          <!-- <div class="flex"> -->

            <div class="_tab_content" v-for="(category, i) in categories" v-show="tab == categories[i]">
              <article class="product" v-for="(product, i) in products" @click="touch(i)" v-if="product.type == category">
                <small>
                  <p class="_name">{{ product.name }}</p>
                  <span>Val. a comisionar
                    <i v-if="product.val">{{ product.val   }}</i>
                    <i v-else>            {{ product.price }}</i>
                    &nbsp; &nbsp; <i class="_price">$ {{ product.price }}</i></span>
                </small>

                <div class="control">
                  <i class="fas fa-minus-square" @click="less(product)"></i>
                  <input v-model="product.total" readonly>
                  <i class="fas fa-plus-square" @click="more(product)"></i>
                </div>
              </article>
            </div> <br>


          <small>
            Resumen: <br>
            <p class="_light" v-for="(product, i) in products" v-if="product.total > 0">
              {{ product.total }} {{ product.name }}
            </p>
          </small> <br>



          <small>Impuesto: {{ IGV.toFixed(2) }}</small> <br>

          <i class="icon fas fa-dollar-sign"></i>
          <input class="input" readonly v-model="_price"> <br>

          <i class="icon fas fa-gem"></i>
          <input class="input" readonly v-model="_points"> <br>

          <i class="icon fa-solid fa-briefcase"></i>
          <select class="input" v-model="office" v-if="!pending">
            <option value="null" disabled>Oficina</option>
            <option v-for="office in offices" :value="office">{{ office.name }}</option>
          </select> <br>

          <small v-if="office">{{ office.address }}</small> <br>

          <div v-if="office">
            <textarea readonly class="input" style="color: gray; width: 300px;" rows="5">{{ office.accounts }}</textarea> <br><br>
          </div>

          <label>
            <input type="checkbox" v-model="check">
            <small>Deseo usar mi saldo</small>
          </label> <br>

          <div v-show="check">
            <small>Saldo no disponible: {{ _balance }}</small> <br>
            <small>Saldo disponible: {{ balance }}</small> <br>
            <small v-if="remaining > 0">restan: {{ remaining }}</small>
          </div>

          <br>

          <div v-show="!(check && remaining == 0)">

            <small>Medio de Pago</small>
            <br>

            <div v-if="check">
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
              <small>Efectivo</small> <br>
            </label>

            <div v-if="pay_method == 'bank'"> <br>
              <small>Monto: {{ remaining }}</small> <br>

              <input class="input" v-model="bank" placeholder="Banco"> <br>
              <input class="input" v-model="date" placeholder="Fecha" type="date"> <br>
              <input class="input" v-model="voucher_number" placeholder="Número de Voucher" oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"> <br>

              <label>
                <span class="input" v-show="!voucher">Comprobante de pago</span>

                <img class="voucher" :src="voucher">

                <input type="file" @change="onFileChange">
              </label>
            </div>

            <div v-if="pay_method == 'cash'"> <br>
              <small>Monto: {{ remaining }}</small> <br>
            </div>

          </div>


          <small v-if="error" style="color: red;"><br> {{ error }}</small>
          <small v-if="success" class="success">Activación Enviada</small> <br>

          <button class="button" v-show="!sending" @click="POST">Ordenar productos</button>
          <button class="button" v-show= "sending" disabled>Enviando orden ...</button>

          <br><br><br>

        </div>

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
      current_points: null,
      current_profit: null,
      products: null,
      product:  null,
      balance:  null,
     _balance:  null,
     //  office:   null,
      check:    false,
      voucher:  null,

      error: null,

      file:    null,
      office:  null,
      offices: null,

      loading: true,
      sending: false,
      success: false,

      pending: false,

      tab: null,

      pay_method: null,

      bank: null,
      date: null,
      voucher_number: null,
    }
  },
  computed: {
    session()   { return this.$store.state.session   },
    office_id() { return this.$store.state.office_id },

    price()   {
      console.log('price')
      let price = this.products.reduce((a, b) => a + b.price  * b.total, 0)
      return price
    },
    points() { return this.products.reduce((a, b) => a + b.points * b.total, 0) },
    commission() { return this.products.reduce((a, b) => a + (b.val ? b.val : b.price) * b.total, 0) },
    total()  { return this.products.reduce((a, b) => a + b.total, 0) },

    _price()  { return `Total: $ ${this.price}` },
    _points() { return `A comisionar: ${this.commission}` },

    IGV()     { return this.price - this.price / 1.18 },

    remaining() {
      if(this.check) {
        let ret = this.price - (this.balance + this._balance)

        return ret > 0 ? ret : 0

      } else {
        return this.price
      }
    },

    categories() {
      const arr = this.products.map(function(x) { return x.type })

      let ret = arr.filter(function (v, i, self) {
        return i == self.indexOf(v);
      })

      return ret
    }
  },
  async created() {
    // GET data
    const { data } = await api.Activation.GET(this.session); console.log({ data })

    this.loading = false

    // error
    if(data.error && data.msg == 'invalid session') this.$router.push('/login')

    // success
    this.$store.commit('SET_NAME',       data.name)
    this.$store.commit('SET_LAST_NAME',  data.lastName)
    this.$store.commit('SET_AFFILIATED', data.affiliated)
    this.$store.commit('SET_ACTIVATED',  data.activated)
    this.$store.commit('SET__ACTIVATED', data._activated)
    this.$store.commit('SET_PLAN',       data.plan)
    this.$store.commit('SET_COUNTRY',    data.country)
    this.$store.commit('SET_PHOTO',      data.photo)
    this.$store.commit('SET_TREE',       data.tree)

    this.current_points = data.points
    this.current_profit = data.profit
    this.products = data.products.map(a => ({ ...a, total: 0 }))
    this.product  = this.products[0]

    this.balance  = data.balance
    this._balance = data._balance

    if(this.office_id) this.office = this.office_id

    this.offices = data.offices

    this.tab = this.categories[0]

  },
  methods: {
    touch(i) {
      this.product = this.products[i]
    },
    more(product) {
      if (product.total == 10) return
      product.total += 1
    },
    less(product) {
      if (product.total == 0) return
      product.total -= 1
    },
    onFileChange(e) {

      this.file = e.target.files[0]

      const reader = new FileReader()
      reader.onload = (e) => { this.voucher = e.target.result }

      reader.readAsDataURL(this.file)

    },
    reset() {
      console.log('reset ...')

      this.products.forEach(product => {
        product.total = 0
      })
    },
    async POST() {

      let { products, office, check, voucher, pay_method, bank, date, voucher_number } = this

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

      if(!this.total) {
        this.error = 'Seleccione productos'
        return
      }

      if(!office) {
        this.error = 'Seleccione oficina'
        return
      }

      if(!check && !pay_method) {
        this.error = 'Seleccione Medio de Pago'
        return
      }

      if(check && this.remaining && !pay_method) {
        this.error = 'Seleccione Medio de Pago'
        return
      }

      this.error = null

      // POST Affiliation
      this.sending = true

      if(voucher) voucher = await lib.upload(this.file, this.file.name, 'activations')

      const { data } = await api.Activation.POST(this.session, {
        products,
        voucher,
        office: office.id,
        check,
        pay_method,
        bank,
        date,
        voucher_number,
      })

      this.sending = false

      this.success = true

      this.reset()
    },
  },
}
</script>


<style lang="stylus">
  ._tabs
    display flex
    overflow auto
    ._tab
      padding 8px 12px
      background white
      border-radius 12px 12px 0 0
      font-weight 300
      font-size 12px
      cursor pointer
      text-wrap nowrap
      &.selected
        font-weight 600

  .product
    small
      width 240px
      font-weight 300
    ._name
      font-weight 600
      font-size 12.5px

  ._light
    font-weight 300
    font-size 12.5px

  ._price
    font-weight 600

</style>
