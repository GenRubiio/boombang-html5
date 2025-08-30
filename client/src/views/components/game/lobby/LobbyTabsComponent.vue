<template>
  <div class="lobby__scenes-container__tabs">
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'areas' }"
      @click="$emit('update:activeTab', 'areas')"
    >
      {{ $t('lobby.tabs.areas') }}
    </div>
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'games' }"
      @click="$emit('update:activeTab', 'games')"
    >
      {{ $t('lobby.tabs.games') }}
    </div>
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'islands' }"
      @click="$emit('update:activeTab', 'islands')"
    >
      {{ $t('lobby.tabs.islands') }}
    </div>
    <div
      class="lobby__scenes-container__tabs-tab"
      :class="{ selected: activeTab === 'search' }"
      @click="$emit('update:activeTab', 'search')"
    >
      <i class="las la-search"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeTab: String,
  },
};
</script>

<style scoped>
.lobby__scenes-container__tabs {
  display: flex;
  gap: 3px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lobby__scenes-container__tabs-tab {
  background-color: #3a4b54c9;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
}

.lobby__scenes-container__tabs-tab.selected {
  background-color: #1c2c35ad;
}

.fixed-width {
  width: 100px;
  text-align: center;
}
</style>
