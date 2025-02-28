<template>
  <div class="container" @pointerdown.stop @mousedown.stop @touchstart.stop>
    <input
      v-model="message"
      type="text"
      placeholder="Escribe un mensaje..."
      @keyup.enter="sendMessage"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "", // Variable para almacenar el mensaje
    };
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== "") {
        this.$emit("sendMessage", this.message); // Emite el mensaje al padre
        this.message = ""; // Limpia el input después de enviar
      }
    },
  },
};
</script>

<style scoped>
.container {
  position: absolute;
  bottom: 0;
  padding: 10px;
  width: 70%;
}

.container input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
</style>
