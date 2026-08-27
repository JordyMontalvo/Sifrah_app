<template>
  <App :session="session" title="Mi perfil">
    <div v-cloak>
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Cargando perfil...</p>
      </div>

      <div v-else class="profile-page">
        <h1 class="profile-page-title">Mi perfil</h1>

        <section class="profile-hero">
          <div class="profile-avatar-wrap">
            <label class="profile-avatar">
              <span class="profile-avatar-ring">
                <img
                  v-if="photoState == 'default'"
                  :src="photo"
                  class="profile-avatar-img"
                  alt="Foto de perfil"
                />
                <img
                  v-if="photoState == 'changed'"
                  :src="newPhoto"
                  class="profile-avatar-img"
                  alt="Foto de perfil"
                />
              </span>
              <span class="profile-camera-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M9.35 3.7 8.1 5.5H5.15A1.65 1.65 0 0 0 3.5 7.15v10.2A1.65 1.65 0 0 0 5.15 19h13.7a1.65 1.65 0 0 0 1.65-1.65V7.15A1.65 1.65 0 0 0 18.85 5.5H15.9L14.65 3.7a1.3 1.3 0 0 0-1.05-.45h-3.2c-.4 0-.78.16-1.05.45zM12 16.05a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6z"
                  />
                </svg>
              </span>
              <input
                type="file"
                accept="image/*"
                @change="changePhoto"
                class="profile-avatar-input"
              />
            </label>
          </div>
          <div class="profile-hero-info">
            <h2 class="profile-hero-name">{{ fullName }}</h2>
            <p class="profile-hero-dni" v-if="dni">DNI {{ dni }}</p>
            <p class="profile-hero-location" v-if="country || city">
              <span
                v-if="countryFlagSvg"
                class="profile-hero-flag"
                v-html="countryFlagSvg"
                aria-hidden="true"
              ></span>
              {{ locationLine }}
            </p>
            <span class="profile-hero-badge" v-if="badgeLabel">
              <img
                v-if="showRankIcon && rankPinImage"
                :src="rankPinImage"
                :alt="badgeLabel"
                class="profile-hero-badge-pin"
              />
              <svg
                v-else-if="showRankIcon"
                class="profile-hero-badge-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 3.2 20.2 12 12 20.8 3.8 12 12 3.2Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
              </svg>
              {{ badgeLabel }}
            </span>
          </div>
        </section>

        <div
          v-if="photoState == 'changed'"
          class="profile-photo-controls"
        >
          <button type="button" @click="cancelNewPhoto" class="profile-btn-ghost">
            Cancelar
          </button>
          <button type="button" @click="changeNewPhoto" class="profile-btn-primary" :disabled="sending">
            Guardar foto
          </button>
        </div>

        <nav class="profile-tabs" aria-label="Secciones del perfil">
          <button
            type="button"
            class="profile-tab"
            :class="{ active: activeTab === 'personal' }"
            @click="activeTab = 'personal'"
          >
            <svg class="profile-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <path d="M5.2 19.2c.8-3.4 3.4-5.2 6.8-5.2s6 1.8 6.8 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span class="profile-tab-label">Personal</span>
          </button>
          <button
            type="button"
            class="profile-tab"
            :class="{ active: activeTab === 'bancarios' }"
            @click="activeTab = 'bancarios'"
          >
            <svg class="profile-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 10h16M5 10v8M9 10v8M15 10v8M19 10v8M3.5 18.5h17M12 4l8 5H4l8-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
            <span class="profile-tab-label">Bancarios</span>
          </button>
          <button
            type="button"
            class="profile-tab"
            :class="{ active: activeTab === 'seguridad' }"
            @click="activeTab = 'seguridad'"
          >
            <svg class="profile-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.5 5.5 6.2v5.4c0 4.1 2.8 7.4 6.5 8.4 3.7-1 6.5-4.3 6.5-8.4V6.2L12 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M9.2 12.1 11.1 14l3.7-4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="profile-tab-label">Seguridad</span>
          </button>
          <router-link
            to="/security"
            class="profile-tab"
          >
            <svg class="profile-tab-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 10.4c.9-2.2 4.4-2.1 4.4.4 0 2.3-4.4 4.6-4.4 4.6S7.6 13.1 7.6 10.8c0-2.5 3.5-2.6 4.4-.4z" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="8.2" cy="17.4" r="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <path d="M5.4 21c.4-1.6 1.5-2.4 2.8-2.4s2.4.8 2.8 2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="15.8" cy="17.4" r="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
              <path d="M13 21c.4-1.6 1.5-2.4 2.8-2.4s2.4.8 2.8 2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <span class="profile-tab-label profile-tab-label-stack">
              <em>Legado</em>
              <em>SIFRAH</em>
            </span>
          </router-link>
        </nav>

        <div v-if="activeTab === 'personal'" class="profile-panels">
          <section class="profile-block">
            <h3 class="profile-block-title">Datos personales</h3>
            <div class="profile-card">
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.2 19.2c.8-3.4 3.4-5.2 6.8-5.2s6 1.8 6.8 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-name">Nombre</label>
                  <input id="profile-name" v-model="name" type="text" class="profile-row-input" autocomplete="given-name" />
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.2 19.2c.8-3.4 3.4-5.2 6.8-5.2s6 1.8 6.8 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-lastname">Apellido</label>
                  <input id="profile-lastname" v-model="lastName" type="text" class="profile-row-input" autocomplete="family-name" />
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
              <div class="profile-row profile-row-locked">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 10h4M7 13.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <span class="profile-row-label">DNI</span>
                  <span class="profile-row-value">{{ dni || '—' }}</span>
                </div>
              </div>
              <div class="profile-row profile-row-edit" @click="openBirthdatePicker">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-birthdate">Fecha de nacimiento</label>
                  <input
                    id="profile-birthdate"
                    ref="birthdateInput"
                    v-model="birthdate"
                    type="date"
                    class="profile-row-input profile-row-input-date"
                  />
                </div>
                <button
                  type="button"
                  class="profile-row-chevron-btn"
                  aria-label="Editar fecha de nacimiento"
                  @click.stop="openBirthdatePicker"
                >
                  <i class="fas fa-chevron-right profile-row-chevron"></i>
                </button>
              </div>
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.8h4.2l1.4 3.2-2.2 1.3a12 12 0 0 0 5.3 5.3l1.3-2.2 3.2 1.4V17a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 6.2 2 2 0 0 1 7 3.8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-phone">Celular</label>
                  <input id="profile-phone" v-model="phone" type="text" class="profile-row-input" />
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.2 7.2 12 12.4l7.8-5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-email">Correo electrónico</label>
                  <input id="profile-email" v-model="email" type="email" class="profile-row-input" />
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
            </div>
          </section>

          <section class="profile-block">
            <h3 class="profile-block-title">Ubicación</h3>
            <div class="profile-card">
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9.8" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-country">País</label>
                  <select id="profile-country" v-model="country" class="profile-row-input" @change="updateCities">
                    <option value="null" disabled>Selecciona un país</option>
                    <option value="Perú">Perú</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brazil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="United States">Estados Unidos</option>
                  </select>
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9l5-3 6 3.5V8l5 3v9M4 20h16M8 20v-5h3v5M14.5 12.5h2v2h-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-city">Ciudad</label>
                  <select id="profile-city" v-model="city" class="profile-row-input">
                    <option value="null" disabled>Ciudad</option>
                    <option v-for="item in cities" :key="item" :value="item">
                      {{ item }}
                    </option>
                  </select>
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
              <div class="profile-row profile-row-edit">
                <span class="profile-row-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20H4v-8.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 20v-6h4v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
                </span>
                <div class="profile-row-body">
                  <label class="profile-row-label" for="profile-address">Dirección</label>
                  <input id="profile-address" v-model="address" type="text" class="profile-row-input" />
                </div>
                <i class="fas fa-chevron-right profile-row-chevron"></i>
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'bancarios'" class="profile-panels profile-bank-panels">
          <section class="bank-card">
            <header class="bank-card-head">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 10h16M5 10v8M9 10v8M15 10v8M19 10v8M3.5 18.5h17M12 4l8 5H4l8-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
              </span>
              <div class="bank-card-head-text">
                <h3>Datos bancarios</h3>
                <p>Ingresa o actualiza tu información bancaria.</p>
              </div>
            </header>

            <div class="bank-field">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 10h16M5 10v8M9 10v8M15 10v8M19 10v8M3.5 18.5h17M12 4l8 5H4l8-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
              </span>
              <label class="bank-field-label" for="profile-bank">Banco</label>
              <div class="bank-field-control bank-field-select">
                <select id="profile-bank" v-model="bank" :disabled="bank_disabled">
                  <option value="null" disabled>Selecciona tu banco</option>
                  <option value="BCP">BCP</option>
                  <option value="INTERBANK">INTERBANK</option>
                  <option value="BBVA">BBVA</option>
                </select>
              </div>
            </div>

            <div class="bank-field">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.2" y="6" width="17.6" height="12.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M3.2 10h17.6" fill="none" stroke="currentColor" stroke-width="1.8"/>
                </svg>
              </span>
              <label class="bank-field-label" for="profile-account-type">Tipo de cuenta</label>
              <div class="bank-field-control bank-field-select">
                <select id="profile-account-type" v-model="account_type" :disabled="account_type_disabled">
                  <option value="null" disabled>Selecciona el tipo de cuenta</option>
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
            </div>

            <div class="bank-field">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 4.5 8.2 19.5M16.2 4.5 14.4 19.5M5 9.2h14.5M4.2 14.8h14.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <label class="bank-field-label" for="profile-account">Número de cuenta</label>
              <div class="bank-field-control">
                <input
                  id="profile-account"
                  v-model="account"
                  type="text"
                  inputmode="numeric"
                  placeholder="Ej. 1234 5678 9012 3456"
                  :readonly="account_disabled"
                />
              </div>
            </div>

            <div class="bank-field">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="6.2" cy="12" r="2.15" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <circle cx="17.8" cy="6.4" r="2.15" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <circle cx="17.8" cy="17.6" r="2.15" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M8.2 11.2 15.7 7.4M8.2 12.8 15.7 16.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <label class="bank-field-label" for="profile-ibk">CCI</label>
              <div class="bank-field-control">
                <input
                  id="profile-ibk"
                  v-model="ibk"
                  type="text"
                  inputmode="numeric"
                  placeholder="Ej. 002 123 012345678901 55"
                  :readonly="ibk_disabled"
                />
              </div>
            </div>

            <div class="bank-field">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M5.2 19.2c.8-3.4 3.4-5.2 6.8-5.2s6 1.8 6.8 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <label class="bank-field-label" for="profile-holder">Titular de la cuenta</label>
              <div class="bank-field-control">
                <input
                  id="profile-holder"
                  v-model="account_holder"
                  type="text"
                  placeholder="Nombre completo del titular"
                  :readonly="account_holder_disabled"
                />
              </div>
            </div>
          </section>

          <section class="bank-card">
            <header class="bank-card-head">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.2" y="7" width="17.6" height="12" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M3.2 10.4h17.6" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <circle cx="16.4" cy="14.6" r="1.15" fill="currentColor"/>
                </svg>
              </span>
              <div class="bank-card-head-text">
                <h3>Billeteras digitales</h3>
                <p>Asocia tus billeteras digitales para recibir pagos.</p>
              </div>
            </header>

            <div class="bank-wallet">
              <img
                class="bank-brand bank-brand-yape"
                src="@/assets/img/yape.png"
                alt="Yape"
              />
              <div class="bank-wallet-text">
                <strong>Yape</strong>
                <span>Número de celular</span>
              </div>
              <div class="bank-field-control">
                <input
                  id="profile-yape"
                  v-model="yape"
                  type="tel"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="Ej. 987 654 321"
                />
              </div>
            </div>

            <div class="bank-wallet">
              <img
                class="bank-brand bank-brand-plin"
                src="@/assets/img/plin.png"
                alt="Plin"
              />
              <div class="bank-wallet-text">
                <strong>Plin</strong>
                <span>Número de celular</span>
              </div>
              <div class="bank-field-control">
                <input
                  id="profile-plin"
                  v-model="plin"
                  type="tel"
                  inputmode="numeric"
                  maxlength="11"
                  placeholder="Ej. 987 654 321"
                />
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeTab === 'seguridad'" class="profile-security-panels">
          <section class="security-card">
            <header class="bank-card-head">
              <span class="profile-row-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3.1 19.4 6.2v5.8c0 4.7-3.2 8.4-7.4 9.6-4.2-1.2-7.4-4.9-7.4-9.6V6.2L12 3.1z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 12.15V10.7a2 2 0 0 1 4 0v1.45"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                  />
                  <rect
                    x="9.15"
                    y="12.15"
                    width="5.7"
                    height="4.55"
                    rx="1.05"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                  />
                </svg>
              </span>
              <div class="bank-card-head-text">
                <h3>Cambiar contraseña</h3>
                <p>Actualiza tu contraseña para mantener segura tu cuenta.</p>
              </div>
            </header>

            <div class="security-field">
              <label for="old-password">Contraseña actual</label>
              <div class="security-input-wrap">
                <input
                  id="old-password"
                  :type="showOld ? 'text' : 'password'"
                  v-model="oldPassword"
                  placeholder="Ingresa tu contraseña actual"
                  autocomplete="current-password"
                  @keydown="resetPasswordError"
                />
                <button
                  type="button"
                  class="security-toggle"
                  :aria-label="showOld ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showOld = !showOld"
                >
                  <svg v-if="!showOld" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6S2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.2 3.2 20.8 20.8M9.4 9.5A3 3 0 0 0 12 15a3 3 0 0 0 2.6-1.5M6.2 6.6C4 8.2 2.6 12 2.6 12S6.4 18 12 18c1.8 0 3.4-.5 4.8-1.3M17.6 15.8C20 14.1 21.4 12 21.4 12S17.6 6 12 6c-.7 0-1.4.1-2 .2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="security-field">
              <label for="new-password">Nueva contraseña</label>
              <div class="security-input-wrap">
                <input
                  id="new-password"
                  :type="showNew ? 'text' : 'password'"
                  v-model="newPassword"
                  placeholder="Ingresa tu nueva contraseña"
                  autocomplete="new-password"
                  @keydown="resetPasswordError"
                />
                <button
                  type="button"
                  class="security-toggle"
                  :aria-label="showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showNew = !showNew"
                >
                  <svg v-if="!showNew" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6S2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.2 3.2 20.8 20.8M9.4 9.5A3 3 0 0 0 12 15a3 3 0 0 0 2.6-1.5M6.2 6.6C4 8.2 2.6 12 2.6 12S6.4 18 12 18c1.8 0 3.4-.5 4.8-1.3M17.6 15.8C20 14.1 21.4 12 21.4 12S17.6 6 12 6c-.7 0-1.4.1-2 .2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <p class="security-hint">Mínimo 5 caracteres, letras y números.</p>
            </div>

            <div class="security-field">
              <label for="confirm-password">Confirmar nueva contraseña</label>
              <div class="security-input-wrap">
                <input
                  id="confirm-password"
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="Repite tu nueva contraseña"
                  autocomplete="new-password"
                  @keydown="resetPasswordError"
                />
                <button
                  type="button"
                  class="security-toggle"
                  :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showConfirm = !showConfirm"
                >
                  <svg v-if="!showConfirm" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6S2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.2 3.2 20.8 20.8M9.4 9.5A3 3 0 0 0 12 15a3 3 0 0 0 2.6-1.5M6.2 6.6C4 8.2 2.6 12 2.6 12S6.4 18 12 18c1.8 0 3.4-.5 4.8-1.3M17.6 15.8C20 14.1 21.4 12 21.4 12S17.6 6 12 6c-.7 0-1.4.1-2 .2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <p v-if="passwordError" class="password-alert">
              {{ passwordError }}
            </p>
            <p v-if="passwordSuccess" class="password-success">
              Contraseña actualizada correctamente
            </p>

            <button
              type="button"
              class="profile-btn-primary security-submit"
              :disabled="passwordSending"
              @click="UPDATE_PASSWORD"
            >
              <span v-if="!passwordSending">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6.2" y="11" width="11.6" height="9" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M8.4 11V8.4a3.6 3.6 0 0 1 7.2 0V11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                Actualizar contraseña
              </span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Actualizando...</span>
            </button>
          </section>
        </div>

        <div
          v-if="activeTab === 'personal' || activeTab === 'bancarios'"
          class="profile-save-bar"
        >
          <button
            type="button"
            class="profile-btn-primary profile-save-btn"
            :disabled="sending"
            @click="UPDATE"
          >
            <span v-if="!sending"><i class="fas fa-save"></i> Guardar cambios</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Guardando...</span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="showToast" class="glass-toast">
            ¡Datos guardados correctamente!
          </div>
        </transition>
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

