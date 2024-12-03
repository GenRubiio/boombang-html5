const publicAreasCollection = require('../collections/publicAreasCollection');
const ConsoleLogger = require('../utils/consoleLogger');
const logger = new ConsoleLogger();

class UserModel {
    constructor(id, username, email) {
        this.id = id.toString();
        this.username = username;
        this.email = email;
        this.socket = null; // Socket del usuario
        this.currentArea = null; // Área actual del usuario
        this.currentAreaPosition = { x: null, y: null }; // Posición actual del usuario en el área

        this.finalTarget = null; // Destino final del usuario
        this.isProcessingMovement = false; // Bandera para evitar conflictos

        // Iniciar el procesador de movimiento
        this.startMovementProcessor();
    }

    // Método para añadir socket al usuario
    addSocket(socket) {
        this.socket = socket;
    }

    setArea(area) {
        this.currentArea = area;
        this.currentAreaPosition = area ? area.startPosition : { x: null, y: null };
        this.finalTarget = null;
        this.isProcessingMovement = false;
    }

    // Cancelar cualquier movimiento anterior
    cancelMovement() {
        this.finalTarget = null;
        this.isProcessingMovement = false;
    }

    // Establecer el destino final
    setFinalTarget(target) {
        this.finalTarget = target;
    }

    // Procesador de movimientos (siempre activo)
    startMovementProcessor() {
        const processMovement = async () => {
            if (this.finalTarget && !this.isProcessingMovement) {
                this.isProcessingMovement = true; // Evitar procesos simultáneos
                await this.processNextMovement();
                this.isProcessingMovement = false; // Liberar para el siguiente ciclo
            }
            setTimeout(processMovement, 750); // Continuar el ciclo
        };

        processMovement(); // Iniciar el bucle de procesamiento
    }

    // Lógica para procesar el siguiente movimiento
    async processNextMovement() {
        try {
            const publicArea = publicAreasCollection.getByUid(this.currentArea.id);
            if (!publicArea) {
                throw new Error('Public area not found');
            }

            if (!this.finalTarget) return; // No hay destino final establecido

            const startPos = this.currentAreaPosition;
            const target = this.finalTarget;

            // Verificar si ya está en el destino
            if (startPos.x === target.x && startPos.y === target.y) {
                this.finalTarget = null; // Llegó al destino
                return;
            }

            // Calcular el camino al destino
            const navigationMap = publicArea.getNavigationMapWithPlayers(this.socket.id);
            const path = await publicArea.findPath(startPos, target, navigationMap);

            if (!path || path.length <= 1) {
                console.log('No se encontró un camino al destino');
                this.socket.emit('movementDenied', { reason: 'No se encontró un camino al destino' });
                this.finalTarget = null; // No se puede llegar al destino
                return;
            }

            // Mover al siguiente paso en el camino
            const nextStep = path[1];
            // Calcular la dirección
            const deltaX = nextStep.x - this.currentAreaPosition.x;
            const deltaY = nextStep.y - this.currentAreaPosition.y;
            const direction = this.getDirection(deltaX, deltaY);

            // Actualizar la posición actual
            this.currentAreaPosition = { x: nextStep.x, y: nextStep.y, z: direction };


            // Notificar movimiento al cliente
            const movementData = {
                id: this.socket.id,
                path: [{ x: nextStep.x, y: nextStep.y }]
            };

            publicArea.emit('response:user_move', movementData);

            // Continuar moviéndose hacia el destino en el siguiente ciclo
        } catch (err) {
            console.log(err);
            logger.log(`Error processing user movement: ${err.message}`, 'error');
            this.socket.emit('error_critical');
        }
    }

    getDirection(deltaX, deltaY) {
        if (deltaX === 0 && deltaY === 1) return 1; // Abajo
        if (deltaX === 1 && deltaY === 1) return 2;  // Abajo derecha
        if (deltaX === 1 && deltaY === 0) return 3;  // Derecha
        if (deltaX === 1 && deltaY === -1) return 4; // Arriba derecha
        if (deltaX === 0 && deltaY === -1) return 5;  // Arriba
        if (deltaX === -1 && deltaY === -1) return 6; // Arriba izquierda
        if (deltaX === -1 && deltaY === 0) return 7;  // Izquierda
        if (deltaX === -1 && deltaY === 1) return 8;  // Abajo izquierda
        return 0; // Si no hay movimiento
    }
}

module.exports = UserModel;
