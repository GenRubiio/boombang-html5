<template>
  <div id="lobby">
    <UiElementsComponent />
    <div class="lobby__rooms">
      <div class="lobby__rooms-container">
        <div class="lobby__rooms-container__tabs">
          <div class="lobby__rooms-container__tabs-tab fixed-width selected">Areas</div>
          <div class="lobby__rooms-container__tabs-tab fixed-width">Juegos</div>
          <div class="lobby__rooms-container__tabs-tab fixed-width">Islas</div>
          <div class="lobby__rooms-container__tabs-tab"><i class="las la-search"></i></div>
        </div>
        <div class="lobby__rooms-list">
          <div
            v-for="publicScene in publicScenes"
            :key="publicScene.uuid"
            class="room"
          >
            <button @click="joinScene(publicScene.uuid)">
              {{ publicScene.name }}
              <span>{{ publicScene.total_users_in }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import UiElementsComponent from "../../components/game/lobby/UiElementsComponent.vue";

export default {
  data() {
    return {
      publicScenes: [],
    };
  },
  async created() {
    this.$emit("updateLoading", true);
    socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENES);

    socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES);
    socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES, (publicScenes) => {
      this.publicScenes = publicScenes;
      this.$emit("updateLoading", false);
    });
  },
  components: {
    UiElementsComponent,
  },
  methods: {
    joinScene(sceneUuid) {
      socket.emit(RequestSocketsEnum.JOIN_PUBLIC_SCENE, {
        sceneUuid: sceneUuid,
      });

      socket.off(ResponseSocketsEnum.JOIN_PUBLIC_SCENE);
      socket.on(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, (response) => {
        if (response.success) {
          let sceneryType = response.data.scenery.type;
          this.$emit("joinPublicScene", sceneryType, response.data);
        } else {
          console.log("Error al unirse a la sala.");
        }
      });
    },
  },
};
</script>

<style scoped>
#lobby {
  position: relative;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.lobby__rooms-container {
  background-color: #3c87b3ad;
  border-radius: 10px;
  padding: 10px;
  text-align: start;
  height: 100vh;
  max-height: 340px;
}

.lobby__rooms-container__tabs {
  display: flex;
  gap: 3px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lobby__rooms-container__tabs-tab {
  background-color: #3a4b54c9;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
}

.lobby__rooms-container__tabs-tab.selected {
  background-color: #1c2c35ad;
}

.lobby__rooms {
  position: relative;
  z-index: 1;
  color: white;
  padding: 25px 10px;
  border-radius: 10px;
  width: 255px;
}

.lobby__rooms-list {
  border-radius: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lobby__rooms-list button {
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

.lobby__rooms-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__rooms-list button span {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
}

.fixed-width{
  width: 100px;
  text-align: center;
}
</style>
