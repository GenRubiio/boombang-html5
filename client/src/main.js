import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import i18n, { setI18nLanguage, setupI18nSync } from "./plugins/i18n";
import { useLanguageStore } from "./stores/languageStore";
import clientVersionManager from "./utils/ClientVersionManager";
//import SocketDebugUtil from "./utils/SocketDebugUtil";

const initializeApp = async () => {
  //console.log("🚀 Iniciando BoomBang HTML5 Client...");
  
  // 1. PRIMERA PRIORIDAD: Verificar versión del cliente y limpiar cache si es necesario
  //console.log("🔍 Verificando versión del cliente...");
  try {
    const cacheCleared = await clientVersionManager.checkAndUpdateClientVersion();
    if (cacheCleared) {
      //console.log("✅ Cache limpiado por cambio de versión");
    }
  } catch (error) {
    console.error("❌ Error verificando versión del cliente:", error);
  }

  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  const languageStore = useLanguageStore();

  // Cargar el idioma inicial y configurar la sincronización
  await setI18nLanguage(languageStore.locale);
  setupI18nSync();

  app.use(i18n);

  // Importar socket DESPUÉS de que Pinia esté inicializado
  const { default: socket } = await import("./sockets/socket");
  
  // Configurar los listeners del socket ahora que Pinia está disponible
  await socket.setupListeners();
  
  app.config.globalProperties.$socket = socket;
  
  app.mount("#app");

  //console.log("✅ BoomBang HTML5 Client iniciado exitosamente");

  //setInterval(() => {
  //  SocketDebugUtil.fullAudit();
  //}, 5000);
};

initializeApp();
