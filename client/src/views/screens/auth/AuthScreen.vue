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
        <div>
          <TopButtonComponent
            v-if="showForm == 'login'"
            title="Crear tu Cuenta"
            text="Registrarse y eligir Personaje"
            @click="changeForm('register')"
          />
          <TopButtonComponent
            v-if="showForm == 'register'"
            title="Iniciar Sesión"
            text="Iniciar Sesión con tu Cuenta"
            @click="changeForm('login')"
          />
        </div>
        <div class="auth__content__form">
          <LoginFormComponent
            v-if="showForm == 'login'"
            @loginSuccess="$emit('loginSuccess')"
          />
          <RegisterFormComponent
            v-if="showForm == 'register'"
            @registerSuccess="$emit('registerSuccess')"
          />
        </div>
      </div>
      <AvatarSelectComponent v-if="showForm == 'register'" />
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import background from "../../../assets/game/auth/background.png";
import cloud_background from "../../../assets/game/auth/clouds-background.png";
import LoginFormComponent from "../../components/auth/LoginFormComponent.vue";
import RegisterFormComponent from "../../components/auth/RegisterFormComponent.vue";
import TopButtonComponent from "../../components/auth/TopButtonComponent.vue";
import { defineAsyncComponent } from "vue";
import AvatarSelectComponent from "../../components/auth/AvatarSelectComponent.vue";

export default {
  data() {
    return {
      showForm: "login",
      background,
      cloud_background,
      isSocketConnected: socket.connected,
    };
  },
  components: {
    LoginFormComponent,
    RegisterFormComponent,
    TopButtonComponent,
    MaintenanceComponent: defineAsyncComponent(() =>
      import("../../components/auth/MaintenanceComponent.vue")
    ),
    AvatarSelectComponent,
  },
  methods: {
    changeForm(form) {
      this.showForm = form;
    },
  },
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

.auth__content {
  display: flex;
  gap: 10px;
}
</style>
