<template>
  <div class="base-chat" @pointerdown.stop @mousedown.stop @touchstart.stop>
    <EmojisPickerComponent
      v-if="showEmojiPicker"
      @emoji-clicked="addEmoji"
      @close="showEmojiPicker = false"
    />
    <div class="base-chat__container">
      <div class="base-chat__container__chat" @dragover.prevent @drop.prevent>
        <img :src="asset_base_image" alt="Base" />
        <UsersChatListComponent @user-selected="handleUserSelected" />
        <CreditsComponent />
        <input
          ref="messageInput"
          v-model="message"
          type="text"
          placeholder="Escribe un mensaje..."
          @keyup.enter="sendMessage"
          maxlength="60"
        />
        <div
          class="base-chat__container__emoji-button"
          @click="toggleEmojiPicker"
        >
          <div class="base">
            <div class="dorado">🤩</div>
          </div>
        </div>
      </div>
      <div class="base-chat__container__brujula" @click="exitToLobby">
        <img :src="asset_brujula_image" alt="Brujula" />
      </div>
    </div>
  </div>
</template>

<script>
import asset_base_image from "@/assets/game/basechat/base.webp";
import asset_brujula_image from "@/assets/game/basechat/brujula.webp";
import EmojisPickerComponent from "./base-chat/EmojisPickerComponent.vue";
import UsersChatListComponent from "./base-chat/UsersChatListComponent.vue";
import CreditsComponent from "./base-chat/CreditsComponent.vue";

export default {
  components: {
    EmojisPickerComponent,
    UsersChatListComponent,
    CreditsComponent,
  },
  data() {
    return {
      asset_base_image,
      asset_brujula_image,
      message: "",
      showEmojiPicker: false,
      selectedUser: null,
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    handleUserSelected(user) {
      this.selectedUser = user;
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    addEmoji(emoji) {
      const maxLength = 60;
      this.message = (this.message + emoji).slice(0, maxLength);
      this.$refs.messageInput.focus();
    },
    sendMessage() {
      if (this.message.trim() !== "") {
        const maxLength = 60;
        this.$emit("sendMessage", {
          message: this.message.slice(0, maxLength),
          recipient: this.selectedUser,
        });
        this.message = "";
        this.showEmojiPicker = false;
      }
    },
    exitToLobby() {
      this.$emit("exitLobby");
    },
    handleKeydown(event) {
      const active = document.activeElement;
      const isEditable = (el) => {
        if (!el) return false;
        const tag = el.tagName;
        return (
          el.isContentEditable ||
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          el.getAttribute("role") === "textbox"
        );
      };

      if (isEditable(event.target) || isEditable(active)) {
        return;
      }

      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.key.length !== 1
      ) {
        return;
      }

      if (this.$refs.messageInput !== active) {
        this.$refs.messageInput.focus();
      }
    },
  },
};
</script>

<style scoped>
.base-chat {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: auto;
}

.base-chat__container {
  position: relative;
  width: 100%;
  height: 100%;
}

.base-chat__container__chat {
  position: relative;
}

.base-chat__container__chat input {
  position: absolute;
  left: 282px;
  top: 45px;
  width: 386px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: white;
  outline: none;
}

.base-chat__container__chat input::placeholder {
  color: rgba(255, 255, 255, 0.541);
}

.base-chat__container__brujula {
  position: absolute;
  right: 12px;
  top: -3px;
  cursor: pointer;
}

.base-chat__container__emoji-button {
  position: absolute;
  right: 293px;
  top: 36px;
  cursor: pointer;
  font-size: 24px;
  color: white;
}

.base {
  width: 35px;
  height: 35px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -2px;
  font-size: 30px;
  color: #d96b35;
}

.dorado {
  width: 32px;
  height: 32px;
  /* background: radial-gradient(circle at top left, #ffdf70, #d4a017); */
  border-radius: 50%;
  /* box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.2); */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -7px;
  font-size: 32px;
}
</style>
