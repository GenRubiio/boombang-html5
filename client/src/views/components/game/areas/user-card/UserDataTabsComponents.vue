<template>
  <div class="tabs-container">
    <div
      class="tabs-container__emojis"
      :class="{ active: activeTab === 'emojis' }"
      @click="activeTab = 'emojis'"
    >
      <img :src="EmojisTabIcon" class="tab-icon" />
    </div>
    <div
      class="tabs-container__statistics"
      :class="{ active: activeTab === 'statistics' }"
      @click="activeTab = 'statistics'"
    >
      <img :src="StatisticsTabIcon" class="tab-icon" />
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
  methods: {},
  computed: {
    activeTabComponent() {
      if (this.activeTab === "emojis") {
        return EmojisTabComponent;
      } else if (this.activeTab === "statistics") {
        return StatisticsTabComponent;
      }
    },
    computedClass() {},
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
  height: 15px;
  display: flex;
  gap: 3px;
}

/* --- Estilos pestaña Emojis --- */
.tabs-container__emojis {
  height: 17px;
  width: 100%;
  border-radius: 8px 8px 0 0;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Estilos pestaña Statistics --- */
.tabs-container__statistics {
  height: 17px;
  width: 30px;
  border-radius: 8px 8px 0 0;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Icono dentro de cada pestaña */
.tab-icon {
  width: 16px;
  height: 16px;
}

/* Ejemplo de cómo podrías diferenciar con clases si lo deseas */
.tabs-container__emojis.active,
.tabs-container__statistics.active {
  /* Puedes poner aquí alguna marca de estilo para la pestaña activa, si quieres */
  /* p. ej., un borde inferior, un background distinto, etc. */
}
</style>
