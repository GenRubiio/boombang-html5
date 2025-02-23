<template>
  <div class="user-card unselectable" :class="computedClass">
    <div class="user-card__header unselectable">
      {{ user.username }}
    </div>
    <div class="user-card__avatar-container">
      <div class="user-card__avatar-container__message-container">
        <div class="user-card__avatar-container__message-container__text"></div>
      </div>
      <div class="user-card__avatar-container__avatar">
        <FichaComponent :avatarId="user.avatar_id" />
      </div>
    </div>
    <div class="user-card__body unselectable">
      <div v-if="user.is_selected">
        <button @click="sendUppercut">Send Upper</button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import FichaComponent from "./user-card/FichaComponent.vue";

export default {
  data() {
    return {
      user: {
        username: "Unknown",
        is_player_data: true,
        is_admin: false,
        is_vip: false,
        is_selected: false,
        avatar_id: 1,
        gender: "man",
      },
    };
  },
  components: {
    FichaComponent,
  },
  methods: {
    updateData(userData) {
      console.log("User data updated:", userData);
      this.user = userData;
    },
    sendUppercut() {
      socket.emit(RequestSocketsEnum.SEND_UPPERCUT);
    },
  },
  computed: {
    computedClass() {
      if (this.user.is_admin) {
        return "admin";
      }
      if (this.user.is_vip) {
        return "vip";
      }
      if (this.user.is_selected) {
        return "selected";
      } else {
        return this.user.gender === "man" ? "player-man" : "player-women";
      }
    },
  },
};
</script>

<style scoped>
.user-card {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 10px;
  width: 180px;
  margin: 10px;
}

.user-card__header {
  text-align: left;
  padding: 0 5px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.user-card__avatar-container {
  display: flex;
  justify-content: space-between;
}

.user-card__avatar-container__avatar {
  width: 90px;
  height: 90px;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  overflow: hidden;
}

.user-card__avatar-container__avatar img {
  margin-top: -12px;
}

.user-card__avatar-container {
  position: relative;
  padding: 5px;
}

.user-card.admin {
  background-color: #ffd700;
}

.user-card.vip {
  background-color: #800080;
}

.user-card.player-man {
  background-color: #0069b5;
}

.user-card.player-women {
  background-color: #ff1b64;
}

.user-card.selected {
  background-color: #2b8703;
}

.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
  user-select: none;
}
</style>
