<template>
  <div class="game-screens">
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
    <NotificationMinigameComponent
      v-if="showMinigameNotification"
      @close="showMinigameNotification = false"
    />
  </div>
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
      showMinigameNotification: false,
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
    NotificationMinigameComponent: defineAsyncComponent(() =>
      import("../../components/interface/NotificationMinigameComponent.vue")
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
    socket.on("response:join_minigame", (response) => {
      if (response.success) {
        this.onJoinMinigameScene(response.sceneType, response.data);
      } else {
        console.log("Error al unirse a la sala.");
      }
    });
    socket.off("response:minigame_call_notification");
    socket.on("response:minigame_call_notification", () => {
      this.showMinigameNotification = true;
    });
  },
  beforeUnmount() {},
};
</script>

<style>
.game-screens {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
