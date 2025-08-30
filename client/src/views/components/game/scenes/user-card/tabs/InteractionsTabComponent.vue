<template>
  <div class="interactions-wrapper">
    <div class="container" :class="colorUser">
      <div class="container__item">
        <img :src="asset_kiss_image" :alt="$t('user_card.interactions.kiss')" />
      </div>
      <div class="container__item">
        <img :src="asset_drink_image" :alt="$t('user_card.interactions.drink')" />
      </div>
      <div class="container__item">
        <img :src="asset_rose_image" :alt="$t('user_card.interactions.rose')" />
      </div>
      <div></div>
      <div class="upper-container">
        <img
          :src="uppercuts[selectedUpperIndex]"
          :alt="$t('user_card.interactions.upper')"
          @click="handleUpperClick"
        />
      </div>
      <div class="coco-container">
        <img
          :src="coconuts[selectedCocoIndex]"
          :alt="$t('user_card.interactions.coco')"
          @click="handleCocoClick"
        />
      </div>
      <div></div>
      <div></div>
    </div>
    <span
      class="uppercuts__plus-button"
      :class="colorUser"
      @click.stop="toggleContainerUppers"
      >+</span
    >
    <span
      class="coconuts__plus-button"
      :class="colorUser"
      @click.stop="toggleContainerCocos"
      >+</span
    >

    <div class="uppercuts-list-container" v-if="showContainerUppers">
      <div class="uppercuts-list-container__list">
        <div
          v-for="(img, index) in uppercuts"
          :key="index"
          :class="{ active: index < activeUpperCount }"
          @click="handleUpperItemClick(index)"
        >
          <img :src="img" :alt="$t('user_card.interactions.upper_item')" />
        </div>
      </div>
      <div
        class="uppercuts-list-container__close"
        @click="toggleContainerUppers"
      >
        <i class="las la-times-circle"></i>
      </div>
    </div>
    <div class="coconuts-list-container" v-if="showContainerCocos">
      <div class="coconuts-list-container__list">
        <div
          v-for="(img, index) in coconuts"
          :key="index"
          :class="{ active: index < activeCocoCount }"
          @click="handleCocoItemClick(index)"
        >
          <img :src="img" :alt="$t('user_card.interactions.coco_item')" />
        </div>
      </div>
      <div class="coconuts-list-container__close" @click="toggleContainerCocos">
        <i class="las la-times-circle"></i>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_red_upper_image from "@/assets/game/ficha/uppercuts/red.webp";
import asset_pink_upper_image from "@/assets/game/ficha/uppercuts/pink.webp";
import asset_orange_upper_image from "@/assets/game/ficha/uppercuts/orange.webp";
import asset_green_upper_image from "@/assets/game/ficha/uppercuts/green.webp";
import asset_blue_upper_image from "@/assets/game/ficha/uppercuts/blue.webp";
import asset_white_upper_image from "@/assets/game/ficha/uppercuts/white.webp";
import asset_purple_upper_image from "@/assets/game/ficha/uppercuts/purple.webp";
import asset_brown_upper_image from "@/assets/game/ficha/uppercuts/brown.webp";
import asset_black_upper_image from "@/assets/game/ficha/uppercuts/black.webp";
import asset_gold_upper_image from "@/assets/game/ficha/uppercuts/gold.webp";

import asset_cocoCoconutImage from "@/assets/game/ficha/coconuts/coco.webp";
import asset_snowballCoconutImage from "@/assets/game/ficha/coconuts/snowball.webp";
import asset_shoeCoconutImage from "@/assets/game/ficha/coconuts/shoe.webp";
import asset_pieCoconutImage from "@/assets/game/ficha/coconuts/pie.webp";
import asset_macetaCoconutImage from "@/assets/game/ficha/coconuts/maceta.webp";
import asset_avispasCoconutImage from "@/assets/game/ficha/coconuts/avispas.webp";
import asset_garbageCoconutImage from "@/assets/game/ficha/coconuts/garbage.webp";
import asset_sandiaCoconutImage from "@/assets/game/ficha/coconuts/sandia.webp";
import asset_yunqueCoconutImage from "@/assets/game/ficha/coconuts/yunque.webp";
import asset_pianoCoconutImage from "@/assets/game/ficha/coconuts/piano.webp";

import asset_kiss_image from "@/assets/game/ficha/interactions/kiss.webp";
import asset_drink_image from "@/assets/game/ficha/interactions/drink.webp";
import asset_rose_image from "@/assets/game/ficha/interactions/rose.webp";

