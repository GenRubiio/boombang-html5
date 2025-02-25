const EasyStar = require('easystarjs').js;
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../utils/UserMovimentUtil');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const UserBlockActionsTask = require('../tasks/UserBlockActionsTask');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');

class AreaModel {
    constructor(id, name, map_width, map_height, game_map, startPosition) {
        this.id = id;
        this.name = name;
        this.users = []; // Lista vacía de usuarios
        this.map_width = map_width;
        this.map_height = map_height;
        this.game_map = game_map;
        this.startPosition = startPosition; // Posición de inicio del área {x, y, z}

        // Guardamos una copia base del mapa para evitar clonaciones repetidas
        this.navigationMapBase = JSON.parse(JSON.stringify(game_map));
        // Objeto para reservar tiles: clave "x,y" → id del usuario
        this.reservedTiles = {};

        this.startMovementProcessor();
    }

    // Método para añadir un usuario
    addUser(user) {
        if (this.users.includes(user)) {
            logger.log('User already in area', 'error');
            return;
        }
        // Inicializamos la posición actual del usuario si no existe
        if (!user.currentAreaPosition) {
            user.currentAreaPosition = { ...this.startPosition };
        }
        // Propiedad para recordar la casilla reservada previamente
        user.lastReservedTile = null;
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
        // Liberar su última reserva si existe
        if (user.lastReservedTile) {
            delete this.reservedTiles[user.lastReservedTile];
        }
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

    // Iniciar el procesador de movimiento (se procesa a todos los usuarios en paralelo)
    startMovementProcessor() {
        const processMovement = async () => {
            const movers = this.users.filter(user => user.finalTarget);
            await Promise.all(movers.map(user => this.processNextMovement(user)));
            setTimeout(processMovement, AnimationBlockTimerEnum.WALK); // Continuar el ciclo
        };

        processMovement();
    }

    // Lógica para procesar el siguiente movimiento de un usuario
    async processNextMovement(user) {
        try {
            if (!user.finalTarget) return; // No hay destino final establecido

            const startPos = user.currentAreaPosition;
            const target = user.finalTarget;

            // Verificar si ya se alcanzó el destino
            if (startPos.x === target.x && startPos.y === target.y) {
                // Liberar reserva actual si existe
                if (user.lastReservedTile) {
                    delete this.reservedTiles[user.lastReservedTile];
                    user.lastReservedTile = null;
                }
                user.finalTarget = null;
                return;
            }

            // Liberar la reserva previa (si el usuario se movió en el ciclo anterior)
            if (user.lastReservedTile) {
                delete this.reservedTiles[user.lastReservedTile];
                user.lastReservedTile = null;
            }

            // Calcular el mapa de navegación (incluye obstáculos de otros usuarios y reservas)
            const navigationMap = this.getNavigationMapWithPlayers(user.id);
            const path = await this.findPath(startPos, target, navigationMap);

            if (!path || path.length <= 1) {
                console.log('No se encontró un camino al destino');
                this.emit(ResponseSocketsEnum.USER_MOVE_DENIED, { id: user.socket.id });
                user.finalTarget = null;
                return;
            }

            // Seleccionar el siguiente paso del camino
            const nextStep = path[1];
            const key = `${nextStep.x},${nextStep.y}`;

            // Si la casilla ya está reservada por otro usuario, omitir este ciclo
            if (this.reservedTiles[key] && this.reservedTiles[key] !== user.id) {
                return; // Se reintentará en el siguiente ciclo
            }

            // Reservar la casilla para este usuario
            this.reservedTiles[key] = user.id;
            user.lastReservedTile = key;

            // Calcular la dirección del movimiento
            const deltaX = nextStep.x - startPos.x;
            const deltaY = nextStep.y - startPos.y;
            const direction = UserMovimentUtil.getDirection(deltaX, deltaY);

            // Actualizar la posición actual del usuario
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
            UserBlockActionsTask.blockByWalk(user);
            this.emit(ResponseSocketsEnum.USER_MOVE, movementData);

            // Si este es el último paso, liberar la reserva y cancelar el destino final
            if (path.length === 2) {
                delete this.reservedTiles[key];
                user.lastReservedTile = null;
                user.finalTarget = null;
            }
        } catch (err) {
            console.log(err);
            logger.log(`Error processing user movement: ${err.message}`, 'error');
            user.socket.emit('error_critical');
        }
    }

    // Implementación del algoritmo A* con EasyStar
    findPath(startPos, endPos, customMap) {
        const easystar = new EasyStar();
        // Usar el mapa personalizado si se proporciona, sino se usa el mapa original
        const mapToUse = customMap || this.game_map;
        easystar.setGrid(mapToUse);
        easystar.setAcceptableTiles([0]); // 0 es caminable
        easystar.enableDiagonals();
        easystar.enableCornerCutting();

        return new Promise((resolve) => {
            easystar.findPath(startPos.x, startPos.y, endPos.x, endPos.y, (path) => {
                resolve(path);
            });
            easystar.calculate();
        });
    }

    // Combina el mapa base con las posiciones actuales de otros usuarios y las reservas
    getNavigationMapWithPlayers(excludeUserId) {
        // Clonar la copia base del mapa
        let navigationMap = JSON.parse(JSON.stringify(this.navigationMapBase));

        // Marcar las posiciones actuales de los demás usuarios
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                navigationMap[pos.y][pos.x] = 1;
            }
        });

        // Marcar las casillas reservadas
        for (let key in this.reservedTiles) {
            const [x, y] = key.split(',').map(Number);
            navigationMap[y][x] = 1;
        }

        return navigationMap;
    }
}

module.exports = AreaModel;
