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
import RequestSocketsEnum from "../../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";

export default {
  data() {
    return {
      areas: [],
      loading: true,
    };
  },
  created() {
    // Solicitar las salas al conectarse
    console.log("Solicitando salas...");
    socket.emit(RequestSocketsEnum.GET_PUBLIC_AREAS);
    socket.on(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, (areas) => {
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
      socket.emit(RequestSocketsEnum.JOIN_PUBLIC_AREA, { areaId: areaId });

      socket.off(ResponseSocketsEnum.JOIN_PUBLIC_AREA);
      socket.on(ResponseSocketsEnum.JOIN_PUBLIC_AREA, (data) => {
        if (data.success) {
          this.$emit("joinPublicArea", areaId);
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
