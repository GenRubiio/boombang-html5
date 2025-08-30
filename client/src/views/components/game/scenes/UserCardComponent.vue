<template>
  <div
    class="user-card unselectable"
    :class="computedClass"
    v-if="selectedUser"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <div class="user-card__header unselectable">
      {{ selectedUser.username }}
    </div>
    <div class="user-card__avatar-container">
      <div class="user-card__avatar-container__message-container">
        <div class="user-card__avatar-container__message-container__text"></div>
      </div>
      <div class="user-card__avatar-container__avatar">
        <FichaComponent :avatarId="selectedUser.avatar_id" />
      </div>
    </div>
    <div
      class="user-card__change-ficha"
      v-if="selectedUser.is_selected"
      @click="changeFicha"
    >
      <img
        :src="asset_change_ficha_icon_image"
        :alt="$t('user_card.change_ficha_alt')"
        class="user-card__change-ficha__icon"
      />
    </div>
    <div class="triangle"></div>
    <div
      class="user-card__description"
      :class="{ 'is-editing': isEditingDescription }"
      @mouseenter="hoveringDesc = true"
      @mouseleave="hoveringDesc = false"
      @click.stop
    >
      <div
        v-if="!isEditingDescription"
        class="user-card__description__content"
        @click.stop
      >
        {{ descriptionText }}
      </div>
      <div
        v-else
        ref="descEditable"
        class="user-card__description__content"
        contenteditable="true"
        :data-placeholder="''"
        @keydown.enter.prevent="saveDescription"
        @keydown.stop
        @keypress.stop
        @keyup.stop
        @input="handleDescriptionInput"
        @paste.prevent="handlePaste"
      ></div>

      <button
        v-if="
          !selectedUser.is_selected && !isEditingDescription && hoveringDesc
        "
        class="user-card__description__edit-btn"
        @click.stop="startEditing"
      >
        {{ $t('user_card.edit_button') }}
      </button>
    </div>
    <div
      v-if="!selectedUser.is_selected"
      class="user-card__customization"
      @click="toggleCustomization"
    >
      <i class="las la-cog"></i>
    </div>
    <UserCustomizationComponent
      v-if="isCustomizationOpen"
      @close-customization="toggleCustomization"
      :authUser="authUser"
    />
    <UserDataTabsComponents
      v-if="!selectedUser.is_selected"
      :selectedUser="selectedUser"
      @open-ring-info="$emit('open-ring-info')"
      @open-coconuts-info="$emit('open-coconuts-info')"
    />
    <UserSelectedDataTabsComponent
      v-if="selectedUser.is_selected"
      :selectedUser="selectedUser"
      :authUser="authUser"
      @open-ring-info="$emit('open-ring-info')"
      @open-coconuts-info="$emit('open-coconuts-info')"
    />
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import FichaComponent from "./user-card/FichaComponent.vue";
import UserDataTabsComponents from "./user-card/UserDataTabsComponents.vue";
import UserSelectedDataTabsComponent from "./user-card/UserSelectedDataTabsComponent.vue";
import UserCustomizationComponent from "./UserCustomizationComponent.vue";
import asset_change_ficha_icon_image from "@/assets/game/ficha/change_ficha.svg";

export default {
  data() {
    return {
      selectedUser: null,
      authUser: null,
      asset_change_ficha_icon_image,
      isEditingDescription: false,
      hoveringDesc: false,
      descriptionText: "",
      isCustomizationOpen: false,
    };
  },
  components: {
    FichaComponent,
    UserDataTabsComponents,
    UserSelectedDataTabsComponent,
    UserCustomizationComponent,
  },
  methods: {
    toggleCustomization() {
      this.isCustomizationOpen = !this.isCustomizationOpen;
    },
    updateData(usersData) {
      this.selectedUser = usersData.selectedUser;
      this.authUser = usersData.authUser || this.selectedUser;
      this.descriptionText = (this.selectedUser?.description ?? "").toString();
    },
    changeFicha() {
      socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
        socketId: socket.id,
      });
    },
    handlePaste(event) {
      const text = event.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    handleDescriptionInput(event) {
      const el = event.target;
      let text = el.innerText;

      const lines = text.split("\n");
      if (lines.length > 3) {
        text = lines.slice(0, 3).join("\n");
      }

      if (text.length > 30) {
        text = text.substring(0, 30);
      }

      if (el.innerText !== text) {
        el.innerText = text;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },
    startEditing() {
      this.isEditingDescription = true;
      this.$nextTick(() => {
        const el = this.$refs.descEditable;
        if (el) {
          el.innerText = this.descriptionText;
          el.focus();
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        document.addEventListener("mousedown", this.handleClickOutside);
      });
    },
    handleClickOutside(event) {
      const el = this.$refs.descEditable;
      if (el && !el.contains(event.target)) {
        this.saveDescription();
      }
    },
    saveDescription() {
      document.removeEventListener("mousedown", this.handleClickOutside);
      const el = this.$refs.descEditable;
      if (el) {
        this.descriptionText = el.innerText.trim();
      }
      this.isEditingDescription = false;
      if (this.selectedUser) {
        this.selectedUser.description = this.descriptionText;
      }
      socket.emit(RequestSocketsEnum.USER_UPDATE_DESCRIPTION, {
        description: this.descriptionText,
      });
    },
  },
  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  },
  computed: {
    computedClass() {
      if (this.selectedUser.ficha_color == "user") {
        return this.selectedUser.is_selected ? "selected" : "user";
      }
      return this.selectedUser.ficha_color;
    },
  },
};
</script>

