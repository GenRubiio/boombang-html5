<template>
  <div v-if="visible" class="gacha-popup-overlay" @click.self="onClose">
    <div class="gacha-popup-content">
      <button class="gacha-popup-close" @click="onClose">
        <i class="las la-times"></i>
      </button>
      <h2 class="gacha-popup-title">¡Has obtenido un objeto!</h2>
      <div class="item-display">
        <img :src="item.image" :alt="item.name" class="item-image" />
        <p class="item-name">{{ item.name }}</p>
      </div>
      <div class="gacha-popup-buttons">
        <button @click="onClose" class="gacha-popup-button confirm">
          ¡Genial!
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GachaResultPopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => ({ name: "", image: "" }),
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

.item-display {
  margin-bottom: 20px;
}

.item-image {
  max-width: 150px;
  height: auto;
  margin-bottom: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  background-color: #eee;
}

.item-name {
  font-size: 18px;
  font-weight: bold;
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
