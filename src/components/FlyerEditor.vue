<template>
  <div class="flyer-editor">
    <div class="editor-container">
      <div class="editor-controls">
        <div class="control-group">
          <label>Seleccionar Flyer:</label>
          <div class="select" v-if="!loadingFlyers">
            <select v-model="selectedFlyerId" @change="onFlyerChange" class="select-flyer">
              <option value="">Seleccione un flyer</option>
              <option 
                v-for="flyer in availableFlyers" 
                :key="flyer.id" 
                :value="flyer.id"
              >
                {{ flyer.name }}
              </option>
            </select>
          </div>
          <div v-else class="loading-flyers">
            <i class="fas fa-spinner fa-spin"></i> Cargando flyers...
          </div>
        </div>

        <div class="control-group">
          <label>Nombre del Socio:</label>
          <input 
            type="text" 
            v-model="nombreSocio" 
            @input="updateCanvas"
            placeholder="Ingrese el nombre del socio"
            class="input-nombre"
          />
        </div>

        <div class="control-group">
          <label>Imagen del Retrato:</label>
          <div class="image-upload-section">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              style="display: none"
              id="portrait-upload"
            />
            <label for="portrait-upload" class="upload-button">
              <i class="fas fa-upload"></i> 
              {{ portraitImage ? 'Cambiar Imagen' : 'Subir Imagen' }}
            </label>
            <button 
              v-if="portraitImage" 
              @click="removePortrait"
              class="remove-button"
            >
              <i class="fas fa-times"></i> Eliminar
            </button>
          </div>
        </div>

        <div class="control-group export-group">
          <label>Exportar Flyer:</label>
          <div class="export-buttons">
            <button @click="exportImage('png')" class="btn-export">
              <i class="fas fa-download"></i> PNG
            </button>
            <button @click="exportImage('jpeg')" class="btn-export">
              <i class="fas fa-download"></i> JPEG
            </button>
            <button @click="exportImage('webp')" class="btn-export">
              <i class="fas fa-download"></i> WEBP
            </button>
          </div>
        </div>
      </div>

      <div class="canvas-container">
        <canvas 
          ref="canvas" 
          :width="canvasWidth" 
          :height="canvasHeight"
          class="flyer-canvas"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @touchcancel="handleTouchEnd"
        ></canvas>
        <div v-if="showInstructions" class="canvas-instructions">
          <p><i class="fas fa-info-circle"></i> Haz clic y arrastra la imagen para moverla. Usa las esquinas para redimensionar.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'FlyerEditor',
  props: {
    session: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      nombreSocio: '',
      baseImage: null,
      portraitImage: null,
      portraitImageObj: null,
      canvasWidth: 720,
      canvasHeight: 1280,
      // Posición y tamaño del retrato circular (centro aproximado del flyer)
      portraitX: 360,
      portraitY: 500,
      portraitSize: 280,
      // Posición y estilo del texto del nombre (debajo de EMPRESARIO)
      textX: 360,
      textY: 1050, // Más abajo, debajo de EMPRESARIO
      fontSize: 42,
      textColor: '#FFFFFF',
      // Estado de interacción
      isDragging: false,
      isResizing: false,
      selectedHandle: null,
      dragStartX: 0,
      dragStartY: 0,
      initialPortraitX: 0,
      initialPortraitY: 0,
      initialPortraitSize: 0,
      showInstructions: true,
      handleSize: 12,
      isMobile: false,
      // Flyers disponibles
      availableFlyers: [],
      selectedFlyerId: '',
      loadingFlyers: true,
    };
  },
  async mounted() {
    this.loadScriptFont();
    // Detectar si es móvil
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (this.isMobile) {
      this.handleSize = 20; // Handles más grandes en móvil
    }
    // Cargar flyers disponibles
    await this.loadFlyers();
    // Ocultar instrucciones después de 5 segundos
    setTimeout(() => {
      this.showInstructions = false;
    }, 5000);
  },
  methods: {
    loadScriptFont() {
      // Cargar fuente script de Google Fonts
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Pacifico&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    },
    async loadFlyers() {
      try {
        this.loadingFlyers = true;
        const { data } = await api.Flyers.GET(this.session);
        
        if (data.error) {
          console.error('Error al cargar flyers:', data.msg);
          // Si hay error, usar el flyer por defecto
          this.loadDefaultFlyer();
          return;
        }

        this.availableFlyers = data.flyers || [];
        
        // Si hay flyers disponibles, seleccionar el primero por defecto
        if (this.availableFlyers.length > 0) {
          this.selectedFlyerId = this.availableFlyers[0].id;
          this.loadBaseImage(this.availableFlyers[0].base_image_url);
        } else {
          // Si no hay flyers, usar el por defecto
          this.loadDefaultFlyer();
        }
      } catch (error) {
        console.error('Error al cargar flyers:', error);
        this.loadDefaultFlyer();
      } finally {
        this.loadingFlyers = false;
      }
    },

    loadDefaultFlyer() {
      // Cargar el flyer por defecto (el que estaba hardcodeado)
      const defaultImage = require('@/assets/img/bienvenido-pack-empresario.png');
      this.loadBaseImage(defaultImage);
    },

    onFlyerChange() {
      const selectedFlyer = this.availableFlyers.find(f => f.id === this.selectedFlyerId);
      if (selectedFlyer && selectedFlyer.base_image_url) {
        this.loadBaseImage(selectedFlyer.base_image_url);
      }
    },

    loadBaseImage(imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.baseImage = img;
        this.canvasWidth = img.width;
        this.canvasHeight = img.height;
        // Posiciones iniciales basadas en el tamaño de la imagen
        this.portraitX = img.width / 2;
        this.portraitY = img.height * 0.4; // Aproximadamente 40% desde arriba
        this.textX = img.width / 2;
        this.textY = img.height * 0.82; // Debajo de EMPRESARIO (aproximadamente 82% desde arriba)
        this.updateCanvas();
      };
      img.onerror = () => {
        console.error('Error al cargar la imagen base');
        alert('Error al cargar la imagen base. Por favor, verifique que la imagen existe.');
      };
      img.src = imageSrc;
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Por favor, seleccione un archivo de imagen válido');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.portraitImage = e.target.result;
        const img = new Image();
        img.onload = () => {
          this.portraitImageObj = img;
          this.updateCanvas();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removePortrait() {
      this.portraitImage = null;
      this.portraitImageObj = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.updateCanvas();
    },
    adjustSize(delta) {
      this.portraitSize = Math.max(150, Math.min(450, this.portraitSize + delta));
      this.updateCanvas();
    },
    getCanvasCoordinates(event) {
      const canvas = this.$refs.canvas;
      if (!canvas) return { x: 0, y: 0 };
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Soporte para eventos táctiles
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    },
    isPointInCircle(x, y, centerX, centerY, radius) {
      const dx = x - centerX;
      const dy = y - centerY;
      return dx * dx + dy * dy <= radius * radius;
    },
    getHandleAt(x, y) {
      if (!this.portraitImageObj) return null;
      
      const radius = this.portraitSize / 2;
      // Área táctil más grande en móvil para facilitar el toque
      const touchArea = this.isMobile ? this.handleSize * 2 : this.handleSize;
      const handles = [
        { name: 'top-left', x: this.portraitX - radius, y: this.portraitY - radius },
        { name: 'top-right', x: this.portraitX + radius, y: this.portraitY - radius },
        { name: 'bottom-left', x: this.portraitX - radius, y: this.portraitY + radius },
        { name: 'bottom-right', x: this.portraitX + radius, y: this.portraitY + radius }
      ];
      
      for (const handle of handles) {
        const dx = x - handle.x;
        const dy = y - handle.y;
        if (dx * dx + dy * dy <= touchArea * touchArea) {
          return handle.name;
        }
      }
      
      return null;
    },
    drawHandles(ctx) {
      if (!this.portraitImageObj) return;
      
      const radius = this.portraitSize / 2;
      const handles = [
        { x: this.portraitX - radius, y: this.portraitY - radius },
        { x: this.portraitX + radius, y: this.portraitY - radius },
        { x: this.portraitX - radius, y: this.portraitY + radius },
        { x: this.portraitX + radius, y: this.portraitY + radius }
      ];
      
      ctx.save();
      handles.forEach(handle => {
        ctx.fillStyle = '#9f00ad';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, this.handleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    },
    handleMouseDown(event) {
      if (!this.portraitImageObj) return;
      
      const coords = this.getCanvasCoordinates(event);
      const handle = this.getHandleAt(coords.x, coords.y);
      
      if (handle) {
        // Iniciar redimensionamiento
        this.isResizing = true;
        this.selectedHandle = handle;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialPortraitX = this.portraitX;
        this.initialPortraitY = this.portraitY;
        this.initialPortraitSize = this.portraitSize;
        event.preventDefault();
      } else if (this.isPointInCircle(coords.x, coords.y, this.portraitX, this.portraitY, this.portraitSize / 2)) {
        // Iniciar movimiento
        this.isDragging = true;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialPortraitX = this.portraitX;
        this.initialPortraitY = this.portraitY;
        event.preventDefault();
      }
    },
    handleMouseMove(event) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      
      const coords = this.getCanvasCoordinates(event);
      
      if (this.isDragging) {
        // Mover la imagen
        const dx = coords.x - this.dragStartX;
        const dy = coords.y - this.dragStartY;
        this.portraitX = this.initialPortraitX + dx;
        this.portraitY = this.initialPortraitY + dy;
        this.updateCanvas();
      } else if (this.isResizing && this.selectedHandle) {
        // Redimensionar la imagen desde las esquinas
        const dx = coords.x - this.dragStartX;
        const dy = coords.y - this.dragStartY;
        
        // Calcular la distancia desde el centro para mantener proporción circular
        const centerX = this.initialPortraitX;
        const centerY = this.initialPortraitY;
        const currentDistance = Math.sqrt(
          Math.pow(coords.x - centerX, 2) + Math.pow(coords.y - centerY, 2)
        );
        
        // El nuevo tamaño es el doble de la distancia desde el centro
        let newSize = currentDistance * 2;
        
        // Limitar el tamaño
        newSize = Math.max(150, Math.min(450, newSize));
        this.portraitSize = newSize;
        
        // Mantener el centro en la misma posición al redimensionar
        // (el centro no cambia, solo el tamaño)
        
        this.updateCanvas();
      } else if (this.portraitImageObj) {
        // Cambiar cursor cuando está sobre la imagen o handles
        const handle = this.getHandleAt(coords.x, coords.y);
        if (handle) {
          canvas.style.cursor = 'nwse-resize';
        } else if (this.isPointInCircle(coords.x, coords.y, this.portraitX, this.portraitY, this.portraitSize / 2)) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    },
    handleMouseUp() {
      this.isDragging = false;
      this.isResizing = false;
      this.selectedHandle = null;
      const canvas = this.$refs.canvas;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    },
    handleTouchStart(event) {
      if (!this.portraitImageObj) return;
      
      event.preventDefault(); // Prevenir scroll en móvil
      const coords = this.getCanvasCoordinates(event);
      const handle = this.getHandleAt(coords.x, coords.y);
      
      if (handle) {
        // Iniciar redimensionamiento
        this.isResizing = true;
        this.selectedHandle = handle;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialPortraitX = this.portraitX;
        this.initialPortraitY = this.portraitY;
        this.initialPortraitSize = this.portraitSize;
      } else if (this.isPointInCircle(coords.x, coords.y, this.portraitX, this.portraitY, this.portraitSize / 2)) {
        // Iniciar movimiento
        this.isDragging = true;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialPortraitX = this.portraitX;
        this.initialPortraitY = this.portraitY;
      }
    },
    handleTouchMove(event) {
      if (!this.portraitImageObj) return;
      
      event.preventDefault(); // Prevenir scroll en móvil
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      
      const coords = this.getCanvasCoordinates(event);
      
      if (this.isDragging) {
        // Mover la imagen
        const dx = coords.x - this.dragStartX;
        const dy = coords.y - this.dragStartY;
        this.portraitX = this.initialPortraitX + dx;
        this.portraitY = this.initialPortraitY + dy;
        this.updateCanvas();
      } else if (this.isResizing && this.selectedHandle) {
        // Redimensionar la imagen desde las esquinas
        const centerX = this.initialPortraitX;
        const centerY = this.initialPortraitY;
        const currentDistance = Math.sqrt(
          Math.pow(coords.x - centerX, 2) + Math.pow(coords.y - centerY, 2)
        );
        
        // El nuevo tamaño es el doble de la distancia desde el centro
        let newSize = currentDistance * 2;
        
        // Limitar el tamaño
        newSize = Math.max(150, Math.min(450, newSize));
        this.portraitSize = newSize;
        
        this.updateCanvas();
      }
    },
    handleTouchEnd(event) {
      event.preventDefault();
      this.isDragging = false;
      this.isResizing = false;
      this.selectedHandle = null;
    },
    updateCanvas(showHandles = true) {
      if (!this.baseImage) return;

      const canvas = this.$refs.canvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Establecer tamaño del canvas
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar imagen base del flyer
      ctx.drawImage(this.baseImage, 0, 0, this.canvasWidth, this.canvasHeight);

      // Dibujar retrato circular si existe
      if (this.portraitImageObj) {
        ctx.save();
        
        // Crear un path circular para el clipping
        ctx.beginPath();
        ctx.arc(this.portraitX, this.portraitY, this.portraitSize / 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Dibujar la imagen del retrato dentro del círculo
        const size = this.portraitSize;
        const x = this.portraitX - size / 2;
        const y = this.portraitY - size / 2;
        
        // Intentar hacer un crop centrado de la imagen
        const imgAspect = this.portraitImageObj.width / this.portraitImageObj.height;
        let drawWidth = size;
        let drawHeight = size;
        let drawX = x;
        let drawY = y;
        
        if (imgAspect > 1) {
          // Imagen más ancha que alta
          drawHeight = size;
          drawWidth = size * imgAspect;
          drawX = x - (drawWidth - size) / 2;
        } else {
          // Imagen más alta que ancha
          drawWidth = size;
          drawHeight = size / imgAspect;
          drawY = y - (drawHeight - size) / 2;
        }
        
        ctx.drawImage(
          this.portraitImageObj,
          drawX, drawY, drawWidth, drawHeight
        );
        
        // Dibujar borde dorado del círculo
        ctx.restore();
        ctx.beginPath();
        ctx.arc(this.portraitX, this.portraitY, this.portraitSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Dibujar handles de redimensionamiento solo si showHandles es true
        if (showHandles) {
          this.drawHandles(ctx);
        }
      }

      // Dibujar nombre del socio con fuente script/manuscrita
      if (this.nombreSocio) {
        ctx.save();
        // Usar fuente script similar a "Nuevo socio" del flyer
        // Intentar usar fuentes script de Google Fonts, con fallback
        ctx.font = `${this.fontSize}px 'Dancing Script', 'Great Vibes', 'Pacifico', 'Brush Script MT', 'Lucida Handwriting', cursive`;
        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Agregar glow blanco sutil primero (efecto de resplandor similar al flyer)
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(this.nombreSocio, this.textX, this.textY);
        
        // Agregar sombra negra para contraste
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Dibujar el texto principal
        ctx.fillText(this.nombreSocio, this.textX, this.textY);
        
        ctx.restore();
      }
    },
    exportImage(format) {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      // Redibujar el canvas sin los handles antes de exportar
      this.updateCanvas(false);

      let mimeType;
      let extension;
      
      switch(format) {
        case 'png':
          mimeType = 'image/png';
          extension = 'png';
          break;
        case 'jpeg':
          mimeType = 'image/jpeg';
          extension = 'jpg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          extension = 'webp';
          break;
        default:
          mimeType = 'image/png';
          extension = 'png';
      }

      // Esperar un momento para que el canvas se actualice
      setTimeout(() => {
        // Convertir canvas a blob
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Error al exportar la imagen');
            // Restaurar handles después del error
            this.updateCanvas(true);
            return;
          }

          // Crear URL del blob
          const url = URL.createObjectURL(blob);
          
          // Crear enlace de descarga
          const link = document.createElement('a');
          link.href = url;
          const fileName = this.nombreSocio 
            ? `flyer-${this.nombreSocio.replace(/\s+/g, '-')}.${extension}`
            : `flyer-empresario.${extension}`;
          link.download = fileName;
          
          // Trigger descarga
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar URL
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          // Restaurar handles después de exportar
          this.updateCanvas(true);
        }, mimeType, 0.95);
      }, 100);
    },
  },
};
</script>

<style lang="stylus" scoped>
.flyer-editor
  padding 20px
  background-color #f5f5f5
  min-height calc(100vh - 100px)

.editor-container
  display flex
  gap 20px
  max-width 1400px
  margin 0 auto
  flex-wrap wrap

.editor-controls
  flex 1
  min-width 300px
  background white
  padding 20px
  border-radius 8px
  box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
  max-height calc(100vh - 120px)
  overflow-y auto

.control-group
  margin-bottom 24px
  padding-bottom 20px
  border-bottom 1px solid #e0e0e0

  &:last-child
    border-bottom none

  label
    display block
    font-weight 600
    margin-bottom 8px
    color #333
    font-size 14px

.input-nombre
  width 100%
  padding 10px
  border 1px solid #ddd
  border-radius 4px
  font-size 16px
  box-sizing border-box

  &:focus
    outline none
    border-color #9f00ad

.select-flyer
  width 100%
  padding 10px
  border 1px solid #ddd
  border-radius 4px
  font-size 16px
  box-sizing border-box
  background-color white
  cursor pointer

  &:focus
    outline none
    border-color #9f00ad

.loading-flyers
  padding 10px
  text-align center
  color #9f00ad

  i
    margin-right 8px

.image-upload-section
  display flex
  gap 10px
  align-items center
  margin-bottom 12px

.upload-button
  padding 10px 20px
  background-color #9f00ad
  color white
  border none
  border-radius 6px
  font-size 14px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display inline-flex
  align-items center
  gap 8px

  &:hover
    background-color #7d0088
    transform translateY(-2px)
    box-shadow 0 4px 12px rgba(159, 0, 173, 0.3)

  i
    font-size 16px

.remove-button
  padding 10px 20px
  background-color #e53935
  color white
  border none
  border-radius 6px
  font-size 14px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display inline-flex
  align-items center
  gap 8px

  &:hover
    background-color #c62828
    transform translateY(-2px)

  i
    font-size 16px

.image-preview
  margin-top 12px
  text-align center

.preview-img
  max-width 200px
  max-height 200px
  border-radius 50%
  border 3px solid #9f00ad
  object-fit cover
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.2)

