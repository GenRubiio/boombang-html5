<template>
  <div class="tabs-container">
    <div
      class="tabs-container__emojis"
      :class="{ active: activeTab === 'emojis' }"
      @click="activeTab = 'emojis'"
    >
      <img
        :src="EmojisTabIcon"
        class="tab-icon"
        :class="{ active: activeTab === 'emojis' }"
      />
    </div>
    <div
      class="tabs-container__statistics"
      :class="{ active: activeTab === 'statistics' }"
      @click="activeTab = 'statistics'"
    >
      <img
        :src="StatisticsTabIcon"
        class="tab-icon"
        :class="{ active: activeTab === 'statistics' }"
      />
    </div>
  </div>
  <component :is="activeTabComponent" :user="user" />
</template>

<script>
import EmojisTabIcon from "../../../../../assets/game/ficha/tab-cons/user.svg";
import StatisticsTabIcon from "../../../../../assets/game/ficha/tab-cons/statistics.svg";
import EmojisTabComponent from "./tabs/EmojisTabComponent.vue";
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
      activeTab: "emojis",
      EmojisTabIcon,
      StatisticsTabIcon,
    };
  },
  computed: {
    activeTabComponent() {
      return this.activeTab === "emojis"
        ? EmojisTabComponent
        : StatisticsTabComponent;
    },
  },
  components: {
    EmojisTabComponent,
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

/* --- Estilos pestaña Emojis --- */
.tabs-container__emojis,
.tabs-container__statistics {
  height: 23px;
  width: 100%;
  border-radius: 8px 8px 0 0;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: start;
  padding-left: 6px;
}

/* Ajuste específico para la pestaña Statistics, ya que tiene menos ancho */
.tabs-container__statistics {
  width: 30px;
}

/* Icono dentro de cada pestaña */
.tab-icon {
  width: 16px;
  height: 16px;
  filter: invert(21%) sepia(100%) saturate(318%) hue-rotate(181deg)
    brightness(98%) contrast(101%);
}

/* Cambiar color cuando la pestaña está activa */
.tab-icon.active {
  filter: invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%)
    contrast(100%);
  /* Esto lo convierte en negro */
}

/* Estilo para pestaña activa */
.tabs-container__emojis.active,
.tabs-container__statistics.active {
  background-color: white;
}
</style>
