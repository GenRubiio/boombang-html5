<template>
  <div class="coconut-info">
    <button class="close-button" @click="$emit('close-coconuts-info')">
      <i class="las la-times"></i>
    </button>
    <div class="coconut-info__title">{{ $t('scenes.coconuts_info.title') }}</div>
    <div class="coconut-info__grid">
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_coco_image" :alt="$t('scenes.coconuts_info.coco_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.coco_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: 0 }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_avispas_image" :alt="$t('scenes.coconuts_info.honeycomb_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.honeycomb_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: '2.500' }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_snowball_image" :alt="$t('scenes.coconuts_info.snowball_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">
          {{ $t('scenes.coconuts_info.snowball_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: 165 }) }}
        </div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_garbage_image" :alt="$t('scenes.coconuts_info.garbage_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.garbage_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: '3.335' }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_shoe_image" :alt="$t('scenes.coconuts_info.shoe_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.shoe_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: 335 }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_sandia_image" :alt="$t('scenes.coconuts_info.watermelon_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.watermelon_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: '5.000' }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_pie_image" :alt="$t('scenes.coconuts_info.pie_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.pie_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: 835 }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_yunque_image" :alt="$t('scenes.coconuts_info.anvil_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.anvil_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: '6.665' }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_maceta_image" :alt="$t('scenes.coconuts_info.pot_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.pot_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: 1665 }) }}</div>
      </div>
      <div class="coconut-info__grid-item">
        <div class="coconut-info__grid-item-image">
          <img :src="asset_coco_piano_image" :alt="$t('scenes.coconuts_info.piano_alt')" />
        </div>
        <div class="coconut-info__grid-item-name">{{ $t('scenes.coconuts_info.piano_name') }}<br />{{ $t('scenes.coconuts_info.coco_cost', { count: '10.000' }) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import asset_coco_coco_image from "@/assets/game/ficha/coconuts/coco.webp";
import asset_coco_snowball_image from "@/assets/game/ficha/coconuts/snowball.webp";
import asset_coco_shoe_image from "@/assets/game/ficha/coconuts/shoe.webp";
import asset_coco_pie_image from "@/assets/game/ficha/coconuts/pie.webp";
import asset_coco_maceta_image from "@/assets/game/ficha/coconuts/maceta.webp";
import asset_coco_avispas_image from "@/assets/game/ficha/coconuts/avispas.webp";
import asset_coco_garbage_image from "@/assets/game/ficha/coconuts/garbage.webp";
import asset_coco_sandia_image from "@/assets/game/ficha/coconuts/sandia.webp";
import asset_coco_yunque_image from "@/assets/game/ficha/coconuts/yunque.webp";
import asset_coco_piano_image from "@/assets/game/ficha/coconuts/piano.webp";

export default {
  data() {
    return {
      asset_coco_coco_image,
      asset_coco_snowball_image,
      asset_coco_shoe_image,
      asset_coco_pie_image,
      asset_coco_maceta_image,
      asset_coco_avispas_image,
      asset_coco_garbage_image,
      asset_coco_sandia_image,
      asset_coco_yunque_image,
      asset_coco_piano_image,
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
.coconut-info {
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

.coconut-info__title {
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

.coconut-info__grid-item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.coconut-info__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.coconut-info__grid-item-name {
  font-size: 12px;
  line-height: 14px;
  text-align: start;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.coconut-info__grid-item {
  background-color: #fd9a03;
  padding: 0px 8px;
  border-radius: 5px;
  text-align: center;
  display: flex;
  color: white;
  height: 35px;
  position: relative;
}

.coconut-info__grid-item p {
  color: white;
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 12px;
}
</style>
