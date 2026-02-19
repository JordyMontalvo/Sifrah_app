<template>
  <div class="flyer-editor">
    <!-- Vista de Listado de Flyers -->
    <div v-if="!editingMode" class="flyers-list-view">
      <div class="list-header">
        <h2 class="list-title">Filtrar flyers</h2>
        <div class="filter-section">
          <select v-model="selectedCategory" class="category-select">
            <option value="">Selecciona la categoría...</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="loadingFlyers" class="loading-container">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando flyers...</p>
      </div>
      
      <div v-else class="flyers-grid">
        <div 
          v-for="flyer in filteredFlyers" 
          :key="flyer.id" 
          class="flyer-card"
        >
          <div class="flyer-card-image">
            <img 
              :src="getFlyerImage(flyer)" 
              :alt="flyer.name"
              @error="handleImageError"
            />
          </div>
          <div class="flyer-card-content">
            <h3 class="flyer-card-title">{{ flyer.name }}</h3>
            <p v-if="flyer.category" class="flyer-card-category">{{ flyer.category }}</p>
          </div>
          <button @click="startEditing(flyer)" class="btn-edit-flyer">
            <i class="fas fa-edit"></i> Editar Flyer
          </button>
        </div>
      </div>
      
      <div v-if="!loadingFlyers && filteredFlyers.length === 0" class="no-flyers">
        <i class="fas fa-inbox"></i>
        <p v-if="availableFlyers.length === 0">No hay flyers disponibles</p>
        <p v-else>No hay flyers en la categoría seleccionada</p>
        <p v-if="availableFlyers.length > 0" class="no-flyers-hint">
          Total de flyers: {{ availableFlyers.length }}
        </p>
      </div>
    </div>

    <!-- Vista de Editor -->
    <div v-else class="editor-container">
      <div class="editor-header">
        <button @click="backToList" class="btn-back">
          <i class="fas fa-arrow-left"></i> Volver a Flyers
        </button>
        <h3 class="editor-title">{{ currentFlyer && currentFlyer.name ? currentFlyer.name : 'Editor de Flyer' }}</h3>
      </div>
      
      <div class="editor-content">
        <div class="editor-controls">

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

        <div class="control-group" v-if="nombreSocio">
          <label>Tipografía:</label>
          <select 
            v-model="selectedFont" 
            @change="updateCanvas"
            class="font-select"
          >
            <option 
              v-for="font in availableFonts" 
              :key="font.value" 
              :value="font.value"
              :data-weight="font.weight || '400'"
            >
              {{ font.label }}
            </option>
          </select>
        </div>

        <div class="control-group" v-if="nombreSocio">
          <label>Tamaño del Texto: {{ fontSize }}px</label>
          <div class="text-size-controls">
            <button @click="decreaseFontSize" class="size-btn" :disabled="fontSize <= 12">
              <i class="fas fa-minus"></i>
            </button>
            <input 
              type="range" 
              v-model.number="fontSize" 
              @input="updateCanvas"
              min="12" 
              max="200" 
              step="1"
              class="input-range"
            />
            <button @click="increaseFontSize" class="size-btn" :disabled="fontSize >= 200">
              <i class="fas fa-plus"></i>
            </button>
            <input 
              type="number" 
              v-model.number="fontSize" 
              @input="updateCanvas"
              min="12" 
              max="200" 
              class="input-number-size"
            />
          </div>
          <div class="size-buttons">
            <button @click="setFontSize(24)" class="size-btn-small">Pequeño (24px)</button>
            <button @click="setFontSize(42)" class="size-btn-small">Mediano (42px)</button>
            <button @click="setFontSize(60)" class="size-btn-small">Grande (60px)</button>
            <button @click="setFontSize(100)" class="size-btn-small">Muy Grande (100px)</button>
          </div>
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
      selectedFont: 'Dancing Script', // Tipografía actual por defecto
      availableFonts: [
        { name: 'Dancing Script', value: 'Dancing Script', label: 'LA TIPOGRAFÍA ACTUAL' },
        { name: 'Montserrat Black', value: 'Montserrat', weight: '900', label: 'Montserrat black' },
        { name: 'Calibri Regular', value: 'Calibri', weight: '400', label: 'Calibri regular' },
        { name: 'Source Serif Bold', value: 'Source Serif Pro', weight: '700', label: 'Source Serif Variable bold' }
      ],
      // Estado de interacción
      isDragging: false,
      isDraggingText: false,
      isResizing: false,
      selectedHandle: null,
      dragStartX: 0,
      dragStartY: 0,
      initialPortraitX: 0,
      initialPortraitY: 0,
      initialPortraitSize: 0,
      initialTextX: 0,
      initialTextY: 0,
      showInstructions: true,
      handleSize: 12,
      isMobile: false,
      // Flyers disponibles
      availableFlyers: [],
      selectedFlyerId: '',
      loadingFlyers: true,
      editingMode: false,
      currentFlyer: null,
      selectedCategory: '',
      categories: [],
    };
  },
  computed: {
    filteredFlyers() {
      if (!this.selectedCategory) {
        return this.availableFlyers;
      }
      return this.availableFlyers.filter(flyer => 
        flyer.category === this.selectedCategory
      );
    },
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
  },
  methods: {
    loadScriptFont() {
      // Cargar fuentes de Google Fonts
      // Verificar si ya existe el link para no duplicarlo
      if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Dancing"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Pacifico&family=Montserrat:wght@300;400;500;600;700;900&family=Source+Serif+Pro:wght@700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    },
    async loadFlyers() {
      try {
        this.loadingFlyers = true;
        console.log('Cargando flyers con sesión:', this.session);
        const { data } = await api.Flyers.GET(this.session);
        
        console.log('Respuesta completa de la API:', data);
        
        if (data.error) {
          console.error('Error al cargar flyers:', data.msg);
          this.availableFlyers = [];
          return;
        }

        // Verificar la estructura de la respuesta
        let flyers = [];
        if (data.flyers && Array.isArray(data.flyers)) {
          flyers = data.flyers;
        } else if (Array.isArray(data)) {
          flyers = data;
        } else if (data.data && Array.isArray(data.data)) {
          flyers = data.data;
        }
        
        console.log('Flyers encontrados:', flyers.length);
        console.log('Primer flyer:', flyers[0]);
        
        this.availableFlyers = flyers;
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(this.availableFlyers.map(f => f.category).filter(Boolean))];
        this.categories = uniqueCategories;
        
        console.log('Categorías encontradas:', this.categories);
      } catch (error) {
        console.error('Error al cargar flyers:', error);
        console.error('Stack:', error.stack);
        this.availableFlyers = [];
      } finally {
        this.loadingFlyers = false;
      }
    },
    
    startEditing(flyer) {
      this.currentFlyer = flyer;
      this.selectedFlyerId = flyer.id;
      this.editingMode = true;
      
      // Cargar la imagen base del flyer seleccionado
      if (flyer.base_image_url) {
        this.loadBaseImage(flyer.base_image_url);
      } else {
        this.loadDefaultFlyer();
      }
      
      // Ocultar instrucciones después de 5 segundos
      setTimeout(() => {
        this.showInstructions = false;
      }, 5000);
    },
    
    backToList() {
      this.editingMode = false;
      this.currentFlyer = null;
      this.selectedFlyerId = '';
      this.nombreSocio = '';
      this.portraitImage = null;
      this.portraitImageObj = null;
      this.showInstructions = true;
    },
    
    getFlyerImage(flyer) {
      if (flyer.base_image_url) return flyer.base_image_url;
      if (flyer.image_url) return flyer.image_url;
      if (flyer.preview_url) return flyer.preview_url;
      // Imagen por defecto
      try {
        return require('@/assets/img/bienvenido-pack-empresario.png');
      } catch (e) {
        return 'https://via.placeholder.com/400x600/f0f0f0/666666?text=Flyer';
      }
    },
    decreaseFontSize() {
      if (this.fontSize > 12) {
        this.fontSize = Math.max(12, this.fontSize - 2);
        this.updateCanvas();
      }
    },
    increaseFontSize() {
      if (this.fontSize < 200) {
        this.fontSize = Math.min(200, this.fontSize + 2);
        this.updateCanvas();
      }
    },
    setFontSize(size) {
      this.fontSize = size;
      this.updateCanvas();
    },
    handleImageError(event) {
      // Si falla la imagen, usar un placeholder
      event.target.src = 'https://via.placeholder.com/400x600/f0f0f0/666666?text=Imagen+no+disponible';
    },

    loadDefaultFlyer() {
      // Cargar el flyer por defecto (el que estaba hardcodeado)
      const defaultImage = require('@/assets/img/bienvenido-pack-empresario.png');
      this.loadBaseImage(defaultImage);
    },

    onFlyerChange() {
      if (!this.editingMode) return;
      const selectedFlyer = this.availableFlyers.find(f => f.id === this.selectedFlyerId);
      if (selectedFlyer) {
        this.currentFlyer = selectedFlyer;
        if (selectedFlyer.base_image_url) {
          this.loadBaseImage(selectedFlyer.base_image_url);
        } else {
          this.loadDefaultFlyer();
        }
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
    getFontFamily() {
      const selectedFontObj = this.availableFonts.find(f => f.value === this.selectedFont);
      if (!selectedFontObj) return "'Dancing Script', 'Great Vibes', 'Pacifico', 'Brush Script MT', 'Lucida Handwriting', cursive";
      
      // Para Montserrat, usar con comillas
      if (selectedFontObj.value === 'Montserrat') {
        return "'Montserrat', sans-serif";
      } 
      // Para Calibri (fuente del sistema), usar directamente
      else if (selectedFontObj.value === 'Calibri') {
        return 'Calibri, sans-serif';
      } 
      // Para Source Serif Pro, usar con comillas
      else if (selectedFontObj.value === 'Source Serif Pro') {
        return "'Source Serif Pro', serif";
      }
      
      // Para Dancing Script, mantener las fuentes de fallback
      return "'Dancing Script', 'Great Vibes', 'Pacifico', 'Brush Script MT', 'Lucida Handwriting', cursive";
    },
    getFontWeight() {
      const selectedFontObj = this.availableFonts.find(f => f.value === this.selectedFont);
      return (selectedFontObj && selectedFontObj.weight) ? selectedFontObj.weight : '400';
    },
    getFontString() {
      const weight = this.getFontWeight();
      const family = this.getFontFamily();
      // Formato correcto para canvas: "weight size family" o "size family"
      // El peso debe ser 'normal', 'bold', o un número (100-900)
      if (weight && weight !== '400' && weight !== 'normal') {
        return `${weight} ${this.fontSize}px ${family}`;
      }
      return `${this.fontSize}px ${family}`;
    },
    isPointInText(x, y, textX, textY, text) {
      if (!text) return false;
      // Crear un canvas temporal para medir el texto
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = this.getFontString();
      const metrics = tempCtx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = this.fontSize;
      
      // Área de detección del texto (con padding para facilitar el clic)
      const padding = 20;
      const left = textX - textWidth / 2 - padding;
      const right = textX + textWidth / 2 + padding;
      const top = textY - textHeight / 2 - padding;
      const bottom = textY + textHeight / 2 + padding;
      
      return x >= left && x <= right && y >= top && y <= bottom;
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
      const coords = this.getCanvasCoordinates(event);
      
      // Primero verificar si se hace clic en el texto del nombre
      if (this.nombreSocio && this.isPointInText(coords.x, coords.y, this.textX, this.textY, this.nombreSocio)) {
        // Iniciar movimiento del texto
        this.isDraggingText = true;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialTextX = this.textX;
        this.initialTextY = this.textY;
        event.preventDefault();
        return;
      }
      
      // Si hay imagen de retrato, verificar interacción con ella
      if (!this.portraitImageObj) return;
      
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
      
      if (this.isDraggingText) {
        // Mover el texto
        const dx = coords.x - this.dragStartX;
        const dy = coords.y - this.dragStartY;
        this.textX = this.initialTextX + dx;
        this.textY = this.initialTextY + dy;
        this.updateCanvas();
      } else if (this.isDragging) {
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
        } else if (this.nombreSocio && this.isPointInText(coords.x, coords.y, this.textX, this.textY, this.nombreSocio)) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      } else if (this.nombreSocio && this.isPointInText(coords.x, coords.y, this.textX, this.textY, this.nombreSocio)) {
        canvas.style.cursor = 'move';
      }
    },
    handleMouseUp() {
      this.isDragging = false;
      this.isDraggingText = false;
      this.isResizing = false;
      this.selectedHandle = null;
      const canvas = this.$refs.canvas;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    },
    handleTouchStart(event) {
      event.preventDefault(); // Prevenir scroll en móvil
      const coords = this.getCanvasCoordinates(event);
      
      // Primero verificar si se toca el texto del nombre
      if (this.nombreSocio && this.isPointInText(coords.x, coords.y, this.textX, this.textY, this.nombreSocio)) {
        // Iniciar movimiento del texto
        this.isDraggingText = true;
        this.dragStartX = coords.x;
        this.dragStartY = coords.y;
        this.initialTextX = this.textX;
        this.initialTextY = this.textY;
        return;
      }
      
      // Si hay imagen de retrato, verificar interacción con ella
      if (!this.portraitImageObj) return;
      
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
      event.preventDefault(); // Prevenir scroll en móvil
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      
      const coords = this.getCanvasCoordinates(event);
      
      if (this.isDraggingText) {
        // Mover el texto
        const dx = coords.x - this.dragStartX;
        const dy = coords.y - this.dragStartY;
        this.textX = this.initialTextX + dx;
        this.textY = this.initialTextY + dy;
        this.updateCanvas();
      } else if (this.isDragging) {
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
      this.isDraggingText = false;
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
        
        ctx.restore();
        
        // Dibujar handles de redimensionamiento solo si showHandles es true
        if (showHandles) {
          this.drawHandles(ctx);
        }
      }

      // Dibujar nombre del socio con la tipografía seleccionada
      if (this.nombreSocio) {
        ctx.save();
        // Usar la tipografía seleccionada
        ctx.font = this.getFontString();
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
  // Unificar el diseño con el resto de vistas del app layout:
  // dejamos que el padding y el fondo lo maneje el contenedor interno
  // para evitar el “salto” visual al cambiar de ruta.
  padding 0
  background-color transparent
  min-height auto

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

.font-select
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
  margin 0 12px

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

.text-size-controls
  display flex
  align-items center
  gap 8px
  margin-top 12px

  .size-btn
    width 40px
    height 40px
    padding 0
    background-color #9f00ad
    color white
    border none
    border-radius 6px
    font-size 16px
    font-weight 600
    cursor pointer
    transition all 0.3s ease
    display flex
    align-items center
    justify-content center

    &:hover:not(:disabled)
      background-color #7d0088
      transform translateY(-2px)
      box-shadow 0 4px 12px rgba(159, 0, 173, 0.3)

    &:disabled
      opacity 0.5
      cursor not-allowed

  .input-number-size
    width 80px
    padding 8px
    border 1px solid #ddd
    border-radius 4px
    font-size 14px
    text-align center

    &:focus
      outline none
      border-color #9f00ad

.size-buttons
  display flex
  flex-wrap wrap
  gap 8px
  margin-top 12px

.size-btn-small
  flex 1
  min-width 120px
  padding 8px 12px
  background-color #f3e5f5
  color #9f00ad
  border 2px solid #9f00ad
  border-radius 6px
  font-size 13px
  font-weight 600
  cursor pointer
  transition all 0.3s ease

  &:hover
    background-color #9f00ad
    color white
    transform translateY(-2px)
    box-shadow 0 4px 12px rgba(159, 0, 173, 0.3)

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

/* Vista de Listado de Flyers */
.flyers-list-view
  padding 20px
  max-width 1400px
  margin 0 auto

.list-header
  margin-bottom 30px

.list-title
  font-size 24px
  font-weight bold
  color #333
  margin-bottom 20px

.filter-section
  margin-bottom 20px

.category-select
  width 100%
  max-width 400px
  padding 12px 16px
  border 1px solid #ddd
  border-radius 8px
  font-size 16px
  background-color white
  cursor pointer
  transition all 0.3s ease

  &:focus
    outline none
    border-color #9f00ad
    box-shadow 0 0 0 3px rgba(159, 0, 173, 0.1)

.loading-container
  display flex
  flex-direction column
  align-items center
  justify-content center
  padding 60px 20px
  color #9f00ad

  i
    font-size 48px
    margin-bottom 16px

  p
    font-size 18px
    margin 0

.flyers-grid
  display grid
  grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
  gap 24px
  margin-top 20px

.flyer-card
  background white
  border-radius 12px
  overflow hidden
  box-shadow 0 4px 12px rgba(0, 0, 0, 0.1)
  transition all 0.3s ease
  display flex
  flex-direction column

  &:hover
    transform translateY(-4px)
    box-shadow 0 8px 24px rgba(0, 0, 0, 0.15)

.flyer-card-image
  width 100%
  height 400px
  overflow hidden
  background #f5f5f5
  display flex
  align-items center
  justify-content center

  img
    width 100%
    height 100%
    object-fit cover
    transition transform 0.3s ease

  &:hover img
    transform scale(1.05)

.flyer-card-content
  padding 16px

.flyer-card-title
  font-size 18px
  font-weight 600
  color #333
  margin 0 0 8px 0

.flyer-card-category
  font-size 14px
  color #666
  margin 0

.btn-edit-flyer
  margin 16px
  padding 12px 24px
  background-color #4CAF50
  color white
  border none
  border-radius 8px
  font-size 16px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display flex
  align-items center
  justify-content center
  gap 8px
  margin-top auto

  &:hover
    background-color #45a049
    transform translateY(-2px)
    box-shadow 0 4px 12px rgba(76, 175, 80, 0.3)

  i
    font-size 16px

.no-flyers
  text-align center
  padding 60px 20px
  color #999

  i
    font-size 64px
    margin-bottom 16px
    opacity 0.5

  p
    font-size 18px
    margin 0
    margin-bottom 8px

  .no-flyers-hint
    font-size 14px
    color #666
    margin-top 8px

/* Header del Editor */
.editor-header
  display flex
  align-items center
  gap 16px
  margin-bottom 20px
  padding-bottom 16px
  border-bottom 2px solid #e0e0e0

.btn-back
  padding 10px 20px
  background-color #6c757d
  color white
  border none
  border-radius 8px
  font-size 14px
  font-weight 600
  cursor pointer
  transition all 0.3s ease
  display flex
  align-items center
  gap 8px

  &:hover
    background-color #5a6268
    transform translateY(-2px)

  i
    font-size 14px

.editor-title
  font-size 20px
  font-weight 600
  color #333
  margin 0

.editor-content
  display flex
  gap 20px
  flex-wrap wrap
</style>
