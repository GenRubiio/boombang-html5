/**
 * Utilidad para calcular el oscurecimiento basado en la hora del juego
 */
class DarkeningUtils {
    /**
     * Calcula la hora actual del juego basándose en el tiempo inicial y el tiempo transcurrido
     * @param {string} initialGameTime - Hora inicial en formato "HH:mm"
     * @param {number} initialTimestamp - Timestamp cuando se recibió la hora inicial
     * @returns {string} Hora actual calculada en formato "HH:mm"
     */
    static calculateCurrentGameTime(initialGameTime, initialTimestamp) {
        if (!initialGameTime || !initialTimestamp) return initialGameTime;

        // Parsear la hora inicial
        const [hours, minutes] = initialGameTime.split(':').map(Number);
        const initialTotalMinutes = hours * 60 + minutes;

        // Calcular tiempo transcurrido en milisegundos
        const elapsedRealMs = Date.now() - initialTimestamp;
        
        // Convertir a minutos reales
        const elapsedRealMinutes = elapsedRealMs / 1000 / 60;
        
        // En el juego: 1 hora = 1 minuto real
        // Entonces los minutos reales = horas del juego
        const elapsedGameHours = elapsedRealMinutes;
        
        // Convertir horas del juego a minutos del juego
        const elapsedGameMinutes = elapsedGameHours * 60;
        
        // Calcular la hora actual del juego
        const currentTotalMinutes = (initialTotalMinutes + elapsedGameMinutes) % (24 * 60);
        
        // Convertir a horas y minutos
        const currentHours = Math.floor(currentTotalMinutes / 60);
        const currentMinutes = Math.floor(currentTotalMinutes % 60);
        
        // Formatear con ceros a la izquierda
        const hoursStr = currentHours.toString().padStart(2, '0');
        const minutesStr = currentMinutes.toString().padStart(2, '0');
        
        return `${hoursStr}:${minutesStr}`;
    }

    /**
     * Calcula el nivel de oscurecimiento (tint) basado en la hora del juego
     * @param {string} gameTime - Hora en formato "HH:mm" (ej: "14:30")
     * @returns {number} Valor hexadecimal de tint (0x000000 = oscuro total, 0xFFFFFF = sin oscurecer)
     */
    static calculateDarkeningTint(gameTime) {
        if (!gameTime) return 0xFFFFFF; // Sin oscurecer si no hay hora

        // Parsear la hora
        const [hours, minutes] = gameTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        // Definir rangos de oscurecimiento
        // 00:00 - 06:00: Noche (muy oscuro - punto máximo a las 00:00)
        // 06:00 - 08:00: Amanecer (oscuridad disminuyendo)
        // 08:00 - 18:00: Día (sin oscurecer)
        // 18:00 - 00:00: Atardecer/Noche (oscuridad aumentando gradualmente hasta las 00:00)

        let brightness;

        if (totalMinutes >= 0 && totalMinutes < 360) {
            // 00:00 - 06:00: Noche (brightness de 0.3 a 0.3)
            brightness = 0.3;
        } else if (totalMinutes >= 360 && totalMinutes < 480) {
            // 06:00 - 08:00: Amanecer (brightness de 0.3 a 1.0)
            const progress = (totalMinutes - 360) / 120; // 0 a 1
            brightness = 0.3 + (0.7 * progress);
        } else if (totalMinutes >= 480 && totalMinutes < 1080) {
            // 08:00 - 18:00: Día (sin oscurecer)
            brightness = 1.0;
        } else {
            // 18:00 - 00:00: Atardecer/Noche (brightness de 1.0 a 0.3 gradualmente)
            // 360 minutos de transición (6 horas: de 18:00 a 00:00)
            const progress = (totalMinutes - 1080) / 360; // 0 a 1
            brightness = 1.0 - (0.7 * progress);
        }

        // Convertir brightness (0.0 - 1.0) a valor de tint hexadecimal
        const value = Math.floor(brightness * 255);
        return (value << 16) | (value << 8) | value;
    }

    /**
     * Aplica oscurecimiento a un sprite según la hora del juego
     * @param {Phaser.GameObjects.Sprite|Phaser.GameObjects.Image} sprite - El sprite a oscurecer
     * @param {string} gameTime - Hora en formato "HH:mm"
     */
    static applyDarkening(sprite, gameTime) {
        if (!sprite || sprite.destroyed) return;
        const tint = this.calculateDarkeningTint(gameTime);
        sprite.setTint(tint);
    }

    /**
     * Verifica si un item debe mostrarse según show_from y show_to
     * @param {string} gameTime - Hora actual del juego en formato "HH:mm"
     * @param {string} showFrom - Hora desde la cual mostrar (opcional)
     * @param {string} showTo - Hora hasta la cual mostrar (opcional)
     * @returns {boolean} true si debe mostrarse, false si debe ocultarse
     */
    static shouldShowItem(gameTime, showFrom, showTo) {
        // Si no hay restricciones, siempre mostrar
        if ((!showFrom || showFrom === '') && (!showTo || showTo === '')) {
            return true;
        }

        // Si showTo es null o vacío, siempre mostrar
        if (!showTo || showTo === '') {
            return true;
        }

        // Parsear las horas a minutos desde medianoche
        const [currentHours, currentMinutes] = gameTime.split(':').map(Number);
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        const [toHours, toMinutes] = showTo.split(':').map(Number);
        const toTotalMinutes = toHours * 60 + toMinutes;

        // Si hay showFrom, verificar también
        if (showFrom && showFrom !== '') {
            const [fromHours, fromMinutes] = showFrom.split(':').map(Number);
            const fromTotalMinutes = fromHours * 60 + fromMinutes;

            // Caso normal: from < to
            if (fromTotalMinutes < toTotalMinutes) {
                return currentTotalMinutes >= fromTotalMinutes && currentTotalMinutes <= toTotalMinutes;
            } 
            // Caso que cruza medianoche: from > to (ej: 22:00 a 06:00)
            else {
                return currentTotalMinutes >= fromTotalMinutes || currentTotalMinutes <= toTotalMinutes;
            }
        }

        // Solo hay showTo: mostrar si el tiempo actual es <= showTo
        return currentTotalMinutes <= toTotalMinutes;
    }
}

export default DarkeningUtils;
