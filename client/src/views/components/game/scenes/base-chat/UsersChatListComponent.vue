<template>
  <div>
    <!-- DROPUP SELECT -->
    <div class="user-select-dropup" :class="{ open: isOpen }">
      <button
        class="select-trigger"
        type="button"
        @click="toggleOpen"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-haspopup="listbox"
      >
        {{ selectedLabel }}
        <span class="chevron">▲</span>
      </button>

      <ul
        v-show="isOpen"
        class="select-menu"
        role="listbox"
        :aria-activedescendant="'opt-' + selectedUser"
      >
        <!-- Opción Público -->
        <li
          id="opt-Publico"
          role="option"
          class="select-option"
          :aria-selected="selectedUser == null ? 'true' : 'false'"
          @click="selectValue(null)"
        >
          Público
        </li>

        <!-- Usuarios -->
        <li
          v-for="user in users"
          :key="user.uuid"
          :id="'opt-' + user.uuid"
          role="option"
          class="select-option"
          :aria-selected="selectedUser === user.uuid ? 'true' : 'false'"
          @click="selectValue(user.uuid)"
        >
          {{ user.username }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket.js";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum.js";

export default {
  props: {},
  data() {
    return {
      users: [],
      currentUser: null,
      selectedUser: null,
      isOpen: false,
    };
  },
  computed: {
    selectedLabel() {
      if (this.selectedUser == null) return "Público";
      const u = this.users.find((x) => x.uuid === this.selectedUser);
      return u ? u.username : "Público";
    },
  },
  watch: {
    selectedUser(newUser) {
      this.$emit("user-selected", newUser);
    },
  },
  methods: {
    toggleOpen() {
      this.isOpen = !this.isOpen;
    },
    selectValue(value) {
      this.selectedUser = value;
      this.isOpen = false;
    },
    setCurrentUser(user) {
      this.currentUser = user;
    },
    onClickOutside(e) {
      const root = this.$el.querySelector(".user-select-dropup");
      if (root && !root.contains(e.target)) {
        this.isOpen = false;
      }
    },
    ensureSelectedStillValid() {
      // Si el seleccionado no existe ya, volver a Público
      if (
        this.selectedUser != null &&
        !this.users.some((u) => u.uuid === this.selectedUser)
      ) {
        this.selectedUser = null;
        this.$emit("user-selected", null);
      }
    },
  },
  mounted() {
    window.addEventListener("click", this.onClickOutside, true);

    socket.off(ResponseSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST);
    socket.on(ResponseSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST, (data) => {
      this.users = data.players.filter((player) => player.uuid != socket.id);

      if (this.users.length > 0) {
        if (this.currentUser) {
          this.currentUser =
            this.users.find((user) => user.uuid == this.currentUser.uuid) ||
            null;
          if (!this.currentUser) {
            this.$emit("user-selected", null);
            this.selectedUser = null;
          }
        }
      }

      // Asegura que el seleccionado siga existiendo
      this.ensureSelectedStillValid();
    });

    socket.emit(RequestSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST);
  },
  beforeUnmount() {
    window.removeEventListener("click", this.onClickOutside, true);
  },
};
</script>

<style scoped>
/* Posición donde lo tenías, pero aplicado al contenedor del dropup */
.user-select-dropup {
  position: absolute;
  z-index: 1;
  left: 161px;
  bottom: 20px;
  width: 120px;
  font-family: Arial, sans-serif;
}

/* Botón que muestra el valor actual */
.select-trigger {
  width: 100%;
  text-align: left;
  padding: 2px 20px 2px 5px;
  background: linear-gradient(to bottom, #e4d094, #ceb06c);
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  outline: none !important;
  border: none !important;
  color: #a98d4e;
  font-weight: bold;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-trigger:focus {
  outline: none;
  border: none;
}
/*hover border none*/
.select-trigger:hover {
  border: none;
}

/* Triangulito/chevron (texto, no pseudo-elemento para simplicidad) */
.chevron {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  pointer-events: none;
}

/* Menú SIEMPRE hacia arriba */
.select-menu {
  position: absolute;
  bottom: 100%; /* 👈 clave: se abre hacia ARRIBA */
  left: 0;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-bottom: none; /* estética para “pegarse” al trigger */
  border-radius: 6px 6px 0 0;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  background: #e4d094;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 5px;
  box-sizing: border-box;
}

/* Opciones */
.select-option {
  padding: 1px 3px;
  cursor: pointer;
  white-space: nowrap;
  text-align: start;
  font-size: 16px;
  border-radius: 5px;
  margin-bottom: 3px;
  color: #a98d4e;
  background-color: #ceb06c;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease;
}

.select-option[aria-selected="true"] {
  font-weight: bold;
  background: #f5f5f5;
}

.select-option:hover {
  background: #eee;
}

/* Estado abierto (por si quieres estilos adicionales) */
.user-select-dropup.open .select-trigger {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
