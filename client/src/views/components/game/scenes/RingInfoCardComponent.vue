<template>
  <div class="ring-info">
    <button class="close-button" @click="$emit('close-ring-info')">
      <i class="las la-times"></i>
    </button>
    <div class="ring-info__title">Información de los Guantes</div>
    <div class="ring-info__grid">
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_red_image" alt="Guante Rojo" />
        </div>
        <div class="ring-info__grid-item-name">Rojo<br />0 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_white_image" alt="Guante Blanco" />
        </div>
        <div class="ring-info__grid-item-name">Blanco<br />1.000 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_pink_image" alt="Guante Rosa" />
        </div>
        <div class="ring-info__grid-item-name">Rosa<br />10 Victoria</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_purple_image" alt="Guante Púrpura" />
        </div>
        <div class="ring-info__grid-item-name">
          Púrpura<br />2.000 Victorias
        </div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_orange_image" alt="Guante Naranja" />
        </div>
        <div class="ring-info__grid-item-name">Naranja<br />100 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_brown_image" alt="Guante Marrón" />
        </div>
        <div class="ring-info__grid-item-name">Marrón<br />5.000 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_green_image" alt="Guante Verde" />
        </div>
        <div class="ring-info__grid-item-name">Verde<br />250 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_black_image" alt="Guante Negro" />
        </div>
        <div class="ring-info__grid-item-name">Negro<br />10.000 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_blue_image" alt="Guante Azul" />
        </div>
        <div class="ring-info__grid-item-name">Azul<br />500 Victorias</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_gold_image" alt="Guante Dorado" />
        </div>
        <div class="ring-info__grid-item-name">
          Dorado<br />30.000 Victorias
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import asset_upper_red_image from "../../../../assets/game/ficha/uppercuts/red.png";
import asset_upper_pink_image from "../../../../assets/game/ficha/uppercuts/pink.png";
import asset_upper_orange_image from "../../../../assets/game/ficha/uppercuts/orange.png";
import asset_upper_green_image from "../../../../assets/game/ficha/uppercuts/green.png";
import asset_upper_blue_image from "../../../../assets/game/ficha/uppercuts/blue.png";
import asset_upper_white_image from "../../../../assets/game/ficha/uppercuts/white.png";
import asset_upper_purple_image from "../../../../assets/game/ficha/uppercuts/purple.png";
import asset_upper_brown_image from "../../../../assets/game/ficha/uppercuts/brown.png";
import asset_upper_black_image from "../../../../assets/game/ficha/uppercuts/black.png";
import asset_upper_gold_image from "../../../../assets/game/ficha/uppercuts/gold.png";

export default {
  data() {
    return {
      asset_upper_red_image,
      asset_upper_pink_image,
      asset_upper_orange_image,
      asset_upper_green_image,
      asset_upper_blue_image,
      asset_upper_white_image,
      asset_upper_purple_image,
      asset_upper_brown_image,
      asset_upper_black_image,
      asset_upper_gold_image,
    };
  },
  mounted() {},
  beforeUnmount() {},
  methods: {},
};
</script>

<style scoped>
.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 2px #0000004d;
  padding: 0;
  color: black;
}
.ring-info {
  width: 300px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: absolute;
  right: 220px;
  top: 10px;
  z-index: 2;
  pointer-events: auto;
}

.ring-info__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  margin-top: 15px;
  box-shadow: 0 3px #0000004d;
}

.ring-info__grid-item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ring-info__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.ring-info__grid-item-name {
  font-size: 12px;
  line-height: 14px;
  text-align: start;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.ring-info__grid-item {
  background-color: #fd9a03;
  padding: 0px 8px;
  border-radius: 5px;
  text-align: center;
  display: flex;
  color: white;
  height: 35px;
  position: relative;
}

.ring-info__grid-item p {
  color: white;
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 12px;
}
</style>
