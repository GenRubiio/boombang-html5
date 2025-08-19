<template>
  <div
    class="login-form__google-button"
    :class="{ 'button-disabled': isLoading }"
    @click="handleLogin"
  >
    <img :src="asset_google_image" alt="Google" class="google-icon" />
    {{ isLoading ? 'Loading...' : $t("login.google_login") }}
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
      isLoading: false,
    };
  },
  mounted() {
    const { initGoogle } = useGoogleSignIn();

    const handleToken = (idToken) => {
      if (idToken) {
        this.$emit('token-received', idToken);
      }
      this.isLoading = false; // Stop loading when token is received or flow fails
    };

    initGoogle(GOOGLE_CLIENT_ID, handleToken);
  },
  methods: {
    handleLogin() {
      if (this.isLoading) {
        return; // Prevent multiple clicks
      }

      if (window.google?.accounts?.id) {
        this.isLoading = true;
        window.google.accounts.id.prompt((notification) => {
          // This callback is triggered when the prompt UI is displayed or fails to display
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.isLoading = false; // Stop loading if prompt is not shown
          }
          console.log('Google Prompt Notification:', notification.getNotDisplayedReason(), notification.getSkippedReason());
        });
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

.button-disabled {
  cursor: not-allowed;
  background-color: #5a8aa8;
}
</style>
