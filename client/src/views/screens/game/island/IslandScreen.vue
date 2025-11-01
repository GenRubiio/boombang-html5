<template>
  <div id="island-screen" class="island-screen">
    <div class="island-card">
      <div class="island__user-name">
        <h1>{{ sceneData.user.username }}</h1>
      </div>
      <div class="island__info">
        <div class="island__info-name">
          <span v-if="!isEditingName" @click="startEditName">{{ sceneData.name }}</span>
          <input
            v-else
            ref="nameInput"
            v-model="editedName"
            @input="handleNameInput"
            @keyup.enter="saveIslandName"
            @keyup.escape="cancelEditName"
            @blur="saveIslandName"
            class="island__info-name-input"
          />
          <i 
            v-if="!isEditingName && canEditIsland" 
            class="las la-edit island__info-name-edit" 
            @click="startEditName"
            :title="$t('island.edit_name_tooltip')"
          ></i>
        </div>
        <div class="island__info-description">
          <div
            v-if="!isEditingDescription"
            class="description-display"
            @click="canEditIsland && startEditDescription()"
            :style="{ cursor: canEditIsland ? 'pointer' : 'default' }"
          >
            <span v-if="sceneData.description">{{ sceneData.description }}</span>
            <span v-else class="description-placeholder">
              {{ canEditIsland ? $t('island.description_placeholder') : $t('island.no_description') }}
            </span>
          </div>
          <div v-else class="description-edit">
            <textarea
              ref="descriptionInput"
              v-model="editedDescription"
              @input="handleDescriptionInput"
              @keyup.escape="cancelEditDescription"
              class="island__info-description-textarea"
              :placeholder="$t('island.description_textarea_placeholder')"
            ></textarea>
            <div class="description-edit-actions">
              <button @click="saveIslandDescription" class="save-btn">
                <i class="las la-check"></i>
              </button>
              <button @click="cancelEditDescription" class="cancel-btn">
                <i class="las la-times"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Botones de escenario -->
        <div class="scenario-buttons">
          <div class="scenario-button__list">
            <div class="scenario-button__list-title">{{ $t('island.locations') }}</div>
          </div>
          <!-- Botones para escenarios existentes -->
          <div
            v-for="scene in sceneData.scenes"
            :key="scene.id"
            class="scenario-button__container"
          >
            <div class="scenario-button__container-left">
              <button
                :key="scene.id"
                class="scenario-button"
                @click="handleSceneAction(scene)"
                :disabled="isJoining"
              >
                {{ scene.name }}
              </button>
            </div>
            <div class="scenario-button__container-right">
              <div class="scenario-button__container-right__count">0</div>
            </div>
          </div>

          <!-- Botones para añadir nuevos escenarios (solo si es mi isla) -->
          <template
            v-if="
              sceneData.user_id == $socket.user.db_id ||
              sceneData.userId == $socket.user.db_id
            "
          >
            <div
              v-for="n in 5 - (sceneData.scenes ? sceneData.scenes.length : 0)"
              :key="'add-' + n"
              class="scenario-button__container"
            >
              <div class="scenario-button__container-left">
                <button
                  :key="'add-' + n"
                  class="scenario-button scenario-button--add"
                  @click="handleSceneAction(null)"
                  :disabled="isJoining"
                >
                  {{ $t('island.add_scenario') }}
                </button>
              </div>
              <div class="scenario-button__container-right">
                <div class="scenario-button__container-right__icon">
                  <i class="las la-angle-double-right"></i>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Imagen de la brújula -->
    <img
      class="brujiula"
      :src="asset_brujula_image"
      alt="Brújula"
      @load="handleImageLoad"
      @error="handleImageLoad"
      @click="goBackToLobby"
    />

    <!-- Vista previa de isla -->
    <div class="island-preview">
      <img
        :src="islandImage"
        :alt="`Isla ${sceneData.type}`"
        @load="handleImageLoad"
        @error="handleImageLoad"
      />
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket.js";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum.js";
import asset_brujula_image from "@/assets/game/basechat/brujula.webp";

