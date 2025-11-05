<template>
  <div class="modal-info">
    <!-- Spinner mientras carga (centrado) -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ $t("npc.objects.loading") }}</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <template v-else>
      <!-- Header con título y descripción del NPC -->
      <div class="npc-header" v-if="!selectedItem">
        <h2>{{ npcData.name || "NPC" }}</h2>
        <p
          v-if="npcData.description"
          class="npc-description"
          v-html="npcData.description"
        ></p>
      </div>

      <!-- Sin objetos -->
      <div v-if="items.length === 0 && !selectedItem" class="no-items">
        <p>{{ $t("npc.objects.no_items") }}</p>
      </div>

      <!-- Grid de objetos (3 columnas con 9 casillas) -->
      <div v-else-if="!selectedItem" class="items-grid">
        <div
          v-for="(item, index) in gridItems"
          :key="index"
          :class="['item-card', { 'empty-card': !item }]"
          @click="item ? selectItem(item) : null"
        >
          <div v-if="item" class="item-image-container">
            <img :src="getItemImage(item)" :alt="item.name" />
          </div>
        </div>
      </div>

      <!-- Vista de detalles del item (reemplaza el grid) -->
      <div v-else class="item-detail-view">
        <!-- Header con título y descripción del NPC -->
        <div class="npc-header">
          <h2>{{ npcData.name || "NPC" }}</h2>
          <p
            v-if="npcData.description"
            class="npc-description"
            v-html="npcData.description"
          ></p>
        </div>

        <!-- Botón de volver atrás -->
        <button class="back-button" @click="closeItemDetail">
          <i class="las la-arrow-left"></i>
          <span>{{ $t("npc.objects.back") }}</span>
        </button>

        <div class="detail-content">
          <!-- Item a obtener (arriba) -->
          <div class="reward-section">
            <h4>{{ $t("npc.objects.obtain") }}</h4>
            <div class="reward-item">
              <div class="reward-image">
                <img
                  :src="getItemImage(selectedItem)"
                  :alt="selectedItem.name"
                />
              </div>
            </div>
          </div>

          <!-- Requisitos (abajo) -->
          <div
            v-if="
              selectedItem.requirements && selectedItem.requirements.length > 0
            "
            class="requirements-section"
          >
            <h4>{{ $t("npc.objects.requirements") }}</h4>

            <!-- Grid de items requeridos (3 columnas) - solo imágenes -->
            <div
              class="requirements-items-grid"
              v-if="itemRequirements.length > 0"
            >
              <div
                v-for="(req, index) in itemRequirements"
                :key="index"
                class="requirement-item"
              >
                <div class="requirement-image">
                  <img
                    :src="getRequirementImage(req)"
                    :alt="req.required_item.name"
                  />
                </div>
                <div class="requirement-quantity">
                  x{{ req.required_quantity }}
                </div>
              </div>
            </div>

            <!-- Créditos requeridos (por separado, abajo) -->
            <div class="requirements-credits">
              <div
                v-if="hasGoldRequirement(selectedItem)"
                class="credit-requirement credit-gold"
              >
                <i class="las la-coins"></i>
                <span>{{ getTotalGoldRequired(selectedItem) }}</span>
              </div>
              <div
                v-if="hasSilverRequirement(selectedItem)"
                class="credit-requirement credit-silver"
              >
                <i class="las la-coins"></i>
                <span>{{ getTotalSilverRequired(selectedItem) }}</span>
              </div>
            </div>
          </div>

          <!-- Mensajes de éxito o error (antes del botón) -->
          <div v-if="successMessage" class="success-message">
            <i class="las la-check-circle"></i>
            <p>{{ successMessage }}</p>
          </div>
          <div v-if="error" class="error-message">
            <i class="las la-exclamation-circle"></i>
            <p>{{ error }}</p>
          </div>

          <!-- Botón de reclamar -->
          <div class="claim-button-container">
            <button
              @click="claimItem(selectedItem.id)"
              :disabled="claiming"
              class="btn-claim"
            >
              {{
                claiming ? $t("npc.objects.claiming") : $t("npc.objects.claim")
              }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  props: {
    npcId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      npcData: {},
      items: [],
      selectedItem: null,
      loading: true,
      claiming: false,
      error: null,
      successMessage: null,
    };
  },
  computed: {
    itemRequirements() {
      if (!this.selectedItem || !this.selectedItem.requirements) {
        return [];
      }
      return this.selectedItem.requirements.filter((req) => req.required_item);
    },
    gridItems() {
      // Crear array de 9 elementos (3x3 grid)
      const grid = new Array(9).fill(null);
      // Llenar con los items disponibles
      this.items.forEach((item, index) => {
        if (index < 9) {
          grid[index] = item;
        }
      });
      return grid;
    },
  },
  methods: {
    getItemImage(item) {
      if (item.image_url) {
        return item.image_url;
      }
      const viteEnv = import.meta.env.VITE_APP_ENV;
      const baseUrl = import.meta.env.VITE_API_URL;
      if (item.image) {
        return viteEnv === "local" ? item.image : `${baseUrl}/${item.image}`;
      }
      return "/default-item.png";
    },
    getRequirementImage(req) {
      if (req.required_item && req.required_item.image_url) {
        return req.required_item.image_url;
      }
      const viteEnv = import.meta.env.VITE_APP_ENV;
      const baseUrl = import.meta.env.VITE_API_URL;
      if (req.required_item && req.required_item.image) {
        return viteEnv === "local"
          ? req.required_item.image
          : `${baseUrl}/${req.required_item.image}`;
      }
      return "/default-item.png";
    },
    hasGoldRequirement(item) {
      return item.requirements.some((req) => req.required_gold_coins > 0);
    },
    hasSilverRequirement(item) {
      return item.requirements.some((req) => req.required_silver_coins > 0);
    },
    getTotalGoldRequired(item) {
      return item.requirements.reduce(
        (sum, req) => sum + (req.required_gold_coins || 0),
        0
      );
    },
    getTotalSilverRequired(item) {
      return item.requirements.reduce(
        (sum, req) => sum + (req.required_silver_coins || 0),
        0
      );
    },
    selectItem(item) {
      this.selectedItem = item;
      this.error = null;
      this.successMessage = null;
    },
    closeItemDetail() {
      this.selectedItem = null;
      this.error = null;
      this.successMessage = null;
    },
    handleGetCatalogItems(response) {
      //console.log('Response from server:', response);
      this.loading = false;

      if (response.success) {
        if (response.npc) {
          this.npcData = response.npc;
        }
        this.items = response.catalog_items || response.items || [];
        this.error = null;
      } else {
        this.error = response.message || "Error al cargar los objetos";
      }
    },
    handleClaimItem(response) {
      //console.log('Claim response:', response);
      this.claiming = false;

      if (response.success) {
        this.successMessage =
          response.message || this.$t("npc.objects.success_claim");
        this.error = null;
        this.closeItemDetail();

        // Recargar los items después de 2 segundos
        setTimeout(() => {
          this.successMessage = null;
          this.loadCatalogItems();
        }, 2000);
      } else {
        // Formatear mensaje de error con detalles de requisitos faltantes
        let errorMessage = response.message || "Error al reclamar el objeto";

        // Intentar diferentes posibles estructuras de respuesta
        const missingReqs =
          response.missing_requirements ||
          response.missingRequirements ||
          response.requirements ||
          response.missing ||
          [];
        const missingItems =
          response.missing_items || response.missingItems || [];
        const missingCredits =
          response.missing_credits || response.missingCredits || {};

        if (missingReqs && missingReqs.length > 0) {
          errorMessage += "\n\n" + this.$t("npc.objects.missing_items");
          missingReqs.forEach((req) => {
            if (req.type === "catalog_item" || req.type === "item") {
              const itemName =
                req.catalog_item_name || req.item_name || req.name || "Item";
              const missing =
                req.missing || req.quantity || req.required_quantity || 1;
              errorMessage += `\n• ${itemName}: ${missing} unidad(es)`;
            } else if (req.type === "gold_coins" || req.type === "gold") {
              const missing =
                req.missing || req.amount || req.required_gold_coins || 0;
              errorMessage += `\n• Oro: ${missing}`;
            } else if (req.type === "silver_coins" || req.type === "silver") {
              const missing =
                req.missing || req.amount || req.required_silver_coins || 0;
              errorMessage += `\n• Plata: ${missing}`;
            }
          });
        } else if (missingItems && missingItems.length > 0) {
          errorMessage += "\n\n" + this.$t("npc.objects.missing_items");
          missingItems.forEach((item) => {
            const itemName = item.name || item.item_name || "Item";
            const missing = item.missing || item.quantity || 1;
            errorMessage += `\n• ${itemName}: ${missing} unidad(es)`;
          });
        }

        // Agregar créditos faltantes si existen
        if (missingCredits.gold && missingCredits.gold > 0) {
          if (!errorMessage.includes(this.$t("npc.objects.missing_items"))) {
            errorMessage += "\n\n" + this.$t("npc.objects.missing_items");
          }
          errorMessage += `\n• Oro: ${missingCredits.gold}`;
        }
        if (missingCredits.silver && missingCredits.silver > 0) {
          if (!errorMessage.includes(this.$t("npc.objects.missing_items"))) {
            errorMessage += "\n\n" + this.$t("npc.objects.missing_items");
          }
          errorMessage += `\n• Plata: ${missingCredits.silver}`;
        }

        // Si no hay detalles específicos, intentar extraer info del mensaje
        if (
          !missingReqs.length &&
          !missingItems.length &&
          !missingCredits.gold &&
          !missingCredits.silver &&
          response.data
        ) {
          console.log("Trying to extract from response.data:", response.data);
          // Aquí podrías agregar lógica adicional si los datos vienen en response.data
        }

        this.error = errorMessage;
        this.successMessage = null;
      }
    },
    claimItem(catalogItemId) {
      if (this.claiming) return;

      //console.log('Claiming item:', catalogItemId);
      this.claiming = true;
      this.error = null;
      this.successMessage = null;

      socket.emit(RequestSocketsEnum.CLAIM_NPC_ITEM, {
        catalogItemId: catalogItemId,
      });
    },
    loadCatalogItems() {
      //console.log('Loading catalog items for NPC:', this.npcId);
      this.loading = true;
      this.error = null;
      socket.emit(RequestSocketsEnum.GET_NPC_CATALOG_ITEMS, {
        npcId: this.npcId,
      });
    },
  },
  mounted() {
    socket.on(
      ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS,
      this.handleGetCatalogItems
    );
    socket.on(ResponseSocketsEnum.CLAIM_NPC_ITEM, this.handleClaimItem);

    this.loadCatalogItems();
  },
  unmounted() {
    //console.log('ObjectsNpcModalComponent unmounted');

    socket.off(
      ResponseSocketsEnum.GET_NPC_CATALOG_ITEMS,
      this.handleGetCatalogItems
    );
    socket.off(ResponseSocketsEnum.CLAIM_NPC_ITEM, this.handleClaimItem);
  },
};
</script>

