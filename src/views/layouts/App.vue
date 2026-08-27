<template>
  <div class="app">
    <div id="app">
      <transition name="fade">
        <div v-if="notification" class="notification">
          {{ notification }}
        </div>
      </transition>

      <router-view />
    </div>

    <header>
      <!--<h3 class="slogan">
        <span v-if="country == 'Perú'"       style="font-size: 28px;">🇵🇪</span>
        <span v-if="country == 'Bolivia'"    style="font-size: 28px;">🇧🇴</span>
        <span v-if="country == 'Ecuador'"    style="font-size: 28px;">🇪🇨</span>
        <span v-if="country == 'Colombia'"   style="font-size: 28px;">🇨🇴</span>
        <span v-if="country == 'Argentina'"  style="font-size: 28px;">🇦🇷</span>
        <span v-if="country == 'Chile'"      style="font-size: 28px;">🇨🇱</span>
        <span v-if="country == 'Costa Rica'" style="font-size: 28px;">🇨🇷</span>
          &nbsp;&nbsp;&nbsp;SUEÑA SIN LIMITES
      </h3>-->
      <div class="header-left">
        <!-- Logo para desktop -->
        <img
          src="../../assets/img/logo/logo-sifrah-BLANCO.png"
          alt=""
          class="logo logo-desktop"
        />
        <svg
          class="burger burger-mobile header-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
          @click.stop="toggleMobileTabsMenu"
          aria-label="Menú"
        >
          <path d="M4 7h16"/>
          <path d="M4 12h16"/>
          <path d="M4 17h16"/>
        </svg>
      </div>
      
      <div class="header-center" v-if="office_id == null">
        <div 
          class="header-user-info"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <button
            v-if="token"
            @click.stop="copy_token_code" 
            class="header-code-button header-code-button-mobile"
            style="background: none; border: none; color: white; font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; margin: 0; margin-right: 12px; white-space: nowrap; pointer-events: auto;"
          >
            Cód: {{ token }}
            <span v-if="c_token_code" style="position: absolute; top: 100%; left: -10px; margin-top: 10px; white-space: nowrap; color: #4CAF50; font-size: 12px; font-weight: 600; z-index: 1000; display: flex; align-items: center; gap: 4px;">
              Código copiado <i class="fas fa-check" style="color: #4CAF50;"></i>
            </span>
          </button>
          <div class="header-dni header-dni-mobile" v-if="dni">{{ dni }}</div>
        </div>
      </div>
      
      <div class="header-right">
        <label v-if="office_id == null" class="header-photo-label header-photo-label-desktop">
          <div class="header-photo-container">
            <img
              v-if="photoState == 'default'"
              class="header-photo"
              :src="photo"
            />
            <img
              v-if="photoState == 'changed'"
              class="header-photo"
              :src="newPhoto"
            />
            <div class="header-photo-overlay">
              <i class="fas fa-camera"></i>
            </div>
          </div>
          <input type="file" @change="changePhoto" style="display: none;" />
        </label>
        <router-link
          v-if="office_id == null"
          to="/profile"
          class="header-photo-label header-photo-label-mobile"
          aria-label="Perfil"
        >
          <div class="header-photo-container">
            <img
              v-if="photoState == 'default'"
              class="header-photo"
              :src="photo"
            />
            <img
              v-if="photoState == 'changed'"
              class="header-photo"
              :src="newPhoto"
            />
          </div>
        </router-link>
        <div v-if="photoState == 'changed'" class="header-photo-controls">
          <i v-if="!sending" @click="cancelNewPhoto" class="fas fa-times photo-control-cancel"></i>
          <i v-if="!sending" @click="changeNewPhoto" class="fas fa-check photo-control-confirm"></i>
          <i v-else class="fas fa-spinner fa-spin" style="color: white; opacity: 0.8;"></i>
        </div>
        <!-- Contenedor compartir con mensaje único -->
        <div class="header-share-wrap" style="position: relative; display: inline-block;">
          <!-- Ícono compartir para desktop -->
          <i class="fas fa-share-alt header-icon header-icon-share-desktop" @click="copy_affiliation_link"></i>
          <img
            class="header-icon header-icon-share-mobile"
            src="../../assets/img/compartir.svg"
            alt="Compartir"
            @click="copy_affiliation_link"
          />
          <span v-if="c_affiliation_link" style="position: absolute; top: 100%; right: -40px; margin-top: 5px; white-space: nowrap; color: #4CAF50; font-size: 12px; font-weight: 600; z-index: 1000; display: flex; align-items: center; gap: 4px;">
            Link copiado <i class="fas fa-check" style="color: #4CAF50;"></i>
          </span>
        </div>
        <router-link to="/agenda" v-if="office_id == null" class="header-icon-link header-agenda-link">
          <svg
            class="header-icon header-icon-agenda-mobile"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Agenda Semanal"
          >
            <path d="M7 2V4M17 2V4M4 8H20M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M8 16H8.01M12 16H12.01M16 16H16.01" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </router-link>
        <router-link
          to="/birthdays"
          v-if="office_id == null && tree"
          class="header-icon-link header-notification-btn"
          aria-label="Cumpleaños de mi red"
        >
          <span class="header-notification-icon-wrap">
            <img
              class="header-icon header-icon-birthdays-notify-mobile"
              src="../../assets/img/notificaciones.svg"
              alt=""
              aria-hidden="true"
            />
            <svg
              class="header-icon header-icon-birthdays-notify header-icon-birthdays-notify-desktop"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 21h4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            </svg>
            <span
              v-if="birthdaysBadgeCount > 0"
              class="header-notification-badge"
              :class="{ 'is-urgent': true }"
            >
              {{ birthdaysBadgeCount > 9 ? "9+" : birthdaysBadgeCount }}
            </span>
          </span>
        </router-link>
        <router-link to="/profile" v-if="office_id == null" class="header-icon-link header-cog-link">
          <!-- Ícono configuración para desktop -->
          <i class="fas fa-cog header-icon header-icon-cog-desktop"></i>
          <!-- SVG configuración para móvil -->
          <svg
            class="header-icon header-icon-cog-mobile"
            width="28"
            height="28"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="cursor: pointer;"
          >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.208 2.83C12.6613 2.97 13.0947 3.15 13.508 3.37L15.341 2.27C15.5321 2.15536 15.7561 2.10786 15.9773 2.13504C16.1985 2.16221 16.4043 2.26251 16.562 2.42L17.58 3.438C17.7375 3.5957 17.8378 3.80149 17.865 4.02271C17.8921 4.24392 17.8446 4.46787 17.73 4.659L16.63 6.492C16.85 6.90533 17.03 7.33867 17.17 7.792L19.243 8.311C19.4592 8.36517 19.6512 8.49005 19.7883 8.66579C19.9255 8.84154 20 9.05807 20 9.281V10.719C20 10.9419 19.9255 11.1585 19.7883 11.3342C19.6512 11.51 19.4592 11.6348 19.243 11.689L17.17 12.208C17.03 12.6613 16.85 13.0947 16.63 13.508L17.73 15.341C17.8446 15.5321 17.8921 15.7561 17.865 15.9773C17.8378 16.1985 17.7375 16.4043 17.58 16.562L16.562 17.58C16.4043 17.7375 16.1985 17.8378 15.9773 17.865C15.7561 17.8921 15.5321 17.8446 15.341 17.73L13.508 16.63C13.0947 16.85 12.6613 17.03 12.208 17.17L11.689 19.243C11.6348 19.4592 11.51 19.6512 11.3342 19.7883C11.1585 19.9255 10.9419 20 10.719 20H9.281C9.05807 20 8.84154 19.9255 8.66579 19.7883C8.49005 19.6512 8.36517 19.4592 8.311 19.243L7.792 17.17C7.3427 17.0312 6.90744 16.8504 6.492 16.63L4.659 17.73C4.46787 17.8446 4.24392 17.8921 4.02271 17.865C3.80149 17.8378 3.5957 17.7375 3.438 17.58L2.42 16.562C2.26251 16.4043 2.16221 16.1985 2.13504 15.9773C2.10786 15.7561 2.15536 15.5321 2.27 15.341L3.37 13.508C3.14964 13.0926 2.96885 12.6573 2.83 12.208L0.757 11.689C0.540919 11.6349 0.349098 11.5101 0.211963 11.3346C0.074827 11.1591 0.000228643 10.9428 0 10.72V9.282C5.86043e-06 9.05907 0.0745022 8.84254 0.211655 8.66679C0.348809 8.49105 0.540753 8.36617 0.757 8.312L2.83 7.793C2.97 7.33967 3.15 6.90633 3.37 6.493L2.27 4.66C2.15536 4.46887 2.10786 4.24492 2.13504 4.02371C2.16221 3.80249 2.26251 3.5967 2.42 3.439L3.438 2.42C3.5957 2.26251 3.80149 2.16221 4.02271 2.13504C4.24392 2.10786 4.46787 2.15536 4.659 2.27L6.492 3.37C6.90533 3.15 7.33867 2.97 7.792 2.83L8.311 0.757C8.36513 0.540919 8.48986 0.349098 8.6654 0.211963C8.84094 0.074827 9.05724 0.000228643 9.28 0H10.718C10.9409 5.86043e-06 11.1575 0.0745022 11.3332 0.211655C11.509 0.348809 11.6338 0.540753 11.688 0.757L12.208 2.83ZM10 14C11.0609 14 12.0783 13.5786 12.8284 12.8284C13.5786 12.0783 14 11.0609 14 10C14 8.93913 13.5786 7.92172 12.8284 7.17157C12.0783 6.42143 11.0609 6 10 6C8.93913 6 7.92172 6.42143 7.17157 7.17157C6.42143 7.92172 6 8.93913 6 10C6 11.0609 6.42143 12.0783 7.17157 12.8284C7.92172 13.5786 8.93913 14 10 14Z" fill="white"/>
          </svg>
        </router-link>
        <!-- Ícono hamburguesa para desktop -->
        <i
          class="burger fas fa-bars header-icon burger-desktop"
          @click.stop="toggleMobileTabsMenu"
        ></i>
      </div>

      <!-- <h4>{{ name }} {{ lastName }} <i class=""
                      :class="{'yellow': affiliated, 'blue': _activated, 'green': activated}"></i>
      </h4>-->
    </header>
    <section :class="{ open: open }">
      <div class="menu">
        <div class="menu-scroll-container">
          <div class="text-header">
          <label v-if="office_id == null">
            <img v-if="photoState == 'default'" class="photo" :src="photo" />
            <img v-if="photoState == 'changed'" class="photo" :src="newPhoto" />

            <input type="file" @change="changePhoto" />
          </label>

          <div v-if="photoState == 'changed'" class="controls">
            <i @click="cancelNewPhoto" class="fas fa-times photo-control-cancel"></i>
            <i @click="changeNewPhoto" class="fas fa-check photo-control-confirm"></i>
          </div>
          <div>
            <p style="color: white; font-size: 18px">
              {{ name }} {{ lastName }}
            </p>
            <p style="color: white; font-size: 12px">{{ email }}</p>
          </div>

          <!-- Ícono de tuerca para redirigir a perfil -->
        </div>
        <!-- <div class="social" style="display: flex;" v-if="office_id == null">
          <a class="fab fa-facebook-square" :href="fb" target="_blank" style="font-size: 18px;color: #4267B2;"></a>
          <a class="fab fa-instagram"       :href="is" target="_blank" style="font-size: 18px;color: #e95950;"></a>
          <a class="fab fa-youtube"         :href="yt" target="_blank" style="font-size: 18px;color: #ff0050;"></a>
        </div>-->

        <img
          src="@/assets/img/logo/logo-pink-sidebar.svg"
          class="photo-logo"
        />

        <a @click="handleInicioClick" v-if="office_id == null" :class="{ 'router-link-active': $route.path === '/dashboard' }">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="white"/>
          </svg> INICIO
        </a>


        <a
          @click.stop="actived(0)"
          :class="{ 'active-parent': buys }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span> <i class="fas fa-shopping-cart"></i> PRODUCTOS </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: buys }">
          <router-link to="/activation" @click.native="closeAllMenus" v-if="affiliated">
            <i class="fas fa-shopping-bag"></i> Tienda
          </router-link>
          <router-link to="/savings-bonus" @click.native="closeAllMenus" v-if="affiliated">
            <i class="fas fa-piggy-bank"></i> Bono Ahorro
          </router-link>
          <router-link to="/my-redemptions" @click.native="closeAllMenus" v-if="affiliated">
            <i class="fas fa-box-open"></i> Mis Canjes
          </router-link>
          <router-link to="/affiliation" @click.native="closeAllMenus">
            <i class="fas fa-user-plus"></i> Afiliación
          </router-link>
          <router-link to="/activations" @click.native="closeAllMenus" v-if="affiliated">
            <i class="fas fa-history"></i> Historial
          </router-link>
        </div>

        <a
          @click="actived(1)"
          v-if="tree"
          :class="{ 'active-parent': network }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span> <i class="fas fa-users"></i> ORGANIZACIÓN </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: network }">
          <router-link to="/tree" @click.native="closeAllMenus">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 20V19.425C1 19.025 1.10833 18.6583 1.325 18.325C1.54167 17.9917 1.84167 17.7417 2.225 17.575C2.65833 17.3917 3.10433 17.25 3.563 17.15C4.02167 17.05 4.50067 17 5 17C5.49933 17 5.97867 17.05 6.438 17.15C6.89733 17.25 7.343 17.3917 7.775 17.575C8.15833 17.7417 8.45833 17.9917 8.675 18.325C8.89167 18.6583 9 19.025 9 19.425V20H1ZM11 20V19.425C11 19.025 11.1083 18.6583 11.325 18.325C11.5417 17.9917 11.8417 17.7417 12.225 17.575C12.6583 17.3917 13.1043 17.25 13.563 17.15C14.0217 17.05 14.5007 17 15 17C15.4993 17 15.9787 17.05 16.438 17.15C16.8973 17.25 17.343 17.3917 17.775 17.575C18.1583 17.7417 18.4583 17.9917 18.675 18.325C18.8917 18.6583 19 19.025 19 19.425V20H11ZM5 16C4.45 16 3.97933 15.8043 3.588 15.413C3.19667 15.0217 3.00067 14.5507 3 14C2.99933 13.4493 3.19533 12.9787 3.588 12.588C3.98067 12.1973 4.45133 12.0013 5 12C5.54867 11.9987 6.01967 12.1947 6.413 12.588C6.80633 12.9813 7.002 13.452 7 14C6.998 14.548 6.80233 15.019 6.413 15.413C6.02367 15.807 5.55267 16.0027 5 16ZM15 16C14.45 16 13.9793 15.8043 13.588 15.413C13.1967 15.0217 13.0007 14.5507 13 14C12.9993 13.4493 13.1953 12.9787 13.588 12.588C13.9807 12.1973 14.4513 12.0013 15 12C15.5487 11.9987 16.0197 12.1947 16.413 12.588C16.8063 12.9813 17.002 13.452 17 14C16.998 14.548 16.8023 15.019 16.413 15.413C16.0237 15.807 15.5527 16.0027 15 16ZM10 14L7 11L8.05 9.95001L9.25 11.125V9.00001H10.75V11.125L11.95 9.95001L13 11L10 14ZM0 8.00001V7.42501C0 7.02501 0.108333 6.65834 0.325 6.32501C0.541667 5.99167 0.841667 5.74167 1.225 5.57501C1.65833 5.39167 2.10433 5.25001 2.563 5.15001C3.02167 5.05001 3.50067 5.00001 4 5.00001C4.33333 5.00001 4.66267 5.02501 4.988 5.07501C5.31333 5.12501 5.62567 5.19167 5.925 5.27501C5.64167 5.55834 5.41667 5.88334 5.25 6.25001C5.08333 6.61667 5 7.00834 5 7.42501V8.00001H0ZM6 8.00001V7.42501C6 7.02501 6.10833 6.65834 6.325 6.32501C6.54167 5.99167 6.84167 5.74167 7.225 5.57501C7.65833 5.39167 8.10433 5.25001 8.563 5.15001C9.02167 5.05001 9.50067 5.00001 10 5.00001C10.4993 5.00001 10.9787 5.05001 11.438 5.15001C11.8973 5.25001 12.343 5.39167 12.775 5.57501C13.1583 5.74167 13.4583 5.99167 13.675 6.32501C13.8917 6.65834 14 7.02501 14 7.42501V8.00001H6ZM15 8.00001V7.42501C15 7.00834 14.9167 6.61667 14.75 6.25001C14.5833 5.88334 14.3583 5.55834 14.075 5.27501C14.375 5.19167 14.6877 5.12501 15.013 5.07501C15.3383 5.02501 15.6673 5.00001 16 5.00001C16.5 5.00001 16.9793 5.05001 17.438 5.15001C17.8967 5.25001 18.3423 5.39167 18.775 5.57501C19.1583 5.74167 19.4583 5.99167 19.675 6.32501C19.8917 6.65834 20 7.02501 20 7.42501V8.00001H15ZM4 4.00001C3.45 4.00001 2.97933 3.80434 2.588 3.41301C2.19667 3.02167 2.00067 2.55067 2 2.00001C1.99933 1.44934 2.19533 0.978673 2.588 0.588007C2.98067 0.19734 3.45133 0.00134009 4 6.75675e-06C4.54867 -0.00132658 5.01967 0.194673 5.413 0.588007C5.80633 0.98134 6.002 1.45201 6 2.00001C5.998 2.54801 5.80233 3.01901 5.413 3.41301C5.02367 3.80701 4.55267 4.00267 4 4.00001ZM10 4.00001C9.45 4.00001 8.97933 3.80434 8.588 3.41301C8.19667 3.02167 8.00067 2.55067 8 2.00001C7.99933 1.44934 8.19533 0.978673 8.588 0.588007C8.98067 0.19734 9.45133 0.00134009 10 6.75675e-06C10.5487 -0.00132658 11.0197 0.194673 11.413 0.588007C11.8063 0.98134 12.002 1.45201 12 2.00001C11.998 2.54801 11.8023 3.01901 11.413 3.41301C11.0237 3.80701 10.5527 4.00267 10 4.00001ZM16 4.00001C15.45 4.00001 14.9793 3.80434 14.588 3.41301C14.1967 3.02167 14.0007 2.55067 14 2.00001C13.9993 1.44934 14.1953 0.978673 14.588 0.588007C14.9807 0.19734 15.4513 0.00134009 16 6.75675e-06C16.5487 -0.00132658 17.0197 0.194673 17.413 0.588007C17.8063 0.98134 18.002 1.45201 18 2.00001C17.998 2.54801 17.8023 3.01901 17.413 3.41301C17.0237 3.80701 16.5527 4.00267 16 4.00001Z" fill="currentColor"/>
            </svg> Red
          </router-link>
          <router-link to="/directs" @click.native="closeAllMenus">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.613 8.00191C13.613 7.82514 13.681 7.6556 13.802 7.5306C13.923 7.4056 14.0871 7.33537 14.2582 7.33537H21.3549C21.526 7.33537 21.6901 7.4056 21.811 7.5306C21.932 7.6556 22 7.82514 22 8.00191C22 8.17869 21.932 8.34823 21.811 8.47323C21.6901 8.59823 21.526 8.66845 21.3549 8.66845H14.2582C14.0871 8.66845 13.923 8.59823 13.802 8.47323C13.681 8.34823 13.613 8.17869 13.613 8.00191ZM21.3549 11.3346H14.2582C14.0871 11.3346 13.923 11.4048 13.802 11.5298C13.681 11.6548 13.613 11.8244 13.613 12.0011C13.613 12.1779 13.681 12.3475 13.802 12.4725C13.923 12.5975 14.0871 12.6677 14.2582 12.6677H21.3549C21.526 12.6677 21.6901 12.5975 21.811 12.4725C21.932 12.3475 22 12.1779 22 12.0011C22 11.8244 21.932 11.6548 21.811 11.5298C21.6901 11.4048 21.526 11.3346 21.3549 11.3346ZM21.3549 15.3338H16.1936C16.0225 15.3338 15.8584 15.4041 15.7375 15.5291C15.6165 15.6541 15.5485 15.8236 15.5485 16.0004C15.5485 16.1772 15.6165 16.3467 15.7375 16.4717C15.8584 16.5967 16.0225 16.6669 16.1936 16.6669H21.3549C21.526 16.6669 21.6901 16.5967 21.811 16.4717C21.932 16.3467 22 16.1772 22 16.0004C22 15.8236 21.932 15.6541 21.811 15.5291C21.6901 15.4041 21.526 15.3338 21.3549 15.3338ZM10.1687 13.1676C10.809 12.6581 11.2789 11.9543 11.5124 11.1549C11.746 10.3555 11.7315 9.5007 11.471 8.71027C11.2105 7.91983 10.7171 7.23346 10.06 6.74741C9.40281 6.26135 8.61488 6 7.80668 6C6.99849 6 6.21056 6.26135 5.5534 6.74741C4.89625 7.23346 4.40283 7.91983 4.14234 8.71027C3.88186 9.5007 3.86737 10.3555 4.10092 11.1549C4.33447 11.9543 4.80434 12.6581 5.44462 13.1676C3.78175 13.895 2.47129 15.3588 2.02049 17.1668C1.99586 17.2653 1.9934 17.3684 2.01329 17.468C2.03318 17.5677 2.07488 17.6613 2.13521 17.7418C2.19555 17.8222 2.2729 17.8873 2.36135 17.932C2.44979 17.9768 2.54699 18.0001 2.64548 18H12.9679C13.0664 18.0001 13.1636 17.9768 13.252 17.932C13.3405 17.8873 13.4178 17.8222 13.4782 17.7418C13.5385 17.6613 13.5802 17.5677 13.6001 17.468C13.62 17.3684 13.6175 17.2653 13.5929 17.1668C13.1421 15.358 11.8316 13.8941 10.1687 13.1676Z" fill="currentColor"/>
            </svg> Registros
          </router-link>
          <router-link to="/birthdays" @click.native="closeAllMenus">
            <i class="fas fa-birthday-cake"></i> Cumpleaños
          </router-link>
        </div>

        <a
          @click="actived(2)"
          v-if="tree"
          :class="{ 'active-parent': commissions }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12.5C11.0717 12.5 10.1815 12.8687 9.52513 13.5251C8.86875 14.1815 8.5 15.0717 8.5 16C8.5 16.9283 8.86875 17.8185 9.52513 18.4749C10.1815 19.1313 11.0717 19.5 12 19.5C12.9283 19.5 13.8185 19.1313 14.4749 18.4749C15.1313 17.8185 15.5 16.9283 15.5 16C15.5 15.0717 15.1313 14.1815 14.4749 13.5251C13.8185 12.8687 12.9283 12.5 12 12.5ZM10.5 16C10.5 15.6022 10.658 15.2206 10.9393 14.9393C11.2206 14.658 11.6022 14.5 12 14.5C12.3978 14.5 12.7794 14.658 13.0607 14.9393C13.342 15.2206 13.5 15.6022 13.5 16C13.5 16.3978 13.342 16.7794 13.0607 17.0607C12.7794 17.342 12.3978 17.5 12 17.5C11.6022 17.5 11.2206 17.342 10.9393 17.0607C10.658 16.7794 10.5 16.3978 10.5 16Z" fill="white"/>
              <path d="M17.526 5.11618L14.347 0.65918L2.658 9.99718L2.01 9.99018V10.0002H1.5V22.0002H22.5V10.0002H21.538L19.624 4.40118L17.526 5.11618ZM19.425 10.0002H9.397L16.866 7.45418L18.388 6.96718L19.425 10.0002ZM15.55 5.79018L7.84 8.41818L13.946 3.54018L15.55 5.79018ZM3.5 18.1692V13.8292C3.92218 13.6802 4.30565 13.4386 4.62231 13.1221C4.93896 12.8056 5.18077 12.4223 5.33 12.0002H18.67C18.8191 12.4225 19.0609 12.806 19.3775 13.1227C19.6942 13.4393 20.0777 13.6811 20.5 13.8302V18.1702C20.0777 18.3193 19.6942 18.561 19.3775 18.8777C19.0609 19.1944 18.8191 19.5779 18.67 20.0002H5.332C5.18218 19.5779 4.93996 19.1943 4.62302 18.8775C4.30607 18.5608 3.9224 18.3188 3.5 18.1692Z" fill="white"/>
            </svg> COMISIONES
          </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: commissions }">
          <router-link to="/transfer" @click.native="closeAllMenus">
            <i class="fas fa-wallet"></i> Monedero
          </router-link>
          <router-link to="/transactions" @click.native="closeAllMenus">
            <i class="fas fa-exchange-alt"></i> Movimientos
          </router-link>
        </div>

        <router-link to="/rango" @click.native="closeAllMenus" v-if="tree && affiliated">
          <i class="fas fa-trophy"></i> RANGO
        </router-link>

        <router-link to="/collect" @click.native="closeAllMenus" v-if="tree">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <g clip-path="url(#clip0_74_920)">
               <path d="M11 8.5C11 10.71 9.21 12.5 7 12.5C4.79 12.5 3 10.71 3 8.5C3 6.29 4.79 4.5 7 4.5C9.21 4.5 11 6.29 11 8.5ZM11 15.22V20.5H0V18.5C0 16.29 3.13 14.5 7 14.5C8.5 14.5 9.87 14.77 11 15.22ZM24 20.5H13V3.5H24V20.5ZM16 12C16 11.337 16.2634 10.7011 16.7322 10.2322C17.2011 9.76339 17.837 9.5 18.5 9.5C19.163 9.5 19.7989 9.76339 20.2678 10.2322C20.7366 10.7011 21 11.337 21 12C21 12.663 20.7366 13.2989 20.2678 13.7678C19.7989 14.2366 19.163 14.5 18.5 14.5C17.837 14.5 17.2011 14.2366 16.7322 13.7678C16.2634 13.2989 16 12.663 16 12ZM22 7.5C21.4696 7.5 20.9609 7.28929 20.5858 6.91421C20.2107 6.53914 20 6.03043 20 5.5H17C17 6.61 16.11 7.5 15 7.5V16.5C15.5304 16.5 16.0391 16.7107 16.4142 17.0858C16.7893 17.4609 17 17.9696 17 18.5H20C20 17.4 20.9 16.5 22 16.5V7.5Z" fill="currentColor"/>
             </g>
             <defs>
               <clipPath id="clip0_74_920">
                 <rect width="24" height="24" fill="currentColor"/>
               </clipPath>
             </defs>
           </svg> RETIROS
        </router-link>

        <a
          @click="actived(3)"
          v-if="tree && office_id == null"
          :class="{ 'active-parent': resume }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_74_983_desktop)">
