<template>
  <div class="game-screens">
    <LobbyScreen
      v-if="currentScreen === GameScreensEnum.LOBBY"
      @joinPublicScene="onJoinPublicScene"
      @updateLoading="onUpdateLoading"
      @createIsland="onCreateIsland"
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
    <IslandCreateScreen
      v-else-if="currentScreen === GameScreensEnum.ISLAND_CREATE"
      @exit="onExitIslandCreation"
      @updateLoading="onUpdateLoading"
      @exitLobby="onExitLobby"
    />
    <IslandScreen
      v-else-if="currentScreen === GameScreensEnum.ISLAND"
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
    PrivateSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/PrivateSceneScreen.vue")
    ),
    GameSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/GameSceneScreen.vue")
    ),
    MinigameSceneScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/scenes/MinigameSceneScreen.vue")
    ),
    IslandCreateScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/island/IslandCreateScreen.vue")
    ),
    IslandScreen: defineAsyncComponent(() =>
      import("../../../views/screens/game/island/IslandScreen.vue")
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
    // Nuevo método para manejar creación de islas
    onCreateIsland() {
      this.currentScreen = GameScreensEnum.ISLAND_CREATE;
    },
    // Método para salir de la creación de islas
    onExitIslandCreation() {
      this.currentScreen = GameScreensEnum.LOBBY;
    },
    onJoinIsland(sceneData) {
      this.sceneData = sceneData;
      this.currentScreen = GameScreensEnum.ISLAND;
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

    socket.off(ResponseSocketsEnum.JOIN_ISLAND);
    socket.on(ResponseSocketsEnum.JOIN_ISLAND, (response) => {
      this.onJoinIsland(response.island);
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
