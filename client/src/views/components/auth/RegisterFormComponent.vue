<template>
  <form class="register-form" @submit.prevent="register">
    <div class="register-form__content">
      <div class="register-form__title">Crea tu cuenta</div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showUsernameError">
          <img :src="asset_warning_image" alt="warning" />
          {{ usernameError }}
        </div>
        <div class="register-form__label">Nombre del Personaje</div>
        <div class="register-form__input">
          <input
            v-model="username"
            ref="username"
            type="text"
            placeholder="Nombre"
            required
          />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showPasswordError">
          <img :src="asset_warning_image" alt="warning" />
          {{ passwordError }}
        </div>
        <div class="register-form__label">Contraseña</div>
        <div class="register-form__input">
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
          />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showEmailError">
          <img :src="asset_warning_image" alt="warning" />
          {{ emailError }}
        </div>
        <div class="register-form__label">Email</div>
        <div class="register-form__input">
          <input v-model="email" type="email" placeholder="Email" required />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__terms">
          <input id="checkbox" type="checkbox" required />
          <label for="checkbox"> I agree to these</label>
          <a>Terms and Conditions</a>
        </div>
      </div>
    </div>
    <div class="register-form__button-container">
      <img :src="asset_button_image" alt="Jugar" />
      <button
        class="register-form__button-container-button"
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
import asset_button_image from "../../../assets/game/auth/login-button-image.webp";
import asset_warning_image from "../../../assets/game/auth/warning.webp";

export default {
  props: {
    avatar_id: Number,
  },
  data() {
    return {
      username: "",
      password: "",
      email: "",
      showUsernameError: false,
      showEmailError: false,
      showPasswordError: false,
      usernameError: "",
      emailError: "",
      passwordError: "",
      loading: false,
      isSocketConnected: socket.connected,
      asset_button_image,
      asset_warning_image,
    };
  },
  methods: {
    register() {
      if (this.loading || !this.isSocketConnected) return;
      this.resetErrors();
      this.loading = true;

      this.$socket.emit(RequestSocketsEnum.REGISTER, {
        username: this.username,
        email: this.email,
        password: this.password,
        avatar_id: this.avatar_id,
      });

      this.$socket.off(ResponseSocketsEnum.REGISTER_SUCCESS);
      this.$socket.on(ResponseSocketsEnum.REGISTER_SUCCESS, (data) => {
        this.$socket.user = data.user;
        this.$emit("loginSuccess");
      });

      this.$socket.off(ResponseSocketsEnum.REGISTER_ERROR);
      this.$socket.on(ResponseSocketsEnum.REGISTER_ERROR, (error) => {
        if (error.errors) {
          this.setErrors(error.errors);
        }
        this.loading = false;
      });
    },
    resetErrors() {
      this.showUsernameError = false;
      this.showEmailError = false;
      this.showPasswordError = false;
      this.usernameError = "";
      this.emailError = "";
      this.passwordError = "";
    },
    setErrors(errors) {
      if (errors.username) {
        this.showUsernameError = true;
        this.usernameError = errors.username[0];
      }
      if (errors.email) {
        this.showEmailError = true;
        this.emailError = errors.email[0];
      }
      if (errors.password) {
        this.showPasswordError = true;
        this.passwordError = errors.password[0];
      }
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
.register-form {
  position: relative;
}

.register-form__content {
  background-color: #0072c6;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: start;
  padding: 10px;
}

.register-form__title {
  font-size: 22px;
  font-weight: bold;
  color: white;
}

.register-form__label {
  font-size: 16px;
  font-weight: bold;
  color: #003d6c;
}

.register-form__input {
  margin-bottom: 5px;
}

.register-form__input input {
  width: 100%;
  box-sizing: border-box;
  font-size: 22px;
  border-radius: 5px;
  background-color: #0d97f1;
  border: none;
  color: white;
  font-weight: bold;
}

.register-form__input input:hover,
.register-form__input input:focus,
.register-form__input input:active {
  outline: none;
}
.register-form__input input::placeholder {
  color: #0072c6;
}

.register-form__button-container-button {
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

.register-form__button-container-button:hover {
  background: linear-gradient(to bottom, #ffd167 0%, #ff9d0a 100%);
}

.register-form__button-container-button:active,
.register-form__button-container-button:focus {
  border-style: outset;
  outline: none;
}

.register-form__button-container {
  position: relative;
  margin: 35px 0 10px;
}

.register-form__button-container img {
  position: absolute;
  top: -26px;
  right: 87px;
  z-index: 1;
}

.disabled-button {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-form__input-container {
  position: relative;
}

.register-form__error {
  position: absolute;
  background-color: #000000ab;
  color: white;
  padding: 5px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 14px;
  width: 165px;
  left: -187px;
  top: 20px;
}

.register-form__error::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 100%; /* Posiciona el triángulo a la derecha */
  transform: translateY(-50%);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid black;
}

.register-form__error img {
  width: 10px;
  height: 10px;
}

.register-form__terms {
  margin-top: 20px;
  font-size: 14px;
  color: white;
}

.register-form__terms input {
  transform: scale(2);
}

.register-form__terms a {
  margin-left: 5px;
  color: yellow;
  text-decoration: underline;
  cursor: pointer;
}

.register-form__terms input[type="checkbox"] {
  margin-right: 10px;
}
</style>
