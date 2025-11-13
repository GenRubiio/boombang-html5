<template>
  <div class="lobby__scenes-tab">
    <div class="lobby__scenes-list" ref="scrollContainer">
      <SpinnerComponent v-if="isLoading" />
      <div v-else v-for="gameScene in gameScenes" :key="gameScene.uuid" class="scene-item">
        <button @click="handleClick(gameScene.uuid, MenuTypeEnum.GAME_SCENE)" :disabled="isJoining">
          <span class="scene-name">{{ gameScene.name }}</span>
          <span class="user-count">{{ gameScene.total_users_in }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../../sockets/socket";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../../enums/ResponseSocketsEnum";
import MenuTypeEnum from "../../../../enums/MenuTypeEnum";
import { useOverlayScrollbars } from '@/composables/useOverlayScrollbars';
import SpinnerComponent from '../../common/SpinnerComponent.vue';
import 'overlayscrollbars/overlayscrollbars.css';

export default {
  components: {
    SpinnerComponent,
  },
  data() {
    return {
      MenuTypeEnum,
      isJoining: false,
      gameScenes: [],
      isLoading: true,
    };
  },
  created() {
    this.loadGames();
  },
  mounted() {
    const { initScrollbars } = useOverlayScrollbars();
    initScrollbars(this.$refs.scrollContainer);
  },
  methods: {
    handleClick(sceneUuid, menuType) {
      if (this.isJoining) return;
      this.isJoining = true;
      this.$emit("join-scene", sceneUuid, menuType);
    },
    loadGames() {
      this.isLoading = true;
      socket.emit(RequestSocketsEnum.GET_GAME_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_GAME_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_GAME_SCENES, (gameScenes) => {
        this.gameScenes = gameScenes;
        this.isLoading = false;
      });
    },
  },
};
</script>

<style scoped>
.lobby__scenes-list {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 315px;
  overflow: hidden;
}

.scene-item {
  margin-bottom: 5px;
}

.scene-item:last-child {
  margin-bottom: 0;
}

.lobby__scenes-list button {
  background-color: #3a4b54c9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px;
  width: 100%;
  text-align: left;
  font-size: 15px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s ease;
  gap: 5px;
}

.lobby__scenes-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
}

.scene-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.user-count {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  flex-shrink: 0;
}
</style>
