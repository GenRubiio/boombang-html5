import { defineStore } from 'pinia';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    isConnected: false,
  }),
  actions: {
    setConnected(status) {
      this.isConnected = status;
    },
  },
});
