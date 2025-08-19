<template>
  <div
    class="login-form__google-button"
    :class="{ 'button-disabled': isLoading }"
    @click="handleLogin"
  >
    <img :src="asset_google_image" alt="Google" class="google-icon" />
    {{ isLoading ? "Loading..." : $t("login.google_login") }}
  </div>

  <!-- Fallback: botón nativo de Google -->
  <div id="google-btn" style="margin-top: 10px"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import asset_google_image from "@/assets/game/auth/google.webp";
import { useGoogleSignIn } from "@/composables/useGoogleSignIn.js";

const emit = defineEmits(["token-received"]);
const isLoading = ref(false);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("Google Client ID:", GOOGLE_CLIENT_ID);
const { initGoogle, promptGoogle, renderGoogleButton } = useGoogleSignIn();

const onCredential = (idToken) => {
  emit("token-received", idToken);
  isLoading.value = false;
  console.log("GIS credential recibida");
};

onMounted(() => {
  if (!window.google?.accounts?.id) {
    console.error("GIS script no está disponible en el IFRAME.");
    return;
  }

  // Importante: SOLO orígenes, sin rutas (nada de /play)
  const ok = initGoogle(GOOGLE_CLIENT_ID, onCredential, [
    "https://www.boommania.com",
    "https://boommania.com",
  ]);
  if (!ok) return;

  renderGoogleButton("google-btn");
});

function handleLogin() {
  if (isLoading.value) return;
  if (!window.google?.accounts?.id) {
    console.error("Google Sign-In no está inicializado.");
    return;
  }
  isLoading.value = true;
  promptGoogle(); // mostrará FedCM/One Tap si es elegible; el token llegará a onCredential()
}
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
