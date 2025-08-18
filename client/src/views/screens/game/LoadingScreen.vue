<template>
  <div id="loading" class="loading-screen">
    <div class="loading-screen__container">
      <img
        :src="asset_background_image"
        alt="background"
        class="loading-screen__container-background"
      />
      <div class="loading-screen__container-motto">
        <img :src="asset_motto_water_image" alt="motto_water" />
      </div>
      <div class="loading-screen__container-fish">
        <img :src="asset_fish_image" alt="motto_water" />
      </div>
      <div class="loading-screen__container-text">
        <div class="spinner"></div>
        <div class="loading-text">Cargando...</div>
      </div>
    </div>
  </div>
</template>

<script>
import asset_background_image from "@/assets/game/loading/background.webp";
import asset_motto_water_image from "@/assets/game/loading/motto-water.webp";
import asset_fish_image from "@/assets/game/loading/fish.webp";

export default {
  data() {
    return {
      asset_background_image,
      asset_motto_water_image,
      asset_fish_image,
    };
  },
};
</script>

<style scoped>
.loading-screen {
  height: 100%;
  width: 100%;
  background: linear-gradient(to bottom, #92dff3 0%, #009fe3 50%, #007ac1 100%);
  color: white;
  position: absolute;
  z-index: 9999;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.loading-screen__container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.loading-screen__container-background {
  width: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.loading-screen__container-motto {
  width: 100%;
  position: absolute;
  bottom: 500px;
  left: -200px;
  z-index: 2;
}

.loading-screen__container-motto img {
  position: absolute;
  left: 0;
}

.loading-screen__container-fish {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
}

.loading-screen__container-text {
  width: 100%;
  position: absolute;
  bottom: 15px;
  left: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 5px solid #ccc;
  border-top-color: #003d6c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  padding-left: 10px;
  font-size: 27px;
  font-weight: bold;
}
</style>
