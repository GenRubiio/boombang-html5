import { defineStore } from "pinia";

export const useLobbyStore = defineStore("lobby", {
  state: () => ({
    activeTab: "areas",
  }),
  actions: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
  },
  persist: {
    enabled: true,
    strategies: [{ storage: localStorage, paths: ["activeTab"] }],
  },
});
