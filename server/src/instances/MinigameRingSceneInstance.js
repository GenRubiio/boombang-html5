const uuidv4 = require('uuid');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const MinigameAlertsEnum = require('../enums/MinigameAlertsEnum');
const MovementProcessorInstance = require('../instances/MovementProcessorInstance');

class MinigameRingSceneInstance {
    constructor(minigameScene) {
        this.id = uuidv4.v4(); // ID único de la escena
        this.minigameScene = minigameScene; // Escena del minijuego

        this.sceneType = SceneTypesEnum.MINIGAME_RING; // Tipo de modelo
        this.name = minigameScene.name;
        this.mapWidth = minigameScene.mapWidth;
        this.mapHeight = minigameScene.mapHeight;
        this.gameMap = minigameScene.gameMap;
        this.startPosition = minigameScene.startPosition;
        this.navigationMapBase = minigameScene.navigationMapBase;
        this.positionUsers = minigameScene.positionUsers;
        this.users = []; // Lista de usuarios en el minijuego
        this.disqualifiedUsers = []; // Lista de usuarios descalificados

        this.movementBlocked = true; // Indica si el movimiento está bloqueado
        this.reservedTiles = {};

        this.startGameInSeconds = 10;
        this.endGameInSeconds = 60 * 5;
        this.removeUserInSeconds = 15;
        this.gameStarted = false;

        // Inicializar el procesador de movimiento
        this.movementProcessorInstance = new MovementProcessorInstance(this);
        this.movementProcessorInstance.startProcessing();
    }

    /**
     * Inicia el minijuego
    * 
    * 
    * 
    * 
    */

    startMinigame() {
        this.startCountdownTimerStartGame();
    }

    startCountdownTimerStartGame() {
        let intervalStartGame = setInterval(() => {
            this.startGameInSeconds--;
            this.usersUpdateCounter(this.startGameInSeconds);
            if (this.startGameInSeconds <= 0) {
                clearInterval(intervalStartGame);
                if (this.validateUsersInGame()) {
                    this.gameStarted = true;
                    this.movementBlocked = false;
                    this.startCountdownTimerEndGame();
                }
                else {
                    this.endGame();
                }
            }
            if (this.users.length < 2) {
                clearInterval(intervalStartGame);
                this.endGame();
            }
        }, 1000);
    }

    usersUpdateCounter(counter) {
        this.users.forEach(user => {
            user.socket.emit("response:minigame_counter", {
                counter: counter,
                show: counter == 0 ? false : true,
            });
        });
    }

    validateUsersInGame() {
        if (this.users.length < 2) {
            return false;
        }
        return true;
    }

    startCountdownTimerEndGame() {
        let intervalEndGame = setInterval(() => {
            this.endGameInSeconds--;
            if (this.endGameInSeconds <= 0) {
                clearInterval(intervalEndGame);
                this.endGame();
            }
        }, 1000);
    }

    disqualifyUser(user) {
        if (this.disqualifiedUsers.includes(user)) {
            logger.log('User already disqualified', 'error');
            return;
        }
        this.disqualifiedUsers.push(user);
        if (this.disqualifiedUsers.length === this.users.length - 1) {
            this.endGame();
        }
    }

    endGame() {
        this.sendAlertToAllUsers();
        this.movementBlocked = true;
        let intervalEndGame = setInterval(() => {
            this.removeUserInSeconds--;
            this.usersUpdateCounter(this.removeUserInSeconds);
            if (this.removeUserInSeconds <= 0) {
                clearInterval(intervalEndGame);
                this.users.forEach(user => {
                    if (user.currentArea && user.currentArea.sceneType == SceneTypesEnum.MINIGAME_RING) {
                        RemoveUserFromSceneTask.main(user.currentArea, user);
                    }
                });
                this.users = [];
                this.disqualifiedUsers = [];
                this.movementBlocked = true;
                this.gameStarted = false;
                this.reservedTiles = {};
            }
        }, 1000);
    }

    sendAlertToAllUsers() {
        if (this.gameStarted && (this.disqualifiedUsers.length === this.users.length - 1)) {
            let winner = this.users.find(user => !this.disqualifiedUsers.includes(user));
            this.users.forEach(user => {
                user.socket.emit('response:minigame_alert', {
                    alertType: MinigameAlertsEnum.WIN,
                    winnerName: winner.username,
                });
            });
        }
        else if (!this.gameStarted) {
            this.users.forEach(user => {
                user.socket.emit('response:minigame_alert', {
                    alertType: MinigameAlertsEnum.NO_MIN_USERS,
                });
            });
        }
        else {
            this.users.forEach(user => {
                user.socket.emit('response:minigame_alert', {
                    alertType: MinigameAlertsEnum.TIMEOUT,
                });
            });
        }
    }

    /**
    * Metodos para gestionar los usuarios en el área
    * 
    * 
    * 
    * 
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
        this.disqualifiedUsers = this.disqualifiedUsers.filter(u => u !== user);
        if (this.users.length === 1 && this.gameStarted) {
            this.endGame();
        }
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

    // Combina el mapa base con las posiciones actuales de otros usuarios y las reservas
    getNavigationMapWithPlayers(excludeUserId) {
        // Clonar la copia base del mapa
        let navigationMap = JSON.parse(JSON.stringify(this.navigationMapBase));

        // Marcar las posiciones actuales de los demás usuarios
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                if (navigationMap[pos.y] && navigationMap[pos.y][pos.x] !== undefined) {
                    navigationMap[pos.y][pos.x] = 1;
                }
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

module.exports = MinigameRingSceneInstance; 