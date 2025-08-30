import { createI18n } from "vue-i18n";
import { useLanguageStore } from "../stores/languageStore";

// Esta función cargará el archivo de idioma JSON de forma asíncrona
const loadLocaleMessages = async (locale) => {
  const messages = await import(`../assets/lang/${locale}/translations.json`);
  return messages.default;
};

// Creamos la instancia de i18n
const i18n = createI18n({
  legacy: false, // Usamos el modo Composition API
  locale: "en", // Establecemos el idioma inicial
  fallbackLocale: "en", // Idioma de respaldo
  messages: {}, // Empezamos sin mensajes cargados
});

// Función para establecer el idioma en la instancia de i18n
export const setI18nLanguage = async (locale) => {
  i18n.global.locale.value = locale;
  const messages = await loadLocaleMessages(locale);
  i18n.global.setLocaleMessage(locale, messages);
};

// Sincronizar el locale de Pinia con i18n
export const setupI18nSync = () => {
  const languageStore = useLanguageStore();
  languageStore.$subscribe(async (mutation, state) => {
    await setI18nLanguage(state.locale);
  });
};

export default i18n;
