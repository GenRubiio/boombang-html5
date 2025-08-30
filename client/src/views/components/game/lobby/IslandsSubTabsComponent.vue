<template>
  <div class="lobby__islands-subtabs">
    <div class="lobby__islands-subtabs-container">
      <div class="tooltip-container">
        <div
          class="lobby__islands-subtabs-tab"
          :class="{ selected: activeIslandTab === 'public' }"
          @click="$emit('update:activeIslandTab', 'public')"
        >
          <img :src="asset_nav_islands_image" :alt="$t('lobby.islands.public_alt')" />
        </div>
        <span class="tooltip-text">{{ $t('lobby.islands.public') }}</span>
      </div>
      <div class="tooltip-container">
        <div
          class="lobby__islands-subtabs-tab"
          :class="{ selected: activeIslandTab === 'favorites' }"
          @click="$emit('update:activeIslandTab', 'favorites')"
        >
          <img :src="asset_nav_favorites_image" :alt="$t('lobby.islands.favorites_alt')" />
        </div>
        <span class="tooltip-text">{{ $t('lobby.islands.favorites') }}</span>
      </div>
      <div class="tooltip-container">
        <div
          class="lobby__islands-subtabs-tab"
          :class="{ selected: activeIslandTab === 'myIslands' }"
          @click="$emit('update:activeIslandTab', 'myIslands')"
        >
          <img :src="asset_nav_my_islands_image" :alt="$t('lobby.islands.my_islands_alt')" />
        </div>
        <span class="tooltip-text">{{ $t('lobby.islands.my_islands') }}</span>
      </div>
    </div>
    <div class="tooltip-container">
      <button
        class="lobby__islands-subtabs-tab create-button"
        @click="$emit('create-island')"
      >
        <div class="create-island-text">{{ $t('lobby.islands.create_island') }}</div>
        <div class="create-island-image">
          <img :src="asset_create_island_image" :alt="$t('lobby.islands.create_island_alt')" />
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import asset_nav_islands_image from "@/assets/game/lobby/nav/islands.webp";
import asset_nav_favorites_image from "@/assets/game/lobby/nav/favorite_islands.webp";
import asset_nav_my_islands_image from "@/assets/game/lobby/nav/my_islands.webp";
import asset_create_island_image from "@/assets/game/lobby/nav/create_island.webp";

export default {
  props: {
    activeIslandTab: String,
  },
  data() {
    return {
      asset_nav_islands_image,
      asset_nav_favorites_image,
      asset_nav_my_islands_image,
      asset_create_island_image,
    };
  },
};
</script>

<style scoped>
.lobby__islands-subtabs-container {
  display: flex;
  gap: 3px;
  justify-content: space-between;
}

.create-island-text {
  font-size: 11px;
  line-height: 12px;
  text-align: start;
}

.create-island-image {
  height: 100%;
}

.lobby__islands-subtabs {
  display: flex;
  gap: 3px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lobby__islands-subtabs-tab {
  background-color: #3a4b54c9;
  color: white;
  padding: 3px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  border: none;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
}

.lobby__islands-subtabs-tab img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.lobby__islands-subtabs-tab.selected {
  background-color: #1c2c35ad;
}

.create-button {
  background: linear-gradient(
    to bottom,
    rgba(58, 75, 84, 0.9) 49.5%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(44, 57, 64, 0.9) 50.5%
  );
  width: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Tooltip Styles */
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  width: auto;
  white-space: nowrap;
  background-color: #1c2c35;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
  pointer-events: none;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  bottom: 100%; /* At the top of the tooltip */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #1c2c35 transparent; /* Triangle pointing up */
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>