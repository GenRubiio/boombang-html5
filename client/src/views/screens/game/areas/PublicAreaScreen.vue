<template>
  <div class="game-container">
    <CompassComponent @exitLobby="exitToLobby" />
    
    <UserCardComponent ref="userCard" />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import CompassComponent from "../../../components/game/areas/CompassComponent.vue";
import UserCardComponent from "../../../components/game/areas/UserCardComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";

export default {
  props: {
    areaId: {
      type: Number,
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
    CompassComponent,
    UserCardComponent,
  },
  methods: {
    initializeGame() {
      const gamePhaser = this.$root.gamePhaser;

      gamePhaser.scene.start("PublicAreaScene", {
        areaId: this.areaId,
        vueComponent: this,
      });
    },
    exitToLobby() {
      socket.emit(RequestSocketsEnum.USER_LEAVE_AREA); // Enviar evento para salir de la sala
    },
    sendMessage(message) {
      socket.emit(RequestSocketsEnum.SEND_CHAT, {
        message: message,
      });
    },
    exitToLobbyResponse() {
      // Limpia el juego Phaser antes de salir
      console.log("Saliendo de la sala...");
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

.btn-exit {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff5555;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-exit:hover {
  background: #ff2222;
}
</style>
