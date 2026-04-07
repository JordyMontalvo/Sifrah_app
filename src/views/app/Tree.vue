<template>
  <App :session="session" :office_id="office_id">
    <!-- Selector de modo - aparece primero -->
    <div v-if="!selectedMode" class="mode-selector">
        <h2 class="mode-title" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">SELECCIONAR MODO</h2>
        <div class="cards-container" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('red')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Red</p>
            <div class="card-icon">
              <!-- Nueva imagen de red jerárquica -->
              <img src="@/assets/img/red-hierarchy.svg" alt="Red" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 160px; height: 160px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('frontales')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Frontales</p>
            <div class="card-icon">
              <!-- Nueva imagen de frontales -->
              <img src="@/assets/img/frontales-hierarchy.svg" alt="Frontales" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 160px; height: 160px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('niveles')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Niveles</p>
            <div class="card-icon">
              <!-- Nueva imagen de niveles -->
              <img src="@/assets/img/niveles-hierarchy.svg" alt="Niveles" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 160px; height: 160px; object-fit: contain;">
            </div>
          </div>
          <div class="card" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" @click="selectMode('actividad')">
            <p class="card-text" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }">Actividad</p>
            <div class="card-icon">
              <!-- Nueva imagen de actividad -->
              <img src="@/assets/img/actividad-hierarchy.svg" alt="Actividad" :class="{ 'mobile': isMobile, 'mobile-small': isMobileSmall }" style="width: 160px; height: 160px; object-fit: contain;">
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
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ loadingProgress }}% completado</span>
        </div>
      </div>
