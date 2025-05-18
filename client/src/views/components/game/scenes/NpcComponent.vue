<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <!-- aquí va tu contenido del NPC -->
      <h2>Información del NPC</h2>
      <!-- usa props.npcData si lo necesitas -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    npcId: Number, // opcional
  },
};
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}
.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
