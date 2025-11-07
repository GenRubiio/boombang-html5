<template>
  <div
    id="html-inventory-public"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <button class="close-button" @click="$emit('close-inventory')">
      ×
    </button>

    <div class="inventory__header">
      <span class="inventory__title">{{ $t('scene.inventory') }}</span>
    </div>

    <div v-if="loading" class="inventory__loading">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <div class="inventory__navigation">
        <button
          class="inventory__nav-btn"
          @click="previousPage"
          :disabled="currentPage === 0"
        >
          &lt;
        </button>
        <span class="inventory__page-info">
          {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button
          class="inventory__nav-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages - 1"
        >
          &gt;
        </button>
      </div>

      <div class="inventory__grid">
        <div
          v-for="(item, index) in currentPageItems"
          :key="index"
          class="inventory__slot"
          :class="{ 'has-item': item }"
        >
          <img
            v-if="item"
            :src="getItemImage(item)"
            :style="getItemStyle(item)"
            class="inventory__item-image"
            alt=""
          />
          <span
            v-if="item && item.count > 1"
            class="inventory__item-count"
          >
            {{ item.count }}
          </span>
        </div>
      </div>

      <div class="inventory__footer">
        <span class="inventory__total">
          {{ $t('scene.total_items') }}: {{ inventoryItems.length }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import socket from '@/sockets/socket';
import RequestSocketsEnum from '@/enums/RequestSocketsEnum';
import ResponseSocketsEnum from '@/enums/ResponseSocketsEnum';

const emit = defineEmits(['close-inventory']);

const inventoryItems = ref([]);
const currentPage = ref(0);
const loading = ref(true);
const itemsPerPage = 9; // 3x3 grid

const groupedItems = computed(() => {
  const map = {};
  inventoryItems.value.forEach(item => {
    if (!map[item.sprite_name]) {
      map[item.sprite_name] = { ...item, count: 0 };
    }
    map[item.sprite_name].count++;
  });
  return Object.values(map);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(groupedItems.value.length / itemsPerPage));
});

const currentPageItems = computed(() => {
  const start = currentPage.value * itemsPerPage;
  const end = start + itemsPerPage;
  const items = groupedItems.value.slice(start, end);

  // Rellenar con null hasta tener 9 slots
  while (items.length < itemsPerPage) {
    items.push(null);
  }

  return items;
});

const getItemImage = (item) => {
  if (!item) return '';
  return import.meta.env.VITE_APP_ENV === 'local' ? item.image : item.image_url;
};

const getItemStyle = (item) => {
  if (!item) return {};

  const style = {
    objectFit: 'contain'
  };

  if (item.width != null || item.height != null) {
    // Si el item tiene dimensiones personalizadas, las aplicamos
    const maxSize = 50; // Tamaño máximo en el slot

    if (item.width && item.height) {
      const scale = Math.min(maxSize / item.width, maxSize / item.height, 1);
      style.width = `${item.width * scale}px`;
      style.height = `${item.height * scale}px`;
    }
  }

  return style;
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
};

const loadInventory = () => {
  socket.emit(RequestSocketsEnum.GET_PUBLIC_INVENTORY);
};

onMounted(() => {
  loadInventory();

  socket.on(ResponseSocketsEnum.PUBLIC_INVENTORY_DATA, (data) => {
    loading.value = false;
    if (data.inventory) {
      inventoryItems.value = data.inventory;
    }
  });
});
</script>

<style scoped lang="scss">
#html-inventory-public {
  position: absolute;
  right: 10px;
  bottom: 72px;
  width: 200px;
  height: 295px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #cccccc;
  border-radius: 8px;
  z-index: 10000;
  font-family: Arial, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  box-sizing: border-box;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;

  &:hover {
    color: #333;
  }
}

.inventory__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #ddd;
}

.inventory__title {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.inventory__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff8c00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.inventory__navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  height: 30px;
  box-sizing: border-box;
}

.inventory__nav-btn {
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  padding: 2px 8px;
  font-size: 18px;

  &:hover:not(:disabled) {
    background: #e0e0e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.inventory__page-info {
  font-size: 14px;
  color: #333;
}

.inventory__grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  grid-template-rows: repeat(3, 60px);
  gap: 5px;
  padding: 5px;
  justify-content: center;
}

.inventory__slot {
  width: 60px;
  height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.has-item {
    background: #fff;
  }
}

.inventory__item-image {
  max-width: 50px;
  max-height: 50px;
  object-fit: contain;
}

.inventory__item-count {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}

.inventory__footer {
  text-align: center;
  padding: 5px;
  font-size: 12px;
  color: #666;
  border-top: 1px solid #ddd;
}

.inventory__total {
  font-weight: 500;
}
</style>
