<template>
  <div id="game">
    <div id="phaser-container"></div>
    <LoadingScreen v-if="loading" />
    <div id="game-screens">
      <LoginScreen
        v-if="currentScreen === 'login'"
        @loginSuccess="onLoginSuccess"
        @goToRegister="onGoToRegister"
      />
      <RegisterScreen
        v-else-if="currentScreen === 'register'"
        @goToLogin="onGoToLogin"
      />
      <LobbyScreen
        v-else-if="currentScreen === 'lobby'"
        @joinPublicArea="onJoinPublicArea"
        @updateLoading="onUpdateLoading"
      />
      <PublicAreaScreen
        v-else-if="currentScreen === 'public_area'"
        :areaId="currentAreaId"
        @exitLobby="onExitLobby"
        @updateLoading="onUpdateLoading"
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
import LoadingScreen from "./screens/game/LoadingScreen.vue";

import GameScreensEnum from "./enums/GameScreensEnum";

export default {
  data() {
    return {
      gamePhaser: null,
      loading: false,
      currentScreen: GameScreensEnum.LOGIN, // Controla las escenas: login, lobby, game
      currentAreaId: null, // ID de la sala actual
    };
  },
  created() {
    //setInterval(() => {
    //  console.log("Eventos registrados:", socket._callbacks);
    //}, 5000);
  },
  components: {
    LoadingScreen,
    LoginScreen,
    RegisterScreen,
    LobbyScreen,
    PublicAreaScreen,
  },
  methods: {
    onGoToLogin() {
      this.currentScreen = GameScreensEnum.LOGIN;
    },
    onGoToRegister() {
      this.currentScreen = GameScreensEnum.REGISTER;
    },
    async onLoginSuccess() {
      this.onUpdateLoading(true);
      const { default: GamePreloaders } = await import(
        "./phaser/preloaders/GamePreloaders"
      );
      GamePreloaders.main();
      if (!this.gamePhaser) {
        const { default: GlobalPreloader } = await import(
          "./phaser/GlobalPreloader"
        );
        const { default: PublicAreaScene } = await import(
          "./phaser/PublicAreaScene"
        );
        // Solo creas la instancia la primera vez.
        this.gamePhaser = new Phaser.Game({
          type: Phaser.CANVAS,
          powerPreference: "high-performance",
          antialias: false, // Desactiva si no necesitas suavizado
          roundPixels: true, // Reduce cálculos de subpíxeles
          width: 1012,
          height: 657,
          // Registras todas las escenas globales que vayas a usar
          scene: [GlobalPreloader, PublicAreaScene],
          parent: "phaser-container",
          physics: {
            default: "arcade",
          },
          fps: {
            min: 30,
            target: 60,
            forceSetTimeOut: true, // Mantiene el juego corriendo aunque pierda foco
          },
        });
        // Lanzamos la escena de Preloader para que cargue todo
        this.gamePhaser.scene.start("GlobalPreloaderScene");
      }
      // Esperar a que termine la precarga antes de cambiar a LOBBY
      this.gamePhaser.events.on("globalPreloaderComplete", () => {
        this.currentScreen = GameScreensEnum.LOBBY;
      });
    },
    onJoinPublicArea(areaId) {
      console.log("Unido a la sala:", areaId);
      this.currentAreaId = areaId;
      this.currentScreen = GameScreensEnum.PUBLIC_AREA;
    },
    onExitLobby() {
      this.gamePhaser.scene.stop("PublicAreaScene");
      this.currentScreen = GameScreensEnum.LOBBY;
      this.currentAreaId = null;
    },
    handleDisconnect() {
      // Cambiar escena a login al detectar desconexión
      this.onUpdateLoading(true);
      this.gamePhaser.scene.stop("PublicAreaScene");
      this.currentScreen = GameScreensEnum.LOGIN;
      console.log("Desconexión detectada. Redirigiendo al login.");
      this.onUpdateLoading(false);
    },
    onUpdateLoading(value) {
      this.loading = value;
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
#game {
  width: 1012px;
  height: 657px;
  position: relative;
}

#phaser-container {
  width: 1012px;
  height: 657px;
  margin: auto;
  position: absolute;
  background-color: transparent; /* Para verificar visualmente */
  z-index: 0;
}

#game-screens {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  overflow: hidden;
}
</style>
