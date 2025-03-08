<template>
  <div id="login">
    <MaintenanceComponent v-if="!isSocketConnected" />
    <img :src="background" alt="background" class="auth__background" />
    <div class="auth__clouds-wrapper">
      <div
        class="auth__clouds"
        :style="{ backgroundImage: 'url(' + cloud_background + ')' }"
      ></div>
      <div
        class="auth__clouds"
        :style="{ backgroundImage: 'url(' + cloud_background + ')' }"
      ></div>
    </div>
    <div class="auth__content">
      <div>
        <RegisterTopButtonComponent />
      </div>
      <div class="auth__content__form">
        <LoginFormComponent @loginSuccess="$emit('loginSuccess')" />
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import background from "../../../assets/game/auth/background.png";
import cloud_background from "../../../assets/game/auth/clouds-background.png";
import LoginFormComponent from "../../components/auth/LoginFormComponent.vue";
import RegisterTopButtonComponent from "../../components/auth/RegisterTopButtonComponent.vue";
import { defineAsyncComponent } from "vue";

export default {
  data() {
    return {
      background,
      cloud_background,
      isSocketConnected: socket.connected,
    };
  },
  components: {
    LoginFormComponent,
    RegisterTopButtonComponent,
    MaintenanceComponent: defineAsyncComponent(() =>
      import("../../components/auth/MaintenanceComponent.vue")
    ),
  },
  methods: {},
  mounted() {
    socket.on("connect", () => {
      this.isSocketConnected = true;
    });
    socket.on("disconnect", () => {
      this.isSocketConnected = false;
    });
  },
};
</script>

<style scoped>
#login {
  position: relative;
  z-index: 1;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth__background {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  left: 0;
}

.auth__clouds-wrapper {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 200%;
  animation: scrollWrapper 15s linear infinite;
}

.auth__clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
}

.auth__clouds:first-child {
  top: 0;
}

.auth__clouds:last-child {
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

.auth__content__form {
  width: 310px;
  box-sizing: border-box;
  background-color: #003d6c;
  padding: 10px;
  border-radius: 10px;
}
</style>
