<template>
  <div
    class="shop-overlay"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <div class="shop">
      <button class="close-button" @click="closeShop">
        <i class="las la-times"></i>
      </button>
      <div class="shop__container">
        <!-- Categorías a la izquierda -->
        <div class="shop__categories">
          <div v-if="loadingCategories" class="loading-tab">
            <div class="spinner"></div>
            <p>{{ $t("shop.loading") }}</p>
          </div>
          <div
            v-else
            v-for="category in categories"
            :key="category.id"
            class="shop__category"
            :class="{
              active: activeCategory && activeCategory.id === category.id,
            }"
            @click="selectCategory(category)"
          >
            {{ category.name }}
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="shop__content">
          <div class="shop__title">
            {{ activeCategory ? activeCategory.name : $t("shop.title") }}
          </div>

          <!-- Grid de items -->
          <div class="shop__items-container">
            <div class="shop__items-grid" v-if="activeCategory">
              <div v-if="loadingItems" class="loading-container">
                <div class="spinner"></div>
                <p>{{ $t("shop.loading") }}</p>
              </div>

              <div v-else-if="categoryItems.length === 0" class="no-data-container">
                <p>{{ $t("shop.no_items") }}</p>
              </div>

              <div
                v-else
                v-for="item in categoryItems"
                :key="item.id"
                class="shop__item"
                :class="{ selected: selectedItem && selectedItem.id === item.id }"
                @click="selectItem(item)"
              >
                <img
                  :src="item.image_url"
                  :alt="item.name"
                  class="item-image"
                  @error="onImageError"
                />
              </div>
            </div>
          </div>

          <!-- Panel de detalles del item seleccionado -->
          <div class="shop__item-details" v-if="selectedItem">
            <button class="close-item-button" @click="clearSelectedItem">
              <i class="las la-times"></i>
            </button>
            <div class="item-details__image">
              <img
                :src="selectedItem.image_url"
                :alt="selectedItem.name"
                @error="onImageError"
              />
            </div>
            <div class="item-details__info">
              <h3 class="item-name">{{ selectedItem.name }}</h3>
              <div class="item-description" v-if="selectedItem.description" v-html="selectedItem.description"></div>

              <!-- Selector de cantidad -->
              <div class="quantity-selector">
                <label for="quantity">{{ $t("shop.quantity") }}:</label>
                <select id="quantity" v-model="selectedQuantity" class="quantity-select">
                  <option 
                    v-for="n in quantityOptions" 
                    :key="n" 
                    :value="n"
                  >
                    {{ n }}
                  </option>
                </select>
              </div>

              <!-- Precio del item -->
              <div class="item-price">
                <template v-if="selectedItem.price_type === 'stripe_payment'">
                  <i class="las la-dollar-sign" style="color: #28a745;"></i>
                  <span>${{ ((selectedItem.stripe_price_usd || 0) * selectedQuantity).toFixed(2) }} USD</span>
                </template>
                <template v-else>
                  <i
                    :class="selectedItem.price_type === 'golden_coins' ? 'las la-coins' : 'las la-circle'"
                    :style="{ color: selectedItem.price_type === 'golden_coins' ? '#FFD700' : '#C0C0C0' }"
                  ></i>
                  <span>{{ totalPrice }}</span>
                </template>
              </div>

              <!-- Mensaje de estado -->
              <div v-if="purchaseMessage" class="purchase-message" :class="purchaseMessageType">
                {{ purchaseMessage }}
              </div>

              <button
                class="buy-button"
                @click="purchaseItem"
                :disabled="purchasing"
              >
                <span v-if="!purchasing">{{ $t("shop.buy") }}</span>
                <div v-else class="spinner-small"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum.js";

