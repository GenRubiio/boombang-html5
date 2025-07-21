<template>
  <div class="interactions-wrapper">
    <div class="container" :class="colorUser">
      <div class="container__item">
        <img :src="asset_kiss_image" alt="kiss" />
      </div>
      <div class="container__item">
        <img :src="asset_drink_image" alt="drink" />
      </div>
      <div class="container__item">
        <img :src="asset_rose_image" alt="rose" />
      </div>
      <div></div>
      <div class="upper-container">
        <img
          :src="uppercuts[selectedUpperIndex]"
          alt="upper"
          @click="handleUpperClick"
        />
        <span class="plus-button" @click.stop="toggleContainerUppers">+</span>
      </div>
      <div class="coco-container">
        <img
          :src="coconuts[selectedCocoIndex]"
          alt="coco"
          @click="handleCocoClick"
        />
        <span class="plus-button" @click.stop="toggleContainerCocos">+</span>
      </div>
      <div></div>
      <div></div>
    </div>

    <div class="uppercuts-list-container" v-if="showContainerUppers">
      <div class="uppercuts-list-container__list">
        <div
          v-for="(img, index) in uppercuts"
          :key="index"
          :class="{ active: index < activeUpperCount }"
          @click="handleUpperItemClick(index)"
        >
          <img :src="img" alt="upper-item" />
        </div>
      </div>
      <div
        class="uppercuts-list-container__close"
        @click="toggleContainerUppers"
      >
        x
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
          <img :src="img" alt="coco-item" />
        </div>
      </div>
      <div class="coconuts-list-container__close" @click="toggleContainerCocos">
        x
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../../../../sockets/socket";
import RequestSocketsEnum from "../../../../../../enums/RequestSocketsEnum";
import asset_red_upper_image from "../../../../../../assets/game/ficha/uppercuts/red.png";
import asset_pink_upper_image from "../../../../../../assets/game/ficha/uppercuts/pink.png";
import asset_orange_upper_image from "../../../../../../assets/game/ficha/uppercuts/orange.png";
import asset_green_upper_image from "../../../../../../assets/game/ficha/uppercuts/green.png";
import asset_blue_upper_image from "../../../../../../assets/game/ficha/uppercuts/blue.png";
import asset_white_upper_image from "../../../../../../assets/game/ficha/uppercuts/white.png";
import asset_purple_upper_image from "../../../../../../assets/game/ficha/uppercuts/purple.png";
import asset_brown_upper_image from "../../../../../../assets/game/ficha/uppercuts/brown.png";
import asset_black_upper_image from "../../../../../../assets/game/ficha/uppercuts/black.png";
import asset_gold_upper_image from "../../../../../../assets/game/ficha/uppercuts/gold.png";

import asset_cocoCoconutImage from "../../../../../../assets/game/ficha/coconuts/coco.png";
import asset_snowballCoconutImage from "../../../../../../assets/game/ficha/coconuts/snowball.png";
import asset_shoeCoconutImage from "../../../../../../assets/game/ficha/coconuts/shoe.png";
import asset_pieCoconutImage from "../../../../../../assets/game/ficha/coconuts/pie.png";
import asset_macetaCoconutImage from "../../../../../../assets/game/ficha/coconuts/maceta.png";
import asset_avispasCoconutImage from "../../../../../../assets/game/ficha/coconuts/avispas.png";
import asset_garbageCoconutImage from "../../../../../../assets/game/ficha/coconuts/garbage.png";
import asset_sandiaCoconutImage from "../../../../../../assets/game/ficha/coconuts/sandia.png";
import asset_yunqueCoconutImage from "../../../../../../assets/game/ficha/coconuts/yunque.png";
import asset_pianoCoconutImage from "../../../../../../assets/game/ficha/coconuts/piano.png";

import asset_kiss_image from "../../../../../../assets/game/ficha/interactions/kiss.png";
import asset_drink_image from "../../../../../../assets/game/ficha/interactions/drink.png";
import asset_rose_image from "../../../../../../assets/game/ficha/interactions/rose.png";

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
      if (this.selectedUser.is_admin) return "admin";
      if (this.selectedUser.is_vip) return "vip";
      return this.selectedUser.is_selected ? "selected" : "user";
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
  z-index: 1;
  gap: 8px;
  padding: 0 5px;
}

.container__item{

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

.plus-button {
  margin-left: 44px;
  margin-top: 15px;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  position: absolute;
}

.uppercuts-list-container {
  position: absolute;
  width: 230px;
  top: 13px;
  left: -250px;
  background-color: white;
  border-radius: 5px;
  display: flex;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.uppercuts-list-container__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  margin-right: 15px;
}

.uppercuts-list-container__list div {
  display: flex;
  justify-content: center;
  align-items: center;
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
  top: 4px;
  right: 6px;
  cursor: pointer;
  font-weight: bold;
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
  width: 230px;
  top: 13px;
  left: -250px;
  background-color: white;
  border-radius: 5px;
  display: flex;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.coconuts-list-container__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  margin-right: 15px;
}

.coconuts-list-container__list div {
  display: flex;
  justify-content: center;
  align-items: center;
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
  top: 4px;
  right: 6px;
  cursor: pointer;
  font-weight: bold;
}
</style>
