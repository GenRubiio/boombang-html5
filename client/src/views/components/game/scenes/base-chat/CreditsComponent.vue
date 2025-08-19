<template>
  <div class="base-chat__container_credits">
    <div class="base-chat__container_credits-gold-container">{{ gold }}</div>
    <div class="base-chat__container_credits-silver-container">
      {{ silver }}
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

export default {
  data() {
    return {
      gold: 0,
      silver: 0,
    };
  },
  mounted() {
    socket.off(ResponseSocketsEnum.REFRESH_USER_CREDITS);
    socket.on(ResponseSocketsEnum.REFRESH_USER_CREDITS, (data) => {
      this.gold = data.gold;
      this.silver = data.silver;
    });

    socket.emit(RequestSocketsEnum.REFRESH_USER_CREDITS);
  },
};
</script>

<style scoped>
.base-chat__container_credits {
  position: absolute;
  left: 15px;
  bottom: 13px;
  display: flex;
}

.base-chat__container_credits-gold-container,
.base-chat__container_credits-silver-container {
  width: 68px;
  height: 73px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 12px;
  margin-left: -2px;
}

.base-chat__container_credits-gold-container {
  color: #d98933;
}

.base-chat__container_credits-silver-container {
  color: white;
}
</style>
