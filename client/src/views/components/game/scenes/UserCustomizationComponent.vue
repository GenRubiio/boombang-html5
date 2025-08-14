<template>
  <div class="user-customization">
    <button class="close-button" @click="$emit('close-customization')">
      <i class="las la-times"></i>
    </button>
    <div class="user-customization__container">
      <div class="user-customization__tabs">
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'ficha' }"
          @click="activeTab = 'ficha'"
        >
          Ficha
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'chat' }"
          @click="activeTab = 'chat'"
        >
          Chat
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'nombre' }"
          @click="activeTab = 'nombre'"
        >
          Nombre
        </div>
        <div
          class="user-customization__tab"
          :class="{ active: activeTab === 'sombra' }"
          @click="activeTab = 'sombra'"
        >
          Sombra
        </div>
      </div>
      <div class="user-customization__content">
        <div class="user-customization__title">
          PERSONALIZACIÓN DE {{ activeTab }}
        </div>
        <div class="user-customization__grid" :class="gridClass">
          <div
            class="user-customization__grid-item"
            v-for="n in 20"
            :key="n"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserCustomizationComponent",
  emits: ["close-customization"],
  data() {
    return {
      activeTab: "ficha",
    };
  },
  computed: {
    gridClass() {
      if (this.activeTab === "ficha") {
        return "ficha-grid";
      }
      if (this.activeTab === "chat") {
        return "chat-grid";
      }
      return "nombre-sombra-grid";
    },
  },
};
</script>

<style scoped>
.user-customization {
  width: 761px;
  height: 505px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: absolute;
  right: 210px;
  top: 0px;
  z-index: 101;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: 3px 3px #0000004d;
}

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

.user-customization__container {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  margin-top: 25px;
}

.user-customization__tabs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-right: 10px;
}

.user-customization__tab {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}

.user-customization__tab.active {
  background-color: #d96b35;
  color: white;
}

.user-customization__content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.user-customization__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  box-shadow: 0 3px #0000004d;
}

.user-customization__grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.chat-grid {
  grid-template-columns: repeat(2, 1fr);
}

.ficha-grid {
  grid-template-columns: repeat(4, 1fr);
}

.nombre-sombra-grid {
  grid-template-columns: repeat(5, 1fr);
}

.user-customization__grid-item {
  background-color: #e0e0e0;
  border-radius: 5px;
}

.chat-grid .user-customization__grid-item {
  height: 45px;
  border: 1px solid;
}

.ficha-grid .user-customization__grid-item {
  height: 190px;
  border: 1px solid;
}
</style>
