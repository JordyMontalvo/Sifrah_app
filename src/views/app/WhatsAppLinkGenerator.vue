<template>
  <App :session="session" :title="title">
    <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

    <div v-if="!loading" class="whatsapp-generator">
      <div class="generator-card">
        <h2>Generador de Links de WhatsApp</h2>
        
        <!-- Selector de País -->
        <div class="form-group">
          <label for="country">País</label>
          <select id="country" v-model="selectedCountry" @change="updateCountryCode">
            <option v-for="country in countries" :key="country.code" :value="country.code">
              {{ country.flag }} {{ country.name }} (+{{ country.phoneCode }})
            </option>
          </select>
        </div>

        <!-- Campo de Número -->
        <div class="form-group">
          <label for="phone">Número de WhatsApp</label>
          <div class="phone-input">
            <span class="phone-code">+{{ countryCode }}</span>
            <input
              id="phone"
              type="tel"
              v-model="phoneNumber"
              placeholder="Ingresa el número sin código de país"
              @input="formatPhoneNumber"
            />
          </div>
        </div>

        <!-- Campo de Mensaje -->
        <div class="form-group">
          <label for="message">Mensaje</label>
          <textarea
            id="message"
            v-model="message"
            placeholder="Escribe el mensaje que aparecerá en el chat"
            rows="4"
          ></textarea>
        </div>

        <!-- Botón Generar -->
        <button class="generate-btn" @click="generateLink">
          Generar Enlace
        </button>

        <!-- Enlace Generado -->
        <div v-if="generatedLink" class="link-section">
          <label>Enlace Generado (clic para copiar):</label>
          <div class="link-container" @click="copyLink">
            <input
              type="text"
              :value="generatedLink"
              readonly
              class="link-input"
            />
            <button class="copy-btn">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <p v-if="copied" class="copied-message">¡Enlace copiado!</p>
        </div>
      </div>

      <!-- Vista Previa del Chat -->
      <div v-if="generatedLink" class="preview-card">
        <h3>Vista Previa del Chat</h3>
        <div class="chat-preview">
          <div class="chat-header">
            <div class="chat-contact">
              <div class="contact-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="contact-info">
                <span class="contact-name">+{{ countryCode }} {{ formattedPhone }}</span>
                <span class="contact-status">en línea</span>
              </div>
            </div>
          </div>
          <div class="chat-messages">
            <div class="message received">
              <div class="message-bubble received-bubble">
                <span>+{{ countryCode }} {{ formattedPhone }}</span>
              </div>
            </div>
            <div class="message sent">
              <div class="message-bubble sent-bubble">
                {{ message || 'Tu mensaje aparecerá aquí' }}
              </div>
            </div>
          </div>
          <div class="chat-footer">
            <div class="language-selector">
              <span class="flag">🇲🇽</span>
              <span>ES</span>
              <i class="fas fa-chevron-up"></i>
            </div>
            <div class="ai-assistant">
              <i class="fas fa-robot"></i>
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

export default {
  components: {
    App,
    Spinner,
  },
  data() {
    return {
      loading: true,
      title: "GENERADOR DE LINKS DE WHATSAPP",
      selectedCountry: "EC",
      countryCode: "593",
      phoneNumber: "",
      message: "",
      generatedLink: "",
      copied: false,
      countries: [
        { code: "EC", name: "Ecuador", phoneCode: "593", flag: "🇪🇨" },
        { code: "PE", name: "Perú", phoneCode: "51", flag: "🇵🇪" },
        { code: "CO", name: "Colombia", phoneCode: "57", flag: "🇨🇴" },
        { code: "MX", name: "México", phoneCode: "52", flag: "🇲🇽" },
        { code: "AR", name: "Argentina", phoneCode: "54", flag: "🇦🇷" },
        { code: "CL", name: "Chile", phoneCode: "56", flag: "🇨🇱" },
        { code: "VE", name: "Venezuela", phoneCode: "58", flag: "🇻🇪" },
        { code: "BO", name: "Bolivia", phoneCode: "591", flag: "🇧🇴" },
        { code: "PY", name: "Paraguay", phoneCode: "595", flag: "🇵🇾" },
        { code: "UY", name: "Uruguay", phoneCode: "598", flag: "🇺🇾" },
        { code: "CR", name: "Costa Rica", phoneCode: "506", flag: "🇨🇷" },
        { code: "PA", name: "Panamá", phoneCode: "507", flag: "🇵🇦" },
        { code: "GT", name: "Guatemala", phoneCode: "502", flag: "🇬🇹" },
        { code: "HN", name: "Honduras", phoneCode: "504", flag: "🇭🇳" },
        { code: "NI", name: "Nicaragua", phoneCode: "505", flag: "🇳🇮" },
        { code: "SV", name: "El Salvador", phoneCode: "503", flag: "🇸🇻" },
        { code: "DO", name: "República Dominicana", phoneCode: "1", flag: "🇩🇴" },
        { code: "ES", name: "España", phoneCode: "34", flag: "🇪🇸" },
        { code: "US", name: "Estados Unidos", phoneCode: "1", flag: "🇺🇸" },
      ],
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    formattedPhone() {
      return this.phoneNumber.replace(/\D/g, "");
    },
  },
  methods: {
    updateCountryCode() {
      const country = this.countries.find((c) => c.code === this.selectedCountry);
      if (country) {
        this.countryCode = country.phoneCode;
      }
    },
    formatPhoneNumber() {
      // Remover caracteres no numéricos
      this.phoneNumber = this.phoneNumber.replace(/\D/g, "");
    },
    generateLink() {
      if (!this.phoneNumber) {
        alert("Por favor ingresa un número de WhatsApp");
        return;
      }

      const cleanPhone = this.phoneNumber.replace(/\D/g, "");
      const encodedMessage = encodeURIComponent(this.message);
      this.generatedLink = `https://wa.me/${this.countryCode}${cleanPhone}?text=${encodedMessage}`;
      this.copied = false;
    },
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.generatedLink);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        // Fallback para navegadores que no soportan clipboard API
        const input = document.createElement("input");
        input.value = this.generatedLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }
    },
  },
  async created() {
    // GET data
    const { data } = await api.tools(this.session);

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
    this.$store.commit("SET_ACTIVATED", data.activated);
    this.$store.commit("SET__ACTIVATED", data._activated);
    this.$store.commit("SET_PLAN", data.plan);
    this.$store.commit("SET_COUNTRY", data.country);
    this.$store.commit("SET_PHOTO", data.photo);
    this.$store.commit("SET_TREE", data.tree);
  },
};
</script>

