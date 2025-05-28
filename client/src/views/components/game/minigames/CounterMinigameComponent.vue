<template>
  <div class="counter">{{ counter }}</div>
</template>

<script>
export default {
  props: {
    counter: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.counter {
  position: absolute;
  height: 100px;
  width: 100px;
  bottom: 100px;
  left: 45%;
  transform: translateX(-50%);
  background-color: #e6660c;
  color: white;
  padding: 10px;
  border-radius: 50%;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.4),
    /* sombra interna */ 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: sans-serif;
  line-height: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: glow 1s infinite alternate;
  font-weight: bold;
  font-size: 55px;
}

@keyframes glow {
  0% {
    box-shadow: inset 0 0 5px rgba(255, 180, 120, 0.3),
      0 0 10px rgba(255, 140, 0, 0.4), 0 0 20px rgba(255, 120, 0, 0.2);
    transform: scale(1);
  }
  100% {
    box-shadow: inset 0 0 15px rgba(255, 210, 160, 0.6),
      0 0 20px rgba(255, 150, 0, 0.6), 0 0 30px rgba(255, 130, 0, 0.4);
    transform: scale(1.05);
  }
}
</style>
