<template>
  <div
    class="user-card unselectable"
    :class="computedClass"
    v-if="selectedUser"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <div class="user-card__header unselectable">
      {{ selectedUser.username }}
    </div>
    <div class="user-card__avatar-container">
      <div class="user-card__avatar-container__message-container">
        <div class="user-card__avatar-container__message-container__text"></div>
      </div>
      <div class="user-card__avatar-container__avatar">
        <FichaComponent :avatarId="selectedUser.avatar_id" />
      </div>
    </div>
    <div class="user-card__change-ficha" v-if="selectedUser.is_selected" @click="changeFicha">
      <img
        :src="asset_change_ficha_icon_image"
        alt="Change Ficha"
        class="user-card__change-ficha__icon"
      />
    </div>
    <UserDataTabsComponents
      v-if="!selectedUser.is_selected"
      :selectedUser="selectedUser"
    />
    <UserSelectedDataTabsComponent
      v-if="selectedUser.is_selected"
      :selectedUser="selectedUser"
      :authUser="authUser"
    />
  </div>
</template>

<script>
import socket from "../../../../sockets/socket";
import RequestSocketsEnum from "../../../../enums/RequestSocketsEnum";
import FichaComponent from "./user-card/FichaComponent.vue";
import UserDataTabsComponents from "./user-card/UserDataTabsComponents.vue";
import UserSelectedDataTabsComponent from "./user-card/UserSelectedDataTabsComponent.vue";
import asset_change_ficha_icon_image from "../../../../assets/game/ficha/change_ficha.svg";

export default {
  data() {
    return {
      selectedUser: null,
      authUser: null,
      asset_change_ficha_icon_image,
    };
  },
  components: {
    FichaComponent,
    UserDataTabsComponents,
    UserSelectedDataTabsComponent,
  },
  methods: {
    updateData(usersData) {
      //console.log("User data updated:", usersData);
      this.selectedUser = usersData.selectedUser;
      this.authUser = usersData.authUser;
    },
    changeFicha() {
      socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
        socketId: socket.id,
      });
    },
  },
  computed: {
    computedClass() {
      if (this.selectedUser.is_admin) {
        return "admin";
      }
      if (this.selectedUser.is_vip) {
        return "vip";
      }
      return this.selectedUser.is_selected ? "selected" : "user";
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
  pointer-events: auto;
}

.user-card__header {
  text-align: left;
  padding: 0 5px;
  border-radius: 5px;
  font-size: 23px;
  font-weight: bold;
  color: white;
}

.user-card.user .user-card__header {
  background-color: #005ea3;
}

.user-card.admin .user-card__header {
  background-color: #f59200;
}

.user-card.vip .user-card__header {
  background-color: #420143;
}

.user-card.selected .user-card__header {
  background-color: #045d03;
}

.user-card__avatar-container {
  display: flex;
  justify-content: space-between;
}

.user-card__avatar-container__avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
}

.user-card.user .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #194261;
}

.user-card.admin .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #b5a900;
}

.user-card.vip .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #6a006a;
}

.user-card.selected .user-card__avatar-container__avatar {
  box-shadow: inset 0 0 15px #0f3d00;
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

.user-card.user {
  background-color: #0069b5;
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

.user-card__change-ficha {
  position: absolute;
  right: 5px;
  top: 111px;
  opacity: 0.3;
  cursor: pointer;
}
</style>
