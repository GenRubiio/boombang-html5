<template>
  <div class="help-card-gacha">
    <div class="content">
      <button class="close-button" @click="$emit('close')">
        <i class="las la-times"></i>
      </button>
      <h2 class="main-title">Gacha de Decoraciones (100 plata por tirada)</h2>

      <div class="section">
        <h3>Objetos</h3>
        <div v-for="(group, rarity) in normalItems" :key="`normal-${rarity}`" class="rarity-group">
          <div class="rarity-header normal-items">
            <span>Rareza: <span class="star">{{ '★'.repeat(rarity) }}</span></span>
            <span>Aparición: {{ group.percentage }}%</span>
          </div>
          <div class="item-grid">
            <div v-for="item in group.items" :key="item.id" class="item-cell">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Decoraciones de personaje</h3>
        <div v-for="(group, rarity) in decorationItems" :key="`deco-${rarity}`" class="rarity-group">
          <div class="rarity-header">
            <span>Rareza: <span class="star">{{ '★'.repeat(rarity) }}</span></span>
            <span>Aparición: {{ group.percentage }}%</span>
            <span>Compensación: {{ group.compensation }}</span>
          </div>
          <div class="item-grid">
            <div v-for="item in group.items" :key="item.id" class="item-cell">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
          </div>
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
      normalItems: {
        1: { percentage: 45, compensation: "+5 plata", items: [] },
        2: { percentage: 22, compensation: "+15 plata", items: [] },
        3: { percentage: 10, compensation: "+40 plata", items: [] },
        4: { percentage: 4, compensation: "+120 plata", items: [] },
        5: { percentage: 1, compensation: "+300 plata", items: [] },
      },
      decorationItems: {
        2: { percentage: 8, compensation: "+1 oro", items: [] },
        3: { percentage: 6, compensation: "+2 oro", items: [] },
        4: { percentage: 3, compensation: "+5 oro", items: [] },
        5: { percentage: 1, compensation: "+10 oro", items: [] },
      },
    };
  },
  mounted() {
    //socket.on(ResponseSocketsEnum.GACHA_PRIZES, this.handleGachaPrizes);
    //socket.emit(RequestSocketsEnum.GET_GACHA_PRIZES);
  },
  beforeUnmount() {
    //socket.off(ResponseSocketsEnum.GACHA_PRIZES, this.handleGachaPrizes);
  },
  methods: {
    handleGachaPrizes(data) {
      data.forEach(item => {
        const targetGroup = item.type === 'normal' ? this.normalItems : this.decorationItems;
        if (targetGroup[item.rarity]) {
          targetGroup[item.rarity].items.push(item);
        }
      });
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
  background-color: #00000033;
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
  max-height: 500px;
  overflow-y: auto;
  scrollbar-gutter: stable;
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
}

.item-cell img {
  max-width: 100%;
  max-height: 100%;
}
</style>
