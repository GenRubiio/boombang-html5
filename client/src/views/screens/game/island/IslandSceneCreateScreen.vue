<template>
  <div id="island-scene-create-screen" class="island-scene-create-screen">
    <!-- Imagen de la brújula -->
    <img
      class="brujula"
      :src="asset_brujula_image"
      alt="Brújula"
      @load="handleImageLoad"
      @error="handleImageLoad"
      @click="goBackToIsland"
    />

    <div v-if="scenes.length">
      <!-- Vista previa de la escena seleccionada -->
      <div class="island-preview">
        <img
          :src="currentScene.url"
          :alt="`Escena ${currentIndex + 1}`"
          @load="handleImageLoad"
          @error="handleImageLoad"
        />
      </div>

      <!-- Controles de navegación y creación -->
      <div class="controls">
        <template v-if="step === 1">
          <div class="navigation">
            <div>
              <button class="control-btn" @click="prevScene">Anterior</button>
            </div>
            <div>
              <button class="control-btn" @click="nextScene">Siguiente</button>
            </div>
            <div>
              <button class="accept-btn" @click="goToStep(2)">Aceptar</button>
            </div>
          </div>
          <div class="navigation-label">
            <span class="label">Escoge la escena</span>
          </div>
        </template>
        <template v-else-if="step === 2">
          <div v-if="errorCreateScene" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="navigation">
            <div style="flex: 2">
              <input
                type="text"
                v-model="sceneName"
                placeholder="Nombre de la sala"
              />
            </div>
            <div>
              <button class="accept-btn" @click="createScene">
                Aceptar
              </button>
            </div>
          </div>
          <div class="navigation-label">
            <span class="label">Pon un nombre a tu sala</span>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="error-message-centered">
      <p>La isla no se ha encontrado o no tiene escenas.</p>
    </div>
  </div>
</template>

<script>
import socket from "../../../../sockets/socket";
import islandsData from "../../../../assets/game/islands/data.json";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../../enums/ResponseSocketsEnum";
import asset_brujula_image from "../../../../assets/game/basechat/brujula.webp";

// Importar todas las imágenes de escena
const sceneImageModules = import.meta.glob(
  "/src/assets/game/islands/**/scene*.png",
  { eager: true, import: "default" }
);

export default {
  name: "IslandSceneCreateScreen",
  props: {
    sceneData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      asset_brujula_image,
      scenes: [],
      currentIndex: 0,
      imagesToLoad: 0,
      loadedImages: 0,
      imagesLoaded: false,
      step: 1,
      sceneName: "",
      errorCreateScene: false,
      errorMessage: "",
    };
  },
  computed: {
    currentScene() {
      return this.scenes[this.currentIndex] || {};
    },
  },
  methods: {
    prevScene() {
      this.currentIndex =
        (this.currentIndex + this.scenes.length - 1) % this.scenes.length;
    },
    nextScene() {
      this.currentIndex = (this.currentIndex + 1) % this.scenes.length;
    },
    goToStep(step) {
      this.step = step;
    },
    createScene() {
      this.errorCreateScene = false;
      socket.emit(RequestSocketsEnum.PRIVATE_SCENE_CREATE, {
        island_id: this.sceneData.id,
        name: this.sceneName,
        type: this.currentScene.uuid,
      });
      socket.off(ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR);
      socket.on(ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR, (response) => {
        this.errorCreateScene = true;
        this.errorMessage = response.message;
      });
    },
    handleImageLoad() {
      if (this.imagesLoaded) return;
      this.loadedImages++;
      if (this.loadedImages >= this.imagesToLoad) {
        this.imagesLoaded = true;
        this.$emit("updateLoading", false);
      }
    },
    preloadImages() {
      const urls = this.scenes.map((s) => {
        const key = `/src/assets/${s.image}`;
        const url = sceneImageModules[key];
        if (!url) console.error(`Asset no encontrado: ${key}`);
        return url || "";
      });
      urls.push(this.asset_brujula_image);
      this.imagesToLoad = urls.length;
      urls.forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
        img.onload = this.handleImageLoad;
        img.onerror = this.handleImageLoad;
      });
    },
    goBackToIsland() {
      this.$emit("updateLoading", true);
      this.$emit("joinIsland", this.sceneData);
    },
    loadScenes() {
      const island = islandsData.find((i) => i.uuid == this.sceneData.type);
      if (island && island.scenes) {
        // Añadir URL de imagen importada a cada escena
        this.scenes = island.scenes.map((s) => ({
          ...s,
          url: sceneImageModules[`/src/assets/${s.image}`] || "",
        }));
      } else {
        console.error(
          `IslandSceneCreateScreen: Isla con tipo '${this.sceneData.type}' no encontrada o sin escenas.`
        );
        this.scenes = [];
      }
    },
  },
  created() {
    this.$emit("updateLoading", true);
    this.loadScenes();
    if (this.scenes.length) {
      this.preloadImages();
    } else {
      this.$emit("updateLoading", false);
    }
  },
  mounted() {
    this.$nextTick(() => {
      const images = this.$el.querySelectorAll("img");
      images.forEach((img) => {
        if (img.complete) this.handleImageLoad();
      });
    });
  },
};
</script>

<style scoped>
.error-message {
  color: #ffdc00;
  font-weight: bold;
  text-align: start;
  width: 100%;
  font-size: 15px;
  margin-bottom: -9px;
}

.navigation-label {
  box-sizing: border-box;
  background-color: #3a4b54c9;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  width: 100%;
  padding: 5px;
  text-align: left;
}

.navigation {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 5px;
}

.navigation div {
  flex: 1;
  text-align: center;
}

.navigation button {
  width: 100%;
}

.island-scene-create-screen {
  position: relative;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.brujula {
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

.controls {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 110;
  padding: 10px 10px 0;
  background-color: #3c87b3ad;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  flex-direction: column;
  width: 340px;
}

.control-btn,
.accept-btn {
  background-color: #3a4b54c9;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  z-index: 120;
  position: relative;
}

.control-btn:hover,
.accept-btn:hover {
  background-color: #3a4b54c9;
}

.label {
  color: #fff;
  font-size: 1.2em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

input[type="text"] {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.error-message-centered {
  color: red;
  text-align: center;
  margin-top: 50px;
}
</style>
