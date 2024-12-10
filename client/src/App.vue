<template>
  <div id="app" class="game-screen">
    <LoginComponent v-if="currentScene === 'login'" @loginSuccess="onLoginSuccess" @goToRegister="onGoToRegister" />
    <RegisterComponent v-else-if="currentScene === 'register'" @goToLogin="onGoToLogin" />
    <LobbyComponent v-else-if="currentScene === 'lobby'" @joinArea="onJoinArea"/>
    <GameScene v-else :roomId="currentRoomId" @exitLobby="onExitLobby" />
  </div>
</template>

<script>
import socket from "./sockets/socket";
import LoginComponent from "./screens/auth/LoginScreen.vue";
import RegisterComponent from "./screens/auth/RegisterScreen.vue";
import LobbyComponent from "./screens/game/LobbyScreen.vue";
import GameScene from "./screens/game/GameSceneScreen.vue";

export default {
  data() {
    return {
      currentScene: "login", // Controla las escenas: login, lobby, game
      currentRoomId: null, // ID de la sala actual
    };
  },
  components: {
    LoginComponent,
    RegisterComponent,
    LobbyComponent,
    GameScene,
  },
  methods: {
    onGoToLogin() {
      this.currentScene = "login";
    },
    onGoToRegister() {
      this.currentScene = "register";
    },
    onLoginSuccess() {
      this.currentScene = "lobby";
    },
    onJoinArea(areaId) {
      console.log("Unido a la sala:", areaId);
      this.currentRoomId = areaId;
      this.currentScene = "game";
    },
    onExitLobby() {
      this.currentScene = "lobby";
      this.currentRoomId = null;
    },
    handleDisconnect() {
      // Cambiar escena a login al detectar desconexión
      this.currentScene = "login";
      console.log("Desconexión detectada. Redirigiendo al login.");
    },
  },
  mounted() {
    // Detectar desconexión del socket
    socket.on("disconnect", this.handleDisconnect);

    // Detectar reconexión
    socket.on("connect", () => {
      console.log("Reconectado al servidor");
    });

    socket.on("error_critical", this.handleDisconnect);
  },
  beforeUnmount() {
    // Remover listeners de socket para evitar fugas de memoria
    socket.off("disconnect", this.handleDisconnect);
    socket.off("connect");
    socket.off("error_critical", this.handleDisconnect);
  },
};
</script>

<style>
#game-container {
  width: 100%;
  height: 100%;
}
.game-screen {
  width: 1012px;
  height: 657px;
  background-color: #f0f0f0;
  border: 1px solid black;
  box-sizing: border-box;
  position: relative;
}
#app {
  padding: 0 !important;
}
</style>
