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
    <NpcComponent v-if="showNpcModal" @close="closeNpcModal" :npcId="npcId" />
    <AvatarSelectionPopup
      v-if="isAvatarSelectionVisible"
      :authUser="sceneData.authUser"
      @close-avatar-selection="hideAvatarSelection"
    />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import UserCardComponent from "../../../components/game/scenes/UserCardComponent.vue";
import RingInfoCardComponent from "../../../components/game/scenes/RingInfoCardComponent.vue";
import CoconutsInfoCardComponent from "../../../components/game/scenes/CoconutsInfoCardComponent.vue";
import BaseChatComponent from "../../../components/game/scenes/BaseChatComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";
import NpcComponent from "../../../components/game/scenes/NpcComponent.vue";
import AvatarSelectionPopup from "../../../components/game/scenes/AvatarSelectionPopup.vue";

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
      showNpcModal: false,
      npcId: null, // usa esto si quieres pasar datos al modal
      isRingInfoCardVisible: false,
      isCoconutsInfoCardVisible: false,
      isAvatarSelectionVisible: false,
    };
  },
  created() {
    this.$emit("updateLoading", true);
  },
  components: {
    UserCardComponent,
    BaseChatComponent,
    NpcComponent,
    RingInfoCardComponent,
    CoconutsInfoCardComponent,
    AvatarSelectionPopup,
  },
  methods: {
    initializeGame() {
      const gamePhaser = this.$root.gamePhaser;

      gamePhaser.scene.start("PublicScene", {
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
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
    },
    updateUserCard(userData) {
      //console.log("Usuario seleccionado:", userData);
      this.$refs.userCard.updateData(userData); // Llamar al método del componente hijo
    },
    openNpcModal(npcId) {
      // opcional: carga datos en currentNpcData
      // this.currentNpcData = { /* ... */ };
      this.npcId = npcId; // Guarda el ID del NPC
      this.showNpcModal = true;
    },
    closeNpcModal() {
      this.showNpcModal = false;
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
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {},
};
</script>

<style>
.game-container {
  width: 1012px;
  height: 657px;
  margin: auto;
  position: absolute;
  background-color: transparent; /* Para verificar visualmente */
  z-index: 0;
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
