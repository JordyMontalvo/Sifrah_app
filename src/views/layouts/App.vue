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
      <img
        src="../../assets/img/logo/logo-sifrah-BLANCO.png"
        alt=""
        class="logo"
      />
      <i
        class="burger fas fa-bars"
        @click.stop="toggleMenu"
      ></i>

      <!-- <h4>{{ name }} {{ lastName }} <i class=""
                      :class="{'yellow': affiliated, 'blue': _activated, 'green': activated}"></i>
      </h4>-->
    </header>
    <section :class="{ open: open }">
      <div class="menu">
        <div class="text-header">
          <label v-if="office_id == null">
            <img v-if="photoState == 'default'" class="photo" :src="photo" />
            <img v-if="photoState == 'changed'" class="photo" :src="newPhoto" />

            <input type="file" @change="changePhoto" />
          </label>

          <div v-if="photoState == 'changed'" class="controls">
            <i @click="cancelNewPhoto" class="fas fa-times"></i>
            <i @click="changeNewPhoto" class="fas fa-check"></i>
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
          src="../../assets/img/logo/logo-sifrah-BLANCO.png"
          style="width: 100px; height: 100px; margin-bottom: 10px"
          class="photo-logo"
        />

        <a @click="handleInicioClick" v-if="office_id == null">
          <img src="@/assets/img/home-desktop-icon.svg" alt="Inicio" style="width: 16px; height: 16px; margin-right: 8px;"> INICIO
        </a>
        <!-- <router-link to="/status" @click.native="close">
          <i class="fas fa-tachometer-alt"></i> ESTADO
        </router-link> -->

        <a
          @click.stop="actived(0)"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: activeProduct === 0 ? '#9f00ad' : '',
          }"
        >
          <span> <img src="@/assets/img/products-desktop-icon.svg" alt="Productos" style="width: 16px; height: 16px; margin-right: 8px;"> PRODUCTOS </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: buys }">
          <router-link to="/activation" @click.stop v-if="affiliated">
            <i class="fas fa-shopping-bag"></i> COMPRAS
          </router-link>
          <router-link to="/affiliation" @click.native="close">
            <img src="@/assets/img/affiliation-desktop-icon.svg" alt="Afiliación" style="width: 16px; height: 16px; margin-right: 8px;"> AFILIACIÓN
          </router-link>
          <router-link to="/activations" @click.native="close" v-if="affiliated">
            <img src="@/assets/img/history-desktop-icon.svg" alt="Historial" style="width: 16px; height: 16px; margin-right: 8px;"> HISTORIAL
          </router-link>
        </div>

        <a
          @click="actived(1)"
          v-if="tree"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: activeProduct === 1 ? '#9f00ad' : '',
          }"
        >
          <span> <i class="fa fa-users"></i> ORGANIZACIÓN </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: network }">
          <router-link to="/tree" @click.native="close">
            <img src="@/assets/img/red-desktop-icon.svg" alt="Red" style="width: 16px; height: 16px; margin-right: 8px;"> RED
          </router-link>
          <router-link to="/directs" @click.native="close">
            <img src="@/assets/img/records-desktop-icon.svg" alt="Registros" style="width: 16px; height: 16px; margin-right: 8px;"> REGISTROS
          </router-link>
          <!-- <router-link to="/closeds" @click.native="close">
            <i class="fas fa-users"></i> CIERRES
          </router-link> -->
        </div>

        <a
          @click="actived(2)"
          v-if="tree"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: activeProduct === 2 ? '#9f00ad' : '',
          }"
        >
          <span> <img src="@/assets/img/commissions-desktop-icon.svg" alt="Comisiones" style="width: 16px; height: 16px; margin-right: 8px;"> COMISIONES </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: commissions }">
          <!-- <router-link to="/bonuses" @click.native="close">
            <i class="fas fa-gem"></i> BONOS
          </router-link> -->
          <router-link to="/transfer" @click.native="close">
            <i class="fas fa-wallet"></i> MONEDERO
          </router-link>
          <router-link to="/transactions" @click.native="close">
            <img src="@/assets/img/movements-desktop-icon.svg" alt="Movimientos" style="width: 16px; height: 16px; margin-right: 8px;"> MOVIMIENTOS
          </router-link>
          <router-link to="/collect" @click.native="close">
            <img src="@/assets/img/withdrawals-desktop-icon.svg" alt="Retiros" style="width: 16px; height: 16px; margin-right: 8px;"> RETIROS
          </router-link>
        </div>

        <a
          @click="actived(3)"
          v-if="tree && office_id == null"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: activeProduct === 3 ? '#9f00ad' : '',
          }"
        >
          <span> <img src="@/assets/img/summary-desktop-icon.svg" alt="Resumen" style="width: 16px; height: 16px; margin-right: 8px;"> RESUMEN </span>
          <i class="fa fa-angle-down" style="margin-left: 16px"></i>
        </a>
        <div class="sub-menu" :class="{ active: resume }">
          <router-link to="/bonuses" @click.native="close" v-if="affiliated">
            <img src="@/assets/img/bonuses-desktop-icon.svg" alt="Bonificaciones" style="width: 16px; height: 16px; margin-right: 8px;"> BONIFICACIONES
          </router-link>
          <router-link to="/resume" @click.native="close">
            <img src="@/assets/img/personal-desktop-icon.svg" alt="Personal" style="width: 16px; height: 16px; margin-right: 8px;"> PERSONAL
          </router-link>
          <router-link to="/closeds" @click.native="close">
            <img src="@/assets/img/closures-desktop-icon.svg" alt="Cierres" style="width: 16px; height: 16px; margin-right: 8px;"> CIERRES
          </router-link>
        </div>

        <!-- <router-link to="/tools" @click.native="close" v-if="office_id == null">
          <i class="fas fa-file-pdf"></i> HERRAMIENTAS
        </router-link> -->

        <router-link
          to="/tools"
          @click.native="close"
          v-if="office_id == null && affiliated"
        >
          <img src="@/assets/img/education-desktop-icon.svg" alt="Educación" style="width: 16px; height: 16px; margin-right: 8px;"> EDUCACIÓN
        </router-link>

        <router-link
          to="/flyer-editor"
          @click.native="close"
          v-if="office_id == null && affiliated"
        >
          <i class="fas fa-image"></i> EDITOR DE FLYER
        </router-link>

        <router-link
          to="/profile"
          @click.native="close"
          v-if="office_id == null"
        >
          <i class="fas fa-user"></i> PERFIL
        </router-link>

        <br />
        <a @click="logout" style="background-color: #9f00ad">
          <i class="fas fa-sign-out-alt"></i> CERRAR SESIÓN
        </a>
      </div>

      <div class="content">
        <header>
          <p style="font-weight: bold; font-size: 20px">{{ title }}</p>
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
          style="overflow: auto"
          :class="{ slide: open }"
          @touchstart="startTouch"
          @touchmove="moveTouch"
          @touchend="endTouch"
        >
          <slot />
        </section>
      </div>
    </section>

    <footer class="footer-Dashboard">
      <a @click="handleInicioClick">
        <img src="@/assets/img/home-icon.svg" alt="Inicio" style="width: 20px; height: 20px;">
        Inicio
      </a>
      <router-link to="/activation" v-if="affiliated" @click.native="handleNavigationClick">
        <i class="fas fa-shopping-bag"></i>
        Compras
      </router-link>
      <router-link to="/affiliation" v-if="!affiliated" @click.native="handleNavigationClick">
        <i class="fas fa-shopping-bag"></i>
        Plan
      </router-link>
      <router-link to="/tree/red" v-if="tree" @click.native="handleNavigationClick">
        <i class="fas fa-project-diagram"></i>
        Red
      </router-link>
      <router-link to="/collect" v-if="tree" @click.native="handleNavigationClick">
        <i class="fas fa-hand-holding-usd"></i>
        Retiros
      </router-link>
    </footer>

    <a :href="wsp" target="_blank" class="wsp fab fa-whatsapp"></a>
    
    <!-- Panel de Debug (solo visible en desarrollo o cuando se habilite) -->
    <DebugPanel />
  </div>
