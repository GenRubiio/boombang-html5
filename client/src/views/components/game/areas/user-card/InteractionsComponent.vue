<template>
  <div class="container">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div>
      <img :src="red_upper" alt="upper" @click="sendUppercut" />
    </div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
import socket from "../../../../../sockets/socket";
import RequestSocketsEnum from "../../../../../enums/RequestSocketsEnum";
import red_upper from "../../../../../assets/game/uppercuts/red.png";

export default {
  data() {
    return {
      red_upper,
    };
  },
  methods: {
    sendUppercut() {
      socket.emit(RequestSocketsEnum.SEND_UPPERCUT);
    },
  },
  computed: {},
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  margin: 10px auto 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Siempre 4 columnas */
  grid-template-rows: repeat(2, 1fr); /* Siempre 4 filas */
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
  height: 90px;
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
