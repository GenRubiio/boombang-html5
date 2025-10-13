/**
 * Utilidad para calcular el oscurecimiento basado en la hora del juego
 */
class DarkeningUtils {
    static _overlay = null;
    static _lastBrightness = 1;

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
    }

    /**
     * Calcula el nivel de brightness basado en la hora del juego
     * @param {string} gameTime - Hora en formato "HH:mm" (ej: "14:30")
     * @returns {number} Valor de brightness (0.0 - 1.0)
     */
    static calculateBrightness(gameTime) {
        if (!gameTime) return 1.0;

        // Parsear la hora
        const [hours, minutes] = gameTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        let brightness;

        if (totalMinutes >= 0 && totalMinutes < 300) {
            // 00:00 - 05:00: Noche
            brightness = 0.30;
        } else if (totalMinutes >= 300 && totalMinutes < 540) {
            // 05:00 - 09:00: Amanecer
            const progress = (totalMinutes - 300) / 240;
            brightness = 0.30 + 0.70 * progress;
        } else if (totalMinutes >= 540 && totalMinutes < 1080) {
            // 09:00 - 18:00: Día
            brightness = 1.0;
        } else {
            // 18:00 - 00:00: Atardecer/Noche
            const progress = (totalMinutes - 1080) / 360;
            brightness = 1.0 - 0.70 * progress;
        }

        return Math.max(0.0, Math.min(1.0, brightness));
    }

    /**
     * Crea/reutiliza un overlay pantalla en modo MULTIPLY
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @returns {Phaser.GameObjects.Graphics} El overlay
     */
    static ensureOverlay(scene) {
        if (this._overlay && !this._overlay.destroyed) return this._overlay;

        const g = scene.add.graphics();
        g.setScrollFactor(0);
        g.setDepth(999999);
        g.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this._overlay = g;

        // Redibujar en resize
        scene.scale.on('resize', () => {
            if (this._overlay && !this._overlay.destroyed) {
                this.redrawOverlay(scene, this._lastBrightness);
            }
        });

        // Limpiar al cerrar escena
        scene.sys.events.once('shutdown', () => {
            if (this._overlay && !this._overlay.destroyed) {
                this._overlay.destroy();
            }
            this._overlay = null;
        });

        return g;
    }

    /**
     * Redibuja el overlay con el nivel de brightness especificado
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {number} brightness - Nivel de brightness (0.0 - 1.0)
     */
    static redrawOverlay(scene, brightness) {
        if (!this._overlay) return;
        const w = scene.scale.width;
        const h = scene.scale.height;

        // En MULTIPLY, un gris (v,v,v) multiplica el color de fondo.
        // Si brightness=1 → blanco (no cambia). Si 0.3 → gris oscuro.
        const v = Math.floor(255 * brightness);
        this._overlay.clear();
        this._overlay.fillStyle((v << 16) | (v << 8) | v, 1);
        this._overlay.fillRect(0, 0, w, h);
    }

    /**
     * Aplica oscurecimiento global a la escena SIN tocar sprites individuales.
     * Llamar 1 vez por frame/cambio de hora de juego.
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {string} gameTime - Hora en formato "HH:mm"
     */
    static applySceneDarkening(scene, gameTime) {
        const brightness = this.calculateBrightness(gameTime);
        this._lastBrightness = brightness;
        this.ensureOverlay(scene);
        this.redrawOverlay(scene, brightness);
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
