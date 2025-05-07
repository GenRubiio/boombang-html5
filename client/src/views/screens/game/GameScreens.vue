<template>
  <LobbyScreen
    v-if="currentScreen === GameScreensEnum.LOBBY"
    @joinPublicScene="onJoinPublicScene"
    @updateLoading="onUpdateLoading"
  />
  <PublicSceneScreen
    v-else-if="currentScreen === GameScreensEnum.PUBLIC_SCENE"
    :sceneType="currentScreenType"
    @exitLobby="onExitLobby"
    @updateLoading="onUpdateLoading"
  />
  <MinigameSceneScreen
    v-else-if="currentScreen === GameScreensEnum.MINIGAME_SCENE"
    :sceneType="currentScreenType"
    @exitLobby="onExitLobby"
    @updateLoading="onUpdateLoading"
  />
</template>

<script>
import { defineAsyncComponent } from "vue";
import GameScreensEnum from "../../../enums/GameScreensEnum";

export default {
  props: {
    gamePhaser: Object, // Recibe la instancia de Phaser desde App.vue
  },
  data() {
    return {
      currentScreen: GameScreensEnum.LOBBY,
      currentScreenType: null,
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
    onJoinPublicScene(sceneType) {
      this.currentScreenType = sceneType;
      this.currentScreen = GameScreensEnum.PUBLIC_SCENE;
    },
    onExitLobby() {
      if (this.gamePhaser) {
        this.gamePhaser.scene.stop("PublicScene");
        this.gamePhaser.scene.stop("MinigameScene");
      }
      this.currentScreen = GameScreensEnum.LOBBY;
      this.currentScreenType = null;
    },
    onUpdateLoading(value) {
      this.$emit("updateLoading", value); // Propaga el evento a App.vue
    },
  },
};
</script>
