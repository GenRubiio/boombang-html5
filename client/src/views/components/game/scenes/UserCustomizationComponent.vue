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
          <template v-if="activeTab == 'ficha'">
            <div
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
          </template>
          <template v-if="activeTab === 'chat'">
            <div
              class="user-customization__grid-item"
              v-for="(chat, index) in paddedChatColors"
              :key="index"
              @click="onSelectChat(chat.key)"
              :class="{
                selected: isChatSelected(chat.key),
                disabled: !isChatEnabled(chat.key),
                'empty-item': !chat.key,
              }"
            >
              <img v-if="chat.image" :src="chat.image" />
              <div
                v-if="chat.description"
                class="info-icon"
                @mouseover="showTooltip($event, chat)"
                @mouseleave="hideTooltip"
              >
                ?
              </div>
            </div>
          </template>
          <template v-if="activeTab === 'nombre'">
            <div
              class="user-customization__grid-item"
              v-for="(name, index) in paddedNameColors"
              :key="index"
              @click="onSelectName(name.key)"
              :class="{
                selected: isNameSelected(name.key),
                disabled: !isNameEnabled(name.key),
                'empty-item': !name.key,
              }"
            >
              <img v-if="name.image" :src="name.image" />
              <div
                v-if="name.description"
                class="info-icon"
                @mouseover="showTooltip($event, name)"
                @mouseleave="hideTooltip"
              >
                ?
              </div>
            </div>
          </template>
          <template v-if="activeTab === 'sombra'">
            <div
              class="user-customization__grid-item"
              v-for="(shadow, index) in paddedShadowColors"
              :key="index"
              @click="onSelectShadow(shadow.key)"
              :class="{
                selected: isShadowSelected(shadow.key),
                disabled: !isShadowEnabled(shadow.key),
                'empty-item': !shadow.key,
              }"
            >
              <img v-if="shadow.image" :src="shadow.image" />
              <div
                v-if="shadow.description"
                class="info-icon"
                @mouseover="showTooltip($event, shadow)"
                @mouseleave="hideTooltip"
              >
                ?
              </div>
            </div>
          </template>
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
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

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
      fichaColors: [],
      chatColors: [],
      nameColors: [],
      shadowColors: [],
      decorationsLoaded: false,
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
      const padded = [...this.fichaColors];
      while (padded.length < totalItems) {
        padded.push({});
      }
      return padded;
    },
    paddedChatColors() {
      const totalItems = 14;
      const padded = [...this.chatColors];
      while (padded.length < totalItems) {
        padded.push({});
      }
      return padded;
    },
    paddedNameColors() {
      const totalItems = 20;
      const padded = [...this.nameColors];
      while (padded.length < totalItems) {
        padded.push({});
      }
      return padded;
    },
    paddedShadowColors() {
      const totalItems = 20;
      const padded = [...this.shadowColors];
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
      if (this.activeTab === "nombre" || this.activeTab === "sombra") {
        return "nombre-sombra-grid";
      }
    },
  },
  methods: {
    showTooltip(event, item) {
      if (item && item.description) {
        const rect = event.currentTarget.getBoundingClientRect();
        this.tooltip.content = item.description;
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
      return this.authUser.fichas ? this.authUser.fichas.includes(ficha) : true;
    },
    isFichaSelected(ficha) {
      return this.authUser.ficha_color === ficha;
    },
    onSelectChat(chat) {
      if (!chat || this.isChatSelected(chat) || !this.isChatEnabled(chat)) {
        return;
      }
      socket.emit(RequestSocketsEnum.USER_CHANGE_CHAT, {
        chat: chat,
      });
    },
    isChatEnabled(chat) {
      return this.authUser.chats ? this.authUser.chats.includes(chat) : true;
    },
    isChatSelected(chat) {
      return this.authUser.chat_color === chat;
    },
    onSelectName(name) {
      if (!name || this.isNameSelected(name) || !this.isNameEnabled(name)) {
        return;
      }
      socket.emit(RequestSocketsEnum.USER_CHANGE_NAME_COLOR, {
        colorname: name,
      });
    },
    isNameEnabled(name) {
      return this.authUser.colornames ? this.authUser.colornames.includes(name) : true;
    },
    isNameSelected(name) {
      return this.authUser.name_color === name;
    },
    onSelectShadow(shadow) {
      if (
        !shadow ||
        this.isShadowSelected(shadow) ||
        !this.isShadowEnabled(shadow)
      ) {
        return;
      }
      socket.emit(RequestSocketsEnum.USER_CHANGE_SHADOW_COLOR, {
        shadow: shadow,
      });
    },
    isShadowEnabled(shadow) {
      return this.authUser.shadows ? this.authUser.shadows.includes(shadow) : true;
    },
    isShadowSelected(shadow) {
      return this.authUser.shadow_color === shadow;
    },
  },
  mounted() {
    socket.emit(RequestSocketsEnum.GET_USER_DECORATIONS);
    socket.off(ResponseSocketsEnum.GET_USER_DECORATIONS);
    socket.on(ResponseSocketsEnum.GET_USER_DECORATIONS, (data) => {
      if (data && (data.decorations || data.ficha !== undefined)) {
        const decorations = data.decorations || data;
        console.log('User decorations received:', decorations);
        this.fichaColors = decorations.ficha || [];
        this.chatColors = decorations.chat || [];
        this.nameColors = decorations.name || [];
        this.shadowColors = decorations.shadow || [];
        this.decorationsLoaded = true;

        this.$forceUpdate();

        this.$nextTick(() => {});
      } else {
        console.log('No data or no decorations in response');
      }
    });
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 610px;
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
  overflow-y: auto;
  padding-right: 10px;
}

.chat-grid {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(7, 1fr);
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
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 5px;
  box-sizing: border-box;
}

.user-customization__grid-item img{
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  cursor: pointer;
}

.chat-grid .user-customization__grid-item.selected {
  border: 2px solid #d96b35;
  box-shadow: 0 0 10px #d96b35;
}

.chat-grid .user-customization__grid-item.disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}

.chat-grid .user-customization__grid-item.empty-item {
  background-color: #f0f0f0;
  cursor: default;
}

.ficha-grid .user-customization__grid-item {
  height: 190px;
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

.nombre-sombra-grid .user-customization__grid-item {
  height: 85px;
  padding: 0 10px;
  border: 1px solid white;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.nombre-sombra-grid .user-customization__grid-item.selected {
  border: 2px solid #d96b35;
  box-shadow: 0 0 10px #d96b35;
}

.nombre-sombra-grid .user-customization__grid-item.disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}

.nombre-sombra-grid .user-customization__grid-item.empty-item {
  background-color: #f0f0f0;
  cursor: default;
}
</style>
