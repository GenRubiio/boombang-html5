<template>
  <div class="lobby__scenes-list">
    <div v-for="island in islands" :key="island.id">
      <button @click="$emit('join-island', island.id)">
        {{ island.name }}
        <span>{{ island.visitors }}</span>
      </button>
    </div>
    <div v-if="islands.length === 0" class="empty-message">
      No tienes islas favoritas
    </div>
  </div>
</template>

<script>
export default {
  props: {
    islands: Array,
  },
};
</script>

<style scoped>
.lobby__scenes-list {
  border-radius: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.lobby__scenes-list button {
  background-color: #3a4b54c9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px;
  width: 100%;
  text-align: left;
  font-size: 15px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.lobby__scenes-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button span {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
}

.empty-message {
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}
</style>
