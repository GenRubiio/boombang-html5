<template>
  <div id="island-screen" class="island-screen">
    <!-- Botones de escenario -->
    <div class="scenario-buttons">
      <button
        v-for="n in 5"
        :key="n"
        class="scenario-button"
        @click="handleSceneAction(sceneData.scenes && sceneData.scenes[n - 1])"
      >
        {{
          sceneData.scenes && sceneData.scenes[n - 1]
            ? sceneData.scenes[n - 1].name
            : "Añadir escenario"
        }}
      </button>
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
import socket from "../../../../sockets/socket.js";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";
import asset_brujula_image from "../../../../assets/game/basechat/brujula.webp";

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
    };
  },
  computed: {
    islandImage() {
      if (!this.sceneData || !this.sceneData.type) {
        return "";
      }
      return new URL(
        `../../../../assets/game/islands/isla${this.sceneData.type}.png`,
        import.meta.url
      ).href;
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
      if (scene) {
        console.log("Acción para el escenario existente:", scene);
        socket.emit(RequestSocketsEnum.JOIN_PRIVATE_SCENE, {
          sceneId: scene.id,
          password: null, // Aquí puedes manejar la contraseña si es necesario
        });
      } else {
        console.log("Añadir nuevo escenario");
        this.$emit("createIslandScene", this.sceneData);
      }
    },
  },
  created() {
    this.$emit("updateLoading", true);
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

.scenario-buttons {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 100;
}

.scenario-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.scenario-button:hover {
  background-color: #45a049;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
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
