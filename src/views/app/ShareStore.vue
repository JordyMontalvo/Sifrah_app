<template>
  <App :session="session" :title="title">
    <div v-cloak class="share-store-container">
      <Spinner v-if="loading" :size="40" :color="'#086eb6'" />

      <div v-if="!loading" class="share-store-content">
        <!-- Header -->
        <div class="share-store-header">
          <div class="header-icon">
            <i class="fas fa-share-alt"></i>
          </div>
          <h1>Compartir Mi Tienda</h1>
          <p class="subtitle">Comparte tu tienda Sifrah con tus clientes y empieza a vender</p>
        </div>

        <!-- Sección de link para compartir -->
        <div class="share-link-section">
          <div class="share-link-card">
            <div class="card-header">
              <i class="fas fa-link"></i>
              <h3>Tu Link de Tienda</h3>
            </div>
            
            <div class="link-display">
              <input 
                type="text" 
                :value="shareUrl" 
                readonly 
                class="link-input"
                ref="linkInput"
              />
              <button @click="copyLink" class="copy-btn" :class="{ copied: linkCopied }">
                <i :class="linkCopied ? 'fas fa-check' : 'fas fa-copy'"></i>
                {{ linkCopied ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>

            <div class="link-info">
              <i class="fas fa-info-circle"></i>
              <p>Comparte este link con tus clientes para que vean tu tienda y puedan contactarte para realizar compras.</p>
            </div>
          </div>
        </div>

        <!-- Opciones de compartir -->
        <div class="share-options-section">
          <h3>Compartir en:</h3>
          
          <div class="share-buttons-grid">
            <!-- WhatsApp -->
            <button @click="shareOnWhatsApp" class="share-option-btn whatsapp">
              <i class="fab fa-whatsapp"></i>
              <span>WhatsApp</span>
            </button>

            <!-- Facebook -->
            <button @click="shareOnFacebook" class="share-option-btn facebook">
              <i class="fab fa-facebook"></i>
              <span>Facebook</span>
            </button>

            <!-- Twitter -->
            <button @click="shareOnTwitter" class="share-option-btn twitter">
              <i class="fab fa-twitter"></i>
              <span>Twitter</span>
            </button>

            <!-- Telegram -->
            <button @click="shareOnTelegram" class="share-option-btn telegram">
              <i class="fab fa-telegram"></i>
              <span>Telegram</span>
            </button>

            <!-- Email -->
            <button @click="shareViaEmail" class="share-option-btn email">
              <i class="fas fa-envelope"></i>
              <span>Email</span>
            </button>

            <!-- Copiar Link -->
            <button @click="copyLink" class="share-option-btn copy">
              <i class="fas fa-copy"></i>
              <span>Copiar Link</span>
            </button>
          </div>
        </div>

        <!-- Compartir Productos Individuales -->
        <div class="share-products-section">
          <div class="section-header-row">
            <div>
              <div class="section-badge"><i class="fas fa-boxes"></i> Productos Habilitados</div>
              <h3>Compartir Productos Individuales</h3>
              <p class="section-desc">Comparte enlaces directos a productos específicos de tu tienda externa</p>
            </div>
            <div class="product-search-box" v-if="products.length > 2">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="productSearch"
                placeholder="Buscar producto..."
                class="product-search-input"
              />
            </div>
          </div>

          <div v-if="productsLoading" class="products-loading-state">
            <Spinner :size="30" :color="'#086eb6'" />
            <span style="margin-left: 10px;">Cargando productos disponibles...</span>
          </div>

          <div v-else-if="filteredProducts.length === 0" class="no-products-state">
            <i class="fas fa-box-open"></i>
            <p v-if="products.length === 0">No hay productos habilitados para la tienda externa en este momento.</p>
            <p v-else>No se encontraron productos que coincidan con la búsqueda.</p>
          </div>

          <div v-else class="share-products-grid">
            <div
              v-for="prod in filteredProducts"
              :key="prod.id"
              class="share-product-card"
            >
              <div class="prod-card-thumb">
                <img :src="prod.img" :alt="prod.name" />
                <span v-if="prod.type" class="prod-type-tag">{{ prod.type }}</span>
              </div>
              <div class="prod-card-details">
                <h4 class="prod-name" :title="prod.name">{{ prod.name }}</h4>
                <div class="prod-price-row">
                  <span class="prod-price">S/ {{ getProductPrice(prod).toFixed(2) }}</span>
                </div>
                <div class="prod-card-actions">
                  <button
                    type="button"
                    @click="shareProductOnWhatsApp(prod)"
                    class="btn-prod-share whatsapp"
                    title="Compartir por WhatsApp"
                  >
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    @click="copyProductLink(prod)"
                    class="btn-prod-share copy"
                    :class="{ copied: copiedProductId === prod.id }"
                    title="Copiar enlace del producto"
                  >
                    <i :class="copiedProductId === prod.id ? 'fas fa-check' : 'fas fa-copy'"></i>
                    <span>{{ copiedProductId === prod.id ? 'Copiado' : 'Copiar' }}</span>
                  </button>
                  <button
                    type="button"
                    @click="openProductPreview(prod)"
                    class="btn-prod-share preview"
                    title="Ver producto"
                  >
                    <i class="fas fa-external-link-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview de la tienda -->
        <div class="store-preview-section">
          <div class="preview-header">
            <i class="fas fa-eye"></i>
            <h3>Vista Previa de tu Tienda</h3>
          </div>
          
          <div class="preview-actions">
            <button @click="openPreview" class="preview-btn">
              <i class="fas fa-external-link-alt"></i>
              Abrir en nueva pestaña
            </button>
          </div>

          <div class="preview-info-cards">
            <div class="info-card">
              <i class="fas fa-store"></i>
              <h4>Tienda Personalizada</h4>
              <p>Tu tienda muestra todos los productos disponibles de Sifrah</p>
            </div>

            <div class="info-card">
              <i class="fas fa-shopping-cart"></i>
              <h4>Carrito de Compras</h4>
              <p>Los clientes pueden agregar productos y contactarte para comprar</p>
            </div>

            <div class="info-card">
              <i class="fas fa-mobile-alt"></i>
              <h4>100% Responsive</h4>
              <p>Tu tienda se ve perfecta en cualquier dispositivo</p>
            </div>
          </div>
        </div>

        <!-- Consejos para compartir -->
        <div class="tips-section">
          <div class="tips-header">
            <i class="fas fa-lightbulb"></i>
            <h3>Consejos para Compartir</h3>
          </div>
          
          <div class="tips-list">
            <div class="tip-item">
              <i class="fas fa-check-circle"></i>
              <p><strong>Comparte en tus redes sociales:</strong> Publica el link en Facebook, Instagram, Twitter para llegar a más personas.</p>
            </div>
            
            <div class="tip-item">
              <i class="fas fa-check-circle"></i>
              <p><strong>Envía por WhatsApp:</strong> Comparte directamente con tus contactos y grupos de WhatsApp.</p>
            </div>
            
            <div class="tip-item">
              <i class="fas fa-check-circle"></i>
              <p><strong>Agrega a tu biografía:</strong> Coloca el link en la biografía de tus redes sociales.</p>
            </div>
            
            <div class="tip-item">
              <i class="fas fa-check-circle"></i>
              <p><strong>Crea contenido:</strong> Haz videos o publicaciones mostrando los productos y comparte tu link.</p>
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
      linkCopied: false,
      userId: null,
      products: [],
      productsLoading: false,
      productSearch: "",
      copiedProductId: null,
    };
  },
  computed: {
    session() {
      return this.$store.state.session;
    },
    title() {
      return "Compartir Tienda";
    },
    shareUrl() {
      // Construir la URL de la tienda compartida
      const baseUrl = window.location.origin;
      return `${baseUrl}/tienda/${this.userId}`;
    },
    shareMessage() {
      return `¡Visita mi tienda Sifrah! Encuentra productos increíbles: ${this.shareUrl}`;
    },
    filteredProducts() {
      if (!this.products) return [];
      const q = (this.productSearch || "").trim().toLowerCase();
      if (!q) return this.products;
      return this.products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.type && p.type.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q))
      );
    },
  },
  methods: {
    async loadStoreProducts() {
      if (!this.userId) return;
      this.productsLoading = true;
      try {
        const { data } = await api.SharedStore.GET(this.userId);
        if (data && data.products) {
          this.products = data.products.filter(
            (p) =>
              p.is_promotion !== true &&
              p.catalog_type !== "promotion" &&
              p.type !== "Promoción" &&
              p.visible_shared_store !== false
          );
        }
      } catch (err) {
        console.error("Error loading products for share options:", err);
      } finally {
        this.productsLoading = false;
      }
    },

    getProductShareUrl(product) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/tienda/${this.userId}/producto/${product.id}`;
    },

    getProductPrice(prod) {
      return Number(prod.price_socio || prod.price || 0);
    },

    shareProductOnWhatsApp(product) {
      const url = this.getProductShareUrl(product);
      const text = encodeURIComponent(
        `¡Hola! Te recomiendo este producto de mi tienda Sifrah: *${product.name}* (S/ ${this.getProductPrice(product).toFixed(2)}). Míralo aquí: ${url}`
      );
      window.open(`https://wa.me/?text=${text}`, "_blank");
    },

    async copyProductLink(product) {
      const url = this.getProductShareUrl(product);
      try {
        await navigator.clipboard.writeText(url);
        this.copiedProductId = product.id;
        if (this.$toast && typeof this.$toast.success === "function") {
          this.$toast.success("¡Link del producto copiado!");
        }
        setTimeout(() => {
          this.copiedProductId = null;
        }, 3000);
      } catch (err) {
        console.error("Error al copiar enlace del producto:", err);
      }
    },

    openProductPreview(product) {
      window.open(this.getProductShareUrl(product), "_blank");
    },

    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.linkCopied = true;
        
        if (this.$toast && typeof this.$toast.success === "function") {
          this.$toast.success("¡Link copiado al portapapeles!");
        }
        
        setTimeout(() => {
          this.linkCopied = false;
        }, 3000);
      } catch (err) {
        console.error('Error al copiar:', err);
        // Fallback para navegadores que no soportan clipboard API
        this.$refs.linkInput.select();
        document.execCommand('copy');
        this.linkCopied = true;
        
        setTimeout(() => {
          this.linkCopied = false;
        }, 3000);
      }
    },

    shareOnWhatsApp() {
      const message = encodeURIComponent(this.shareMessage);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    },

    shareOnFacebook() {
      const url = encodeURIComponent(this.shareUrl);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    },

    shareOnTwitter() {
      const text = encodeURIComponent(this.shareMessage);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    },

    shareOnTelegram() {
      const text = encodeURIComponent(this.shareMessage);
      window.open(`https://t.me/share/url?url=${this.shareUrl}&text=${text}`, '_blank');
    },

    shareViaEmail() {
      const subject = encodeURIComponent('¡Visita mi tienda Sifrah!');
      const body = encodeURIComponent(this.shareMessage);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },

    openPreview() {
      window.open(this.shareUrl, '_blank');
    }
  },
  async created() {
    try {
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

      // Obtener el ID del usuario (asumiendo que viene en la respuesta)
      // Si no viene, podrías usar el session ID o hacer otra llamada al API
      this.userId = data.userId || this.session;
      await this.loadStoreProducts();
    } catch (error) {
      console.error('Error loading share store data:', error);
      this.loading = false;
    }
  },
};
</script>

