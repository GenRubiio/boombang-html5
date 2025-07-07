<template>
  <div class="lobby__scenes-tab">
    <IslandsSubTabs
      :active-island-tab="activeIslandTab"
      @update:activeIslandTab="$emit('update:activeIslandTab', $event)"
      @create-island="$emit('create-island')"
    />
    <PublicIslands
      v-if="activeIslandTab === 'public'"
      :islands="publicIslands"
      @join-island="$emit('join-island', $event)"
    />
    <FavoriteIslands
      v-if="activeIslandTab === 'favorites'"
      :islands="favoriteIslands"
      @join-island="$emit('join-island', $event)"
    />
    <MyIslands
      v-if="activeIslandTab === 'myIslands'"
      :islands="myIslands"
      @join-island="$emit('join-island', $event)"
    />
  </div>
</template>

<script>
import IslandsSubTabs from "./IslandsSubTabsComponent.vue";
import PublicIslands from "./PublicIslandsComponent.vue";
import FavoriteIslands from "./FavoriteIslandsComponent.vue";
import MyIslands from "./MyIslandsComponent.vue";

export default {
  components: {
    IslandsSubTabs,
    PublicIslands,
    FavoriteIslands,
    MyIslands,
  },
  props: {
    activeIslandTab: String,
    publicIslands: Array,
    favoriteIslands: Array,
    myIslands: Array,
  },
};
</script>
