<template>
  <div class="tabs-container">
    <div class="tabs-container__emojis" @click="activeTab = 'emojis'"></div>
    <div class="tabs-container__statistics" @click="activeTab = 'statistics'"></div>
  </div>
  <component :is="activeTabComponent" :user="user" />
</template>

<script>
import EmojisTabComponent from "./tabs/EmojisTabComponent.vue";
import StatisticsTabComponent from "./tabs/StatisticsTabComponent.vue";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeTab: "emojis",
    };
  },
  methods: {},
  computed: {
    activeTabComponent() {
      if (this.activeTab === "emojis") {
        return EmojisTabComponent;
      } else if (this.activeTab === "statistics") {
        return StatisticsTabComponent;
      }
    },
  },
  components: {
    EmojisTabComponent,
    StatisticsTabComponent,
  },
};
</script>

<style scoped>
.tabs-container {
  max-width: 177px; 
  width: 100%;
  height: 15px;
  display: flex;
  gap: 3px;
}

.tabs-container__emojis{
  height: 17px;
  width: 100%;
  border-radius: 8px 8px 0 0;
  background-color: white;
  cursor: pointer;
}

.tabs-container__statistics{
  height: 17px;
  width: 30px;
  border-radius: 8px 8px 0 0;
  background-color: white;
  cursor: pointer;
}
</style>