<style lang="stylus" scoped>
.share-store-container
  min-height: calc(100vh - 100px)
  padding: 20px
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

.share-store-content
  max-width: 1200px
  margin: 0 auto

.share-store-header
  text-align: center
  color: white
  margin-bottom: 40px
  
  .header-icon
    font-size: 4rem
    margin-bottom: 20px
    animation: pulse 2s infinite
  
  h1
    font-size: 2.5rem
    margin-bottom: 10px
    font-weight: 700
  
  .subtitle
    font-size: 1.2rem
    opacity: 0.9

@keyframes pulse
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(1.1)

.share-link-section
  margin-bottom: 40px

.share-link-card
  background: white
  border-radius: 15px
  padding: 30px
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1)
  
  .card-header
    display: flex
    align-items: center
    gap: 15px
    margin-bottom: 20px
    
    i
      font-size: 1.8rem
      color: #667eea
    
    h3
      font-size: 1.5rem
      margin: 0
      color: #333

.link-display
  display: flex
  gap: 10px
  margin-bottom: 20px
  
  .link-input
    flex: 1
    padding: 15px
    border: 2px solid #e0e0e0
    border-radius: 10px
    font-size: 1rem
    background: #f8f9fa
    color: #333
    
    &:focus
      outline: none
      border-color: #667eea
  
  .copy-btn
    padding: 15px 30px
    background: #667eea
    color: white
    border: none
    border-radius: 10px
    font-size: 1rem
    font-weight: 600
    cursor: pointer
    transition: all 0.3s ease
    display: flex
    align-items: center
    gap: 8px
    
    &:hover
      background: #5568d3
      transform: translateY(-2px)
    
    &.copied
      background: #28a745
      
      &:hover
        background: #218838

