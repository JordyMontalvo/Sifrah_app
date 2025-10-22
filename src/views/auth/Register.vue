<template>
  <Auth>
    <section>
      <div class="register-title-form">
        <h1>REGÍSTRATE</h1>
      </div>
      
      <!-- Documento de Identidad -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="dni"
            class="input-register-new"
            placeholder="Documento de identidad"
            oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
            v-model="dni"
            :class="{ error: error.dni }"
            @keydown="reset('dni')"
          />
          <i class="fas fa-id-card overflow-icon"></i>
        </div>
      </div>

      <!-- Checkbox menor de edad -->
      <div class="checkbox-field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="younger" class="checkbox-input" />
          <span class="checkbox-text">Menor de edad / extranjero</span>
        </label>
      </div>

      <!-- Nombre y Apellido en fila -->
      <div class="form-row">
        <div class="form-field">
          <div class="input-container">
            <input
              id="name"
              class="input-register-new"
              placeholder="Nombre"
              v-model="name"
              :class="{ error: error.name }"
              @keydown="reset('name')"
            />
            <i class="fas fa-user input-icon"></i>
          </div>
        </div>
        <div class="form-field">
          <div class="input-container">
            <input
              id="lastName"
              class="input-register-new"
              placeholder="Apellido"
              v-model="lastName"
              :class="{ error: error.lastName }"
              @keydown="reset('lastName')"
            />
            <i class="fas fa-user input-icon"></i>
          </div>
        </div>
      </div>

      <!-- Celular -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="phone"
            class="input-register-new"
            placeholder="Celular"
            oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')"
            v-model="phone"
            :class="{ error: error.phone }"
            @keydown="reset('phone')"
          />
          <i class="fas fa-mobile-alt overflow-icon"></i>
        </div>
      </div>

      <!-- Correo -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="email"
            class="input-register-new"
            type="email"
            placeholder="Correo"
            v-model="email"
            :class="{ error: error.email }"
            @keydown="reset('email')"
          />
          <i class="fas fa-envelope overflow-icon"></i>
        </div>
      </div>

      <!-- Fecha de Nacimiento -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="birthDate"
            class="input-register-new"
            type="date"
            placeholder="dd/mm/aaaa"
            v-model="birthDate"
            :class="{ error: error.birthDate }"
            @keydown="reset('birthDate')"
          />
          <i class="fas fa-calendar-alt overflow-icon"></i>
        </div>
      </div>

      <!-- Depto y Provincia en fila -->
      <div class="form-row">
        <div class="form-field">
          <div class="input-container">
            <select
              id="department"
              class="input-register-new select-field"
              v-model="department"
              :class="{ error: error.department }"
              @change="onDepartmentChange"
            >
              <option value="" disabled>Depto.</option>
              <option v-for="dept in departments" :key="dept.value" :value="dept.value">
                {{ dept.name }}
              </option>
            </select>
            <i class="fas fa-map-marker-alt input-icon"></i>
          </div>
        </div>
        <div class="form-field">
          <div class="input-container">
            <select
              id="province"
              class="input-register-new select-field"
              v-model="province"
              :class="{ error: error.province }"
              @change="onProvinceChange"
              :disabled="!department"
            >
              <option value="" disabled>Provincia</option>
              <option v-for="prov in availableProvinces" :key="prov.value" :value="prov.value">
                {{ prov.name }}
              </option>
            </select>
            <i class="fas fa-map-marker-alt input-icon"></i>
          </div>
        </div>
      </div>

      <!-- Contraseña -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="password"
            class="input-register-new"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            v-model="password"
            :class="{ error: error.password }"
            @keydown="reset('password')"
          />
          <i 
            :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            class="overflow-icon password-icon"
            @click="showPassword = !showPassword"
          ></i>
        </div>
      </div>

      <!-- Código de patrocinador -->
      <div class="form-field">
        <div class="input-container">
          <input
            id="sponsorCode"
            class="input-register-new"
            placeholder="Código de patrocinador"
            v-model="sponsorCode"
            :class="{ error: error.sponsorCode }"
            @keydown="reset('sponsorCode')"
          />
          <i class="fas fa-tag overflow-icon"></i>
        </div>
      </div>

      <!-- Términos y condiciones -->
      <div class="terms-field">
        <label class="checkbox-label">
          <input type="checkbox" v-model="acceptTerms" class="checkbox-input" />
          <span class="checkbox-text">Acepto los términos de uso</span>
        </label>
      </div>

      <!-- Mensaje de alerta -->
      <div v-if="alert" class="alert-message">
        {{ alert | alert }}
      </div>

      <!-- Botón de registro -->
      <button class="register-button" @click="submit" :disabled="sending">
        {{ sending ? 'Registrando...' : 'Registrarme' }}
      </button>

      <!-- Enlace de login -->
      <div class="login-link">
        <small>¿Ya tienes una cuenta? <router-link to="/login">Haz click aquí</router-link></small>
      </div>

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
            class="fab fa-facebook-square social-icon facebook"
            :href="fb"
            target="_blank"
          ></a>
          <a
            class="fab fa-youtube social-icon youtube"
            :href="yt"
            target="_blank"
          ></a>
          <a
            class="fab fa-tiktok social-icon tiktok"
            :href="tk"
            target="_blank"
          ></a>
          <a
            class="fab fa-whatsapp social-icon whatsapp"
            :href="wsp_pe"
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
      birthDate: null,
      email: null,
      phone: null,
      password: "",
      sponsorCode: null,
      acceptTerms: false,
      showPassword: false,
      department: "",
      province: "",
      code: null,
      check: false,
      
      // Datos de ubicación
      departments: [
        { value: 'amazonas', name: 'Amazonas' },
        { value: 'ancash', name: 'Áncash' },
        { value: 'apurimac', name: 'Apurímac' },
        { value: 'arequipa', name: 'Arequipa' },
        { value: 'ayacucho', name: 'Ayacucho' },
        { value: 'cajamarca', name: 'Cajamarca' },
        { value: 'callao', name: 'Callao' },
        { value: 'cusco', name: 'Cusco' },
        { value: 'huancavelica', name: 'Huancavelica' },
        { value: 'huanuco', name: 'Huánuco' },
        { value: 'ica', name: 'Ica' },
        { value: 'junin', name: 'Junín' },
        { value: 'la-libertad', name: 'La Libertad' },
        { value: 'lambayeque', name: 'Lambayeque' },
        { value: 'lima', name: 'Lima' },
        { value: 'loreto', name: 'Loreto' },
        { value: 'madre-de-dios', name: 'Madre de Dios' },
        { value: 'moquegua', name: 'Moquegua' },
        { value: 'pasco', name: 'Pasco' },
        { value: 'piura', name: 'Piura' },
        { value: 'puno', name: 'Puno' },
        { value: 'san-martin', name: 'San Martín' },
        { value: 'tacna', name: 'Tacna' },
        { value: 'tumbes', name: 'Tumbes' },
        { value: 'ucayali', name: 'Ucayali' }
      ],
      
      // Datos estáticos de provincias por departamento
      provincesData: {
        'amazonas': [
          { value: 'bagua', name: 'Bagua' },
          { value: 'bongara', name: 'Bongará' },
          { value: 'chachapoyas', name: 'Chachapoyas' },
          { value: 'condorcanqui', name: 'Condorcanqui' },
          { value: 'luya', name: 'Luya' },
          { value: 'rodriguez-de-mendoza', name: 'Rodríguez de Mendoza' },
          { value: 'utcubamba', name: 'Utcubamba' }
        ],
        'lima': [
          { value: 'lima', name: 'Lima' },
          { value: 'barranca', name: 'Barranca' },
          { value: 'cajatambo', name: 'Cajatambo' },
          { value: 'canta', name: 'Canta' },
          { value: 'cañete', name: 'Cañete' },
          { value: 'huaral', name: 'Huaral' },
          { value: 'huarochiri', name: 'Huarochirí' },
          { value: 'huaura', name: 'Huaura' },
          { value: 'oyon', name: 'Oyón' },
          { value: 'yauyos', name: 'Yauyos' }
        ],
        'arequipa': [
          { value: 'arequipa', name: 'Arequipa' },
          { value: 'camana', name: 'Camaná' },
          { value: 'caraveli', name: 'Caravelí' },
          { value: 'castilla', name: 'Castilla' },
          { value: 'caylloma', name: 'Caylloma' },
          { value: 'condesuyos', name: 'Condesuyos' },
          { value: 'islay', name: 'Islay' },
          { value: 'la-union', name: 'La Unión' }
        ],
        'cusco': [
          { value: 'cusco', name: 'Cusco' },
          { value: 'aconcagua', name: 'Acomayo' },
          { value: 'anta', name: 'Anta' },
          { value: 'calca', name: 'Calca' },
          { value: 'canas', name: 'Canas' },
          { value: 'canchis', name: 'Canchis' },
          { value: 'chumbivilcas', name: 'Chumbivilcas' },
          { value: 'espinar', name: 'Espinar' },
          { value: 'la-convencion', name: 'La Convención' },
          { value: 'paruro', name: 'Paruro' },
          { value: 'paucartambo', name: 'Paucartambo' },
          { value: 'quispicanchi', name: 'Quispicanchi' },
          { value: 'urubamba', name: 'Urubamba' }
        ],
        'callao': [
          { value: 'callao', name: 'Callao' }
        ],
        'piura': [
          { value: 'piura', name: 'Piura' },
          { value: 'ayabaca', name: 'Ayabaca' },
          { value: 'huancabamba', name: 'Huancabamba' },
          { value: 'morropon', name: 'Morropón' },
          { value: 'paita', name: 'Paita' },
          { value: 'sullana', name: 'Sullana' },
          { value: 'talara', name: 'Talara' },
          { value: 'sechura', name: 'Sechura' }
        ],
        'la-libertad': [
          { value: 'trujillo', name: 'Trujillo' },
          { value: 'asuncion', name: 'Ascope' },
          { value: 'bolivar', name: 'Bolívar' },
          { value: 'chepen', name: 'Chepén' },
          { value: 'gran-chimu', name: 'Gran Chimú' },
          { value: 'julcan', name: 'Julcán' },
          { value: 'otuzco', name: 'Otuzco' },
          { value: 'pacasmayo', name: 'Pacasmayo' },
          { value: 'pataz', name: 'Pataz' },
          { value: 'sanchez-carrion', name: 'Sánchez Carrión' },
          { value: 'santiago-de-chuco', name: 'Santiago de Chuco' },
          { value: 'viru', name: 'Virú' }
        ],
        'lambayeque': [
          { value: 'chiclayo', name: 'Chiclayo' },
          { value: 'ferreñafe', name: 'Ferreñafe' },
          { value: 'lambayeque', name: 'Lambayeque' }
        ],
        'ancash': [
          { value: 'huaraz', name: 'Huaraz' },
          { value: 'aija', name: 'Aija' },
          { value: 'antonio-raimondi', name: 'Antonio Raimondi' },
          { value: 'asuncion', name: 'Asunción' },
          { value: 'bolognesi', name: 'Bolognesi' },
          { value: 'carhuaz', name: 'Carhuaz' },
          { value: 'carlos-fermin-fitzcarrald', name: 'Carlos Fermín Fitzcarrald' },
          { value: 'casma', name: 'Casma' },
          { value: 'corongo', name: 'Corongo' },
          { value: 'huari', name: 'Huari' },
          { value: 'huarmey', name: 'Huarmey' },
          { value: 'huaylas', name: 'Huaylas' },
          { value: 'mariscal-luzuriaga', name: 'Mariscal Luzuriaga' },
          { value: 'ocros', name: 'Ocros' },
          { value: 'pallasca', name: 'Pallasca' },
          { value: 'pomabamba', name: 'Pomabamba' },
          { value: 'recuay', name: 'Recuay' },
          { value: 'santa', name: 'Santa' },
          { value: 'sihuas', name: 'Sihuas' },
          { value: 'yungay', name: 'Yungay' }
        ],
        'junin': [
          { value: 'huancayo', name: 'Huancayo' },
          { value: 'concepcion', name: 'Concepción' },
          { value: 'chanchamayo', name: 'Chanchamayo' },
          { value: 'jauja', name: 'Jauja' },
          { value: 'junin', name: 'Junín' },
          { value: 'satipo', name: 'Satipo' },
          { value: 'tarma', name: 'Tarma' },
          { value: 'yauli', name: 'Yauli' },
          { value: 'chupaca', name: 'Chupaca' }
        ],
        'ica': [
          { value: 'ica', name: 'Ica' },
          { value: 'chincha', name: 'Chincha' },
          { value: 'nazca', name: 'Nazca' },
          { value: 'palpa', name: 'Palpa' },
          { value: 'pisco', name: 'Pisco' }
        ],
        'ayacucho': [
          { value: 'huamanga', name: 'Huamanga' },
          { value: 'cangallo', name: 'Cangallo' },
          { value: 'huanca-sancos', name: 'Huanca Sancos' },
          { value: 'huanta', name: 'Huanta' },
          { value: 'la-mar', name: 'La Mar' },
          { value: 'lucanas', name: 'Lucanas' },
          { value: 'parinacochas', name: 'Parinacochas' },
          { value: 'paucar-del-sara-sara', name: 'Paucar del Sara Sara' },
          { value: 'sucre', name: 'Sucre' },
          { value: 'victor-fajardo', name: 'Víctor Fajardo' },
          { value: 'vileas-huaman', name: 'Vilcas Huamán' }
        ],
        'cajamarca': [
          { value: 'cajamarca', name: 'Cajamarca' },
          { value: 'cajabamba', name: 'Cajabamba' },
          { value: 'celendin', name: 'Celendín' },
          { value: 'chota', name: 'Chota' },
          { value: 'contumaza', name: 'Contumazá' },
          { value: 'cutervo', name: 'Cutervo' },
          { value: 'hualgayoc', name: 'Hualgayoc' },
          { value: 'jaen', name: 'Jaén' },
          { value: 'san-ignacio', name: 'San Ignacio' },
          { value: 'san-marcos', name: 'San Marcos' },
          { value: 'san-miguel', name: 'San Miguel' },
          { value: 'san-pablo', name: 'San Pablo' },
          { value: 'santa-cruz', name: 'Santa Cruz' }
        ],
        'huancavelica': [
          { value: 'huancavelica', name: 'Huancavelica' },
          { value: 'acobamba', name: 'Acobamba' },
          { value: 'angaraes', name: 'Angaraes' },
          { value: 'castrovirreyna', name: 'Castrovirreyna' },
          { value: 'churcampa', name: 'Churcampa' },
          { value: 'huaytara', name: 'Huaytará' },
          { value: 'tayacaja', name: 'Tayacaja' }
        ],
        'huanuco': [
          { value: 'huanuco', name: 'Huánuco' },
          { value: 'ambo', name: 'Ambo' },
          { value: 'dos-de-mayo', name: 'Dos de Mayo' },
          { value: 'huacaybamba', name: 'Huacaybamba' },
          { value: 'huamalies', name: 'Huamalíes' },
          { value: 'leoncio-prado', name: 'Leoncio Prado' },
          { value: 'marañon', name: 'Marañón' },
          { value: 'pachitea', name: 'Pachitea' },
          { value: 'puerto-inca', name: 'Puerto Inca' },
          { value: 'lauricocha', name: 'Lauricocha' },
          { value: 'yarowilca', name: 'Yarowilca' }
        ],
        'loreto': [
          { value: 'maynas', name: 'Maynas' },
          { value: 'alto-amazonas', name: 'Alto Amazonas' },
          { value: 'loreto', name: 'Loreto' },
          { value: 'mariscal-ramon-castilla', name: 'Mariscal Ramón Castilla' },
          { value: 'putumayo', name: 'Putumayo' },
          { value: 'requena', name: 'Requena' },
          { value: 'ucayali', name: 'Ucayali' },
          { value: 'datem-del-marañon', name: 'Datem del Marañón' }
        ],
        'madre-de-dios': [
          { value: 'tambopata', name: 'Tambopata' },
          { value: 'manu', name: 'Manu' },
          { value: 'tahuamanu', name: 'Tahuamanu' }
        ],
        'moquegua': [
          { value: 'moquegua', name: 'Moquegua' },
          { value: 'general-sanchez-cerro', name: 'General Sánchez Cerro' },
          { value: 'ilo', name: 'Ilo' }
        ],
        'pasco': [
          { value: 'pasco', name: 'Pasco' },
          { value: 'daniel-alcides-carrion', name: 'Daniel Alcides Carrión' },
          { value: 'oxapampa', name: 'Oxapampa' }
        ],
        'puno': [
          { value: 'puno', name: 'Puno' },
          { value: 'azangaro', name: 'Azángaro' },
          { value: 'carabaya', name: 'Carabaya' },
          { value: 'chucuito', name: 'Chucuito' },
          { value: 'el-collao', name: 'El Collao' },
          { value: 'huancane', name: 'Huancané' },
          { value: 'lampa', name: 'Lampa' },
          { value: 'melgar', name: 'Melgar' },
          { value: 'moho', name: 'Moho' },
          { value: 'san-antonio-de-putina', name: 'San Antonio de Putina' },
          { value: 'san-roman', name: 'San Román' },
          { value: 'sandia', name: 'Sandia' },
          { value: 'yunguyo', name: 'Yunguyo' }
        ],
        'san-martin': [
          { value: 'moyobamba', name: 'Moyobamba' },
          { value: 'bellavista', name: 'Bellavista' },
          { value: 'el-dorado', name: 'El Dorado' },
          { value: 'huallaga', name: 'Huallaga' },
          { value: 'lamas', name: 'Lamas' },
          { value: 'mariscal-caceres', name: 'Mariscal Cáceres' },
          { value: 'picota', name: 'Picota' },
          { value: 'rioja', name: 'Rioja' },
          { value: 'san-martin', name: 'San Martín' },
          { value: 'tocache', name: 'Tocache' }
        ],
        'tacna': [
          { value: 'tacna', name: 'Tacna' },
          { value: 'candarave', name: 'Candarave' },
          { value: 'jorge-basadre', name: 'Jorge Basadre' },
          { value: 'tarata', name: 'Tarata' }
        ],
        'tumbes': [
          { value: 'tumbes', name: 'Tumbes' },
          { value: 'contralmirante-villar', name: 'Contralmirante Villar' },
          { value: 'zarumilla', name: 'Zarumilla' }
        ],
        'ucayali': [
          { value: 'coronel-portillo', name: 'Coronel Portillo' },
          { value: 'atalaya', name: 'Atalaya' },
          { value: 'padre-abad', name: 'Padre Abad' },
          { value: 'purus', name: 'Purus' }
        ],
        'apurimac': [
          { value: 'abancay', name: 'Abancay' }
        ]
      },
      availableProvinces: [],
      
      error: {
        country: false,
        dni: false,
        name: false,
        lastName: false,
        birthDate: false,
        email: false,
        phone: false,
        department: false,
        province: false,
        password: false,
        sponsorCode: false,
      },
      sending: false,
      alert: null,
      disabled: false,
      show: false,
    };
  },
  filters: {
      alert(msg) {
        if (msg === "dni already use") return "El documento ya existe";
        if (msg === "email already use") return "El correo electrónico ya está en uso";
        if (msg === "code not found") return "El código de invitación no existe";
        if (msg === "code required") return "El código de patrocinador es requerido";
        return msg;
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
    wsp_pe() {
      return this.$store.state.wsp_pe;
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
    
    // Si viene código en la URL, pre-llenarlo en el campo de patrocinador
    if (this.code) {
      this.sponsorCode = this.code;
      this.disabled = true;
    }

    setTimeout(() => {
      const logoAuth = document.getElementById("logo-auth");
      console.log(logoAuth);
      logoAuth.style.order = 1;
      logoAuth.style.transition = "all 0.80s ease";

      const contentAuth = document.getElementById("content-auth");
      console.log(contentAuth);
      contentAuth.style.order = 0;
      contentAuth.style.transition = "all 0.80s ease";
    }, 100);

    setTimeout(() => {
      const tabs = document.getElementById("tabs");
      console.log(tabs);
      tabs.style.transform = "translateX(170%)";
      tabs.style.right = "25%";
      tabs.style.transition = "all 0.80s ease";
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
      const { dni, name, lastName, password, phone, sponsorCode, email, birthDate, acceptTerms, department, province } = this;

      if (!dni) {
        this.error.dni = true;
        this.alert = "El documento se requiere";
        return;
      }
      if (!name) {
        this.error.name = true;
        this.alert = "El nombre se requiere";
        return;
      }
      if (!lastName) {
        this.error.lastName = true;
        this.alert = "El apellido se requiere";
        return;
      }
      if (!email) {
        this.error.email = true;
        this.alert = "El correo se requiere";
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.error.email = true;
        this.alert = "El correo no tiene un formato válido";
        return;
      }
      if (!birthDate) {
        this.error.birthDate = true;
        this.alert = "La fecha de nacimiento se requiere";
        return;
      }
      if (!password) {
        this.error.password = true;
        this.alert = "La contraseña es requerida";
        return;
      }
      if (!sponsorCode) {
        this.error.sponsorCode = true;
        this.alert = "El código de patrocinador es requerido";
        return;
      }
      if(!phone) {
        this.error.phone = true;
        this.alert = "El telefono se requiere";
        return;
      }
      if (!department) {
        this.error.department = true;
        this.alert = "Debe seleccionar un departamento";
        return;
      }
      if (!province) {
        this.error.province = true;
        this.alert = "Debe seleccionar una provincia";
        return;
      }
      if (!acceptTerms) {
        this.alert = "Debes aceptar los términos.";
        return;
      }

      this.sending = true;

      try {
        const { data } = await api.register({
          dni,
          name,
          lastName,
          email,
          date: birthDate,
          password,
          phone,
          code: sponsorCode,
          department,
          province,
        });

        this.sending = false;

        if (data.error) {
          this.alert = data.msg;
          return;
        }

        const session = localStorage.getItem("session");
        if (session) {
          localStorage.removeItem("session");
          api.logout(this.session);
        }

        this.$store.commit("SET_SESSION", data.session);
        
        // Redirigir según el estado de afiliación
        if (data.affiliated) {
          this.$router.push("/dashboard");
        } else {
          this.$router.push("/affiliation");
        }
      } catch (err) {
        this.sending = false;
        this.alert = "Error al registrar. Por favor intenta nuevamente.";
      }
    },

    reset(name) {
      this.alert = null;

      if (name == "dni") this.error.dni = false;
      if (name == "name") this.error.name = false;
      if (name == "lastName") this.error.lastName = false;
      if (name == "phone") this.error.phone = false;
      if (name == "email") this.error.email = false;
      if (name == "birthDate") this.error.birthDate = false;
      if (name == "password") this.error.password = false;
      if (name == "sponsorCode") this.error.sponsorCode = false;
      if (name == "department") this.error.department = false;
      if (name == "province") this.error.province = false;
    },

    async onDepartmentChange() {
      this.reset('department');
      
      // Limpiar provincias cuando cambia el departamento
      this.province = "";
      this.availableProvinces = [];
      
      if (!this.department) return;
      
      // Primero intentar con datos estáticos
      if (this.provincesData[this.department]) {
        this.availableProvinces = this.provincesData[this.department];
        return;
      }
      
      // Si no hay datos estáticos, intentar con la API
      try {
        const response = await fetch(`/api/app/delivery?type=provinces&department=${this.department}`);
        const data = await response.json();
        
        if (data.provinces && data.provinces.length > 0) {
          this.availableProvinces = data.provinces;
        } else {
          // Si la API no tiene datos, mostrar mensaje
          console.warn(`No hay datos de provincias para ${this.department}`);
          this.availableProvinces = [];
        }
      } catch (error) {
        console.error('Error cargando provincias desde API:', error);
        this.availableProvinces = [];
      }
    },

    async onProvinceChange() {
      this.reset('province');
      
      if (!this.province || !this.department) return;
    },
  },
};
</script>
<style scoped lang="stylus">
@import '~@/assets/style/register.styl';
</style>

