<template>
  <div id="lobby">
    <UiElementsComponent />
    <div class="lobby__scenes">
      <div class="lobby__scenes-container">
        <LobbyTabs
          :active-tab="activeTab"
          @update:activeTab="activeTab = $event"
        />

        <AreasTab
          v-if="activeTab === 'areas'"
          :public-scenes="publicScenes"
          @join-scene="joinScene"
        />

        <GamesTab
          v-if="activeTab === 'games'"
          :game-scenes="gameScenes"
          @join-scene="joinScene"
        />

        <IslandsTab
          v-if="activeTab === 'islands'"
          :active-island-tab="activeIslandTab"
          :favorite-islands="favoriteIslands"
          :my-islands="myIslands"
          @update:activeIslandTab="activeIslandTab = $event"
          @join-island="joinIsland"
          @create-island="createIsland"
        />

        <SearchTab v-if="activeTab === 'search'" />
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../../sockets/socket";
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import UiElementsComponent from "../../components/game/lobby/UiElementsComponent.vue";
import LobbyTabs from "../../components/game/lobby/LobbyTabsComponent.vue";
import AreasTab from "../../components/game/lobby/AreasTabComponent.vue";
import GamesTab from "../../components/game/lobby/GamesTabComponent.vue";
import IslandsTab from "../../components/game/lobby/IslandsTabComponent.vue";
import SearchTab from "../../components/game/lobby/SearchTabComponent.vue";
import { useLobbyStore } from "../../../stores/LobbyStore";
import { mapActions, mapState } from "pinia";

export default {
  components: {
    UiElementsComponent,
    LobbyTabs,
    AreasTab,
    GamesTab,
    IslandsTab,
    SearchTab,
  },
  data() {
    return {
      activeIslandTab: "public",
      publicScenes: [],
      gameScenes: [],
      favoriteIslands: [],
      myIslands: [],
    };
  },
  computed: {
    activeTab: {
      get() {
        return useLobbyStore().activeTab;
      },
      set(newTab) {
        useLobbyStore().setActiveTab(newTab);
      },
    },
  },
  async created() {
    this.$emit("updateLoading", true);
    this.loadAreas();
    this.loadGames();
    this.loadFavoriteIslands();
    this.loadMyIslands();
  },
  methods: {
    ...mapActions(useLobbyStore, ["setActiveTab"]),
    loadAreas() {
      socket.emit(RequestSocketsEnum.GET_PUBLIC_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES, (publicScenes) => {
        this.publicScenes = publicScenes;
        this.$emit("updateLoading", false);
      });
    },
    loadGames() {
      socket.emit(RequestSocketsEnum.GET_GAME_SCENES);
      socket.off(ResponseSocketsEnum.UPDATE_GAME_SCENES);
      socket.on(ResponseSocketsEnum.UPDATE_GAME_SCENES, (gameScenes) => {
        this.gameScenes = gameScenes;
      });
    },
    loadFavoriteIslands() {
      // Lógica para cargar islas favoritas
    },
    loadMyIslands() {
      socket.emit(RequestSocketsEnum.GET_MY_ISLANDS);
      socket.off(ResponseSocketsEnum.GET_MY_ISLANDS);
      socket.on(ResponseSocketsEnum.GET_MY_ISLANDS, (data) => {
        this.myIslands = data.islands;
      });
    },
    createIsland() {
      this.$emit("createIsland");
    },
    joinScene(sceneUuid, menuType) {
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
      socket.emit(RequestSocketsEnum.JOIN_ISLAND, {
        islandId: islandId,
      });
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
  max-height: 350px;
}

.lobby__scenes {
  position: relative;
  z-index: 1;
  color: white;
  padding: 25px 10px;
  border-radius: 10px;
  width: 255px;
}
</style>
