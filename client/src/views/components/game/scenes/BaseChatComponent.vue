<template>
  <div class="base-chat" @pointerdown.stop @mousedown.stop @touchstart.stop>
    <div class="base-chat__container">
      <div class="base-chat__container__chat">
        <img :src="asset_base_image" alt="Base" />
        <input
          ref="messageInput"
          v-model="message"
          type="text"
          placeholder="Escribe un mensaje..."
          @keyup.enter="sendMessage"
        />
      </div>
      <div class="base-chat__container__brujula" @click="exitToLobby">
        <img :src="asset_brujula_image" alt="Brujula" />
      </div>
    </div>
  </div>
</template>

<script>
import asset_base_image from "../../../../assets/game/basechat/base.webp";
import asset_brujula_image from "../../../../assets/game/basechat/brujula.webp";

export default {
  data() {
    return {
      asset_base_image,
      asset_brujula_image,
      message: "", // Variable para almacenar el mensaje
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== "") {
        this.$emit("sendMessage", this.message); // Emite el mensaje al padre
        this.message = ""; // Limpia el input después de enviar
      }
    },
    exitToLobby() {
      this.$emit("exitLobby"); // Emite evento al padre
    },
    handleKeydown(event) {
      // Solo enfocar el input si el usuario empieza a escribir (ignoramos teclas como Shift, Ctrl, Alt, etc.)
      if (
        this.$refs.messageInput !== document.activeElement &&
        event.key.length === 1
      ) {
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
  left: 170px;
  top: 45px;
  width: 495px;
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
</style>
