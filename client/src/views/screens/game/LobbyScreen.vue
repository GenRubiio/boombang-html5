<template>
  <div id="lobby">
    <div class="lobby__background">
      <img :src="background" alt="background" />
    </div>
    <div class="lobby__flor">
      <img :src="flor" alt="flor" />
    </div>
    <div class="lobby__foreground">
      <img :src="foreground" alt="foreground" />
    </div>
    <div class="lobby__marikita">
      <img :src="marikita" alt="marikita" />
    </div>
    <div class="lobby__avatar">
      <img :src="avatar" alt="avatar" />
    </div>
    <div class="lobby__rooms">
      <h1>{{ $socket.user.avatar_id }}</h1>
      <div v-for="area in areas" :key="area.id" class="room">
        <p>{{ area.name }} ({{ area.total_users_in }})</p>
        <button @click="joinRoom(area.id)">Join Room</button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import background from "../../../assets/game/lobby/background.png";
import flor from "../../../assets/game/lobby/flor.webp";
import foreground from "../../../assets/game/lobby/foreground.png";
import marikita from "../../../assets/game/lobby/marikita.webp";

export default {
  data() {
    return {
      areas: [],
      background,
      flor,
      foreground,
      marikita,
      avatar: null,
    };
  },
  async created() {
    this.$emit("updateLoading", true);
    socket.emit(RequestSocketsEnum.GET_PUBLIC_AREAS);

    socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS);
    socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, (areas) => {
      //console.log(areas);
      this.areas = areas;
      this.$emit("updateLoading", false);
    });

    try {
      const { default: avatarImage } = await import(
        /* @vite-ignore */ `../../../assets/game/lobby/avatars/${this.$socket.user.avatar_id}.svg`
      );
      this.avatar = avatarImage;
    } catch (error) {
      console.error("Error cargando el avatar:", error);
    }
  },
  components: {},
  methods: {
    joinRoom(areaId) {
      socket.emit(RequestSocketsEnum.JOIN_PUBLIC_AREA, { areaId: areaId });

      socket.off(ResponseSocketsEnum.JOIN_PUBLIC_AREA);
      socket.on(ResponseSocketsEnum.JOIN_PUBLIC_AREA, (data) => {
        if (data.success) {
          this.$emit("joinPublicArea", areaId);
        } else {
          console.log("Error al unirse a la sala.");
        }
      });
    },
  },
};
</script>

<style>
#lobby {
  position: relative;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  background-color: black;
  color: white;
  padding: 10px;
  border-radius: 10px;
  width: 200px;
}

.lobby__avatar img {
  position: absolute;
  top: 266px;
  left: 455px;
  z-index: 1;
  animation: floatAnimation 1.5s ease-in-out forwards;
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
