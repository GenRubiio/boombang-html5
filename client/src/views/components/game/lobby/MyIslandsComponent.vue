<template>
  <div class="lobby__scenes-list">
    <div v-for="island in islands" :key="island.id">
      <button @click="$emit('join-island', island.id)">
        {{ island.name }}
        <span>{{ island.visitors }}</span>
      </button>
    </div>
    <div v-if="islands.length === 0" class="empty-message">
      Aún no has creado islas
    </div>
  </div>
</template>

<script>
export default {
  props: {
    islands: Array,
  },
};
</script>

<style scoped>
.lobby__scenes-list {
  border-radius: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 240px;
  overflow-y: scroll;
  border-radius: 0 !important;
}

.lobby__scenes-list {
  border-radius: 12px; /* bordes redondeados en el contenedor */
  padding-right: 8px; /* espacio entre contenido y scrollbar */
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 240px;
  overflow-y: scroll;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #3c87b3ad #2a3a46;
}

/* WebKit: ancho/alto */
.lobby__scenes-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* WebKit: track */
.lobby__scenes-list::-webkit-scrollbar-track {
  background: #2a3a46;
  border-radius: 12px; /* mismo radio que el contenedor */
  margin: 4px 0; /* separa ligeramente el track de los extremos */
}

/* WebKit: thumb */
.lobby__scenes-list::-webkit-scrollbar-thumb {
  background-color: #3c87b3ad;
  border-radius: 12px; /* bordes redondeados en el thumb */
  border: 2px solid #2a3a46; /* crea “acolchado” entre thumb y track */
}

/* WebKit: hover thumb */
.lobby__scenes-list::-webkit-scrollbar-thumb:hover {
  background-color: #559ac0;
}

.lobby__scenes-list button {
  background-color: #3a4b54c9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px;
  width: 100%;
  text-align: left;
  font-size: 15px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.lobby__scenes-list button:hover {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button span {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
}

.empty-message {
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}
</style>
