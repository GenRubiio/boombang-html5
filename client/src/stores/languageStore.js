import { defineStore } from "pinia";
import { ref } from "vue";

export const useLanguageStore = defineStore("language", () => {
  const locale = ref("en"); // Idioma por defecto

  function setLocale(newLocale) {
    locale.value = newLocale;
  }

  return {
    locale,
    setLocale,
  };
});
