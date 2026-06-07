<template>
  <div v-if="visible" class="error-alert-overlay" @click.self="onClose">
    <div class="error-alert-content">
      <button class="error-alert-close" @click="onClose">
        <i class="las la-times"></i>
      </button>
      <h2 class="error-alert-title">{{ title }}</h2>
      <p class="error-alert-text">{{ message }}</p>
      <div class="error-alert-buttons">
        <button @click="onClose" class="error-alert-button accept">
          {{ acceptText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorAlertPopup",
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
    acceptText: {
      type: String,
      default: "Aceptar",
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
.error-alert-overlay {
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

.error-alert-content {
  position: relative;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffffe3;
  box-shadow: 3px 3px #0000004d;
  width: 400px;
  text-align: center;
}

.error-alert-title {
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

.error-alert-text {
  color: #d96b35;
  font-size: 16px;
  margin-bottom: 25px;
}

.error-alert-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.error-alert-button {
  padding: 12px 25px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.error-alert-button.accept {
  background-color: #fd9a03;
  color: white;
}

.error-alert-button.accept:hover {
  background-color: #ff9900;
  transform: translateY(-2px);
}

.error-alert-close {
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
