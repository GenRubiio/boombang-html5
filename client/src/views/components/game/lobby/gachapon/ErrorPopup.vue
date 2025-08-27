<template>
  <div v-if="visible" class="gacha-popup-overlay" @click.self="$emit('close')">
    <div class="gacha-popup-content">
      <button class="gacha-popup-close" @click="$emit('close')">
        <i class="las la-times"></i>
      </button>
      <h2 class="gacha-popup-title">Error</h2>
      <p class="gacha-popup-text">{{ message }}</p>
      <div class="gacha-popup-buttons">
        <button @click="$emit('close')" class="gacha-popup-button confirm">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorPopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "Ha ocurrido un error inesperado.",
    },
  },
  emits: ["close"],
  methods: {
    onClose() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.gacha-popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #00000075;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gacha-popup-content {
  position: relative;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffffe3;
  box-shadow: 3px 3px #0000004d;
  width: 400px;
  text-align: center;
}

.gacha-popup-title {
  margin-top: 15px;
  text-align: center;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  margin-bottom: 15px;
  box-shadow: 0 3px #0000004d;
  text-shadow: 1px 1px #0000004d;
}

.gacha-popup-text {
  color: #d96b35;
}

.gacha-popup-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.gacha-popup-button {
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px #0000004d;
  transition: all 0.2s ease;
}

.gacha-popup-button:active {
  box-shadow: none;
  transform: translateY(3px);
}

.gacha-popup-button.confirm {
  background-color: #fd9a03;
  color: white;
}
.gacha-popup-close {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
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
  color: black;
}
</style>
