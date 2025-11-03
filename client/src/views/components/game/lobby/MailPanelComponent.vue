<template>
  <div v-if="mailStore.isPanelOpen" class="mail-panel">
    <!-- Overlay para cerrar al hacer clic fuera -->
    <div class="mail-panel__overlay" @click="closePanel"></div>

    <!-- Panel deslizante -->
    <div class="mail-panel__container">
      <!-- Botón cerrar -->
      <button class="close-button" @click="closePanel">
        <i class="las la-times"></i>
      </button>

      <!-- Título principal -->
      <h2 class="main-title">{{ $t("lobby.mail.title") }}</h2>

      <!-- Loading -->
      <div v-if="mailStore.isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ $t("lobby.mail.loading") }}</p>
      </div>

      <!-- Contenido principal -->
      <div v-else class="mail-content">
        <!-- Sin correos -->
        <div v-if="mailStore.mails.length === 0" class="empty-state">
          <i class="las la-envelope-open"></i>
          <p>{{ $t("lobby.mail.no_mails") }}</p>
        </div>

        <!-- Con correos -->
        <div v-else class="mail-layout">
          <!-- Lista de correos -->
          <div v-if="!mailStore.selectedMail" class="mail-list">
            <div
              v-for="mail in mailStore.sortedMails"
              :key="mail.id"
              class="mail-item"
              :class="{
                'mail-item--unread': !mail.is_read,
              }"
              @click="selectMail(mail)"
            >
              <div class="mail-item__header">
                <span class="mail-item__title">{{ mail.title }}</span>
                <span v-if="!mail.is_read" class="mail-item__badge">{{
                  $t("lobby.mail.new")
                }}</span>
              </div>
              <div class="mail-item__date">
                {{ formatDate(mail.created_at) }}
              </div>
              <div v-if="mail.hasRewards" class="mail-item__rewards-indicator">
                <i class="las la-gift"></i>
                {{ $t("lobby.mail.has_rewards") }}
              </div>
            </div>
          </div>

          <!-- Detalle del correo seleccionado -->
          <div v-if="mailStore.selectedMail" class="mail-detail">
            <div class="mail-detail__header">
              <button class="back-button" @click="goBackToList">
                <i class="las la-arrow-left"></i>
              </button>
              <h3>{{ mailStore.selectedMail.title }}</h3>
            </div>

            <div class="mail-detail__body">
              <div
                class="mail-detail__description"
                v-html="mailStore.selectedMail.description"
              ></div>

              <!-- Recompensas -->
              <div
                v-if="mailStore.selectedMail.hasRewards"
                class="mail-detail__rewards"
              >
                <h4>{{ $t("lobby.mail.rewards_title") }}</h4>

                <!-- Monedas -->
                <div class="mail-rewards__coins">
                  <div
                    v-if="mailStore.selectedMail.gold_coins > 0"
                    class="coin-box coin-box--gold"
                  >
                    <i class="las la-coins"></i>
                    <span>{{ $t("lobby.mail.gold_credits") }}</span>
                    <strong>{{ mailStore.selectedMail.gold_coins }}</strong>
                  </div>
                  <div
                    v-if="mailStore.selectedMail.silver_coins > 0"
                    class="coin-box coin-box--silver"
                  >
                    <i class="las la-coins"></i>
                    <span>{{ $t("lobby.mail.silver_credits") }}</span>
                    <strong>{{ mailStore.selectedMail.silver_coins }}</strong>
                  </div>
                </div>

                <!-- Objetos del catálogo -->
                <div
                  v-if="
                    mailStore.selectedMail.rewards &&
                    mailStore.selectedMail.rewards.length > 0
                  "
                  class="mail-rewards__items"
                >
                  <div
                    v-for="reward in mailStore.selectedMail.rewards"
                    :key="reward.catalog_item_id"
                    class="reward-item"
                  >
                    <div class="reward-item__image">
                      <img
                        v-if="reward.item && reward.item.image_url"
                        :src="reward.item.image_url"
                        :alt="reward.item.name"
                      />
                    </div>
                    <div class="reward-item__info">
                      <span class="reward-item__name">{{
                        reward.item?.name || "Item"
                      }}</span>
                      <span class="reward-item__quantity"
                        >x{{ reward.quantity }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Botón reclamar -->
                <button
                  v-if="!mailStore.selectedMail.is_claimed"
                  class="mail-detail__claim-btn"
                  :disabled="mailStore.isClaiming"
                  @click="claimReward"
                >
                  <i
                    class="las"
                    :class="
                      mailStore.isClaiming ? 'la-spinner la-spin' : 'la-gift'
                    "
                  ></i>
                  {{
                    mailStore.isClaiming
                      ? $t("lobby.mail.claiming")
                      : $t("lobby.mail.claim")
                  }}
                </button>
                <button
                  v-else
                  class="mail-detail__claim-btn mail-detail__claim-btn--claimed"
                  disabled
                >
                  <i class="las la-check"></i>
                  {{ $t("lobby.mail.claimed") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMailStore } from "@/stores/MailStore";
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  name: "MailPanelComponent",

  data() {
    return {
      mailStore: useMailStore(),
      apiUrl: import.meta.env.VITE_API_URL || "http://api.boombang.com",
    };
  },

  methods: {
    closePanel() {
      this.mailStore.closePanel();
    },

    goBackToList() {
      this.mailStore.clearSelectedMail();
    },

    selectMail(mail) {
      this.mailStore.selectMail(mail);

      // Marcar como leído si no lo está
      if (!mail.is_read) {
        socket.emit(RequestSocketsEnum.MARK_MAIL_READ, {
          mail_id: mail.id,
        });
      }
    },

    claimReward() {
      if (!this.mailStore.selectedMail || this.mailStore.isClaiming) return;

      this.mailStore.setClaiming(true);

      socket.emit(RequestSocketsEnum.CLAIM_MAIL_REWARD, {
        mail_id: this.mailStore.selectedMail.id,
      });

      // El listener de socket (en UiElementsComponent) manejará la respuesta
      // y actualizará el estado automáticamente
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.$i18n.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },

  mounted() {
    // Los listeners de socket se configuran en UiElementsComponent
    // para evitar duplicados y problemas de sincronización
  },
};
</script>

<style scoped>
/* Panel principal - overlay */
.mail-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.mail-panel__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #00000075;
  pointer-events: auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Contenedor del panel - deslizante desde la derecha */
.mail-panel__container {
  position: relative;
  width: 550px;
  max-width: 95%;
  height: 100%;
  background-color: #ffffffd9;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  padding: 20px;
  pointer-events: auto;
  animation: slideInRight 0.3s ease;
  overflow: hidden;
  box-sizing: border-box;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Botón cerrar */
.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 2px #0000004d;
  padding: 0;
  color: black;
  transition: all 0.2s;
  z-index: 10;
}

.close-button:hover {
  transform: scale(1.1);
  background: #f0f0f0;
}

/* Título principal */
.main-title {
  text-align: center;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  margin-bottom: 15px;
  box-shadow: 0 3px #0000004d;
  font-size: 18px;
}

/* Loading */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #333;
  font-size: 16px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #fd9a03;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Contenido principal */
.mail-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Estado vacío */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 15px;
}

.empty-state i {
  font-size: 64px;
  color: #ccc;
}

.empty-state p {
  font-size: 18px;
  margin: 0;
}

/* Layout con lista y detalle */
.mail-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: hidden;
}

