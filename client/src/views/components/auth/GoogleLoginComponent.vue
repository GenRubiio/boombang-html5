<template>
  <div class="google-login-container">
    <!-- Botón personalizado visible -->
    <button type="button" class="google-login-btn">
      <img :src="asset_google_image" :alt="$t('login.google_alt')" class="google-icon" />
      {{ $t("login.google_login") }}
    </button>
    <!-- Contenedor para el botón real de Google (invisible) -->
    <div id="google-btn-real"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGoogleSignIn } from "@/composables/useGoogleSignIn.js";
import asset_google_image from "@/assets/game/auth/google.webp";

const emit = defineEmits(["token-received"]);
const isLoading = ref(false);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const { initGoogle, renderGoogleButton } = useGoogleSignIn();

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

  const ok = initGoogle(GOOGLE_CLIENT_ID, onCredential, [
    "https://www.boommania.com",
    "https://boommania.com",
  ]);
  if (!ok) return;

  // Renderiza el botón real de Google en el contenedor invisible
  renderGoogleButton("google-btn-real");
});
</script>

<style scoped>
.google-login-container {
  position: relative;
  margin-top: 10px;
}

.google-login-btn {
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
  width: 100%;
}

.google-login-btn:hover {
  background-color: #0d97f1;
}

.google-icon {
  width: 20px;
  height: 20px;
}

/*
  Estilos para el contenedor del botón real de Google.
  Lo posiciona sobre el botón personalizado y lo hace transparente.
*/
#google-btn-real {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
