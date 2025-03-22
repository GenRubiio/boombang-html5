<template>
  <div class="container" :class="colorUser">
    <div>
      <img
        :src="asset_laughter_1Image"
        alt="Laughter 1"
        @click="sendEmoji(1)"
      />
    </div>
    <div>
      <img
        :src="asset_laughter_2Image"
        alt="Laughter 2"
        @click="sendEmoji(2)"
      />
    </div>
    <div>
      <img :src="asset_cryImage" alt="Cry" @click="sendEmoji(3)" />
    </div>
    <div>
      <img :src="asset_loveImage" alt="Love" @click="sendEmoji(4)" />
    </div>
    <div>
      <img :src="asset_spitImage" alt="Spit" @click="sendEmoji(5)" />
    </div>
    <div>
      <img :src="asset_fartImage" alt="Fart" @click="sendEmoji(6)" />
    </div>
    <div>
      <img :src="asset_provokeImage" alt="Provoke" @click="sendEmoji(7)" />
    </div>
    <div>
      <img :src="asset_flyImage" alt="Fly" @click="sendEmoji(8)" />
    </div>
  </div>
</template>

<script>
import socket from "../../../../../../sockets/socket";
import RequestSocketsEnum from "../../../../../../enums/RequestSocketsEnum";
import asset_laughter_1Image from "../../../../../../assets/game/ficha/emojis/laughter_1.png";
import asset_laughter_2Image from "../../../../../../assets/game/ficha/emojis/laughter_2.png";
import asset_cryImage from "../../../../../../assets/game/ficha/emojis/cry.png";
import asset_loveImage from "../../../../../../assets/game/ficha/emojis/love.png";
import asset_spitImage from "../../../../../../assets/game/ficha/emojis/spit.png";
import asset_fartImage from "../../../../../../assets/game/ficha/emojis/fart.png";
import asset_provokeImage from "../../../../../../assets/game/ficha/emojis/provoke.png";
import asset_flyImage from "../../../../../../assets/game/ficha/emojis/fly.png";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      asset_laughter_1Image,
      asset_laughter_2Image,
      asset_cryImage,
      asset_loveImage,
      asset_spitImage,
      asset_fartImage,
      asset_provokeImage,
      asset_flyImage,
    };
  },
  methods: {
    sendEmoji(emoji) {
      socket.emit(RequestSocketsEnum.SEND_EMOJI, {
        emoji_id: emoji,
      });
    },
  },
  computed: {
    colorUser() {
      if (this.user.is_admin) {
        return "admin";
      }
      if (this.user.is_vip) {
        return "vip";
      }
      return this.user.is_selected ? "selected" : "user";
    },
  },
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Siempre 4 columnas */
  grid-template-rows: repeat(2, 1fr); /* Siempre 4 filas */
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
  height: 90px;
  position: relative;
  z-index: 0;
}

.container div {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.container img {
  max-width: 100%; /* Ajusta el tamaño de las imágenes */
  height: auto;
  display: block;
}

.container div:hover img {
  opacity: 0.5; /* Reduce la opacidad al 50% al pasar el cursor */
  transition: opacity 0.1s ease-in-out; /* Transición suave */
}
</style>
