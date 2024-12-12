<template>
  <button class="btn-exit" @click="exitToLobby">Salir al Lobby</button>
</template>

<script>
export default {
  methods: {
    exitToLobby() {
      this.$emit("exitLobby"); // Emite evento al padre
    },
  },
};
</script>

<style scoped>
.btn-exit {
  position: absolute;
  bottom: 10px;
  right: 10px;
  top: auto;
  background: #ff5555;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-exit:hover {
  background: #ff2222;
}
</style>