.portrait-controls, .name-controls
  display flex
  flex-direction column
  gap 12px

.size-buttons
  display flex
  gap 10px
  margin-top 8px

.size-btn
  flex 1
  padding 8px 16px
  background-color #f3e5f5
  color #9f00ad
  border 2px solid #9f00ad
  border-radius 6px
  font-size 13px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display flex
  align-items center
  justify-content center
  gap 6px

  &:hover
    background-color #9f00ad
    color white
    transform translateY(-2px)
    box-shadow 0 4px 12px rgba(159, 0, 173, 0.3)

  i
    font-size 14px

.control-item
  display flex
  align-items center
  gap 8px

  label
    min-width 120px
    margin-bottom 0
    font-weight normal
    font-size 13px

.input-number
  flex 1
  padding 8px
  border 1px solid #ddd
  border-radius 4px
  font-size 14px

  &:focus
    outline none
    border-color #9f00ad

.input-range
  flex 1
  height 6px
  border-radius 3px
  background #ddd
  outline none

  &::-webkit-slider-thumb
    appearance none
    width 18px
    height 18px
    border-radius 50%
    background #9f00ad
    cursor pointer

  &::-moz-range-thumb
    width 18px
    height 18px
    border-radius 50%
    background #9f00ad
    cursor pointer
    border none

