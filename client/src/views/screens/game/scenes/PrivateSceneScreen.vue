<template>
  <div class="game-container">
    <UserCardComponent
      ref="userCard"
      @open-ring-info="showRingInfoCard"
      @open-coconuts-info="showCoconutsInfoCard"
    />
    <RingInfoCardComponent
      v-if="isRingInfoCardVisible"
      @close-ring-info="hideRingInfoCard"
    />
    <CoconutsInfoCardComponent
      v-if="isCoconutsInfoCardVisible"
      @close-coconuts-info="hideCoconutsInfoCard"
    />
    <BaseChatComponent @exitLobby="exitToLobby" @sendMessage="sendMessage" />
    <AvatarSelectionPopup
      v-if="isAvatarSelectionVisible"
      :authUser="sceneData.authUser"
      @close-avatar-selection="hideAvatarSelection"
    />
    <RankingsComponent
      v-if="isRankingsVisible"
      :authUser="sceneData.authUser"
      @close-rankings="hideRankings"
    />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import UserCardComponent from "../../../components/game/scenes/UserCardComponent.vue";
import RingInfoCardComponent from "../../../components/game/scenes/RingInfoCardComponent.vue";
import CoconutsInfoCardComponent from "../../../components/game/scenes/CoconutsInfoCardComponent.vue";
import BaseChatComponent from "../../../components/game/scenes/BaseChatComponent.vue";
import AvatarSelectionPopup from "../../../components/game/scenes/AvatarSelectionPopup.vue";
import RankingsComponent from "../../../components/game/scenes/RankingsComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "../../../../enums/ResponseSocketsEnum.js";

export default {
  props: {
    sceneType: {
      type: Number,
      required: true,
    },
    sceneData: {
      required: true,
    },
  },
  data() {
    return {
      isRingInfoCardVisible: false,
      isCoconutsInfoCardVisible: false,
      isAvatarSelectionVisible: false,
      isRankingsVisible: false,
    };
  },
  created() {
    this.$emit("updateLoading", true);
  },
  components: {
    UserCardComponent,
    BaseChatComponent,
    RingInfoCardComponent,
    CoconutsInfoCardComponent,
    AvatarSelectionPopup,
    RankingsComponent,
  },
  methods: {
    initializeGame() {
      const gamePhaser = this.$root.gamePhaser;

      gamePhaser.scene.start("PrivateScene", {
        sceneType: this.sceneType,
        sceneData: this.sceneData,
        vueComponent: this,
      });
    },
    exitToLobby() {
      socket.emit(RequestSocketsEnum.USER_LEAVE_SCENE); // Enviar evento para salir de la sala
    },
    sendMessage(data) {
      socket.emit(RequestSocketsEnum.SEND_CHAT, {
        message: data.message,
        recipient: data.recipient,
      });
    },
    exitToLobbyResponse() {
      // Limpia el juego Phaser antes de salir
      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log("Saliendo de la sala...");
      }
      this.$emit("updateLoading", true);

      // Unirse a la room de la isla antes de volver a mostrar la IslandScreen
      socket.emit(RequestSocketsEnum.JOIN_ISLAND, {
        islandId: this.sceneData.scenery.island.data.id
      });

      this.$emit("joinIsland", this.sceneData.scenery.island.data);
    },
    updateUserCard(userData) {
      //console.log("Usuario seleccionado:", userData);
      this.$refs.userCard.updateData(userData); // Llamar al método del componente hijo
    },
    showRingInfoCard() {
      this.isRingInfoCardVisible = true;
      this.isCoconutsInfoCardVisible = false;
    },
    showCoconutsInfoCard() {
      this.isCoconutsInfoCardVisible = true;
      this.isRingInfoCardVisible = false;
    },
    hideRingInfoCard() {
      this.isRingInfoCardVisible = false;
    },
    hideCoconutsInfoCard() {
      this.isCoconutsInfoCardVisible = false;
    },
    showAvatarSelection() {
      this.isAvatarSelectionVisible = true;
    },
    hideAvatarSelection() {
      this.isAvatarSelectionVisible = false;
    },
    showRankings() {
      this.isRankingsVisible = true;
    },
    hideRankings() {
      this.isRankingsVisible = false;
    },
    handleForceLobbyRedirect(data) {
      // NO emitir USER_LEAVE_SCENE porque el servidor ya nos sacó de la escena
      // Detener la escena de Phaser
      const gamePhaser = this.$root.gamePhaser;
      if (gamePhaser) {
        gamePhaser.scene.stop("PrivateScene");
      }

      // Usar un timeout para asegurar que Phaser se detenga antes de cambiar la vista
      setTimeout(() => {
        // Buscar el componente GameScreens en la jerarquía
        let parent = this.$parent;
        while (parent && !parent.onExitLobby) {
          parent = parent.$parent;
        }

        if (parent && typeof parent.onExitLobby === 'function') {
          parent.onExitLobby();
        }
      }, 100);
    },
  },
  mounted() {
    this.initializeGame();

    // Escuchar evento de redirección forzada al lobby
    socket.on(ResponseSocketsEnum.FORCE_LOBBY_REDIRECT, this.handleForceLobbyRedirect);
  },
  beforeUnmount() {
    // Remover listener al desmontar el componente
    socket.off(ResponseSocketsEnum.FORCE_LOBBY_REDIRECT, this.handleForceLobbyRedirect);
  },
};
</script>

<style>
.game-container {
  width: 1012px;
  height: 657px;
  margin: auto;
  position: relative;
  background-color: transparent; /* Para verificar visualmente */
  z-index: 0;
  pointer-events: none; /* Dejar pasar eventos al canvas Phaser */
}

.game-container > *:not(#html-inventory):not(#html-detail-panel) {
  pointer-events: auto; /* Permitir eventos en los hijos directos excepto los paneles HTML */
}

.game-container > #html-inventory,
.game-container > #html-detail-panel {
  pointer-events: auto; /* Los paneles HTML sí deben capturar eventos */
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
</style>
