<template>
  <div class="button-top__container">
    <img
      class="button-top__container-img-left"
      :src="rasta_top_button_image"
      alt="Rasta"
    />
    <img
      class="button-top__container-img-right"
      :src="lilian_top_button_image"
      alt="Lilian"
    />
    <div class="button-top__container-title">Crear tu Cuenta</div>
    <div class="button-top__container-text">Registrarse y eligir Personaje</div>
  </div>
</template>

<script>
import lilian_top_button_image from "../../../assets/game/auth/lilian-top-button.png";
import rasta_top_button_image from "../../../assets/game/auth/rasta-top-button.png";

export default {
  data() {
    return {
      lilian_top_button_image,
      rasta_top_button_image,
    };
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped>
.button-top__container {
  position: relative;
  font-size: 26px;
  display: inline-block;
  padding: 5px 20px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid #0072c6;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: linear-gradient(to bottom, #0072c6 0%, #003d6c 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  width: 310px;
  box-sizing: border-box;
  margin-bottom: 5px;

  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.button-top__container:hover {
  background: linear-gradient(to bottom, #ffd167 0%, #ff9d0a 100%);
}

.button-top__container-title {
  height: 24px;
  font-size: 22px;
  font-weight: bold;
  color: white;
}

.button-top__container-text {
  font-size: 16px;
  font-weight: bold;
  color: #0072c6;
}

.button-top__container-img-left {
  position: absolute;
  top: -65px;
  left: -31px;
}

.button-top__container-img-right {
  position: absolute;
  top: -64px;
  right: -13px;
}

@keyframes levitation {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(2deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

.button-top__container-img-left {
  animation: levitation 3s ease-in-out infinite;
}

.button-top__container-img-right {
  animation: levitation 3s ease-in-out infinite;
  animation-delay: 1.5s;
}
</style>
