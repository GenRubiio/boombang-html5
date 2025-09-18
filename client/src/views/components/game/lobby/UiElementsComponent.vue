<template>
  <div>
    <div class="lobby__background">
      <img :src="asset_background_image" :alt="$t('lobby.ui.background_alt')" />
    </div>
    <div class="lobby__avatar">
      <img :src="asset_avatarImage" :alt="$t('lobby.ui.avatar_alt')" />
    </div>
    <div class="lobby__logout">
      <img
        :src="asset_logout_image"
        :alt="$t('lobby.ui.logout_alt')"
        @click="logout"
      />
    </div>
    <div class="lobby__label logout">
      <span>{{ $t("lobby.ui.logout") }}</span>
    </div>
    <div class="lobby__gachapon">
      <GachaponMachineComponent
        ref="gachaponMachine"
        :title-text="$t('lobby.gacha.title')"
        :price-text="$t('lobby.gacha.price')"
        :speed="1"
        @request-purchase="showGachaAlert"
        @show-prize="showGachaResult"
      />
      <div class="help-button" @click="isHelpCardVisible = true">
        <i class="las la-question"></i>
      </div>
    </div>
    <div class="lobby__label gachapon">
      <span>{{ $t("lobby.ui.gachapon") }}</span>
    </div>
    <CreditsComponent />
    <div class="lobby__label credits">
      <span>{{ $t("lobby.ui.credits") }}</span>
    </div>
    <div class="lobby__settings">
      <img
        :src="asset_settings_image"
        :alt="$t('lobby.ui.settings_alt')"
        @click="openSettings"
      />
    </div>
    <div class="lobby__label settings">
      <span>{{ $t("lobby.ui.settings") }}</span>
    </div>
    <AlertWishGachaComponent
      :visible="isGachaAlertVisible"
      @confirm="handleGachaConfirm"
      @cancel="handleGachaCancel"
    />
    <HelpCardGachaComponent
      v-if="isHelpCardVisible"
      @close="isHelpCardVisible = false"
    />
    <GachaResultPopup
      :visible="isGachaResultVisible"
      :item="gachaponItem"
      @close="handleGachaResultClose"
    />
    <ErrorPopup
      :visible="isErrorPopupVisible"
      :message="errorMessage"
      @close="handleErrorPopupClose"
    />
    <SettingsPopup
      v-if="isSettingsVisible"
      @close="isSettingsVisible = false"
    />
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_background_image from "@/assets/game/lobby/background.webp";
import asset_logout_image from "@/assets/game/lobby/logout.webp";
import asset_settings_image from "@/assets/game/lobby/settings.webp";
import GachaponMachineComponent from "./GachaponMachineComponent.vue";
import AlertWishGachaComponent from "./gachapon/AlertWishGachaComponent.vue";
import HelpCardGachaComponent from "./gachapon/HelpCardGachaComponent.vue";
import GachaResultPopup from "./gachapon/GachaResultPopup.vue";
import ErrorPopup from "./gachapon/ErrorPopup.vue";
import CreditsComponent from "./CreditsComponent.vue";
import SettingsPopup from "./SettingsPopup.vue";

export default {
  data() {
    return {
      isGachaAlertVisible: false,
      isHelpCardVisible: false,
      isGachaResultVisible: false,
      isErrorPopupVisible: false,
      isSettingsVisible: false,
      errorMessage: "",
      asset_background_image,
      asset_avatarImage: null,
      asset_logout_image,
      asset_settings_image,
      isLogoutButtonClicked: false,
      gachaponItem: {
        name: null,
        image: null,
      },
    };
  },
  async mounted() {
    try {
      const avatarUrl = new URL(
        `../../../../assets/game/lobby/avatars/${socket.user.avatar_id}.svg`,
        import.meta.url
      ).href;
      this.asset_avatarImage = avatarUrl;

      this.$nextTick(() => {
        const avatarElement = this.$el.querySelector(".lobby__avatar");
        if (avatarElement) {
          const avatarId = this.$socket.user.avatar_id;

          const margins = {
            1: { top: "15px", left: "-25px" },
            5: { top: "2px", left: "-20px" },
            12: { top: "20px", left: "-20px" },
            17: { top: "10px", left: "-15px" },
          };

          const margin = margins[avatarId];
          if (margin) {
            avatarElement.style.marginTop = margin.top;
            avatarElement.style.marginLeft = margin.left;
          }
        }
      });
    } catch (error) {
      console.error(this.$t("lobby.ui.avatar_error"), error);
    }
  },
  beforeUnmount() {},
  components: {
    GachaponMachineComponent,
    AlertWishGachaComponent,
    HelpCardGachaComponent,
    GachaResultPopup,
    ErrorPopup,
    CreditsComponent,
    SettingsPopup,
  },
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
    showGachaAlert() {
      this.isGachaAlertVisible = true;
    },
    handleGachaConfirm() {
      this.isGachaAlertVisible = false;
      socket.off(ResponseSocketsEnum.LOBBY_GACHA_SPIN);
      socket.on(ResponseSocketsEnum.LOBBY_GACHA_SPIN, (data) => {
        if (data.success) {
          this.$refs.gachaponMachine.triggerAnimation();
          this.gachaponItem.name = data.item.name;
          this.gachaponItem.image = data.item.image;
        } else {
          this.errorMessage = data.message;
          this.isErrorPopupVisible = true;
          this.$refs.gachaponMachine.enableHandle();
        }
      });
      socket.emit(RequestSocketsEnum.LOBBY_GACHA_SPIN);
    },
    handleGachaCancel() {
      this.isGachaAlertVisible = false;
      this.$refs.gachaponMachine.enableHandle();
    },
    handleGachaResultClose() {
      this.isGachaResultVisible = false;
      this.$refs.gachaponMachine.enableHandle();
    },
    handleErrorPopupClose() {
      this.isErrorPopupVisible = false;
    },
    showGachaResult() {
      this.isGachaResultVisible = true;
    },
    openSettings() {
      this.isSettingsVisible = true;
    },
  },
};
</script>

<style scoped>
.lobby__gachapon {
  position: absolute;
  bottom: -157px;
  right: 515px;
  width: 45%;
  z-index: 1;
}

.lobby__background {
  position: absolute;
  left: 0;
  z-index: 0;
}

.lobby__background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.lobby__label {
  position: absolute;
  bottom: 0px;
  right: 10px;
  z-index: 1;
  width: 127px;
  display: flex;
  justify-content: center;
  border: 5px solid white;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: #019a02;
  color: white;
  font-weight: bold;
}

.lobby__label.logout {
  right: 10px;
  width: 127px;
}

.lobby__label.gachapon {
  left: 190px;
  width: 150px;
}

.lobby__label.credits {
  left: 27px;
  width: 124px;
}

.lobby__settings img {
  position: absolute;
  bottom: 20px;
  right: 165px;
  z-index: 1;
  width: 75px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.lobby__label.settings {
  bottom: 0px;
  right: 151px;
  width: 100px;
}

.help-button {
  position: absolute;
  top: 45px;
  right: 159px;
  background-color: #000000;
  color: #ffffff;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
</style>
