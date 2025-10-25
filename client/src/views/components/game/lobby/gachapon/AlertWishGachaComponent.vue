<template>
  <div v-if="visible" class="gacha-popup-overlay" @click.self="$emit('cancel')">
    <div class="gacha-popup-content">
      <button class="gacha-popup-close" @click="$emit('cancel')">
        <i class="las la-times"></i>
      </button>
      <h2 class="gacha-popup-title">{{ $t('gacha.alert.title') }}</h2>
      <p class="gacha-popup-text">
        {{ $t('gacha.alert.text') }}
      </p>
      <div class="gacha-popup-buttons">
        <button @click="$emit('confirm')" class="gacha-popup-button confirm">
          {{ $t('gacha.alert.confirm') }}
        </button>
        <button @click="$emit('cancel')" class="gacha-popup-button cancel">
          {{ $t('gacha.alert.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AlertWishGachaComponent",
  props: {
    visible: {
      type: Boolean,
      default: false,
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
  font-size: 16px;
  margin-bottom: 25px;
}

.gacha-popup-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.gacha-popup-button {
  padding: 12px 25px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.gacha-popup-button.confirm {
  background-color: #fd9a03;
  color: white;
}

.gacha-popup-button.confirm:hover {
  background-color: #ff9900;
  transform: translateY(-2px);
}

.gacha-popup-button.cancel {
  background-color: #dc3545;
  color: white;
}

.gacha-popup-button.cancel:hover {
  background-color: #c82333;
  transform: translateY(-2px);
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