export default {
  props: {
    selectedUser: {
      type: Object,
      required: true,
    },
    authUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      asset_kiss_image,
      asset_drink_image,
      asset_rose_image,
      uppercuts: [
        asset_red_upper_image,
        asset_pink_upper_image,
        asset_orange_upper_image,
        asset_green_upper_image,
        asset_blue_upper_image,
        asset_white_upper_image,
        asset_purple_upper_image,
        asset_brown_upper_image,
        asset_black_upper_image,
        asset_gold_upper_image,
      ],
      coconuts: [
        asset_cocoCoconutImage,
        asset_snowballCoconutImage,
        asset_shoeCoconutImage,
        asset_pieCoconutImage,
        asset_macetaCoconutImage,
        asset_avispasCoconutImage,
        asset_garbageCoconutImage,
        asset_sandiaCoconutImage,
        asset_yunqueCoconutImage,
        asset_pianoCoconutImage,
      ],
      selectedUpperIndex: this.authUser.uppercut_selected,
      selectedCocoIndex: this.authUser.coconut_selected,
      showContainerUppers: false,
      showContainerCocos: false,
      activeUpperCount: this.authUser.uppercut_level + 1,
      activeCocoCount: this.authUser.coconut_level + 1,
    };
  },
  methods: {
    toggleContainerUppers() {
      if (this.showContainerCocos) {
        this.showContainerCocos = false;
      }
      this.showContainerUppers = !this.showContainerUppers;
    },
    toggleContainerCocos() {
      if (this.showContainerUppers) {
        this.showContainerUppers = false;
      }
      this.showContainerCocos = !this.showContainerCocos;
    },
    handleUpperClick() {
      socket.emit(RequestSocketsEnum.SEND_UPPERCUT);
      if (this.showContainerUppers) {
        this.showContainerUppers = false;
      }
    },
    handleCocoClick() {
      socket.emit(RequestSocketsEnum.SEND_COCONUT);
      if (this.showContainerCocos) {
        this.showContainerCocos = false;
      }
    },
    handleUpperItemClick(index) {
      if (index < this.activeUpperCount) {
        socket.emit(RequestSocketsEnum.USER_CHANGE_UPPERCUT, {
          uppercut: index,
        });
        this.selectedUpperIndex = index;
        this.showContainerUppers = false;
      }
    },
    handleCocoItemClick(index) {
      if (index < this.activeCocoCount) {
        socket.emit(RequestSocketsEnum.USER_CHANGE_COCONUT, {
          coconut: index,
        });
        this.selectedCocoIndex = index;
        this.showContainerCocos = false;
      }
    },
  },
  computed: {
    colorUser() {
      if (this.selectedUser.ficha_color == "user") {
        return this.selectedUser.is_selected ? "selected" : "user";
      }
      return this.selectedUser.ficha_color;
    },
  },
};
</script>

<style scoped>
.interactions-wrapper {
  position: relative;
}

.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
  height: 90px;
  position: relative;
  z-index: 1;
  gap: 8px;
  padding: 0 5px;
}

.container div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container img {
  max-width: 100%;
  height: auto;
  display: block;
}

.container div:hover img {
  opacity: 0.5;
  transition: opacity 0.1s ease-in-out;
}

.upper-container {
  display: flex;
  align-items: center;
  position: relative;
}

.upper-container img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

.uppercuts__plus-button {
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  position: absolute;
  top: 60px;
  left: 36px;
  color: black;
  z-index: 1;
}

.coconuts__plus-button {
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  position: absolute;
  top: 60px;
  left: 82px;
  color: black;
  z-index: 1;
}

.uppercuts-list-container {
  position: absolute;
  width: 240px;
  top: 13px;
  left: -260px;
  background-color: white;
  border-radius: 5px;
  display: flex;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  box-sizing: border-box;
}

.uppercuts-list-container__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  width: 210px;
  height: 84px;
}

.uppercuts-list-container__list div {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  overflow: hidden;
}

.uppercuts-list-container__list img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.uppercuts-list-container__list div {
  opacity: 0.5;
}

.uppercuts-list-container__list div.active {
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  opacity: 1;
}

.uppercuts-list-container__list div.active:hover img {
  background-color: #f0f0f0;
}

.uppercuts-list-container__close {
  position: absolute;
  top: -4px;
  right: 2px;
  cursor: pointer;
  font-weight: bold;
  font-size: 22px;
  color: black;
}

.coco-container {
  display: flex;
  align-items: center;
  position: relative;
}

.coco-container img {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

.coconuts-list-container {
  position: absolute;
  width: 240px;
  top: 13px;
  left: -260px;
  background-color: white;
  border-radius: 5px;
  display: flex;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  box-sizing: border-box;
}

.coconuts-list-container__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  width: 210px;
  height: 84px;
}

.coconuts-list-container__list div {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  overflow: hidden;
}

.coconuts-list-container__list img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.coconuts-list-container__list div {
  opacity: 0.5;
}

.coconuts-list-container__list div.active {
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  opacity: 1;
}

.coconuts-list-container__list div.active:hover img {
  background-color: #f0f0f0;
}

.coconuts-list-container__close {
  position: absolute;
  top: -4px;
  right: 2px;
  cursor: pointer;
  font-weight: bold;
  font-size: 22px;
  color: black;
}

/********************************************************************* */
.uppercuts__plus-button.selected,
.coconuts__plus-button.selected {
  color: #045d03;
}

.uppercuts__plus-button.admin,
.coconuts__plus-button.admin {
  color: #f59200;
}

.uppercuts__plus-button.vip,
.coconuts__plus-button.vip {
  color: #420143;
}

.uppercuts__plus-button.beta,
.coconuts__plus-button.beta {
  color: #08d1d1;
}
</style>