export default {
  props: {
    sceneData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      asset_brujula_image,
      imagesToLoad: 2, // 1 isla + 1 brújula
      loadedImages: 0,
      imagesLoaded: false,
      isJoining: false,
      isEditingName: false,
      editedName: '',
      originalName: '',
      lastValidName: '', // Último nombre válido según el ancho
      isEditingDescription: false,
      editedDescription: '',
      originalDescription: '',
      lastValidDescription: '', // Última descripción válida según el ancho
      MAX_NAME_WIDTH: 215, // Ancho máximo en píxeles para el nombre de la isla
      MAX_DESCRIPTION_WIDTH: 210, // Ancho máximo en píxeles para cada línea de descripción
      MAX_DESCRIPTION_HEIGHT: 100, // Altura máxima en píxeles para la descripción
    };
  },
  computed: {
    islandImage() {
      if (!this.sceneData || !this.sceneData.type) {
        return "";
      }
      return new URL(
        `../../../../assets/game/islands/isla${this.sceneData.type}.webp`,
        import.meta.url
      ).href;
    },
    canEditIsland() {
      return this.sceneData.user_id == this.$socket.user.db_id || 
             this.sceneData.userId == this.$socket.user.db_id;
    },
  },
  methods: {
    handleImageLoad() {
      if (this.imagesLoaded) return;

      this.loadedImages++;

      if (this.loadedImages >= this.imagesToLoad) {
        this.imagesLoaded = true;
        this.$emit("updateLoading", false);
      }
    },
    preloadImages() {
      const allImages = [this.islandImage, this.asset_brujula_image];

      allImages.forEach((src) => {
        if (src) {
          const img = new Image();
          img.src = src;
          img.onload = this.handleImageLoad;
          img.onerror = this.handleImageLoad;
        }
      });
    },
    goBackToLobby() {
      this.$emit("updateLoading", true);
      this.$emit("exitLobby");
    },
    handleSceneAction(scene) {
      if (this.isJoining) return;
      this.isJoining = true;
      if (scene) {
        if (import.meta.env.VITE_APP_ENV === "local") {
          console.log("Acción para el escenario existente:", scene);
        }
        socket.emit(RequestSocketsEnum.JOIN_PRIVATE_SCENE, {
          sceneId: scene.id,
          password: null, // Aquí puedes manejar la contraseña si es necesario
        });
      } else {
        if (import.meta.env.VITE_APP_ENV === "local") {
          console.log("Añadir nuevo escenario");
        }
        this.$emit("createIslandScene", this.sceneData);
      }
    },
    /**
     * Calcula el ancho de un texto en píxeles usando el estilo del input
     */
    getTextWidth(text, element) {
      // Crear un elemento canvas para medir el texto
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Obtener el estilo computado del elemento
      const computedStyle = window.getComputedStyle(element);
      const fontSize = computedStyle.fontSize;
      const fontFamily = computedStyle.fontFamily;
      const fontWeight = computedStyle.fontWeight;

      // Aplicar el estilo al contexto del canvas
      context.font = `${fontWeight} ${fontSize} ${fontFamily}`;

      // Medir el ancho del texto
      const metrics = context.measureText(text);
      return metrics.width;
    },
    /**
     * Maneja el evento input del campo de nombre
     * Valida que el ancho del texto no supere MAX_NAME_WIDTH píxeles
     */
    handleNameInput(event) {
      const input = event.target;
      const newValue = input.value;

      // Calcular el ancho del texto
      const textWidth = this.getTextWidth(newValue, input);

      // Si el ancho supera el máximo, revertir al valor anterior
      if (textWidth > this.MAX_NAME_WIDTH) {
        // Guardar posición del cursor antes de revertir
        const cursorPosition = input.selectionStart - 1;

        // Revertir al último valor válido
        this.editedName = this.lastValidName;

        // En el siguiente tick, restaurar el cursor
        this.$nextTick(() => {
          if (cursorPosition >= 0) {
            input.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
      } else {
        // Si el ancho es válido, actualizar tanto editedName como lastValidName
        this.editedName = newValue;
        this.lastValidName = newValue;
      }
    },
    startEditName() {
      if (!this.canEditIsland) return;
      this.isEditingName = true;
      this.originalName = this.sceneData.name;
      this.editedName = this.sceneData.name;
      this.lastValidName = this.sceneData.name; // Inicializar con el nombre actual
      this.$nextTick(() => {
        this.$refs.nameInput.focus();
        this.$refs.nameInput.select();
      });
    },
    cancelEditName() {
      this.isEditingName = false;
      this.editedName = '';
    },
    async saveIslandName() {
      if (!this.editedName.trim()) {
        this.cancelEditName();
        return;
      }

      const trimmedName = this.editedName.trim();
      
      // Si el nombre no cambió, no hacer nada
      if (trimmedName === this.originalName) {
        this.cancelEditName();
        return;
      }

      try {
        socket.emit(RequestSocketsEnum.UPDATE_ISLAND_NAME, {
          islandId: this.sceneData.id,
          name: trimmedName
        });
        
        // Actualizar localmente mientras esperamos confirmación del servidor
        this.sceneData.name = trimmedName;
        this.isEditingName = false;
      } catch (error) {
        console.error('Error updating island name:', error);
        this.cancelEditName();
      }
    },
    handleIslandNameUpdated(data) {
      if (data.success && data.islandId === this.sceneData.id) {
        this.sceneData.name = data.name;
        this.cancelEditName();
      }
    },
    handleError(data) {
      console.error('Island name update error:', data.message);
      // Revertir cambios locales en caso de error
      this.sceneData.name = this.originalName;
      this.cancelEditName();
      
      // Aquí podrías mostrar una notificación de error al usuario
      // Por ejemplo: this.$toast.error(data.message);
    },
    /**
     * Calcula la altura que ocuparía un texto en el elemento
     */
    getTextHeight(text, element) {
      // Crear un elemento temporal para medir la altura
      const tempDiv = document.createElement('div');
      const computedStyle = window.getComputedStyle(element);

      // Obtener padding del elemento
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

      // Calcular ancho interior disponible
      const availableWidth = this.MAX_DESCRIPTION_WIDTH - paddingLeft - paddingRight;

      // Copiar estilos relevantes del textarea
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = availableWidth + 'px';
      tempDiv.style.fontSize = computedStyle.fontSize;
      tempDiv.style.fontFamily = computedStyle.fontFamily;
      tempDiv.style.fontWeight = computedStyle.fontWeight;
      tempDiv.style.lineHeight = computedStyle.lineHeight;
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.overflowWrap = 'break-word';
      tempDiv.style.margin = '0';
      tempDiv.style.padding = '0';

      // Agregar el texto
      tempDiv.textContent = text;

      // Agregar al DOM temporalmente
      document.body.appendChild(tempDiv);

      // Medir la altura del contenido + padding
      const contentHeight = tempDiv.scrollHeight;
      const totalHeight = contentHeight + paddingTop + paddingBottom;

      // Remover del DOM
      document.body.removeChild(tempDiv);

      return totalHeight;
    },
    /**
     * Calcula si el texto de la descripción excede las dimensiones permitidas
     */
    isDescriptionTooLarge(text, element) {
      if (!text) return false;

      const computedStyle = window.getComputedStyle(element);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

      // Calcular ancho disponible para el texto (sin padding)
      const availableWidth = this.MAX_DESCRIPTION_WIDTH - paddingLeft - paddingRight;

      const lines = text.split('\n');

      // Verificar cada línea individualmente por ancho
      for (let line of lines) {
        const lineWidth = this.getTextWidth(line, element);
        if (lineWidth > availableWidth) {
          return true;
        }
      }

      // Verificar altura total del texto renderizado (incluyendo padding)
      const textHeight = this.getTextHeight(text, element);
      if (textHeight > this.MAX_DESCRIPTION_HEIGHT) {
        return true;
      }

      return false;
    },
    /**
     * Maneja el evento input del campo de descripción
     * Valida que el ancho de cada línea no supere MAX_DESCRIPTION_WIDTH píxeles
     * y que la altura total no supere MAX_DESCRIPTION_HEIGHT píxeles
     */
    handleDescriptionInput(event) {
      const textarea = event.target;
      const newValue = textarea.value;

      // Verificar si el texto es demasiado grande
      if (this.isDescriptionTooLarge(newValue, textarea)) {
        // Guardar posición del cursor antes de revertir
        const cursorPosition = textarea.selectionStart - 1;

        // Revertir al último valor válido
        this.editedDescription = this.lastValidDescription;

        // En el siguiente tick, restaurar el cursor
        this.$nextTick(() => {
          if (cursorPosition >= 0) {
            textarea.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
      } else {
        // Si es válido, actualizar tanto editedDescription como lastValidDescription
        this.editedDescription = newValue;
        this.lastValidDescription = newValue;
      }
    },
    startEditDescription() {
      if (!this.canEditIsland) return;
      this.isEditingDescription = true;
      this.originalDescription = this.sceneData.description || '';
      this.editedDescription = this.sceneData.description || '';
      this.lastValidDescription = this.sceneData.description || ''; // Inicializar con la descripción actual
      this.$nextTick(() => {
        this.$refs.descriptionInput.focus();
      });
    },
    cancelEditDescription() {
      this.isEditingDescription = false;
      this.editedDescription = '';
    },
    async saveIslandDescription() {
      const trimmedDescription = this.editedDescription.trim();
      
      // Si la descripción no cambió, no hacer nada
      if (trimmedDescription === (this.originalDescription || '')) {
        this.cancelEditDescription();
        return;
      }

      try {
        socket.emit(RequestSocketsEnum.UPDATE_ISLAND_DESCRIPTION, {
          islandId: this.sceneData.id,
          description: trimmedDescription
        });
        
        // Actualizar localmente mientras esperamos confirmación del servidor
        this.sceneData.description = trimmedDescription || null;
        this.isEditingDescription = false;
      } catch (error) {
        console.error('Error updating island description:', error);
        this.cancelEditDescription();
      }
    },
    handleIslandDescriptionUpdated(data) {
      if (data.success && data.islandId === this.sceneData.id) {
        this.sceneData.description = data.description;
        this.cancelEditDescription();
      }
    },
    handleDescriptionError(data) {
      console.error('Island description update error:', data.message);
      // Revertir cambios locales en caso de error
      this.sceneData.description = this.originalDescription;
      this.cancelEditDescription();
      
      // Aquí podrías mostrar una notificación de error al usuario
      // Por ejemplo: this.$toast.error(data.message);
    },
  },
  created() {
    this.$emit("updateLoading", true);
    
    // Escuchar respuestas del socket
    socket.on(ResponseSocketsEnum.ISLAND_NAME_UPDATED, this.handleIslandNameUpdated);
    socket.on(ResponseSocketsEnum.ERROR_ISLAND_NAME_UPDATED, this.handleError);
    socket.on(ResponseSocketsEnum.ISLAND_DESCRIPTION_UPDATED, this.handleIslandDescriptionUpdated);
    socket.on(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, this.handleDescriptionError);
  },
  beforeUnmount() {
    // Limpiar listeners
    socket.off(ResponseSocketsEnum.ISLAND_NAME_UPDATED, this.handleIslandNameUpdated);
    socket.off(ResponseSocketsEnum.ERROR_ISLAND_NAME_UPDATED, this.handleError);
    socket.off(ResponseSocketsEnum.ISLAND_DESCRIPTION_UPDATED, this.handleIslandDescriptionUpdated);
    socket.off(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, this.handleDescriptionError);
  },
  mounted() {
    this.preloadImages();
  },
};
</script>

<style scoped>
.island-screen {
  position: relative;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.scenario-button__list {
  display: flex;
}

.scenario-button__list-title {
  font-size: 12px;
  font-weight: bold;
  color: #69c7ef;
  margin-bottom: 0px;
  padding: 2px 30px 2px 4px;
  background-color: #3c87b3ad;
  border-radius: 5px;
  background-color: #3a4b54c9;
}

.island-card {
  position: absolute;
  z-index: 100;
  width: 260px;
  top: 20px;
}

.island__user-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-align: start;
  margin-bottom: 10px;
  background-color: #3c87b3ad;
  padding: 10px 15px;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
  border: 5px solid #3c87b3ad;
  border-left: none;
}

.island__info {
  background-color: #3c87b3ad;
  padding: 10px 15px;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
  border: 5px solid #3c87b3ad;
  border-left: none;
}

.island__info-name {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-align: start;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.island__info-name > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  flex-shrink: 1;
}

.island__info-name-input {
  background: #2a3a42;
  border: 2px solid #5ca8d1;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 5px 10px;
  width: 100%;
  outline: none;
}

.island__info-name-input:focus {
  border-color: #69c7ef;
  box-shadow: 0 0 5px rgba(105, 199, 239, 0.3);
}

.island__info-name-edit {
  color: #69c7ef;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.island__info-name-edit:hover {
  opacity: 1;
}

.island__user-name h1 {
  margin: 0;
  padding: 0;
  font-size: 26px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.island__info-description {
  font-size: 14px;
  color: white;
  margin-bottom: 10px;
  text-align: start;
  background-color: #3a4b54c9;
  height: 125px;
  border-radius: 5px;
  padding: 8px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.description-display {
  height: 100%;
  width: 100%;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.description-placeholder {
  color: #aaa;
  font-style: italic;
}

.description-edit {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.island__info-description-textarea {
  background: transparent;
  border: 1px solid #5ca8d1;
  border-radius: 3px;
  color: white;
  font-size: 14px;
  padding: 5px;
  width: 210px;
  height: 100px;
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  overflow-y: auto;
  line-height: 1.4;
}

.island__info-description-textarea:focus {
  border-color: #69c7ef;
  box-shadow: 0 0 3px rgba(105, 199, 239, 0.3);
}

.description-edit-actions {
  display: flex;
  gap: 5px;
  height: 25px;
  align-items: center;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  height: 100%;
  display: flex;
  align-items: center;
}

.save-btn {
  color: #5cb85c;
}

.save-btn:hover {
  background-color: rgba(92, 184, 92, 0.2);
}

.cancel-btn {
  color: #d9534f;
}

.cancel-btn:hover {
  background-color: rgba(217, 83, 79, 0.2);
}

.scenario-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.scenario-button__container {
  display: flex;
  gap: 5px;
}

.scenario-button__container-left {
  width: 100%;
}

.scenario-button__container-right {
  display: flex;
  gap: 5px;
}

.scenario-button__container-right__count {
  background-color: #3a4b54c9;
  color: white;
  border-radius: 5px;
  padding: 5px;
  text-align: center;
  font-size: 15px;
  height: 35px;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
}

.scenario-button__container-right__icon {
  background-color: #3a4b54c9;
  color: white;
  border-radius: 20px;
  padding: 5px;
  text-align: center;
  font-size: 15px;
  height: 35px;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  color: #3687b3;
}

.scenario-button {
  background-color: #3a4b54c9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px;
  width: 185px;
  text-align: left;
  font-size: 15px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.scenario-button--add {
  color: #3687b3;
}

.scenario-button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.scenario-button:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
}

.brujiula {
  position: absolute;
  cursor: pointer;
  z-index: 100;
  right: 30px;
  bottom: 20px;
}

.island-preview {
  position: absolute;
}

.island-preview img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
