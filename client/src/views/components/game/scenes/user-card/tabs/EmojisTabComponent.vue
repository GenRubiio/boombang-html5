<template>
  <div class="container" :class="colorUser">
    <div>
      <img
        :src="asset_laughter_1_image"
        alt="Laughter 1"
        @click="sendEmoji(1)"
      />
    </div>
    <div>
      <img
        :src="asset_laughter_2_image"
        alt="Laughter 2"
        @click="sendEmoji(2)"
      />
    </div>
    <div>
      <img :src="asset_cry_image" alt="Cry" @click="sendEmoji(3)" />
    </div>
    <div>
      <img :src="asset_love_image" alt="Love" @click="sendEmoji(4)" />
    </div>
    <div>
      <img :src="asset_spit_image" alt="Spit" @click="sendEmoji(5)" />
    </div>
    <div>
      <img :src="asset_fart_image" alt="Fart" @click="sendEmoji(6)" />
    </div>
    <div>
      <img :src="asset_provoke_image" alt="Provoke" @click="sendEmoji(7)" />
    </div>
    <div>
      <img :src="asset_fly_image" alt="Fly" @click="sendEmoji(8)" />
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import asset_laughter_1_image from "@/assets/game/ficha/emojis/laughter_1.webp";
import asset_laughter_2_image from "@/assets/game/ficha/emojis/laughter_2.webp";
import asset_cry_image from "@/assets/game/ficha/emojis/cry.webp";
import asset_love_image from "@/assets/game/ficha/emojis/love.webp";
import asset_spit_image from "@/assets/game/ficha/emojis/spit.webp";
import asset_fart_image from "@/assets/game/ficha/emojis/fart.webp";
import asset_provoke_image from "@/assets/game/ficha/emojis/provoke.webp";
import asset_fly_image from "@/assets/game/ficha/emojis/fly.webp";

export default {
  props: {
    selectedUser: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      asset_laughter_1_image,
      asset_laughter_2_image,
      asset_cry_image,
      asset_love_image,
      asset_spit_image,
      asset_fart_image,
      asset_provoke_image,
      asset_fly_image,
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
      if (this.selectedUser.ficha_color == "user") {
        return this.selectedUser.is_selected ? "selected" : "user";
      }
      return this.selectedUser.ficha_color;
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
  z-index: 1;
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