.link-info
  display: flex
  align-items: start
  gap: 10px
  padding: 15px
  background: #f0f4ff
  border-radius: 10px
  
  i
    color: #667eea
    margin-top: 3px
  
  p
    margin: 0
    color: #555
    line-height: 1.6

.share-options-section
  background: white
  border-radius: 15px
  padding: 30px
  margin-bottom: 40px
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1)
  
  h3
    font-size: 1.5rem
    margin-bottom: 20px
    color: #333

.share-buttons-grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))
  gap: 15px

.share-option-btn
  padding: 15px 20px
  border: none
  border-radius: 10px
  font-size: 1rem
  font-weight: 600
  cursor: pointer
  transition: all 0.3s ease
  display: flex
  align-items: center
  justify-content: center
  gap: 10px
  color: white
  
  i
    font-size: 1.3rem
  
  &:hover
    transform: translateY(-3px)
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2)
  
  &.whatsapp
    background: #25D366
    
    &:hover
      background: #1da851
  
  &.facebook
    background: #1877F2
    
    &:hover
      background: #0d65d9
  
  &.twitter
    background: #1DA1F2
    
    &:hover
      background: #0c8dd9
  
  &.telegram
    background: #0088cc
    
    &:hover
      background: #006ba3
  
  &.email
    background: #EA4335
    
    &:hover
      background: #d1311c
  
  &.copy
    background: #6c757d
    
    &:hover
      background: #545b62

