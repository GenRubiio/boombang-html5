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
    <NpcComponent
      v-if="isNpcModalVisible"
      :npcId="currentNpcId"
      :npcType="currentNpcType"
      @close="closeNpcModal"
    />
    <InventoryPublicSceneComponent
      v-if="isInventoryVisible"
      @close-inventory="hideInventory"
    />
    <ShopComponent
      v-if="isShopVisible"
      :authUser="sceneData.authUser"
      @close-shop="hideShop"
      @purchase-success="handlePurchaseSuccess"
    />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import UserCardComponent from "../../../components/game/scenes/UserCardComponent.vue";
import BaseChatComponent from "../../../components/game/scenes/BaseChatComponent.vue";
import RingInfoCardComponent from "../../../components/game/scenes/RingInfoCardComponent.vue";
import CoconutsInfoCardComponent from "../../../components/game/scenes/CoconutsInfoCardComponent.vue";
import AvatarSelectionPopup from "../../../components/game/scenes/AvatarSelectionPopup.vue";
import RankingsComponent from "../../../components/game/scenes/RankingsComponent.vue";
import NpcComponent from "../../../components/game/scenes/public/NpcComponent.vue";
import InventoryPublicSceneComponent from "../../../components/game/scenes/public/InventoryPublicSceneComponent.vue";
import ShopComponent from "../../../components/game/scenes/ShopComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";
import InteractionNotificationController from "../../../../phaser/controllers/scene/InteractionNotificationController.js";

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
      isNpcModalVisible: false,
      isInventoryVisible: false,
      isShopVisible: false,
      currentNpcId: null,
      currentNpcType: null,
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
    NpcComponent,
    InventoryPublicSceneComponent,
    ShopComponent,
  },
  methods: {
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
    openNpcModal(npcId, npcType) {
      this.currentNpcId = npcId;
      this.currentNpcType = npcType;
      this.isNpcModalVisible = true;
    },
    closeNpcModal() {
      this.isNpcModalVisible = false;
      this.currentNpcId = null;
      this.currentNpcType = null;
    },
    showInventory() {
      // Cerrar la tienda si está abierta
      this.isShopVisible = false;
      this.isInventoryVisible = true;
    },
    hideInventory() {
      this.isInventoryVisible = false;
    },
    showShop() {
      // Cerrar el inventario si está abierto
      this.isInventoryVisible = false;
      this.isShopVisible = true;
    },
    hideShop() {
      this.isShopVisible = false;
    },
    handlePurchaseSuccess(userData) {
      // Actualizar el oro/plata del usuario en el componente padre
      if (this.sceneData && this.sceneData.authUser) {
        this.sceneData.authUser.gold = userData.gold;
        this.sceneData.authUser.silver = userData.silver;
      }
    },
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {
    // Clear all interaction notifications when leaving the scene
    InteractionNotificationController.clearAll();
  },
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
  pointer-events: none; /* Dejar pasar eventos al canvas Phaser */
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
