<template>
  <div class="user-customization">
    <button class="close-button" @click="$emit('close-customization')">
      <i class="las la-times"></i>
    </button>
    <div class="user-customization__container">
      <div class="user-customization__tabs">
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'ficha' }"
          @click="activeTab = 'ficha'"
        >
          Ficha
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'chat' }"
          @click="activeTab = 'chat'"
        >
          Chat
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'nombre' }"
          @click="activeTab = 'nombre'"
        >
          Nombre
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'sombra' }"
          @click="activeTab = 'sombra'"
        >
          Sombra
        </div>
      </div>
      <div class="user-customization__content">
        <div class="user-customization__title">
          PERSONALIZACIÓN DE {{ activeTab }}
        </div>
        <div class="user-customization__grid" :class="gridClass">
          <div
            v-if="activeTab === 'ficha'"
            class="user-customization__grid-item"
            v-for="(ficha, index) in paddedFichaColors"
            :key="index"
            @click="onSelectFicha(ficha.key)"
            :class="{
              selected: isFichaSelected(ficha.key),
              disabled: !isFichaEnabled(ficha.key),
              'empty-item': !ficha.key,
            }"
          >
            <img v-if="ficha.image" :src="ficha.image" />
            <div
              v-if="ficha.description"
              class="info-icon"
              @mouseover="showTooltip($event, ficha)"
              @mouseleave="hideTooltip"
            >
              ?
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      v-html="tooltip.content"
    ></div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import fichaColors from "@/assets/game/data/ficha_colors.json";

export default {
  props: {
    authUser: {
      type: Object,
      required: true,
    },
  },
  name: "UserCustomizationComponent",
  emits: ["close-customization", "on-select-ficha"],
  data() {
    return {
      activeTab: "ficha",
      fichaColors: fichaColors,
      chatColors: [],
      nameColors: [],
      shadowColors: [],
      tooltip: {
        visible: false,
        content: "",
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    paddedFichaColors() {
      const totalItems = 8;

      const enabledFichas = [];
      const disabledFichas = [];

      for (const ficha of this.fichaColors) {
        if (this.isFichaEnabled(ficha.key)) {
          enabledFichas.push(ficha);
        } else {
          disabledFichas.push(ficha);
        }
      }

      const sortedFichas = [...enabledFichas, ...disabledFichas];

      const padded = [...sortedFichas];
      while (padded.length < totalItems) {
        padded.push({});
      }
      return padded;
    },
    gridClass() {
      if (this.activeTab === "ficha") {
        return "ficha-grid";
      }
      if (this.activeTab === "chat") {
        return "chat-grid";
      }
      return "nombre-sombra-grid";
    },
  },
  methods: {
    showTooltip(event, ficha) {
      if (ficha && ficha.description) {
        const rect = event.currentTarget.getBoundingClientRect();
        this.tooltip.content = ficha.description;
        this.tooltip.visible = true;
        this.tooltip.x = rect.left + window.scrollX - rect.width / 2 - 20;
        this.tooltip.y = rect.bottom + window.scrollY + 5;
      }
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    onSelectFicha(ficha) {
      if (
        !ficha ||
        this.isFichaSelected(ficha) ||
        !this.isFichaEnabled(ficha)
      ) {
        return;
      }
      socket.emit(RequestSocketsEnum.USER_CHANGE_FICHA, {
        ficha: ficha,
      });
    },
    isFichaEnabled(ficha) {
      return this.authUser.fichas.includes(ficha);
    },
    isFichaSelected(ficha) {
      return this.authUser.ficha_color === ficha;
    },
  },
};
</script>

<style scoped>
.user-customization {
  width: 761px;
  height: 505px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: absolute;
  right: 210px;
  top: 0px;
  z-index: 101;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 3px 3px #0000004d;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.805);
  color: white;
  padding: 4px;
  border-radius: 5px;
  z-index: 102;
  pointer-events: none;
  white-space: pre-wrap;
  font-size: 12px;
  text-align: start;
  width: 125px;
}

.tooltip::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 10px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent black transparent;
}

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

.user-customization__container {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  margin-top: 25px;
}

.user-customization__tabs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-right: 10px;
}

.user-customization__tab {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}

.user-customization__tab.active {
  background-color: #d96b35;
  color: white;
}

.user-customization__content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.user-customization__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  box-shadow: 0 3px #0000004d;
}

.user-customization__grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.chat-grid {
  grid-template-columns: repeat(2, 1fr);
}

.ficha-grid {
  grid-template-columns: repeat(4, 1fr);
}

.nombre-sombra-grid {
  grid-template-columns: repeat(5, 1fr);
}

.user-customization__grid-item {
  background-color: #e0e0e0;
  border-radius: 5px;
  position: relative;
}

.info-icon {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 20px;
  height: 20px;
  background-color: black;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 1px 1px #0000004d;
}

.chat-grid .user-customization__grid-item {
  height: 45px;
  border: 1px solid white;
}

.ficha-grid .user-customization__grid-item {
  height: 190px;
  border: 1px solid white;
  background-color: transparent;
  cursor: pointer;
}

.ficha-grid .user-customization__grid-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ficha-grid .user-customization__grid-item.selected {
  border: 2px solid #d96b35;
  box-shadow: 0 0 10px #d96b35;
}

.ficha-grid .user-customization__grid-item.disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}

.ficha-grid .user-customization__grid-item.empty-item {
  background-color: #f0f0f0;
  cursor: default;
}
</style>