.store-preview-section
  background: white
  border-radius: 15px
  padding: 30px
  margin-bottom: 40px
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1)

.preview-header
  display: flex
  align-items: center
  gap: 15px
  margin-bottom: 20px
  
  i
    font-size: 1.8rem
    color: #667eea
  
  h3
    font-size: 1.5rem
    margin: 0
    color: #333

.preview-actions
  margin-bottom: 30px
  
  .preview-btn
    padding: 12px 25px
    background: #667eea
    color: white
    border: none
    border-radius: 10px
    font-size: 1rem
    font-weight: 600
    cursor: pointer
    transition: all 0.3s ease
    display: inline-flex
    align-items: center
    gap: 10px
    
    &:hover
      background: #5568d3
      transform: translateY(-2px)

.preview-info-cards
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))
  gap: 20px

.info-card
  padding: 20px
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  border-radius: 10px
  color: white
  text-align: center
  
  i
    font-size: 2.5rem
    margin-bottom: 15px
    display: block
  
  h4
    font-size: 1.2rem
    margin-bottom: 10px
  
  p
    margin: 0
    opacity: 0.9
    line-height: 1.5

.tips-section
  background: white
  border-radius: 15px
  padding: 30px
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1)

.tips-header
  display: flex
  align-items: center
  gap: 15px
  margin-bottom: 25px
  
  i
    font-size: 1.8rem
    color: #ffc107
  
  h3
    font-size: 1.5rem
    margin: 0
    color: #333

.tips-list
  display: flex
  flex-direction: column
  gap: 20px

