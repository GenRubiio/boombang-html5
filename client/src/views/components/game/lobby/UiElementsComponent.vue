<template>
  <div>
    <div class="lobby__background">
      <img :src="currentBackgroundImage" :alt="$t('lobby.ui.background_alt')" />
    </div>
    <div class="lobby__avatar">
      <img :src="asset_avatarImage" :alt="$t('lobby.ui.avatar_alt')" />
    </div>
    <GameClockComponent ref="gameClock" />
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
    <div class="lobby__mail" @click="openMailPanel">
      <img :src="asset_mail_image" :alt="$t('lobby.ui.mail_alt')" />
      <div v-if="mailStore.unreadCount > 0" class="lobby__mail-badge">
        {{ mailStore.unreadCount }}
      </div>
    </div>
    <div class="lobby__label mail">
      <span>{{ $t("lobby.ui.mail") }}</span>
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
    <MailPanelComponent />
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_background_image from "@/assets/game/lobby/background.webp";
import asset_background_night_image from "@/assets/game/lobby/background_night.png";
import asset_logout_image from "@/assets/game/lobby/logout.webp";
import asset_settings_image from "@/assets/game/lobby/settings.webp";
import asset_mail_image from "@/assets/game/lobby/mail.png";
import GachaponMachineComponent from "./GachaponMachineComponent.vue";
import AlertWishGachaComponent from "./gachapon/AlertWishGachaComponent.vue";
import HelpCardGachaComponent from "./gachapon/HelpCardGachaComponent.vue";
import GachaResultPopup from "./gachapon/GachaResultPopup.vue";
import ErrorPopup from "./gachapon/ErrorPopup.vue";
import CreditsComponent from "./CreditsComponent.vue";
import SettingsPopup from "./SettingsPopup.vue";
import GameClockComponent from "./GameClockComponent.vue";
import MailPanelComponent from "./MailPanelComponent.vue";
import { useMailStore } from "@/stores/MailStore";

