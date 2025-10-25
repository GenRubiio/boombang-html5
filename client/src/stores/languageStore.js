import { defineStore } from "pinia";
import { ref } from "vue";
import { setI18nLanguage } from "../plugins/i18n";

export const useLanguageStore = defineStore("language", () => {
  const locale = ref("en"); // Idioma por defecto

  async function setLocale(newLocale) {
    // Cargar las traducciones antes de cambiar el locale
    await setI18nLanguage(newLocale);
    locale.value = newLocale;
  }

  return {
    locale,
    setLocale,
  };
});
