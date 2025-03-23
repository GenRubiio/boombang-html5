<template>
  <div id="game">
    <div id="phaser-container"></div>
    <LoadingScreen v-if="loading" />
    <div id="game-screens">
      <AuthScreen
        v-if="currentScreen === 'login'"
        @loginSuccess="onLoginSuccess"
        @registerSuccess="onRegisterSuccess"
        @goToRegister="onGoToRegister"
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
import { defineAsyncComponent } from "vue";
import socket from "./sockets/socket";
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
    LoadingScreen: defineAsyncComponent(() =>
      import("./views/screens/game/LoadingScreen.vue")
    ),
    AuthScreen: defineAsyncComponent(() =>
      import("./views/screens/auth/AuthScreen.vue")
    ),
    LobbyScreen: defineAsyncComponent(() =>
      import("./views/screens/game/LobbyScreen.vue")
    ),
    PublicAreaScreen: defineAsyncComponent(() =>
      import("./views/screens/game/areas/PublicSceneScreen.vue")
    ),
  },
  methods: {
    onGoToLogin() {
      this.currentScreen = GameScreensEnum.LOGIN;
    },
    onGoToRegister() {
      this.currentScreen = GameScreensEnum.REGISTER;
    },
    async onRegisterSuccess() {
      this.onLoginSuccess();
    },
    async onLoginSuccess() {
      this.onUpdateLoading(true);
      const { default: GamePreloaders } = await import(
        "./phaser/preloaders/GamePreloaders"
      );
      GamePreloaders.main();
      if (!this.gamePhaser) {
        await this.initializePhaser();
      }
      // Esperar a que termine la precarga antes de cambiar a LOBBY
      this.gamePhaser.events.on("globalPreloaderComplete", () => {
        this.currentScreen = GameScreensEnum.LOBBY;
      });
    },
    async initializePhaser() {
      const { default: GlobalPreloader } = await import(
        "./phaser/GlobalPreloader"
      );
      const { default: PublicScene } = await import(
        "./phaser/PublicScene"
      );
      // Solo creas la instancia la primera vez.
      this.gamePhaser = new Phaser.Game({
        type: Phaser.WEBGL,
        powerPreference: "high-performance",
        antialias: false, // Desactiva si no necesitas suavizado
        roundPixels: true, // Reduce cálculos de subpíxeles
        width: 1012,
        height: 657,
        // Registras todas las escenas globales que vayas a usar
        scene: [GlobalPreloader, PublicScene],
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
    },
    onJoinPublicArea(areaId) {
      //console.log("Unido a la sala:", areaId);
      this.currentAreaId = areaId;
      this.currentScreen = GameScreensEnum.PUBLIC_AREA;
    },
    onExitLobby() {
      this.gamePhaser.scene.stop("PublicScene");
      this.currentScreen = GameScreensEnum.LOBBY;
      this.currentAreaId = null;
    },
    handleDisconnect() {
      this.onUpdateLoading(true);
      if (this.gamePhaser && this.gamePhaser.scene) {
        this.gamePhaser.scene.stop("PublicScene");
      }
      this.gamePhaser = null;
      document.getElementById("phaser-container").innerHTML = "";
      this.currentScreen = GameScreensEnum.LOGIN;
      this.onUpdateLoading(false);

      location.reload();
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
      //console.log("Reconectado al servidor");
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
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
</style>
