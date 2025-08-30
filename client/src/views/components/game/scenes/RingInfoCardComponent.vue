<template>
  <div class="ring-info">
    <button class="close-button" @click="$emit('close-ring-info')">
      <i class="las la-times"></i>
    </button>
    <div class="ring-info__title">{{ $t('scenes.ring_info.title') }}</div>
    <div class="ring-info__grid">
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_red_image" :alt="$t('scenes.ring_info.red_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.red') }}<br />{{ $t('scenes.ring_info.victories', { count: 0 }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_white_image" :alt="$t('scenes.ring_info.white_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.white') }}<br />{{ $t('scenes.ring_info.victories', { count: '1.000' }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_pink_image" :alt="$t('scenes.ring_info.pink_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.pink') }}<br />{{ $t('scenes.ring_info.victories', { count: 10 }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_purple_image" :alt="$t('scenes.ring_info.purple_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">
          {{ $t('scenes.ring_info.purple') }}<br />{{ $t('scenes.ring_info.victories', { count: '2.000' }) }}
        </div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_orange_image" :alt="$t('scenes.ring_info.orange_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.orange') }}<br />{{ $t('scenes.ring_info.victories', { count: 100 }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_brown_image" :alt="$t('scenes.ring_info.brown_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.brown') }}<br />{{ $t('scenes.ring_info.victories', { count: '5.000' }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_green_image" :alt="$t('scenes.ring_info.green_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.green') }}<br />{{ $t('scenes.ring_info.victories', { count: 250 }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_black_image" :alt="$t('scenes.ring_info.black_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.black') }}<br />{{ $t('scenes.ring_info.victories', { count: '10.000' }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_blue_image" :alt="$t('scenes.ring_info.blue_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">{{ $t('scenes.ring_info.blue') }}<br />{{ $t('scenes.ring_info.victories', { count: 500 }) }}</div>
      </div>
      <div class="ring-info__grid-item">
        <div class="ring-info__grid-item-image">
          <img :src="asset_upper_gold_image" :alt="$t('scenes.ring_info.gold_glove_alt')" />
        </div>
        <div class="ring-info__grid-item-name">
          {{ $t('scenes.ring_info.gold') }}<br />{{ $t('scenes.ring_info.victories', { count: '30.000' }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import asset_upper_red_image from "@/assets/game/ficha/uppercuts/red.webp";
import asset_upper_pink_image from "@/assets/game/ficha/uppercuts/pink.webp";
import asset_upper_orange_image from "@/assets/game/ficha/uppercuts/orange.webp";
import asset_upper_green_image from "@/assets/game/ficha/uppercuts/green.webp";
import asset_upper_blue_image from "@/assets/game/ficha/uppercuts/blue.webp";
import asset_upper_white_image from "@/assets/game/ficha/uppercuts/white.webp";
import asset_upper_purple_image from "@/assets/game/ficha/uppercuts/purple.webp";
import asset_upper_brown_image from "@/assets/game/ficha/uppercuts/brown.webp";
import asset_upper_black_image from "@/assets/game/ficha/uppercuts/black.webp";
import asset_upper_gold_image from "@/assets/game/ficha/uppercuts/gold.webp";

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
  width: 320px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: absolute;
  right: 220px;
  top: 10px;
  z-index: 2;
  pointer-events: auto;
  box-shadow: 3px 3px #0000004d;
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
