<template>
  <div>
    <div class="lobby__background">
      <img :src="asset_background_image" alt="background" />
    </div>
    <div class="lobby__flor">
      <img :src="asset_flor_image" alt="flor" />
    </div>
    <div class="lobby__foreground">
      <img :src="asset_foreground_image" alt="foreground" />
    </div>
    <div class="lobby__marikita">
      <img :src="asset_marikita_image" alt="marikita" />
    </div>
    <div class="lobby__avatar">
      <img :src="asset_avatarImage" alt="avatar" />
    </div>
    <div class="lobby__logout">
      <img :src="asset_logout_image" alt="logout" @click="logout" />
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_background_image from "@/assets/game/lobby/background.webp";
import asset_flor_image from "@/assets/game/lobby/flor.webp";
import asset_foreground_image from "@/assets/game/lobby/foreground.webp";
import asset_marikita_image from "@/assets/game/lobby/marikita.webp";
import asset_logout_image from "@/assets/game/lobby/logout.webp";

export default {
  data() {
    return {
      asset_background_image,
      asset_flor_image,
      asset_foreground_image,
      asset_marikita_image,
      asset_avatarImage: null,
      asset_logout_image,
      isLogoutButtonClicked: false,
    };
  },
  async created() {
    try {
      const avatarUrl = new URL(
        `../../../../assets/game/lobby/avatars/${this.$socket.user.avatar_id}.svg`,
        import.meta.url
      ).href;
      this.asset_avatarImage = avatarUrl;
    } catch (error) {
      console.error("Error cargando el avatar:", error);
    }
  },
  components: {},
  methods: {
    logout() {
      if (this.isLogoutButtonClicked) return;
      this.isLogoutButtonClicked = true;
      socket.off(ResponseSocketsEnum.LOGOUT);
      socket.on(ResponseSocketsEnum.LOGOUT, () => {
        localStorage.removeItem("app_jwt");
        location.reload();
      });
      socket.emit(RequestSocketsEnum.LOGOUT);
    },
  },
};
</script>

<style scoped>
.lobby__background img {
  position: absolute;
  top: -22px;
  left: 0;
  z-index: 0;
}

.lobby__flor img {
  position: absolute;
  bottom: -53px;
  left: 39px;
  z-index: 0;
}

.lobby__marikita img {
  position: absolute;
  bottom: -196px;
  left: -119px;
  z-index: 0;
}

.lobby__foreground img {
  position: absolute;
  top: 227px;
  left: 0px;
  z-index: 0;
}

.lobby__logout img {
  position: absolute;
  bottom: 13px;
  right: -10px;
  z-index: 1;
  width: 155px;
  display: flex;
  justify-content: center;
  cursor: pointer;
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
