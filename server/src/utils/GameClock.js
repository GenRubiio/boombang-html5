/**
 * Reloj interno del juego
 * 24 horas del juego = 1 hora real
 * 1 hora del juego = 2.5 minutos reales
 * 1 minuto del juego = 2.5 segundos reales
 */
class GameClock {
    constructor() {
        // Tiempo de inicio del servidor (será establecido en start())
        this.serverStartTime = null;
        // Hora inicial del juego (12:00 en minutos desde medianoche)
        this.initialGameTime = 12 * 60; // 12:00 = 720 minutos
    }

    /**
     * Inicializa el reloj del juego
     * Debe ser llamado una sola vez al iniciar el servidor
     */
    start() {
        this.serverStartTime = Date.now();
        console.log('[GameClock] Reloj del juego iniciado a las 12:00');
    }

    /**
     * Obtiene la hora actual del juego en formato HH:mm
     * @returns {string} Hora en formato "HH:mm"
     */
    getCurrentGameTime() {
        // Si el reloj no ha sido iniciado, retornar la hora inicial
        if (!this.serverStartTime) {
            return '12:00';
        }

        // Tiempo transcurrido desde que inició el servidor (en milisegundos)
        const elapsedRealTime = Date.now() - this.serverStartTime;
        
        // Convertir a minutos reales transcurridos
        const elapsedRealMinutes = elapsedRealTime / 1000 / 60;
        
        // Nueva conversión: 24 horas de juego = 1 hora real
        // 1440 minutos de juego = 60 minutos reales
        // Factor de conversión: 1440 / 60 = 24
        const elapsedGameMinutes = elapsedRealMinutes * 24;
        
        // Sumar al tiempo inicial (12:00)
        const totalGameMinutes = (this.initialGameTime + elapsedGameMinutes) % (24 * 60);
        
        // Convertir a horas y minutos
        const hours = Math.floor(totalGameMinutes / 60);
        const minutes = Math.floor(totalGameMinutes % 60);
        
        // Formatear con ceros a la izquierda
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        
        return `${hoursStr}:${minutesStr}`;
    }

    /**
     * Obtiene la hora actual del juego como objeto
     * @returns {Object} {hours: number, minutes: number, formatted: string}
     */
    getCurrentGameTimeObject() {
        const timeStr = this.getCurrentGameTime();
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        return {
            hours,
            minutes,
            formatted: timeStr
        };
    }
}

// Exportar una instancia única (singleton)
module.exports = new GameClock();