export default {
  setup() {
    const mailStore = useMailStore();
    return { mailStore };
  },
  data() {
    return {
      mailListenersConfigured: false,
      isGachaAlertVisible: false,
      isHelpCardVisible: false,
      isGachaResultVisible: false,
      isErrorPopupVisible: false,
      isSettingsVisible: false,
      errorMessage: "",
      asset_background_night_image,
      asset_background_image,
      asset_avatarImage: null,
      asset_logout_image,
      asset_settings_image,
      asset_mail_image,
      isLogoutButtonClicked: false,
      gachaponItem: {
        name: null,
        image: null,
      },
      currentGameTime: this.getInitialGameTime(),
    };
  },
  computed: {
    currentBackgroundImage() {
      // Intentar obtener tiempo del GameClockComponent primero
      const gameClockTime = this.$refs.gameClock?.gameTime;
      let timeToUse =
        gameClockTime && gameClockTime !== "--:--"
          ? gameClockTime
          : this.currentGameTime;

      // Si aún no tenemos tiempo válido, intentar obtenerlo de localStorage
      if (!timeToUse || timeToUse === "--:--") {
        const savedState = localStorage.getItem("gameClockState");
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            const timeDiff = Date.now() - state.savedAt;
            const fiveMinutesInMs = 5 * 60 * 1000;

            if (
              timeDiff < fiveMinutesInMs &&
              state.initialGameTime &&
              state.initialGameTime !== "--:--"
            ) {
              const [hours, minutes] = state.initialGameTime
                .split(":")
                .map(Number);
              const initialTotalMinutes = hours * 60 + minutes;
              const elapsedRealMinutes =
                (Date.now() - state.initialTimestamp) / 1000 / 60;
              const elapsedGameMinutes = elapsedRealMinutes * 24;
              const currentTotalMinutes =
                (initialTotalMinutes + elapsedGameMinutes) % (24 * 60);
              const currentHours = Math.floor(currentTotalMinutes / 60);
              const currentMinutes = Math.floor(currentTotalMinutes % 60);
              timeToUse = `${currentHours
                .toString()
                .padStart(2, "0")}:${currentMinutes
                .toString()
                .padStart(2, "0")}`;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }

      if (!timeToUse || timeToUse === "--:--") {
        return this.asset_background_image;
      }

      const [hours] = timeToUse.split(":").map(Number);

      // Si es entre las 22:00 (10 PM) y las 06:00 (6 AM), usar imagen de noche
      if (hours >= 22 || hours < 6) {
        return this.asset_background_night_image;
      }

      return this.asset_background_image;
    },
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
            2: { top: "7px", left: "-17px" },
            3: { top: "5px", left: "-20px" },
            4: { top: "6px", left: "-23px" },
            5: { top: "2px", left: "-20px" },
            12: { top: "20px", left: "-20px" },
            13: { top: "5px", left: "-15px" },
            14: { top: "20px", left: "-20px" },
            17: { top: "10px", left: "-15px" },
          };

          const margin = margins[avatarId];
          if (margin) {
            avatarElement.style.marginTop = margin.top;
            avatarElement.style.marginLeft = margin.left;
          }
        }
      });

      // Sincronizar el tiempo del juego cada segundo
      this.timeUpdateInterval = setInterval(() => {
        if (
          this.$refs.gameClock &&
          this.$refs.gameClock.gameTime &&
          this.$refs.gameClock.gameTime !== "--:--"
        ) {
          this.currentGameTime = this.$refs.gameClock.gameTime;
        }
      }, 1000);

      // Forzar una actualización inicial después de un pequeño delay para asegurar sincronización
      this.$nextTick(() => {
        setTimeout(() => {
          if (
            this.$refs.gameClock &&
            this.$refs.gameClock.gameTime &&
            this.$refs.gameClock.gameTime !== "--:--"
          ) {
            this.currentGameTime = this.$refs.gameClock.gameTime;
          }
        }, 100);
      });

      // Configurar listeners solo una vez para evitar duplicados
      if (!this.mailListenersConfigured) {
        // Limpiar listeners existentes primero
        socket.off(ResponseSocketsEnum.GET_MAIL_INBOX);
        socket.off(ResponseSocketsEnum.MAIL_UNREAD_COUNT);
        socket.off(ResponseSocketsEnum.MAIL_READ);
        socket.off(ResponseSocketsEnum.CLAIM_REWARD_SUCCESS);
        socket.off(ResponseSocketsEnum.CLAIM_REWARD_ERROR);

        // Configurar listeners de socket para el sistema de correo
        socket.on(ResponseSocketsEnum.GET_MAIL_INBOX, (data) => {
          if (data.success) {
            this.mailStore.setMails(data.mails || []);
            this.mailStore.setUnreadCount(data.unread_count || 0);
            this.mailStore.setLoading(false);
          } else {
            this.mailStore.setMails([]);
            this.mailStore.setUnreadCount(0);
            this.mailStore.setLoading(false);
          }
        });

        socket.on(ResponseSocketsEnum.MAIL_UNREAD_COUNT, (data) => {
          this.mailStore.setUnreadCount(data.unread_count);
        });

        socket.on(ResponseSocketsEnum.MAIL_READ, (data) => {
          if (data.success) {
            this.mailStore.markMailAsRead(data.mail_id);
          }
        });

        socket.on(ResponseSocketsEnum.CLAIM_REWARD_SUCCESS, (data) => {
          this.mailStore.setClaiming(false);
          if (data.success) {
            this.mailStore.markMailAsClaimed(data.mail_id);
            
            // Emitir evento para mostrar notificación
            window.dispatchEvent(
              new CustomEvent("mail-reward-claimed", {
                detail: data,
              })
            );
          }
        });

        socket.on(ResponseSocketsEnum.CLAIM_REWARD_ERROR, (data) => {
          this.mailStore.setClaiming(false);
          console.error('Error al reclamar recompensas:', data.message || data);
          // Mostrar una notificación de error al usuario
          alert('Error al reclamar recompensas: ' + (data.message || 'Error desconocido'));
        });

        this.mailListenersConfigured = true;

        // Cargar correos automáticamente al entrar al lobby (DESPUÉS de configurar listeners)
        setTimeout(() => {
          this.mailStore.setLoading(true);
          socket.emit(RequestSocketsEnum.GET_MAIL_INBOX);
        }, 100);
      }
    } catch (error) {
      console.error(this.$t("lobby.ui.avatar_error"), error);
    }
  },
  beforeUnmount() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    
    // Limpiar listeners de socket
    socket.off(ResponseSocketsEnum.GET_MAIL_INBOX);
    socket.off(ResponseSocketsEnum.MAIL_UNREAD_COUNT);
    socket.off(ResponseSocketsEnum.MAIL_READ);
    socket.off(ResponseSocketsEnum.CLAIM_REWARD_SUCCESS);
    socket.off(ResponseSocketsEnum.CLAIM_REWARD_ERROR);
    
    // Resetear bandera
    this.mailListenersConfigured = false;
  },
  activated() {
    // Hook llamado cuando el componente se activa después de estar inactivo
    // Útil para resincronizar el tiempo cuando se regresa al lobby
    this.$nextTick(() => {
      if (this.$refs.gameClock) {
        this.$refs.gameClock.forceSync();
      }
    });
  },
  watch: {
    // Observar cambios en el tiempo del socket para actualizar inmediatamente
    "$socket.user.game_time": {
      handler(newTime) {
        if (
          newTime &&
          newTime !== "--:--" &&
          newTime !== this.currentGameTime
        ) {
          this.currentGameTime = newTime;
          // También actualizar el GameClockComponent si está disponible
          if (this.$refs.gameClock) {
            this.$refs.gameClock.forceSync();
          }
        }
      },
      immediate: false,
    },
  },
  components: {
    GachaponMachineComponent,
    AlertWishGachaComponent,
    HelpCardGachaComponent,
    GachaResultPopup,
    ErrorPopup,
    CreditsComponent,
    GameClockComponent,
    SettingsPopup,
    MailPanelComponent,
  },
  methods: {
    getInitialGameTime() {
      // Intentar obtener el tiempo desde localStorage si está disponible y es reciente
      const savedState = localStorage.getItem("gameClockState");
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const timeDiff = Date.now() - state.initialTimestamp;
          const fiveMinutesInMs = 5 * 60 * 1000;

          // Si los datos guardados son recientes (menos de 5 minutos), usarlos para evitar parpadeo
          if (timeDiff < fiveMinutesInMs && state.initialGameTime !== "--:--") {
            return state.initialGameTime;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Fallback al tiempo del socket o "--:--"
      return socket.user?.game_time || "--:--";
    },
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
    openMailPanel() {
      this.mailStore.openPanel();
      // Refrescar correos al abrir el panel
      this.mailStore.setLoading(true);
      socket.emit(RequestSocketsEnum.GET_MAIL_INBOX);
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

.lobby__label.mail {
  right: 265px;
  width: 100px;
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

.lobby__mail {
  position: absolute;
  bottom: 15px;
  right: 289px;
  z-index: 1;
  width: 50px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.lobby__mail img {
  width: 78px;
  height: 75px;
}

.lobby__mail-badge {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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
