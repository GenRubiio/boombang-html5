const EasyStar = require('easystarjs').js;
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../utils/UserMovimentUtil');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');

class AreaModel {
    constructor(id, name, map_width, map_height, game_map, startPosition) {
        this.id = id;
        this.name = name;
        this.users = []; // Lista vacía de usuarios
        this.map_width = map_width;
        this.map_height = map_height;
        this.game_map = game_map;
        this.startPosition = startPosition; // Posición de inicio del área {x, y, z}

        // Iniciar el procesador de movimiento
        this.startMovementProcessor();
    }

    // Método para añadir un usuario
    addUser(user) {
        if (this.users.includes(user)) {
            logger.log('User already in area', 'error');
            return;
        }
        this.users.push(user);
    }

    // Método para devolver la lista de usuarios
    getUsers() {
        return this.users;
    }

    // Método para comprobar si un usuario está en el área
    containsUser(user) {
        return this.users.includes(user);
    }

    // Método para eliminar un usuario
    removeUser(user) {
        this.users = this.users.filter(u => u !== user);
    }

    // Método para emitir un evento a todos los usuarios del área
    emit(event, data) {
        this.users.forEach(user => {
            user.socket.emit(event, data);
        });
    }

    // Método para emitir un evento a todos los usuarios del área excepto uno
    emitToAllExcept(event, data, excludedUser) {
        this.users.forEach(user => {
            if (user !== excludedUser) {
                user.socket.emit(event, data);
            }
        });
    }

    // Iniciar el procesador de movimiento
    startMovementProcessor() {
        const processMovement = async () => {
            // Procesar movimiento para cada usuario
            for (let user of this.users) {
                if (user.finalTarget) {
                    await this.processNextMovement(user);
                }
            }
            setTimeout(processMovement, AnimationBlockTimerEnum.WALK); // Continuar el ciclo
        };

        processMovement(); // Iniciar el bucle de procesamiento
    }

    // Lógica para procesar el siguiente movimiento de un usuario
    async processNextMovement(user) {
        try {
            if (!user.finalTarget) return; // No hay destino final establecido

            const startPos = user.currentAreaPosition;
            const target = user.finalTarget;

            // Verificar si ya está en el destino
            if (startPos.x === target.x && startPos.y === target.y) {
                user.finalTarget = null; // Llegó al destino
                return;
            }

            // Calcular el camino al destino
            const navigationMap = this.getNavigationMapWithPlayers(user.id);
            const path = await this.findPath(startPos, target, navigationMap);

            if (!path || path.length <= 1) {
                console.log('No se encontró un camino al destino');
                this.emit('response:user_move_denied', {
                    id: user.socket.id,
                });
                user.finalTarget = null; // No se puede llegar al destino
                return;
            }

            // Mover al siguiente paso en el camino
            const nextStep = path[1];
            // Calcular la dirección
            const deltaX = nextStep.x - user.currentAreaPosition.x;
            const deltaY = nextStep.y - user.currentAreaPosition.y;
            const direction = UserMovimentUtil.getDirection(deltaX, deltaY);

            // Actualizar la posición actual
            user.currentAreaPosition = { x: nextStep.x, y: nextStep.y, z: direction };

            // Notificar movimiento al cliente
            const movementData = {
                id: user.socket.id,
                path: [{
                    x: nextStep.x,
                    y: nextStep.y,
                    z: direction
                }],
                isLastStep: path.length === 2
            };

            this.emit('response:user_move', movementData);

            // Continuar moviéndose hacia el destino en el siguiente ciclo
        } catch (err) {
            console.log(err);
            logger.log(`Error processing user movement: ${err.message}`, 'error');
            user.socket.emit('error_critical');
        }
    }

    // Implementación del algoritmo A*
    findPath(startPos, endPos, customMap) {
        const easystar = new EasyStar();

        // Usar el mapa personalizado si se proporciona
        const mapToUse = customMap || this.game_map;

        easystar.setGrid(mapToUse);
        easystar.setAcceptableTiles([0]); // 0 es caminable
        easystar.enableDiagonals();
        easystar.enableCornerCutting();

        return new Promise((resolve, reject) => {
            easystar.findPath(startPos.x, startPos.y, endPos.x, endPos.y, function (path) {
                if (path === null) {
                    resolve(null);
                } else {
                    resolve(path);
                }
            });
            easystar.calculate();
        });
    }

    getNavigationMapWithPlayers(excludeUserId) {
        // Clonar el mapa original
        let navigationMap = JSON.parse(JSON.stringify(this.game_map));

        // Marcar las posiciones de los jugadores como obstáculos
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                navigationMap[pos.y][pos.x] = 1; // 1 representa un obstáculo
            }
        });

        return navigationMap;
    }
}

module.exports = AreaModel;
