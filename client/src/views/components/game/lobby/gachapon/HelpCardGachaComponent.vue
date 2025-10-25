<template>
  <div class="help-card-gacha">
    <div class="content">
      <button class="close-button" @click="$emit('close')">
        <i class="las la-times"></i>
      </button>
      <h2 class="main-title">{{ $t("gacha.help.main_title") }}</h2>

      <div class="sections-container">
        <div class="section">
          <h3>{{ $t("gacha.help.items_title") }}</h3>
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
          </div>
          <template v-else>
            <div
              v-for="(group, rarity) in normalItems"
              :key="`normal-${rarity}`"
              class="rarity-group"
            >
              <div class="rarity-header normal-items">
                <span
                  >{{ $t("gacha.help.rarity") }}:
                  <span class="star">{{ "★".repeat(rarity) }}</span></span
                >
                <span
                  >{{ $t("gacha.help.appearance") }}:
                  {{ group.percentage }}%</span
                >
              </div>
              <div class="item-grid">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="item-cell"
                  :title="item.name"
                >
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="section">
          <h3>{{ $t("gacha.help.decorations_title") }}</h3>
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
          </div>
          <template v-else>
            <div
              v-for="(group, rarity) in decorationItems"
              :key="`deco-${rarity}`"
              class="rarity-group"
            >
              <div class="rarity-header">
                <span
                  >{{ $t("gacha.help.rarity") }}:
                  <span class="star">{{ "★".repeat(rarity) }}</span></span
                >
                <span
                  >{{ $t("gacha.help.appearance") }}:
                  {{ group.percentage }}%</span
                >
                <span
                  >{{ $t("gacha.help.compensation") }}:
                  {{ group.compensation }}</span
                >
              </div>
              <div class="item-grid">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="item-cell"
                  :title="item.name"
                >
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  emits: ["close"],
  data() {
    return {
      isLoading: true,
      normalItems: {},

      decorationItems: {},
    };
  },
  created() {
    this.initializeItems();
  },
  mounted() {
    socket.off(ResponseSocketsEnum.GET_GACHA_PRIZES);
    socket.on(ResponseSocketsEnum.GET_GACHA_PRIZES, this.handleGachaPrizes);
    socket.emit(RequestSocketsEnum.GET_GACHA_PRIZES);
  },
  methods: {
    initializeItems() {
      this.normalItems = {
        1: {
          percentage: 55,
          compensation: this.$t("gacha.help.comp_silver", { amount: 5 }),
          items: [],
        },
        2: {
          percentage: 25,
          compensation: this.$t("gacha.help.comp_silver", { amount: 15 }),
          items: [],
        },
        3: {
          percentage: 10,
          compensation: this.$t("gacha.help.comp_silver", { amount: 40 }),
          items: [],
        },
        4: {
          percentage: 7,
          compensation: this.$t("gacha.help.comp_silver", { amount: 120 }),
          items: [],
        },
        5: {
          percentage: 2,
          compensation: this.$t("gacha.help.comp_silver", { amount: 300 }),
          items: [],
        },
      };
      this.decorationItems = {
        5: {
          percentage: 1,
          compensation: this.$t("gacha.help.comp_gold", { amount: 10 }),
          items: [],
        },
      };
    },
    handleGachaPrizes(data) {
      if (data.success) {
        data.data.forEach((item) => {
          const targetGroup =
            item.type === "normal" ? this.normalItems : this.decorationItems;
          if (targetGroup[item.rarity]) {
            targetGroup[item.rarity].items.push(item);
          }
        });
      }
      this.isLoading = false;
    },
  },
};
</script>

<style scoped>
.help-card-gacha {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #00000075;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  position: relative;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffffd9;
  box-shadow: 3px 3px #0000004d;
  width: 800px;
  height: 500px;
}

.sections-container {
  overflow-y: auto;
  scrollbar-gutter: stable;
  height: 425px;
}

.rarity-header.normal-items {
  justify-content: space-between;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ffffff;
  border: none;
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

.main-title {
  text-align: center;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  margin-bottom: 15px;
  box-shadow: 0 3px #0000004d;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  background-color: #fd9a03;
  color: white;
  padding: 8px;
  border-radius: 5px;
  margin-bottom: 10px;
  text-shadow: 1px 1px #0000004d;
}

.rarity-group {
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
}

.rarity-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
  color: #333;
}

.star {
  color: gold;
  text-shadow: 1px 1px #0000004d;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
}

.item-cell {
  background-color: #ccc;
  border-radius: 5px;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #bbb;
  padding: 3px;
}

.item-cell img {
  max-width: 100%;
  max-height: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #fd9a03;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