<style lang="stylus" scoped>
.whatsapp-generator
  padding: 20px
  max-width: 1200px
  margin: 0 auto

.generator-card, .preview-card
  background: white
  border-radius: 12px
  padding: 30px
  margin-bottom: 20px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

h2, h3
  color: #086eb6
  margin-bottom: 20px

.form-group
  margin-bottom: 20px

  label
    display: block
    margin-bottom: 8px
    color: #333
    font-weight: 500

  select, textarea, input[type="tel"], input[type="text"]
    width: 100%
    padding: 12px
    border: 2px solid #e0e0e0
    border-radius: 8px
    font-size: 16px
    transition: border-color 0.3s

    &:focus
      outline: none
      border-color: #086eb6

.phone-input
  display: flex
  align-items: center
  gap: 10px

  .phone-code
    padding: 12px 15px
    background: #f5f5f5
    border: 2px solid #e0e0e0
    border-radius: 8px
    font-weight: 600
    color: #086eb6

  input
    flex: 1

.generate-btn
  width: 100%
  padding: 15px
  background: #25D366
  color: white
  border: none
  border-radius: 8px
  font-size: 18px
  font-weight: 600
  cursor: pointer
  transition: background 0.3s

  &:hover
    background: #20BA5A

.link-section
  margin-top: 30px
  padding-top: 20px
  border-top: 2px solid #e0e0e0

  label
    display: block
    margin-bottom: 10px
    color: #333
    font-weight: 500

.link-container
  display: flex
  gap: 10px
  align-items: center

  .link-input
    flex: 1
    background: #f5f5f5
    cursor: pointer

  .copy-btn
    padding: 12px 20px
    background: #086eb6
    color: white
    border: none
    border-radius: 8px
    cursor: pointer
    transition: background 0.3s

    &:hover
      background: #065a94

.copied-message
  color: #25D366
  font-weight: 600
  margin-top: 10px
  text-align: center

.chat-preview
  border: 2px solid #e0e0e0
  border-radius: 12px
  overflow: hidden
  background: #f5f5f5

.chat-header
  background: #075E54
  padding: 15px
  color: white

  .chat-contact
    display: flex
    align-items: center
    gap: 12px

  .contact-avatar
    width: 40px
    height: 40px
    border-radius: 50%
    background: rgba(255, 255, 255, 0.2)
    display: flex
    align-items: center
    justify-content: center

  .contact-info
    display: flex
    flex-direction: column

  .contact-name
    font-weight: 600

  .contact-status
    font-size: 12px
    opacity: 0.8

.chat-messages
  padding: 20px
  min-height: 200px
  background: #ECE5DD

  .message
    margin-bottom: 15px
    display: flex

    &.received
      justify-content: flex-start

    &.sent
      justify-content: flex-end

  .message-bubble
    max-width: 70%
    padding: 10px 15px
    border-radius: 8px

    &.received-bubble
      background: white
      border-bottom-left-radius: 4px

    &.sent-bubble
      background: #DCF8C6
      border-bottom-right-radius: 4px

.chat-footer
  background: white
  padding: 15px
  display: flex
  justify-content: space-between
  align-items: center
  border-top: 1px solid #e0e0e0

  .language-selector
    display: flex
    align-items: center
    gap: 8px
    color: #666

  .ai-assistant
    width: 40px
    height: 40px
    border-radius: 50%
    background: #086eb6
    display: flex
    align-items: center
    justify-content: center
    color: white
    cursor: pointer

@media (max-width: 768px)
  .whatsapp-generator
    padding: 10px

  .generator-card, .preview-card
    padding: 20px

  .phone-input
    flex-direction: column

    .phone-code
      width: 100%
</style>

