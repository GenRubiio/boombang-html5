<template>
  <form class="login-form" @submit.prevent="login">
    <div class="login-form__content">
      <div class="login-form__title">Ya tienes cuenta?</div>
      <div class="login-form__label">Nombre del Personaje</div>
      <div class="login-form__input">
        <input
          v-model="username"
          ref="username"
          type="text"
          placeholder="Nombre"
          required
        />
      </div>
      <div class="login-form__label">Contraseña</div>
      <div class="login-form__input">
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          required
        />
      </div>
      <div class="login-form__link">
        <div>Has olvidado tu contraseña?</div>
      </div>
      <div class="login-form__google">
        <div class="login-form__google-separator">O</div>
        <div class="login-form__google-button">
          <img :src="google_image" alt="Google" /> Continuar con Google
        </div>
      </div>
    </div>
    <div class="login-form__button-container">
      <img :src="button_image" alt="Jugar" />
      <button
        class="login-form__button-container-button"
        type="submit"
        :class="{ 'disabled-button': loading || !isSocketConnected }"
      >
        Jugar
      </button>
    </div>
  </form>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import button_image from "../../../assets/game/auth/login-button-image.png";
import google_image from "../../../assets/game/auth/google.png";

export default {
  data() {
    return {
      username: "Gen",
      password: "test",
      errorMessage: "",
      loading: false,
      isSocketConnected: socket.connected,
      button_image,
      google_image,
    };
  },
  methods: {
    login() {
      if (this.loading || !this.isSocketConnected) return;
      this.loading = true;

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
        this.loading = false;
      });
    },
  },
  mounted() {
    this.$refs.username.focus();

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
.login-form {

}

.login-form__content {
  background-color: #0072c6;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: start;
  padding: 10px;
}

.login-form__title {
  font-size: 22px;
  font-weight: bold;
  color: white;
}

.login-form__label {
  font-size: 16px;
  font-weight: bold;
  color: #003d6c;
}

.login-form__input {
  margin-bottom: 5px;
}

.login-form__input input {
  width: 100%;
  box-sizing: border-box;
  font-size: 22px;
  border-radius: 5px;
  background-color: #0d97f1;
  border: none;
  color: white;
  font-weight: bold;
}

.login-form__input input:hover,
.login-form__input input:focus,
.login-form__input input:active {
  outline: none;
}
.login-form__input input::placeholder {
  color: #0072c6;
}

.login-form__button-container-button {
  font-size: 26px;
  display: inline-block;
  padding: 10px 20px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid #0072c6;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: linear-gradient(to bottom, #6bd0fa 0%, #008ed6 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.login-form__button-container-button:hover {
  background: linear-gradient(to bottom, #ffd167 0%, #ff9d0a 100%);
}

.login-form__button-container-button:active,
.login-form__button-container-button:focus {
  border-style: outset;
  outline: none;
}

.login-form__link {
  color: #ffff00;
  text-decoration: underline;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}

.login-form__button-container {
  position: relative;
  margin: 35px 0 10px;
}

.login-form__button-container img {
  position: absolute;
  top: -26px;
  right: 87px;
  z-index: 1;
}

.login-form__google-button {
  display: flex;
  align-content: center;
  justify-content: center;
  background-color: #003d6c;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.login-form__google-button:hover {
  background-color: #0d97f1;
}

.login-form__google-separator {
  display: flex;
  width: 100%;
  align-content: center;
  color: #003d6c;
  font-weight: bold;
  margin-top: 10px;
}

.login-form__google-separator::before {
  content: "";
  display: block;
  border-top: 1px solid #003d6c;
  margin: 10px 0;
  width: 50%;
}

.login-form__google-separator::after {
  content: "";
  display: block;
  border-top: 1px solid #003d6c;
  margin: 10px 0;
  width: 50%;
}

.login-form__google img {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.disabled-button {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
