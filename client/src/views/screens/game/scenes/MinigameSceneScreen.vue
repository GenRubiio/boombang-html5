<template>
  <div class="game-container">
    <UserCardComponent ref="userCard" />
    <BaseChatComponent @exitLobby="exitToLobby" @sendMessage="sendMessage" />
    <CounterMinigameComponent v-if="showCounter" :counter="counter" />
    <AlertMinigameComponent
      v-if="showAlert"
      :alertType="alertType"
      :winnerName="winnerName"
    />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket.js";
import UserCardComponent from "../../../components/game/scenes/UserCardComponent.vue";
import BaseChatComponent from "../../../components/game/scenes/BaseChatComponent.vue";
import CounterMinigameComponent from "../../../components/game/minigames/CounterMinigameComponent.vue";
import AlertMinigameComponent from "../../../components/game/minigames/AlertMinigameComponent.vue";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "../../../../enums/ResponseSocketsEnum.js";
import MinigameAlertsEnum from "../../../../enums/MinigameAlertsEnum.js";
import { useNpcSubscriptionStore } from "../../../../stores/npcSubscription.js";
import NpcEnum from "../../../../enums/NpcEnum.js";

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
      counter: 999,
      showCounter: false,
      showAlert: false,
      alertType: "win",
      winnerName: null,
    };
  },
  created() {
    this.$emit("updateLoading", true);
  },
  components: {
    UserCardComponent,
    BaseChatComponent,
    CounterMinigameComponent,
    AlertMinigameComponent,
  },
  methods: {
    initializeGame() {
      const gamePhaser = this.$root.gamePhaser;

      gamePhaser.scene.start("MinigameScene", {
        sceneType: this.sceneType,
        sceneData: this.sceneData,
        vueComponent: this,
      });
    },
    exitToLobby() {
      const store = useNpcSubscriptionStore();
      store.toggle(NpcEnum.WISE_RING);
      socket.emit(RequestSocketsEnum.USER_LEAVE_AREA); // Enviar evento para salir de la sala
    },
    sendMessage(message) {
      socket.emit(RequestSocketsEnum.SEND_CHAT, {
        message: message,
      });
    },
    exitToLobbyResponse() {
      // Limpia el juego Phaser antes de salir
      console.log("Saliendo de la sala...");
      this.$emit("updateLoading", true);
      this.$emit("exitLobby"); // Emite un evento para cambiar la escena
    },
    updateUserCard(userData) {
      //console.log("Usuario seleccionado:", userData);
      this.$refs.userCard.updateData(userData); // Llamar al método del componente hijo
    },
  },
  mounted() {
    this.initializeGame();
    socket.off(ResponseSocketsEnum.MINIGAME_COUNTER);
    socket.on(ResponseSocketsEnum.MINIGAME_COUNTER, (response) => {
      if (response.show) {
        this.counter = response.counter;
        this.showCounter = true;
      } else {
        this.showCounter = false;
      }
    });
    socket.off(ResponseSocketsEnum.MINIGAME_ALERT);
    socket.on(ResponseSocketsEnum.MINIGAME_ALERT, (response) => {
      this.alertType = response.alertType;
      switch (response.alertType) {
        case MinigameAlertsEnum.WIN:
          this.winnerName = response.winnerName;
          break;
      }
      this.showAlert = true;
    });
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
