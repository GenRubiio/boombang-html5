<template>
  <div class="game-clock">
    <div class="clock-container">
      <div class="clock-icon">🕐</div>
      <div class="time-display">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<script>
import socket from "@/sockets/socket";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

export default {
  name: "GameClockComponent",
  data() {
    return {
      gameTime: "--:--",
      serverStartTime: null,
      localStartTime: null,
    };
  },
  computed: {
    formattedTime() {
      return this.gameTime;
    },
  },
  mounted() {
    // Escuchar actualizaciones del servidor
    socket.off(ResponseSocketsEnum.REFRESH_USER_CREDITS);
    socket.on(ResponseSocketsEnum.REFRESH_USER_CREDITS, (data) => {
      if (data.game_time) {
        this.gameTime = data.game_time;
        // Guardar el momento en que recibimos esta hora
        this.localStartTime = Date.now();
      }
    });

    // Solicitar la hora actual del juego
    socket.emit(RequestSocketsEnum.REFRESH_USER_CREDITS);

    // Actualizar la hora cada segundo sumando 1 minuto del juego
    // 1 segundo real = 1 minuto del juego
    this.intervalId = setInterval(() => {
      if (this.gameTime && this.gameTime !== "--:--") {
        // Parsear la hora actual
        const [hours, minutes] = this.gameTime.split(":").map(Number);

        // Sumar 1 minuto
        let totalMinutes = hours * 60 + minutes + 1;

        // Si llegamos a 24:00, volver a 00:00
        if (totalMinutes >= 24 * 60) {
          totalMinutes = 0;
        }

        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;

        this.gameTime = `${String(newHours).padStart(2, "0")}:${String(
          newMinutes
        ).padStart(2, "0")}`;
      }
    }, 1000);

    // Sincronizar con el servidor cada 5 minutos
    this.syncIntervalId = setInterval(() => {
      socket.emit(RequestSocketsEnum.REFRESH_USER_CREDITS);
    }, 300000);
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
  },
};
</script>

<style scoped>
.game-clock {
  position: absolute;
  top: 14px;
  left: 17px;
  z-index: 10;
}

.clock-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3c87b3ad;
  border-radius: 20px;
  padding: 8px 14px;
  box-shadow: 0 3px 0px rgba(0, 0, 0, 0.3);
  bottom: 45px;
  left: -10px;
  position: absolute;
  width: 90px;
  height: 15px;
  border: 1px solid white;
}

.clock-icon {
  font-size: 24px;
  animation: rotate 4s linear infinite;
}

.time-display {
  color: #ffffff;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: "Arial", sans-serif;
  letter-spacing: 1px;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Hover effect */
.clock-container:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>
