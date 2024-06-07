<template>
  <div class="app">
    <header :class="{ silver: plan == 'business', gold: plan == 'master' }">

      <h3 class="slogan">
        <span v-if="country == 'Perú'"       style="font-size: 28px;">🇵🇪</span>
        <span v-if="country == 'Bolivia'"    style="font-size: 28px;">🇧🇴</span>
        <span v-if="country == 'Ecuador'"    style="font-size: 28px;">🇪🇨</span>
        <span v-if="country == 'Colombia'"   style="font-size: 28px;">🇨🇴</span>
        <span v-if="country == 'Argentina'"  style="font-size: 28px;">🇦🇷</span>
        <span v-if="country == 'Chile'"      style="font-size: 28px;">🇨🇱</span>
        <span v-if="country == 'Costa Rica'" style="font-size: 28px;">🇨🇷</span>
          &nbsp;&nbsp;&nbsp;SUEÑA SIN LIMITES
      </h3>

      <i class="burger fas fa-bars" @click="opened"></i>

      <h4>{{ name }} {{ lastName }} <i class="avatar fas fa-user"
                      :class="{'yellow': affiliated, 'blue': _activated, 'green': activated}"></i>
      </h4>

    </header>
    <section :class="{ 'open': open }">

      <div class="menu">
        
        <label v-if="office_id == null">
          <img v-if="photoState == 'default'" class="photo" :src="photo">
          <img v-if="photoState == 'changed'" class="photo" :src="newPhoto">

          <input type="file" @change="changePhoto">
        </label>

        <div v-if="photoState == 'changed'" class="controls" >
          <i @click="cancelNewPhoto" class="fas fa-times"></i>
          <i @click="changeNewPhoto" class="fas fa-check"></i>
        </div>

        <div class="social" style="display: flex;" v-if="office_id == null">
          <a class="fab fa-facebook-square" :href="fb" target="_blank" style="font-size: 18px;color: #4267B2;"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank" style="font-size: 18px;color: #e95950;"></a>
          <a class="fab fa-youtube"         :href="yt" target="_blank" style="font-size: 18px;color: #ff0050;"></a>
        </div>

        <router-link to="/dashboard" @click.native="close" v-if="office_id == null">
          <i class="fas fa-home"></i> INICIO
        </router-link>
        <!-- <router-link to="/status" @click.native="close">
          <i class="fas fa-tachometer-alt"></i> ESTADO
        </router-link> -->

        <a @click="actived(0)">
          <i class="fas fa-caret-down"></i> PRODUCTOS
        </a>
        <div class="sub-menu" :class="{'active': buys}">
          <router-link to="/activation" @click.native="close" v-if="affiliated">
            <i class="fas fa-shopping-bag"></i> COMPRAS
          </router-link>
          <router-link to="/affiliation" @click.native="close">
            <i class="fas fa-receipt"></i> AFILIACIÓN
          </router-link>
        </div>

        <a @click="actived(1)" v-if="tree">
        <!-- <a @click="actived(1)"> -->
          <i class="fas fa-caret-down"></i> ORGANIZACIÓN
        </a>
        <div class="sub-menu" :class="{'active': network}">
          <router-link to="/tree" @click.native="close">
            <i class="fas fa-project-diagram"></i> RED
          </router-link>
          <router-link to="/directs" @click.native="close">
            <i class="fas fa-users"></i> REGISTROS
          </router-link>
          <!-- <router-link to="/closeds" @click.native="close">
            <i class="fas fa-users"></i> CIERRES
          </router-link> -->
        </div>

        <!-- <a @click="actived(2)" v-if="tree && office_id == null"> -->
        <a @click="actived(2)">
          <i class="fas fa-caret-down"></i> COMISIONES
        </a>
        <div class="sub-menu" :class="{'active': commissions}">
          <!-- <router-link to="/bonuses" @click.native="close">
            <i class="fas fa-gem"></i> BONOS
          </router-link> -->
          <router-link to="/transfer" @click.native="close">
            <i class="fas fa-wallet"></i> MONEDERO
          </router-link>
          <router-link to="/transactions" @click.native="close">
            <i class="fas fa-dollar-sign"></i> MOVIMIENTOS
          </router-link>
          <router-link to="/collect" @click.native="close">
            <i class="fas fa-hand-holding-usd"></i> RETIROS
          </router-link>
        </div>

        <a @click="actived(3)" v-if="tree && office_id == null">
          <i class="fas fa-caret-down"></i> RESUMEN
        </a>
        <div class="sub-menu" :class="{'active': resume}">
          <router-link to="/bonuses" @click.native="close" v-if="affiliated">
            <i class="fas fa-shopping-bag"></i> BONIFICACIONES
          </router-link>
          <router-link to="/resume" @click.native="close">
            <i class="fas fa-users"></i> PERSONAL
          </router-link>
          <router-link to="/closeds" @click.native="close">
            <i class="fas fa-users"></i> CIERRES
          </router-link>
        </div>

        <!-- <router-link to="/tools" @click.native="close" v-if="office_id == null">
          <i class="fas fa-file-pdf"></i> HERRAMIENTAS
        </router-link> -->

        <router-link to="/tools" @click.native="close" v-if="office_id == null">
          <i class="fa-solid fa-graduation-cap"></i> EDUCACIÓN
        </router-link>

        <router-link to="/profile" @click.native="close" v-if="office_id == null">
          <i class="fas fa-user"></i> PERFIL
        </router-link>

        <br>
        <a @click="logout">
          <i class="fas fa-sign-out-alt"></i> CERRAR SESIÓN
        </a>

      </div>

      <div class="content">
        <header>
          <div style="display: flex; align-items: center;">
            <img class="logo" src="@/assets/img/logo/logo.svg" style="height: 64px;">
            <!-- <img class="logo-text" src="@/assets/img/logo/text.svg" style="margin-left: 12px;"> -->
          </div>
          <!-- <div class="social">
            <a class="fab fa-facebook-square" :href="fb" target="_blank" style="color: #4267B2;"></a>
            <a class="fab fa-instagram"       :href="is" target="_blank" style="color: #e95950;"></a>
            <a class="fab fa-tiktok"          :href="tk" target="_blank" style="color: #ff0050;"></a>
            <a class="fab fa-youtube"         :href="yt" target="_blank" style="color: #ff0050;"></a>
          </div> -->
        </header>
        <section style="overflow: auto;">

          <slot/>

        </section>

      </div>

    </section>

    <footer>
      <router-link to="/dashboard">
        <i class="fa-solid fa-house"></i>
        Inicio
      </router-link>
      <router-link to="/activation" v-if="affiliated">
        <i class="fas fa-shopping-bag"></i>
        Compras
      </router-link>
      <router-link to="/affiliation" v-if="!affiliated">
        <i class="fas fa-shopping-bag"></i>
        Plan
      </router-link>
      <router-link to="/tree" v-if="tree">
        <i class="fas fa-project-diagram"></i>
        Red
      </router-link>
      <router-link to="/collect" v-if="tree">
        <i class="fas fa-hand-holding-usd"></i>
        Retiros
      </router-link>
    </footer>

    <a :href="wsp" target="_blank" class="wsp fab fa-whatsapp"></a>
  </div>
