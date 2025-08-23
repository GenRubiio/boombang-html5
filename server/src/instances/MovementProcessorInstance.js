const EasyStar = require('easystarjs').js;
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../utils/UserMovimentUtil');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');
const UserBlockActionsTask = require('../tasks/UserBlockActionsTask');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const PublicSceneService = require('../services/PublicSceneService');

class MovementProcessorInstance {
    constructor(scene) {
        this.scene = scene;
        this.processing = false;
        this.#startReservationCleanup();
    }

    startProcessing() {
        this.processing = true;
        const processMovement = async () => {
            if (!this.processing) return;
            const movers = this.scene.users.filter(user => user.finalTarget);
            await Promise.all(movers.map(user => this.processUserMovement(user)));
            setTimeout(processMovement, AnimationBlockTimerEnum.WALK);
        };
        processMovement();
    }

    async processUserMovement(user) {
        try {
            if (user.isActionBlocked(AnimationEnum.WALK)) return;

            // Limpiar reserva anterior
            this.#clearUserReservation(user);

            if (!user.finalTarget) {
                return;
            }

            const startPos = user.currentAreaPosition;
            const target = user.finalTarget;

            if (startPos.x === target.x && startPos.y === target.y) {
                user.finalTarget = null;
                return;
            }

            const navigationMap = this.scene.getNavigationMapWithPlayers(user.id);
            const path = await this.#findPath(startPos, target, navigationMap);

            if (!path || path.length <= 1) {
                this.scene.emit(ResponseSocketsEnum.USER_MOVE, { id: user.socket.id, path: [], isLastStep: true });
                user.finalTarget = null;
                // Asegurar limpieza de reservas cuando no hay path válido
                this.#clearUserReservation(user);
                return;
            }

            const nextStep = path[1];
            const isFinalStep = path.length === 2;

            const isOccupied = this.scene.users.some(
                otherUser => otherUser.id !== user.id &&
                otherUser.currentAreaPosition.x === nextStep.x &&
                otherUser.currentAreaPosition.y === nextStep.y
            );

            if (isOccupied) {
                if (isFinalStep) {
                    user.finalTarget = null;
                }
                this.scene.emit(ResponseSocketsEnum.USER_MOVE, { id: user.socket.id, path: [], isLastStep: true });
                // Limpiar reservas cuando la posición está ocupada
                this.#clearUserReservation(user);
                return;
            }

            const key = `${nextStep.x},${nextStep.y}`;
            if (!isFinalStep) {
                if (this.scene.reservedTiles[key] && this.scene.reservedTiles[key] !== user.id) {
                    this.scene.emit(ResponseSocketsEnum.USER_MOVE, { id: user.socket.id, path: [], isLastStep: true });
                    // Limpiar reservas cuando hay conflicto de reservas
                    this.#clearUserReservation(user);
                    return;
                }
                this.scene.reservedTiles[key] = user.id;
                user.lastReservedTile = key;
            }

            const deltaX = nextStep.x - startPos.x;
            const deltaY = nextStep.y - startPos.y;
            const direction = UserMovimentUtil.getDirection(deltaX, deltaY);

            user.currentAreaPosition = { x: nextStep.x, y: nextStep.y, z: direction };
            this.#validateUserOnSpawnedObject(user, nextStep);

            const movementData = {
                id: user.socket.id,
                path: [{ x: nextStep.x, y: nextStep.y, z: direction }],
                isLastStep: isFinalStep
            };
            UserBlockActionsTask.blockByWalk(user);
            this.scene.emit(ResponseSocketsEnum.USER_MOVE, movementData);

            if (isFinalStep) {
                user.finalTarget = null;
            }
        } catch (err) {
            console.log(err);
            logger.log(`Error processing user movement: ${err.message}, user: ${user.username}`, 'error');
            user.socket.emit('error_critical');
        }
    }

    #findPath(startPos, endPos, customMap) {
        const easystar = new EasyStar();
        const mapToUse = customMap || this.scene.game_map;
        easystar.setGrid(mapToUse);
        easystar.setAcceptableTiles([0]);
        easystar.enableDiagonals();
        easystar.enableCornerCutting();

        return new Promise((resolve) => {
            easystar.findPath(startPos.x, startPos.y, endPos.x, endPos.y, (path) => {
                resolve(path);
            });
            easystar.calculate();
        });
    }

    #validateUserOnSpawnedObject(user, nextStep) {
        if (!this.scene.spawnedObjects || this.scene.spawnedObjects.length === 0) {
            return;
        }
        this.scene.spawnedObjects.forEach(obj => {
            if (nextStep.x === obj.position.x && nextStep.y === obj.position.y) {
                this.scene.removeObject(obj);
                this.scene.emit(ResponseSocketsEnum.SCENE_OBJECT_COLLECTED, {
                    userId: user.id,
                    userName: user.username,
                    itemName: obj.item.name,
                    itemId: obj.item.id,
                    position: obj.position,
                    catchFileName: obj.item.catch_file_name,
                    text: obj.item.text,
                    points: obj.item.points
                });
                PublicSceneService.userCatchItem(
                    user,
                    obj.item.id,
                    obj.item.file_name,
                    obj.item.points
                );
            }
        });
    }

    stopProcessing() {
        this.processing = false;
    }

    #clearUserReservation(user) {
        if (user.lastReservedTile) {
            delete this.scene.reservedTiles[user.lastReservedTile];
            user.lastReservedTile = null;
        }
    }

    #startReservationCleanup() {
        // Limpiar reservas huérfanas cada 5 segundos
        this.cleanupInterval = setInterval(() => {
            this.#cleanOrphanedReservations();
        }, 5000);
    }

    #cleanOrphanedReservations() {
        const activeUserIds = new Set(this.scene.users.map(user => user.id));
        
        // Eliminar reservas de usuarios que ya no están en la escena
        for (let key in this.scene.reservedTiles) {
            const userId = this.scene.reservedTiles[key];
            if (!activeUserIds.has(userId)) {
                delete this.scene.reservedTiles[key];
                logger.log(`Cleaned orphaned reservation at ${key} for user ${userId}`, 'info');
            }
        }

        // Limpiar reservas de usuarios que no tienen finalTarget
        this.scene.users.forEach(user => {
            if (user.lastReservedTile && !user.finalTarget) {
                delete this.scene.reservedTiles[user.lastReservedTile];
                user.lastReservedTile = null;
                logger.log(`Cleaned stale reservation for user ${user.username}`, 'info');
            }
        });
    }

    stopProcessing() {
        this.processing = false;
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

module.exports = MovementProcessorInstance;