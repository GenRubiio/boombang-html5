<template>
  <div class="modal-info">
        <h2>{{ $t("npc.ring.welcome") }}</h2>
    <p>{{ $t("npc.ring.description") }}</p>
    <p class="alert-search" v-if="isSubscribed">
      {{ $t("npc.ring.searching") }}
    </p>
    <div class="modal-info__buttons">
      <button
        @click="onToggle"
        :class="['btn-subscribe', { unsub: isSubscribed }]"
      >
        {{ isSubscribed ? $t("npc.ring.cancel") : $t("npc.ring.subscribe") }}
      </button>
    </div>
    <p>**************************************************************</p>
    <p>{{ $t("npc.ring.unlock_gloves") }}</p>
    <div class="modal-info__grid">
      <div
        class="modal-info__grid-item"
        v-for="(glove, index) in gloves"
        :key="index"
      >
        <div class="modal-info__grid-item-image">
          <img :src="glove.image" :alt="glove.alt" />
        </div>
        <div class="modal-info__grid-item-name" v-html="glove.name"></div>
      </div>
    </div>
    <p>**************************************************************</p>
    <p>{{ $t("npc.ring.weekly_trophies") }}</p>
    <div class="modal-info__footer">
      <div class="modal-info__footer-image">
        <img :src="asset_trophies_image" :alt="$t('npc.ring.trophies_alt')" />
      </div>
    </div>
  </div>
</template>

<script>
import asset_upper_red_image from "@/assets/game/ficha/uppercuts/red.webp";
import asset_upper_pink_image from "@/assets/game/ficha/uppercuts/pink.webp";
import asset_upper_orange_image from "@/assets/game/ficha/uppercuts/orange.webp";
import asset_upper_green_image from "@/assets/game/ficha/uppercuts/green.webp";
import asset_upper_blue_image from "@/assets/game/ficha/uppercuts/blue.webp";
import asset_upper_white_image from "@/assets/game/ficha/uppercuts/white.webp";
import asset_upper_purple_image from "@/assets/game/ficha/uppercuts/purple.webp";
import asset_upper_brown_image from "@/assets/game/ficha/uppercuts/brown.webp";
import asset_upper_black_image from "@/assets/game/ficha/uppercuts/black.webp";
import asset_upper_gold_image from "@/assets/game/ficha/uppercuts/gold.webp";
import asset_trophies_image from "@/assets/game/games/trophie_game_1.webp";
import socket from "@/sockets/socket";
import { useNpcSubscriptionStore } from "@/stores/NpcSubscriptionTest.js";
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
    gloves() {
      return [
        {
          name: this.$t("npc.ring.gloves.red", { victories: 0 }),
          image: asset_upper_red_image,
          alt: this.$t("npc.ring.gloves.alt.red"),
        },
        {
          name: this.$t("npc.ring.gloves.white", { victories: "1.000" }),
          image: asset_upper_white_image,
          alt: this.$t("npc.ring.gloves.alt.white"),
        },
        {
          name: this.$t("npc.ring.gloves.pink", { victories: 10 }),
          image: asset_upper_pink_image,
          alt: this.$t("npc.ring.gloves.alt.pink"),
        },
        {
          name: this.$t("npc.ring.gloves.purple", { victories: "2.000" }),
          image: asset_upper_purple_image,
          alt: this.$t("npc.ring.gloves.alt.purple"),
        },
        {
          name: this.$t("npc.ring.gloves.orange", { victories: 100 }),
          image: asset_upper_orange_image,
          alt: this.$t("npc.ring.gloves.alt.orange"),
        },
        {
          name: this.$t("npc.ring.gloves.brown", { victories: "5.000" }),
          image: asset_upper_brown_image,
          alt: this.$t("npc.ring.gloves.alt.brown"),
        },
        {
          name: this.$t("npc.ring.gloves.green", { victories: 250 }),
          image: asset_upper_green_image,
          alt: this.$t("npc.ring.gloves.alt.green"),
        },
        {
          name: this.$t("npc.ring.gloves.black", { victories: "10.000" }),
          image: asset_upper_black_image,
          alt: this.$t("npc.ring.gloves.alt.black"),
        },
        {
          name: this.$t("npc.ring.gloves.blue", { victories: 500 }),
          image: asset_upper_blue_image,
          alt: this.$t("npc.ring.gloves.alt.blue"),
        },
        {
          name: this.$t("npc.ring.gloves.gold", { victories: "30.000" }),
          image: asset_upper_gold_image,
          alt: this.$t("npc.ring.gloves.alt.gold"),
        },
      ];
    },
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
  border-radius: 5px;
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