<div v-if="!loading" class="hierarchy-summary">
  
        <!-- Mensaje informativo -->
        <!-- <div class="info-message">
          <i class="fas fa-info-circle"></i>
          <span>Se cargan todos los niveles de la red en una sola consulta para mostrar estadísticas completas y precisas.</span>
        </div> -->
        
        <!-- Mensaje de éxito cuando se completa la carga -->
        <!-- <div v-if="!loading && loadingProgress === 100" class="success-message">
          <i class="fas fa-check-circle"></i>
          <span>Árbol completo cargado exitosamente. Las estadísticas muestran información completa de toda la jerarquía.</span>
        </div>  -->
        
        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <circle cx="18" cy="18" r="18" fill="#9F00AD"/>
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <path d="M18 19.0667C20.5037 19.0667 22.5333 17.037 22.5333 14.5333C22.5333 12.0296 20.5037 10 18 10C15.4963 10 13.4667 12.0296 13.4667 14.5333C13.4667 17.037 15.4963 19.0667 18 19.0667Z" fill="white"/>
                <path d="M23.6666 17.9333C25.5444 17.9333 27.0666 16.4111 27.0666 14.5333C27.0666 12.6556 25.5444 11.1333 23.6666 11.1333C21.7889 11.1333 20.2667 12.6556 20.2667 14.5333C20.2667 16.4111 21.7889 17.9333 23.6666 17.9333Z" fill="white"/>
                <path d="M12.3334 17.9333C14.2111 17.9333 15.7333 16.4111 15.7333 14.5333C15.7333 12.6556 14.2111 11.1333 12.3334 11.1333C10.4556 11.1333 8.93339 12.6556 8.93339 14.5333C8.93339 16.4111 10.4556 17.9333 12.3334 17.9333Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.3115 24.7333H26.9476C27.6185 24.7333 28.1319 24.1553 27.9699 23.5048C27.5517 21.8388 26.441 19.0667 23.6666 19.0667C22.6625 19.0667 21.876 19.4293 21.2617 19.9733C22.9708 21.0806 23.8548 23.022 24.3115 24.7333ZM14.7383 19.9733C14.0799 19.3782 13.2207 19.0543 12.3334 19.0667C9.55898 19.0667 8.44832 21.8388 8.03013 23.5048C7.86806 24.1553 8.38146 24.7333 9.05239 24.7333H11.6896C12.1464 23.022 13.0292 21.0806 14.7383 19.9733Z" fill="white"/>
                <path d="M18 20.2C22.2035 20.2 23.2881 23.9411 23.5692 25.8735C23.6598 26.4934 23.1589 27 22.5333 27H13.4667C12.8411 27 12.3413 26.4934 12.4308 25.8735C12.7119 23.9411 13.7965 20.2 18 20.2Z" fill="white"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.totalMembers }}</div>
              <div class="card-label">Miembros Totales</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <circle cx="18" cy="18" r="18" fill="#9F00AD"/>
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <path d="M18 19.0667C20.5037 19.0667 22.5333 17.037 22.5333 14.5333C22.5333 12.0296 20.5037 10 18 10C15.4963 10 13.4667 12.0296 13.4667 14.5333C13.4667 17.037 15.4963 19.0667 18 19.0667Z" fill="white"/>
                <path d="M23.6666 17.9333C25.5444 17.9333 27.0666 16.4111 27.0666 14.5333C27.0666 12.6556 25.5444 11.1333 23.6666 11.1333C21.7889 11.1333 20.2667 12.6556 20.2667 14.5333C20.2667 16.4111 21.7889 17.9333 23.6666 17.9333Z" fill="white"/>
                <path d="M12.3334 17.9333C14.2111 17.9333 15.7333 16.4111 15.7333 14.5333C15.7333 12.6556 14.2111 11.1333 12.3334 11.1333C10.4556 11.1333 8.93339 12.6556 8.93339 14.5333C8.93339 16.4111 10.4556 17.9333 12.3334 17.9333Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.3115 24.7333H26.9476C27.6185 24.7333 28.1319 24.1553 27.9699 23.5048C27.5517 21.8388 26.441 19.0667 23.6666 19.0667C22.6625 19.0667 21.876 19.4293 21.2617 19.9733C22.9708 21.0806 23.8548 23.022 24.3115 24.7333ZM14.7383 19.9733C14.0799 19.3782 13.2207 19.0543 12.3334 19.0667C9.55898 19.0667 8.44832 21.8388 8.03013 23.5048C7.86806 24.1553 8.38146 24.7333 9.05239 24.7333H11.6896C12.1464 23.022 13.0292 21.0806 14.7383 19.9733Z" fill="white"/>
                <path d="M18 20.2C22.2035 20.2 23.2881 23.9411 23.5692 25.8735C23.6598 26.4934 23.1589 27 22.5333 27H13.4667C12.8411 27 12.3413 26.4934 12.4308 25.8735C12.7119 23.9411 13.7965 20.2 18 20.2Z" fill="white"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.directAffiliates }}</div>
              <div class="card-label">Afiliados Directos</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <circle cx="18" cy="18" r="18" fill="#9F00AD"/>
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <path d="M18 19.0667C20.5037 19.0667 22.5333 17.037 22.5333 14.5333C22.5333 12.0296 20.5037 10 18 10C15.4963 10 13.4667 12.0296 13.4667 14.5333C13.4667 17.037 15.4963 19.0667 18 19.0667Z" fill="white"/>
                <path d="M23.6666 17.9333C25.5444 17.9333 27.0666 16.4111 27.0666 14.5333C27.0666 12.6556 25.5444 11.1333 23.6666 11.1333C21.7889 11.1333 20.2667 12.6556 20.2667 14.5333C20.2667 16.4111 21.7889 17.9333 23.6666 17.9333Z" fill="white"/>
                <path d="M12.3334 17.9333C14.2111 17.9333 15.7333 16.4111 15.7333 14.5333C15.7333 12.6556 14.2111 11.1333 12.3334 11.1333C10.4556 11.1333 8.93339 12.6556 8.93339 14.5333C8.93339 16.4111 10.4556 17.9333 12.3334 17.9333Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.3115 24.7333H26.9476C27.6185 24.7333 28.1319 24.1553 27.9699 23.5048C27.5517 21.8388 26.441 19.0667 23.6666 19.0667C22.6625 19.0667 21.876 19.4293 21.2617 19.9733C22.9708 21.0806 23.8548 23.022 24.3115 24.7333ZM14.7383 19.9733C14.0799 19.3782 13.2207 19.0543 12.3334 19.0667C9.55898 19.0667 8.44832 21.8388 8.03013 23.5048C7.86806 24.1553 8.38146 24.7333 9.05239 24.7333H11.6896C12.1464 23.022 13.0292 21.0806 14.7383 19.9733Z" fill="white"/>
                <path d="M18 20.2C22.2035 20.2 23.2881 23.9411 23.5692 25.8735C23.6598 26.4934 23.1589 27 22.5333 27H13.4667C12.8411 27 12.3413 26.4934 12.4308 25.8735C12.7119 23.9411 13.7965 20.2 18 20.2Z" fill="white"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.maxDepth }}</div>
              <div class="card-label">Niveles de Profundidad</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="card-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <circle cx="18" cy="18" r="18" fill="#9F00AD"/>
                <circle cx="18" cy="18" r="18" fill="#D209B6"/>
                <path d="M18 19.0667C20.5037 19.0667 22.5333 17.037 22.5333 14.5333C22.5333 12.0296 20.5037 10 18 10C15.4963 10 13.4667 12.0296 13.4667 14.5333C13.4667 17.037 15.4963 19.0667 18 19.0667Z" fill="white"/>
                <path d="M23.6666 17.9333C25.5444 17.9333 27.0666 16.4111 27.0666 14.5333C27.0666 12.6556 25.5444 11.1333 23.6666 11.1333C21.7889 11.1333 20.2667 12.6556 20.2667 14.5333C20.2667 16.4111 21.7889 17.9333 23.6666 17.9333Z" fill="white"/>
                <path d="M12.3334 17.9333C14.2111 17.9333 15.7333 16.4111 15.7333 14.5333C15.7333 12.6556 14.2111 11.1333 12.3334 11.1333C10.4556 11.1333 8.93339 12.6556 8.93339 14.5333C8.93339 16.4111 10.4556 17.9333 12.3334 17.9333Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24.3115 24.7333H26.9476C27.6185 24.7333 28.1319 24.1553 27.9699 23.5048C27.5517 21.8388 26.441 19.0667 23.6666 19.0667C22.6625 19.0667 21.876 19.4293 21.2617 19.9733C22.9708 21.0806 23.8548 23.022 24.3115 24.7333ZM14.7383 19.9733C14.0799 19.3782 13.2207 19.0543 12.3334 19.0667C9.55898 19.0667 8.44832 21.8388 8.03013 23.5048C7.86806 24.1553 8.38146 24.7333 9.05239 24.7333H11.6896C12.1464 23.022 13.0292 21.0806 14.7383 19.9733Z" fill="white"/>
                <path d="M18 20.2C22.2035 20.2 23.2881 23.9411 23.5692 25.8735C23.6598 26.4934 23.1589 27 22.5333 27H13.4667C12.8411 27 12.3413 26.4934 12.4308 25.8735C12.7119 23.9411 13.7965 20.2 18 20.2Z" fill="white"/>
              </svg>
            </div>
            <div class="card-content">
              <div class="card-value">{{ hierarchyStats.highPerformance }}</div>
              <div class="card-label">Alto Rendimiento</div>
            </div>
          </div>
        </div>
        
                 <!-- Distribución por niveles -->
         <div class="levels-distribution">
           <div class="distribution-header">
             <h3 class="distribution-title">Distribución por Niveles</h3>
           </div>
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
      },
      loadingProgress: 0 // Progreso de carga en porcentaje
    }
  },
  computed: {
    session()   { return this.$store.state.session },
    office_id() { return this.$store.state.office_id },
    name()      { return this.$store.state.name },
    activated() { return this.$store.state.activated },
    affiliated() { return this.$store.state.affiliated },
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
/*       console.log("selec_node:", this.children_points);  */
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
/*          console.error("Error al cargar detalles del usuario:", error); */
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
      this.loadingProgress = 0;
      try {
        // Usar el nuevo endpoint que carga TODO el árbol de una vez (como admin)
        this.loadingProgress = 20;
        const { data } = await api.treeComplete(this.session, null);
        
        if (data.error) {
          throw new Error(data.msg || 'Error loading tree');
        }
        
        this.loadingProgress = 80;
        
        // El nodo ya viene con todos los niveles cargados
        this.node = data.node;
        
        // Calcular estadísticas con todos los niveles ya cargados
        this.calculateHierarchyStats();
        this.loadingProgress = 100;
        this.loading = false;
        
        console.log('Árbol completo cargado exitosamente en una sola consulta');
      } catch (error) {
        console.error("Error al cargar estadísticas de jerarquía:", error);
        this.loading = false;
      }
    },
    

    
    // Método para depurar la estructura del árbol
    debugTreeStructure(node, level = 0) {
      if (!node) return;
      
      const indent = '  '.repeat(level);
/*       console.log(`${indent}Nivel ${level}: ${node.name} (ID: ${node.id})`); */
      
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
       
       // Contar miembros totales y distribución por niveles (optimizado)
       this.countMembersByLevel(this.node, 0, stats);
       
       // Calcular afiliados directos (hijos directos del usuario logueado)
       stats.directAffiliates = this.node._childs ? this.node._childs.length : 0;
       
       // Calcular alto rendimiento (usuarios con más de 1000 puntos)
       stats.highPerformance = this.countHighPerformanceUsers(this.node);
       
       // Asegurar que el nivel 0 tenga al menos 1 (el usuario logueado)
       if (!stats.levelDistribution[0]) {
         stats.levelDistribution[0] = 1;
       }
       
       // Actualizar las estadísticas
       this.hierarchyStats = stats;
       
       // Solo mostrar logs en desarrollo
       if (process.env.NODE_ENV === 'development') {
        //  console.log('Estadísticas calculadas:', stats);
        //  console.log('Distribución por niveles:', stats.levelDistribution);
       }
     },
    
    
     

    
    // Método para limpiar caché y recargar datos (útil para debugging)
    clearCacheAndReload() {
      // Limpiar caché de hijos cargados
      if (this.node) {
        this.clearNodeCache(this.node);
      }
      
      // Recargar estadísticas
      this.loadHierarchyStats();
    },
    
    // Método recursivo para limpiar caché
    clearNodeCache(node) {
      if (node._childs) {
        delete node._childs;
        // Limpiar caché de hijos recursivamente
        if (node.childs) {
          node.childs.forEach(child => this.clearNodeCache(child));
        }
      }
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
      
      // Contar hijos recursivamente (sin limitaciones)
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
      
      // Recursivamente contar hijos (sin limitaciones)
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
@import '../../assets/style/views/app/Tree.styl'
</style>
