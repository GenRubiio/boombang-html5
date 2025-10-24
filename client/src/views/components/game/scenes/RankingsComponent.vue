<template>
  <div
    class="rankings-overlay"
    @pointerdown.stop
    @mousedown.stop
    @touchstart.stop
  >
    <div class="rankings">
      <button class="close-button" @click="$emit('close-rankings')">
        <i class="las la-times"></i>
      </button>
      <div class="rankings__container">
        <div class="rankings__tabs">
          <div v-if="loadingMinigames" class="loading-tab">
            <div class="spinner"></div>
            <p>{{ $t("rankings.loading") }}</p>
          </div>
          <div
            v-else
            v-for="minigame in minigames"
            :key="minigame.id"
            class="rankings__tab"
            :class="{
              active: activeMinigame && activeMinigame.id === minigame.id,
            }"
            @click="selectMinigame(minigame)"
          >
            {{ minigame.name }}
          </div>
        </div>
        <div class="rankings__content">
          <div class="rankings__title">
            {{ activeMinigame ? activeMinigame.name : $t("rankings.title") }}
          </div>

          <!-- Selector de semana -->
          <div v-if="activeMinigame" class="week-selector-container">
            <select
              v-model="selectedWeek"
              @change="loadRanking"
              :disabled="loadingRanking"
              class="week-selector"
            >
              <option value="">{{ $t("rankings.select_week") }}</option>
              <option
                v-for="week in activeMinigame.weeks"
                :key="week.id"
                :value="week.id"
              >
                {{ week.week_identifier }} ({{ formatDate(week.start_date) }} -
                {{ formatDate(week.end_date) }})
              </option>
            </select>
          </div>

          <!-- Grid de ranking -->
          <div class="rankings__grid ranking-grid" v-if="selectedWeek">
            <div v-if="loadingRanking" class="loading-container">
              <div class="spinner"></div>
              <p>{{ $t("rankings.loading") }}</p>
            </div>

            <div v-else-if="rankingError" class="error-container">
              <p>{{ $t("rankings.error_loading") }}: {{ rankingError }}</p>
            </div>

            <div v-else-if="ranking.length === 0" class="no-data-container">
              <p>{{ $t("rankings.no_data") }}</p>
            </div>

            <div
              v-else
              v-for="player in ranking"
              :key="player.user_id"
              class="rankings__grid-item ranking-item"
              :class="{ selected: player.user_id === authUser.id }"
            >
              <div class="ranking-position">{{ player.position }}</div>
              <div class="ranking-username">{{ player.username }}</div>
              <div class="ranking-score">
                {{ player.score.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div
            class="pagination-container"
            v-if="pagination && pagination.last_page > 1"
          >
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page <= 1 || loadingRanking"
              class="pagination-btn"
            >
              ‹
            </button>

            <span class="pagination-info">
              {{ pagination.current_page }} / {{ pagination.last_page }}
            </span>

            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="
                pagination.current_page >= pagination.last_page ||
                loadingRanking
              "
              class="pagination-btn"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum.js";

export default {
  name: "RankingsComponent",
  props: {
    authUser: {
      type: Object,
      required: true,
    },
  },
  emits: ["close-rankings"],
  data() {
    return {
      minigames: [],
      activeMinigame: null,
      selectedWeek: "",
      ranking: [],
      pagination: null,
      currentPage: 1,

      loadingMinigames: false,
      loadingRanking: false,
      rankingError: null,
    };
  },
  mounted() {
    this.loadMinigames();
    this.setupSocketListeners();
  },
  beforeUnmount() {
    this.removeSocketListeners();
  },
  methods: {
    setupSocketListeners() {
      socket.on(ResponseSocketsEnum.MINIGAMES_LIST, this.handleMinigamesResponse);
      socket.on(ResponseSocketsEnum.MINIGAME_RANKING, this.handleRankingResponse);
    },

    removeSocketListeners() {
      socket.off(ResponseSocketsEnum.MINIGAMES_LIST, this.handleMinigamesResponse);
      socket.off(ResponseSocketsEnum.MINIGAME_RANKING, this.handleRankingResponse);
    },

    loadMinigames() {
      this.loadingMinigames = true;
      socket.emit(RequestSocketsEnum.GET_MINIGAMES);
    },

    handleMinigamesResponse(response) {
      this.loadingMinigames = false;
      if (response.success) {
        this.minigames = response.minigames;
        // Seleccionar automáticamente el primer minijuego
        if (this.minigames.length > 0) {
          this.selectMinigame(this.minigames[0]);
        }
      } else {
        console.error("Error loading minigames:", response.error);
      }
    },

    selectMinigame(minigame) {
      this.activeMinigame = minigame;
      this.selectedWeek = this.getCurrentWeek(minigame);
      this.ranking = [];
      this.pagination = null;
      this.currentPage = 1;
      this.rankingError = null;

      // Cargar automáticamente el ranking de la semana actual
      if (this.selectedWeek) {
        this.loadRanking();
      }
    },

    loadRanking() {
      if (!this.selectedWeek || !this.activeMinigame) return;

      this.loadingRanking = true;
      this.rankingError = null;

      socket.emit(RequestSocketsEnum.GET_MINIGAME_RANKING, {
        minigameId: this.activeMinigame.id,
        weekId: this.selectedWeek,
        page: this.currentPage,
        perPage: 20,
      });
    },

    handleRankingResponse(response) {
      this.loadingRanking = false;
      if (response.success) {
        this.ranking = response.ranking;
        this.pagination = response.pagination;
      } else {
        this.rankingError = response.error;
        this.ranking = [];
        this.pagination = null;
      }
    },

    changePage(page) {
      if (page < 1 || (this.pagination && page > this.pagination.last_page))
        return;
      this.currentPage = page;
      this.loadRanking();
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    getCurrentWeek(minigame) {
      if (!minigame || !minigame.weeks || minigame.weeks.length === 0) {
        return "";
      }

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalizar a medianoche

      // Buscar la semana que incluya la fecha actual
      for (const week of minigame.weeks) {
        const startDate = new Date(week.start_date);
        const endDate = new Date(week.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (currentDate >= startDate && currentDate <= endDate) {
          return week.id;
        }
      }

      // Si no hay semana actual, devolver la más reciente
      const sortedWeeks = [...minigame.weeks].sort((a, b) => {
        return new Date(b.start_date) - new Date(a.start_date);
      });

      return sortedWeeks.length > 0 ? sortedWeeks[0].id : "";
    },
  },
};
</script>

<style scoped>
.rankings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 39%);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.rankings {
  width: 860px;
  height: 620px;
  background-color: #ffffffd9;
  padding: 20px;
  border-radius: 5px;
  position: relative;
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

.rankings__container {
  display: flex;
  flex-grow: 1;
  min-height: 0;
  margin-top: 25px;
}

.rankings__tabs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-right: 10px;
}

.rankings__tab {
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  color: black;
}

.rankings__tab.active {
  background-color: #d96b35;
  color: white;
}

.rankings__content {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 700px;
  flex: 1;
}

.rankings__title {
  text-align: start;
  background-color: #ffffff;
  border-radius: 5px;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #d96b35;
  box-shadow: 0 3px #0000004d;
}

.week-selector-container {
  margin-top: 10px;
  margin-bottom: 10px;
}

.week-selector {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;
}

.rankings__grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 10px;
  flex: 1;
  margin-bottom: 10px;
}

.ranking-grid {
  grid-template-columns: 1fr;
  gap: 5px;
}

.rankings__grid-item {
  background-color: #e0e0e0;
  border-radius: 5px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  min-height: 50px;
}

.ranking-item {
  justify-content: space-between;
  cursor: default;
}

.ranking-item.selected {
  background-color: #d96b35;
  color: white;
}

.ranking-position {
  font-weight: bold;
  font-size: 18px;
  min-width: 40px;
  text-align: center;
}

.ranking-username {
  flex: 1;
  text-align: left;
  padding: 0 15px;
  font-weight: bold;
}

.ranking-score {
  font-weight: bold;
  color: #d96b35;
  font-size: 16px;
}

.ranking-item.selected .ranking-score {
  color: white;
}

.loading-container,
.error-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;
}

.loading-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #d96b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  flex-shrink: 0;
}

.pagination-btn {
  background-color: #d96b35;
  color: white;
  border: none;
  border-radius: 3px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #c55a2e;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  color: #333;
  font-weight: bold;
  font-size: 14px;
}
</style>
