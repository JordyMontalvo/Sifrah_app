<template>
  <App :session="session" :office_id="office_id" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />
    <div v-if="!loading" class="directs-container">
      <!-- Header morado con Nuevo Registro -->
      <div class="header-card">
        <router-link :to="`/register/${token}`" class="new-register-btn">
          Nuevo Registro >>
        </router-link>
        
        <div class="header-fields">
          <div class="field-group">
            <i class="fas fa-user-shield field-icon"></i>
            <input
              class="field-input"
              readonly
              @click="copy_token"
              id="token"
              v-model="token"
              placeholder="Cód. de Asesor"
            />
            <i class="copy-message" v-if="c_token">
              código copiado <i class="fas fa-check"></i>
            </i>
          </div>
          
          <div class="field-group">
            <i class="fas fa-share-alt field-icon"></i>
            <input
              class="field-input"
              readonly
              @click="copy_link"
              id="link"
              v-model="link"
              placeholder="Link de Asesor"
            />
            <i class="copy-message" v-if="c_link">
              link copiado <i class="fas fa-check"></i>
            </i>
          </div>
        </div>
      </div>

      <!-- Búsqueda y filtros -->
      <div class="filters-section">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Búsqueda..."
            class="search-input"
          />
        </div>
        
        <select v-model="selectedState" class="state-select">
          <option value="">Seleccione el Estado</option>
          <option value="affiliated">Afiliado</option>
          <option value="activated">Activo</option>
          <option value="both">Afiliado y Activo</option>
          <option value="none">Ninguno</option>
        </select>
      </div>

      <!-- Tabs y botón Ver toda Mi Red -->
      <div class="tabs-section">
        <div class="tabs">
          <button
            @click="activeTab = 'frontales'"
            :class="['tab', { active: activeTab === 'frontales' }]"
          >
            Frontales
          </button>
          <button
            @click="activeTab = 'directos'"
            :class="['tab', { active: activeTab === 'directos' }]"
          >
            Directos
          </button>
        </div>
        
        <button class="view-network-btn" @click="viewFullNetwork">
          Ver toda Mi Red
        </button>
      </div>

      <!-- Tabla de Frontales -->
      <div v-if="activeTab === 'frontales'" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>E-mail</th>
              <th>Teléfono</th>
              <th>Afiliado</th>
              <th>Activo</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="frontal in filteredFrontals" :key="frontal.id">
              <td>{{ frontal.name }} {{ frontal.lastName }}</td>
              <td>{{ frontal.email || '-' }}</td>
              <td>{{ frontal.phone || '-' }}</td>
              <td>
                <span :class="['status-badge', { 'affiliated': frontal.affiliated, 'not-affiliated': !frontal.affiliated }]">
                  <i :class="['fas', frontal.affiliated ? 'fa-check' : 'fa-times']"></i>
                  {{ frontal.affiliated ? 'Sí' : 'NO' }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', { 'activated': frontal.activated, 'not-activated': !frontal.activated }]">
                  <i :class="['fas', frontal.activated ? 'fa-check' : 'fa-times']"></i>
                  {{ frontal.activated ? 'Sí' : 'NO' }}
                </span>
              </td>
              <td>
                <span class="score-cell">
                  {{ formatPoints(frontal.points) }}
                  <i 
                    class="fab fa-whatsapp whatsapp-icon" 
                    @click.stop="openWhatsApp(frontal.phone)"
                    :class="{ 'disabled': !frontal.phone }"
                    :title="frontal.phone ? `Abrir WhatsApp: ${frontal.phone}` : 'Sin teléfono'"
                  ></i>
                </span>
              </td>
            </tr>
            <tr v-if="filteredFrontals.length === 0">
              <td colspan="6" class="no-data">No hay frontales disponibles</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla de Directos -->
      <div v-if="activeTab === 'directos'" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>E-mail</th>
              <th>Teléfono</th>
              <th>Afiliado</th>
              <th>Activo</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="direct in filteredDirects" :key="direct.id">
              <td>{{ direct.name }} {{ direct.lastName }}</td>
              <td>{{ direct.email || '-' }}</td>
              <td>{{ direct.phone || '-' }}</td>
              <td>
                <span :class="['status-badge', { 'affiliated': direct.affiliated, 'not-affiliated': !direct.affiliated }]">
                  <i :class="['fas', direct.affiliated ? 'fa-check' : 'fa-times']"></i>
                  {{ direct.affiliated ? 'Sí' : 'NO' }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', { 'activated': direct.activated, 'not-activated': !direct.activated }]">
                  <i :class="['fas', direct.activated ? 'fa-check' : 'fa-times']"></i>
                  {{ direct.activated ? 'Sí' : 'NO' }}
                </span>
              </td>
              <td>
                <span class="score-cell">
                  {{ formatPoints(direct.points) }}
                  <i 
                    class="fab fa-whatsapp whatsapp-icon" 
                    @click.stop="openWhatsApp(direct.phone)"
                    :class="{ 'disabled': !direct.phone }"
                    :title="direct.phone ? `Abrir WhatsApp: ${direct.phone}` : 'Sin teléfono'"
                  ></i>
                </span>
              </td>
            </tr>
            <tr v-if="filteredDirects.length === 0">
              <td colspan="6" class="no-data">No hay directos disponibles</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import lib from "@/lib";
import Spinner from "@/components/Spinner.vue";

const ROOT = process.env.VUE_APP_ROOT;
console.log({ ROOT });

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      id: null,
      directs: null,
      frontals: [],
      loading: true,
      // branch: null,
      token: null,

      c_token: false,
      c_link: false,
      
      // Nuevos campos para el diseño
      searchTerm: '',
      selectedState: '',
      activeTab: 'frontales',
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    office_id() {
      return this.$store.state.office_id;
    },
    link() {
      return `${ROOT}/register/${this.token}`;
    },
    title() {
      return "Organización";
    },
    
    // Filtrar frontales
    filteredFrontals() {
      let filtered = this.frontals || [];
      
      // Filtro por búsqueda
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        filtered = filtered.filter(f => 
          (f.name && f.name.toLowerCase().includes(search)) ||
          (f.lastName && f.lastName.toLowerCase().includes(search)) ||
          (f.email && f.email.toLowerCase().includes(search)) ||
          (f.phone && f.phone.toString().includes(search))
        );
      }
      
      // Filtro por estado
      if (this.selectedState) {
        if (this.selectedState === 'affiliated') {
          filtered = filtered.filter(f => f.affiliated);
        } else if (this.selectedState === 'activated') {
          filtered = filtered.filter(f => f.activated);
        } else if (this.selectedState === 'both') {
          filtered = filtered.filter(f => f.affiliated && f.activated);
        } else if (this.selectedState === 'none') {
          filtered = filtered.filter(f => !f.affiliated && !f.activated);
        }
      }
      
      return filtered;
    },
    
    // Filtrar directos
    filteredDirects() {
      let filtered = this.directs || [];
      
      // Filtro por búsqueda
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        filtered = filtered.filter(d => 
          (d.name && d.name.toLowerCase().includes(search)) ||
          (d.lastName && d.lastName.toLowerCase().includes(search)) ||
          (d.email && d.email.toLowerCase().includes(search)) ||
          (d.phone && d.phone.toString().includes(search))
        );
      }
      
      // Filtro por estado
      if (this.selectedState) {
        if (this.selectedState === 'affiliated') {
          filtered = filtered.filter(d => d.affiliated);
        } else if (this.selectedState === 'activated') {
          filtered = filtered.filter(d => d.activated);
        } else if (this.selectedState === 'both') {
          filtered = filtered.filter(d => d.affiliated && d.activated);
        } else if (this.selectedState === 'none') {
          filtered = filtered.filter(d => !d.affiliated && !d.activated);
        }
      }
      
      return filtered;
    },
  },
  // watch: {
  //   async coverage(a, b) {
  //     const { data } = await api.coverage(this.session, {
  //       coverage: this.coverage,
  //     });
  //     console.log({ data });
  //   },
  // },
  async created() {
    // GET data
    const { data } = await api.directs(this.session);
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

    // this.branch = data.branch
    this.token = data.token;
    this.id = data.id;
    // this.coverage = data.coverage; // Removido - ya no se usa
    // this.directs  = data.directs.reverse()
    this.directs = data.directs;
    this.frontals = data.frontals;
    console.log('Directs:', this.directs);
    console.log('Frontals:', this.frontals);
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
      lib.copy("token");
      this.c_token = true;
      setTimeout(() => (this.c_token = false), 4000);
    },
    copy_link() {
      lib.copy("link");
      this.c_link = true;
      setTimeout(() => (this.c_link = false), 4000);
    },
    
    viewFullNetwork() {
      // Navegar a la vista de árbol completa
      this.$router.push('/tree/red');
    },
    
    formatPoints(points) {
      // Formatear puntos con ceros a la izquierda (6 dígitos)
      if (points === null || points === undefined) {
        return '000000';
      }
      const pts = Number(points) || 0;
      return String(pts).padStart(6, '0');
    },
    
    openWhatsApp(phone) {
      // Validar que haya un teléfono
      if (!phone) {
        alert('Este usuario no tiene número de teléfono registrado');
        return;
      }
      
      // Limpiar el número: quitar espacios, guiones, paréntesis y otros caracteres
      let cleanPhone = String(phone).replace(/\D/g, '');
      
      // Si el número está vacío después de limpiar, mostrar error
      if (!cleanPhone || cleanPhone.length === 0) {
        alert('El número de teléfono no es válido');
        return;
      }
      
      // Quitar el 0 inicial si existe (formato peruano con 0 inicial)
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      
      // Si el número no empieza con código de país, asumir que es peruano (51)
      if (!cleanPhone.startsWith('51')) {
        // Si tiene 9 dígitos (formato peruano sin código de país), agregar 51
        if (cleanPhone.length === 9) {
          cleanPhone = '51' + cleanPhone;
        }
        // Si tiene menos de 9 dígitos, también agregar código de país (asumiendo que es peruano)
        else if (cleanPhone.length < 9) {
          cleanPhone = '51' + cleanPhone;
        }
      }
      
      // Abrir WhatsApp con el número formateado
      const whatsappUrl = `https://wa.me/${cleanPhone}`;
      window.open(whatsappUrl, '_blank');
    },
  },

  filters: {
    date(val) {
      if (!val) return "";
      return new Date(val).toLocaleDateString();
    },
  },
};
</script>

<style lang="stylus">
@import '../../assets/style/views/app/Directs.styl'
</style>
