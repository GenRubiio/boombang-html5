<template>
  <div
    v-if="showSuggestions && filteredUsers.length > 0"
    class="mention-autocomplete"
    :style="{ left: position.left + 'px', bottom: position.bottom + 'px' }"
  >
    <ul class="mention-list" role="listbox">
      <li
        v-for="(user, index) in filteredUsers"
        :key="user.uuid"
        :class="['mention-item', { active: index === selectedIndex }]"
        role="option"
        :aria-selected="index === selectedIndex"
        @click="selectUser(user)"
        @mouseenter="selectedIndex = index"
      >
        <span class="mention-username">@{{ user.username }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      required: true,
      default: () => [],
    },
    searchQuery: {
      type: String,
      default: "",
    },
    showSuggestions: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Object,
      default: () => ({ left: 0, bottom: 0 }),
    },
  },
  data() {
    return {
      selectedIndex: 0,
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users;
      }
      const query = this.searchQuery.toLowerCase();
      return this.users.filter((user) =>
        user.username.toLowerCase().startsWith(query)
      );
    },
  },
  watch: {
    filteredUsers() {
      this.selectedIndex = 0;
    },
    showSuggestions(newVal) {
      if (!newVal) {
        this.selectedIndex = 0;
      }
    },
  },
  methods: {
    selectUser(user) {
      this.$emit("select-user", user);
      this.selectedIndex = 0;
    },
    selectNext() {
      if (this.selectedIndex < this.filteredUsers.length - 1) {
        this.selectedIndex++;
      }
    },
    selectPrevious() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      }
    },
    selectCurrent() {
      if (this.filteredUsers.length > 0) {
        this.selectUser(this.filteredUsers[this.selectedIndex]);
      }
    },
  },
};
</script>

<style scoped>
.mention-autocomplete {
  position: absolute;
  z-index: 1000;
  background: #ffffff;
  border: 2px solid #d4a017;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  /* 
    Cada item tiene: padding 6px top + 6px bottom = 12px de contenido + aprox 13px de texto = ~25px por item
    3 items × 25px = 75px + padding del list (3px top + 3px bottom) = ~81px
    Redondeamos a 85px para 3 items exactos
  */
  max-height: 85px; /* Altura para mostrar exactamente 3 usuarios */
  overflow-y: auto;
  min-width: 160px;
  max-width: 220px;
}

.mention-list {
  list-style: none;
  margin: 0;
  padding: 3px;
}

.mention-item {
  padding: 6px 10px; /* Reducido de 8px 12px a 6px 10px */
  cursor: pointer;
  border-radius: 4px; /* Reducido de 6px a 4px */
  transition: background-color 0.2s ease;
  color: #5a4a2a;
  font-weight: 500;
  font-size: 13px; /* Agregado para reducir tamaño de texto */
}

.mention-item:hover,
.mention-item.active {
  background: linear-gradient(to bottom, #ffdf70, #d4a017);
  color: #ffffff;
}

.mention-username {
  font-size: 13px; /* Reducido de 14px a 13px */
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Scrollbar personalizado */
.mention-autocomplete::-webkit-scrollbar {
  width: 6px; /* Reducido de 8px a 6px */
}

.mention-autocomplete::-webkit-scrollbar-track {
  background: #f0e6d0;
  border-radius: 3px;
}

.mention-autocomplete::-webkit-scrollbar-thumb {
  background: #d4a017;
  border-radius: 3px;
}

.mention-autocomplete::-webkit-scrollbar-thumb:hover {
  background: #b8860b;
}
</style>
