<template>
  <div id="game">
    <div id="phaser-container"></div>
    <LoadingScreen v-if="loading" />
    <div id="game-screens">
      <AuthScreen
        v-if="!isAuthenticated"
        @loginSuccess="onLoginSuccess"
        @registerSuccess="onRegisterSuccess"
        @goToRegister="onGoToRegister"
      />
      <GameScreens
        v-else
        :gamePhaser="gamePhaser"
        @updateLoading="onUpdateLoading"
      />
    </div>
  </div>
</template>

<script>
import Phaser from "phaser";
import { defineAsyncComponent } from "vue";
import socket from "./sockets/socket";
import GameScreensEnum from "./enums/GameScreensEnum";
import ColorReplacePipelinePlugin from "phaser3-rex-plugins/plugins/colorreplacepipeline-plugin.js";

export default {
  data() {
    return {
      gamePhaser: null,
      loading: false,
      isAuthenticated: false, // Nueva bandera de autenticación
    };
  },
  created() {
    //setInterval(() => {
    //  console.log("Eventos registrados:", socket._callbacks);
    //}, 5000);
    //console.log("Server URL:", import.meta.env.VITE_SERVER_URL);
  },
  components: {
    LoadingScreen: defineAsyncComponent(() =>
      import("./views/screens/game/LoadingScreen.vue")
    ),
    AuthScreen: defineAsyncComponent(() =>
      import("./views/screens/auth/AuthScreen.vue")
    ),
    GameScreens: defineAsyncComponent(() =>
      import("./views/screens/game/GameScreens.vue")
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
        this.isAuthenticated = true; // Activa GameScreens
        this.onUpdateLoading(false);
      });
    },
    async initializePhaser() {
      const { default: GlobalPreloader } = await import(
        "./phaser/GlobalPreloader"
      );
      const { default: PublicScene } = await import("./phaser/PublicScene");
      const { default: PrivateScene } = await import("./phaser/PrivateScene");
      const { default: MinigameScene } = await import("./phaser/MinigameScene");
      // Solo creas la instancia la primera vez.
      let phaserType = Phaser.AUTO;
      switch (socket.user.phaser_rendering_type) {
        case "webgl":
          phaserType = Phaser.WEBGL;
          break;
        case "canvas":
          phaserType = Phaser.CANVAS;
          break;
        default:
          phaserType = Phaser.AUTO;
      }
      const LOGICAL_WIDTH = 1012;
      const LOGICAL_HEIGHT = 657;
      this.gamePhaser = new Phaser.Game({
        type: phaserType,
        powerPreference: socket.user.phaser_power_preference || "default", // "high-performance", "low-power", "default"
        antialias: socket.user.phaser_antialias ? true : false, // Desactiva si no necesitas suavizado
        antialiasGL: socket.user.phaser_antialias_gl ? true : false, // Desactiva si no necesitas suavizado en WebGL
        roundPixels: socket.user.phaser_round_pixels ? true : false, // Reduce cálculos de subpíxeles
        pixelArt: socket.user.phaser_pixel_art ? true : false, // Esencial para evitar el antialiasing que causa el blur
        width: LOGICAL_WIDTH,
        height: LOGICAL_HEIGHT,
        // Registras todas las escenas globales que vayas a usar
        scene: [GlobalPreloader, PublicScene, PrivateScene, MinigameScene],
        plugins: {
          global: [
            {
              key: "rexColorReplacePipeline",
              plugin: ColorReplacePipelinePlugin,
              start: false,
            },
          ],
        },
        resolution: window.devicePixelRatio || 1,
        parent: "phaser-container",
        dom: {
          createContainer: true,
        },
        physics: {
          default: "arcade",
        },
        fps: {
          min: 30,
          target: 60,
          forceSetTimeOut: true, // Mantiene el juego corriendo aunque pierda foco
        },
        autoFocus: true,
        callbacks: {
          postBoot: function (game) {
            game.events.off("hidden", game.renderer.onHidden, game.renderer);
            game.events.off("visible", game.renderer.onVisible, game.renderer);
            game.scene.getScenes(true).forEach((s) => {
              if (s.cameras?.main) s.cameras.main.roundPixels = true;
            });
          },
        },
      });
      // Lanzamos la escena de Preloader para que cargue todo
      this.gamePhaser.scene.start("GlobalPreloaderScene");

      //TODO: Lo aplicaremos cuando terminemos nuevo logca de importacion de texturas
      //const dpi = 2;
      //this.gamePhaser.scale.resize(LOGICAL_WIDTH * dpi, LOGICAL_HEIGHT * dpi);
      //this.gamePhaser.canvas.style.width = LOGICAL_WIDTH + "px";
      //this.gamePhaser.canvas.style.height = LOGICAL_HEIGHT + "px";
    },
    handleDisconnect() {
      this.onUpdateLoading(true);
      if (this.gamePhaser && this.gamePhaser.scene) {
        this.gamePhaser.scene.stop("PublicScene");
        this.gamePhaser.scene.stop("MinigameScene");
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
  overflow: hidden;
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
  pointer-events: none;
}
</style>
