<template>
  <div class="credits-component">
    <div class="credits-component__item">
      <img :src="asset_golden_coins_image" alt="Golden Coins" />
      <span class="gold">{{ gold }}</span>
    </div>
    <div class="credits-component__item">
      <img :src="asset_silver_coins_image" alt="Silver Coins" />
      <span class="silver">{{ silver }}</span>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_golden_coins_image from "@/assets/game/lobby/golden_coins.webp";
import asset_silver_coins_image from "@/assets/game/lobby/silver_coins.webp";

export default {
  data() {
    return {
      asset_golden_coins_image,
      asset_silver_coins_image,
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
.credits-component {
  display: flex;
  gap: 1px;
  position: absolute;
  bottom: 2px;
  left: 10px;
}

.credits-component__item {
  width: 85px;
  height: 100px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.credits-component__item span {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.credits-component__item span.gold {
  color: #d98933;
}

.credits-component__item span.silver {
  color: white;
}

.credits-component__item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
}
</style>
