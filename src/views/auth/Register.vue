<template>
  <Auth>
    <section>
      <div
        style="justify-content: center; align-items: center; text-align: center"
      >
        <img
          src="@/assets/img/logo/logo 2 sifrah NARANJA LOGIN.svg"
          style="
            width: 369px;
            height: auto;
            margin-top: -45px;
            margin-bottom: -60px;
          "
        />
        <h2
          style="
            font-size: 16px;
            font-style: roboto;
            color: rgba(137, 136, 141, 1);
            margin-bottom: -35px;
          "
        >
          ¿No tienes cuenta?
        </h2>
        <h1
          style="
            font-size: 35px;
            font-style: roboto;
            color: rgba(40, 167, 69, 1);
            text-decoration: underline;
            margin-bottom: 0px;
          "
        >
          ¡REGÍSTRATE AQUÍ!
        </h1>
      </div>
      <br />

      <!-- <i class="icon fa fa-flag"></i>
      <select class="input" v-model="country"
        :class="{'error': error.country}"
        @change="reset('country')">
        <option value="null" disabled>País</option>
        <option value="Perú"      >🇵🇪 Perú</option>
         <option value="Ecuador"   >🇪🇨 Ecuador</option>
        <option value="Argentina" >🇦🇷 Argentina</option>
        <option value="Bolivia"   >🇧🇴 Bolivia</option>
        <option value="Colombia"  >🇨🇴 Colombia</option>
        <option value="Costa Rica">🇨🇷 Costa Rica</option>
        <option value="Chile"     >🇨🇱 Chile</option> 
      </select> <br> -->

      <input
        class="input-register"
        placeholder="Documento de identidad"
        oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
        v-model="dni"
        :class="{ error: error.dni }"
        @keydown="reset('dni')"
      />
      <i class="icon-register fa fa-id-card"></i>
      <br />
      <div style="margin-right: 140px">
        <label>
          <small style="color :rgba(102, 108, 104, 1) ">
            <input type="checkbox" v-model="younger" />menor de edad /
            extranjero
          </small>
        </label>
      </div>

      <!-- <input class="input" placeholder="Nombre"
      v-model="name"
      :class="{'error': error.name}"
      @keydown="reset('name')"
      :disabled="country == 'Perú' && !younger"> <br> -->

      <input
        class="input-register"
        placeholder="Nombre"
        v-model="name"
        :class="{ error: error.name }"
        @keydown="reset('name')"
      />
      <i class="icon-register fa-solid fa-user-tie"></i>
      <br />
      <input
        class="input-register"
        placeholder="Apellidos"
        v-model="lastName"
        :class="{ error: error.lastName }"
        @keydown="reset('lastName')"
      />
      <i class="icon-register fa-solid fa-user-tie"></i>
      <br />

      <!-- <i class="icon fa-solid fa-user-tie"></i>
      <input class="input" placeholder="Apellidos"
      v-model="lastName"
      :class="{'error': error.lastName}"
      @keydown="reset('lastName')"
      :disabled="country == 'Perú' && !younger"> <br> -->

      <!--<i class="icon fa fa-calendar"></i>
      <input type="date" class="input" placeholder="Fecha de Nacimiento"
      v-model="date"> <br>-->

      <small
        v-if="country"
        style="min-width: 25px; margin-right: 8px; display: inline-block"
        >{{ prefix }}</small
      >
      <div>
        <input
          class="input-register"
          placeholder="Celular"
          maxlength="12"
          v-model="phone"
        />
        <i class="icon-register fa-solid fa-mobile-retro" v-if="!country"></i>
        <br />
      </div>

      <!--<i class="icon fa-solid fa-envelope-open"></i>
      <input class="input" placeholder="Correo"
      v-model.trim="email"> <br>-->

      <!-- <i class="icon-register fa-solid fa-key"></i>-->
      <div>
        <input
          :type="show ? 'text' : 'password'"
          class="input-register"
          placeholder="Contraseña"
          v-model="password"
          :class="{ error: error.password }"
          @keydown="reset('password')"
        />
        <i class="icon-register show far fa-eye" @click="show = !show"></i>
        <br />
      </div>
      <div>
        <input
          class="input-register"
          placeholder="Código de patrocinador"
          :disabled="disabled"
          v-model="code"
          :class="{ error: error.code }"
          @keydown="reset('code')"
        />
        <i class="icon-register fa-solid fa-paper-plane"></i>
      </div>
      <br />

      <p class="alert">{{ alert | alert }}</p>

      <small style="color: rgba(255, 107, 0, 1)"
        ><input type="checkbox" v-model="check" style="color: green;"/>Acepto los
        <a
          href=""
          target="_blank"
          style="color: rgba(137, 136, 141, 1); font-weight: 600"
          >términos de uso</a
        ></small
      >
      <br />

      <button
        class="button"
        v-show="!sending"
        @click="submit"
        style="background: rgba(178, 108, 46, 1); width: 280px"
      >
        Registrarme
      </button>
      <button class="button" v-show="sending" disabled>
        Creando cuenta ...</button
      ><br />
      <small style="color: rgba(137, 136, 141, 1)"
        >¿Ya tienes una cuenta?
        <router-link to="/login" style="color: rgba(255, 107, 0, 1)"
          >Haz click aquí</router-link
        ></small
      >
      <br />
    </section>
    <footer>
      <br />
      <header>
        <div class="social">
          <!-- <a class="fab fa-facebook-square" :href="fb" target="_blank"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank"></a>
          <a class="fab fa-tiktok"          :href="tk" target="_blank"></a>
          <a class="fab fa-youtube"         :href="yt" target="_blank"></a> -->
          <a
            style="padding: 5px"
            class="fab fa-facebook-square social-icon-register facebook"
            :href="fb"
            target="_blank"
          ></a>
          <a
            style="padding: 5px"
            class="fab fa-instagram social-icon-register instagram"
            :href="is"
            target="_blank"
          ></a>
          <!-- <a class="fab fa-tiktok"          target="_blank"></a> -->
          <a
            style="padding: 5px"
            class="fab fa-youtube social-icon-register youtube"
            :href="yt"
            target="_blank"
          ></a>
          <a
            style="padding: 5px"
            class="fab fa-whatsapp social-icon-register whatsapp"
            :href="wsp"
            target="_blank"
          ></a>
        </div>
      </header>
    </footer>
  </Auth>
