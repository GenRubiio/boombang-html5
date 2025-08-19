<template>
  <div 
    class="login-form__google-button"
    @click="handleLogin"
  >
    <img :src="asset_google_image" alt="Google" class="google-icon" />
    {{ $t("login.google_login") }}
  </div>
</template>

<script>
import asset_google_image from "@/assets/game/auth/google.webp";
import { useGoogleSignIn } from "@/composables/useGoogleSignIn.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default {
  name: "GoogleLogin",
  emits: ['token-received'],
  data() {
    return {
      asset_google_image,
      googleInstance: null,
    };
  },
  mounted() {
    const { initGoogle } = useGoogleSignIn();

    initGoogle(GOOGLE_CLIENT_ID).then(idToken => {
      if (idToken) {
        this.$emit('token-received', idToken);
      }
    });

    this.googleInstance = window.google?.accounts?.id;
  },
  methods: {
    handleLogin() {
      if (this.googleInstance) {
        this.googleInstance.prompt();
      } else {
        console.error("Google Sign-In not initialized.");
      }
    },
  },
};
</script>

<style scoped>
.login-form__google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #003d6c;
  color: white;
  font-weight: bold;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  margin: 10px 0;
  transition: background-color 0.3s;
}

.login-form__google-button:hover {
  background-color: #0d97f1;
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>
