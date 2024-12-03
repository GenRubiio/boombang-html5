<template>
  <div class="game-container">
    <div id="phaser-container"></div>
    <!-- Aquí se monta Phaser -->
    <button class="btn-exit" @click="exitToLobby">Salir al Lobby</button>
  </div>
</template>

<script>
import Phaser from "phaser";
import GameScene from "../phaser/GameScene.js"; // Escena principal del juego
import socket from "../sockets/socket.js";

export default {
  props: {
    roomId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      game: null, // Instancia de Phaser
    };
  },
  methods: {
    initializeGame() {
      // Configuración inicial de Phaser
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "phaser-container", // Renderiza dentro de este contenedor
        width: 1012,
        height: 657,
        scene: [GameScene], // Escenas incluidas
        physics: { default: "arcade" },
      });

      this.game.scene.start("GameScene", { roomId: this.roomId });
    },
    exitToLobby() {
      socket.emit("request:user_leave_area"); // Enviar evento para salir de la sala
      // Limpia el juego Phaser antes de salir
      if (this.game) {
        this.game.destroy(true);
        this.game = null;
      }
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
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
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 1px solid #ccc;
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
