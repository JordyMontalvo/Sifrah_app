<template>
  <App :session="session" :office_id="office_id">
    <!-- Selector de modo - aparece primero -->
    <div v-if="!selectedMode" class="mode-selector">
        <h2 class="mode-title" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">SELECCIONAR MODO</h2>
        <div class="cards-container">
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('red')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Red</p>
            <div class="card-icon">
              <!-- Nueva imagen de red jerárquica -->
              <img src="@/assets/img/arbol.svg" alt="Red" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 140px; height: 140px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('frontales')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Frontales</p>
            <div class="card-icon">
              <!-- Nueva imagen de frontales -->
              <img src="@/assets/img/arbol2.svg" alt="Frontales" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 140px; height: 140px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('niveles')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Niveles</p>
            <div class="card-icon">
              <!-- Nueva imagen de niveles -->
              <img src="@/assets/img/actividad.svg" alt="Niveles" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 140px; height: 140px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('actividad')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Actividad</p>
            <div class="card-icon">
              <!-- Nueva imagen de actividad -->
              <img src="@/assets/img/activdad2.svg" alt="Actividad" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 140px; height: 140px; object-fit: contain;">
            </div>
          </div>
        </div>
        <div class="buttons-container">
          <div class="top-buttons">
            <button class="btn btn-green">Periodos Históricos</button>
            <button class="btn btn-green">Recuperar Historial</button>
          </div>
          <div class="bottom-button">
            <button class="btn btn-orange">MAPA DE LA RED</button>
          </div>
        </div>
      </div>

    <!-- Vista de Red - árbol de afiliados -->
    <div v-if="selectedMode === 'red'">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h4>EQUIPO</h4>
        <button @click="$router.push('/tree')" style="padding: 8px 16px; background: #00bcd4; border: none; border-radius: 6px; color: white;">
          Volver al selector
        </button>
      </div>
      
      <i class="load" v-if="loading"></i>

      <div v-if="!loading">
        <!-- <p style="font-weight:bold; font-size:18px; margin-bottom:10px;">Total de puntos grupal: {{ node.total_points }}</p> -->

        <!-- <div v-if="children && children.length && children_points && children_points.length">
          <p style="margin-bottom: 8px; font-weight: bold;">Puntos por cada hijo:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            <div v-for="(child, idx) in children" :key="child.id"
                 style="background: #f0f7fa; border-radius: 12px; box-shadow: 0 2px 8px #00bcd420; padding: 12px 18px; min-width: 180px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-user-circle" style="font-size: 28px; color: #00bcd4;"></i>
              <div style="flex:1;">
                <div style="font-weight: bold; color: #333; font-size: 15px;">{{ child.name }}</div>
                <div style="color: #888; font-size: 13px;">
                  Puntos grupales: <span style="color: #00bcd4; font-weight: bold;">{{ children_points[idx] }}</span>
                </div>
              </div>
            </div> -->
          <!-- </div>
        </div> -->

        <div id="body">
          <div class="tree-container">
            <i v-if="node.parent && node.id != id" class="fas fa-arrow-left" @click="GET(node.parent)" style="position: absolute; right: 0; margin-right: 80px; z-index: 1;"></i>
            <ul class="tree">
              <tree-node :node="node" :session="session" :get-node="GET_NODE" :selected-id="selectedId" @select="click" />
            </ul>
          </div>
        </div>

        <div class="modal" :class="{ open }" @click="closed">
          <div class="inner" @click.stop="">
            <img class="photo" :src="selec_node.photo" style="display:block; margin:auto; border-radius:50%; width:100px; height:100px; object-fit:cover; border:3px solid #00bcd4;">
            <p style="text-align: center; font-size:18px; font-weight:bold; margin:8px 0 0 0;">{{ selec_node.name }} {{ selec_node.lastName }}</p>
            <p style="text-align: center; color:#888; margin:0 0 8px 0;">{{ selec_node.country }}</p>
            <p><b>ID:</b> {{ selec_node.dni }}</p>
            <p><b>Teléfono:</b> {{ selec_node.phone }}</p>
            <p><b>Correo:</b> {{ selec_node.email }}</p>
            <p><b>Rango Cerrado:</b> {{ selec_node._rank | _rank }}</p>
            <p><b>Puntos personales:</b> {{ selec_node.points }}</p>
            <p><b>Puntos de afiliación:</b> {{ selec_node.affiliation_points || 0 }}</p>
            <p><b>Puntos grupales:</b> {{ selec_node.total_points !== undefined ? selec_node.total_points : '—' }}</p>
            <div v-if="modal_children && modal_children.length && modal_children_points && modal_children_points.length">
              <p style="font-weight:bold; margin-bottom: 8px;">Puntos por cada hijo directo:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                <div v-for="(child, idx) in modal_children" :key="child.id" style="background: #f0f7fa; border-radius: 12px; box-shadow: 0 2px 8px #00bcd420; padding: 12px 18px; min-width: 180px; display: flex; align-items: center; gap: 10px;">
                  <i class="fas fa-user-circle" style="font-size: 28px; color: #00bcd4;"></i>
                  <div style="flex:1;">
                    <div style="font-weight: bold; color: #333; font-size: 15px;">{{ child.name }}</div>
                    <div style="color: #888; font-size: 13px;">Puntos grupales: <span style="color: #00bcd4; font-weight: bold;">{{ modal_children_points[idx] }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder para otros modos -->
    <div v-if="['niveles','actividad'].includes(selectedMode)">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #666;">Vista "{{ selectedMode }}" en construcción 🚧</h3>
        <button @click="$router.push('/tree')" style="padding: 8px 16px; background: #00bcd4; border: none; border-radius: 6px; color: white;">
          Volver al selector
        </button>
      </div>
      <div style="text-align:center; margin-top:20px;">
        <p>Esta funcionalidad estará disponible próximamente</p>
      </div>
    </div>
   <!-- vista frontales-->
   <div v-if="selectedMode === 'frontales'">
     <!-- <p style="font-weight:bold; font-size:18px; margin-bottom:10px;">Total de puntos grupal: {{ node.total_points }}</p>  -->
     
     <div v-if="children && children.length && children_points && children_points.length">
       <button @click="$router.push('/tree')" style="padding: 8px 16px; background: #00bcd4; border: none; border-radius: 6px; color: white; float: right;">
         Volver al selector
        </button>
        <i class="load" v-if="loading"></i>
      
      <div v-if="!loading">
    <!-- <p style="margin-bottom: 8px; font-weight: bold;">Puntos por cada hijo:</p> -->
    <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
      <div v-for="(child, idx) in children" :key="child.id"
           style="background: #f0f7fa; border-radius: 12px; box-shadow: 0 2px 8px #00bcd420; padding: 12px 18px; min-width: 180px; display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-user-circle" style="font-size: 28px; color: #00bcd4;"></i>
        <div style="flex:1;">
          <div style="font-weight: bold; color: #333; font-size: 15px;">{{ child.name }}</div>
          <div style="color: #888; font-size: 13px;">
            Puntos grupales: <span style="color: #00bcd4; font-weight: bold;">{{ children_points[idx] }}</span>
          </div>
        </div>
      </div> 
    </div>
  </div>


    <div class="tree-container" style="display: none;">
      <i v-if="node.parent && node.id != id"class="fas fa-arrow-left" @click="GET(node.parent) " style="position: absolute; right: 0; margin-right: 80px; z-index: 1;"></i>
      <ul class="tree">
        <tree-node :node="node" :session="session" :get-node="GET_NODE" :selected-id="selectedId" @select="click" />
      </ul>
    </div>
  </div>
</div>


  </App>
</template>

<script>
import App from '@/views/layouts/App'
import api from '@/api'
import router from '../../router'

// Componente recursivo para renderizar el árbol
const TreeNode = {
  name: 'TreeNode',
  props: ['node', 'session', 'getNode', 'selectedId'],
  data() {
    return {
      expanded: false,
      loading: false,
      children: this.node.children || [],
      children_points: [], // Nuevo: para guardar los puntos por hijo
    }
  },
  computed: {
    isSelected() {
      return this.selectedId === this.node.id
    }
  },
  methods: {
    async expandNode(e) {
      e.stopPropagation();
      if (this.expanded) {
        this.expanded = false
        return
      }
      if (this.children.length === 0 && this.node.childs && this.node.childs.length > 0) {
        this.loading = true
        const { data } = await this.getNode(this.node.id, this.session)
        this.children = data.children || []
        this.children_points = data.children_points || [] // Guardar los puntos por hijo
        this.loading = false
      }
      this.expanded = true
    },
    handleSelect(e) {
      this.$emit('select', this.node)
    }
  },
  render(h) {
    return h('li', {
      class: { 'selected-node': this.isSelected },
      style: { marginBottom: '8px' }
    }, [
      h('span', {
        on: { click: this.handleSelect },
        style: {
          display: 'inline-block',
          background: this.isSelected ? '#e0f7fa' : '#f8f9fa',
          border: this.isSelected ? '2px solid #00bcd4' : '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: '120px',
          boxShadow: this.isSelected ? '0 0 8px #00bcd4' : 'none',
          cursor: 'pointer',
          position: 'relative',
        }
      }, [
        (this.node.childs && this.node.childs.length > 0) ?
          h('i', {
            class: ['fas', this.expanded ? 'fa-minus-square' : 'fa-plus-square'],
            style: { cursor: 'pointer', marginRight: '6px', color: '#00bcd4', fontSize: '18px', position: 'absolute', left: '3px', top: '8px' },
            on: { click: this.expandNode }
          }) : null,
        h('i', { class: ['fas', 'fa-user-tie', { act: this.node.activated, aff: this.node.affiliated }], style: { fontSize: '24px', marginRight: '6px' } }),
        h('i', { class: ['fas', 'fa-gem', this.node.rank], style: { fontSize: '16px', marginRight: '4px' } }),
        h('span', { style: { fontWeight: 'bold', color: '#333' } }, this.node.name),
        h('br'),
        h('span', { style: { color: '#888', fontSize: '12px' } }, `Puntos personales: ${this.node.points}`),
        (this.node.affiliation_points && this.node.affiliation_points > 0) ? h('span', { style: { color: '#ff9800', fontSize: '12px', marginLeft: '8px' } }, `Afiliación: ${this.node.affiliation_points}`) : null,
        (this.node.total_points !== undefined) ? h('span', { style: { color: '#00bcd4', fontSize: '12px', marginLeft: '8px', fontWeight: 'bold' } }, `Total grupal: ${this.node.total_points}`) : null,
      ]),
      this.loading ? h('div', { style: { color: '#00bcd4', fontSize: '12px', marginTop: '4px' } }, [
        h('i', { class: ['fas', 'fa-spinner', 'fa-spin'], style: { marginRight: '6px' } }), 'Cargando...']
      ) : null,
      // Mostrar el desglose de puntos por hijo debajo de los hijos expandidos
      (this.expanded && this.children_points && this.children_points.length > 0) ?
        h('div', { style: { margin: '8px 0 8px 24px', fontSize: '13px', color: '#00bcd4' } }, [
          h(),
          h('ul', { style: { margin: '4px 0 0 0', padding: 0, listStyle: 'none' } },
            this.children_points.map((pts, idx) =>
              h()
            )
          )
        ]) : null,
      (this.expanded && this.children.length > 0)
        ? h('ul', this.children.map(child => h(TreeNode, { props: { node: child, session: this.session, getNode: this.getNode, selectedId: this.selectedId }, on: { select: this.$listeners.select } })))
        : null
    ])
  }
}

export default {
  components: {
    App,
    TreeNode,
  },
  data() {
    return {
      selectedMode: null, // Para controlar qué modo está seleccionado
      loading: true,
      id:   null,
      node: null,
      selec_node: {},
      open: false,
      count: 0,
      selectedId: null,
      children: [], // <-- Añadido para guardar los hijos completos
      children_points: [],
      modal_children: [], // Para hijos del usuario seleccionado en el modal
      modal_children_points: [], // Para puntos de los hijos del usuario seleccionado
      isMobile: false,
      isMobileSmall: false,
    }
  },
  computed: {
    session()   { return this.$store.state.session },
    office_id() { return this.$store.state.office_id },
    name()      { return this.$store.state.name },
    activated() { return this.$store.state.activated },
  },

  filters: {
    date(val) {
      return new Date(val).toLocaleDateString()
      // return new Date(val).toLocaleString()
    },
    _rank(val) {
      if(val == 'none')              return 'Ninguno'
      if(val == 'active')            return 'ACTIVO'
      if(val == 'star')              return 'MASTER'
      if(val == 'master')            return 'PLATA'
      if(val == 'silver')            return 'PLATINO'
      if(val == 'gold')              return 'ORO'
      if(val == 'sapphire')          return 'ZAFIRO'
      if(val == 'RUBI')              return 'DIAMANTE RUBI'
      if(val == 'DIAMANTE')          return 'DIAMANTE ESTRELLA'
      if(val == 'DOBLE DIAMANTE')    return 'DIAMANTE DOS ESTRELLAS'
      if(val == 'TRIPLE DIAMANTE')   return 'DIAMANTE TRES ESTRELLAS'
      if(val == 'DIAMANTE ESTRELLA') return 'DIAMANTE CBM'
    },
  },
  async created() {
    // Detectar el modo desde la ruta
    this.detectModeFromRoute();
  },
  mounted() {
    // Detectar el modo desde la ruta al montar
    this.detectModeFromRoute();
    // Detectar tamaño de pantalla
    this.detectScreenSize();
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', this.detectScreenSize);
  },
  beforeDestroy() {
    // Remover listener al destruir el componente
    window.removeEventListener('resize', this.detectScreenSize);
  },
  watch: {
    // Cuando se navega a esta ruta, detectar el modo
    '$route'() {
      this.detectModeFromRoute();
    }
  },
  beforeRouteEnter(to, from, next) {
    // Permitir que el componente maneje la detección del modo
    next();
  },
  methods: {
    async GET(id) {
      this.loading = true
      const { data } = await api.tree(this.session, id)
      this.loading = false

      if(data.error && data.msg == 'invalid session') this.$router.push('/login')
      if(data.error && data.msg == 'unverified user') this.$router.push('/verify')

      this.id = data.node.id
      this.node = data.node
      this.selec_node = data.node
      this.selectedId = data.node.id
      this.children = data.children || [] // <-- Guardar hijos completos
      this.children_points = data.children_points || []
    },
    detectScreenSize() {
      const width = window.innerWidth;
      this.isMobile = width <= 968;
      this.isMobileSmall = width <= 400;
    },
    detectModeFromRoute() {
      const path = this.$route.path;
      if (path === '/tree/red') {
        this.selectedMode = 'red';
        this.GET(null);
      } else if (path === '/tree/frontales') {
        this.selectedMode = 'frontales';
      } else if (path === '/tree/niveles') {
        this.selectedMode = 'niveles';
      } else if (path === '/tree/actividad') {
        this.selectedMode = 'actividad';
      } else {
        // Si es /tree sin parámetros, mostrar selector
        this.selectedMode = null;
      }
    },
    selectMode(mode) {
      this.selectedMode = mode;
      // Navegar a la ruta correspondiente
      this.$router.push(`/tree/${mode}`);
      
      if (mode === 'red') {
        this.GET(null); // Cargar datos de la red
      } else if (mode === 'frontales') {
        this.loadFrontalesData(); // Cargar datos de frontales
      }
    },
    // Método para cargar hijos de un nodo (usado por TreeNode)
    async GET_NODE(id, session) {
      return await api.tree(session, id)
    },
    async click(node) {
      this.selectedId = node.id
      this.selec_node = node
      this.open = true

      // Obtener hijos y puntos del usuario seleccionado
      const { data } = await this.GET_NODE(node.id, this.session)
      this.modal_children = data.children || []
      this.modal_children_points = data.children_points || []
    },
    closed() {
      this.open = false
    },
    // openModal(child) {
    //   this.selec_node = child; // Asignar el hijo seleccionado
    //   this.open = true; // Abrir el modal
    // },
    // loadFrontalesData() {
    //   this.loading = true; // Mostrar carga
    //   // Simulación de llamada a la API para obtener datos de frontales
    //   api.getFrontales(this.session)
    //     .then(response => {
    //       this.children = response.data.children || []; // Asignar hijos
    //       this.children_points = response.data.children_points || []; // Asignar puntos
    //       this.loading = false; // Ocultar carga
    //     })
    //     .catch(error => {
    //       console.error("Error al cargar datos de frontales:", error);
    //       this.loading = false; // Ocultar carga en caso de error
    //     });
    // }
  }
};
</script>

<style lang="stylus">
  .modal
    background rgba(#000, 0.72)
    position absolute
    top 0
    bottom 0
    left 0
    right 0
    padding 80px 20px
    display none
    z-index 2
    overflow auto
    &.open
      display block
    .inner
      background #eaebec
      border-radius 20px
      padding 20px 20px 32px 20px
      max-width 480px
      margin auto

</style>

<style>
.mode-selector {
  /* padding: 60px 20px;
  max-width: 900px;
  margin: 0 auto;
  background: #f5f2e9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; */
}

.mode-title {
  text-align: center;
  margin-bottom: 40px;
  color: #4a4a4a;
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 1px;
  
}

.cards-container {
  display: flex;
  gap: 45px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;
}

/* Responsive para móviles */
@media (max-width: 968px) {
  /* .cards-container {
    gap: 20px;
    max-width: 400px;
    margin: 0 auto 50px auto;
  }
  
  .mode-selector .card {
    width: 140px;
    height: 140px;
    padding: 15px;
  }
  
  .card-text {
    font-size: 20px;
  }
  
  .mode-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .top-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .btn-orange {
    font-size: 14px;
    padding: 12px 24px;
  } */
}

/* Para móviles muy pequeños */
@media (max-width: 400px) {
  /* .cards-container {

  }
  
  .mode-selector .card {
    width: 150px;
    height: 150px;
    padding: 12px;
  }
  
  .card-text {
    font-size: 15px;
  }
  
  .mode-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .card-icon svg {
    width: 40px;
    height: 40px;
  } */
}

.mode-selector .card {
  background: white;
  border: none;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 180px;
  height: 180px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Clases específicas para móvil */
.mode-selector .card.mobile {
  width: 140px !important;
  height: 140px !important;
  padding: 15px !important;
}

.mode-selector .card.mobile-small {
  width: 125px !important;
  height: 125px !important;
  padding: 12px !important;
}

/* Clases para texto en móvil */
.card-text.mobile {
  font-size: 20px !important;
}

.card-text.mobile-small {
  font-size: 15px !important;
}

/* Clases para título en móvil */
.mode-title.mobile {
  font-size: 20px !important;
  margin-bottom: 20px !important;
}

.mode-title.mobile-small {
  font-size: 20px !important;
  margin-bottom: 20px !important;
}

/* Clases para iconos en móvil */
.card-icon svg.mobile {
  width: 50px !important;
  height: 50px !important;
}

.card-icon svg.mobile-small {
  width: 40px !important;
  height: 40px !important;
}

.mode-selector .card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.card-icon svg {
  width: 60px;
  height: 60px;
}

.card-text {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 26px;
  letter-spacing: 0.5px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.top-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.bottom-button {
  display: flex;
  justify-content: center;
}

.btn {
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 12px 24px;
  font-size: 14px;
}

.btn-green {
  background: #28a745;
  color: white;
}

.btn-green:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-orange {
  background: #e67e00;
  color: white;
  font-size: 16px;
  padding: 14px 28px;
}

.btn-orange:hover {
  background: #d35400;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 126, 0, 0.3);
}

/* https://codepen.io/ea-ger/pen/rNJjxYr
https://codepen.io/team/amcharts/pen/poPxojR */

/*  @import url('https://fonts.googleapis.com/css2?family=Oxygen:wght@300&display=swap');*/

  #body {
    margin: 0;
    padding: 0;
/*    background: #fafafa;*/
/*    font-family: 'Oxygen', sans-serif;*/
    letter-spacing: 0.2px;
/*    height: 100vh;*/
/*    width: 100vw;*/
/*    background-color: var(--bg-1);*/
    position: relative;
  }

  :root {
    --col-1: #c8ddef;
    --col-2: #c8ddef;
    --bg-1: #0e182d;
    --highlighted: #ff5722;
  }

  .tree-container {
    /*display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;*/

    overflow: auto;

    width: 100%;
    /*padding-top: 5em;
    padding-bottom: 5em;*/
  }

  .tree-container>h1 {
    color: var(--col-1);
    font-weight: 400;
  }

  .tree,
  .tree ul,
  .tree li {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
  }

  .tree {
/*    margin: 0 0 1em;*/
    text-align: center;
  }

  .tree,
  .tree ul {
    display: table;
    margin: auto;
    width: 100%;
  }

  .tree ul {
    width: 100%;
  }

  .tree li {
    display: table-cell;
    padding: .5em 0;
    vertical-align: top;
  }

  .tree li:before {
    outline: solid 1px var(--col-2);
    content: "";
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    direction: rtl;
  }

  /*.tree li:hover:before {
    outline: solid 1px var(--col-1);
  }*/

  .tree li:first-child:before {
    left: 50%;
  }

  .tree li:last-child:before {
    right: 50%;
  }

  .tree code,
  .tree span {
/*    border: solid .1em var(--col-1);*/
    border-radius: .2em;
    display: inline-block;
    margin: 0 .2em .5em;
    padding: .2em .5em;
    position: relative;
/*    background-color: var(--bg-1);*/
    transition: all 0.2s ease;
/*    color: var(--col-1);*/
/*    font-size: 14px;*/
    font-size: 12px;
  }

  .tree span i {
    font-size: 32px;
    color: #fff;
  }
  .tree span i.aff{
    color: #ffe400;
  }
  .tree span i.act{
    color: #14ec42;
  }

  .tree span i.fa-gem {
    font-size: 18px;
    position: absolute;
    transform: translateY(10px);
    display: none;
  }

  .tree span i.fa-gem.star {
    display: inline;
    color: #ffe400; /*yellow*/
  }

  .tree span i.fa-gem.master {
    display: inline;
    color: #14ec42; /*green*/
  }

  .tree span i.fa-gem.silver {
    display: inline;
    color: #D3D3D3; /*silver*/
  }

  .tree span i.fa-gem.gold {
    display: inline;
    color: #D4AF37; /*gold*/
  }

  /*.tree span:hover {
    background-color: var(--col-1);
    color: var(--bg-1);
  }

  .tree li:hover>span {
    background-color: var(--col-1);
    color: var(--bg-1);
  }

  .tree span:hover::after,
  .tree li:hover>span::after {
    box-shadow: 0 0 5px 8px var(--col-1) inset;
  }*/

  .tree ul:before,
  .tree code:before,
  .tree span:before {
    outline: solid 1px var(--col-2);
    content: "";
    height: .5em;
    left: 50%;
    position: absolute;
  }

/*  .tree ul:hover:before,
  .tree code:hover:before,
  .tree li:hover>span:before {
    outline: solid 1px var(--col-1);
  }*/

  .tree span::after {
    outline: solid 1px var(--col-1);
    content: "";
    top: -8px;
    left: calc(50% - 5px);
    width: 8px;
    height: 8px;
/*    background-color: var(--bg-1);*/
    background-color: #888;
    border: 1px solid var(--col-1);
    position: absolute;
    opacity: 1;
    border-radius: 100%;
    transition: all 0.2s ease;
  }

  .tree ul:before {
    top: -.5em;
  }

  .tree code:before,
  .tree span:before {
    top: -.55em;
  }

  .tree>li {
    margin-top: 0;
  }

  .tree>li:before,
  .tree>li:after,
  .tree>li>code:before,
  .tree>li>span:before,
  .tree>li>span:after {
    outline: none;
    display: none;

  }

  .highlighted {
    border: 2px solid var(--highlighted) !important;
  }

  /*.highlighted:hover {
    background-color: var(--highlighted) !important;
  }*/
</style>

<style>
.selected-node > span {
  box-shadow: 0 0 8px #00bcd4 !important;
  border: 2px solid #00bcd4 !important;
  background: #e0f7fa !important;
}
</style>