const WEAK_PASSWORD_MSG =
  "La nueva contraseña debe tener al menos 5 caracteres, incluir al menos una letra y al menos un número";

function isValidPassword(password) {
  const value = String(password || "");
  if (value.length < 5) return false;
  const hasLetter = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasLetter && hasNumber;
}

const PASSWORD_ERROR_MESSAGES = {
  "invalid password": "La contraseña actual no coincide",
  "missing fields": "Completa todos los campos",
  "weak password": WEAK_PASSWORD_MSG,
};

const COUNTRY_FLAG_SVG = {
  Perú:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="3" height="6" fill="#D91023"/><rect x="3" width="3" height="6" fill="#fff"/><rect x="6" width="3" height="6" fill="#D91023"/></svg>',
  Argentina:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#74ACDF"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#74ACDF"/><circle cx="4.5" cy="3" r=".7" fill="#F6B40E"/></svg>',
  Bolivia:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#D52B1E"/><rect y="2" width="9" height="2" fill="#F9E300"/><rect y="4" width="9" height="2" fill="#007934"/></svg>',
  Brazil:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#009C3B"/><polygon points="4.5,0.7 8.2,3 4.5,5.3 0.8,3" fill="#FFDF00"/><circle cx="4.5" cy="3" r="1.1" fill="#002776"/></svg>',
  Chile:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="3" fill="#fff"/><rect y="3" width="9" height="3" fill="#D52B1E"/><rect width="3" height="3" fill="#0039A6"/></svg>',
  Colombia:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="3" fill="#FCD116"/><rect y="3" width="9" height="1.5" fill="#003893"/><rect y="4.5" width="9" height="1.5" fill="#CE1126"/></svg>',
  Ecuador:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="3" fill="#FFD100"/><rect y="3" width="9" height="1.5" fill="#0072CE"/><rect y="4.5" width="9" height="1.5" fill="#EF3340"/></svg>',
  Paraguay:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#D52B1E"/><rect y="2" width="9" height="2" fill="#fff"/><rect y="4" width="9" height="2" fill="#0038A8"/></svg>',
  Uruguay:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#fff"/><rect y="0" width="9" height="0.67" fill="#0038A8"/><rect y="1.33" width="9" height="0.67" fill="#0038A8"/><rect y="2.67" width="9" height="0.67" fill="#0038A8"/><rect y="4" width="9" height="0.67" fill="#0038A8"/><rect y="5.33" width="9" height="0.67" fill="#0038A8"/><rect width="3.4" height="3.3" fill="#fff"/><circle cx="1.7" cy="1.65" r=".7" fill="#FCD116"/></svg>',
  Venezuela:
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="2" fill="#FFCC00"/><rect y="2" width="9" height="2" fill="#00247D"/><rect y="4" width="9" height="2" fill="#CF142B"/></svg>',
  "United States":
    '<svg viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg"><rect width="9" height="6" fill="#BF0A30"/><rect y="0.46" width="9" height="0.46" fill="#fff"/><rect y="1.38" width="9" height="0.46" fill="#fff"/><rect y="2.3" width="9" height="0.46" fill="#fff"/><rect y="3.22" width="9" height="0.46" fill="#fff"/><rect y="4.14" width="9" height="0.46" fill="#fff"/><rect y="5.06" width="9" height="0.46" fill="#fff"/><rect width="3.6" height="3.2" fill="#002868"/></svg>',
};

