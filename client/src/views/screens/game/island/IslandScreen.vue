<template>
  <div id="island-screen" class="island-screen">
    <div class="island-card">
      <div class="island__user-name">
        <h1>{{ sceneData.user.username }}</h1>
      </div>
      <div class="island__info">
        <div class="island__info-name">
          {{ sceneData.name }}
        </div>
        <div class="island__info-description">
          {{ sceneData.description }}
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
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}

.island__user-name h1 {
  margin: 0;
  padding: 0;
  font-size: 26px;
  font-weight: bold;
  color: white;
}

.island__info-description {
  font-size: 14px;
  color: white;
  margin-bottom: 10px;
  text-align: start;
  background-color: #3a4b54c9;
  height: 125px;
  overflow-y: auto;
  border-radius: 5px;
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
  width: 100%;
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
