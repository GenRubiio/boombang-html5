<template>
  <div id="login">
    <img :src="background" alt="background" class="login__background" />
    <div class="login__clouds-wrapper">
      <div
        class="login__clouds"
        :style="{ backgroundImage: 'url(' + cloud_background + ')' }"
      ></div>
      <div
        class="login__clouds"
        :style="{ backgroundImage: 'url(' + cloud_background + ')' }"
      ></div>
    </div>
  </div>
</template>

<script>
import background from "../../../assets/game/auth/background.png";
import cloud_background from "../../../assets/game/auth/clouds-background.png";

export default {
  data() {
    return {
      background,
      cloud_background,
    };
  },

  methods: {},
};
</script>

<style scoped>
#login {
  position: relative;
  z-index: 1;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
}

.login__background {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  left: 0;
}

.login__clouds-wrapper {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 200%;
  animation: scrollWrapper 15s linear infinite;
}

.login__clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
}

.login__clouds:first-child {
  top: 0;
}

.login__clouds:last-child {
  top: 100%;
}

@keyframes scrollWrapper {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}
</style>
