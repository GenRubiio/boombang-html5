<template>
  <div class="lobby__scenes-container__tabs">
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'areas' }"
      @click="$emit('update:activeTab', 'areas')"
    >
      <span class="fit_label">{{ $t("lobby.tabs.areas") }}</span>
    </div>
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'games' }"
      @click="$emit('update:activeTab', 'games')"
    >
      <span class="fit_label">{{ $t("lobby.tabs.games") }}</span>
    </div>
    <div
      class="lobby__scenes-container__tabs-tab fixed-width"
      :class="{ selected: activeTab === 'islands' }"
      @click="$emit('update:activeTab', 'islands')"
    >
      <span class="fit_label">{{ $t("lobby.tabs.islands") }}</span>
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
import { useTextFitting } from '@/composables/useTextFitting'

export default {
  props: {
    activeTab: String,
  },
  mounted() {
    this.$nextTick(() => {
      this.fitAllLabels();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.fitAllLabels());
      }
    });
    window.addEventListener("resize", this.fitAllLabels, { passive: true });
  },
  methods: {
    fitAllLabels() {
      const { fitAllLabels } = useTextFitting()
      fitAllLabels(
        this.$el,
        '.lobby__scenes-container__tabs-tab.fixed-width',
        '.fit_label'
      )
    },
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.fitAllLabels);
  },
  watch: {
    // Si cambias de idioma en caliente, recalcula
    "$i18n.locale"() {
      this.$nextTick(this.fitAllLabels);
    },
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
  justify-content: center;
}

.lobby__scenes-container__tabs-tab.selected {
  background-color: #1c2c35ad;
}

.fixed-width {
  width: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
}

.fit_label {
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
}
</style>
