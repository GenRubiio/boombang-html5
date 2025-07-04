<template>
  <div id="lobby">
    <UiElementsComponent />
    <div class="lobby__scenes">
      <div class="lobby__scenes-container">
        <div class="lobby__scenes-container__tabs">
          <div
            class="lobby__scenes-container__tabs-tab fixed-width"
            :class="{ selected: activeTab === 'areas' }"
            @click="activeTab = 'areas'"
          >
            Areas
          </div>
          <div
            class="lobby__scenes-container__tabs-tab fixed-width"
            :class="{ selected: activeTab === 'games' }"
            @click="activeTab = 'games'"
          >
            Juegos
          </div>
          <div
            class="lobby__scenes-container__tabs-tab fixed-width"
            :class="{ selected: activeTab === 'islands' }"
            @click="activeTab = 'islands'"
          >
            Islas
          </div>
          <div
            class="lobby__scenes-container__tabs-tab"
            :class="{ selected: activeTab === 'search' }"
            @click="activeTab = 'search'"
          >
            <i class="las la-search"></i>
          </div>
        </div>

        <!-- Contenido de Areas -->
        <div v-if="activeTab === 'areas'" class="lobby__scenes-tab">
          <div class="lobby__scenes-list">
            <div v-for="publicScene in publicScenes" :key="publicScene.uuid">
              <button
                @click="joinScene(publicScene.uuid, MenuTypeEnum.PUBLIC_SCENE)"
              >
                {{ publicScene.name }}
                <span>{{ publicScene.total_users_in }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido de Juegos -->
        <div v-if="activeTab === 'games'" class="lobby__scenes-tab">
          <div class="lobby__scenes-list">
            <div v-for="gameScene in gameScenes" :key="gameScene.uuid">
              <button
                @click="joinScene(gameScene.uuid, MenuTypeEnum.GAME_SCENE)"
              >
                {{ gameScene.name }}
                <span>{{ gameScene.total_users_in }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido de Islas -->
        <div v-if="activeTab === 'islands'" class="lobby__scenes-tab">
          <div class="lobby__scenes-list">
            <div v-for="island in publicIslands" :key="island.id">
              <button @click="joinIsland(island.id)">
                {{ island.name }}
                <span>{{ island.visitors }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido de Búsqueda -->
        <div v-if="activeTab === 'search'" class="lobby__scenes-tab">
          <div class="lobby__scenes-list">
            <p>Función de búsqueda aún no implementada.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import MenuTypeEnum from "../../../enums/MenuTypeEnum";
import UiElementsComponent from "../../components/game/lobby/UiElementsComponent.vue";

export default {
  data() {
    return {
      activeTab: "areas", // Pestaña activa por defecto
      publicScenes: [],
      gameScenes: [], // Datos para juegos
      publicIslands: [], // Datos para islas
      MenuTypeEnum,
    };
  },
  async created() {
    this.$emit("updateLoading", true);

    // Cargar datos iniciales para todas las pestañas
    this.loadAreas();
    this.loadGames();
    this.loadIslands();
  },
  components: {
    UiElementsComponent,
  },
  methods: {
    // Cargar áreas públicas
    loadAreas() {
      socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES, (publicScenes) => {
        this.publicScenes = publicScenes;
        this.$emit("updateLoading", false);
      });
    },

    // Cargar juegos públicos (ejemplo)
    loadGames() {
      // Aquí iría tu lógica para cargar juegos
      // Ejemplo simulado:
      socket.emit(RequestSocketsEnum.GET_GAME_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_GAME_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_GAME_SCENES, (gameScenes) => {
        this.gameScenes = gameScenes;
      });
    },

    // Cargar islas públicas (ejemplo)
    loadIslands() {
      // Aquí iría tu lógica para cargar islas
      // Ejemplo simulado:
      // socket.emit(RequestSocketsEnum.GET_PUBLIC_ISLANDS);
      // socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_ISLANDS);
      // socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_ISLANDS, (islands) => {
      //   this.publicIslands = islands;
      // });
    },

    joinScene(sceneUuid, menuType) {
      // Tu lógica existente para unirse a escenas
      socket.emit(RequestSocketsEnum.JOIN_PUBLIC_SCENE, {
        sceneUuid: sceneUuid,
        menuType: menuType,
      });

      socket.off(ResponseSocketsEnum.JOIN_PUBLIC_SCENE);
      socket.on(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, (response) => {
        if (response.success) {
          let sceneryType = response.data.scenery.type;
          this.$emit("joinPublicScene", sceneryType, response.data);
        } else {
          console.log("Error al unirse a la sala.");
        }
      });
    },

    joinIsland(islandId) {
      console.log("Visitar isla:", islandId);
      // Tu lógica para unirse a islas
    },
  },
};
</script>

<style scoped>
#lobby {
  position: relative;
  background-color: #f0f0f0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.lobby__scenes-container {
  background-color: #3c87b3ad;
  border-radius: 10px;
  padding: 10px;
  text-align: start;
  height: 100vh;
  max-height: 340px;
}

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

.lobby__scenes {
  position: relative;
  z-index: 1;
  color: white;
  padding: 25px 10px;
  border-radius: 10px;
  width: 255px;
}

.lobby__scenes-list {
  border-radius: 10px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
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

.fixed-width {
  width: 100px;
  text-align: center;
}
</style>
