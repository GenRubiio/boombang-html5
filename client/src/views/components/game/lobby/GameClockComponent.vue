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
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

export default {
  name: "GameClockComponent",
  data() {
    return {
      gameTime: this.getInitialGameTime(),
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
    // Configurar listener para respuesta del tiempo del juego
    socket.on(ResponseSocketsEnum.GAME_TIME, this.handleGameTimeResponse);
    
    // Solicitar tiempo inicial del servidor
    this.requestGameTime();

    // Actualizar la hora cada segundo calculando el tiempo transcurrido
    // 24 horas de juego = 1 hora real
    this.intervalId = setInterval(() => {
      if (this.initialGameTime && this.initialGameTime !== "--:--") {
        this.gameTime = this.calculateCurrentGameTime();
      }
    }, 1000);
  },
  methods: {
    getInitialGameTime() {
      // Intentar obtener el último tiempo conocido desde localStorage
      const savedState = localStorage.getItem('gameClockState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const timeDiff = Date.now() - state.savedAt;
          const fiveMinutesInMs = 5 * 60 * 1000;
          
          // Si los datos guardados son recientes (menos de 5 minutos), calcular tiempo actual basado en ellos
          if (timeDiff < fiveMinutesInMs && state.initialGameTime && state.initialGameTime !== "--:--") {
            const [hours, minutes] = state.initialGameTime.split(':').map(Number);
            const initialTotalMinutes = hours * 60 + minutes;
            const elapsedRealMinutes = (Date.now() - state.initialTimestamp) / 1000 / 60;
            const elapsedGameMinutes = elapsedRealMinutes * 24;
            const currentTotalMinutes = (initialTotalMinutes + elapsedGameMinutes) % (24 * 60);
            const currentHours = Math.floor(currentTotalMinutes / 60);
            const currentMinutes = Math.floor(currentTotalMinutes % 60);
            return `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Fallback al tiempo del socket o "--:--"
      return socket.user?.game_time || "--:--";
    },
    requestGameTime() {
      socket.emit(RequestSocketsEnum.GAME_TIME);
    },
    handleGameTimeResponse(response) {
      if (response.success && response.data) {
        this.initializeClock(response.data.game_time, response.data.timestamp);
      }
    },
    initializeClock(gameTime, serverTimestamp) {
      this.initialGameTime = gameTime || socket.user?.game_time || "--:--";
      this.initialTimestamp = serverTimestamp || Date.now();
      this.gameTime = this.initialGameTime;
      
      // Guardar estado en localStorage para evitar parpadeo al reiniciar el componente
      if (this.initialGameTime !== "--:--") {
        localStorage.setItem('gameClockState', JSON.stringify({
          initialGameTime: this.initialGameTime,
          initialTimestamp: this.initialTimestamp,
          savedAt: Date.now()
        }));
      }
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
      
      const currentTimeString = `${hoursStr}:${minutesStr}`;
      
      // Actualizar localStorage periódicamente (cada minuto) para mantener sincronización
      const savedState = localStorage.getItem('gameClockState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const timeDiff = Date.now() - state.savedAt;
          const oneMinuteInMs = 60 * 1000;
          
          if (timeDiff > oneMinuteInMs) {
            localStorage.setItem('gameClockState', JSON.stringify({
              initialGameTime: this.initialGameTime,
              initialTimestamp: this.initialTimestamp,
              savedAt: Date.now()
            }));
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      return currentTimeString;
    },
    // Método público para forzar resincronización cuando se regresa al lobby
    forceSync() {
      this.requestGameTime();
    },
  },
  beforeUnmount() {
    // Limpiar listeners
    socket.off(ResponseSocketsEnum.GAME_TIME, this.handleGameTimeResponse);
    
    // Limpiar intervalos
    if (this.intervalId) {
      clearInterval(this.intervalId);
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