<path d="M20 12C20 12.5523 20.4477 13 21 13C21.5523 13 22 12.5523 22 12H20ZM12 22C12.5523 22 13 21.5523 13 21C13 20.4477 12.5523 20 12 20V22ZM19.1247 17.2191C18.6934 16.8741 18.0641 16.944 17.7191 17.3753C17.3741 17.8066 17.444 18.4359 17.8753 18.7809L19.1247 17.2191ZM20.3753 20.7809C20.8066 21.1259 21.4359 21.056 21.7809 20.6247C22.1259 20.1934 22.056 19.5641 21.6247 19.2191L20.3753 20.7809ZM7 7C6.44772 7 6 7.44772 6 8C6 8.55228 6.44772 9 7 9V7ZM17 9C17.5523 9 18 8.55228 18 8C18 7.44772 17.5523 7 17 7V9ZM7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13V11ZM11 13C11.5523 13 12 12.5523 12 12C12 11.4477 11.5523 11 11 11V13ZM22 12V4.5H20V12H22ZM22 4.5C22 3.83696 21.7366 3.20107 21.2678 2.73223L19.8536 4.14645C19.9473 4.24022 20 4.36739 20 4.5H22ZM21.2678 2.73223C20.7989 2.26339 20.163 2 19.5 2V4C19.6326 4 19.7598 4.05268 19.8536 4.14645L21.2678 2.73223ZM19.5 2H4.5V4H19.5V2ZM4.5 2C3.83696 2 3.20107 2.26339 2.73223 2.73223L4.14645 4.14645C4.24021 4.05268 4.36739 4 4.5 4V2ZM2.73223 2.73223C2.26339 3.20107 2 3.83696 2 4.5H4C4 4.36739 4.05268 4.24021 4.14645 4.14645L2.73223 2.73223ZM2 4.5V19.5H4V4.5H2ZM2 19.5C2 20.163 2.26339 20.7989 2.73223 21.2678L4.14645 19.8536C4.05268 19.7598 4 19.6326 4 19.5H2ZM2.73223 21.2678C3.20107 21.7366 3.83696 22 4.5 22V20C4.36739 20 4.24022 19.9473 4.14645 19.8536L2.73223 21.2678ZM4.5 22H12V20H4.5V22ZM18 16C18 17.1046 17.1046 18 16 18V20C18.2091 20 20 18.2091 20 16H18ZM16 18C14.8954 18 14 17.1046 14 16H12C12 18.2091 13.7909 20 16 20V18ZM14 16C14 14.8954 14.8954 14 16 14V12C13.7909 12 12 13.7909 12 16H14ZM16 14C17.1046 14 18 14.8954 18 16H20C20 13.7909 18.2091 12 16 12V14ZM17.8753 18.7809L20.3753 20.7809L21.6247 19.2191L19.1247 17.2191L17.8753 18.7809ZM7 9H17V7H7V9ZM7 13H11V11H7V13Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_74_983_desktop">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg> RESUMEN </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: resume }">
          <router-link to="/bonuses" @click.native="closeAllMenus" v-if="affiliated">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_74_1017)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.0795 16.6151C23.0795 21.7099 18.4629 24.0002 12.0001 24.0002C5.53723 24.0002 0.920654 21.7099 0.920654 16.6511C0.920654 11.1122 3.69094 8.30593 9.2298 5.49964L7.26865 1.8465C7.15164 1.66353 7.08648 1.45222 7.08013 1.23513C7.07377 1.01803 7.12645 0.803274 7.23255 0.613765C7.33866 0.424255 7.49421 0.267095 7.68261 0.159043C7.87102 0.0509906 8.08522 -0.00390289 8.30237 0.000215849H16.1315C16.3351 0.00542383 16.5339 0.062336 16.7094 0.165596C16.8849 0.268856 17.0312 0.415068 17.1346 0.590472C17.238 0.765875 17.295 0.964702 17.3004 1.16824C17.3058 1.37178 17.2592 1.57333 17.1652 1.75393L14.7704 5.49964C20.3075 8.26822 23.0795 11.0745 23.0795 16.6151ZM13.0715 8.37793C13.0715 8.09377 12.9586 7.82125 12.7577 7.62032C12.5568 7.41938 12.2842 7.3065 12.0001 7.3065C11.7159 7.3065 11.4434 7.41938 11.2425 7.62032C11.0415 7.82125 10.9287 8.09377 10.9287 8.37793V9.45279C10.2025 9.48076 9.51145 9.7729 8.98541 10.2743C8.45936 10.7757 8.13448 11.452 8.07176 12.176C8.00903 12.9 8.2128 13.622 8.64477 14.2065C9.07675 14.7909 9.70723 15.1975 10.4178 15.3499L12.9429 15.9019C13.2018 15.9576 13.4308 16.1072 13.5858 16.3218C13.7409 16.5364 13.8111 16.8008 13.7827 17.064C13.7544 17.3272 13.6296 17.5706 13.4325 17.7473C13.2353 17.924 12.9797 18.0214 12.7149 18.0208H11.2852C11.0636 18.0211 10.8473 17.9527 10.6661 17.825C10.485 17.6973 10.3479 17.5165 10.2738 17.3076C10.2305 17.1706 10.1601 17.0436 10.0667 16.9344C9.97338 16.8251 9.85898 16.7357 9.73037 16.6715C9.60175 16.6074 9.46154 16.5698 9.31809 16.5609C9.17463 16.5521 9.03086 16.5722 8.89534 16.62C8.75981 16.6679 8.6353 16.7425 8.52921 16.8395C8.42313 16.9365 8.33764 17.0538 8.27783 17.1845C8.21803 17.3152 8.18513 17.4566 8.1811 17.6003C8.17707 17.7439 8.20199 17.8869 8.25437 18.0208C8.4564 18.5898 8.81422 19.0906 9.28705 19.4661C9.75987 19.8417 10.3287 20.0768 10.9287 20.1448V21.2351C10.9287 21.5192 11.0415 21.7918 11.2425 21.9927C11.4434 22.1936 11.7159 22.3065 12.0001 22.3065C12.2842 22.3065 12.5568 22.1936 12.7577 21.9927C12.9586 21.7918 13.0715 21.5192 13.0715 21.2351V20.1448C13.8279 20.0588 14.5293 19.7072 15.0509 19.1527C15.5725 18.5981 15.8804 17.8765 15.9199 17.1162C15.9594 16.3559 15.7279 15.6063 15.2666 15.0007C14.8053 14.395 14.1441 13.9727 13.4007 13.8088L10.8755 13.2568C10.6706 13.2149 10.4888 13.098 10.3655 12.9291C10.2422 12.7602 10.1863 12.5514 10.2088 12.3435C10.2313 12.1355 10.3306 11.9435 10.4872 11.8049C10.6438 11.6663 10.8464 11.5911 11.0555 11.5939H12.7149C12.9369 11.5923 13.1538 11.6602 13.3352 11.7881C13.5165 11.916 13.6533 12.0975 13.7264 12.3071C13.8261 12.5683 14.024 12.7803 14.2778 12.8976C14.5316 13.0149 14.8213 13.0284 15.0849 12.9351C15.3485 12.8417 15.5652 12.6491 15.6887 12.3982C15.8122 12.1473 15.8327 11.858 15.7458 11.5922C15.5453 11.0224 15.1878 10.5209 14.7147 10.1454C14.2415 9.76997 13.6719 9.5358 13.0715 9.46993V8.37793Z" fill="currentColor"/>
              </g>
              <defs>
                <clipPath id="clip0_74_1017">
                  <rect width="24" height="24" fill="currentColor"/>
                </clipPath>
              </defs>
            </svg> Bonificaciones
          </router-link>
          <router-link to="/resume" @click.native="closeAllMenus">
            <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.05126 9C9.27144 9 10.4417 8.52589 11.3045 7.68198C12.1673 6.83807 12.652 5.69347 12.652 4.5C12.652 3.30653 12.1673 2.16193 11.3045 1.31802C10.4417 0.474106 9.27144 0 8.05126 0C6.83107 0 5.66086 0.474106 4.79806 1.31802C3.93526 2.16193 3.45054 3.30653 3.45054 4.5C3.45054 5.69347 3.93526 6.83807 4.79806 7.68198C5.66086 8.52589 6.83107 9 8.05126 9ZM6.40866 10.6875C2.86826 10.6875 0 13.493 0 16.9559C0 17.5324 0.478043 18 1.06751 18H11.6024C11.491 17.6906 11.4694 17.3531 11.5521 17.0227L12.0913 14.9098C12.1919 14.5125 12.4004 14.1539 12.6951 13.8656L14.1436 12.4488C12.9898 11.359 11.4227 10.6875 9.69026 10.6875H6.40506H6.40866ZM22.0619 8.28633C21.5012 7.73789 20.5918 7.73789 20.0275 8.28633L18.9708 9.31992L21.5227 11.816L22.5795 10.7824C23.1402 10.234 23.1402 9.34453 22.5795 8.79258L22.0619 8.28633ZM13.511 14.6602C13.3636 14.8043 13.2594 14.9836 13.2091 15.184L12.6699 17.2969C12.6196 17.4902 12.6771 17.6906 12.8209 17.8313C12.9647 17.9719 13.1696 18.0281 13.3672 17.9789L15.5274 17.4516C15.7287 17.4023 15.9156 17.3004 16.063 17.1562L20.7068 12.6105L18.1549 10.1145L13.511 14.6602Z" fill="currentColor"/>
            </svg> Personal
          </router-link>
          <router-link to="/closeds" @click.native="closeAllMenus">
            <svg width="26" height="19" viewBox="0 0 26 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.1 9.5C10.1285 9.5 11.1338 9.22142 11.989 8.69948C12.8441 8.17755 13.5106 7.4357 13.9042 6.56775C14.2977 5.6998 14.4007 4.74473 14.2001 3.82332C13.9994 2.90191 13.5042 2.05554 12.777 1.39124C12.0497 0.726945 11.1232 0.274552 10.1145 0.091272C9.10577 -0.0920077 8.06022 0.00205808 7.11005 0.361574C6.15987 0.72109 5.34774 1.32991 4.77636 2.11104C4.20497 2.89218 3.9 3.81054 3.9 4.75C3.9 6.00978 4.44785 7.21796 5.42304 8.10876C6.39823 8.99956 7.72087 9.5 9.1 9.5ZM13 11.875C13.003 11.4784 13.1162 11.0889 13.3291 10.7432C13.1341 10.7246 12.9431 10.6875 12.74 10.6875H12.0616C11.133 11.0787 10.1226 11.2812 9.1 11.2812C8.07743 11.2812 7.06702 11.0787 6.13844 10.6875H5.46C4.01202 10.6878 2.62343 11.2134 1.59955 12.1486C0.575675 13.0839 0.000323102 14.3523 0 15.675L0 17.2188C0 17.6912 0.205446 18.1442 0.571142 18.4783C0.936838 18.8123 1.43283 19 1.95 19H13.3616C13.1279 18.6405 13.0031 18.2306 13 17.8125V11.875ZM24.7 10.6875H23.4V7.71875C23.4 6.93139 23.0576 6.17628 22.4481 5.61953C21.8386 5.06278 21.012 4.75 20.15 4.75C19.288 4.75 18.4614 5.06278 17.8519 5.61953C17.2424 6.17628 16.9 6.93139 16.9 7.71875V10.6875H15.6C15.2552 10.6875 14.9246 10.8126 14.6808 11.0353C14.437 11.258 14.3 11.5601 14.3 11.875V17.8125C14.3 18.1274 14.437 18.4295 14.6808 18.6522C14.9246 18.8749 15.2552 19 15.6 19H24.7C25.0448 19 25.3754 18.8749 25.6192 18.6522C25.863 18.4295 26 18.1274 26 17.8125V11.875C26 11.5601 25.863 11.258 25.6192 11.0353C25.3754 10.8126 25.0448 10.6875 24.7 10.6875ZM20.15 16.0312C19.8929 16.0312 19.6415 15.9616 19.4278 15.8311C19.214 15.7006 19.0473 15.5152 18.949 15.2982C18.8506 15.0812 18.8248 14.8424 18.875 14.6121C18.9251 14.3817 19.049 14.1701 19.2308 14.0041C19.4126 13.838 19.6442 13.7249 19.8964 13.6791C20.1486 13.6332 20.4099 13.6568 20.6475 13.7466C20.885 13.8365 21.0881 13.9887 21.2309 14.184C21.3738 14.3793 21.45 14.6089 21.45 14.8438C21.45 15.1587 21.313 15.4607 21.0692 15.6834C20.8254 15.9061 20.4948 16.0312 20.15 16.0312ZM21.45 10.6875H18.85V7.71875C18.85 7.40381 18.987 7.10176 19.2308 6.87906C19.4746 6.65636 19.8052 6.53125 20.15 6.53125C20.4948 6.53125 20.8254 6.65636 21.0692 6.87906C21.313 7.10176 21.45 7.40381 21.45 7.71875V10.6875Z" fill="currentColor"/>
            </svg> Cierre de Mes
          </router-link>
        </div>

        <a
          @click="actived(4)"
          v-if="office_id == null && affiliated"
          :class="{ 'active-parent': herramientasActive }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span> <i class="fas fa-tools"></i> HERRAMIENTAS </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: herramientasActive }">
          <router-link to="/materials" @click.native="closeAllMenus">
            <i class="fas fa-folder"></i> Materiales
          </router-link>
          <router-link to="/flyer-editor" @click.native="closeAllMenus">
            <i class="fas fa-image"></i> Editor de flyer
          </router-link>
          <router-link to="/whatsapp-link-generator" @click.native="closeAllMenus">
            <i class="fab fa-whatsapp"></i> Generador de links
          </router-link>
          <router-link to="/share-store" @click.native="closeAllMenus">
            <i class="fas fa-share-alt"></i> Compartir tienda
          </router-link>
        </div>

        <a
          @click="actived(5)"
          v-if="office_id == null && affiliated"
          :class="{ 'active-parent': universidadActive }"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }"
        >
          <span style="display: flex; align-items: center;">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style="width: 22px; margin-right: 10px; flex: 0 0 auto;"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 3L1.5 8.5L12 14L22.5 8.5L12 3Z" />
              <path d="M4 10V15.2C4 15.7 4.28 16.16 4.72 16.38L12 20L19.28 16.38C19.72 16.16 20 15.7 20 15.2V10L12 14L4 10Z" />
              <path d="M22.5 8.5V14.2C22.5 14.64 22.14 15 21.7 15H21.3C20.86 15 20.5 14.64 20.5 14.2V9.55L22.5 8.5Z" />
              <path d="M6.2 18.1C5.76 18.1 5.4 18.46 5.4 18.9V20.2C5.4 20.64 5.76 21 6.2 21H13.4C13.84 21 14.2 20.64 14.2 20.2V18.9C14.2 18.46 13.84 18.1 13.4 18.1H6.2Z" />
              <path d="M15.6 18.35C15.6 17.6 16.2 17 16.95 17C17.7 17 18.3 17.6 18.3 18.35C18.3 19.1 17.7 19.7 16.95 19.7C16.2 19.7 15.6 19.1 15.6 18.35Z" />
            </svg>
            UNIVERSIDAD SIFRAH
          </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: universidadActive }" v-if="office_id == null && affiliated">
          <router-link to="/agenda" @click.native="closeAllMenus">
            <i class="fas fa-calendar-alt"></i> Agenda
          </router-link>
          <router-link to="/tools" @click.native="closeAllMenus">
            <i class="fas fa-graduation-cap"></i> Educación
          </router-link>
          <router-link to="/libros" @click.native="closeAllMenus">
            <i class="fas fa-book"></i> Libros
          </router-link>
          <router-link to="/audios" @click.native="closeAllMenus">
            <i class="fas fa-headphones"></i> Audios
          </router-link>
        </div>

        <router-link
          to="/profile"
          @click.native="closeAllMenus"
          v-if="office_id == null"
        >
          <i class="fas fa-user"></i> PERFIL
        </router-link>

        </div>
  
        <a @click="logout" class="logout-button">
          <i class="fas fa-power-off"></i> CERRAR SESIÓN
        </a>
      </div>

      <div class="content">
        <header v-if="($route.path !== '/audios' && $route.path !== '/libros') || !isMobile">
          <p
            class="content-header-title"
            :class="{ 'content-header-title--hidden': $route.path === '/security' && !isMobile }"
            style="font-weight: bold; font-size: 20px"
          >{{ $route.path === '/audios' ? 'Audio' : title }}</p>
          <div
          style="
              display: flex;
              align-items: center;
              gap: 20px;
              margin-top: 25px;
              "
          >
          <img class="logo" style="height: 50px" />
          <button class="share-button" @click="copy_affiliation_link">
            <i class="fas fa-share-alt" style="margin-right: 8px"></i
              >Compartir Afiliación
              <input
              readonly
              id="link-global"
              @click="copy_affiliation_link"
              v-model="affiliationLink"
              style="opacity: 0; position: absolute"
              />
            </button>
            <i class="copy" v-if="c_affiliation_link"
            >link copiado <i class="fas fa-check"></i
              ></i>

            <!-- <img class="logo-text" src="@/assets/img/logo/text.svg" style="margin-left: 12px;"> -->
            
            <label v-if="office_id == null">
              <img
              v-if="photoState == 'default'"
              class="photo-header"
              :src="photo"
              />
              <img
              v-if="photoState == 'changed'"
              class="photo-header"
              :src="newPhoto"
              />
              
              <input type="file" @change="changePhoto" />
            </label>
            
            <div v-if="photoState == 'changed'" class="controls">
              <i @click="cancelNewPhoto" class="fas fa-times"></i>
              <i @click="changeNewPhoto" class="fas fa-check"></i>
            </div>
            <div>
              <p style="color: rgba(8, 56, 92, 1); font-size: 18px">
                {{ name }} {{ lastName }}
              </p>
              <p style="color: rgba(8, 56, 92, 1); font-size: 12px">
                {{ email }}
              </p>
            </div>
            <router-link to="/profile" style="color: black; margin-left: 10px">
              <i class="fas fa-cog" style="font-size: 20px"></i>
            </router-link>
          </div>

          <!-- <div class="social">
            <a class="fab fa-facebook-square" :href="fb" target="_blank" style="color: #4267B2;"></a>
            <a class="fab fa-instagram"       :href="is" target="_blank" style="color: #e95950;"></a>
            <a class="fab fa-tiktok"          :href="tk" target="_blank" style="color: #ff0050;"></a>
            <a class="fab fa-youtube"         :href="yt" target="_blank" style="color: #ff0050;"></a>
            
          </div> -->
        </header>
        <section
          :style="getSectionStyle()"
          :class="{ slide: open }"
          @touchstart="startTouch"
          @touchmove="moveTouch"
          @touchend="endTouch"
        >
          <slot />
        </section>
      </div>
    </section>

    <!-- Overlay para menú de tabs en móvil (se mantiene montado para evitar lag al abrir) -->
    <div 
      v-if="isMobile"
      class="mobile-tabs-overlay"
      :class="{ 'is-open': showMobileTabsMenu }"
      :aria-hidden="showMobileTabsMenu ? 'false' : 'true'"
      @click="closeMobileTabsMenu"
    >
      <div class="mobile-tabs-menu" @click.stop>
        <div class="mobile-tabs-header">
          <router-link
            v-if="office_id == null"
            to="/profile"
            class="mobile-menu-user-info"
            @click.native="handleNavigationClickAndClose"
          >
            <div class="mobile-photo-container">
              <img v-if="photoState == 'default'" class="mobile-menu-photo" :src="photo" />
              <img v-if="photoState == 'changed'" class="mobile-menu-photo" :src="newPhoto" />
            </div>
            <div class="mobile-menu-user-text">
              <p class="mobile-menu-name">{{ displayName }}</p>
              <p class="mobile-menu-rank">
                <i class="fas fa-certificate"></i>
                <span class="mobile-menu-rank-label">Rango:</span>
                <em>{{ rankLabel }}</em>
              </p>
            </div>
          </router-link>
          <button type="button" class="mobile-tabs-close" @click="closeMobileTabsMenu" aria-label="Cerrar menú">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mobile-tabs-content">

          <a @click="handleInicioClickAndClose" v-if="office_id == null" class="mobile-menu-item" :class="{ 'active': $route.path === '/dashboard' || $route.path === '/' }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon icon-home icon-home-outline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 11.2 12 4l9 7.2"/>
                  <path d="M5.5 10.2V20h13v-9.8"/>
                  <path d="M9.5 20v-5.8h5V20"/>
              </svg>
              <svg class="mobile-menu-icon icon-home icon-home-solid" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3.15 2.55 10.85v1.15h2.15V21h6.15v-6.15h2.3V21h6.15v-9h2.15v-1.15L12 3.15z"/>
              </svg>
              <span>Inicio</span>
            </span>
          </a>

          <a @click.stop="toggleMobileSubmenu(0)" class="mobile-menu-item mobile-menu-item-with-submenu" :class="{ 'is-open': mobileSubmenus[0] }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6.2 8h11.6l1.15 12.5H5.05L6.2 8Z"/>
                <path d="M9 8V6.35a3 3 0 0 1 6 0V8"/>
              </svg>
              <span>Productos</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[0] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[0] }">
            <div class="mobile-submenu-inner">
            <router-link to="/activation" v-if="affiliated" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6.2 8h11.6l1.15 12.5H5.05L6.2 8Z"/>
                <path d="M9 8V6.35a3 3 0 0 1 6 0V8"/>
              </svg>
              <span>Tienda</span>
            </router-link>
            <router-link to="/savings-bonus" v-if="affiliated" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 10.8c0-1-.3-1.9-.9-2.6.7-.3 1.2-1 1.2-1.8A2 2 0 0 0 17.3 4.5c-.4 0-.8.1-1.1.3"/>
                <path d="M15.8 6.8C14.8 6 13.5 5.6 12 5.6c-3.8 0-7 2.6-7 6 0 .7.1 1.4.4 2"/>
                <path d="M5 13.8H3.3"/>
                <path d="M19.2 12c.6.5 1 1.3 1 2.2 0 2.4-2.8 4.4-6.5 4.8-3.5.4-6.7-1-7.8-3.2"/>
                <path d="M8 19.2v1.4"/>
                <path d="M14.4 19.2v1.4"/>
                <circle cx="10" cy="12.2" r="0.7" fill="currentColor" stroke="none"/>
                <path d="M12 6.2v2.4"/>
              </svg>
              <span>Bono Ahorro</span>
            </router-link>
            <router-link to="/my-redemptions" v-if="affiliated" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3.5 8.5 12 4.2l8.5 4.3-8.5 4.3L3.5 8.5Z"/>
                <path d="M3.5 8.5v7.2L12 20.2"/>
                <path d="M20.5 8.5v7.2L12 20.2"/>
                <path d="M12 12.8V20"/>
              </svg>
              <span>Mis Canjes</span>
            </router-link>
            <router-link to="/affiliation" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.1"/>
                <path d="M3.2 19.6v-1.2c0-2.5 2.5-4.1 5.8-4.1s5.8 1.6 5.8 4.1v1.2"/>
                <path d="M17.2 10.2v6"/>
                <path d="M14.2 13.2h6"/>
              </svg>
              <span>Afiliación</span>
            </router-link>
            <router-link to="/activations" v-if="affiliated" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3.2 12a8.8 8.8 0 1 0 2.7-6.3"/>
                <path d="M3.2 5.2v4h4"/>
                <path d="M12 8.5v4.2l3 1.7"/>
              </svg>
              <span>Historial</span>
            </router-link>
            </div>
          </div>

          <a @click.stop="toggleMobileSubmenu(1)" v-if="tree" class="mobile-menu-item mobile-menu-item-with-submenu" :class="{ 'is-open': mobileSubmenus[1] }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.1"/>
                <path d="M3.2 19.6v-1.35c0-2.55 2.55-4.15 5.8-4.15s5.8 1.6 5.8 4.15v1.35"/>
                <circle cx="17.15" cy="8.55" r="2.35"/>
                <path d="M20.8 19.6v-1.15c0-1.85-1.35-3.25-3.55-3.7"/>
              </svg>
              <span>Organización</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[1] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[1] }" v-if="tree">
            <div class="mobile-submenu-inner">
            <router-link to="/tree" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="4.4" r="2.35"/>
                <circle cx="4.8" cy="19.4" r="2.35"/>
                <circle cx="12" cy="19.4" r="2.35"/>
                <circle cx="19.2" cy="19.4" r="2.35"/>
                <path d="M12 6.75V11.15"/>
                <path d="M4.8 11.15h14.4"/>
                <path d="M4.8 11.15v5.9"/>
                <path d="M12 11.15v5.9"/>
                <path d="M19.2 11.15v5.9"/>
              </svg>
              <span>Red</span>
            </router-link>
            <router-link to="/directs" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="8" cy="8" r="3"/>
                <path d="M2.6 19.5v-1.2c0-2.3 2.3-3.8 5.4-3.8s5.4 1.5 5.4 3.8v1.2"/>
                <path d="M15.2 8.2h6"/>
                <path d="M15.2 12.2h6"/>
                <path d="M15.2 16.2h4.4"/>
              </svg>
              <span>Registros</span>
            </router-link>
            <router-link to="/birthdays" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4.5 11.2h15v8.8h-15z"/>
                <path d="M4.5 11.2c0-2 1.8-3.4 4-3.4 1.1 0 2.1.5 2.8 1.2.7-.7 1.7-1.2 2.8-1.2 2.2 0 4 1.4 4 3.4"/>
                <path d="M8.2 7.8V5.4"/>
                <path d="M12 7.8V5.4"/>
                <path d="M15.8 7.8V5.4"/>
                <path d="M4.5 15.4h15"/>
              </svg>
              <span>Cumpleaños</span>
            </router-link>
            </div>
          </div>

          <a @click.stop="toggleMobileSubmenu(2)" v-if="tree" class="mobile-menu-item mobile-menu-item-with-submenu" :class="{ 'is-open': mobileSubmenus[2] }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2.5" y="7" width="19" height="12.5" rx="2"/>
                <path d="M2.5 10.4h19"/>
                <path d="M15.4 13.4H21v4h-5.6a2 2 0 0 1 0-4Z"/>
              </svg>
              <span>Comisiones</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[2] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[2] }" v-if="tree">
            <div class="mobile-submenu-inner">
            <router-link to="/transfer" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2.5" y="7" width="19" height="12.5" rx="2"/>
                <path d="M2.5 10.4h19"/>
                <path d="M15.4 13.4H21v4h-5.6a2 2 0 0 1 0-4Z"/>
              </svg>
              <span>Monedero</span>
            </router-link>
            <router-link to="/transactions" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M7 7h11"/>
                <path d="M15 4l3 3-3 3"/>
                <path d="M17 17H6"/>
                <path d="M9 14l-3 3 3 3"/>
              </svg>
              <span>Movimientos</span>
            </router-link>
            </div>
          </div>

          <router-link to="/rango" v-if="tree && affiliated" @click.native="handleNavigationClickAndClose" class="mobile-menu-item">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M8 21h8"/>
                <path d="M12 17v4"/>
                <path d="M7 4h10v4.6a5 5 0 0 1-10 0V4Z"/>
                <path d="M7 6H4.6a2.7 2.7 0 0 0 2.7 3.9"/>
                <path d="M17 6h2.4a2.7 2.7 0 0 1-2.7 3.9"/>
              </svg>
              <span>Rango</span>
            </span>
          </router-link>

          <router-link to="/collect" v-if="tree" @click.native="handleNavigationClickAndClose" class="mobile-menu-item">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2.6" y="6.5" width="18.8" height="11" rx="1.6"/>
                <circle cx="12" cy="12" r="2.35"/>
                <path d="M6.2 9.6v4.8"/>
                <path d="M17.8 9.6v4.8"/>
              </svg>
              <span>Retiros</span>
            </span>
          </router-link>

          <a @click.stop="toggleMobileSubmenu(3)" v-if="tree && office_id == null" class="mobile-menu-item mobile-menu-item-with-submenu" :class="{ 'is-open': mobileSubmenus[3] }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 19V5"/>
                <path d="M4 19h16"/>
                <polyline points="6.5 14.4 10.2 10.4 13.6 13.1 20 7"/>
              </svg>
              <span>Resumen</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[3] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[3] }" v-if="tree && office_id == null">
            <div class="mobile-submenu-inner">
            <router-link to="/bonuses" v-if="affiliated" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5"/>
                <path d="M12 7.2v9.6"/>
                <path d="M9.6 9.4c.6-1 1.6-1.5 2.4-1.5 1.5 0 2.7 1 2.7 2.3 0 3.2-5.4 1.6-5.4 4.3 0 1.3 1.3 2.4 2.9 2.4 1 0 1.9-.5 2.5-1.5"/>
              </svg>
              <span>Bonificaciones</span>
            </router-link>
            <router-link to="/resume" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.1"/>
                <path d="M3.2 19.6v-1.2c0-2.5 2.5-4.1 5.8-4.1 1.2 0 2.3.2 3.2.6"/>
                <path d="M14.2 16.4 20.4 10.2 21.8 11.6 15.6 17.8H14.2v-1.4Z"/>
              </svg>
              <span>Personal</span>
            </router-link>
            <router-link to="/closeds" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4" y="5.5" width="16" height="14.5" rx="2"/>
                <path d="M4 10h16"/>
                <path d="M8 3.5v4"/>
                <path d="M16 3.5v4"/>
                <path d="M9 15.2l2 2 4.2-4.2"/>
              </svg>
              <span>Cierre de Mes</span>
            </router-link>
            </div>
          </div>

          <a @click.stop="toggleMobileSubmenu(4)" v-if="office_id == null && affiliated" class="mobile-menu-item mobile-menu-item-with-submenu" :class="{ 'is-open': mobileSubmenus[4] }">
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"/>
              </svg>
              <span>Herramientas</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[4] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[4] }" v-if="office_id == null && affiliated">
            <div class="mobile-submenu-inner">
            <router-link to="/materials" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3.5 7.5h5.3l1.8 2.1H20.5v9.4H3.5z"/>
              </svg>
              <span>Materiales</span>
            </router-link>
            <router-link to="/flyer-editor" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="14" rx="2"/>
                <circle cx="9" cy="10" r="1.6"/>
                <path d="M3.8 16.5 8.5 12l3 3 3-4 5.5 5.5"/>
              </svg>
              <span>Editor de flyer</span>
            </router-link>
            <router-link to="/whatsapp-link-generator" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 18.6 6.3 15.2A7.6 7.6 0 1 1 12 19.6c-.8 0-1.6-.1-2.4-.4L5 18.6Z"/>
                <path d="M8.6 9.8c.2 2.2 1.8 4.1 4 4.6.4.1.8 0 1-.4l.6-.9.9.4c.3.1.5.5.3.8l-.3 1c-.2.5-.7.8-1.2.7-2.8-.6-5.6-3.3-6.4-6.2-.1-.5.1-1 .6-1.2l1-.4c.3-.1.7 0 .8.3l.5.9c.2.3 0 .6-.3.8l-.5.6Z"/>
              </svg>
              <span>Generador de links</span>
            </router-link>
            <router-link to="/share-store" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="18" cy="6" r="2.4"/>
                <circle cx="6" cy="12" r="2.4"/>
                <circle cx="18" cy="18" r="2.4"/>
                <path d="M8.2 11 15.6 7.8"/>
                <path d="M8.2 13l7.4 4.2"/>
              </svg>
              <span>Compartir tienda</span>
            </router-link>
            </div>
          </div>

          <a
            @click.stop="toggleMobileSubmenu(5)"
            v-if="office_id == null && affiliated"
            class="mobile-menu-item mobile-menu-item-with-submenu"
            :class="{ 'is-open': mobileSubmenus[5] }"
          >
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 4 2 9.5 12 15l10-5.5L12 4Z"/>
                <path d="M6 12.2v4.8L12 20.4 18 17v-4.8"/>
                <path d="M22 10.2v5"/>
              </svg>
              <span>Universidad Sifrah</span>
            </span>
            <svg class="mobile-menu-chevron chevron-down" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ rotated: mobileSubmenus[5] }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </a>
          <div class="mobile-submenu" :class="{ 'active': mobileSubmenus[5] }" v-if="office_id == null && affiliated">
            <div class="mobile-submenu-inner">
            <router-link to="/agenda" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4" y="5.5" width="16" height="14.5" rx="2"/>
                <path d="M4 10h16"/>
                <path d="M8 3.5v4"/>
                <path d="M16 3.5v4"/>
                <path d="M8 14h.01"/>
                <path d="M12 14h.01"/>
                <path d="M16 14h.01"/>
              </svg>
              <span>Agenda</span>
            </router-link>
            <router-link to="/tools" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 4 2 9.5 12 15l10-5.5L12 4Z"/>
                <path d="M6 12.2v4.8L12 20.4 18 17v-4.8"/>
                <path d="M22 10.2v5"/>
              </svg>
              <span>Educación</span>
            </router-link>
            <router-link to="/libros" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 5.6c1.5-.8 3.3-1 5.1-.4 2.3.6 4.4.6 6.4-.1V19c-2 .7-4.1.7-6.5.1-1.8-.5-3.5-.4-5 .4V5.6Z"/>
                <path d="M12 5.4V18.8"/>
              </svg>
              <span>Libros</span>
            </router-link>
            <router-link to="/audios" @click.native="handleNavigationClickAndClose" class="mobile-submenu-item">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4.5 13a7.5 7.5 0 0 1 15 0"/>
                <path d="M4.5 13v4a2 2 0 0 0 2 2H8v-6H6.5A2 2 0 0 0 4.5 13Z"/>
                <path d="M19.5 13v4a2 2 0 0 1-2 2H16v-6h1.5a2 2 0 0 1 2 2Z"/>
              </svg>
              <span>Audios</span>
            </router-link>
            </div>
          </div>

          <router-link
            to="/profile"
            @click.native="handleNavigationClickAndClose"
            v-if="office_id == null"
            class="mobile-menu-item"
            :class="{ 'active': $route.path === '/profile' }"
          >
            <span class="mobile-menu-item-main">
              <svg class="mobile-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.35"/>
                <path d="M5 19.6c0-3.15 3.13-5.2 7-5.2s7 2.05 7 5.2"/>
              </svg>
              <span>Perfil</span>
            </span>
          </router-link>
        </div>
        <div class="mobile-menu-footer">
          <button type="button" class="mobile-logout-btn" @click="handleLogoutAndClose">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>

    <footer class="footer-Dashboard">
      <a @click="handleInicioClick" :class="{ 'active': $route.path === '/dashboard' || $route.path === '/' }">
        <span class="footer-nav-item-inner">
          <svg class="footer-nav-icon icon-inicio" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 11.2 12 4l9 7.2"/>
            <path d="M5.5 10.2V20h13v-9.8"/>
            <path d="M9.5 20v-5.8h5V20"/>
          </svg>
          <span class="footer-nav-label">Inicio</span>
        </span>
      </a>
      <router-link to="/activation" v-if="affiliated" @click.native="handleNavigationClick">
        <span class="footer-nav-item-inner">
          <svg class="footer-nav-icon icon-compras" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6.5 8h11l1 12h-13l1-12Z"/>
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>
          </svg>
          <span class="footer-nav-label">Compras</span>
        </span>
      </router-link>
      <router-link to="/affiliation" v-if="!affiliated" @click.native="handleNavigationClick">
        <span class="footer-nav-item-inner">
          <i class="fas fa-shopping-bag"></i>
          <span class="footer-nav-label">Plan</span>
        </span>
      </router-link>
      <router-link to="/tree/red" v-if="tree" @click.native="handleNavigationClick">
        <span class="footer-nav-item-inner">
          <svg class="footer-nav-icon icon-red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="4.4" r="2.35" fill="none"/>
            <circle cx="4.8" cy="19.4" r="2.35" fill="none"/>
            <circle cx="12" cy="19.4" r="2.35" fill="none"/>
            <circle cx="19.2" cy="19.4" r="2.35" fill="none"/>
            <path d="M12 6.75V11.15"/>
            <path d="M4.8 11.15h14.4"/>
            <path d="M4.8 11.15v5.9"/>
            <path d="M12 11.15v5.9"/>
            <path d="M19.2 11.15v5.9"/>
          </svg>
          <span class="footer-nav-label">Red</span>
        </span>
      </router-link>
      <router-link to="/collect" v-if="tree" @click.native="handleNavigationClick">
        <span class="footer-nav-item-inner">
          <svg class="footer-nav-icon icon-retiros" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path vector-effect="non-scaling-stroke" d="M4 7.5h13.5A2.5 2.5 0 0 1 20 10v8.5H4z"/>
            <path vector-effect="non-scaling-stroke" d="M4 7.5 16 4.5v3"/>
            <path vector-effect="non-scaling-stroke" d="M15.5 12.5H20v4h-4.5a2 2 0 0 1 0-4Z"/>
            <circle cx="16.2" cy="14.5" r=".45" fill="currentColor" stroke="none"/>
          </svg>
          <span class="footer-nav-label">Retiros</span>
        </span>
      </router-link>
    </footer>

    <a v-if="!isMobile" href="https://wa.me/message/JCHJIVLZGG6MK1" target="_blank" class="wsp fab fa-whatsapp"></a>
    
    <!-- Panel de Debug (solo visible en desarrollo o cuando se habilite) -->
    <DebugPanel />
  </div>
