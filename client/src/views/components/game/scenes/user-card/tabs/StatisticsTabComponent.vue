<template>
  <div class="container" :class="colorUser">
    <div class="container__userinfo-data">
      <div class="container__userinfo-data__title">{{ currentView.title }}</div>
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
    </div>
    <div class="container__userinfo-right">
      <img :src="currentView.image" :alt="currentView.title" />
    </div>
    <button class="container__cycle-button" @click="cycleStatistic">
      <i class="la la-chevron-right"></i>
    </button>
  </div>
</template>

<script>
import asset_stat_upper_image from "../../../../../../assets/game/ficha/statistics/uppercut.png";
import asset_stat_coconut_image from "../../../../../../assets/game/ficha/statistics/coconut.png";
import asset_stat_ring_image from "../../../../../../assets/game/ficha/statistics/ring.png";
import asset_stat_coconut_caught_image from "../../../../../../assets/game/ficha/statistics/cocos_locos.png";

export default {
  props: {
    selectedUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentViewIndex: 0,
      statisticsViews: [
        {
          title: "Uppercuts",
          image: asset_stat_upper_image,
          stats: [
            { key: "uppercuts_send", label: "Enviados" },
            { key: "uppercuts_received", label: "Recibidos" },
          ],
        },
        {
          title: "Coconuts",
          image: asset_stat_coconut_image,
          stats: [
            { key: "coconuts_sent", label: "Enviados" },
            { key: "coconuts_received", label: "Recibidos" },
          ],
        },
        {
          title: "Rings",
          image: asset_stat_ring_image,
          stats: [{ key: "rings_won", label: "Ganados" }],
        },
        {
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
  z-index: 0;
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
</style>
