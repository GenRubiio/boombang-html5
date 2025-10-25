<template>
  <div id="island-create-screen" class="island-create-screen">
    <!-- Imagen de la brújula -->
    <img
      class="brujula"
      :class="{ disabled: isCreating }"
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
      <template v-if="step === 1">
        <div class="navigation">
          <div>
            <button class="control-btn" @click="prevIsland">
              {{ $t("common.previous") }}
            </button>
          </div>
          <div>
            <button class="control-btn" @click="nextIsland">
              {{ $t("common.next") }}
            </button>
          </div>
          <div>
            <button class="accept-btn" @click="goToStep(2)">
              {{ $t("common.accept") }}
            </button>
          </div>
        </div>
        <div class="navigation-label">
          <span class="label">{{ $t("island_create.choose_background") }}</span>
        </div>
      </template>
      <template v-if="step === 2">
        <div v-if="errorCreateIsland" class="error-message">
          {{ errorMessage }}
        </div>
        <div class="navigation">
          <div style="flex: 2" @dragover.prevent @drop.prevent>
            <input
              type="text"
              v-model="islandName"
              :placeholder="$t('island_create.island_name_placeholder')"
            />
          </div>
          <div>
            <button class="accept-btn" @click="createIsland" :disabled="isCreating">
              {{ $t("common.accept") }}
            </button>
          </div>
        </div>
        <div class="navigation-label">
          <span class="label">{{ $t("island_create.set_island_name") }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import asset_brujula_image from "@/assets/game/basechat/brujula.webp";
import asset_island1_image from "@/assets/game/islands/isla1.webp";
import asset_island2_image from "@/assets/game/islands/isla2.webp";
//import asset_island3_image from "@/assets/game/islands/isla3.webp";
//import asset_island4_image from "@/assets/game/islands/isla4.webp";
//import asset_island5_image from "@/assets/game/islands/isla5.webp";

export default {
  data() {
    return {
      islands: [
        asset_island1_image,
        asset_island2_image,
        //asset_island3_image,
        //asset_island4_image,
        //asset_island5_image,
      ],
      asset_brujula_image,
      currentIndex: 0,
      imagesToLoad: 3, // 5 islas + 1 brújula
      loadedImages: 0,
      imagesLoaded: false,
      step: 1,
      islandName: "",
      errorCreateIsland: false,
      errorMessage: "",
      isCreating: false,
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
    goToStep(step) {
      this.step = step;
    },
    createIsland() {
      if (this.isCreating) return;
      this.isCreating = true;
      this.errorCreateIsland = false;
      socket.emit(RequestSocketsEnum.ISLAND_CREATE, {
        name: this.islandName,
        type: this.currentIndex + 1, // Asumiendo que el tipo de isla es el índice + 1
      });
      socket.off(ResponseSocketsEnum.ISLAND_CREATE_ERROR);
      socket.on(ResponseSocketsEnum.ISLAND_CREATE_ERROR, (response) => {
        let message = response.message;
        this.errorCreateIsland = true;
        this.errorMessage = message;
        this.isCreating = false;
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
      const allImages = [...this.islands, this.asset_brujula_image];

      allImages.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = this.handleImageLoad;
        img.onerror = this.handleImageLoad;
      });
    },
    goBackToLobby() {
      if (this.isCreating) return;
      this.$emit("updateLoading", true);
      this.$emit("exitLobby");
    },
  },
  created() {
    this.$emit("updateLoading", true);
    this.preloadImages();
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

.island-create-screen {
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

.brujula.disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.accept-btn:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
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
</style>
