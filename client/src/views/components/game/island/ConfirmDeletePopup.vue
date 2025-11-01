<template>
  <div v-if="visible" class="confirm-popup-overlay" @click.self="onCancel">
    <div class="confirm-popup-content">
      <button class="confirm-popup-close" @click="onCancel">
        <i class="las la-times"></i>
      </button>
      <h2 class="confirm-popup-title">{{ title }}</h2>
      <p class="confirm-popup-text">{{ message }}</p>
      <div class="confirm-popup-buttons">
        <button @click="onConfirm" class="confirm-popup-button confirm">
          {{ confirmText }}
        </button>
        <button @click="onCancel" class="confirm-popup-button cancel">
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfirmDeletePopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: "Confirmar",
    },
    cancelText: {
      type: String,
      default: "Cancelar",
    },
  },
  emits: ["confirm", "cancel"],
  methods: {
    onConfirm() {
      this.$emit("confirm");
    },
    onCancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped>
.confirm-popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #00000075;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-popup-content {
  position: relative;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffffe3;
  box-shadow: 3px 3px #0000004d;
  width: 400px;
  text-align: center;
}

.confirm-popup-title {
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

.confirm-popup-text {
  color: #d96b35;
  font-size: 16px;
  margin-bottom: 25px;
}

.confirm-popup-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirm-popup-button {
  padding: 12px 25px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.confirm-popup-button.confirm {
  background-color: #fd9a03;
  color: white;
}

.confirm-popup-button.confirm:hover {
  background-color: #ff9900;
  transform: translateY(-2px);
}

.confirm-popup-button.cancel {
  background-color: #dc3545;
  color: white;
}

.confirm-popup-button.cancel:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.confirm-popup-close {
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
