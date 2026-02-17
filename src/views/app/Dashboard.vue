<template>
  <App :session="session" :title="title">
    <div v-cloak>
      <!-- Banner slider (mantener el existente) -->
      <div v-if="!loading && bannerImages.length > 0" class="banner-slider">
        <div class="slider-wrapper">
          <transition name="carousel-3d" mode="out-in">
            <div class="banner-slide" :key="currentBanner">
              <img :src="bannerImages[currentBanner]" class="banner-img" />
            </div>
          </transition>
          <button
            v-if="bannerImages.length > 1"
            class="nav left"
            @click="prevBanner"
          >
            &#8592;
          </button>
          <button
            v-if="bannerImages.length > 1"
            class="nav right"
            @click="nextBanner"
          >
            &#8594;
          </button>
        </div>
        <div v-if="bannerImages.length > 1" class="dots">
          <span
            v-for="(img, idx) in bannerImages"
            :key="'dot-' + idx"
            :class="['dot', { active: currentBanner === idx }]"
            @click="goToBanner(idx)"
          ></span>
        </div>
      </div>
      <div v-else-if="!loading" class="no-banners-msg">
        <p>No hay banners para mostrar.</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
      
      <SkeletonLoader
        v-if="loading"
        :lines="6"
        width="100%"
        height="60px"
        style="margin: 24px 0"
      />

      <!-- Nuevo Dashboard Design -->
      <div v-else class="dashboard-container">
        <!-- Top Row -->
        <div class="dashboard-row">
          <!-- Nivel Actual Rediseñado -->
          <div class="dashboard-section nivel-actual-section">
            
            <!-- Shortcuts Row -->
            <div class="shortcuts-row">
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-graduation-cap"></i></div>
                <span>Educación</span>
              </router-link>
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-headphones"></i></div>
                <span>Audios</span>
              </router-link>
              <router-link to="/tools" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-book"></i></div>
                <span>Libros</span>
              </router-link>
              <router-link to="/flyer-editor" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-bullhorn rotate-icon"></i></div>
                <span>Flyers</span>
              </router-link>
              <a href="https://www.youtube.com/playlist?list=PLWYJViqkAe6HpJyjfc1vw01o5lThSUulM" target="_blank" class="shortcut-item">
                <div class="shortcut-icon"><i class="fas fa-quote-left"></i></div>
                <span>Testimonios</span>
              </a>
            </div>

            <!-- Max Rank Banner -->
            <div class="max-rank-banner">
              <div class="banner-info">
                <span class="banner-title">Rango Máximo Alcanzado</span>
                <span class="banner-rank">{{ rank | _rank }}</span>
              </div>
              <div class="rank-badge">
                <i class="fas fa-gem gem-icon"></i>
                <span class="sparkle s1"></span>
                <span class="sparkle s2"></span>
                <span class="sparkle s3"></span>
                <span class="sparkle s4"></span>
              </div>
            </div>

            <!-- Bottom Stats Row (Keeping for reference as requested, but maybe user wanted to replace them? I will keep them but focus the 8 new cards below) -->
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-header">
                  <span class="dash-card-title">Saldo Ganado</span>
                </div>
                <span class="dash-card-value-magenta">S/ {{ Number(ins + insVirtual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <div class="stat-icon-premium">
                  <!-- Money Bag SVG (EXACT Copy from Total Ganado) -->
                  <svg viewBox="0 0 100 110" class="money-bag-stat-svg">
                    <defs>
                      <radialGradient id="bagStatGradientFinal" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                        <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#33691e;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                      </radialGradient>
                      <linearGradient id="goldStatGradientFinal" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#ffee58;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#fbc02d;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f9a825;stop-opacity:1" />
                      </linearGradient>
                      <linearGradient id="tieStatGradientFinal" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#fbc02d;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#fdd835;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#fbc02d;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="50" cy="98" rx="35" ry="8" fill="#000" opacity="0.15" />
                    <path d="M35 30 Q30 5 45 15 Q50 5 55 15 Q70 5 65 30 Z" fill="#689f38" stroke="#33691e" stroke-width="0.5" />
                    <path d="M38 28 Q42 18 45 22 Q50 15 55 22 Q58 18 62 28" fill="none" stroke="#33691e" stroke-width="0.5" opacity="0.5" />
                    <path d="M15 65 C15 95 30 100 50 100 C70 100 85 95 85 65 C85 45 75 30 50 30 C25 30 15 45 15 65 Z" fill="url(#bagStatGradientFinal)" />
                    <rect x="34" y="28" width="32" height="6" rx="3" fill="url(#tieStatGradientFinal)" stroke="#f9a825" stroke-width="0.5" />
                    <g transform="translate(50, 70)">
                      <text x="0" y="0" font-family="Arial Black, Arial" font-size="42" fill="url(#goldStatGradientFinal)" text-anchor="middle" dominant-baseline="middle" font-weight="900" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3))" stroke="#fbc02d" stroke-width="0.5">$</text>
                    </g>
                    <path d="M22 60 C22 50 30 40 45 40" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.1" />
                  </svg>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="dash-card-title">Total de Personas</span>
                </div>
                <div class="stat-row-item">
                  <span class="dash-card-value">{{ n_affiliates_total || 0 }}</span>
                </div>
                <div class="stat-icon-premium">
                  <!-- Team Silhouettes SVG -->
                  <svg viewBox="0 0 100 80" class="team-stat-svg" fill="#E91E63">
                    <circle cx="50" cy="30" r="15" />
                    <path d="M20 70c0-15 10-25 30-25s30 10 30 25H20z" />
                    <circle cx="25" cy="40" r="10" opacity="0.6" />
                    <path d="M5 70c0-10 5-18 20-18s20 8 20 18H5z" opacity="0.6" />
                    <circle cx="75" cy="40" r="10" opacity="0.6" />
                    <path d="M55 70c0-10 5-18 20-18s20 8 20 18H55z" opacity="0.6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Info Cards Grid (8 Cards) -->
        <div class="new-dashboard-grid">
          <!-- 1. Próximo Rango -->
          <div class="info-card next-rank-card">
            <div class="info-content-horizontal">
              <div class="info-text-side">
                <span class="dash-card-title">Próximo Rango</span>
                <span class="dash-card-value">{{ provisionalRank | _rank }}</span>
                <span class="dash-card-subtitle">{{ nextRankPercentage }}% de avance hacia {{ nextRankName | _rank }}</span>
              </div>
              <div class="gauge-container">
                <svg viewBox="0 0 100 60" class="gauge-svg">
                  <defs>
                    <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#4a4a4a;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <!-- Background Arc -->
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f5f5f5" stroke-width="10" />
                  
                  <!-- Segments with gaps -->
                  <!-- Segment 1: Pink -->
                  <path d="M 12 45 A 38 38 0 0 1 28 18" fill="none" stroke="#f953c6" stroke-width="9" />
                  <!-- Segment 2: Orange -->
                  <path d="M 32 16 A 38 38 0 0 1 48 12" fill="none" stroke="#ff9800" stroke-width="9" />
                  <!-- Segment 3: Bronze/Brown -->
                  <path d="M 52 12 A 38 38 0 0 1 68 16" fill="none" stroke="#a08c35" stroke-width="9" />
                  <!-- Segment 4: Dark Gray -->
                  <path d="M 72 18 A 38 38 0 0 1 88 45" fill="none" stroke="#444" stroke-width="9" />

                  <!-- Center decorative circle -->
                  <circle cx="50" cy="50" r="2" fill="#ccc" />

                  <!-- Needle -->
                  <g class="needle" :style="{ transform: `rotate(${(nextRankPercentage / 100) * 180 - 90}deg)` }">
                    <path d="M 50 50 L 47 50 L 50 10 L 53 50 Z" fill="url(#needleGradient)" />
                    <circle cx="50" cy="50" r="6" fill="#333" />
                    <circle cx="50" cy="50" r="2" fill="#666" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <!-- 4. Rango Cerrado -->
          <!-- 4. Rango Cerrado -->
          <div class="info-card closed-rank-card">
            <div class="closed-rank-info-group">
              <div class="closed-rank-left">
                <i class="fas fa-trophy trophy-icon-closed"></i>
              </div>
              <div class="closed-rank-center">
                <span class="dash-card-title" style="color: #ccc !important">Rango Cerrado</span>
                <span class="dash-card-value" style="color: #fff !important">{{ rank | _rank }}</span>
              </div>
            </div>
            <div class="closed-rank-right">
              <div class="rank-badge static">
                <i class="fas fa-gem gem-icon-closed"></i>
              </div>
            </div>
          </div>

          <!-- 3. Total Ganado -->
          <div class="info-card total-ganado-card">
            <div class="info-content-horizontal">
              <div class="info-text-side">
                <span class="dash-card-title">Total Ganado</span>
                <span class="dash-card-value-magenta">S/ {{ Number(ins + insVirtual).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <span class="dash-card-subtitle">Acumulado histórico</span>
              </div>
              <div class="money-bag-container">
                <svg viewBox="0 0 100 110" class="money-bag-svg">
                  <defs>
                    <radialGradient id="bagGradient" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                      <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                      <stop offset="70%" style="stop-color:#33691e;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                    </radialGradient>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#ffee58;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#fbc02d;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#f9a825;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="tieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#fbc02d;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#fdd835;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#fbc02d;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  
                  <!-- Shadow -->
                  <ellipse cx="50" cy="98" rx="35" ry="8" fill="#000" opacity="0.15" />
                  
                  <!-- Top Folds (Cloth above tie) -->
                  <path d="M35 30 Q30 5 45 15 Q50 5 55 15 Q70 5 65 30 Z" fill="#689f38" stroke="#33691e" stroke-width="0.5" />
                  <path d="M38 28 Q42 18 45 22 Q50 15 55 22 Q58 18 62 28" fill="none" stroke="#33691e" stroke-width="0.5" opacity="0.5" />

                  <!-- Main Bag Body -->
                  <path d="M15 65 C15 95 30 100 50 100 C70 100 85 95 85 65 C85 45 75 30 50 30 C25 30 15 45 15 65 Z" fill="url(#bagGradient)" />
                  
                  <!-- Tie (Gold rope) -->
                  <rect x="34" y="28" width="32" height="6" rx="3" fill="url(#tieGradient)" stroke="#f9a825" stroke-width="0.5" />
                  
                  <!-- Dollar Sign ($) -->
                  <g transform="translate(50, 70)">
                    <text x="0" y="0" font-family="Arial Black, Arial" font-size="42" fill="url(#goldGradient)" text-anchor="middle" dominant-baseline="middle" font-weight="900" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3))" stroke="#fbc02d" stroke-width="0.5">$</text>
                  </g>

                  <!-- Subtle highlights -->
                  <path d="M22 60 C22 50 30 40 45 40" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.1" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 2. Saldo Disponible -->
          <div class="info-card saldo-disponible-card">
            <div class="info-content-horizontal">
              <div class="info-text-side">
                <span class="dash-card-title">Saldo Disponible</span>
                <span class="dash-card-value">S/ {{ (balance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <span class="dash-card-subtitle">Disponible para retiro</span>
              </div>
              <div class="wallet-container">
                <svg viewBox="0 0 100 100" class="wallet-svg">
                  <!-- Coin -->
                  <circle cx="65" cy="30" r="15" fill="#ffd700" stroke="#fbc02d" stroke-width="1" />
                  <text x="65" y="36" font-family="Arial Black" font-size="16" fill="#fbc02d" text-anchor="middle" font-weight="900">$</text>
                  <!-- Wallet body -->
                  <path d="M15 40 Q15 35 20 35 L80 35 Q85 35 85 40 L85 85 Q85 90 80 90 L20 90 Q15 90 15 85 Z" fill="#2e7d32" />
                  <path d="M15 45 L85 45" stroke="#1b5e20" stroke-width="2" opacity="0.3" />
                  <!-- Wallet flap -->
                  <path d="M50 35 L85 35 L85 65 L50 65 Q45 65 45 50 Q45 35 50 35 Z" fill="#388e3c" />
                  <circle cx="75" cy="50" r="4" fill="#ffeb3b" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Merge: Personas en tu Red & Total de Puntos Grupales -->
          <div class="info-card merged-stats-card">
            <div class="merged-column">
              <div class="merged-header">
                <div class="merged-icon team-icon-merged">
                  <svg viewBox="0 0 100 80" fill="#E91E63">
                    <circle cx="50" cy="30" r="15" />
                    <path d="M20 70c0-15 10-25 30-25s30 10 30 25H20z" />
                    <circle cx="25" cy="40" r="10" opacity="0.6" />
                    <path d="M5 70c0-10 5-18 20-18s20 8 20 18H5z" opacity="0.6" />
                    <circle cx="75" cy="40" r="10" opacity="0.6" />
                    <path d="M55 70c0-10 5-18 20-18s20 8 20 18H55z" opacity="0.6" />
                  </svg>
                </div>
                <span class="dash-card-title">Personas en tu Red</span>
              </div>
              <div class="merged-value-container">
                <span class="dash-card-value">{{ n_affiliates_total || 0 }}</span>
                <span class="dash-card-subtitle">Total acumulado</span>
              </div>
            </div>
            <div class="merged-divider"></div>
            <div class="merged-column">
              <div class="merged-header">
                <div class="merged-icon points-icon-merged">
                  <svg viewBox="0 0 100 80" class="tokens-svg">
                    <!-- Right/Back Stack (Taller) -->
                    <!-- Token 4 (Bottom) -->
                    <ellipse cx="65" cy="55" rx="18" ry="7" fill="#880e4f" />
                    <rect x="47" y="51" width="36" height="4" fill="#ad1457" />
                    <ellipse cx="65" cy="51" rx="18" ry="7" fill="#ad1457" stroke="#880e4f" stroke-width="0.5" />
                    <!-- Token 3 -->
                    <rect x="47" y="47" width="36" height="4" fill="#c2185b" />
                    <ellipse cx="65" cy="47" rx="18" ry="7" fill="#c2185b" stroke="#880e4f" stroke-width="0.5" />
                    <!-- Token 2 -->
                    <rect x="47" y="43" width="36" height="4" fill="#d81b60" />
                    <ellipse cx="65" cy="43" rx="18" ry="7" fill="#d81b60" stroke="#880e4f" stroke-width="0.5" />
                    <!-- Token 1 (Top) -->
                    <rect x="47" y="39" width="36" height="4" fill="#e91e63" />
                    <ellipse cx="65" cy="39" rx="18" ry="7" fill="#e91e63" />
                    <ellipse cx="65" cy="39" rx="15" ry="5" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.3" />

                    <!-- Left/Front Stack (Shorter) -->
                    <!-- Token 3 (Bottom) -->
                    <ellipse cx="35" cy="65" rx="18" ry="7" fill="#880e4f" />
                    <rect x="17" y="61" width="36" height="4" fill="#ad1457" />
                    <ellipse cx="35" cy="61" rx="18" ry="7" fill="#ad1457" stroke="#880e4f" stroke-width="0.5" />
                    <!-- Token 2 -->
                    <rect x="17" y="57" width="36" height="4" fill="#c2185b" />
                    <ellipse cx="35" cy="57" rx="18" ry="7" fill="#c2185b" stroke="#880e4f" stroke-width="0.5" />
                    <!-- Token 1 (Top) -->
                    <rect x="17" y="53" width="36" height="4" fill="#d81b60" />
                    <ellipse cx="35" cy="53" rx="18" ry="7" fill="#d81b60" />
                    <ellipse cx="35" cy="53" rx="15" ry="5" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.3" />
                  </svg>
                </div>
                <span class="dash-card-title">Total de Puntos Grupales</span>
              </div>
              <div class="merged-value-container">
                <span class="dash-card-value">{{ total_points || 0 }}</span>
                <span class="dash-card-subtitle accent">Este mes</span>
              </div>
            </div>
          </div>

          <!-- 5. Puntos Personales -->
          <div class="info-card personal-points-card">
            <div class="personal-top-row">
              <div class="personal-info-side">
                <div class="personal-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="#E91E63">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div class="personal-text-block">
                  <span class="dash-card-title">Puntos Personales</span>
                  <div class="personal-points-value">
                    <span class="dash-card-value pts-number">{{ points || 0 }}</span>
                    <span class="dash-card-subtitle pts-label">PTS</span>
                  </div>
                </div>
              </div>
              <div class="merged-divider thin"></div>
              <div class="personal-status-side" :class="{ 'is-active': activated }">
                <div class="status-icon">
                  <svg v-if="activated" viewBox="0 0 24 24" fill="#4caf50">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="#f44336">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" fill="#fff" />
                  </svg>
                </div>
                <span class="status-text">{{ activated ? 'Activo' : 'Inactivo' }}</span>
              </div>
            </div>
            <div class="personal-bottom-banner">
              <div class="banner-icon-side">
                <svg viewBox="0 0 24 24" class="briefcase-banner-svg">
                  <path d="M7 6V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h3zm2-1v1h6V5H9zm-5 7h5v2h6v-2h5V8H4v4zm5 2v2h6v-2H9z" fill="#E91E63" />
                </svg>
              </div>
              <span>{{ activationLevelLabel }}</span>
            </div>
          </div>

          <!-- 6. Saldo no disponible -->
          <div class="info-card saldo-no-disponible-card">
            <!-- Glossy Horizontal Line -->
            <div class="glow-horizontal-line"></div>
            
            <!-- Large background lock (Glossy/Glass effect) -->
            <div class="bg-lock-icon-premium">
              <svg viewBox="0 0 100 120">
                <defs>
                   <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" style="stop-color:#fff;stop-opacity:0.2" />
                     <stop offset="50%" style="stop-color:#fff;stop-opacity:0.05" />
                     <stop offset="100%" style="stop-color:#fff;stop-opacity:0.1" />
                   </linearGradient>
                </defs>
                <rect x="15" y="45" width="70" height="60" rx="15" fill="url(#glassGradient)" stroke="white" stroke-opacity="0.2" stroke-width="1" />
                <path d="M30 45 V30 C30 18 38 10 50 10 C62 10 70 18 70 30 V45" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="8" stroke-linecap="round" />
                <circle cx="50" cy="75" r="8" fill="white" fill-opacity="0.2" />
                <path d="M50 83 V90" stroke="white" stroke-opacity="0.2" stroke-width="4" stroke-linecap="round" />
              </svg>
            </div>

            <div class="info-content-horizontal relative">
              <div class="info-text-side">
                <div class="title-with-premium-lock">
                  <div class="premium-wallet-lock">
                    <svg viewBox="0 0 40 40">
                      <defs>
                        <linearGradient id="walletGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style="stop-color:#ff4081;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#c2185b;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Shackle (Lock handle) -->
                      <path d="M12 18 V10 C12 6 15 3 20 3 C25 3 28 6 28 10 V18" fill="none" stroke="#ff80ab" stroke-width="4" stroke-linecap="round" />
                      <!-- Wallet Body -->
                      <rect x="6" y="15" width="28" height="20" rx="6" fill="url(#walletGradient)" />
                      <!-- Stitching or Detail line -->
                      <rect x="6" y="20" width="28" height="2" fill="#880e4f" opacity="0.2" />
                      <!-- Keyhole -->
                      <circle cx="20" cy="24" r="3.5" fill="white" />
                      <path d="M18 24 L22 24 L24 31 L16 31 Z" fill="white" />
                    </svg>
                  </div>
                  <span class="dash-card-title" style="color: rgba(255,255,255,0.7) !important">Saldo No Disponible</span>
                </div>
                <span class="dash-card-value" style="color: #fff !important; font-size: 28px !important">S/ {{ (_balance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <span class="dash-card-subtitle" style="color: rgba(255,255,255,0.6) !important">Activate antes del cierre <br><span class="magenta-text">para liberarlo</span></span>
              </div>
            </div>
          </div>

          <!-- 7. Pack afiliación -->
          <div class="info-card pack-afiliacion-card">
            <div class="pack-content-wrapper">
              <span class="dash-card-title">Pack de Afiliación</span>
              <div class="pack-banner-box">
                <div class="banner-icon-side">
                  <svg viewBox="0 0 24 24" class="briefcase-banner-svg">
                    <path d="M7 6V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h3zm2-1v1h6V5H9zm-5 7h5v2h6v-2h5V8H4v4zm5 2v2h6v-2H9z" fill="#E91E63" />
                  </svg>
                </div>
                <span class="pack-name-text">{{ formattedPlan }}</span>
              </div>
            </div>
          </div>

          <!-- 9. Bono Ahorro -->
          <div class="info-card bono-ahorro-card">
            <div class="info-content-horizontal">
              <div class="info-text-side">
                <span class="dash-card-title">Bono Ahorro</span>
                <span class="dash-card-value-magenta">S/ {{ (ins_ahorro || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}</span>
                <span class="dash-card-subtitle">Canjéalo por productos</span>
              </div>
              <div class="piggy-bank-container">
                <svg viewBox="0 0 120 100" class="piggy-bank-svg">
                  <defs>
                    <radialGradient id="piggyBody" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                      <stop offset="0%" style="stop-color:#ff80ab;stop-opacity:1" />
                      <stop offset="70%" style="stop-color:#f50057;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#c51162;stop-opacity:1" />
                    </radialGradient>
                    <radialGradient id="piggyHighlight" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                      <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                    </radialGradient>
                  </defs>
                  
                  <!-- Shadow -->
                  <ellipse cx="65" cy="92" rx="40" ry="8" fill="#000" opacity="0.12" />
                  
                  <!-- Piggy Body (Glossy pink) -->
                  <path d="M20 55 C20 30 42 15 68 15 C95 15 115 30 115 55 C115 75 95 85 68 85 C42 85 20 75 20 55 Z" fill="url(#piggyBody)" />
                  
                  <!-- Snout -->
                  <ellipse cx="15" cy="55" rx="8" ry="12" fill="#f50057" stroke="#c51162" stroke-width="0.5" />
                  <circle cx="12" cy="51" r="2.5" fill="#880e4f" opacity="0.4" />
                  <circle cx="12" cy="59" r="2.5" fill="#880e4f" opacity="0.4" />
                  
                  <!-- Ears -->
                  <path d="M72 18 L78 2 L92 20 Z" fill="#f50057" stroke="#c51162" stroke-width="0.5" />
                  <path d="M85 30 L95 15 L108 35 Z" fill="#f50057" stroke="#c51162" stroke-width="0.5" />
                  
                  <!-- Legs -->
                  <rect x="45" y="78" width="15" height="15" rx="6" fill="#c51162" />
                  <rect x="85" y="78" width="15" height="15" rx="6" fill="#c51162" />
                  
                  <!-- Tail (Curly) -->
                  <path d="M115 50 Q130 40 120 30 T110 20" fill="none" stroke="#f50057" stroke-width="2.5" stroke-linecap="round" />
                  
                  <!-- Glossy Highlights -->
                  <ellipse cx="65" cy="38" rx="20" ry="12" fill="url(#piggyHighlight)" opacity="0.5" transform="rotate(-15, 65, 38)" />
                  <circle cx="95" cy="55" r="10" fill="url(#piggyHighlight)" opacity="0.3" />
                  <circle cx="45" cy="40" r="3.5" fill="#fff" opacity="0.8" /> <!-- Eye light -->
                  
                  <!-- Coin Slot -->
                  <rect x="58" y="25" width="22" height="4" rx="2" fill="#fff" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </App>
</template>

<script>
import App from "@/views/layouts/App";
import api from "@/api";
import Spinner from "@/components/Spinner.vue";
import SkeletonLoader from "@/components/SkeletonLoader.vue";

export default {
  components: {
    App,
    Spinner,
    SkeletonLoader,
  },
  data() {
    return {
      banner: { img: null },
      ins: null,
      outs: null,
      balance: null,
      _balance: null,
      team: null,
      rank: "",
      points: null,
      directs: [],
      frontals: [],
      loading: true,
      plans: null,
      total_points: null,
      n_affiliates_total: 0,
      nextRankName: "",
      nextRankPercentage: 0,
      provisionalRank: "",
      travelBonusText: null,

      ins_ahorro: 0,
      op: 1,
      op2: 0,
      op3: 0,
      node: {},
      currentBanner: 0,
      bannerInterval: null,
      };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    activated() {
      return this.$store.state.activated;
    },
    _activated() {
      return this.$store.state._activated;
    },
    formattedPlan() {
      const p = this.$store.state.plan || this.plan;
      if (!p || p === 'none') return "Ninguno";
      const v = p.toLowerCase();
      if (v == "early") return "Cliente preferente";
      if (v == "basic") return "Ejecutivo";
      if (v == "standard") return "Distribuidor";
      if (v == "business") return "Empresarial";
      if (v == "master") return "Empresario";
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    },
    userPlan() {
      if (!this.plans) return null;
      // Buscar por nombre o id según corresponda
      return this.plans.find(p => p.name === this.plan || p.id === this.plan);
    },
    title() {
      return "Dashboard";
    },
    bannerImages() {
      return [this.banner.img, this.banner.img2, this.banner.img3].filter(
        (img) => typeof img === "string" && img.trim() !== ""
      );
    },
    activationLevelLabel() {
      if (this.activated) {
        if ((this.points || 0) >= 120) {
          return "Activación Ejecutiva/Empresarial";
        }
        return "Activación Básica";
      }
      return this.formattedPlan;
    },
  },
  filters: {
    _rank(val) {
      if (!val) return "Ninguno";
      const v = val.toLowerCase();
      let result = "";
      if (v == "none") result = "Ninguno";
      else if (v == "active") result = "Activo";
      else if (v == "star") result = "Bronce";
      else if (v == "master") result = "Master";
      else if (v == "silver") result = "Plata";
      else if (v == "si") result = "Platino";
      else if (v == "gold") result = "Oro";
      else if (v == "sapphire") result = "Zafiro";
      else if (v == "rubi" || v == "ruby") result = "Ruby";
      else if (v == "emerald") result = "Esmeralda";
      else if (v == "diamond" || v == "diamante") result = "Diamante";
      else if (v.includes("doble diamante")) result = "Doble diamante";
      else if (v.includes("triple diamante")) result = "Triple diamante";
      else if (v.includes("diamante estrella")) result = "Diamante estrella";
      else result = v;

      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    },
  },
  methods: {
    nextBanner() {
      this.currentBanner = (this.currentBanner + 1) % this.bannerImages.length;
    },
    prevBanner() {
      this.currentBanner =
        (this.currentBanner - 1 + this.bannerImages.length) %
        this.bannerImages.length;
    },
    goToBanner(idx) {
      this.currentBanner = idx;
    },
    setupBannerAutoplay() {
      // Reiniciar cualquier intervalo previo
      if (this.bannerInterval) {
        clearInterval(this.bannerInterval);
        this.bannerInterval = null;
      }
      // Iniciar autoplay solo si hay más de una imagen
      if (this.bannerImages.length > 1) {
        this.bannerInterval = setInterval(() => {
          // Proteger contra longitud 0
          if (this.bannerImages.length > 0) {
            this.nextBanner();
          }
        }, 5000);
      }
    },
  },
  async created() {
    // GET data
    const { data } = await api.dashboard(this.session);
    this.loading = false;

    // error
    if (data.error && data.msg == "invalid session") {
      this.$router.push("/login");
      return;
    }

    // success - actualizar store
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.$store.commit("SET_EMAIL", data.email);
    this.$store.commit("SET_TOKEN", data.token);
    this.$store.commit("SET_TOTAL_POINTS", data.total_points);

    // Verificar afiliación
    if (!data.affiliated) {
      this.$router.push("/affiliation");
      return;
    }

    // Cargar datos del dashboard
    this.banner = data.banner;
    this.ins = data.ins;
    this.insVirtual = data.insVirtual;
    this.outs = data.outs ? data.outs.toFixed(2) : "0.00";
    this.balance = data.balance ? data.balance.toFixed(2) : "0.00";
    this._balance = data._balance ? data._balance.toFixed(2) : "0.00";
    this.team = data.team;
    this.rank = data.rank || "";
    this.points = data.points;
    this.node = data.node || {};
    this.n_affiliates = data.n_affiliates;
    this.n_affiliates_total = data.n_affiliates_total || 0;
    this.directs = data.directs || [];
    this.frontals = data.frontals || [];
    this.total_points = data.total_points;
    this.nextRankName = data.nextRankName || "";
    this.nextRankPercentage = data.nextRankPercentage || 0;
    this.provisionalRank = data.provisionalRank || "none";
    this.travelBonusText = data.travelBonusText || 'Tu progreso hacia el Bono Viaje se actualizará próximamente. ¡Sigue trabajando para alcanzar tus objetivos!';

    // Iniciar autoplay del banner si corresponde
    this.setupBannerAutoplay();
  },
  beforeDestroy() {
    if (this.bannerInterval) clearInterval(this.bannerInterval);
  },
};
</script>

<style scoped src="../../assets/style/views/app/Dashboard.css"></style>
