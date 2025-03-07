<template>
  <div id="login">
    <img :src="background" alt="background" class="login__background" />
    <!-- Contenedor de nubes duplicadas para scroll continuo -->
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
    <div>Login</div>
    <form @submit.prevent="login">
      <input v-model="username" type="text" placeholder="Username" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
    <button @click="$emit('goToRegister')">
      ¿No tienes cuenta? Regístrate
    </button>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import background from "../../../assets/game/auth/background.png";
import cloud_background from "../../../assets/game/auth/clouds-background.png";

export default {
  data() {
    return {
      username: "Gen",
      password: "test",
      errorMessage: "",
      background,
      cloud_background,
    };
  },

  methods: {
    login() {
      this.$socket.emit(RequestSocketsEnum.LOGIN, {
        username: this.username,
        password: this.password,
      });

      this.$socket.off(ResponseSocketsEnum.LOGIN_SUCCESS);
      this.$socket.on(ResponseSocketsEnum.LOGIN_SUCCESS, (data) => {
        //alert(`Bienvenido, ${data.user.username}`);
        this.$socket.user = data.user;
        this.$emit("loginSuccess");
      });

      this.$socket.off(ResponseSocketsEnum.LOGIN_ERROR);
      this.$socket.on(ResponseSocketsEnum.LOGIN_ERROR, (error) => {
        //this.errorMessage = error;
        console.log(error);
      });
    },
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