export default {
  name: "ShopComponent",
  props: {
    authUser: {
      type: Object,
      required: true,
    },
  },
  emits: ["close-shop", "purchase-success"],
  data() {
    return {
      categories: [],
      items: [],
      activeCategory: null,
      selectedItem: null,
      selectedQuantity: 1,

      loadingCategories: false,
      loadingItems: false,
      purchasing: false,

      purchaseMessage: null,
      purchaseMessageType: null,
    };
  },
  computed: {
    categoryItems() {
      if (!this.activeCategory) return [];
      return this.items.filter(item => item.category_id === this.activeCategory.id);
    },
    totalPrice() {
      if (!this.selectedItem) return 0;
      
      // Para items de Stripe, no mostrar precio en monedas
      if (this.selectedItem.price_type === 'stripe_payment') {
        return 0;
      }
      
      let total = (this.selectedItem.price || 0) * this.selectedQuantity;

      // Aplicar descuento si existe
      if (this.selectedItem.discount > 0) {
        total = total - (total * (this.selectedItem.discount / 100));
      }

      return Math.round(total);
    },
    quantityOptions() {
      if (!this.selectedItem) return [1];
      
      const min = this.selectedItem.min_purchase_quantity || 1;
      const max = this.selectedItem.max_purchase_quantity || 10;
      
      const options = [];
      for (let i = min; i <= max; i++) {
        options.push(i);
      }
      
      return options;
    },
  },
  mounted() {
    this.loadCatalog();
    this.setupSocketListeners();
  },
  beforeUnmount() {
    this.removeSocketListeners();
  },
  methods: {
    setupSocketListeners() {
      socket.on(ResponseSocketsEnum.SHOP_CATALOG, this.handleCatalogResponse);
      socket.on(ResponseSocketsEnum.SHOP_PURCHASE, this.handlePurchaseResponse);
      socket.on(ResponseSocketsEnum.REFRESH_USER_CREDITS, this.handleCreditsUpdate);
    },

    removeSocketListeners() {
      socket.off(ResponseSocketsEnum.SHOP_CATALOG, this.handleCatalogResponse);
      socket.off(ResponseSocketsEnum.SHOP_PURCHASE, this.handlePurchaseResponse);
      socket.off(ResponseSocketsEnum.REFRESH_USER_CREDITS, this.handleCreditsUpdate);
    },

    loadCatalog() {
      this.loadingCategories = true;
      this.loadingItems = true;
      socket.emit(RequestSocketsEnum.GET_SHOP_CATALOG);
    },

    handleCatalogResponse(response) {
      this.loadingCategories = false;
      this.loadingItems = false;

      if (response.success) {
        this.categories = response.categories || [];
        this.items = response.items || [];

        // Seleccionar automáticamente la primera categoría
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0]);
        }
      } else {
        console.error("Error loading catalog:", response.message);
        alert(this.$t("shop.error_loading"));
      }
    },

    selectCategory(category) {
      this.activeCategory = category;
      this.selectedItem = null;
      this.selectedQuantity = 1;
      this.purchaseMessage = null;
    },

    selectItem(item) {
      this.selectedItem = item;
      // Ajustar cantidad según los límites del item
      const minQuantity = item.min_purchase_quantity || 1;
      this.selectedQuantity = minQuantity;
      this.purchaseMessage = null;
    },

    clearSelectedItem() {
      this.selectedItem = null;
      this.selectedQuantity = 1;
      this.purchaseMessage = null;
    },

    closeShop() {
      this.purchaseMessage = null;
      this.purchaseMessageType = null;
      this.$emit('close-shop');
    },

    purchaseItem() {
      if (!this.selectedItem || this.purchasing) return;

      // Manejar pagos con Stripe
      if (this.selectedItem.price_type === 'stripe_payment') {
        this.handleStripePayment();
        return;
      }

      // Manejar pagos normales (oro/plata)
      this.purchasing = true;
      this.purchaseMessage = null;

      console.log('=== PURCHASE ATTEMPT (CLIENT) ===');
      console.log('Item:', this.selectedItem.name);
      console.log('Item ID:', this.selectedItem.id);
      console.log('Item Price:', this.selectedItem.price);
      console.log('Selected Quantity:', this.selectedQuantity);
      console.log('Quantity Type:', typeof this.selectedQuantity);
      console.log('Total Price:', this.totalPrice);
      console.log('User Gold:', this.authUser.gold);

      socket.emit(RequestSocketsEnum.PURCHASE_SHOP_ITEM, {
        catalog_item_id: this.selectedItem.id,
        quantity: this.selectedQuantity,
      });
    },

    async handleStripePayment() {
      try {
        this.purchasing = true;
        this.purchaseMessage = this.$t("shop.processing_payment");

        // Crear checkout session con la API
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const jwtToken = localStorage.getItem("app_jwt");
        
        if (!jwtToken) {
          throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        }
        
        const response = await fetch(`${apiBaseUrl}/api/stripe/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            catalog_item_id: this.selectedItem.id,
            quantity: this.selectedQuantity,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al crear sesión de pago');
        }

        // Abrir Stripe Checkout en nueva ventana
        console.log('Opening Stripe Checkout:', data.checkout_url);
        const stripeWindow = window.open(data.checkout_url, '_blank', 'width=800,height=700');
        
        if (!stripeWindow) {
          throw new Error('No se pudo abrir la ventana de pago. Por favor, permite las ventanas emergentes.');
        }

        // Escuchar el mensaje de retorno de la ventana de pago
        const messageListener = (event) => {
          // Permitir tanto localhost:8000 como el dominio configurado
          const allowedOrigins = [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            import.meta.env.VITE_WEB_BASE_URL
          ].filter(Boolean);
          
          if (!allowedOrigins.some(origin => event.origin === origin)) {
            return;
          }

          if (event.data.type === 'request_jwt_for_stripe') {
            // La ventana de Stripe solicita el JWT para procesar el pago
            const jwtToken = localStorage.getItem("app_jwt");
            
            if (jwtToken && event.source) {
              event.source.postMessage({
                type: 'jwt_response',
                jwt: jwtToken
              }, event.origin);
            } else {
              event.source.postMessage({
                type: 'jwt_not_found'
              }, event.origin);
            }

          } else if (event.data.type === 'stripe_payment_success') {
            this.purchasing = false;
            this.purchaseMessage = this.$t("shop.purchase_success");
            this.purchaseMessageType = "success";
            
            // Actualizar créditos del usuario si es necesario
            if (event.data.user) {
              this.$emit("purchase-success", event.data.user);
            }

            // Resetear cantidad
            this.selectedQuantity = 1;

            // Cerrar ventana de Stripe si sigue abierta
            if (stripeWindow && !stripeWindow.closed) {
              stripeWindow.close();
            }

            // Ocultar mensaje después de 3 segundos
            setTimeout(() => {
              this.purchaseMessage = null;
            }, 3000);

          } else if (event.data.type === 'stripe_payment_cancel') {
            this.purchasing = false;
            this.purchaseMessage = "Pago cancelado";
            this.purchaseMessageType = "error";

            // Cerrar ventana de Stripe si sigue abierta
            if (stripeWindow && !stripeWindow.closed) {
              stripeWindow.close();
            }

            setTimeout(() => {
              this.purchaseMessage = null;
            }, 3000);

          } else if (event.data.type === 'stripe_payment_retry') {
            this.purchasing = false;
            // Reiniciar el proceso de pago
            setTimeout(() => {
              this.handleStripePayment();
            }, 500);

          } else if (event.data.type === 'stripe_payment_error') {
            this.purchasing = false;
            this.purchaseMessage = event.data.message || this.$t("shop.purchase_error");
            this.purchaseMessageType = "error";

            // Cerrar ventana de Stripe si sigue abierta
            if (stripeWindow && !stripeWindow.closed) {
              stripeWindow.close();
            }

            setTimeout(() => {
              this.purchaseMessage = null;
            }, 5000);
          }
        };

        window.addEventListener('message', messageListener);

        // Limpiar listener cuando la ventana se cierre
        const checkClosed = setInterval(() => {
          if (stripeWindow.closed) {
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosed);
            this.purchasing = false;
          }
        }, 1000);

      } catch (error) {
        console.error('Error al procesar pago Stripe:', error);
        this.purchasing = false;
        this.purchaseMessage = this.$t("shop.purchase_error");
        this.purchaseMessageType = "error";
      }
    },

    handleCreditsUpdate(data) {
      // Actualizar créditos del usuario desde socket
      this.$emit("purchase-success", {
        gold: data.gold,
        silver: data.silver
      });
    },

    handlePurchaseResponse(response) {
      this.purchasing = false;

      if (response.success) {
        // Emitir evento de compra exitosa con los datos del usuario actualizados
        this.$emit("purchase-success", response.user);

        // Mostrar mensaje de éxito visual
        this.purchaseMessage = this.$t("shop.purchase_success");
        this.purchaseMessageType = "success";

        // Resetear cantidad
        this.selectedQuantity = 1;

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          this.purchaseMessage = null;
        }, 3000);
      } else {
        console.error("Error purchasing item:", response.message);

        // Mostrar mensaje de error visual
        this.purchaseMessage = response.message || this.$t("shop.purchase_error");
        this.purchaseMessageType = "error";

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.purchaseMessage = null;
        }, 5000);
      }
    },

    onImageError(event) {
      event.target.src = '/assets/game/default-item.png';
    },
  },
};
</script>

<style scoped>
.shop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 39%);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.shop {
  width: 900px;
  height: 620px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: relative;
  z-index: 101;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 3px 3px #0000004d;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  color: black;
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
}

.shop__container {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  margin-top: 25px;
}

.shop__categories {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-right: 10px;
  width: 160px;
  overflow-y: auto;
}

.shop__category {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  color: black;
  transition: background-color 0.2s;
}

.shop__category:hover {
  background-color: #e0e0e0;
}

.shop__category.active {
  background-color: #d96b35;
  color: white;
}

.shop__content {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  flex: 1;
}

.shop__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  box-shadow: 0 3px #0000004d;
  margin-bottom: 10px;
}

.shop__items-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-bottom: 10px;
}

.shop__items-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding-right: 5px;
}

.shop__item {
  aspect-ratio: 1;
  background-color: #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.shop__item:hover {
  background-color: #e0e0e0;
  /*transform: scale(1.05);*/
}

.shop__item.selected {
  border-color: #d96b35;
  background-color: #ffe0d0;
}

.shop__item .item-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.shop__item-details {
  background-color: #ffffff;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 3px #0000004d;
  display: flex;
  gap: 15px;
  min-height: 150px;
  position: relative;
}

.close-item-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  color: #d96b35;
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
  z-index: 10;
  transition: all 0.2s;
}

.close-item-button:hover {
  background-color: #d96b35;
  color: white;
  transform: scale(1.1);
}

.item-details__image {
  width: 120px;
  height: 120px;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.item-details__image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.item-details__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-name {
  font-size: 18px;
  font-weight: bold;
  color: #d96b35;
  margin: 0;
}

.item-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  line-height: 1.4;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 5px 0;
}

.quantity-selector label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.quantity-select {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.purchase-message {
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.purchase-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.purchase-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-price i {
  font-size: 24px;
}

.buy-button {
  background-color: #d96b35;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.buy-button:hover:not(:disabled) {
  background-color: #c55a2e;
}

.buy-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-container,
.no-data-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;
}

.loading-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #d96b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
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
</style>
