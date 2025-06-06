<template>
  <div class="interactions-wrapper">
    <div class="container" :class="colorUser">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div class="upper-container">
        <img
          :src="items[selectedUpperIndex]"
          alt="upper"
          @click="handleMainClick"
        />
        <span class="plus-button" @click.stop="toggleContainer">+</span>
      </div>
      <div></div>
      <div></div>
      <div></div>
    </div>

    <div class="uppercuts-list-container" v-if="showContainer">
      <div class="uppercuts-list-container__list">
        <div
          v-for="(img, index) in items"
          :key="index"
          :class="{ active: index < activeCount }"
          @click="handleItemClick(index)"
        >
          <img :src="img" alt="upper-item" />
        </div>
      </div>
      <div class="uppercuts-list-container__close" @click="toggleContainer">x</div>
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
      items: [
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
      selectedUpperIndex: this.authUser.uppercut_selected,
      showContainer: false,
      activeCount: this.authUser.uppercut_level + 1,
    };
  },
  methods: {
    sendUppercut() {
      socket.emit(RequestSocketsEnum.SEND_UPPERCUT);
    },
    toggleContainer() {
      this.showContainer = !this.showContainer;
    },
    handleMainClick() {
      this.sendUppercut();
      if (this.showContainer) {
        this.showContainer = false;
      }
    },
    handleItemClick(index) {
      if (index < this.activeCount) {
        socket.emit("request:user_change_uppercut", {
          uppercut: index,
        });
        this.selectedUpperIndex = index;
        this.showContainer = false;
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
  margin-left: 54px;
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
</style>
