<template>
  <div class="emojis-picker">
    <button class="close-button" @click="$emit('close')">
      <i class="las la-times"></i>
    </button>
    <div class="emojis-picker__tabs">
      <button
        v-for="(emojis, category) in emojiCategories"
        :key="category"
        class="emojis-picker__tab"
        :class="{ 'emojis-picker__tab--active': activeCategory === category }"
        @click="changeCategory(category)"
      >
        {{ emojis[0] }}
      </button>
    </div>
    <div v-if="isContentVisible" class="emojis-picker__content">
      <span
        v-for="emoji in activeCategoryEmojis"
        :key="emoji"
        class="emojis-picker__emoji"
        @click="selectEmoji(emoji)"
      >
        {{ emoji }}
      </span>
    </div>
  </div>
</template>

<script>
import asset_emojis_data from "@/assets/game/data/emojis.json";

export default {
  name: "EmojisPickerComponent",
  emits: ["emoji-clicked", "close"],
  data() {
    return {
      activeCategory: "Smileys",
      isContentVisible: true,
      emojiCategories: asset_emojis_data,
    };
  },
  computed: {
    activeCategoryEmojis() {
      return this.emojiCategories[this.activeCategory];
    },
  },
  methods: {
    selectEmoji(emoji) {
      this.$emit("emoji-clicked", emoji);
    },
    changeCategory(category) {
      if (this.activeCategory === category) return;

      this.isContentVisible = false;
      this.activeCategory = category;

      this.$nextTick(() => {
        this.isContentVisible = true;
      });
    },
  },
};
</script>

<style scoped>
.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 2px #0000004d;
  padding: 0;
  color: black;
}
.emojis-picker {
  position: absolute;
  bottom: 97px;
  right: 12px;
  width: 300px;
  height: 200px;
  background-color: #ffffffd9;
  border: 1px solid white;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 3px #0000004d;
  z-index: 100;
}

.emojis-picker__tabs {
  display: flex;
  border-bottom: 1px solid #c7c7c7;
  margin-top: 30px;
  padding-bottom: 0;
  border-radius: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.emojis-picker__tab {
  flex: 1;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #333;
  transition: background-color 0.2s;
  outline: none;
    border-radius: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.emojis-picker__tab:hover {
  background-color: #f0f0f0;
}

.emojis-picker__tab--active {
  background-color: #d1d1d1;
  font-weight: bold;
  border-radius: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.emojis-picker__content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.emojis-picker__emoji {
  cursor: pointer;
  font-size: 24px;
  padding: 2px;
  border-radius: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  transition: background-color 0.2s;
}

.emojis-picker__emoji:hover {
  background-color: #f0f0f0;
}

/* Custom scrollbar for webkit browsers */
.emojis-picker__content::-webkit-scrollbar {
  width: 8px;
}

.emojis-picker__content::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.emojis-picker__content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
  border: 2px solid #f0f0f0;
}
</style>
