<template>
  <div class="modal-info">
    <h2>¡Bienvenido al Ring!</h2>
    <p>
      Aquí podrás participar en emocionantes combates y demostrar tus
      habilidades. ¡Prepárate para la acción!
    </p>
    <p class="alert-search" v-if="isSubscribed">Emparejamiento en curso...</p>
    <div class="modal-info__buttons">
      <button
        @click="onToggle"
        :class="['btn-subscribe', { unsub: isSubscribed }]"
      >
        {{ isSubscribed ? "Cancelar..." : "Inscribirme" }}
      </button>
    </div>
    <p>********************************************************</p>
    <p>Gana puntos compitiendo y desbloquea los siguentes guantes:</p>
    <div class="modal-info__grid">
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_red_image" alt="Guante Rojo" />
        </div>
        <div class="modal-info__grid-item-name">Rojo<br />0 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_white_image" alt="Guante Blanco" />
        </div>
        <div class="modal-info__grid-item-name">Blanco<br />1.000 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_pink_image" alt="Guante Rosa" />
        </div>
        <div class="modal-info__grid-item-name">Rosa<br />10 Victoria</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_purple_image" alt="Guante Púrpura" />
        </div>
        <div class="modal-info__grid-item-name">Púrpura<br />2.000 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_orange_image" alt="Guante Naranja" />
        </div>
        <div class="modal-info__grid-item-name">Naranja<br />100 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_brown_image" alt="Guante Marrón" />
        </div>
        <div class="modal-info__grid-item-name">Marrón<br />5.000 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_green_image" alt="Guante Verde" />
        </div>
        <div class="modal-info__grid-item-name">Verde<br />250 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_black_image" alt="Guante Negro" />
        </div>
        <div class="modal-info__grid-item-name">Negro<br />10.000 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_blue_image" alt="Guante Azul" />
        </div>
        <div class="modal-info__grid-item-name">Azul<br />500 Victorias</div>
      </div>
      <div class="modal-info__grid-item">
        <div class="modal-info__grid-item-image">
          <img :src="asset_upper_gold_image" alt="Guante Dorado" />
        </div>
        <div class="modal-info__grid-item-name">Dorado<br />30.000 Victorias</div>
      </div>
    </div>
    <p>********************************************************</p>
    <p>
      Los que más puntos ganen cada semana, conseguirán estos trofeos únicos:
    </p>
    <div class="modal-info__footer">
      <div class="modal-info__footer-image">
        <img :src="asset_trophies_image" alt="Trofeos" />
      </div>
    </div>
  </div>
</template>

<script>
import asset_upper_red_image from "../../../../../assets/game/ficha/uppercuts/red.png";
import asset_upper_pink_image from "../../../../../assets/game/ficha/uppercuts/pink.png";
import asset_upper_orange_image from "../../../../../assets/game/ficha/uppercuts/orange.png";
import asset_upper_green_image from "../../../../../assets/game/ficha/uppercuts/green.png";
import asset_upper_blue_image from "../../../../../assets/game/ficha/uppercuts/blue.png";
import asset_upper_white_image from "../../../../../assets/game/ficha/uppercuts/white.png";
import asset_upper_purple_image from "../../../../../assets/game/ficha/uppercuts/purple.png";
import asset_upper_brown_image from "../../../../../assets/game/ficha/uppercuts/brown.png";
import asset_upper_black_image from "../../../../../assets/game/ficha/uppercuts/black.png";
import asset_upper_gold_image from "../../../../../assets/game/ficha/uppercuts/gold.png";
import asset_trophies_image from "../../../../../assets/game/games/trophie_game_1.png";
import socket from "../../../../../sockets/socket";
import { useNpcSubscriptionStore } from "../../../../../stores/NpcSubscriptionTest.js";
import RequestSocketsEnum from "../../../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../../../enums/ResponseSocketsEnum";

export default {
  props: {
    npcId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      asset_upper_red_image,
      asset_upper_pink_image,
      asset_upper_orange_image,
      asset_upper_green_image,
      asset_upper_blue_image,
      asset_upper_white_image,
      asset_upper_purple_image,
      asset_upper_brown_image,
      asset_upper_black_image,
      asset_upper_gold_image,
      asset_trophies_image,
    };
  },
  computed: {
    isSubscribed() {
      const store = useNpcSubscriptionStore();
      return store.isSubscribed(this.npcId);
    },
  },
  methods: {
    handleSubscriptionStatus(response) {
      if (response.npcId === this.npcId) {
        const store = useNpcSubscriptionStore();
        store.setSubscription(this.npcId, response.isSubscribed);
      }
    },
    handleSubscriptionToggle(response) {
      if (response.success && response.npcId === this.npcId) {
        const store = useNpcSubscriptionStore();
        store.toggle(this.npcId);
      }
    },
    onToggle() {
      socket.emit(RequestSocketsEnum.MINIGAME_SUBSCRIBE, {
        type: this.npcId,
      });
    },
  },
  mounted() {
    // Listener para saber el estado inicial al abrir el modal
    socket.on(
      ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS,
      this.handleSubscriptionStatus
    );
    // Listener para la respuesta al hacer clic en el botón
    socket.on(
      ResponseSocketsEnum.MINIGAME_SUBSCRIBE,
      this.handleSubscriptionToggle
    );

    // Pedir el estado actual al servidor
    socket.emit(RequestSocketsEnum.GET_MINIGAME_SUBSCRIBE_STATUS, {
      type: this.npcId,
    });
  },
  unmounted() {
    socket.off(
      ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS,
      this.handleSubscriptionStatus
    );
    socket.off(
      ResponseSocketsEnum.MINIGAME_SUBSCRIBE,
      this.handleSubscriptionToggle
    );
  },
};
</script>

<style>
.modal-info__footer-image {
  width: 180px;
}

.modal-info__footer-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modal-info__footer {
  display: flex;
}

.modal-info__grid-item-image {
}

.modal-info__grid-item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modal-info {
  text-align: start;
  color: #fd9a03;
  padding-top: 5px;
}

.modal-info h2 {
  font-size: 28px;
  font-weight: bold;
  color: #d96b35;
  padding: 0;
  margin: 0;
}

.alert-search {
  color: #d96b35 !important;
}

.modal-info p {
  font-size: 14px;
  color: #fd9900;
  padding: 0;
  margin: 0;
  line-height: 1.2;
}

.modal-info__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.modal-info__grid-item-name {
  font-size: 12px;
  line-height: 14px;
  text-align: start;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.modal-info__grid-item {
  background-color: #fd9a03;
  padding: 0px 8px;
  border-radius: 5px;
  text-align: center;
  display: flex;
  color: white;
  height: 35px;
  position: relative;
}

.modal-info__grid-item p {
  color: white;
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 12px;
}

.modal-info__buttons {
  margin-top: 10px;
  margin-bottom: 10px;
}

.btn-subscribe {
  display: inline-block;
  padding: 10px 20px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid #0072c6;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: linear-gradient(to bottom, #6bd0fa 0%, #008ed6 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: opacity 0.2s, transform 0.2s;
}

.btn-subscribe:hover {
  opacity: 0.9;
}

.btn-subscribe:active {
  opacity: 0.8;
}
</style>
