<template>
  <div class="container" :class="colorUser">
    <div class="container__userinfo-data">
      <div class="container__userinfo-data__title">
        {{ currentView.title }}
      </div>
      <div
        v-for="stat in currentView.stats"
        :key="stat.key"
        class="container__userinfo-data__data-container"
      >
        <div class="container__userinfo-data__data-container__count">
          {{ selectedUser[stat.key] }}
        </div>
        <div class="container__userinfo-data__data-container__title">
          {{ stat.label }}
        </div>
      </div>
      <button
        v-if="currentView.id === 3"
        @click="$emit('open-ring-info')"
        class="info-button"
      >
        <i class="las la-question"></i>
      </button>
      <button
        v-if="currentView.id === 4"
        @click="$emit('open-coconuts-info')"
        class="info-button"
      >
        <i class="las la-question"></i>
      </button>
    </div>
    <div class="container__userinfo-right">
      <img :src="currentImage" :alt="currentView.title" />
    </div>
    <button class="container__cycle-button" @click="cycleStatistic">
      <i class="la la-chevron-right"></i>
    </button>
  </div>
</template>

<script>
import asset_stat_ring_image from "../../../../../../assets/game/ficha/statistics/ring.png";
import asset_stat_coconut_caught_image from "../../../../../../assets/game/ficha/statistics/cocos_locos.png";

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

export default {
  props: {
    selectedUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
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
      currentViewIndex: 0,
      statisticsViews: [
        {
          id: 1,
          title: "Uppercuts",
          stats: [
            { key: "uppercuts_send", label: "Enviados" },
            { key: "uppercuts_received", label: "Recibidos" },
          ],
        },
        {
          id: 2,
          title: "Coconuts",
          stats: [
            { key: "coconuts_sent", label: "Enviados" },
            { key: "coconuts_received", label: "Recibidos" },
          ],
        },
        {
          id: 3,
          title: "Rings",
          image: asset_stat_ring_image,
          stats: [{ key: "rings_won", label: "Ganados" }],
        },
        {
          id: 4,
          title: "Cocos Locos",
          image: asset_stat_coconut_caught_image,
          stats: [{ key: "coconuts_caught", label: "Atrapados" }],
        },
      ],
    };
  },
  methods: {
    cycleStatistic() {
      this.currentViewIndex =
        (this.currentViewIndex + 1) % this.statisticsViews.length;
    },
  },
  computed: {
    currentView() {
      return this.statisticsViews[this.currentViewIndex];
    },
    currentImage() {
      const view = this.currentView;
      if (view.id === 1) {
        return this.uppercuts[this.selectedUser.uppercut_level];
      }
      if (view.id === 2) {
        return this.coconuts[this.selectedUser.coconut_level];
      }
      return view.image;
    },
    colorUser() {
      if (this.selectedUser.ficha_color == "user") {
        return this.selectedUser.is_selected ? "selected" : "user";
      }
      return this.selectedUser.ficha_color;
    },
  },
  mounted() {
    if (import.meta.env.VITE_APP_ENV === "local") {
      console.log("User data received in component:", this.selectedUser);
    }
  },
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
  height: 90px;
  position: relative;
  z-index: 1;
  display: flex;
}

.container__userinfo-data {
  padding: 8px;
  width: 135px;
  box-sizing: border-box;
}

.container__userinfo-right {
  padding-top: 15px;
  width: calc(100% - 135px);
  padding-right: 2px;
  padding-left: 2px;
  box-sizing: border-box;
  max-height: 55px;
}

.container__userinfo-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.container__userinfo-data__title {
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  color: white;
  padding: 0 3px;
  border-radius: 5px;
  text-align: start;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-button {
  border: none;
  color: white;
  font-size: 17px;
  cursor: pointer;
  padding: 0 5px;
  border-radius: 5px;
  background: #005491;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  margin-left: 88px;
  height: 17px;
  width: 30px;
  font-size: 11px;
}

.container__userinfo-data__data-container {
  width: 100%;
  margin-top: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.container__userinfo-data__data-container__count {
  font-size: 11px;
  font-weight: bold;
  color: white;
  padding: 0 5px;
  border-radius: 5px;
  text-align: center;
  height: 17px;
  width: 33px;
}

.container__userinfo-data__data-container__title {
  font-size: 11px;
  font-weight: bold;
  color: white;
  padding: 0 5px;
  border-radius: 5px;
  text-align: start;
  height: 17px;
  width: 63px;
}

.container__cycle-button {
  position: absolute;
  bottom: 1px;
  right: 1px;
  background-color: white;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container__cycle-button:focus {
  outline: none;
}

/********************************************************************* */
.container.user .container__userinfo-data__title {
  background-color: #005491;
}

.container.selected .container__userinfo-data__title {
  background-color: #045d03;
}

.container.admin .container__userinfo-data__title {
  background-color: #f59200;
}

.container.vip .container__userinfo-data__title {
  background-color: #420143;
}

.container.beta .container__userinfo-data__title {
  background-color: #08d1d1;
}

.container.user .container__userinfo-data__data-container__count {
  background-color: #005491;
}

.container.selected .container__userinfo-data__data-container__count {
  background-color: #045d03;
}

.container.admin .container__userinfo-data__data-container__count {
  background-color: #f59200;
}

.container.vip .container__userinfo-data__data-container__count {
  background-color: #420143;
}

.container.beta .container__userinfo-data__data-container__count {
  background-color: #08d1d1;
}

.container.user .container__userinfo-data__data-container__title {
  background-color: #005491;
}

.container.selected .container__userinfo-data__data-container__title {
  background-color: #045d03;
}

.container.admin .container__userinfo-data__data-container__title {
  background-color: #f59200;
}

.container.vip .container__userinfo-data__data-container__title {
  background-color: #420143;
}

.container.beta .container__userinfo-data__data-container__title {
  background-color: #08d1d1;
}

.container.user .container__cycle-button {
  background-color: #005491;
}

.container.selected .container__cycle-button {
  background-color: #045d03;
}

.container.admin .container__cycle-button {
  background-color: #f59200;
}

.container.vip .container__cycle-button {
  background-color: #420143;
}

.container.beta .container__cycle-button {
  background-color: #08d1d1;
}

.container.user .info-button {
  background: #005491;
}

.container.selected .info-button {
  background: #045d03;
}

.container.admin .info-button {
  background: #f59200;
}

.container.vip .info-button {
  background: #420143;
}

.container.beta .info-button {
  background: #08d1d1;
}
</style>
