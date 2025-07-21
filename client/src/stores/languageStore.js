import { defineStore } from "pinia";
import { ref } from "vue";

export const useLanguageStore = defineStore("language", () => {
  const locale = ref("es"); // Idioma por defecto

  function setLocale(newLocale) {
    locale.value = newLocale;
  }

  return {
    locale,
    setLocale,
  };
});
