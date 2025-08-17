<template>
  <div class="shadow-item">
    <div class="shadow-item__icon">
      <img :src="iconUrl" alt="Shadow Icon" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    shadow: {
      type: Object,
      required: true,
    },
  },
  computed: {
    iconUrl() {
      // The path is relative to the public directory
      return `/${this.shadow.image}`;
    },
  },
};
</script>

<style scoped>
.shadow-item {
  display: flex;
  align-items: center;
  align-self: center;
  align-content: center;
  width: 100%;
  border-radius: 5px;
  position: relative;
  padding: 4px 5px;
  box-sizing: border-box;
  justify-content: center;
}

.shadow-item__icon img {
  width: 65px;
}
</style>