/* Lista de correos */
.mail-list {
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  border: 1px solid #ddd;
}

.mail-item {
  background-color: #ffffff;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  margin-bottom: 8px;
}

.mail-item:hover {
  background-color: #fafafa;
  transform: translateX(3px);
}

.mail-item--unread {
  border-left-color: #fd9a03;
  background-color: #fff8f0;
}

.mail-item--selected {
  border-left-color: #d96b35;
  background-color: #ffe8d6;
}

.mail-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  gap: 8px;
}

.mail-item__title {
  font-weight: bold;
  color: #333;
  font-size: 16px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: start;
}

.mail-item__badge {
  background-color: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.mail-item__date {
  color: #666;
  font-size: 10px;
  margin-bottom: 5px;
  text-align: start;
}

.mail-item__rewards-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fd9a03;
  font-size: 11px;
  font-weight: 600;
}

/* Detalle del correo */
.mail-detail {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 5px;
  border: 1px solid #ddd;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mail-detail__header {
  background-color: #fd9a03;
  color: white;
  padding: 12px;
  border-radius: 5px 5px 0 0;
  text-shadow: 1px 1px #0000004d;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mail-detail__header h3 {
  margin: 0;
  font-size: 16px;
  flex: 1;
  text-align: start;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.mail-detail__body {
  padding: 12px;
  flex: 1;
}

.mail-detail__description {
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 13px;
  text-align: start;
  min-height: 205px;
}

/* Recompensas */
.mail-detail__rewards {
  background-color: #ffffff;
  border-radius: 5px;
  padding: 12px;
  border: 1px solid #ddd;
}

.mail-detail__rewards h4 {
  margin: 0 0 10px 0;
  color: #fd9a03;
  font-size: 15px;
  font-weight: bold;
  padding-bottom: 8px;
  border-bottom: 2px solid #fd9a03;
}

.mail-rewards__coins {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.coin-box {
  flex: 1;
  min-width: 100px;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px #0000004d;
}

.coin-box--gold {
  background: linear-gradient(135deg, #fd9a03, #ffc107);
  color: #fff;
}

.coin-box--silver {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: #fff;
}

.coin-box i {
  font-size: 24px;
}

.coin-box span {
  font-size: 10px;
  font-weight: 600;
}

.coin-box strong {
  font-size: 18px;
  font-weight: bold;
}

.mail-rewards__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
}

.reward-item {
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 6px;
  text-align: center;
  border: 1px solid #ddd;
}

.reward-item__image {
  width: 40px;
  height: 40px;
  margin: 0 auto 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.reward-item__image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.reward-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reward-item__name {
  font-size: 9px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reward-item__quantity {
  font-size: 10px;
  font-weight: bold;
  color: #fd9a03;
}

/* Botón reclamar */
.mail-detail__claim-btn {
  width: 100%;
  padding: 10px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 3px #0000004d;
}

.mail-detail__claim-btn:hover:not(:disabled) {
  background-color: #2ecc71;
  transform: translateY(-2px);
  box-shadow: 0 5px #0000004d;
}

.mail-detail__claim-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mail-detail__claim-btn--claimed {
  background-color: #95a5a6;
}

.mail-detail__claim-btn i {
  font-size: 16px;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #fd9a03;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d96b35;
}
</style>