<style scoped>
.modal-info {
  text-align: start;
  color: #fd9a03;
  padding: 0px 10px 10px 10px;
  max-height: 500px;
  overflow-y: auto;
  position: relative;
  min-height: 500px;
}

/* Loading Overlay (centrado en el contenedor NPC) */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 5px;
  z-index: 1;
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #fd9a03;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  margin-top: 10px;
  color: #fd9a03;
  font-size: 14px;
}

/* NPC Header */
.npc-header {
  margin-bottom: 15px;
}

.npc-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #d96b35;
  margin: 0 0 8px 0;
}

.npc-description {
  font-size: 13px;
  color: #fd9900;
  margin: 0;
  line-height: 1.4;
}

/* No items */
.no-items {
  text-align: center;
  padding: 30px;
  color: #999;
}

/* Grid de objetos (3 columnas) */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 10px;
}

.item-card {
  background: linear-gradient(135deg, #fff 0%, #f8f8f8 100%);
  border: 2px solid #fd9a03;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90px;
  justify-content: center;
}

.item-card:not(.empty-card):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(253, 154, 3, 0.3);
  border-color: #d96b35;
}

/* Casillas vacías */
.item-card.empty-card {
  background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
  border: 2px solid #b0b0b0;
  cursor: default;
  opacity: 0.5;
}