.tip-item
  display: flex
  align-items: start
  gap: 15px
  padding: 15px
  background: #f8f9fa
  border-radius: 10px
  border-left: 4px solid #667eea
  
  i
    color: #28a745
    font-size: 1.3rem
    margin-top: 3px
  
  p
    margin: 0
    color: #555
    line-height: 1.6
    
    strong
      color: #333

.share-products-section
  background: white
  border-radius: 15px
  padding: 30px
  margin-bottom: 40px
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1)

  .section-header-row
    display: flex
    justify-content: space-between
    align-items: flex-start
    margin-bottom: 25px
    flex-wrap: wrap
    gap: 15px

  .section-badge
    display: inline-flex
    align-items: center
    gap: 6px
    background: #e6fffa
    color: #047481
    font-size: 0.8rem
    font-weight: 700
    padding: 4px 10px
    border-radius: 20px
    margin-bottom: 8px

  h3
    font-size: 1.5rem
    color: #333
    margin: 0 0 6px 0

  .section-desc
    color: #666
    font-size: 0.95rem
    margin: 0

  .product-search-box
    display: flex
    align-items: center
    background: #f7fafc
    border: 1px solid #e2e8f0
    border-radius: 8px
    padding: 8px 14px
    gap: 10px
    min-width: 260px

    i
      color: #a0aec0

    .product-search-input
      border: none
      background: transparent
      outline: none
      font-size: 0.9rem
      width: 100%

  .products-loading-state, .no-products-state
    text-align: center
    padding: 40px 20px
    color: #718096

    i
      font-size: 2.5rem
      margin-bottom: 12px
      opacity: 0.6
      display: block

    p
      margin: 0

  .share-products-grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))
    gap: 20px

  .share-product-card
    border: 1px solid #edf2f7
    border-radius: 12px
    overflow: hidden
    display: flex
    flex-direction: column
    background: #ffffff
    transition: transform 0.2s, box-shadow 0.2s

    &:hover
      transform: translateY(-4px)
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08)

  .prod-card-thumb
    position: relative
    height: 160px
    background: #f8fafc
    display: flex
    align-items: center
    justify-content: center
    padding: 10px

    img
      max-width: 90%
      max-height: 90%
      object-fit: contain

    .prod-type-tag
      position: absolute
      top: 8px
      left: 8px
      background: #00ae62
      color: white
      font-size: 0.7rem
      font-weight: 700
      padding: 2px 8px
      border-radius: 4px
      text-transform: uppercase

  .prod-card-details
    padding: 15px
    display: flex
    flex-direction: column
    flex: 1
    justify-content: space-between

  .prod-name
    font-size: 0.95rem
    font-weight: 600
    color: #2d3748
    margin: 0 0 8px 0
    line-height: 1.3
    display: -webkit-box
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical
    overflow: hidden

  .prod-price-row
    margin-bottom: 12px

  .prod-price
    font-size: 1.15rem
    font-weight: 700
    color: #00ae62

  .prod-card-actions
    display: flex
    gap: 8px

  .btn-prod-share
    border: none
    padding: 8px 10px
    border-radius: 6px
    cursor: pointer
    font-size: 0.8rem
    font-weight: 600
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 5px
    transition: all 0.2s

    &.whatsapp
      background: #25d366
      color: white
      flex: 1

      &:hover
        background: #1ebd5a

    &.copy
      background: #edf2f7
      color: #4a5568
      flex: 1

      &:hover
        background: #e2e8f0

      &.copied
        background: #00ae62
        color: white

    &.preview
      background: #edf2f7
      color: #718096
      width: 36px

      &:hover
        background: #e2e8f0
        color: #2b6cb0

// Responsive
@media (max-width: 768px)
  .share-store-header
    h1
      font-size: 2rem
    
    .subtitle
      font-size: 1rem
  
  .share-link-card
    padding: 20px
  
  .link-display
    flex-direction: column
    
    .copy-btn
      width: 100%
      justify-content: center
  
  .share-buttons-grid
    grid-template-columns: repeat(2, 1fr)
  
  .preview-info-cards
    grid-template-columns: 1fr
</style>
