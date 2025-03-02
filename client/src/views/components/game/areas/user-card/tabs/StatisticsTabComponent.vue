<template>
  <div class="container"></div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
  computed: {},
};
</script>

<style scoped>
.container {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  max-width: 400px; /* Evita que el grid se expanda más allá */
  width: 100%;
  box-sizing: border-box;
  height: 90px;
  position: relative;
  z-index: 0;
}
</style>
