<template>
  <div
    class="name-item"
    :style="{
      '--bg': colorname.background_color,
      '--fg': colorname.color,
    }"
  >
    <div class="name-item__text">{{ colorname.text }}</div>
  </div>
</template>

<script>
export default {
  props: {
    colorname: { type: Object, required: true },
  },
};
</script>

<style scoped>
.name-item {
  /* usa las variables */
  background-color: var(--bg);
  color: var(--fg);

  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  border-radius: 5px;
  position: relative;
  padding: 4px 5px;
  box-sizing: border-box;
}

/* Triángulo hacia abajo centrado */
.name-item::after {
  content: "";
  position: absolute;
  bottom: -6px; /* separa la flecha */
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--bg); /* mismo color que el fondo */
}

/* Texto */
.name-item__text {
  font-family: Arial, Helvetica, sans-serif;
  font-weight: normal;
  font-size: 14px;
}
</style>
