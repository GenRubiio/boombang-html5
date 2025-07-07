<template>
  <div id="island-create-screen" class="island-create-screen">
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
        :src="currentIsland"
        :alt="`Isla ${currentIndex + 1}`"
        @load="handleImageLoad"
        @error="handleImageLoad"
      />
    </div>

    <!-- Controles de navegación -->
    <div class="controls">
      <button class="control-btn" @click="prevIsland">Anterior</button>
      <span class="label">Escoge el fondo</span>
      <button class="control-btn" @click="nextIsland">Siguiente</button>
      <button class="accept-btn" @click="acceptIsland">Aceptar</button>
    </div>
  </div>
</template>

<script>
import asset_brujula_image from "../../../../assets/game/basechat/brujula.webp";
import asset_island1_image from "../../../../assets/game/islands/isla1.png";
import asset_island2_image from "../../../../assets/game/islands/isla2.png";
import asset_island3_image from "../../../../assets/game/islands/isla3.png";
import asset_island4_image from "../../../../assets/game/islands/isla4.png";
import asset_island5_image from "../../../../assets/game/islands/isla5.png";

export default {
  data() {
    return {
      islands: [
        asset_island1_image,
        asset_island2_image,
        asset_island3_image,
        asset_island4_image,
        asset_island5_image,
      ],
      asset_brujula_image,
      currentIndex: 0,
      imagesToLoad: 6, // 5 islas + 1 brújula
      loadedImages: 0,
      imagesLoaded: false,
    };
  },
  computed: {
    currentIsland() {
      return this.islands[this.currentIndex];
    },
  },
  methods: {
    prevIsland() {
      this.currentIndex =
        (this.currentIndex + this.islands.length - 1) % this.islands.length;
    },
    nextIsland() {
      this.currentIndex = (this.currentIndex + 1) % this.islands.length;
    },
    acceptIsland() {
      this.$emit("islandSelected", this.currentIsland);
    },

    handleImageLoad() {
      if (this.imagesLoaded) return;

      this.loadedImages++;

      // Solo emitir cuando todas las imágenes estén cargadas
      if (this.loadedImages >= this.imagesToLoad) {
        this.imagesLoaded = true;
        this.$emit("updateLoading", false);
      }
    },

    // Precarga de imágenes en segundo plano
    preloadImages() {
      const allImages = [...this.islands, this.asset_brujula_image];

      allImages.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = this.handleImageLoad;
        img.onerror = this.handleImageLoad;
      });
    },

    goBackToLobby() {
      this.$emit("updateLoading", true);
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
    },
  },
  created() {
    this.$emit("updateLoading", true);
    this.preloadImages();
  },
  mounted() {
    // Forzar verificación de imágenes ya cargadas
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
.island-create-screen {
  position: relative;
  background-color: #f0f0f0;
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

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 110; /* Encima de otros elementos */
}

.control-btn,
.accept-btn {
  background-color: #0057e7;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  z-index: 120; /* Máxima prioridad */
  position: relative; /* Necesario para z-index */
}

.control-btn:hover,
.accept-btn:hover {
  background-color: #0040a0;
}

.label {
  color: #fff;
  font-size: 1.2em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}
</style>
