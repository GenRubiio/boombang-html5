const EasyStar = require('easystarjs').js;
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserMovimentUtil = require('../utils/UserMovimentUtil');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const UserBlockActionsTask = require('../tasks/UserBlockActionsTask');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');

class MovementProcessorInstance {
    constructor(scene) {
        this.scene = scene;
    }

    startProcessing() {
        const processMovement = async () => {
            const movers = this.scene.users.filter(user => user.finalTarget);
            await Promise.all(movers.map(user => this.processUserMovement(user)));
            setTimeout(processMovement, AnimationBlockTimerEnum.WALK);
        };
        processMovement();
    }

    async processUserMovement(user) {
        try {
            if (!user.finalTarget) {
                if (user.lastReservedTile) {
                    delete this.scene.reservedTiles[user.lastReservedTile];
                    user.lastReservedTile = null;
                }
                return;
            }

            const startPos = user.currentAreaPosition;
            const target = user.finalTarget;

            if (startPos.x === target.x && startPos.y === target.y) {
                if (user.lastReservedTile) {
                    delete this.scene.reservedTiles[user.lastReservedTile];
                    user.lastReservedTile = null;
                }
                user.finalTarget = null;
                return;
            }

            if (user.lastReservedTile) {
                delete this.scene.reservedTiles[user.lastReservedTile];
                user.lastReservedTile = null;
            }

            const navigationMap = this.scene.getNavigationMapWithPlayers(user.id);

            if (navigationMap[target.y][target.x] === 1) {
                //this.scene.emit(ResponseSocketsEnum.USER_MOVE_DENIED, { id: user.socket.id });
                this.scene.emit(ResponseSocketsEnum.USER_MOVE, {
                    id: user.socket.id,
                    path: [],
                    isLastStep: true
                });
                user.finalTarget = null;
                return;
            }

            const path = await this.#findPath(startPos, target, navigationMap);

            if (!path || path.length <= 1) {
                 this.scene.emit(ResponseSocketsEnum.USER_MOVE, {
                    id: user.socket.id,
                    path: [],
                    isLastStep: true
                });
                //this.scene.emit(ResponseSocketsEnum.USER_MOVE_DENIED, { id: user.socket.id });
                return;
            }

            const nextStep = path[1];
            const key = `${nextStep.x},${nextStep.y}`;

            if (this.scene.reservedTiles[key] && this.scene.reservedTiles[key] !== user.id) {
                this.scene.emit(ResponseSocketsEnum.USER_MOVE, {
                    id: user.socket.id,
                    path: [],
                    isLastStep: true
                });
                return;
            }

            this.scene.reservedTiles[key] = user.id;
            user.lastReservedTile = key;

            const deltaX = nextStep.x - startPos.x;
            const deltaY = nextStep.y - startPos.y;
            const direction = UserMovimentUtil.getDirection(deltaX, deltaY);

            user.currentAreaPosition = { x: nextStep.x, y: nextStep.y, z: direction };

            this.#validateUserOnSpawnedObject(user, nextStep);

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
            this.scene.emit(ResponseSocketsEnum.USER_MOVE, movementData);

            if (path.length === 2) {
                delete this.scene.reservedTiles[key];
                user.lastReservedTile = null;
                user.finalTarget = null;
            }
        } catch (err) {
            console.log(err);
            logger.log(`Error processing user movement: ${err.message}`, 'error');
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
                this.scene.emit('reponse:object_collected', {
                    userId: user.id,
                    userName: user.username,
                    itemName: obj.item.name,
                    itemId: obj.item.id,
                    position: obj.position
                });
            }
        });
    }
}

module.exports = MovementProcessorInstance;