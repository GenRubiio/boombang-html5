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
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

export default {
  name: "GameClockComponent",
  data() {
    return {
      gameTime: "--:--",
      initialGameTime: null,
      initialTimestamp: null,
    };
  },
  computed: {
    formattedTime() {
      return this.gameTime;
    },
  },
  mounted() {
    // Asegurar que tenemos datos actuales del socket primero
    const socketTime = socket.user?.game_time;
    
    // Intentar recuperar el estado guardado del localStorage
    const savedState = localStorage.getItem('gameClockState');
    
    if (savedState && socketTime) {
      try {
        const state = JSON.parse(savedState);
        
        // Validar que los datos guardados no son muy antiguos (más de 10 minutos)
        const timeDiff = Date.now() - state.initialTimestamp;
        const tenMinutesInMs = 10 * 60 * 1000;
        
        if (timeDiff < tenMinutesInMs && state.initialGameTime !== "--:--") {
          this.initialGameTime = state.initialGameTime;
          this.initialTimestamp = state.initialTimestamp;
          this.gameTime = this.calculateCurrentGameTime();
        } else {
          // Los datos guardados son muy antiguos, usar datos del socket
          this.initializeClock();
        }
      } catch (e) {
        // Si hay error al parsear, inicializar normalmente
        this.initializeClock();
      }
    } else {
      this.initializeClock();
    }

    // Actualizar la hora cada segundo calculando el tiempo transcurrido
    // 24 horas de juego = 1 hora real
    this.intervalId = setInterval(() => {
      if (this.initialGameTime && this.initialGameTime !== "--:--") {
        this.gameTime = this.calculateCurrentGameTime();
      }
    }, 1000);

    // Sincronizar con el servidor cada 5 minutos
    this.syncIntervalId = setInterval(() => {
      socket.emit(RequestSocketsEnum.REFRESH_USER_CREDITS);
    }, 300000);
  },
  methods: {
    initializeClock() {
      this.initialGameTime = socket.user.game_time;
      this.initialTimestamp = Date.now();
      this.gameTime = this.initialGameTime;
      
      // Guardar el estado inicial en localStorage
      this.saveClockState();
    },
    saveClockState() {
      const state = {
        initialGameTime: this.initialGameTime,
        initialTimestamp: this.initialTimestamp,
      };
      localStorage.setItem('gameClockState', JSON.stringify(state));
    },
    calculateCurrentGameTime() {
      if (!this.initialGameTime || !this.initialTimestamp) return this.initialGameTime;

      // Parsear la hora inicial
      const [hours, minutes] = this.initialGameTime.split(':').map(Number);
      const initialTotalMinutes = hours * 60 + minutes;

      // Calcular tiempo transcurrido en milisegundos
      const elapsedRealMs = Date.now() - this.initialTimestamp;
      
      // Convertir a minutos reales
      const elapsedRealMinutes = elapsedRealMs / 1000 / 60;
      
      // Nueva conversión: 24 horas de juego = 1 hora real
      // 1440 minutos de juego = 60 minutos reales
      // Factor de conversión: 1440 / 60 = 24
      const elapsedGameMinutes = elapsedRealMinutes * 24;
      
      // Calcular la hora actual del juego
      const currentTotalMinutes = (initialTotalMinutes + elapsedGameMinutes) % (24 * 60);
      
      // Convertir a horas y minutos
      const currentHours = Math.floor(currentTotalMinutes / 60);
      const currentMinutes = Math.floor(currentTotalMinutes % 60);
      
      // Formatear con ceros a la izquierda
      const hoursStr = currentHours.toString().padStart(2, '0');
      const minutesStr = currentMinutes.toString().padStart(2, '0');
      
      return `${hoursStr}:${minutesStr}`;
    },
    // Método público para forzar resincronización cuando se regresa al lobby
    forceSync() {
      const socketTime = socket.user?.game_time;
      if (socketTime && socketTime !== "--:--") {
        this.initializeClock();
      }
    },
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
  top: 516px;
  left: 24px;
}

.clock-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3c87b3ad;
  border-radius: 10px;
  padding: 8px 14px;
  box-shadow: 0 3px 0px rgba(0, 0, 0, 0.3);
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
