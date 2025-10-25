<template>
  <div class="base-chat" @pointerdown.stop @mousedown.stop @touchstart.stop>
    <EmojisPickerComponent
      v-if="showEmojiPicker"
      @emoji-clicked="addEmoji"
      @close="showEmojiPicker = false"
    />
    <div class="base-chat__container">
      <div class="base-chat__container__chat" @dragover.prevent @drop.prevent>
        <img :src="asset_base_image" :alt="$t('chat.base_alt')" />
        <UsersChatListComponent 
          ref="usersList"
          @user-selected="handleUserSelected"
          @users-updated="handleUsersUpdated"
        />
        <CreditsComponent />
        <MentionAutocompleteComponent
          :users="availableUsers"
          :search-query="mentionSearchQuery"
          :show-suggestions="showMentionSuggestions"
          :position="mentionPosition"
          @select-user="insertMention"
          ref="mentionAutocomplete"
        />
        <input
          ref="messageInput"
          v-model="message"
          type="text"
          :placeholder="$t('chat.placeholder')"
          @keydown="handleInputKeydown"
          @input="handleInput"
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
        <img :src="asset_brujula_image" :alt="$t('chat.brujula_alt')" />
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
import MentionAutocompleteComponent from "./base-chat/MentionAutocompleteComponent.vue";

export default {
  components: {
    EmojisPickerComponent,
    UsersChatListComponent,
    CreditsComponent,
    MentionAutocompleteComponent,
  },
  data() {
    return {
      asset_base_image,
      asset_brujula_image,
      message: "",
      showEmojiPicker: false,
      selectedUser: null,
      // Mention system
      showMentionSuggestions: false,
      mentionSearchQuery: "",
      mentionStartPos: -1,
      mentionPosition: { left: 282, bottom: 65 },
      cachedUsers: [], // Cache de usuarios para el autocompletado
    };
  },
  computed: {
    availableUsers() {
      // Usar cache primero, luego intentar obtener del ref
      if (this.cachedUsers.length > 0) {
        return this.cachedUsers;
      }
      return this.$refs.usersList?.users || [];
    },
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
    handleUsersUpdated(users) {
      this.cachedUsers = users;
      //console.log("Usuarios disponibles para menciones:", users);
    },
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    addEmoji(emoji) {
      const maxLength = 60;
      this.message = (this.message + emoji).slice(0, maxLength);
      this.$refs.messageInput.focus();
    },
    handleInput(event) {
      const input = event.target;
      const cursorPos = input.selectionStart;
      const text = this.message;

      //console.log("Input event - texto:", text, "cursor:", cursorPos);

      // Buscar el último @ antes del cursor
      let lastAtPos = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        if (text[i] === "@") {
          // Verificar que el @ está al inicio o precedido por un espacio
          if (i === 0 || text[i - 1] === " ") {
            lastAtPos = i;
            break;
          }
        }
        // Si encontramos un espacio antes del @, no hay mención activa
        if (text[i] === " ") {
          break;
        }
      }

      if (lastAtPos !== -1) {
        // Hay una mención activa
        this.mentionStartPos = lastAtPos;
        this.mentionSearchQuery = text.substring(lastAtPos + 1, cursorPos);
        this.showMentionSuggestions = true;
        this.updateMentionPosition();
        //console.log("Mención activa - búsqueda:", this.mentionSearchQuery, "usuarios:", this.availableUsers);
      } else {
        // No hay mención activa
        this.closeMentionSuggestions();
      }
    },
    handleInputKeydown(event) {
      if (this.showMentionSuggestions) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          this.$refs.mentionAutocomplete?.selectNext();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          this.$refs.mentionAutocomplete?.selectPrevious();
        } else if (event.key === "Enter" || event.key === "Tab") {
          if (this.$refs.mentionAutocomplete?.filteredUsers?.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            this.$refs.mentionAutocomplete?.selectCurrent();
            return false; // Detener completamente el evento
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
          this.closeMentionSuggestions();
        }
      } else if (event.key === "Enter") {
        // Si no hay menciones activas y se presiona Enter, enviar mensaje
        event.preventDefault();
        this.sendMessage();
      }
    },
    insertMention(user) {
      const beforeMention = this.message.substring(0, this.mentionStartPos);
      const afterCursor = this.message.substring(
        this.$refs.messageInput.selectionStart
      );
      
      // Insertar la mención con un espacio al final
      this.message = `${beforeMention}@${user.username} ${afterCursor}`.slice(0, 60);
      
      this.closeMentionSuggestions();
      
      // Poner el cursor después de la mención
      this.$nextTick(() => {
        const newCursorPos = beforeMention.length + user.username.length + 2;
        this.$refs.messageInput.focus();
        this.$refs.messageInput.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    closeMentionSuggestions() {
      this.showMentionSuggestions = false;
      this.mentionSearchQuery = "";
      this.mentionStartPos = -1;
    },
    updateMentionPosition() {
      // Calcular la posición del dropdown basándose en el input
      const input = this.$refs.messageInput;
      if (input) {
        const inputRect = input.getBoundingClientRect();
        // Posición relativa al contenedor del chat
        this.mentionPosition = {
          left: 282, // Misma posición left que el input
          bottom: 65, // Bajado de 80 a 65
        };
      }
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
        this.closeMentionSuggestions();
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
  top: 16px;
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
  top: -36px;
  cursor: pointer;
}

.base-chat__container__emoji-button {
  position: absolute;
  right: 293px;
  top: 10px;
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
