<template>
  <div class="game-container">
    <UserCardComponent ref="userCard" />
    <BaseChatComponent @exitLobby="exitToLobby" @sendMessage="sendMessage" />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import UserCardComponent from "../../../components/game/scenes/UserCardComponent.vue";
import BaseChatComponent from "../../../components/game/scenes/BaseChatComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";

export default {
  props: {
    sceneType: {
      type: Number,
      required: true,
    },
    sceneData: {
      required: true,
    },
  },
  data() {
    return {};
  },
  created() {
    this.$emit("updateLoading", true);
  },
  components: {
    UserCardComponent,
    BaseChatComponent,
  },
  methods: {
    initializeGame() {
      const gamePhaser = this.$root.gamePhaser;

      gamePhaser.scene.start("PublicScene", {
        sceneType: this.sceneType,
        sceneData: this.sceneData,
        vueComponent: this,
      });
    },
    exitToLobby() {
      socket.emit(RequestSocketsEnum.USER_LEAVE_SCENE); // Enviar evento para salir de la sala
    },
    sendMessage(message) {
      socket.emit(RequestSocketsEnum.SEND_CHAT, {
        message: message,
      });
    },
    exitToLobbyResponse() {
      // Limpia el juego Phaser antes de salir
      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log("Saliendo de la sala...");
      }
      this.$emit("updateLoading", true);
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
    },
    updateUserCard(userData) {
      //console.log("Usuario seleccionado:", userData);
      this.$refs.userCard.updateData(userData); // Llamar al método del componente hijo
    },
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {},
};
</script>

<style>
.game-container {
  width: 1012px;
  height: 657px;
  margin: auto;
  position: absolute;
  background-color: transparent; /* Para verificar visualmente */
  z-index: 0;
  pointer-events: none; /* Dejar pasar eventos al canvas Phaser */
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
</style>
