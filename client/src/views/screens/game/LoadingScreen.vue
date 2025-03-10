<template>
  <div id="loading" class="loading-screen">
    <div class="loading-screen__container">
      <img
        :src="background"
        alt="background"
        class="loading-screen__container-background"
      />
      <div class="loading-screen__container-motto">
        <img :src="motto_water" alt="motto_water" />
      </div>
      <div class="loading-screen__container-fish">
        <img :src="fish" alt="motto_water" />
      </div>
      <div class="loading-screen__container-text">
        <div class="spinner"></div>
        <div class="loading-text">Cargando...</div>
      </div>
    </div>
  </div>
</template>

<script>
import background from "../../../assets/game/loading/background.png";
import motto_water from "../../../assets/game/loading/motto-water.webp";
import fish from "../../../assets/game/loading/fish.webp";

export default {
  data() {
    return {
      background,
      motto_water,
      fish,
    };
  },
};
</script>

<style scoped>
.loading-screen {
  height: 100%;
  width: 100%;
  background-color: black;
  color: white;
  position: absolute;
  z-index: 9999;
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
  width: calc(100% + 200px);
  position: absolute;
  bottom: 500px;
  left: 0;
  z-index: 2;
}

.loading-screen__container-motto img {
  position: absolute;
  left: 0;
  width: 200px;
  animation: motoAnimation 10s linear infinite;
}

@keyframes motoAnimation {
  0% {
    left: -260px;
  }
  100% {
    left: calc(100% - 200px);
  }
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
