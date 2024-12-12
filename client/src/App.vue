<template>
  <div id="app">
    <div class="game-screen">
      <LoginScreen
        v-if="currentScene === 'login'"
        @loginSuccess="onLoginSuccess"
        @goToRegister="onGoToRegister"
      />
      <RegisterScreen
        v-else-if="currentScene === 'register'"
        @goToLogin="onGoToLogin"
      />
      <LobbyScreen
        v-else-if="currentScene === 'lobby'"
        @joinPublicArea="onJoinPublicArea"
      />
      <PublicAreaScreen
        v-else-if="currentScene === 'public_area'"
        :areaId="currentAreaId"
        @exitLobby="onExitLobby"
      />
    </div>
  </div>
</template>

<script>
import socket from "./sockets/socket";
import LoginScreen from "./screens/auth/LoginScreen.vue";
import RegisterScreen from "./screens/auth/RegisterScreen.vue";
import LobbyScreen from "./screens/game/LobbyScreen.vue";
import PublicAreaScreen from "./screens/game/areas/PublicAreaScreen.vue";

export default {
  data() {
    return {
      currentScene: "login", // Controla las escenas: login, lobby, game
      currentAreaId: null, // ID de la sala actual
    };
  },
  components: {
    LoginScreen,
    RegisterScreen,
    LobbyScreen,
    PublicAreaScreen,
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
    onJoinPublicArea(areaId) {
      console.log("Unido a la sala:", areaId);
      this.currentAreaId = areaId;
      this.currentScene = "public_area";
    },
    onExitLobby() {
      this.currentScene = "lobby";
      this.currentAreaId = null;
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
.game-screen {
  width: 1012px;
  height: 657px;
  background-color: #f0f0f0;
  box-sizing: border-box;
  position: relative;
}
#app {
  padding: 0 !important;
}
</style>
