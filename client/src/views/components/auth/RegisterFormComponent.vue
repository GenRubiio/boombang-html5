<template>
  <form class="register-form" @submit.prevent="register">
    <div class="register-form__content">
      <div class="register-form__title">{{ $t("register.title") }}</div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showUsernameError">
          <img :src="asset_warning_image" alt="warning" />
          {{ usernameError }}
        </div>
        <div class="register-form__label">
          {{ $t("register.character_name") }}
        </div>
        <div class="register-form__input" @dragover.prevent @drop.prevent>
          <input
            v-model="username"
            ref="username"
            type="text"
            :placeholder="$t('register.username_placeholder')"
            required
          />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showPasswordError">
          <img :src="asset_warning_image" alt="warning" />
          {{ passwordError }}
        </div>
        <div class="register-form__label">{{ $t("register.password") }}</div>
        <div class="register-form__input" @dragover.prevent @drop.prevent>
          <input
            v-model="password"
            type="password"
            :placeholder="$t('register.password_placeholder')"
            required
          />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__error" v-if="showEmailError">
          <img :src="asset_warning_image" alt="warning" />
          {{ emailError }}
        </div>
        <div class="register-form__label">{{ $t("register.email") }}</div>
        <div class="register-form__input" @dragover.prevent @drop.prevent>
          <input
            v-model="email"
            type="email"
            :placeholder="$t('register.email_placeholder')"
            required
          />
        </div>
      </div>
      <div class="register-form__input-container">
        <div class="register-form__terms">
          <input id="checkbox" type="checkbox" required />
          <label for="checkbox"> {{ $t("register.terms_agree") }}</label>
          <a :href="termsUrl" target="_blank">{{
            $t("register.terms_and_conditions")
          }}</a>
        </div>
      </div>
      <!-- Error de captcha -->
      <div class="register-form__input-container" v-if="showCaptchaError">
        <div class="register-form__error">
          <img :src="asset_warning_image" alt="warning" />
          {{ captchaError }}
        </div>
      </div>

      <!-- Contenedor del reCAPTCHA -->
      <div class="register-form__input-container g-recaptcha">
        <div ref="recaptchaEl"></div>
      </div>
    </div>
    <div class="register-form__button-container">
      <img :src="asset_button_image" alt="Jugar" />
      <button
        class="register-form__button-container-button"
        type="submit"
        :class="{ 'disabled-button': loading || !isSocketConnected }"
      >
        {{ $t("register.play_button") }}
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

      recaptchaWidgetId: null,
      recaptchaToken: "",
      showCaptchaError: false,
      captchaError: "",
      siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,

      loading: false,
      isSocketConnected: socket.connected,
      asset_button_image,
      asset_warning_image,
      termsUrl: import.meta.env.VITE_WEB_TERMS_URL,
    };
  },
  methods: {
    register() {
      if (this.loading || !this.isSocketConnected) return;
      this.resetErrors();

      // Aseguramos que hay token válido
      if (!this.recaptchaToken) {
        this.showCaptchaError = true;
        this.captchaError = this.$t("register.captcha_required");
        return;
      }

      this.loading = true;

      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log("Enviando solicitud de registro..." + this.recaptchaToken);
      }
      socket.emit(RequestSocketsEnum.REGISTER, {
        username: this.username,
        email: this.email,
        password: this.password,
        avatar_id: this.avatar_id,
        recaptcha: this.recaptchaToken,
      });

      socket.off(ResponseSocketsEnum.REGISTER_SUCCESS);
      socket.on(ResponseSocketsEnum.REGISTER_SUCCESS, (data) => {
        if (data.user && data.user.lang) {
          this.languageStore.setLocale(data.user.lang);
        }
        if (data.user?.authJwt) {
          localStorage.setItem("app_jwt", data.user.authJwt);
        }
        socket.user = data.user;
        this.$emit("loginSuccess");
      });

      socket.off(ResponseSocketsEnum.REGISTER_ERROR);
      socket.on(ResponseSocketsEnum.REGISTER_ERROR, (error) => {
        if (error.errors) {
          this.setErrors(error.errors);
        }
        if (import.meta.env.VITE_APP_ENV === "local") {
          console.log(error);
        }
        this.loading = false;
      });
    },
    resetErrors() {
      this.showUsernameError = false;
      this.showEmailError = false;
      this.showPasswordError = false;
      this.showCaptchaError = false;
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
      if (errors.recaptcha) {
        this.showCaptchaError = true;
        this.captchaError = errors.recaptcha[0];
        this.resetRecaptcha();
      }
    },
    // ---- reCAPTCHA helpers ----
    ensureRecaptchaScript() {
      return new Promise((resolve, reject) => {
        if (window.grecaptcha) return resolve();

        const script = document.createElement("script");
        // hl opcional según idioma actual
        const lang = (this.$i18n?.locale || "es").split("-")[0];
        script.src = `https://www.google.com/recaptcha/api.js?onload=___recaptchaOnload&render=explicit&hl=${lang}`;
        script.async = true;
        script.defer = true;

        window.___recaptchaOnload = () => resolve();
        script.onerror = () =>
          reject(new Error(this.$t("register.captcha_load_error")));
        document.head.appendChild(script);
      });
    },

    async renderRecaptcha() {
      await this.ensureRecaptchaScript();

      if (this.recaptchaWidgetId !== null) return; // ya renderizado

      this.recaptchaWidgetId = window.grecaptcha.render(
        this.$refs.recaptchaEl,
        {
          sitekey: this.siteKey,
          theme: "light", // o "dark"
          callback: this.onRecaptchaVerified, // éxito
          "expired-callback": this.onRecaptchaExpired,
          "error-callback": this.onRecaptchaError,
        }
      );
    },

    onRecaptchaVerified(token) {
      this.recaptchaToken = token;
      this.showCaptchaError = false;
      this.captchaError = "";
    },

    onRecaptchaExpired() {
      this.recaptchaToken = "";
      this.showCaptchaError = true;
      this.captchaError = this.$t("register.captcha_expired");
    },

    onRecaptchaError() {
      this.recaptchaToken = "";
      this.showCaptchaError = true;
      this.captchaError = this.$t("register.captcha_error");
    },

    resetRecaptcha() {
      if (this.recaptchaWidgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(this.recaptchaWidgetId);
      }
      this.recaptchaToken = "";
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

    // renderizar captcha
    this.renderRecaptcha().catch(() => {
      this.showCaptchaError = true;
      this.captchaError = this.$t("register.captcha_load_error");
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

/* Contenedor responsivo */
.g-recaptcha {
  transform: scale(0.89);
  transform-origin: 0 0;
  margin-top: 10px;
}

/* Evita que aparezcan barras de scroll */
.g-recaptcha iframe {
  max-width: 100% !important;
}
</style>
