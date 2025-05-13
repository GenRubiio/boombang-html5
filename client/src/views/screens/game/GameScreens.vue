<template>
  <LobbyScreen
    v-if="currentScreen === GameScreensEnum.LOBBY"
    @joinPublicScene="onJoinPublicScene"
    @updateLoading="onUpdateLoading"
  />
  <PublicSceneScreen
    v-else-if="currentScreen === GameScreensEnum.PUBLIC_SCENE"
    :sceneType="currentScreenType"
    :sceneData="sceneData"
    @exitLobby="onExitLobby"
    @updateLoading="onUpdateLoading"
  />
  <MinigameSceneScreen
    v-else-if="currentScreen === GameScreensEnum.MINIGAME_SCENE"
    :sceneType="currentScreenType"
    :sceneData="sceneData"
    @exitLobby="onExitLobby"
    @updateLoading="onUpdateLoading"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import GameScreensEnum from "../../../enums/GameScreensEnum";
import socket from "../../../sockets/socket.js";

export default {
  props: {
    gamePhaser: Object, // Recibe la instancia de Phaser desde App.vue
  },
  data() {
    return {
      currentScreen: GameScreensEnum.LOBBY,
      currentScreenType: null,
      sceneData: null,
      GameScreensEnum,
    };
  },
  components: {
    LobbyScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/LobbyScreen.vue")
    ),
    PublicSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/PublicSceneScreen.vue")
    ),
    MinigameSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/MinigameSceneScreen.vue")
    ),
  },
  methods: {
    onJoinPublicScene(sceneType, sceneData) {
      this.sceneData = sceneData;
      this.currentScreenType = sceneType;
      this.currentScreen = GameScreensEnum.PUBLIC_SCENE;
    },
    onExitLobby() {
      if (this.gamePhaser) {
        this.gamePhaser.scene.stop("PublicScene");
        this.gamePhaser.scene.stop("MinigameScene");
      }
      this.sceneData = null;
      this.currentScreen = GameScreensEnum.LOBBY;
      this.currentScreenType = null;
    },
    onUpdateLoading(value) {
      this.$emit("updateLoading", value); // Propaga el evento a App.vue
    },
    onJoinMinigameScene(sceneType, sceneData) {
      this.sceneData = sceneData;
      this.currentScreenType = sceneType;
      this.currentScreen = GameScreensEnum.MINIGAME_SCENE;
    },
  },
  mounted() {
    socket.off("response:join_minigame");
    socket.on("response:join_minigame", (data) => {
      if (data.success) {
        this.onJoinMinigameScene(data.sceneType);
      } else {
        console.log("Error al unirse a la sala.");
      }
    });
    // Detectar desconexión del socket
    //socket.on("disconnect", this.handleDisconnect);
    //
    //// Detectar reconexión
    //socket.on("connect", () => {
    //  //console.log("Reconectado al servidor");
    //});
    //
    //socket.on("error_critical", this.handleDisconnect);
  },
  beforeUnmount() {
    // Remover listeners de socket para evitar fugas de memoria
    //socket.off("disconnect", this.handleDisconnect);
    //socket.off("connect");
    //socket.off("error_critical", this.handleDisconnect);
  },
};
</script>
