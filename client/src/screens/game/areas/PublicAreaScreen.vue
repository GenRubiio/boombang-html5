<template>
  <div>
    <LoadingScreen v-if="loading" />
    <div class="game-container">
      <div id="phaser-container"></div>
      <!-- Aquí se monta Phaser -->
      <CompassComponent @exitLobby="exitToLobby" />
      <UserCardComponent ref="userCard" />
    </div>
  </div>
</template>

<script>
import Phaser from "phaser";
import LoadingScreen from "../LoadingScreen.vue";
import PublicAreaScene from "../../../phaser/PublicAreaScene.js"; // Escena principal del juego
import socket from "../../../sockets/socket.js";
import CompassComponent from "../../../components/game/areas/CompassComponent.vue";
import UserCardComponent from "../../../components/game/areas/UserCardComponent.vue";
import RequestSocketsEnum from "../../../phaser/enums/RequestSocketsEnum.js";

export default {
  props: {
    areaId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      game: null, // Instancia de Phaser
      loading: true,
    };
  },
  components: {
    LoadingScreen,
    CompassComponent,
    UserCardComponent,
  },
  methods: {
    initializeGame() {
      // Configuración inicial de Phaser
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "phaser-container", // Renderiza dentro de este contenedor
        width: 1012,
        height: 657,
        scene: [PublicAreaScene], // Escenas incluidas
        physics: { default: "arcade" },
      });

      this.game.scene.start("PublicAreaScene", {
        areaId: this.areaId,
        vueComponent: this,
      });
    },
    exitToLobby() {
      socket.off(RequestSocketsEnum.USER_LEAVE_AREA);
      socket.emit(RequestSocketsEnum.USER_LEAVE_AREA); // Enviar evento para salir de la sala
    },
    exitToLobbyResponse() {
      // Limpia el juego Phaser antes de salir
      if (this.game) {
        this.game.destroy(true);
        this.game = null;
      }
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
    },
    updateUserCard(userData) {
      console.log("Usuario seleccionado:", userData);
      this.$refs.userCard.updateData(userData); // Llamar al método del componente hijo
    },
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {
    // Limpia Phaser al desmontar el componente
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  },
};
</script>

<style>
.game-container {
  width: 100%;
  height: 100%;
}

#phaser-container {
  width: 100%;
  height: 100%;
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
