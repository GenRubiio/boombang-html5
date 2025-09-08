import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import socket from "./sockets/socket";
import { createPinia } from "pinia";
import i18n, { setI18nLanguage, setupI18nSync } from "./plugins/i18n";
import { useLanguageStore } from "./stores/languageStore";
//import SocketDebugUtil from "./utils/SocketDebugUtil";

const initializeApp = async () => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  const languageStore = useLanguageStore();

  // Cargar el idioma inicial y configurar la sincronización
  await setI18nLanguage(languageStore.locale);
  setupI18nSync();

  app.use(i18n);

  app.config.globalProperties.$socket = socket;
  app.mount("#app");

  //setInterval(() => {
  //  SocketDebugUtil.fullAudit();
  //}, 5000);
};

initializeApp();