const COUNTRY_ALIASES = {
  peru: "Perú",
  argentina: "Argentina",
  bolivia: "Bolivia",
  brazil: "Brazil",
  brasil: "Brazil",
  chile: "Chile",
  colombia: "Colombia",
  ecuador: "Ecuador",
  paraguay: "Paraguay",
  uruguay: "Uruguay",
  venezuela: "Venezuela",
  "united states": "United States",
  usa: "United States",
  us: "United States",
  "estados unidos": "United States",
  eeuu: "United States",
};

function countryFlagKey(country) {
  if (!country || country === "null") return "";
  if (COUNTRY_FLAG_SVG[country]) return country;
  const normalized = String(country)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return COUNTRY_ALIASES[normalized] || "";
}

function toDateInputValue(raw) {
  if (!raw) return "";
  const iso = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : "";
}

const JUNK_RANK_LABELS = new Set([
  "",
  "default",
  "none",
  "ninguno",
  "null",
  "user",
  "cliente vip",
]);

function formatRankLabel(raw) {
  if (raw == null) return "";
  const value = String(raw).trim();
  if (!value) return "";
  const v = value.toLowerCase();
  if (JUNK_RANK_LABELS.has(v)) return "";
  const map = {
    active: "Activo",
    activo: "Activo",
    star: "Bronce",
    bronce: "Bronce",
    silver: "Plata",
    plata: "Plata",
    gold: "Oro",
    oro: "Oro",
    ruby: "Rubí",
    rubi: "Rubí",
    "rubí": "Rubí",
    emerald: "Esmeralda",
    esmeralda: "Esmeralda",
    diamond: "Diamante",
    diamante: "Diamante",
  };
  if (map[v]) return map[v];
  if (v.includes("doble")) return "Doble diamante";
  if (v.includes("triple")) return "Triple diamante";
  if (v.includes("imperial")) return "Diamante imperial";
  if (v.includes("embajador")) return "Embajador Sifrah";
  return value;
}

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      activeTab: "personal",
      country: null,
      name: null,
      lastName: null,
      dni: null,
      email: null,
      phone: null,
      birthdate: null,
      address: null,
      token: null,
      city: null,
      city_disabled: false,
      bank: null,
      account_type: null,
      account: null,
      ibk: null,
      account_holder: null,
      yape: null,
      plin: null,
      bank_disabled: false,
      account_type_disabled: false,
      account_disabled: false,
      ibk_disabled: false,
      account_holder_disabled: false,
      loading: true,
      sending: false,
      c_token: false,
      c_link: false,
      showToast: false,
      cities: [],
      photoState: "default",
      newPhoto: null,
      photoFile: null,
      rankPinImage: null,
      currentRankLabel: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      showOld: false,
      showNew: false,
      showConfirm: false,
      passwordSending: false,
      passwordError: "",
      passwordSuccess: false,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    link() {
      return `${ROOT}/register/${this.token}`;
    },
    photo() {
      const p = this.$store.state.photo;
      if (!p || p.includes("avatar_cWVgh_GNP.png") || p.includes("avatar_bEyc3MFLf.png")) {
        return "/avatar.png";
      }
      return p;
    },
    fullName() {
      return `${this.name || ""} ${this.lastName || ""}`.trim();
    },
    birthdateDisplay() {
      if (!this.birthdate) return "—";
      const raw = String(this.birthdate);
      const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
      return raw;
    },
    locationLine() {
      const parts = [this.country, this.city].filter(
        (v) => v && v !== "null"
      );
      return parts.join(" • ");
    },
    countryFlagSvg() {
      const key = countryFlagKey(this.country);
      return (key && COUNTRY_FLAG_SVG[key]) || "";
    },
    badgeLabel() {
      const fromProgress = formatRankLabel(this.currentRankLabel);
      if (fromProgress) return fromProgress;
      const fromStore = formatRankLabel(this.$store.state.rank);
      if (fromStore) return fromStore;
      return "Ninguno";
    },
    showRankIcon() {
      return String(this.badgeLabel).toLowerCase() !== "ninguno";
    },
  },
  watch: {
    "$route.query.tab"(tab) {
      if (tab === "seguridad" || tab === "bancarios" || tab === "personal") {
        this.activeTab = tab;
      }
    },
  },
  async created() {
    const tab = this.$route.query.tab;
    if (tab === "seguridad" || tab === "bancarios" || tab === "personal") {
      this.activeTab = tab;
    }
    const { data } = await api.Profile.GET(this.session);
    this.loading = false;
    if (data.error && data.msg == "invalid session")
      this.$router.push("/login");
    if (data.error && data.msg == "unverified user")
      this.$router.push("/verify");
    this.$store.commit("SET_NAME", data.name);
    this.$store.commit("SET_LAST_NAME", data.lastName);
    this.$store.commit("SET_AFFILIATED", data.affiliated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
    this.$store.commit("SET_CITY", data.city);
    this.$store.commit("SET_EMAIL", data.email);
    this.$store.commit("SET_BIRTHDATE", data.birthdate);
    this.$store.commit("SET_DNI", data.dni);
    this.$store.commit("SET_TOKEN", data.token);
    if (data.rank) this.$store.commit("SET_RANK", data.rank);
    if (data.historicalRankLabel) {
      this.$store.commit("SET_HISTORICAL_RANK_LABEL", data.historicalRankLabel);
    }
    this.country = data.country;
    this.dni = data.dni;
    this.name = data.name;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.birthdate = toDateInputValue(data.birthdate);
    this.address = data.address;
    this.token = data.token;
    this.bank = data.bank;
    this.account_type = data.account_type;
    this.account = data.account;
    this.ibk = data.ibk;
    this.account_holder = data.account_holder || data.titular || null;
    this.yape = data.yape || null;
    this.plin = data.plin || null;
    this.city = data.city;
    this.updateCities();
    if (this.bank) this.bank_disabled = true;
    if (this.account_type) this.account_type_disabled = true;
    if (this.account) this.account_disabled = true;
    if (this.ibk) this.ibk_disabled = true;
    if (this.account_holder) this.account_holder_disabled = true;
    this.loadRankPin();
  },
  methods: {
    setRankPin(url) {
      const src = url ? String(url).trim() : "";
      if (src) this.rankPinImage = src;
    },
    async loadRankPin() {
      try {
        const { data } = await api.RankProgress.GET(this.session);
        if (data && !data.error && data.progress) {
          const progress = data.progress;
          this.currentRankLabel = progress.currentRankLabel || "";
          this.setRankPin(progress.currentRankImage);
        }
      } catch (e) {
        console.error("Error loading rank pin:", e);
      }
    },
    updateCities() {
      const countryCities = {
        Argentina: ["Buenos Aires", "Córdoba", "Rosario"],
        Bolivia: ["La Paz", "Santa Cruz", "Cochabamba"],
        Brazil: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
        Chile: ["Santiago", "Valparaíso", "Concepción"],
        Colombia: ["Bogotá", "Medellín", "Cali"],
        Ecuador: ["Quito", "Guayaquil", "Cuenca"],
        Paraguay: ["Asunción", "Ciudad del Este", "Encarnación"],
        Perú: [
          "Lima",
          "Arequipa",
          "Trujillo",
          "Cusco",
          "Piura",
          "Chiclayo",
          "Iquitos",
          "Huancayo",
          "Puno",
          "Tacna",
          "Juliaca",
          "Chimbote",
          "Callao",
          "Ayacucho",
          "Huánuco",
          "Cajamarca",
          "Tumbes",
          "Loreto",
          "Moquegua",
          "Pasco",
          "San Martín",
          "Apurímac",
          "Amazonas",
          "Ancash",
          "Junín",
          "Lambayeque",
          "La Libertad",
          "Ucayali",
          "Madre de Dios",
        ],
        Uruguay: ["Montevideo", "Salto", "Paysandú"],
        Venezuela: ["Caracas", "Maracaibo", "Valencia"],
        "United States": ["New York", "Los Angeles", "Chicago"],
      };
      this.cities = countryCities[this.country] || [];
    },
    async UPDATE() {
      if (this.photoState === "changed") {
        try {
          await this.changeNewPhoto();
        } catch (e) {
          console.error("Error saving photo as part of profile update:", e);
        }
      }

      const {
        name,
        lastName,
        email,
        phone,
        birthdate,
        address,
        bank,
        account_type,
        account,
        ibk,
        account_holder,
        yape,
        plin,
        city,
        country,
      } = this;
      this.sending = true;
      await api.Profile.UPDATE(this.session, {
        name,
        lastName,
        email,
        phone,
        birthdate,
        address,
        bank,
        account_type,
        account,
        ibk,
        account_holder,
        yape,
        plin,
        city,
        country,
      });
      this.$store.commit("SET_NAME", name);
      this.$store.commit("SET_LAST_NAME", lastName);
      this.$store.commit("SET_BIRTHDATE", birthdate);
      this.sending = false;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 3000);
    },
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
    changePhoto(e) {
      this.photoFile = e.target.files[0];

      if (!this.photoFile) return;

      const reader = new FileReader();

      reader.onload = (ev) => {
        this.newPhoto = ev.target.result;
        this.photoState = "changed";
      };

      reader.readAsDataURL(this.photoFile);
    },
    async changeNewPhoto() {
      try {
        this.sending = true;
        const ret = await lib.upload(
          this.photoFile,
          this.photoFile.name,
          "photos"
        );

        this.$store.commit("SET_PHOTO", ret);
        this.photoState = "default";

        await api.photo(this.session, { photo: ret });

        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
      } catch (e) {
        console.error("Error updating photo:", e);
      } finally {
        this.sending = false;
      }
    },
    cancelNewPhoto() {
      this.photoState = "default";
      this.newPhoto = null;
      this.photoFile = null;
    },
    openBirthdatePicker() {
      const el = this.$refs.birthdateInput;
      if (!el) return;
      if (typeof el.showPicker === "function") {
        try {
          el.showPicker();
          return;
        } catch (e) {
          /* iOS / Safari a veces bloquea showPicker */
        }
      }
      el.focus();
      el.click();
    },
    resetPasswordError() {
      this.passwordError = "";
      this.passwordSuccess = false;
    },
    validatePasswordForm() {
      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        this.passwordError = PASSWORD_ERROR_MESSAGES["missing fields"];
        return false;
      }
      if (!isValidPassword(this.newPassword)) {
        this.passwordError = WEAK_PASSWORD_MSG;
        return false;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.passwordError = "La confirmación no coincide con la nueva contraseña";
        return false;
      }
      if (this.oldPassword === this.newPassword) {
        this.passwordError = "La nueva contraseña debe ser diferente a la actual";
        return false;
      }
      return true;
    },
    async UPDATE_PASSWORD() {
      this.resetPasswordError();
      if (!this.validatePasswordForm()) return;

      this.passwordSending = true;
      try {
        const { data } = await api.Password.UPDATE(this.session, {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        });

        if (data.error) {
          this.passwordError =
            PASSWORD_ERROR_MESSAGES[data.msg] || "No se pudo actualizar la contraseña";
          return;
        }

        this.passwordSuccess = true;
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
      } catch (e) {
        console.error("Error updating password:", e);
        this.passwordError = "Error de conexión. Intenta nuevamente.";
      } finally {
        this.passwordSending = false;
      }
    },
  },
};
</script>

<style scoped src="../../assets/style/views/app/Profile.css"></style>
