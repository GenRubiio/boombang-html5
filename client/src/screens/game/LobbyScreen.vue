<template>
  <LoadingScreen v-if="loading" />
  <div v-else id="lobby">
    <h1>Lobby</h1>
    <div v-for="area in areas" :key="area.id" class="room">
      <p>{{ area.name }} ({{ area.total_users_in }})</p>
      <button @click="joinRoom(area.id)">Join Room</button>
    </div>
  </div>
</template>

<script>
import socket from "../../sockets/socket";
import LoadingScreen from "./LoadingScreen.vue";

export default {
  data() {
    return {
      areas: [],
      loading: true,
    };
  },
  created() {
    // Solicitar las salas al conectarse
    socket.off("get_public_areas");
    socket.emit("get_public_areas");

    socket.off("update_public_areas");
    socket.on("update_public_areas", (areas) => {
      console.log(areas);
      this.areas = areas;
      this.loading = false;
    });
  },
  components: {
    LoadingScreen,
  },
  methods: {
    joinRoom(areaId) {
      socket.emit("request:join_public_area", { areaId: areaId });
      socket.on("response:join_public_area", (data) => {
        if (data.success) {
          this.$emit("joinArea", areaId);
        } else {
          console.log("Error al unirse a la sala.");
        }
      });
    },
  },
};
</script>

<style>
/* Estiliza las salas */
</style>
