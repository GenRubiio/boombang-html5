<template>
  <div class="lobby__scenes-list" ref="scrollContainer">
    <div v-for="island in islands" :key="island.id" class="scene-item">
      <button @click="handleClick(island.id)" :disabled="isJoining">
        <span class="scene-name">{{ island.name }}</span>
        <span class="user-count">{{ island.visitors }}</span>
      </button>
    </div>
    <div v-if="islands.length === 0" class="empty-message">
      {{ $t('lobby.my_islands.no_islands') }}
    </div>
  </div>
</template>

<script>
import { useOverlayScrollbars } from '@/composables/useOverlayScrollbars';
import 'overlayscrollbars/overlayscrollbars.css';

export default {
  props: {
    islands: Array,
  },
  data() {
    return {
      isJoining: false,
    };
  },
  mounted() {
    const { initScrollbars } = useOverlayScrollbars();
    initScrollbars(this.$refs.scrollContainer);
  },
  methods: {
    handleClick(islandId) {
      if (this.isJoining) return;
      this.isJoining = true;
      this.$emit("join-island", islandId);
    },
  },
};
</script>

<style scoped>
.lobby__scenes-list {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 240px;
  overflow: hidden;
}

.scene-item {
  margin-bottom: 5px;
}

.scene-item:last-child {
  margin-bottom: 0;
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
  gap: 5px;
}

.lobby__scenes-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
}

.scene-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.user-count {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  flex-shrink: 0;
}

.empty-message {
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}
</style>
