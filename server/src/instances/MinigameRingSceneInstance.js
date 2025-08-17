const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const MinigameAlertsEnum = require('../enums/MinigameAlertsEnum');
const MovementProcessorInstance = require('../instances/MovementProcessorInstance');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const UserService = require('../services/UserService');
const MinigameInstancesCollection = require('../collections/MinigameInstancesCollection');

class MinigameRingSceneInstance {
    constructor(id, minigameScene) {
        this.id = id; // ID único de la escena
        this.minigameScene = minigameScene; // Escena del minijuego

        this.scene_type = SceneTypesEnum.MINIGAME_RING; // Tipo de modelo
        this.name = minigameScene.name;
        this.map_width = minigameScene.map_width;
        this.map_height = minigameScene.map_height;
        this.game_map = minigameScene.game_map;
        this.startPosition = minigameScene.startPosition;
        this.navigationMapBase = minigameScene.navigationMapBase;
        this.position_users = minigameScene.position_users;

        this.users = []; // Lista de usuarios en el minijuego
        this.disqualifiedUsers = []; // Lista de usuarios descalificados
        this.coconutCounts = new Map(); // Contador de cocos por usuario

        this.movementBlocked = true; // Indica si el movimiento está bloqueado
        this.reservedTiles = {};

        this.startGameInSeconds = 10; //10
        this.endGameInSeconds = 60 * 5; //60 * 5
        this.removeUserInSeconds = 15; //15

        this.gameStarted = false;
        this.gameEnded = false; // Flag para controlar el estado del juego

        this.intervalStartGame = null;
        this.intervalEndGame = null;
        this.intervalRemoveUsers = null;

        // Inicializar el procesador de movimiento
        this.movementProcessorInstance = new MovementProcessorInstance(this);
        this.movementProcessorInstance.startProcessing();
    }

    /**
     * Inicia el minijuego
     */
    startMinigame() {
        this.startCountdownTimerStartGame();
    }

    startCountdownTimerStartGame() {
        this.intervalStartGame = setInterval(() => {
            // Si quedan menos de 2 usuarios antes de empezar, se cancela
            if (this.users.length < 2) {
                this.endGame();
                return;
            }

            this.startGameInSeconds--;
            this.usersUpdateCounter(this.startGameInSeconds);

            if (this.startGameInSeconds <= 0) {
                clearInterval(this.intervalStartGame);
                if (this.validateUsersInGame()) {
                    this.gameStarted = true;
                    this.movementBlocked = false;
                    this.startCountdownTimerEndGame();
                } else {
                    this.endGame();
                }
            }
        }, 1000);
    }

    startCountdownTimerEndGame() {
        this.intervalEndGame = setInterval(() => {
            this.endGameInSeconds--;
            if (this.endGameInSeconds <= 0) {
                this.endGame(); // Termina por tiempo
            }
        }, 1000);
    }

    disqualifyUser(user) {
        if (this.disqualifiedUsers.includes(user) || this.gameEnded) {
            return;
        }
        this.disqualifiedUsers.push(user);

        // Si solo queda un jugador no descalificado, es el ganador
        const activePlayers = this.users.filter(u => !this.disqualifiedUsers.includes(u));
        if (activePlayers.length <= 1 && this.gameStarted) {
            this.endGame();
        }
    }

    endGame() {
        if (this.gameEnded) {
            return; // Evitar ejecuciones múltiples
        }
        this.gameEnded = true;
        this.movementBlocked = true;

        // Limpiar todos los temporizadores principales
        clearInterval(this.intervalStartGame);
        clearInterval(this.intervalEndGame);

        // Detener el procesador de movimiento
        this.movementProcessorInstance.stopProcessing();

        this.sendAlertToAllUsers();

        let countdown = this.removeUserInSeconds;

        // Iniciar un nuevo temporizador para la cuenta atrás final
        const finalCountdownTimer = setInterval(() => {
            countdown--;
            this.usersUpdateCounter(countdown);
            if (countdown <= 0) {
                clearInterval(finalCountdownTimer);
 
                // Expulsar a todos los usuarios de forma segura
                // Hacemos una copia del array porque RemoveUserFromSceneTask lo modifica
                const usersToRemove = [...this.users];
                usersToRemove.forEach(user => {
                    console.log(`Expulsando a usuario: ${user.username} | area: ${user.currentArea} | id: ${user.currentArea.id} | instanceId: ${this.id}`);
                    if (user.currentArea && user.currentArea.id == this.id) {
                        console.log(`Expulsando a usuario: ${user.username} de la escena ${this.name}`);
                        RemoveUserFromSceneTask.main(this, user);
                    }
                });

                MinigameInstancesCollection.remove(this.id);
            }
        }, 1000);
    }