</template>

<script>
import api from '@/api'
import lib from '@/lib'

export default {
  props: {
    session: String,
    office_id: String,
  },
  data() {
    return {
      // photo: 'https://ik.imagekit.io/asu/Lehaim/avatar_bEyc3MFLf.png',
      newPhoto: null,
      photoState: 'default',
      photoFile: null,
    }
  },
  computed: {
    // user
    name      () { return this.$store.state.name       },
    lastName  () { return this.$store.state.lastName   },
    affiliated() { return this.$store.state.affiliated },
    activated () { return this.$store.state.activated  },
    _activated () { return this.$store.state._activated },
    plan      () { return this.$store.state.plan       },
    country   () { return this.$store.state.country    },
    photo     () { return this.$store.state.photo      },
    tree      () { return this.$store.state.tree       },

    // social
    fb() { return this.$store.state.fb },
    is() { return this.$store.state.is },
    tk() { return this.$store.state.tk },
    yt() { return this.$store.state.yt },

    // help
    wsp() {
      if(this.country == 'Perú')    return this.$store.state.wsp_pe
      if(this.country == 'Bolivia') return this.$store.state.wsp_bo
      if(this.country == 'Ecuador') return this.$store.state.wsp_ec
    },

    // menú
    open()        { return this.$store.state.open        },
    resume()      { return this.$store.state.resume      },
    buys()        { return this.$store.state.buys        },
    network()     { return this.$store.state.network     },
    commissions() { return this.$store.state.commissions },
  },
  methods: {
    opened() {
      this.$store.commit('SET_OPEN')
    },
    actived(i) {
      if(i == 0)this.$store.commit('SET_BUYS')
      if(i == 1)this.$store.commit('SET_NETWORK')
      if(i == 2)this.$store.commit('SET_COMMISSIONS')
      if(i == 3)this.$store.commit('SET_RESUME')
    },
    close() {
      this.$store.commit('SET_OPEN')
    },
    changePhoto(e) {
      this.photoFile = e.target.files[0]

      if(!this.photoFile) return

      const reader = new FileReader()

      reader.onload = (e) => {
        this.newPhoto = e.target.result
        this.photoState = 'changed'
      }

      reader.readAsDataURL(this.photoFile)
    },
    async changeNewPhoto() {
      const ret = await lib.upload(this.photoFile, this.photoFile.name, 'photos')

      this.$store.commit('SET_PHOTO', ret)

      this.photoState = 'default'

      await api.photo(this.session, { photo: this.photo })
    },
    cancelNewPhoto() {
      this.photoState = 'default'
    },
  },
};
</script>
