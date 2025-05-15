<template>
  <div class="popup">
    <button class="close" @click="close">×</button>
    <div class="content">
      <p>Prepárate, el juego está a punto de empezar.</p>
      <p>Serás convocado de forma automática en tan solo 10 segundos.</p>
      <p>Tus adversarios ya están esperándote.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotificationMinigameComponent",
  emits: ["close"],
  data() {
    return {
      timerId: null,
    };
  },
  mounted() {
    // Ocultar automáticamente después de 10 segundos
    this.timerId = setTimeout(() => {
      this.$emit("close");
    }, 10000);
  },
  beforeUnmount() {
    clearTimeout(this.timerId);
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.popup {
  position: absolute;
  bottom: 90px;
  right: 20px;
  background-color: #006bb6;
  color: white;
  padding: 10px;
  width: 165px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: sans-serif;
  line-height: 1;
  text-align: start;
}
.popup .close {
  position: absolute;
  top: -2px;
  right: -8px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: white;
  cursor: pointer;
}
.popup .content p {
  margin: 15px 0;
  font-size: 15px;
  font-weight: bold;
}
</style>
