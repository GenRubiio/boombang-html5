<template>
  <div id="lobby">
    <div class="lobby__background">
      <img :src="asset_backgroundImage" alt="background" />
    </div>
    <div class="lobby__flor">
      <img :src="asset_florImage" alt="flor" />
    </div>
    <div class="lobby__foreground">
      <img :src="asset_foregroundImage" alt="foreground" />
    </div>
    <div class="lobby__marikita">
      <img :src="asset_marikitaImage" alt="marikita" />
    </div>
    <div class="lobby__avatar">
      <img :src="asset_avatarImage" alt="avatar" />
    </div>
    <div>
      <button
        style="position: absolute; bottom: 0; right: 0; padding: 10px;"
        @click="suscribeRing"
      >
        PLAY
      </button>
    </div>
    <div class="lobby__rooms">
      <div class="lobby__rooms-container">
        <div class="lobby__rooms-container-title">Areas</div>
        <hr />
        <div class="lobby__rooms-list">
          <div
            v-for="publicScene in publicScenes"
            :key="publicScene.id"
            class="room"
          >
            <button @click="joinScene(publicScene.type)">
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
import asset_backgroundImage from "../../../assets/game/lobby/background.webp";
import asset_florImage from "../../../assets/game/lobby/flor.webp";
import asset_foregroundImage from "../../../assets/game/lobby/foreground.webp";
import asset_marikitaImage from "../../../assets/game/lobby/marikita.webp";

export default {
  data() {
    return {
      publicScenes: [],
      asset_backgroundImage,
      asset_florImage,
      asset_foregroundImage,
      asset_marikitaImage,
      asset_avatarImage: null,
    };
  },
  async created() {
    this.$emit("updateLoading", true);
    socket.emit(RequestSocketsEnum.GET_PUBLIC_AREAS);

    socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS);
    socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, (publicScenes) => {
      //console.log(publicScenes);
      this.publicScenes = publicScenes;
      this.$emit("updateLoading", false);
    });

    try {
      const { default: avatarImage } = await import(
        /* @vite-ignore */ `../../../assets/game/lobby/avatars/${this.$socket.user.avatar_id}.svg`
      );
      this.asset_avatarImage = avatarImage;
    } catch (error) {
      console.error("Error cargando el avatar:", error);
    }
  },
  components: {},
  methods: {
    joinScene(sceneType) {
      socket.emit(RequestSocketsEnum.JOIN_PUBLIC_AREA, { areaId: sceneType });

      socket.off(ResponseSocketsEnum.JOIN_PUBLIC_AREA);
      socket.on(ResponseSocketsEnum.JOIN_PUBLIC_AREA, (response) => {
        if (response.success) {
          this.$emit("joinPublicScene", sceneType, response.data);
        } else {
          console.log("Error al unirse a la sala.");
        }
      });
    },
    suscribeRing() {
      socket.emit("request:minigame_subscribe", {
        type: 1,
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
}

.lobby__rooms-container {
  background-color: #3c87b3ad;
  border-radius: 10px;
  padding: 10px;
  text-align: start;
  height: 100vh;
  max-height: 340px;
}

.lobby__rooms-container-title {
  font-size: 26px;
  font-weight: bold;
  color: white;
}

.lobby__background img {
  position: absolute;
  top: -22px;
  left: 0;
  z-index: 0;
}

.lobby__flor img {
  position: absolute;
  top: 0px;
  left: 35px;
  z-index: 0;
}

.lobby__marikita img {
  position: absolute;
  top: 395px;
  left: -222px;
  z-index: 0;
}

.lobby__foreground img {
  position: absolute;
  top: 227px;
  left: 0px;
  z-index: 0;
}

.lobby__rooms {
  position: relative;
  z-index: 1;
  color: white;
  padding: 25px 10px;
  border-radius: 10px;
  width: 240px;
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

.lobby__avatar {
  position: absolute;
  top: 277px;
  left: 431px;
  z-index: 1;
  width: 100px;
  display: flex;
  justify-content: center;
}

@keyframes floatAnimation {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(20px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
