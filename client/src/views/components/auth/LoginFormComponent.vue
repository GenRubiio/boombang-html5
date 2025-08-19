<template>
  <form class="login-form" @submit.prevent="login">
    <div class="login-form__content">
      <div class="login-form__title">
        {{ $t("login.already_have_account") }}
      </div>
      <div class="login-form__input-container">
        <div class="login-form__error" v-if="showUsernameError">
          <img :src="asset_warning_image" alt="warning" />
          {{ usernameError }}
        </div>
        <div class="login-form__label">{{ $t("login.character_name") }}</div>
        <div class="login-form__input" @dragover.prevent @drop.prevent>
          <input
            v-model="username"
            ref="username"
            type="text"
            :placeholder="$t('login.username_placeholder')"
            required
          />
        </div>
      </div>
      <div class="login-form__label">{{ $t("login.password") }}</div>
      <div class="login-form__input" @dragover.prevent @drop.prevent>
        <input
          v-model="password"
          type="password"
          :placeholder="$t('login.password_placeholder')"
          required
        />
      </div>
      <div class="login-form__link">
        <div>{{ $t("login.forgot_password") }}</div>
      </div>
      <div class="login-form__google">
        <div class="login-form__google-separator">
          {{ $t("login.separator") }}
        </div>
        <GoogleLoginComponent @token-received="handleTokenReceived" />
      </div>
    </div>
    <div class="login-form__button-container">
      <img :src="asset_button_image" alt="Jugar" />
      <button
        class="login-form__button-container-button"
        type="submit"
        :class="{ 'disabled-button': loading || !isSocketConnected }"
      >
        {{ $t("login.play_button") }}
      </button>
    </div>
  </form>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import asset_button_image from "@/assets/game/auth/login-button-image.webp";
import asset_warning_image from "@/assets/game/auth/warning.webp";
import { useLanguageStore } from "@/stores/languageStore";
import GoogleLoginComponent from "./GoogleLoginComponent.vue";

export default {
  data() {
    return {
      username: "",
      password: "",
      usernameError: "",
      showUsernameError: false,
      loading: false,
      isSocketConnected: socket.connected,
      asset_button_image,
      asset_warning_image,
    };
  },
  components: {
    GoogleLoginComponent,
  },
  setup() {
    const languageStore = useLanguageStore();
    return { languageStore };
  },
  methods: {
    login() {
      if (this.loading || !this.isSocketConnected) return;
      this.resetErrors();
      this.loading = true;

      socket.emit(RequestSocketsEnum.LOGIN, {
        username: this.username,
        password: this.password,
      });
    },
    resetErrors() {
      this.showUsernameError = false;
      this.usernameError = "";
    },
    setErrors(errors) {
      if (errors.email) {
        this.showUsernameError = true;
        this.usernameError = errors.email[0];
      }
    },
    handleTokenReceived(idToken) {
      socket.emit(RequestSocketsEnum.LOGIN_OAUTH, { authToken: idToken });
    },
  },
  mounted() {
    this.$refs.username.focus();

    socket.off(ResponseSocketsEnum.LOGIN_SUCCESS);
    socket.on(ResponseSocketsEnum.LOGIN_SUCCESS, (data) => {
      if (data.user && data.user.lang) {
        this.languageStore.setLocale(data.user.lang);
      }
      socket.user = data.user;
      this.$emit("loginSuccess");
    });

    socket.off(ResponseSocketsEnum.LOGIN_ERROR);
    socket.on(ResponseSocketsEnum.LOGIN_ERROR, (error) => {
      console.error("Login error:", error);
      if (error.errors) {
        this.setErrors(error.errors);
      } else if (error.message) {
        this.showUsernameError = true;
        this.usernameError = error.message;
      }
      this.loading = false;
    });

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
  position: relative;
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

.login-form__input-container {
  position: relative;
}

.login-form__error {
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

.login-form__error::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 100%; /* Posiciona el triángulo a la derecha */
  transform: translateY(-50%);
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid black;
}

.login-form__error img {
  width: 10px;
  height: 10px;
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