.item-image-container {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.item-name {
  font-size: 11px;
  font-weight: bold;
  color: #d96b35;
  text-align: center;
  line-height: 1.2;
}

/* Vista de detalles (reemplaza el grid) */
.item-detail-view {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.back-button {
  background: #fff;
  border: 2px solid #fd9a03;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #fd9a03;
  margin-bottom: 15px;
  transition: all 0.2s;
}

.back-button:hover {
  background: #fd9a03;
  color: #fff;
}

.back-button i {
  font-size: 18px;
}

.detail-content {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  border: 2px solid #fd9a03;
}

.detail-content h3 {
  font-size: 22px;
  font-weight: bold;
  color: #d96b35;
  margin: 0 0 10px 0;
}

.detail-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
}

/* Requisitos */
.requirements-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #f0f0f0;
}

.requirements-section h4 {
  font-size: 16px;
  font-weight: bold;
  color: #d96b35;
  margin: 0 0 12px 0;
}

/* Grid de items requeridos (3 columnas) */
.requirements-items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.requirement-item {
  background: #fff8e7;
  border: 2px solid #ffd699;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.requirement-image {
  width: 50px;
  height: 50px;
  margin: 0 auto 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.requirement-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.requirement-quantity {
  font-size: 12px;
  font-weight: bold;
  color: #d96b35;
  margin-bottom: 3px;
}

.requirement-name {
  font-size: 10px;
  color: #666;
  line-height: 1.2;
}

/* Créditos requeridos */
.requirements-credits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.credit-requirement {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #ffc107;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.credit-requirement i {
  font-size: 24px;
}

.credit-requirement.credit-gold {
  background: linear-gradient(135deg, #fff9e6 0%, #ffe4a3 100%);
  border-color: #ffb300;
  color: #b8860b;
}

.credit-requirement.credit-silver {
  background: linear-gradient(135deg, #f0f0f0 0%, #d3d3d3 100%);
  border-color: #a9a9a9;
  color: #666;
}

/* Botón de reclamar */
.claim-button-container {
  margin-top: 15px;
  text-align: center;
}

.btn-claim {
  padding: 12px 30px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  border: 2px solid #0072c6;
  border-radius: 8px;
  background: linear-gradient(to bottom, #6bd0fa 0%, #008ed6 100%);
  box-shadow: 0 4px 0 #005fa3;
  transition: all 0.2s;
  width: 100%;
}

.btn-claim:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #005fa3;
}

.btn-claim:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #005fa3;
}

.btn-claim:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Success message */
.success-message {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
  border-radius: 6px;
  padding: 12px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease;
}

.success-message i {
  color: #28a745;
  font-size: 24px;
}

.success-message p {
  color: #155724;
  font-size: 13px;
  font-weight: bold;
  margin: 0;
}

/* Error message */
.error-message {
  background-color: #ffebee;
  border: 2px solid #f44336;
  border-radius: 6px;
  padding: 12px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease;
}

.error-message i {
  color: #f44336;
  font-size: 24px;
}

.error-message p {
  color: #f44336;
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  white-space: pre-line;
  line-height: 1.5;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reward-image {
  height: 200px;
}

.reward-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
</style>