</template>

<script>
import api from "@/api";
import lib from "@/lib";
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';


const ROOT = process.env.VUE_APP_ROOT;
console.log({ ROOT });

export default {
  components: { },
  props: {
    session: String,
    office_id: String,
    title: String,
  },
  data() {
    return {
      // photo: 'https://ik.imagekit.io/asu/Lehaim/avatar_bEyc3MFLf.png',
newPhoto: null,
      photoState: "default",
      photoFile: null,
      c_affiliation_link: false,
      c_token_code: false,
      fcmToken: null,
      activeProduct: false,
      startX: 0,
      endX: 0,
      notification: null,
      notificationTimer: null,
      showMobileTabsMenu: false,
      isMobile: false,
      mobileSubmenus: {
        0: false, // Productos
        1: false, // Organización
        2: false, // Comisiones
        3: false, // Resumen
        4: false, // Herramientas
        5: false, // Universidad Sifrah
      },
      textPosition: {
        x: 0,
        y: 0,
      },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      sending: false,
      birthdaysCount: 0,
      birthdaysTodayCount: 0,
      birthdaysSeenToday: false,
      birthdaysRefreshTimer: null,
    };
  },
  watch: {
    // Limpiar estados de menús cuando cambie el estado de afiliación
    affiliated(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$store.commit("CLEAR_MENU_STATES");
        
        // Limpiar mensajes de notificación cuando cambie el estado de afiliación
        const notifications = document.querySelectorAll('.affiliation-required-notification, .affiliation-notification');
        notifications.forEach(notification => {
          if (notification.parentElement) {
            notification.remove();
          }
        });
      }
    },
    tree(val) {
      if (val) this.loadBirthdaysCount();
    },
    "$route.path"(path) {
      if (path === "/birthdays" || path.startsWith("/birthdays/")) {
        this.markBirthdaysNotificationSeen();
        this.loadBirthdaysCount();
      }
    },
    "$store.state.dni"(val) {
      // Cuando el dni cambia (login), registrar el token FCM si ya lo tenemos
      if (val && this.fcmToken) {
        api.registerNotificationToken({
          dni: val,
          fcmToken: this.fcmToken
        }).then(() => console.log('Token FCM guardado tras cambio de dni'))
          .catch(err => console.error('Error guardando token tras login', err));
      }
    },
    showMobileTabsMenu(open) {
      this.lockMobileNavScroll(!!open);
    },
  },
  created() {
    this.initPushNotifications();
    this.startNotificationLoop();
    this.checkMobile();
    this.loadBirthdaysCount();
    this.scheduleBirthdaysRefresh();
    if (
      this.$route.path === "/birthdays" ||
      this.$route.path.startsWith("/birthdays/")
    ) {
      this.markBirthdaysNotificationSeen();
    }
    document.addEventListener("visibilitychange", this.onBirthdaysVisibilityChange);
    window.addEventListener('resize', this.checkMobile);
    this.loadTextPosition();
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('touchmove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('touchend', this.stopDrag);
  },
  beforeDestroy() {
    if (this.notificationTimer) clearInterval(this.notificationTimer);
    if (this.birthdaysRefreshTimer) clearInterval(this.birthdaysRefreshTimer);
    document.removeEventListener("visibilitychange", this.onBirthdaysVisibilityChange);
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('touchmove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('touchend', this.stopDrag);
    this.lockMobileNavScroll(false);
  },
  computed: {
    // user
    name() {
      return this.$store.state.name;
    },
    lastName() {
      return this.$store.state.lastName;
    },
    displayName() {
      return `${this.name || ""} ${this.lastName || ""}`.trim();
    },
    rankLabel() {
      const label = String(this.$store.state.historicalRankLabel || "").trim();
      if (label) return label;
      const val = this.$store.state.rank;
      if (!val) return "Ninguno";
      const v = String(val).toLowerCase();
      let result = "";
      if (v == "none") result = "Ninguno";
      else if (v == "active" || v == "activo") result = "Activo";
      else if (v == "star" || v == "bronce") result = "Bronce";
      else if (v == "master") result = "Master";
      else if (v == "silver" || v == "plata") result = "Plata";
      else if (v == "si") result = "Platino";
      else if (v == "gold" || v == "oro") result = "Oro";
      else if (v == "sapphire") result = "Zafiro";
      else if (v == "rubi" || v == "ruby" || v == "rubí") result = "Ruby";
      else if (v == "emerald" || v == "esmeralda") result = "Esmeralda";
      else if (v == "diamond" || v == "diamante") result = "Diamante";
      else if (v.includes("doble diamante")) result = "Doble diamante";
      else if (v.includes("triple diamante")) result = "Triple diamante";
      else if (v.includes("diamante estrella")) result = "Diamante estrella";
      else result = v;
      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    },
    affiliated() {
      return this.$store.state.affiliated;
    },
    activated() {
      return this.$store.state.activated;
    },
    _activated() {
      return this.$store.state._activated;
    },
    plan() {
      return this.$store.state.plan;
    },
    country() {
      return this.$store.state.country;
    },
    photo() {
      const p = this.$store.state.photo;
      if (!p || p.includes('avatar_cWVgh_GNP.png') || p.includes('avatar_bEyc3MFLf.png')) {
        return '/avatar.png';
      }
      return p;
    },
    tree() {
      return this.$store.state.tree;
    },
    email() {
      return this.$store.state.email;
    },
    address() {
      return this.$store.state.address;
    },
    phone() {
      return this.$store.state.phone;
    },
    birthdate() {
      return this.$store.state.birthdate;
    },
    city() {
      return this.$store.state.city;
    },

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

    // help
    wsp() {
      if (this.country == "Perú") return this.$store.state.wsp_pe;
      if (this.country == "Bolivia") return this.$store.state.wsp_bo;
      if (this.country == "Ecuador") return this.$store.state.wsp_ec;
    },

    // menú
    open() {
      return this.$store.state.open;
    },
    resume() {
      return this.$store.state.resume;
    },
    buys() {
      return this.$store.state.buys;
    },
    network() {
      return this.$store.state.network;
    },
    commissions() {
      return this.$store.state.commissions;
    },
    education() {
      return this.$store.state.education;
    },
    herramientasRouteActive() {
      const p = (this.$route && this.$route.path) ? this.$route.path : "";
      return (
        p === "/materials" ||
        p === "/flyer-editor" ||
        p === "/whatsapp-link-generator" ||
        p === "/share-store"
      );
    },
    herramientasActive() {
      return this.education || this.herramientasRouteActive;
    },
    universidad() {
      return this.$store.state.universidad;
    },
    universidadRouteActive() {
      const p = (this.$route && this.$route.path) ? this.$route.path : "";
      return (
        p === "/universidad-sifrah" ||
        p === "/agenda" ||
        p === "/tools" ||
        p === "/libros" ||
        p === "/audios"
      );
    },
    universidadActive() {
      return this.universidad || this.universidadRouteActive;
    },
    affiliationLink() {
      return `${ROOT}/register/${this.token}`;
    },
    token() {
      return this.$store.state.token;
    },
    dni() {
      return this.$store.state.dni;
    },
    birthdaysBadgeCount() {
      if (this.birthdaysSeenToday) return 0;
      return this.birthdaysTodayCount;
    },
  },
  methods: {
    getSectionStyle() {
      // En desktop y cuando estamos en la vista de activación, quitar overflow para que el sticky funcione
      let styles = {};
      if (window.innerWidth >= 1024 && document.body.classList.contains('activation-view')) {
        styles.overflow = 'visible';
      } else {
        styles.overflow = 'auto';
      }
      
      if (this.$route.path === '/audios') {
        styles.padding = '0';
      }
      
      return styles;
    },
    startNotificationLoop() {
    
      setTimeout(() => {
        this.checkAndShowNotification();

        // Luego lo repite cada 20 segundos
        this.notificationTimer = setInterval(
          this.checkAndShowNotification,
          20000
        );
      }, 5000); // Espera inicial de 5 segundos (5000 ms)
      this.notificationTimer = setInterval(
        this.checkAndShowNotification,
        20000
      );
      // cada 20s
    },
    checkAndShowNotification() {
      const missing = [];
      if (!this.country) {
        this.notification = "Por favor, completa tu perfil.";

        setTimeout(() => {
          this.notification = null;
        }, 10000);
      } else {
        this.notification = null;
      }
    },

    toggleMenu() {
      this.$store.commit("SET_OPEN");
    },
    closeMenu() {
      if (this.open) {
        this.$store.commit("SET_OPEN");
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && this.showMobileTabsMenu) {
        this.showMobileTabsMenu = false;
      }
    },
    lockMobileNavScroll(lock) {
      if (typeof document === "undefined") return;
      document.documentElement.classList.toggle("mobile-nav-open", !!lock);
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
      });
    },
    async initPushNotifications() {
      // Sólo inicializar en dispositivos móviles nativos (Android/iOS)
      if (Capacitor.getPlatform() !== 'android' && Capacitor.getPlatform() !== 'ios') {
        return;
      }

      try {
        // Solicitar permisos al usuario
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.log('Permisos de notificación push denegados por el usuario');
          return;
        }

        // IMPORTANTE: Registrar los listeners ANTES de llamar a register()
        // para no perder el evento 'registration' si llega antes de que se añada el listener

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          this.fcmToken = token.value;
          
          // Enviar el token al backend de Sifrah
          const dni = this.$store.state.dni || localStorage.getItem('dni');
          if (dni) {
            api.registerNotificationToken({
              dni: dni,
              fcmToken: token.value
            }).then(() => {
              console.log('Token FCM guardado exitosamente en BD');
            }).catch(err => {
              console.error('Error guardando token en servidor', err);
            });
          } else {
            console.log('Usuario no logueado aún (sin dni). El token se enviará al hacer login.');
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error en el registro de notificaciones push: ', error);
        });

        // Escuchar notificaciones cuando la app está abierta
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ', notification);
          this.notification = notification.title + (notification.body ? ': ' + notification.body : '');
          setTimeout(() => {
            this.notification = null;
          }, 5000);
        });

        // Acción cuando el usuario toca la notificación
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
          // Podríamos redirigir a alguna vista aquí si se desea
        });

        // Crear canal de notificación de alta prioridad (estilo WhatsApp)
        if (Capacitor.getPlatform() === 'android') {
          await PushNotifications.createChannel({
            id: 'sifrah_alerts',
            name: 'Notificaciones Sifrah',
            description: 'Alertas y mensajes importantes de Sifrah',
            importance: 5, // 5 = HIGH / HEADS-UP POPUP BANNER
            visibility: 1,
            vibration: true,
            sound: 'default',
            lights: true
          });
        }

        // Registrar con FCM / APNs (después de los listeners y del canal)
        await PushNotifications.register();

      } catch (error) {
        console.error('Error inicializando notificaciones push:', error);
      }
    },

    getLimaDateKey() {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());
      const y = parts.find((p) => p.type === "year").value;
      const m = parts.find((p) => p.type === "month").value;
      const d = parts.find((p) => p.type === "day").value;
      return `${y}-${m}-${d}`;
    },
    syncBirthdaysSeenState() {
      const key = `birthdays_seen_${this.getLimaDateKey()}`;
      this.birthdaysSeenToday = localStorage.getItem(key) === "1";
    },
    markBirthdaysNotificationSeen() {
      const key = `birthdays_seen_${this.getLimaDateKey()}`;
      localStorage.setItem(key, "1");
      this.birthdaysSeenToday = true;
    },
    async loadBirthdaysCount() {
      this.syncBirthdaysSeenState();
      const session = this.$store.state.session;
      if (!session || !this.tree || this.office_id != null) {
        this.birthdaysCount = 0;
        this.birthdaysTodayCount = 0;
        return;
      }
      try {
        const { data } = await api.Birthdays.GET(session);
        if (!data.error && Array.isArray(data.birthdays)) {
          this.birthdaysCount = data.birthdays.length;
          this.birthdaysTodayCount = data.birthdays.filter((b) => b.isToday).length;
        }
      } catch (e) {
        console.error("Error loading birthdays count:", e);
      }
    },
    scheduleBirthdaysRefresh() {
      this.birthdaysRefreshTimer = setInterval(() => {
        this.loadBirthdaysCount();
      }, 60 * 60 * 1000);
    },
    onBirthdaysVisibilityChange() {
      if (document.visibilityState === "visible") {
        this.loadBirthdaysCount();
      }
    },
    toggleMobileTabsMenu() {
      if (this.isMobile) {
        this.showMobileTabsMenu = !this.showMobileTabsMenu;
      } else {
        // En desktop, mantener el comportamiento original del sidebar
        this.toggleMenu();
      }
    },
    closeMobileTabsMenu() {
      if (!this.showMobileTabsMenu) return;
      this.showMobileTabsMenu = false;
    },
    handleInicioClickAndClose() {
      this.closeMobileTabsMenu();
      this.handleInicioClick();
    },
    handleNavigationClickAndClose() {
      this.closeMobileTabsMenu();
      this.handleNavigationClick();
    },
    toggleMobileSubmenu(index) {
      const wasOpen = this.mobileSubmenus[index];
      this.mobileSubmenus = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        [index]: !wasOpen,
      };
    },
    handleLogoutAndClose() {
      this.closeMobileTabsMenu();
      this.logout();
    },
    loadTextPosition() {
      const saved = localStorage.getItem('headerTextPosition');
      if (saved) {
        try {
          this.textPosition = JSON.parse(saved);
        } catch (e) {
          this.textPosition = { x: 0, y: 0 };
        }
      }
    },
    saveTextPosition() {
      localStorage.setItem('headerTextPosition', JSON.stringify(this.textPosition));
    },
    startDrag(event) {
      // Si el clic/toque es en el botón de copiar, no iniciar el drag para permitir el evento click
      if (event.target.closest('.header-code-button')) return;
      
      this.isDragging = true;
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      
      const headerCenter = event.currentTarget.parentElement;
      const rect = headerCenter.getBoundingClientRect();
      
      this.dragStart = {
        x: clientX - rect.left - this.textPosition.x,
        y: clientY - rect.top - this.textPosition.y,
      };
      
      event.preventDefault();
    },
    onDrag(event) {
      if (!this.isDragging) return;
      
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      
      const headerCenter = document.querySelector('.header-center');
      if (!headerCenter) return;
      
      const rect = headerCenter.getBoundingClientRect();
      
      this.textPosition = {
        x: clientX - rect.left - this.dragStart.x,
        y: clientY - rect.top - this.dragStart.y,
      };
      
      // Limitar el movimiento dentro del contenedor
      const textBox = document.querySelector('.header-user-info');
      if (textBox) {
        const textRect = textBox.getBoundingClientRect();
        const maxX = rect.width - textRect.width;
        const maxY = rect.height - textRect.height;
        
        this.textPosition.x = Math.max(0, Math.min(this.textPosition.x, maxX));
        this.textPosition.y = Math.max(0, Math.min(this.textPosition.y, maxY));
      }
      
      event.preventDefault();
    },
    stopDrag() {
      if (this.isDragging) {
        this.isDragging = false;
        this.saveTextPosition();
      }
    },
    handleInicioClick() {
      // Verificar afiliación antes de permitir acceso a INICIO
      if (!this.affiliated) {
        // Mostrar mensaje de afiliación requerida
        this.showAffiliationRequiredMessage();
        return;
      }
      
      // Si está afiliado, ir al dashboard
      this.$router.push('/dashboard');
      this.closeAllMenus();
      
      // Scroll hacia arriba después de navegar
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToTop();
        }, 100);
      });
    },
    
    handleNavigationClick() {
      // Scroll hacia arriba cuando se hace clic en cualquier enlace del bottom navigation
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToTop();
        }, 100);
      });
    },
    actived(i) {
      // Verificar afiliación antes de permitir acceso a opciones restringidas
      if (!this.affiliated && (i === 1 || i === 2 || i === 3 || i === 4 || i === 5)) {
        // Mostrar mensaje de afiliación requerida
        this.showAffiliationRequiredMessage();
        // Limpiar estados de menús si no está afiliado
        this.$store.commit("CLEAR_MENU_STATES");
        return;
      }
      
      if (this.activeProduct === i) {
        this.activeProduct = false;
      } else {
        this.activeProduct = i;
      }
      if (i == 0) this.$store.commit("SET_BUYS");
      if (i == 1) this.$store.commit("SET_NETWORK");
      if (i == 2) this.$store.commit("SET_COMMISSIONS");
      if (i == 3) this.$store.commit("SET_RESUME");
      if (i == 4) this.$store.commit("SET_EDUCATION"); // Usa SET_EDUCATION para tools
      if (i == 5) this.$store.commit("SET_UNIVERSIDAD");
    },

    close() {
      // Forzar el cierre definitivo del menú lateral
      this.$store.commit("FORCE_CLOSE_MENU");
    },
    closeAllMenus() {
      // 1. Limpiar estados de sub-menús (comisiones, organización, etc.)
      this.$store.commit("CLEAR_MENU_STATES");
      // 2. Cerrar el menú lateral (especialmente importante en móvil)
      this.close();
    },
    changePhoto(e) {
      this.photoFile = e.target.files[0];

      if (!this.photoFile) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        this.newPhoto = e.target.result;
        this.photoState = "changed";
      };

      reader.readAsDataURL(this.photoFile);
    },
    async changeNewPhoto() {
      if (this.sending) return;
      
      try {
        this.sending = true;
        this.notification = "Subiendo imagen...";
        
        const ret = await lib.upload(
          this.photoFile,
          this.photoFile.name,
          "photos"
        );

        this.$store.commit("SET_PHOTO", ret);

        this.photoState = "default";

        await api.photo(this.session, { photo: ret });
        
        // Mostrar notificación de éxito
        this.notification = "¡Foto de perfil actualizada exitosamente!";
        setTimeout(() => {
          this.notification = null;
        }, 4000);
      } catch (e) {
        console.error("Error uploading photo:", e);
        this.notification = "Error al subir la foto. Por favor intenta de nuevo.";
        setTimeout(() => {
          this.notification = null;
        }, 5000);
      } finally {
        this.sending = false;
      }
    },
    cancelNewPhoto() {
      this.photoState = "default";
    },
    cancelNewPhoto() {
      this.photoState = "default";
    },
    copy_affiliation_link() {
      if (this.affiliationLink) {
        this.copyToClipboard(this.affiliationLink);
        this.c_affiliation_link = true;
        setTimeout(() => (this.c_affiliation_link = false), 4000);
      }
    },
    copy_token_code() {
      if (this.token) {
        this.copyToClipboard(this.token);
        this.c_token_code = true;
        setTimeout(() => (this.c_token_code = false), 4000);
      }
    },
    copyToClipboard(text) {
      // Usar navigator.clipboard si está disponible y en contexto seguro
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(err => {
          this.fallbackCopy(text);
        });
      } else {
        this.fallbackCopy(text);
      }
    },
    fallbackCopy(text) {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      // Asegurarse de que el input esté en el body pero invisible
      tempInput.style.position = 'fixed';
      tempInput.style.left = '-9999px';
      tempInput.style.top = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      tempInput.setSelectionRange(0, 99999); // Para móviles
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    },
    startTouch(event) {
      this.startX = event.touches[0].clientX; // Guardar la posición inicial del toque
    },
    moveTouch(event) {
      this.endX = event.touches[0].clientX; // Actualizar la posición del toque
    },
    endTouch() {
      // Si el deslizamiento es hacia la izquierda y el menú está abierto, cerrarlo
      if (this.startX - this.endX > 100 && this.open) {
        this.closeMenu();
      }
    },
    showAffiliationMessageInAffiliationPage() {
      // Primero, eliminar cualquier mensaje existente
      const existingNotifications = document.querySelectorAll('.affiliation-notification');
      existingNotifications.forEach(notification => {
        if (notification.parentElement) {
          notification.remove();
        }
      });
      
      // Crear y mostrar el mensaje de notificación en la esquina derecha superior
      const notification = document.createElement('div');
      notification.className = 'affiliation-notification';
      notification.innerHTML = `
        <div class="affiliation-notification-content">
          <div class="affiliation-notification-header">
            <i class="fas fa-star" style="color: #ffd700; margin-right: 10px;"></i>
            <span style="font-weight: bold; font-size: 16px;">¡Bienvenido a Sifrah!</span>
          </div>
          <div class="affiliation-notification-body">
            Para comenzar tu experiencia, elige tu plan de afiliación y accede a todas las funcionalidades
          </div>
        </div>
      `;
      
      // Agregar estilos inline para el mensaje en la esquina derecha superior
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        max-width: 350px;
        text-align: left;
        font-family: Arial, sans-serif;
        animation: slideInFromRight 0.5s ease-out;
      `;
      
      // Agregar estilos para el contenido interno
      const content = notification.querySelector('.affiliation-notification-content');
      content.style.cssText = `
        position: relative;
      `;
      
      const header = notification.querySelector('.affiliation-notification-header');
      header.style.cssText = `
        margin-bottom: 10px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      `;
      
      const body = notification.querySelector('.affiliation-notification-body');
      body.style.cssText = `
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 15px;
        opacity: 0.9;
      `;
      
      // Agregar el mensaje al DOM
      document.body.appendChild(notification);
      
             // El mensaje desaparece automáticamente después de 4 segundos
       setTimeout(() => {
         if (notification.parentElement) {
           notification.remove();
         }
       }, 4000);
     },

     showAffiliationRequiredMessage() {
       // Primero, eliminar cualquier mensaje existente
       const existingNotifications = document.querySelectorAll('.affiliation-required-notification');
       existingNotifications.forEach(notification => {
         if (notification.parentElement) {
           notification.remove();
         }
       });
       
       // Crear y mostrar el mensaje de notificación en la esquina derecha superior
       const notification = document.createElement('div');
       notification.className = 'affiliation-required-notification';
       notification.innerHTML = `
         <div class="affiliation-required-notification-content">
           <div class="affiliation-required-notification-header">
             <i class="fas fa-lock" style="color: #ffd700; margin-right: 10px;"></i>
             <span style="font-weight: bold; font-size: 16px;">¡Función Bloqueada!</span>
           </div>
           <div class="affiliation-required-notification-body">
             Para acceder a esta función, necesitas afiliarte primero. ¡Únete a Sifrah y desbloquea todas las funcionalidades!
           </div>
           <div class="affiliation-required-notification-footer">
             <button onclick="window.location.href='/affiliation'" style="
               background: #4CAF50;
               color: white;
               border: none;
               padding: 8px 16px;
               border-radius: 6px;
               cursor: pointer;
               font-size: 14px;
               font-weight: bold;
               margin-top: 10px;
             ">Afiliarme Ahora</button>
           </div>
         </div>
       `;
       
       // Agregar estilos inline para el mensaje en la esquina derecha superior
       notification.style.cssText = `
         position: fixed;
         top: 20px;
         right: 20px;
         background: linear-gradient(135deg, #4CAF50, #45a049);
         color: white;
         padding: 20px;
         border-radius: 12px;
         box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
         z-index: 9999;
         max-width: 350px;
         text-align: left;
         font-family: Arial, sans-serif;
         animation: slideInFromRight 0.5s ease-out;
       `;
       
       // Agregar estilos para el contenido interno
       const content = notification.querySelector('.affiliation-required-notification-content');
       content.style.cssText = `
         position: relative;
       `;
       
       const header = notification.querySelector('.affiliation-required-notification-header');
       header.style.cssText = `
         margin-bottom: 10px;
         font-size: 16px;
         display: flex;
         align-items: center;
         justify-content: flex-start;
       `;
       
       const body = notification.querySelector('.affiliation-required-notification-body');
       body.style.cssText = `
         font-size: 14px;
         line-height: 1.4;
         margin-bottom: 15px;
         opacity: 0.9;
       `;
       
       const footer = notification.querySelector('.affiliation-required-notification-footer');
       footer.style.cssText = `
         text-align: center;
       `;
       
       // Agregar el mensaje al DOM
       document.body.appendChild(notification);
       
       // El mensaje desaparece automáticamente después de 6 segundos
       setTimeout(() => {
         if (notification.parentElement) {
           notification.remove();
         }
       }, 6000);
     },

   },
 };
</script>
<style scoped>
.content-header-title--hidden {
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}

.header-photo-controls, .mobile-photo-controls, .controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.photo-control-cancel {
  color: #ff5252;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.photo-control-confirm, .fa-check {
  color: #4caf50;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.photo-control-cancel:hover, .photo-control-confirm:hover, .controls i:hover {
  transform: scale(1.2);
}

.mobile-photo-label {
  cursor: pointer;
}

.header-photo-label {
  cursor: pointer;
}

.menu {
  transition: transform 0.3s ease;
  transform: translateX(-100%); /* Oculta el menú fuera de la vista */
}

.menu.slide {
  transform: translateX(0); /* Muestra el menú */
}
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f44336; /* rojo para alerta */
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 4.5s forwards;
}

/* Animación de entrada */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animación de salida */
@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Animación para el mensaje de afiliación */
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Overlay para menú de tabs en móvil */
.mobile-tabs-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(-100%, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overscroll-behavior: contain;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear 0.3s;
}

.mobile-tabs-overlay.is-open {
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear 0s;
}

.mobile-tabs-menu {
  width: 100%;
  height: 100%;
  background: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 0;
  -webkit-overflow-scrolling: touch;
}

.mobile-tabs-menu::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.mobile-tabs-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px 16px 26px;
  border-bottom: none;
  background: #000000;
  position: relative;
}

.mobile-menu-user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
  width: 100%;
  padding-right: 44px;
  text-decoration: none;
}

.mobile-photo-container {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e91e63;
  flex-shrink: 0;
}

.mobile-menu-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border: none;
}

.mobile-menu-user-text {
  min-width: 0;
}

.mobile-menu-name {
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.mobile-menu-rank {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.mobile-menu-rank-label {
  color: #ffffff;
  font-weight: 500;
}

.mobile-menu-rank i {
  color: #e91e63;
  font-size: 12px;
  position: static;
  padding: 0;
}

.mobile-menu-rank em {
  font-style: normal;
  color: #e91e63;
  font-weight: 600;
}

.mobile-tabs-close {
  position: absolute;
  top: 18px;
  right: 10px;
  z-index: 10;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-tabs-close i {
  color: #ffffff !important;
  font-size: inherit;
  position: static;
  padding: 0;
}

.mobile-tabs-content {
  flex: 1;
  padding: 10px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  height: 64px;
  padding: 0 18px 0 20px;
  background: transparent;
  border-radius: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.mobile-menu-item-main {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.mobile-menu-item-main span {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-menu-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #ffffff;
  display: block;
  pointer-events: none;
}

.mobile-menu-icon.icon-home-solid {
  display: none;
}

.mobile-menu-chevron {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #ffffff;
  opacity: 0.95;
  pointer-events: none;
  transform: translateZ(0) rotate(0deg);
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.mobile-menu-chevron.rotated {
  transform: translateZ(0) rotate(180deg);
}

.mobile-menu-item.router-link-active,
.mobile-menu-item.active {
  background: linear-gradient(90deg, #7a1e42 0%, #4a1528 42%, #1c0c12 100%);
  border-radius: 0 10px 10px 0;
  border-bottom-color: transparent;
  color: #ffffff;
  margin-right: 10px;
}

.mobile-menu-item.router-link-active::before,
.mobile-menu-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  border-radius: 0;
  background: #e91e63;
}

.mobile-menu-item.active .mobile-menu-icon,
.mobile-menu-item.router-link-active .mobile-menu-icon {
  color: #e91e63;
}

.mobile-menu-item.active .icon-home-outline,
.mobile-menu-item.router-link-active .icon-home-outline {
  display: none;
}

.mobile-menu-item.active .icon-home-solid,
.mobile-menu-item.router-link-active .icon-home-solid {
  display: block;
}

.mobile-menu-item.active .mobile-menu-chevron,
.mobile-menu-item.router-link-active .mobile-menu-chevron {
  color: #ffffff;
}

.mobile-menu-item-with-submenu {
  justify-content: space-between;
}

.mobile-menu-footer {
  flex-shrink: 0;
  padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  background: #000000;
}

.mobile-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  background: #1c1c1c;
  color: #e91e63;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-logout-btn i {
  font-size: 16px;
  color: #e91e63;
}

.mobile-menu-item-logout {
  display: none;
}

.mobile-submenu {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  margin: 0;
  background: #000000;
}

.mobile-submenu.active {
  grid-template-rows: 1fr;
}

.mobile-submenu-inner {
  overflow: hidden;
  min-height: 0;
}

.mobile-submenu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 58px;
  height: 58px;
  padding: 0 18px 0 52px;
  background: transparent;
  border-radius: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  text-decoration: none;
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  box-sizing: border-box;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.mobile-submenu-item span {
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-submenu-item .mobile-menu-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #ffffff;
}

.mobile-submenu-item:hover {
  background: transparent;
}

.mobile-submenu-item.router-link-active {
  background: linear-gradient(90deg, #7a1e42 0%, #4a1528 42%, #1c0c12 100%);
  color: #ffffff;
  border-radius: 0 10px 10px 0;
  border-bottom-color: transparent;
  margin-right: 10px;
  font-weight: 500;
}

.mobile-submenu-item.router-link-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: #e91e63;
}

.mobile-submenu-item.router-link-active span {
  color: #ffffff;
}

.mobile-submenu-item.router-link-active .mobile-menu-icon {
  color: #e91e63;
}

.mobile-menu-logo {
  margin-bottom: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Ocultar el overlay en desktop */
@media (min-width: 768px) {
  .mobile-tabs-overlay {
    display: none !important;
  }
}

/* Logo responsive */
.logo-mobile {
  display: none;
}

.logo-desktop {
  display: block;
}

/* Íconos responsive */
.burger-mobile {
  display: none;
}

.burger-desktop {
  display: block;
}

.header-icon-cog-mobile {
  display: none;
}

.header-icon-cog-desktop {
  display: block;
  font-size: 18px;
}

.header-icon-share-mobile {
  display: none;
}

.header-icon-share-desktop {
  display: block;
}

.header-photo-label-mobile {
  display: none;
}

.header-photo-label-desktop {
  display: flex;
}

.header-icon-agenda-mobile {
  display: none;
}

.header-notification-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
}

.header-notification-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.header-icon-birthdays-notify {
  display: block;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.header-icon-birthdays-notify-mobile {
  display: none;
}

.header-notification-badge {
  position: absolute;
  top: -3px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  border: 1.5px solid #000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
  z-index: 2;
}

.header-notification-badge.is-urgent {
  animation: birthdays-badge-pulse 1.6s ease-in-out infinite;
}

@keyframes birthdays-badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.25);
  }
}

/* Estilos para móvil */
@media (max-width: 767px) {
  .logo-mobile {
    display: none !important;
  }

  .logo-desktop {
    display: none;
  }

  .burger-mobile {
    display: block;
    width: 30px;
    height: 30px;
    color: #111111;
    flex-shrink: 0;
    padding: 0;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .burger-desktop {
    display: none;
  }

  .header-cog-link,
  .header-agenda-link,
  .header-photo-label-desktop,
  .header-photo-controls {
    display: none !important;
  }

  .header-icon-share-mobile {
    display: block;
    width: 30px;
    height: 30px;
    object-fit: contain;
    cursor: pointer;
  }

  .header-icon-share-desktop {
    display: none;
  }

  .header-code-button-mobile {
    display: none !important;
  }

  .header-center {
    display: none !important;
  }

  .header-dni-mobile {
    display: none;
  }

  .app > header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    color: #111111;
    padding: 10px 16px;
    box-shadow: none;
  }

  .header-left {
    margin-right: 0;
    order: 1;
  }

  .header-right {
    order: 2;
    margin-left: auto;
    padding-left: 0;
    gap: 12px;
    flex-shrink: 0;
    align-items: center;
  }

  .header-share-wrap {
    order: 1;
    display: flex;
    align-items: center;
  }

  .header-notification-btn {
    order: 2;
    color: #111111;
  }

  .header-photo-label,
  .header-photo-label-mobile {
    order: 3;
    margin-left: 0;
    padding: 0;
    display: flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
  }

  .header-notification-icon-wrap {
    width: 30px;
    height: 30px;
  }

  .header-icon-birthdays-notify-desktop {
    display: none;
  }

  .header-icon-birthdays-notify-mobile {
    display: block;
    width: 30px;
    height: 30px;
    object-fit: contain;
  }

  .header-notification-badge {
    top: -4px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    background: #e91e63;
    border: 2px solid #ffffff;
    font-size: 9px;
    box-shadow: none;
    animation: none;
  }

  .header-photo-container {
    width: 36px;
    height: 36px;
    border: 2.5px solid #e91e63;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .header-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .header-icon-link {
    color: #111111;
  }

  .header-user-info {
    position: static;
    margin-right: 0;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .header-code-button {
    position: relative;
  }

  .mobile-menu-item:active,
  .mobile-submenu-item:active {
    background: rgba(255, 255, 255, 0.07);
  }

  .mobile-menu-item.active:active,
  .mobile-menu-item.router-link-active:active,
  .mobile-submenu-item.router-link-active:active {
    background: linear-gradient(90deg, #7a1e42 0%, #4a1528 42%, #1c0c12 100%);
  }

  .mobile-logout-btn:active {
    background: #262626;
  }
}

html.mobile-nav-open,
html.mobile-nav-open body {
  overflow: hidden;
  overscroll-behavior: none;
}

@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
  .mobile-tabs-overlay,
  .mobile-tabs-overlay.is-open,
  .mobile-submenu,
  .mobile-menu-chevron {
    transition: none !important;
  }
}

</style>
