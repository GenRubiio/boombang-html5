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
        alt="Change Ficha"
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
        EDITAR
      </button>
    </div>
    <div class="user-card__customization" @click="toggleCustomization">
      <i class="las la-cog"></i>
    </div>
    <UserCustomizationComponent
      v-if="isCustomizationOpen"
      @close-customization="toggleCustomization"
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
import socket from "../../../../sockets/socket";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum";
import FichaComponent from "./user-card/FichaComponent.vue";
import UserDataTabsComponents from "./user-card/UserDataTabsComponents.vue";
import UserSelectedDataTabsComponent from "./user-card/UserSelectedDataTabsComponent.vue";
import UserCustomizationComponent from "./UserCustomizationComponent.vue";
import asset_change_ficha_icon_image from "../../../../assets/game/ficha/change_ficha.svg";

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
      this.authUser = usersData.authUser;
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
      });
    },
    saveDescription() {
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
  z-index: 0;
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
  z-index: 0;
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
</style>
