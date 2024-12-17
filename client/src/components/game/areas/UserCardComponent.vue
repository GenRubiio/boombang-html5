<template>
  <div class="user-card" :class="computedClass">
    <div class="user-card__header">
      {{ user.username }}
    </div>
    <div class="user-card__body">
      <div v-if="user.is_selected">
        <button @click="sendUppercut">Send Upper</button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../phaser/enums/RequestSocketsEnum";

export default {
  data() {
    return {
      user: {
        username: "Unknown",
        is_player_data: true,
        is_admin: false,
        is_vip: false,
        is_selected: false,
        gender: "man",
      },
    };
  },
  methods: {
    updateData(userData) {
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
  width: 200px;
  margin: 10px;
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

.user-card__header {
  text-align: left;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  font-size: 20px;
  font-weight: bold;
  color: white;
}
</style>
