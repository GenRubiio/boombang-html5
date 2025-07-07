<template>
  <div class="lobby__islands-subtabs">
    <div
      class="lobby__islands-subtabs-tab fixed-width"
      :class="{ selected: activeIslandTab === 'public' }"
      @click="$emit('update:activeIslandTab', 'public')"
    >
      Islas
    </div>
    <div
      class="lobby__islands-subtabs-tab fixed-width"
      :class="{ selected: activeIslandTab === 'favorites' }"
      @click="$emit('update:activeIslandTab', 'favorites')"
    >
      Favoritas
    </div>
    <div
      class="lobby__islands-subtabs-tab fixed-width"
      :class="{ selected: activeIslandTab === 'myIslands' }"
      @click="$emit('update:activeIslandTab', 'myIslands')"
    >
      Mis Islas
    </div>
    <button class="lobby__islands-subtabs-tab create-button" @click="$emit('create-island')">
      +
    </button>
  </div>
</template>

<script>
export default {
  props: {
    activeIslandTab: String,
  },
};
</script>

<style scoped>
.lobby__islands-subtabs {
  display: flex;
  gap: 3px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lobby__islands-subtabs-tab {
  background-color: #3a4b54c9;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  border: none;
}

.lobby__islands-subtabs-tab.selected {
  background-color: #1c2c35ad;
}

.create-button {
  background-color: #4caf50; /* Color verde para el botón de crear */
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fixed-width {
  width: 100px;
  text-align: center;
}
</style>