.input-color
  width 60px
  height 40px
  border 1px solid #ddd
  border-radius 4px
  cursor pointer

.export-group
  margin-top 30px

.export-buttons
  display flex
  gap 10px
  flex-wrap wrap

.btn-export
  flex 1
  min-width 120px
  padding 12px 20px
  background-color #9f00ad
  color white
  border none
  border-radius 6px
  font-size 14px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display flex
  align-items center
  justify-content center
  gap 8px

  &:hover
    background-color #7d0088
    transform translateY(-2px)
    box-shadow 0 4px 12px rgba(159, 0, 173, 0.3)

  &:active
    transform translateY(0)

  i
    font-size 16px

.canvas-container
  flex 1
  min-width 400px
  background white
  padding 20px
  border-radius 8px
  box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
  display flex
  justify-content center
  align-items flex-start
  overflow auto
  max-height calc(100vh - 120px)
  position relative

.flyer-canvas
  max-width 100%
  height auto
  border 1px solid #ddd
  border-radius 4px
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.1)
  cursor default
  user-select none
  touch-action none
  -webkit-touch-callout none
  -webkit-user-select none
  -moz-user-select none
  -ms-user-select none

.canvas-instructions
  position absolute
  bottom 10px
  left 50%
  transform translateX(-50%)
  background rgba(159, 0, 173, 0.9)
  color white
  padding 10px 20px
  border-radius 20px
  font-size 13px
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.3)
  animation fadeOut 0.5s ease-in-out 4.5s forwards
  z-index 10

  i
    margin-right 8px

@keyframes fadeOut
  from
    opacity 1
  to
    opacity 0
    pointer-events none

@media (max-width: 768px)
  .editor-container
    flex-direction column

  .editor-controls
    max-height none

  .canvas-container
    min-width 100%
    max-height none

  .export-buttons
    flex-direction column

  .btn-export
    width 100%
</style>
