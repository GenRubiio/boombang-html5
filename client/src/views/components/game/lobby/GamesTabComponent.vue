<template>
  <div class="lobby__scenes-tab">
    <div class="lobby__scenes-list">
      <div v-for="gameScene in gameScenes" :key="gameScene.uuid">
        <button @click="joinScene(gameScene.uuid, MenuTypeEnum.GAME_SCENE)">
          {{ gameScene.name }}
          <span>{{ gameScene.total_users_in }}</span>
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
export default {
  data() {
    return {
      MenuTypeEnum,
      gameScenes: [],
    };
  },
  created() {
    this.loadGames();
  },
  methods: {
    joinScene(sceneUuid, menuType) {
      this.$emit("join-scene", sceneUuid, menuType);
    },
    loadGames() {
      socket.emit(RequestSocketsEnum.GET_GAME_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_GAME_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_GAME_SCENES, (gameScenes) => {
        this.gameScenes = gameScenes;
      });
    },
  },
};
</script>

<style scoped>
.lobby__scenes-list {
  border-radius: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
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
}

.lobby__scenes-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button span {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
}
</style>
