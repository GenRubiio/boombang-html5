import { defineStore } from "pinia";

export const useMailStore = defineStore("mail", {
  state: () => ({
    mails: [],
    unreadCount: 0,
    selectedMail: null,
    isPanelOpen: false,
    isLoading: false,
    isClaiming: false,
  }),

  getters: {
    /**
     * Devuelve los correos ordenados por fecha (más reciente primero)
     */
    sortedMails: (state) => {
      return [...state.mails].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    },

    /**
     * Devuelve solo los correos no leídos
     */
    unreadMails: (state) => {
      return state.mails.filter((mail) => !mail.is_read);
    },

    /**
     * Devuelve solo los correos con recompensas no reclamadas
     */
    unclaimedMails: (state) => {
      return state.mails.filter((mail) => !mail.is_claimed && mail.hasRewards);
    },

    /**
     * Verifica si un correo tiene recompensas
     */
    mailHasRewards: (state) => (mail) => {
      if (!mail) return false;
      return (
        mail.gold_coins > 0 ||
        mail.silver_coins > 0 ||
        (mail.rewards && mail.rewards.length > 0)
      );
    },
  },

  actions: {
    /**
     * Establece la lista de correos
     */
    setMails(mails) {
      this.mails = mails.map((mail) => ({
        ...mail,
        hasRewards:
          mail.gold_coins > 0 ||
          mail.silver_coins > 0 ||
          (mail.rewards && mail.rewards.length > 0),
      }));
    },

    /**
     * Establece el contador de correos no leídos
     */
    setUnreadCount(count) {
      this.unreadCount = count;
    },

    /**
     * Selecciona un correo para ver sus detalles
     */
    selectMail(mail) {
      this.selectedMail = mail;
    },

    /**
     * Limpia la selección del correo (vuelve a la lista)
     */
    clearSelectedMail() {
      this.selectedMail = null;
    },

    /**
     * Marca un correo como leído localmente
     */
    markMailAsRead(mailId) {
      const mail = this.mails.find((m) => m.id === mailId);
      if (mail) {
        mail.is_read = true;
      }
      this.updateUnreadCount();
    },

    /**
     * Marca un correo como reclamado localmente
     */
    markMailAsClaimed(mailId) {
      const mail = this.mails.find((m) => m.id === mailId);
      if (mail) {
        mail.is_claimed = true;
        mail.is_read = true;
      }
    },

    /**
     * Actualiza el contador de no leídos basándose en la lista local
     */
    updateUnreadCount() {
      this.unreadCount = this.mails.filter((m) => !m.is_read).length;
    },

    /**
     * Abre el panel de correo
     */
    openPanel() {
      this.isPanelOpen = true;
    },

    /**
     * Cierra el panel de correo
     */
    closePanel() {
      this.isPanelOpen = false;
      this.selectedMail = null;
    },

    /**
     * Alterna la visibilidad del panel
     */
    togglePanel() {
      this.isPanelOpen = !this.isPanelOpen;
      if (!this.isPanelOpen) {
        this.selectedMail = null;
      }
    },

    /**
     * Establece el estado de carga
     */
    setLoading(isLoading) {
      this.isLoading = isLoading;
    },

    /**
     * Establece el estado de reclamación de recompensas
     */
    setClaiming(isClaiming) {
      this.isClaiming = isClaiming;
    },

    /**
     * Reinicia el store a su estado inicial
     */
    reset() {
      this.mails = [];
      this.unreadCount = 0;
      this.selectedMail = null;
      this.isPanelOpen = false;
      this.isLoading = false;
      this.isClaiming = false;
    },

    /**
     * Añade un nuevo correo a la lista (para notificaciones en tiempo real)
     */
    addMail(mail) {
      const exists = this.mails.find((m) => m.id === mail.id);
      if (!exists) {
        this.mails.unshift({
          ...mail,
          hasRewards:
            mail.gold_coins > 0 ||
            mail.silver_coins > 0 ||
            (mail.rewards && mail.rewards.length > 0),
        });
        this.updateUnreadCount();
      }
    },
  },

  // No persistir el estado para que siempre se cargue del servidor
  persist: false,
});