</template>

<script>
import api from "@/api";
import lib from "@/lib";

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
      activeProduct: false,
      startX: 0,
      endX: 0,
      notification: null,
      notificationTimer: null,
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
    }
  },
  created() {
    this.startNotificationLoop();
  },
  computed: {
    // user
    name() {
      return this.$store.state.name;
    },
    lastName() {
      return this.$store.state.lastName;
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
      return this.$store.state.photo;
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
    affiliationLink() {
      return `${ROOT}/register/${this.token}`;
    },
    token() {
      return this.$store.state.token;
    },
  },
  methods: {
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
    beforeDestroy() {
      if (this.notificationTimer) clearInterval(this.notificationTimer);
    },

    toggleMenu() {
      this.$store.commit("SET_OPEN");
    },
    closeMenu() {
      if (this.open) {
        this.$store.commit("SET_OPEN");
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
      if (!this.affiliated && (i === 1 || i === 2 || i === 3 || i === 4)) {
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
      if (i == 4) this.$store.commit("SET_EDUCATION");
    },

    close() {
      this.$store.commit("SET_OPEN");
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
      const ret = await lib.upload(
        this.photoFile,
        this.photoFile.name,
        "photos"
      );

      this.$store.commit("SET_PHOTO", ret);

      this.photoState = "default";

      await api.photo(this.session, { photo: this.photo });
    },
    cancelNewPhoto() {
      this.photoState = "default";
    },
    cancelNewPhoto() {
      this.photoState = "default";
    },
    copy_affiliation_link() {
      console.log("Copying Affiliation Link:", this.affiliationLink);
      lib.copy("link-global");
      this.c_affiliation_link = true;
      setTimeout(() => (this.c_affiliation_link = false), 4000);
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


</style>
