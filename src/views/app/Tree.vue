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
            <button class="btn btn-orange" @click="goToRedMap">MAPA DE LA RED</button>
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

        <!-- Modal para detalles del afiliado -->
        <div class="modal" :class="{ open }" @click="closed">
          <div class="modal-content" @click.stop="">
            <div class="modal-header">
              <h3 class="modal-title">Detalles del Afiliado</h3>
              <button class="modal-close" @click="closed">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="user-profile">
                <div class="profile-avatar">
                  <img v-if="selec_node.photo" :src="selec_node.photo" :alt="selec_node.name" class="user-photo">
                  <i v-else class="fas fa-user-circle"></i>
                </div>
                <div class="profile-info">
                  <h2 class="profile-name">{{ selec_node.name }} {{ selec_node.lastName }}</h2>
                  <div class="profile-badges">
                    <span class="membership-badge" :class="getMembershipClass(selec_node)">
                      {{ getMembershipText(selec_node) }}
                    </span>
                    <span class="status-badge" :class="getStatusClass(selec_node)">
                      {{ getStatusText(selec_node) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-section">
                  <h4 class="section-title">
                    <i class="fas fa-id-card"></i>
                    Información Personal
                  </h4>
                  <div class="info-item">
                    <span class="info-label">ID:</span>
                    <span class="info-value">{{ selec_node.dni || 'No disponible' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">País:</span>
                    <span class="info-value">{{ selec_node.country || 'No disponible' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">{{ selec_node.phone || 'No disponible' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Correo:</span>
                    <span class="info-value">{{ selec_node.email || 'No disponible' }}</span>
                  </div>
                </div>
                
                <div class="info-section">
                  <h4 class="section-title">
                    <i class="fas fa-chart-line"></i>
                    Puntos y Rendimiento
                  </h4>
                  <div class="points-display">
                    <div class="point-card">
                      <div class="point-icon">
                        <i class="fas fa-user"></i>
                      </div>
                      <div class="point-details">
                        <span class="point-label">Puntos Personales</span>
                        <span class="point-value">{{ selec_node.points || 0 }}</span>
                      </div>
                    </div>
                    <div class="point-card">
                      <div class="point-icon">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="point-details">
                        <span class="point-label">Puntos de Afiliación</span>
                        <span class="point-value">{{ selec_node.affiliation_points || 0 }}</span>
                      </div>
                    </div>
                    <div class="point-card">
                      <div class="point-icon">
                        <i class="fas fa-network-wired"></i>
                      </div>
                      <div class="point-details">
                        <span class="point-label">Puntos Grupales</span>
                        <span class="point-value">{{ selec_node.total_points !== undefined ? selec_node.total_points : '—' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="info-section">
                  <h4 class="section-title">
                    <i class="fas fa-crown"></i>
                    Rango y Estatus
                  </h4>
                  <div class="info-item">
                    <span class="info-label">Rango Cerrado:</span>
                    <span class="info-value">{{ selec_node._rank | _rank }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">{{ selec_node.activated ? 'Activado' : 'No activado' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Afiliado:</span>
                    <span class="info-value">{{ selec_node.affiliated ? 'Sí' : 'No' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Hijos directos del afiliado -->
              <div v-if="modal_children && modal_children.length && modal_children_points && modal_children_points.length" class="children-section">
                <h4 class="section-title">
                  <i class="fas fa-sitemap"></i>
                  Hijos Directos ({{ modal_children.length }})
                </h4>
                <div class="children-grid">
                  <div v-for="(child, idx) in modal_children" :key="child.id" class="child-card">
                    <div class="child-avatar">
                      <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="child-info">
                      <h5 class="child-name">{{ child.name }}</h5>
                      <div class="child-points">
                        <span class="child-point-label">PG:</span>
                        <span class="child-point-value">{{ modal_children_points[idx] || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-whatsapp-large" @click="openWhatsApp(selec_node)">
                <i class="fab fa-whatsapp"></i>
                Contactar por WhatsApp
              </button>
              <button class="btn-close" @click="closed">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder para otros modos -->
    <div v-if="selectedMode === 'niveles'">
      <div class="niveles-header">
        <h2 class="niveles-title">Resumen de Jerarquía</h2>
        <button @click="$router.push('/tree')" class="btn-volver">
          <i class="fas fa-arrow-left"></i>
          Volver al selector
        </button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <i class="load"></i>
        <p>Cargando resumen de jerarquía...</p>
      </div>
      
      <div v-if="!loading" class="hierarchy-summary">
        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.totalMembers }}</div>
              <div class="card-label">Miembros Totales</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.directAffiliates }}</div>
              <div class="card-label">Afiliados Directos</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.maxDepth }}</div>
              <div class="card-label">Niveles de Profundidad</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.highPerformance }}</div>
              <div class="card-label">Alto Rendimiento</div>
            </div>
          </div>
        </div>
        
        <!-- Distribución por niveles -->
        <div class="levels-distribution">
          <h3 class="distribution-title">Distribución por Niveles</h3>
          <div class="levels-chart">
            <div v-for="(count, level) in hierarchyStats.levelDistribution" :key="level" class="level-row">
              <div class="level-label">Nivel {{ level }}</div>
              <div class="level-bar-container">
                <div class="level-bar" :style="{ width: getBarWidth(count) }"></div>
              </div>
              <div class="level-count">{{ count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedMode === 'actividad'">
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
     <div class="frontales-header">
       <h2 class="frontales-title">Frontales</h2>
       <button @click="$router.push('/tree')" class="btn-volver">
         <i class="fas fa-arrow-left"></i>
         Volver al selector
       </button>
     </div>
     
     <div v-if="children && children.length && children_points && children_points.length">
       <div class="loading-container" v-if="loading">
         <i class="load"></i>
         <p>Cargando frontales...</p>
       </div>
      
       <div v-if="!loading" class="frontales-grid">
         <div v-for="(child, idx) in children" :key="child.id" class="frontal-card">
           <div class="card-header">
             <div class="user-avatar">
               <i class="fas fa-user-circle"></i>
             </div>
             <div class="user-info">
               <h3 class="user-name">{{ child.name }}</h3>
               <div class="points-container">
                                   <div class="point-item">
                    <i class="fas fa-user"></i>
                    <span class="point-label">PP</span>
                    <span class="point-value">{{ child.points || 0 }}</span>
                  </div>
                 <div class="point-item">
                   <i class="fas fa-users"></i>
                   <span class="point-label">PG</span>
                   <span class="point-value">{{ children_points[idx] }}</span>
                 </div>
               </div>
             </div>
           </div>
           
           <div class="card-body">
             <div class="membership-badge" :class="getMembershipClass(child)">
               {{ getMembershipText(child) }}
             </div>
             
             <div class="card-actions">
               <button class="btn-ver-detalle" @click="openUserDetail(child)">
                 Ver detalle
               </button>
               <div class="status-badge" :class="getStatusClass(child)">
                 {{ getStatusText(child) }}
               </div>
               <button class="btn-whatsapp" @click="openWhatsApp(child)">
                 <i class="fab fa-whatsapp"></i>
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>
     
           <div v-else-if="!loading" class="no-data">
        <i class="fas fa-users" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
        <p>No hay frontales disponibles</p>
      </div>
      
      <!-- Modal para detalles del afiliado en vista frontales -->
      <div class="modal" :class="{ open }" @click="closed">
        <div class="modal-content" @click.stop="">
          <div class="modal-header">
            <h3 class="modal-title">Detalles del Afiliado</h3>
            <button class="modal-close" @click="closed">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="user-profile">
              <div class="profile-avatar">
                <img v-if="selec_node.photo" :src="selec_node.photo" :alt="selec_node.name" class="user-photo">
                <i v-else class="fas fa-user-circle"></i>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ selec_node.name }} {{ selec_node.lastName }}</h2>
                <div class="profile-badges">
                  <span class="membership-badge" :class="getMembershipClass(selec_node)">
                    {{ getMembershipText(selec_node) }}
                  </span>
                  <span class="status-badge" :class="getStatusClass(selec_node)">
                    {{ getStatusText(selec_node) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="info-grid">
              <div class="info-section">
                <h4 class="section-title">
                  <i class="fas fa-id-card"></i>
                  Información Personal
                </h4>
                <div class="info-item">
                  <span class="info-label">ID:</span>
                  <span class="info-value">{{ selec_node.dni || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">País:</span>
                  <span class="info-value">{{ selec_node.country || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">{{ selec_node.phone || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Correo:</span>
                  <span class="info-value">{{ selec_node.email || 'No disponible' }}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h4 class="section-title">
                  <i class="fas fa-chart-line"></i>
                  Puntos y Rendimiento
                </h4>
                <div class="points-display">
                  <div class="point-card">
                    <div class="point-icon">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="point-details">
                      <span class="point-label">Puntos Personales</span>
                      <span class="point-value">{{ selec_node.points || 0 }}</span>
                    </div>
                  </div>
                  <div class="point-card">
                    <div class="point-icon">
                      <i class="fas fa-users"></i>
                    </div>
                    <div class="point-details">
                      <span class="point-label">Puntos de Afiliación</span>
                      <span class="point-value">{{ selec_node.affiliation_points || 0 }}</span>
                    </div>
                  </div>
                  <div class="point-card">
                    <div class="point-icon">
                      <i class="fas fa-network-wired"></i>
                    </div>
                    <div class="point-details">
                      <span class="point-label">Puntos Grupales</span>
                      <span class="point-value">{{ totalPoints}}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="info-section">
                <h4 class="section-title">
                  <i class="fas fa-crown"></i>
                  Rango y Estatus
                </h4>
                <div class="info-item">
                  <span class="info-label">Rango Cerrado:</span>
                  <span class="info-value">{{ selec_node._rank | _rank }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span class="info-value">{{ selec_node.activated ? 'Activado' : 'No activado' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Afiliado:</span>
                  <span class="info-value">{{ selec_node.affiliated ? 'Sí' : 'No' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Hijos directos del afiliado -->
            <div v-if="modal_children && modal_children.length && modal_children_points && modal_children_points.length" class="children-section">
              <h4 class="section-title">
                <i class="fas fa-sitemap"></i>
                Hijos Directos ({{ modal_children.length }})
              </h4>
              <div class="children-grid">
                <div v-for="(child, idx) in modal_children" :key="child.id" class="child-card">
                  <div class="child-avatar">
                    <i class="fas fa-user-circle"></i>
                  </div>
                  <div class="child-info">
                    <h5 class="child-name">{{ child.name }}</h5>
                    <div class="child-points">
                      <span class="child-point-label">PG:</span>
                      <span class="child-point-value">{{ modal_children_points[idx] || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-whatsapp-large" @click="openWhatsApp(selec_node)">
              <i class="fab fa-whatsapp"></i>
              Contactar por WhatsApp
            </button>
            <button class="btn-close" @click="closed">
              Cerrar
            </button>
          </div>
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
    },
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
        
        // Asignar los puntos grupales a cada hijo
        this.children.forEach((child, index) => {
          if (this.children_points[index] !== undefined) {
            child.total_points = this.children_points[index]
          }
        })
        
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
      hierarchyStats: { // Nuevo: para almacenar los datos del resumen de jerarquía
        totalMembers: 0,
        directAffiliates: 0,
        maxDepth: 0,
        highPerformance: 0,
        levelDistribution: {}
      }
    }
  },
  computed: {
    session()   { return this.$store.state.session },
    office_id() { return this.$store.state.office_id },
    name()      { return this.$store.state.name },
    activated() { return this.$store.state.activated },
         totalPoints() {
       // Si estamos en la vista de frontales, usar los puntos grupales del usuario seleccionado
       if (this.selectedMode === 'frontales' && this.selec_node.total_points !== undefined) {
         return this.selec_node.total_points;
       }
       // Para otros casos, calcular la suma de puntos personales + puntos de hijos
       const childrenPointsTotal = this.modal_children_points.reduce((total, points) => total + points, 0);
       return childrenPointsTotal + (this.selec_node.points || 0);
     },
  },

  filters: {
    date(val) {
      return new Date(val).toLocaleDateString()
      // return new Date(val).toLocaleString()
    },
    _rank(val) {
      if(val == 'none')              return 'Ninguno'
      if(val == 'active')            return 'ACTIVO'
      if(val == 'star')              return 'BRONCE'
      if(val == 'master')            return 'PLATA'
      if(val == 'silver')            return 'PLATA'
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
      this.selec_node = data.node;
      console.log("selec_node:", this.children_points); 
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
        this.loadFrontalesData();
      } else if (path === '/tree/niveles') {
        this.selectedMode = 'niveles';
        this.loadHierarchyStats();
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
      } else if (mode === 'niveles') {
        this.loadHierarchyStats(); // Cargar estadísticas de jerarquía
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
    // Métodos para la vista de frontales
    getMembershipClass(child) {
      const rank = child._rank || child.rank || 'none';
      const membershipMap = {
        'none'   :       'Ninguno',
       'active'       :     'ACTIVO',
       'star'         :     'BRONCE',
       'master'       :     'PLATA',
       'silver'       :     'PLATA',
       'gold'         :    'ORO',
       'RUBI'         :    'DIAMANTE RUBI',
       'sapphire'     :      'ZAFIRO',
       'DIAMANTE'     :     'DIAMANTE ESTRELLA',
       'DOBLE DIAMANTE'    :'DIAMANTE DOS ESTRELLAS',
      'TRIPLE DIAMANTE' : 'DIAMANTE TRES ESTRELLAS',
     'DIAMANTE ESTRELLA'  :'DIAMANTE CBM',
    };
      return membershipMap[rank] || 'bronze';
    },
    
    getMembershipText(child) {
      const rank = child._rank || child.rank || 'none';
      const membershipMap = {
        'none'   :       'Ninguno',
       'active'       :     'ACTIVO',
       'star'         :     'BRONCE',
       'master'       :     'PLATA',
       'silver'       :     'PLATA',
       'gold'         :    'ORO',
       'RUBI'         :    'DIAMANTE RUBI',
       'sapphire'     :      'ZAFIRO',
       'DIAMANTE'     :     'DIAMANTE ESTRELLA',
       'DOBLE DIAMANTE'    :'DIAMANTE DOS ESTRELLAS',
      'TRIPLE DIAMANTE' : 'DIAMANTE TRES ESTRELLAS',
     'DIAMANTE ESTRELLA'  :'DIAMANTE CBM',
      };
      return membershipMap[rank] || 'Bronce';
    },
    
    getStatusClass(child) {
      // Simular estado activo/inactivo basado en puntos o activación
      const isActive = (child.points && child.points > 0) || child.activated;
      return isActive ? 'status-active' : 'status-inactive';
    },
    
    getStatusText(child) {
      const isActive = (child.points && child.points > 0) || child.activated;
      return isActive ? 'ACTIVO' : 'INACTIVO';
    },
    
         async openUserDetail(child) {
       this.selec_node = child;
       this.open = true;
       
       // Cargar datos completos del usuario seleccionado
       try {
         const { data } = await this.GET_NODE(child.id, this.session);
         this.modal_children = data.children || [];
         this.modal_children_points = data.children_points || [];
         
         // Asegurar que el usuario seleccionado tenga sus puntos personales
         if (child.points !== undefined) {
           this.selec_node.points = child.points;
         }
         
         // Si estamos en frontales, usar los puntos grupales del hijo
         if (this.selectedMode === 'frontales') {
           const childIndex = this.children.findIndex(c => c.id === child.id);
           if (childIndex !== -1 && this.children_points[childIndex] !== undefined) {
             this.selec_node.total_points = this.children_points[childIndex];
           }
         }
       } catch (error) {
         console.error("Error al cargar detalles del usuario:", error);
         this.modal_children = [];
         this.modal_children_points = [];
       }
     },
    
    openWhatsApp(child) {
      const phone = child.phone || '';
      const message = `Hola ${child.name}, te contacto desde Sifrah`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    },
    
    async loadFrontalesData() {
      this.loading = true;
      try {
        // Cargar datos del usuario actual para obtener sus frontales
        const { data } = await api.tree(this.session, null);
        this.children = data.children || [];
        this.children_points = data.children_points || [];
        this.loading = false;
      } catch (error) {
        console.error("Error al cargar datos de frontales:", error);
        this.loading = false;
      }
// Verifica que total_points esté presente
    },
    
    goToRedMap() {
      // Redirigir a la vista de red
      this.selectMode('red');
    },
         async loadHierarchyStats() {
       this.loading = true;
       try {
         // Siempre cargar datos del árbol completo para el usuario logueado
         await this.GET(null);
         
         // Cargar todos los niveles del árbol recursivamente
         await this.loadAllTreeLevels(this.node);
         
         // Depurar la estructura del árbol
         console.log('Estructura del árbol cargada:');
         this.debugTreeStructure(this.node);
         
         // Calcular estadísticas basándose en los datos del árbol completo
         this.calculateHierarchyStats();
         this.loading = false;
       } catch (error) {
         console.error("Error al cargar estadísticas de jerarquía:", error);
         this.loading = false;
       }
     },
     
     async loadAllTreeLevels(node, maxDepth = 10) {
       if (!node || !node.childs || node.childs.length === 0) return;
       
       // Cargar hijos del nodo actual
       if (!node._childs) {
         try {
           const { data } = await this.GET_NODE(node.id, this.session);
           node._childs = data.children || [];
           
           // Recursivamente cargar hijos de los hijos (hasta maxDepth)
           for (let i = 0; i < node._childs.length && maxDepth > 0; i++) {
             await this.loadAllTreeLevels(node._childs[i], maxDepth - 1);
           }
         } catch (error) {
           console.error(`Error cargando hijos del nodo ${node.id}:`, error);
         }
       }
     },
     
     // Método para depurar la estructura del árbol
     debugTreeStructure(node, level = 0) {
       if (!node) return;
       
       const indent = '  '.repeat(level);
       console.log(`${indent}Nivel ${level}: ${node.name} (ID: ${node.id})`);
       
       if (node._childs && node._childs.length > 0) {
         node._childs.forEach(child => {
           this.debugTreeStructure(child, level + 1);
         });
       }
     },
     
     calculateHierarchyStats() {
       if (!this.node) return;
       
       // Inicializar estadísticas
       const stats = {
         totalMembers: 0,
         directAffiliates: 0,
         maxDepth: 0,
         highPerformance: 0,
         levelDistribution: {}
       };
       
       // Contar miembros totales y distribución por niveles
       this.countMembersByLevel(this.node, 0, stats);
       
       // Calcular afiliados directos (hijos directos del usuario logueado)
       stats.directAffiliates = this.children ? this.children.length : 0;
       
       // Calcular alto rendimiento (usuarios con más de 1000 puntos)
       stats.highPerformance = this.countHighPerformanceUsers(this.node);
       
       // Asegurar que el nivel 0 tenga al menos 1 (el usuario logueado)
       if (!stats.levelDistribution[0]) {
         stats.levelDistribution[0] = 1;
       }
       
       // Actualizar las estadísticas
       this.hierarchyStats = stats;
       
       console.log('Estadísticas calculadas:', stats);
       console.log('Distribución por niveles:', stats.levelDistribution);
     },
     
     countMembersByLevel(node, level, stats) {
       if (!node) return;
       
       // Incrementar contador total
       stats.totalMembers++;
       
       // Incrementar contador del nivel
       if (!stats.levelDistribution[level]) {
         stats.levelDistribution[level] = 0;
       }
       stats.levelDistribution[level]++;
       
       // Actualizar profundidad máxima
       stats.maxDepth = Math.max(stats.maxDepth, level);
       
       // Contar hijos recursivamente
       if (node._childs && node._childs.length > 0) {
         node._childs.forEach(child => {
           this.countMembersByLevel(child, level + 1, stats);
         });
       }
     },
     
     countHighPerformanceUsers(node) {
       if (!node) return 0;
       
       let count = 0;
       
       // Contar si el usuario actual tiene alto rendimiento
       if ((node.points && node.points > 1000) || (node.total_points && node.total_points > 1000)) {
         count++;
       }
       
       // Recursivamente contar hijos
       if (node._childs) {
         node._childs.forEach(child => {
           count += this.countHighPerformanceUsers(child);
         });
       }
       
       return count;
     },
         getBarWidth(count) {
       const maxCount = Math.max(...Object.values(this.hierarchyStats.levelDistribution));
       if (maxCount === 0 || !count) return '0%';
       return `${(count / maxCount) * 100}%`;
     }
  }
};
</script>

<style lang="stylus">
  .modal
    background rgba(#000, 0.72)
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    padding 20px
    display none
    z-index 1000
    overflow auto
    backdrop-filter blur(5px)
    &.open
      display flex
      align-items center
      justify-content center
    .modal-content
      background #ffffff
      border-radius 20px
      max-width 800px
      width 100%
      max-height 90vh
      overflow hidden
      box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)
      animation modalSlideIn 0.3s ease-out
      
  @keyframes modalSlideIn
    from
      opacity 0
      transform translateY(-50px) scale(0.9)
    to
      opacity 1
      transform translateY(0) scale(1)

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

/* Estilos para la vista de Frontales */
.frontales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.frontales-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #00bcd4;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-volver:hover {
  background: #0097a7;
  transform: translateY(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-container p {
  margin-top: 16px;
  font-size: 16px;
}

.frontales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.frontal-card {
  background: #f5f2e9;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e0d8c0;
}

.frontal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar i {
  font-size: 48px;
  color: #00bcd4;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.points-container {
  display: flex;
  gap: 16px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.point-item i {
  font-size: 16px;
  color: #666;
}

.point-label {
  font-size: 12px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
}

.point-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.membership-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.membership-badge.bronze {
  background: #cd7f32;
  color: white;
}

.membership-badge.silver {
  background: #c0c0c0;
  color: white;
}

.membership-badge.gold {
  background: #d4af37;
  color: white;
}

.membership-badge.ruby {
  background: #e0115f;
  color: white;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-ver-detalle {
  padding: 8px 16px;
  background: #28a745;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 100px;
}

.btn-ver-detalle:hover {
  background: #218838;
  transform: translateY(-1px);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-active {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.btn-whatsapp {
  width: 36px;
  height: 36px;
  background: #25d366;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-whatsapp:hover {
  background: #128c7e;
  transform: scale(1.1);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  text-align: center;
}

.no-data p {
  font-size: 16px;
  margin: 0;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .frontales-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .frontales-title {
    font-size: 24px;
  }
  
  .frontales-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
  
  .frontal-card {
    padding: 16px;
  }
  
  .user-name {
    font-size: 16px;
  }
  
  .points-container {
    gap: 12px;
  }
  
  .card-actions {
    gap: 8px;
  }
  
  .btn-ver-detalle {
    font-size: 11px;
    padding: 6px 12px;
  }
}

/* Estilos para el Modal de Detalles */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #00bcd4, #0097a7);
  color: white;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.profile-avatar {
  flex-shrink: 0;
}

.user-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #00bcd4;
}

.profile-avatar i {
  font-size: 80px;
  color: #00bcd4;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
}

.profile-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #00bcd4;
}

.section-title i {
  color: #00bcd4;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.info-value {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.points-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #00bcd4;
}

.point-icon {
  width: 40px;
  height: 40px;
  background: #e0f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00bcd4;
  font-size: 18px;
}

.point-details {
  flex: 1;
}

.point-details .point-label {
  display: block;
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.point-details .point-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.children-section {
  margin-top: 30px;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.child-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.child-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #00bcd4;
}

.child-avatar i {
  font-size: 32px;
  color: #00bcd4;
}

.child-info {
  flex: 1;
}

.child-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
}

.child-points {
  display: flex;
  align-items: center;
  gap: 4px;
}

.child-point-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.child-point-value {
  font-size: 14px;
  font-weight: bold;
  color: #00bcd4;
}

.modal-footer {
  display: flex;
  gap: 16px;
  padding: 24px 30px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.btn-whatsapp-large {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #25d366;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-whatsapp-large:hover {
  background: #128c7e;
  transform: translateY(-2px);
}

.btn-close {
  padding: 12px 24px;
  background: #6c757d;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* Responsive para el modal */
@media (max-width: 768px) {
  .modal-body {
    padding: 20px;
  }
  
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .children-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-whatsapp-large,
  .btn-close {
    width: 100%;
  }
}
</style>

<style>
.niveles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.niveles-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.hierarchy-summary {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

 .summary-card .card-icon {
   width: 60px;
   height: 60px;
   background: #fff3e0;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   color: #ff9800;
   font-size: 28px;
   margin-bottom: 15px;
 }

.summary-card .card-content {
  flex: 1;
}

.summary-card .card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.summary-card .card-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.levels-distribution {
  margin-top: 30px;
}

 .distribution-title {
   font-size: 20px;
   font-weight: bold;
   color: #333;
   margin-bottom: 15px;
   padding-bottom: 8px;
   border-bottom: 2px solid #ff9800;
 }

 .levels-chart {
   display: flex;
   flex-direction: column;
   gap: 8px;
   padding: 20px;
   background: white;
   border-radius: 12px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
 }

 .level-row {
   display: flex;
   align-items: center;
   gap: 15px;
   padding: 8px 0;
   border-bottom: 1px solid #f0f0f0;
 }

 .level-row:last-child {
   border-bottom: none;
 }

 .level-label {
   font-size: 14px;
   color: #666;
   font-weight: 600;
   min-width: 80px;
   text-align: left;
 }

 .level-bar-container {
   flex: 1;
   height: 20px;
   background: #f5f5f5;
   border-radius: 10px;
   overflow: hidden;
   position: relative;
   border: 1px solid #e0e0e0;
 }

 .level-bar {
   height: 100%;
   background: linear-gradient(90deg, #ff9800, #f57c00);
   border-radius: 10px;
   transition: width 0.8s ease-in-out;
   position: relative;
   overflow: hidden;
 }

 .level-bar::after {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
   animation: shimmer 2s infinite;
 }

 @keyframes shimmer {
   0% { transform: translateX(-100%); }
   100% { transform: translateX(100%); }
 }

 .level-count {
   font-size: 16px;
   font-weight: bold;
   color: #333;
   min-width: 50px;
   text-align: right;
   background: #f8f9fa;
   padding: 4px 8px;
   border-radius: 6px;
   border: 1px solid #e9ecef;
 }

/* Responsive para móviles */
@media (max-width: 768px) {
  .niveles-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .niveles-title {
    font-size: 24px;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .summary-card {
    padding: 15px;
  }
  
  .summary-card .card-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .summary-card .card-value {
    font-size: 24px;
  }
  
  .summary-card .card-label {
    font-size: 12px;
  }
  
  .levels-chart {
    padding: 15px;
  }
  
  .level-row {
    gap: 10px;
  }
  
  .level-label {
    font-size: 12px;
    min-width: 60px;
  }
  
  .level-count {
    font-size: 14px;
    min-width: 40px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-card {
    padding: 12px;
  }
  
  .summary-card .card-icon {
    width: 45px;
    height: 45px;
    font-size: 20px;
  }
  
  .summary-card .card-value {
    font-size: 20px;
  }
  
  .levels-chart {
    padding: 10px;
  }
  
  .level-row {
    gap: 8px;
  }
  
  .level-label {
    font-size: 11px;
    min-width: 50px;
  }
  
  .level-bar-container {
    height: 16px;
  }
  
  .level-count {
    font-size: 12px;
    min-width: 35px;
    padding: 2px 4px;
  }
}
</style>