<style scoped>
.user-card {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 10px;
  width: 180px;
  pointer-events: auto;
}

.user-card__header {
  text-align: left;
  padding: 0 5px;
  border-radius: 5px;
  font-size: 23px;
  font-weight: bold;
  color: white;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card__avatar-container {
  display: flex;
  justify-content: space-between;
}

.user-card__avatar-container__avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.user-card__avatar-container__avatar img {
  margin-top: 2px;
}

.user-card__avatar-container {
  position: relative;
  padding: 5px;
}

.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.user-card__change-ficha {
  position: absolute;
  right: 5px;
  top: 111px;
  opacity: 0.3;
  cursor: pointer;
  z-index: 1;
}

.user-card__description {
  position: absolute;
  width: 95px;
  height: 65px;
  background: #ffffff;
  color: black;
  box-shadow: 0 3px #0000004d;
  border-radius: 6px;
  padding: 4px;
  margin-top: -94px;
  font-size: 11px;
  line-height: 12px;
  font-weight: bold;
  text-align: start;
  box-sizing: border-box;

  /* Evitar recortes horizontales y permitir scroll vertical si hace falta */
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;
}

/* Reglas para partir palabras largas y respetar saltos de línea del usuario */
.user-card__description__content {
  white-space: pre-wrap; /* respeta \n del usuario */
  overflow-wrap: anywhere; /* puede cortar dentro de palabras largas */
  word-break: break-word; /* fallback para navegadores anteriores */
}

.user-card__description__content:focus {
  outline: none;
}

/* Placeholder cuando está vacío (asegúrate de no dejar <br/> huérfano) */
.user-card__description__content:empty:before {
  content: attr(data-placeholder);
  pointer-events: none;
  opacity: 0.5;
}

.user-card__description__edit-btn {
  position: absolute;
  right: 5px;
  bottom: 5px;
  background-color: white;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 5px;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 10px;
}

.triangle {
  width: 0px;
  height: 0px;
  border-style: solid;
  border-width: 0 7px 32px 7px;
  border-color: transparent transparent #ffffff transparent;
  transform: rotate(117deg);
  position: absolute;
  top: 84px;
  left: 102px;
  z-index: 1;
}

.user-card__customization {
  position: absolute;
  height: 25px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #005ea3;
  border-radius: 5px;
  top: 122px;
  color: white;
  box-shadow: 1px 1px #0000004d;
  cursor: pointer;
  z-index: 1;
}

/********************************************************************* */
.user-card.user .user-card__header {
  background-color: #005ea3;
}

.user-card.admin .user-card__header {
  background-color: #f59200;
}

.user-card.vip .user-card__header {
  background-color: #420143;
}

.user-card.selected .user-card__header {
  background-color: #045d03;
}

.user-card.beta .user-card__header {
  background: linear-gradient(135deg, #08d1d1 0%, #00a1a1 100%);
  border: 1px solid #e1e1e1;
}

.user-card.user .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #194261;
}

.user-card.admin .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #b5a900;
}

.user-card.vip .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #6a006a;
}

.user-card.selected .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #0f3d00;
}

.user-card.beta .user-card__avatar-container__avatar {
  background-color: #08d1d1;
  box-shadow: inset 0 0 15px white;
}

.user-card.admin {
  background-color: #ffd700;
}

.user-card.vip {
  background-color: #800080;
}

