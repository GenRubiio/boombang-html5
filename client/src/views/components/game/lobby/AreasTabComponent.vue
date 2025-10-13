<template>
  <div class="lobby__scenes-tab">
    <div class="lobby__scenes-list">
      <div v-for="publicScene in publicScenes" :key="publicScene.uuid">
        <button
          @click="handleClick(publicScene.uuid, MenuTypeEnum.PUBLIC_SCENE)"
          :disabled="isJoining"
        >
          {{ publicScene.name }}
          <span>{{ publicScene.total_users_in }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import MenuTypeEnum from "../../../../enums/MenuTypeEnum";
export default {
  props: {
    publicScenes: Array,
  },
  data() {
    return {
      MenuTypeEnum,
      isJoining: false,
    };
  },
  methods: {
    handleClick(sceneUuid, menuType) {
      if (this.isJoining) return;
      this.isJoining = true;
      this.$emit("join-scene", sceneUuid, menuType);
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
  max-height: 315px;
  overflow-y: overlay;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.lobby__scenes-list button span {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
}
</style>
