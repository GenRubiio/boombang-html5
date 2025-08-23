<template>
  <div class="alert-overlay" v-if="visible">
    <div class="alert-box">
      <p>¿Seguro que quieres gastar 100 créditos de plata?</p>
      <div class="buttons">
        <button @click="onConfirm">Sí</button>
        <button @click="onCancel">No</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertWishGachaComponent',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['confirm', 'cancel'],
  methods: {
    onConfirm() {
      this.$emit('confirm');
    },
    onCancel() {
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.alert-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: black;
  font-family: sans-serif;
}
.buttons {
  margin-top: 20px;
}
button {
  margin: 0 10px;
  padding: 10px 20px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>