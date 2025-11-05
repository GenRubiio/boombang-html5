<template>
  <div class="lobby__scenes-tab">
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('lobby.search.placeholder')"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button
        @click="handleSearch"
        class="search-button"
        :disabled="isSearching"
      >
        <i class="las la-search"></i>
      </button>
    </div>
    <div class="lobby__scenes-list">
      <div v-if="!hasSearched">
        <p>{{ $t("lobby.search.enter_search") }}</p>
      </div>
      <div v-else-if="isSearching">
        <p>{{ $t("lobby.search.searching") }}</p>
      </div>
      <div v-else-if="searchResults.length === 0">
        <p>{{ $t("lobby.search.no_results") }}</p>
      </div>
      <div v-else v-for="island in searchResults" :key="island.id">
        <button @click="handleClick(island.id)" :disabled="isJoining">
          <span class="scene-name">{{ island.name }}</span>
          <span class="user-count">{{ island.visitors }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  data() {
    return {
      searchQuery: "",
      searchResults: [],
      isSearching: false,
      isJoining: false,
      hasSearched: false,
    };
  },
  created() {
    socket.on(ResponseSocketsEnum.SEARCH_ISLANDS, this.handleSearchResults);
  },
  beforeUnmount() {
    socket.off(ResponseSocketsEnum.SEARCH_ISLANDS, this.handleSearchResults);
  },
  methods: {
    handleSearch() {
      if (!this.searchQuery.trim()) return;

      this.isSearching = true;
      this.hasSearched = true;

      socket.emit(RequestSocketsEnum.SEARCH_ISLANDS, {
        query: this.searchQuery.trim(),
      });
    },
    handleSearchResults(data) {
      this.searchResults = data.islands || [];
      this.isSearching = false;
    },
    handleClick(islandId) {
      if (this.isJoining) return;
      this.isJoining = true;
      this.$emit("join-island", islandId);
    },
  },
};
</script>

<style scoped>
.search-container {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.search-input {
  flex: 1;
  background: #2a3a42;
  border: 2px solid #5ca8d1;
  border-radius: 5px;
  color: white;
  font-size: 14px;
  padding: 8px 10px;
  outline: none;
  height: 35px;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #69c7ef;
  box-shadow: 0 0 5px rgba(105, 199, 239, 0.3);
}

.search-input::placeholder {
  color: #aaa;
}

.search-button {
  background-color: #3a4b54c9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 18px;
}

.search-button:hover:not(:disabled) {
  background-color: #1c2c35ad;
}

.search-button:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
}

.lobby__scenes-list {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 275px;
  overflow: hidden;
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
  gap: 5px;
}

.lobby__scenes-list button:hover:not(:disabled) {
  background-color: #1c2c35ad;
  cursor: pointer;
}

.lobby__scenes-list button:disabled {
  background-color: #2a3a46;
  cursor: not-allowed;
  opacity: 0.6;
}

.scene-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.user-count {
  margin-left: auto;
  background-color: #3c87b3ad;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 12px;
  flex-shrink: 0;
}

p {
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 14px;
}
</style>
