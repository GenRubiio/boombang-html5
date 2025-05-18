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
    <GameSceneScreen
      v-else-if="currentScreen === GameScreensEnum.GAME_SCENE"
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
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import MenuTypeEnum from "../../../enums/MenuTypeEnum";

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
    GameSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/GameSceneScreen.vue")
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
      this.currentScreen =
        sceneData.scenery.menu_type == MenuTypeEnum.PUBLIC_SCENE
          ? GameScreensEnum.PUBLIC_SCENE
          : GameScreensEnum.GAME_SCENE;
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
    socket.off(ResponseSocketsEnum.MINIGAME_JOIN);
    socket.on(ResponseSocketsEnum.MINIGAME_JOIN, (response) => {
      if (response.success) {
        this.onJoinMinigameScene(response.sceneType, response.data);
      } else {
        console.log("Error al unirse a la sala.");
      }
    });
    socket.off(ResponseSocketsEnum.MINIGAME_CALL_NOTIFICATION);
    socket.on(ResponseSocketsEnum.MINIGAME_CALL_NOTIFICATION, () => {
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