.user-card.user {
  background-color: #0069b5;
}

.user-card.selected {
  background-color: #2b8703;
}

.user-card.beta {
  top: 10px;
  right: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 10px;
  width: 180px;
  pointer-events: auto;
  background: #08d1d1; /* o el que uses */
}

.user-card.user .user-card__description {
  color: #0069b5;
}

.user-card.selected .user-card__description {
  color: #2b8703;
}

.user-card.admin .user-card__description {
  color: #f59200;
}

.user-card.vip .user-card__description {
  color: #420143;
}

.user-card.beta .user-card__description {
  color: #08d1d1;
}

.user-card.user .user-card__description__edit-btn {
  background-color: #0069b5;
}

.user-card.selected .user-card__description__edit-btn {
  background-color: #2b8703;
}

.user-card.admin .user-card__description__edit-btn {
  background-color: #f59200;
}

.user-card.vip .user-card__description__edit-btn {
  background-color: #420143;
}

.user-card.beta .user-card__description__edit-btn {
  background-color: #08d1d1;
}

.user-card.user .user-card__customization {
  background-color: #005ea3;
}

.user-card.selected .user-card__customization {
  background-color: #045d03;
}

.user-card.admin .user-card__customization {
  background-color: #f59200;
}

.user-card.vip .user-card__customization {
  background-color: #420143;
}

.user-card.beta .user-card__customization {
  background-color: #01a7a7;
}

/** Mega custom */

/* Capas de partículas */
.user-card.beta::before,
.user-card.beta::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: background-position, opacity, filter, transform;
}

/* Capa 1 */
.user-card.beta::before {
  --p1: rgba(255, 255, 255, 0.85);
  --p2: rgba(255, 255, 255, 0.55);
  --p3: rgba(255, 255, 255, 0.35);

  background: radial-gradient(circle, var(--p1) 0 2px, transparent 3px) 0 0 /
      40px 40px,
    radial-gradient(circle, var(--p2) 0 1.5px, transparent 2.5px) 0 0 / 30px
      30px,
    radial-gradient(circle, var(--p3) 0 1px, transparent 2px) 0 0 / 20px 20px;

  animation: beta-drift-1 28s linear infinite,
    beta-twinkle 3.8s steps(20) infinite;
  opacity: 0.85;
}

/* Capa 2 */
.user-card.beta::after {
  --p1: rgba(255, 255, 255, 0.75);
  --p2: rgba(255, 255, 255, 0.45);
  --p3: rgba(255, 255, 255, 0.25);

  background: radial-gradient(circle, var(--p1) 0 2px, transparent 3px) 20px
      15px / 40px 40px,
    radial-gradient(circle, var(--p2) 0 1.5px, transparent 2.5px) 10px 6px /
      30px 30px,
    radial-gradient(circle, var(--p3) 0 1px, transparent 2px) 5px 18px / 20px
      20px;

  animation: beta-drift-2 36s linear infinite,
    beta-twinkle 5.2s steps(24) infinite;
  mix-blend-mode: screen;
  opacity: 0.9;
}

/* Animaciones de desplazamiento */
@keyframes beta-drift-1 {
  from {
    background-position: 0px 0px, 0px 0px, 0px 0px;
  }
  to {
    background-position: 220px 0px, -160px -80px, 80px 160px;
  }
}

@keyframes beta-drift-2 {
  from {
    background-position: 20px 15px, 10px 6px, 5px 18px;
  }
  to {
    background-position: -180px 60px, 200px -40px, -120px -140px;
  }
}

/* Parpadeo sutil */
@keyframes beta-twinkle {
  0% {
    filter: brightness(1) saturate(1);
    opacity: 0.85;
  }
  10% {
    filter: brightness(1.2) saturate(1.1);
    opacity: 0.95;
  }
  20% {
    filter: brightness(1) saturate(1);
    opacity: 0.8;
  }
  35% {
    filter: brightness(1.3) saturate(1.15);
    opacity: 0.95;
  }
  50% {
    filter: brightness(1) saturate(1);
    opacity: 0.85;
  }
  70% {
    filter: brightness(1.25) saturate(1.1);
    opacity: 0.92;
  }
  100% {
    filter: brightness(1) saturate(1);
    opacity: 0.85;
  }
}

/* Accesibilidad: reducir animación si el usuario lo pide */
@media (prefers-reduced-motion: reduce) {
  .user-card.beta::before,
  .user-card.beta::after {
    animation: none;
  }
}
</style>