    sendAlertToAllUsers() {
        const activePlayers = this.users.filter(user => !this.disqualifiedUsers.includes(user));

        if (!this.gameStarted) {
            // El juego no comenzó por falta de jugadores
            this.emit(ResponseSocketsEnum.MINIGAME_ALERT, {
                alertType: MinigameAlertsEnum.NO_MIN_USERS,
            });
        } else if (activePlayers.length === 1) {
            // Hay un ganador
            const winner = activePlayers[0];
            UserService.increaseRingsWon(winner);
            this.emit(ResponseSocketsEnum.MINIGAME_ALERT, {
                alertType: MinigameAlertsEnum.WIN,
                winnerName: winner.username,
            });
        } else {
            // Empate o tiempo agotado sin un único ganador
            this.emit(ResponseSocketsEnum.MINIGAME_ALERT, {
                alertType: MinigameAlertsEnum.TIMEOUT,
            });
        }
    }

    usersUpdateCounter(counter) {
        this.emit(ResponseSocketsEnum.MINIGAME_COUNTER, {
            counter: counter,
            show: counter > 0,
        });
    }

    validateUsersInGame() {
        return this.users.length >= 2;
    }

    /**
    * Metodos para gestionar los usuarios en el área
    */
    addUser(user, currentAreaPosition) {
        if (this.users.includes(user)) {
            logger.log('User already in area', 'error');
            return;
        }
        user.currentAreaPosition = currentAreaPosition;
        user.lastReservedTile = null;
        user.finalTarget = null;
        this.users.push(user);
        this.coconutCounts.set(user.id, 0);
    }

    getUsers() {
        return this.users;
    }

    containsUser(user) {
        return this.users.includes(user);
    }

    removeUser(user) {
        if (user.lastReservedTile) {
            delete this.reservedTiles[user.lastReservedTile];
        }

        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);
        }

        const disqualifiedIndex = this.disqualifiedUsers.findIndex(u => u.id === user.id);
        if (disqualifiedIndex > -1) {
            this.disqualifiedUsers.splice(disqualifiedIndex, 1);
        }

        this.coconutCounts.delete(user.id);

        // Si solo queda un jugador no descalificado, es el ganador
        const activePlayers = this.users.filter(u => !this.disqualifiedUsers.includes(u));
        if (activePlayers.length <= 1 && this.gameStarted) {
            this.endGame();
        }
    }

    canSendCoconut(user) {
        const count = this.coconutCounts.get(user.id) || 0;
        return count < 3;
    }

    incrementCoconutCount(user) {
        const count = this.coconutCounts.get(user.id) || 0;
        this.coconutCounts.set(user.id, count + 1);
    }

    emit(event, data) {
        this.users.forEach(user => {
            user.socket.emit(event, data);
        });
    }

    emitToAllExcept(event, data, excludedUser) {
        this.users.forEach(user => {
            if (user !== excludedUser) {
                user.socket.emit(event, data);
            }
        });
    }

    getNavigationMapWithPlayers(excludeUserId) {
        let navigationMap = JSON.parse(JSON.stringify(this.navigationMapBase));
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                if (navigationMap[pos.y] && navigationMap[pos.y][pos.x] !== undefined) {
                    navigationMap[pos.y][pos.x] = 1;
                }
            }
        });
        for (let key in this.reservedTiles) {
            const [x, y] = key.split(',').map(Number);
            if (navigationMap[y] && navigationMap[y][x] !== undefined) {
                navigationMap[y][x] = 1;
            }
        }
        return navigationMap;
    }
}

module.exports = MinigameRingSceneInstance; 