</template>

<script>
import Auth from "@/views/layouts/Auth";
import api from "@/api";

export default {
  components: { Auth },
  data() {
    return {
      // country: 'Perú',
      // country: 'Bolivia',
      // country: 'Ecuador',
      country: null,

      younger: false,
      dni: null,
      name: null,
      lastName: null,
      // username: null,
      date: null,
      email: null,
      phone: null,
      password: "123456",
      code: null,
      check: false,
      error: {
        country: false,
        dni: false,
        name: false,
        lastName: false,
        // username: false,
        email: false,
        phone: false,
        password: false,
        code: false,
      },
      sending: false,
      alert: null,
      disabled: false,
      show: false,
    };
  },
  filters: {
    alert(msg) {
      // if (msg == 'username already use') return 'El usuario ya existe'
      if (msg == "dni already use") return "El documento ya existe";
      if (msg == "code not found") return "El código de invitación no existe";
    },
  },
  computed: {
    // social
    fb() {
      return this.$store.state.fb;
    },
    is() {
      return this.$store.state.is;
    },
    tk() {
      return this.$store.state.tk;
    },
    yt() {
      return this.$store.state.yt;
    },

    prefix() {
      if (this.country == "Ecuador") return "+593";
      if (this.country == "Perú") return "+51";
      if (this.country == "Argentina") return "+54";
      if (this.country == "Bolivia") return "+591";
      if (this.country == "Colombia") return "+57";
      if (this.country == "Costa Rica") return "+506";
      if (this.country == "Chile") return "+56";
    },
  },
  created() {
    console.log("Register");

    this.code = this.$route.params.code;

    if (this.code) this.disabled = true;

    setTimeout(() => {
      const logoAuth = document.getElementById("logo-auth");
      console.log(logoAuth);
      logoAuth.style.order = 1;

      const contentAuth = document.getElementById("content-auth");
      console.log(contentAuth);
      contentAuth.style.order = 0;
    }, 100);

    // const logoAuth = document.getElementById("logo-auth");
    // console.log(logoAuth);
    // logoAuth.style.order = 1;

    // const contentAuth = document.getElementById("content-auth");
    // console.log(contentAuth);
    // contentAuth.style.order = 0;
  },
  watch: {
    /* async dni(dni) {
      if(this.country != 'Perú' || this.younger) return

      if(dni.length < 8) return

      const response = await fetch(`https://dniruc.apisperu.com/api/v1/dni/${dni}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImhhbnNldmFuZ2VsaXN0YUBnbWFpbC5jb20ifQ.Fa2w9sYLXtcgMbtM58YRiwYvomChYwwMAoIDmYmo1H8`)

      var data = await response.json()
      console.log(data)

      if(data.success == false) {
        console.log('person not found ...')
        this.error.name = true
        return
      }

      this.error.name = false

      this.name     = data.nombres
      this.lastName = data.apellidoPaterno + ' ' + data.apellidoMaterno
    } */
  },
  methods: {
    async submit() {
      // const { name, lastName, username, email, password, phone, code, check } = this
      const { dni, name, lastName, password, phone, code, check } = this;

      // valid fields

      if (!dni) {
        return (this.error.dni = true);
      }
      if (!name) {
        return (this.error.name = true);
      }
      if (!lastName) {
        return (this.error.lastName = true);
      }
      // if(!username) { return this.error.username = true }
      // if(!email)    { return this.error.email    = true }
      if (!password) {
        return (this.error.password = true);
      }
      // if(!phone)    { return this.error.phone    = true }
      if (!code) {
        return (this.error.code = true);
      }
      if (!check) {
        return;
      }

      // POST Register
      this.sending = true;

      // const { data } = await api.register({ name, lastName, username, email, password, phone, code }); console.log({ data })
      const { data } = await api.register({
        dni,
        name,
        lastName,
        password,
        phone,
        code,
      });
      console.log({ data });

      this.sending = false;

      // error
      if (data.error) return (this.alert = data.msg);

      // logout
      const session = localStorage.getItem("session");
      if (session) {
        localStorage.removeItem("session");
        api.logout(this.session);
      }

      // login
      this.$store.commit("SET_SESSION", data.session);

      // routing
      this.$router.push("/dashboard");
    },
    reset(name) {
      this.alert = null;

      if (name == "dni") this.error.dni = false;
      if (name == "name") this.error.name = false;
      if (name == "lastName") this.error.lastName = false;
      // if(name == 'username') this.error.username = false
      // if(name == 'email')    this.error.email    = false
      if (name == "password") this.error.password = false;
      if (name == "code") this.error.code = false;
    },
  },
};
</script>
<style scoped>
input[type="checkbox"]:checked {
  accent-color: green; /* Cambia el color del checkbox a verde en navegadores compatibles */
}

</style>
