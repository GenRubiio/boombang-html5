const EasyStar = require('easystarjs').js;
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../utils/UserMovimentUtil');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');
const UserBlockActionsTask = require('../tasks/UserBlockActionsTask');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const PublicSceneService = require('../services/PublicSceneService');
const SendUserToSceneController = require('../controllers/game/scenes/SendUserToSceneController');
const CocoEffectEnum = require('../enums/CocoEffectEnum');

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

            // Validar si la posición coincide con alguna trampa (en cada paso)
            const trap = this.#getTrapAtPosition(nextStep.x, nextStep.y);
            if (trap) {
                // Cancelar el objetivo final porque pisó una trampa
                user.finalTarget = null;
                // Esperar un momento para que la animación de caminar termine antes de aplicar el efecto
                setTimeout(() => {
                    this.#applyTrapEffect(user, trap);
                }, AnimationBlockTimerEnum.WALK);
                return;
            }

            if (isFinalStep) {
                user.finalTarget = null;

                // Validar si la posición coincide con alguna flecha (solo en destino final)
                const arrow = this.#getArrowAtPosition(nextStep.x, nextStep.y);
                if (arrow) {
                    this.#clearUserReservation(user);
                    await SendUserToSceneController.main(user, arrow);
                    return;
                }
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

    #getArrowAtPosition(x, y) {
        if (!this.scene.arrows || !Array.isArray(this.scene.arrows) || this.scene.arrows.length === 0) {
            return null;
        }

        return this.scene.arrows.find(arrow => {
            const arrowX = parseInt(arrow.position_x) || 0;
            const arrowY = parseInt(arrow.position_y) || 0;

            return arrowX === x && arrowY === y;
        });
    }

    #getTrapAtPosition(x, y) {
        if (!this.scene.traps || !Array.isArray(this.scene.traps) || this.scene.traps.length === 0) {
            return null;
        }

        return this.scene.traps.find(trap => {
            const trapX = parseInt(trap.position_x) || 0;
            const trapY = parseInt(trap.position_y) || 0;

            return trapX === x && trapY === y && trap.active;
        });
    }

    #applyTrapEffect(user, trap) {
        try {
            // Cancelar movimiento del usuario
            user.cancelMovement();
            this.#clearUserReservation(user);
            user.finalTarget = null;

            // Bloquear acciones del usuario por el coco
            UserBlockActionsTask.blockByCoconutReceive(user, trap.coconut_type);

            // Determinar el efecto según el tipo de coco
            let effect = CocoEffectEnum.COCO;
            let effectDuration = AnimationBlockTimerEnum.COCO_COCO;

            switch (trap.coconut_type) {
                case 0:
                    effect = CocoEffectEnum.COCO;
                    effectDuration = AnimationBlockTimerEnum.COCO_COCO;
                    break;
                case 1:
                    effect = CocoEffectEnum.SNOWBALL;
                    effectDuration = AnimationBlockTimerEnum.COCO_SHOWBALL;
                    break;
                case 2:
                    effect = CocoEffectEnum.SHOE;
                    effectDuration = AnimationBlockTimerEnum.COCO_SHOE;
                    break;
                case 3:
                    effect = CocoEffectEnum.PIE;
                    effectDuration = AnimationBlockTimerEnum.COCO_PIE;
                    break;
                case 4:
                    effect = CocoEffectEnum.MACETA;
                    effectDuration = AnimationBlockTimerEnum.COCO_MACETA;
                    break;
                case 5:
                    effect = CocoEffectEnum.AVISPAS;
                    effectDuration = AnimationBlockTimerEnum.COCO_AVISPAS;
                    break;
                case 6:
                    effect = CocoEffectEnum.GARBAGE;
                    effectDuration = AnimationBlockTimerEnum.COCO_GARBAGE;
                    break;
                case 7:
                    effect = CocoEffectEnum.SANDIA;
                    effectDuration = AnimationBlockTimerEnum.COCO_SANDIA;
                    break;
                case 8:
                    effect = CocoEffectEnum.YUNQUE;
                    effectDuration = AnimationBlockTimerEnum.COCO_YUNQUE;
                    break;
                case 9:
                    effect = CocoEffectEnum.PIANO;
                    effectDuration = AnimationBlockTimerEnum.COCO_PIANO;
                    break;
            }

            // Emitir efecto del coco a todos los usuarios de la escena
            this.scene.emit(ResponseSocketsEnum.USER_RECEIVE_EFFECT, {
                'user_socket': user.socket.id,
                'effect': effect,
            });

            //logger.log(`User ${user.username} stepped on trap at (${trap.position_x}, ${trap.position_y}) with coconut type ${trap.coconut_type}`, 'info');

            // Esperar a que termine la animación del coco antes de teleportar
            setTimeout(() => {
                // Teleportar al usuario a la posición de entrada
                const startPosition = this.scene.startPosition;
                user.currentAreaPosition = { ...startPosition };

                // Emitir movimiento inmediato a la posición de entrada
                this.scene.emit(ResponseSocketsEnum.USER_MOVE, {
                    id: user.socket.id,
                    path: [{ x: startPosition.x, y: startPosition.y, z: startPosition.z }],
                    isLastStep: true,
                    isTeleport: true
                });
            }, effectDuration);
        } catch (err) {
            console.error('Error applying trap effect:', err);
            logger.log(`Error applying trap effect: ${err.message}`, 'error');
        }
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
        try {
            if (!this.scene || !this.scene.users || !this.scene.reservedTiles) {
                return;
            }

            const activeUserIds = new Set(this.scene.users.map(user => user.id));

            // Eliminar reservas de usuarios que ya no están en la escena
            const reservationKeys = Object.keys(this.scene.reservedTiles);
            for (let key of reservationKeys) {
                const userId = this.scene.reservedTiles[key];
                if (!activeUserIds.has(userId)) {
                    delete this.scene.reservedTiles[key];
                    console.log(`-> Cleaned orphaned reservation at ${key} for user ${userId}`);
                }
            }

            // Limpiar reservas de usuarios que no tienen finalTarget
            this.scene.users.forEach(user => {
                try {
                    if (user && user.lastReservedTile && !user.finalTarget) {
                        if (this.scene.reservedTiles[user.lastReservedTile]) {
                            delete this.scene.reservedTiles[user.lastReservedTile];
                        }
                        user.lastReservedTile = null;
                        console.log(`-> Cleaned stale reservation for user ${user.username}`);
                    }
                } catch (userErr) {
                    console.error(`Error cleaning reservation for user ${user?.username}:`, userErr.message);
                }
            });
        } catch (err) {
            console.error('Error in cleanOrphanedReservations:', err.message);
            logger.log(`Error cleaning orphaned reservations: ${err.message}`, 'error');
        }
    }

    stopProcessing() {
        this.processing = false;
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

module.exports = MovementProcessorInstance;