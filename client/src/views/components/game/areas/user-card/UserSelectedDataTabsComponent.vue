<template>
  <div class="tabs-container" :class="colorUser">
    <div
      class="tabs-container__interactions"
      :class="{ active: activeTab === 'interactions' }"
      @click="activeTab = 'interactions'"
    >
      <img
        :src="asset_emojisTabIconImage"
        class="tab-icon"
        :class="{ active: activeTab === 'interactions' }"
      />
    </div>
    <div
      class="tabs-container__statistics"
      :class="{ active: activeTab === 'statistics' }"
      @click="activeTab = 'statistics'"
    >
      <img
        :src="asset_statisticsTabIconImage"
        class="tab-icon"
        :class="{ active: activeTab === 'statistics' }"
      />
    </div>
  </div>
  <component :is="activeTabComponent" :user="user" />
</template>

<script>
import asset_emojisTabIconImage from "../../../../../assets/game/ficha/tab-cons/user.svg";
import asset_statisticsTabIconImage from "../../../../../assets/game/ficha/tab-cons/statistics.svg";
import InteractionsTabComponent from "./tabs/InteractionsTabComponent.vue";
import StatisticsTabComponent from "./tabs/StatisticsTabComponent.vue";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeTab: "interactions",
      asset_emojisTabIconImage,
      asset_statisticsTabIconImage,
    };
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === "interactions"
        ? InteractionsTabComponent
        : StatisticsTabComponent;
    },
    colorUser() {
      if (this.user.is_admin) {
        return "admin";
      }
      if (this.user.is_vip) {
        return "vip";
      }
      return "selected";
    },
  },
  components: {
    InteractionsTabComponent,
    StatisticsTabComponent,
  },
};
</script>

<style scoped>
.tabs-container {
  max-width: 177px;
  width: 100%;
  height: 21px;
  display: flex;
  gap: 3px;
}

.tabs-container__interactions {
  height: 23px;
  width: 100%;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: start;
  padding-left: 6px;
}

.tabs-container__statistics {
  height: 23px;
  width: 100%;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ajuste específico para la pestaña Statistics, ya que tiene menos ancho */
.tabs-container__statistics {
  width: 30px;
}

/* Icono dentro de cada pestaña */
.tab-icon {
  width: 13px;
  height: 13px;
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%)
    contrast(100%);
}

.tab-icon.active {
  filter: invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%)
    contrast(100%);
}

.tabs-container.admin .tabs-container__interactions,
.tabs-container.admin .tabs-container__statistics {
  background-color: #f59200;
}

.tabs-container.vip .tabs-container__interactions,
.tabs-container.vip .tabs-container__statistics {
  background-color: #420143;
}

.tabs-container.selected .tabs-container__interactions,
.tabs-container.selected .tabs-container__statistics {
  background-color: #045d03;
}

.tabs-container__interactions.active,
.tabs-container__statistics.active {
  background-color: white !important;
}
</style>
