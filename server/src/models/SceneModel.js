const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const MovementProcessorInstance = require('../instances/MovementProcessorInstance');
const SceneItemModel = require('./SceneItemModel');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const PrivateScenesCollection = require('../collections/PrivateScenesCollection');
const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');

class SceneModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.type = row.type; //Tipo de escena un idetificador de escena para cargar sus componentes
        this.sound = row.sound; // Sonido ambiental de la escena
        this.sound_url = row.sound_url; // URL completa del sonido
        this.menu_type = row.menu_type; // Tipo de menú para la escena
        this.map_width = row.map_width;
        this.map_height = row.map_height;
        this.game_map = JSON.parse(row.map);
        this.startPosition = row.start_position; // Posición de inicio del área {x, y, z}
        this.movementBlocked = false; // Indica si el movimiento está bloqueado

        this.users = []; // Lista vacía de usuarios
        // Guardamos una copia base del mapa para evitar clonaciones repetidas
        this.navigationMapBase = JSON.parse(row.map);
        // Objeto para reservar tiles: clave "x,y" → id del usuario
        this.reservedTiles = {};


        this.possible_items = row.items ? row.items.map(item => new SceneItemModel(item)) : []; // Lista de posibles items que se pueden cargar en la escena
        this.spawnedObjects = []; // Array de objetos activos
        this.itemActivationTimers = new Map();
        this.#startItemActivationChecks();

        // Inicializar el procesador de movimiento
        this.movementProcessorInstance = new MovementProcessorInstance(this);
        this.movementProcessorInstance.startProcessing();

        this.interactions = new Map();
    }

    // Método para añadir un usuario
    addUser(user, startPosition = null) {
        if (this.users.includes(user)) {
            logger.log('User already in area', 'error');
            return;
        }
        if (startPosition){
            user.currentAreaPosition = { ...startPosition };
        }
        // Inicializamos la posición actual del usuario si no existe
        if (!user.currentAreaPosition) {
            user.currentAreaPosition = { ...this.startPosition };
        }
        // Propiedad para recordar la casilla reservada previamente
        user.lastReservedTile = null;
        this.users.push(user);
        this.#refreshUsersChatList();
        this.#refreshUsers();
    }

    // Método para devolver la lista de usuarios
    getUsers() {
        return this.users;
    }

    // Método para encontrar un usuario en la sala por username
    findUserByUsername(username) {
        if (!username) return null;
        const normalizedUsername = username.toLowerCase();
        return this.users.find(u => u.username.toLowerCase() === normalizedUsername);
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
        // Si es un área privada y no quedan usuarios, eliminamos la escena
        if (this.scene_type == SceneTypesEnum.PRIVATE_SCENE
            && this.users.length == 0
        ) {
            // Si no quedan usuarios, eliminamos la escena
            PrivateScenesCollection.remove(this.id);
        }
        this.#removeAllUserInteractions(user);
        this.#refreshUsersChatList();
        this.#refreshUsers();
    }

    #refreshUsersChatList() {
        const players = this.users.map(user => ({
            uuid: user.socket.id,
            username: user.username
        }));
        this.emit(ResponseSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST, { players });
    }

    #refreshUsers() {
        this.users.forEach(user => {
            if (user.currentArea != this) {
                this.removeUser(user);
            }
        });
    }

    /**
     * Interactions besos, bebidas, rozas
     */
    addInteraction(userSenderId, targetUserId, interactionType) {
        if (!this.interactions.has(userSenderId)) {
            this.interactions.set(userSenderId, new Map());
        }
        this.interactions.get(userSenderId).set(targetUserId, interactionType);
    }

    removeInteraction(userSenderId, targetUserId) {
        if (this.interactions.has(userSenderId)) {
            this.interactions.get(userSenderId).delete(targetUserId);
        }
    }

    hasInteraction(userSenderId, targetUserId) {
        const exists = this.interactions.has(userSenderId) && this.interactions.get(userSenderId).has(targetUserId);
        return exists;
    }

    getInteractionType(userSenderId, targetUserId) {
        if (this.hasInteraction(userSenderId, targetUserId)) {
            return this.interactions.get(userSenderId).get(targetUserId);
        }
        return null;
    }

    #removeAllUserInteractions(user) {
        // First, handle interactions initiated by this user (user is the sender)
        if (this.interactions.has(user.id)) {
            const targetsMap = this.interactions.get(user.id);
            targetsMap.forEach((interactionType, targetId) => {
                // Find the target user and send them the cancellation
                const targetUser = ConnectedUsersCollection.getByUserId(targetId);
                if (targetUser) {
                    targetUser.emit(ResponseSocketsEnum.USER_CANCEL_INTERACTION, {
                        type: interactionType,
                        fromUser: user.socket.id,
                    });
                }
            });
            // Remove all interactions initiated by this user
            this.interactions.delete(user.id);
        }
        
        // Then, remove any interactions where this user is the target
        const interactionsToClean = [];
        this.interactions.forEach((targetsMap, senderId) => {
            if (targetsMap.has(user.id)) {
                interactionsToClean.push({
                    senderId,
                    interactionType: targetsMap.get(user.id)
                });
            }
        });
        
        // Clean up the interactions where this user was the target
        interactionsToClean.forEach(({ senderId, interactionType }) => {
            this.interactions.get(senderId).delete(user.id);
            
            // Notify the sender that their interaction was cancelled
            const senderUser = ConnectedUsersCollection.getByUserId(senderId);
            if (senderUser) {
                senderUser.emit(ResponseSocketsEnum.USER_SEND_INTERACTION, {
                    type: interactionType,
                    user: user.socket.id,
                    action: "cancel"
                });
            }
        });
    }

    //****************************************************************************************************** */

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

    #startItemActivationChecks() {
        this.itemCheckInterval = setInterval(() => {
            this.possible_items.forEach(item => {
                if (this.users.length >= item.min_users) {
                    if (!this.itemActivationTimers.has(item.id)) {
                        // Usar item.time (configurable) para el tiempo de aparición
                        const timer = setTimeout(() => {
                            this.#spawnObject(item);
                            this.itemActivationTimers.delete(item.id);
                        }, item.activate_time * 1000); // ← Tiempo del item

                        this.itemActivationTimers.set(item.id, {
                            timer: timer,
                            startTime: Date.now()
                        });
                    }
                } else {
                    // Cancelar si no se cumplen las condiciones
                    if (this.itemActivationTimers.has(item.id)) {
                        clearTimeout(this.itemActivationTimers.get(item.id).timer);
                        this.itemActivationTimers.delete(item.id);
                    }
                }
            });
        }, 1000);
    }

    #spawnObject(item) {
        const walkablePositions = [];
        // Obtener posiciones válidas del mapa
        for (let y = 0; y < this.game_map.length; y++) {
            for (let x = 0; x < this.game_map[y].length; x++) {
                if (this.game_map[y][x] === 0) walkablePositions.push({ x, y });
            }
        }

        // Filtrar posiciones ocupadas
        const availablePositions = walkablePositions.filter(pos => {
            return !this.users.some(user =>
                user.currentAreaPosition.x === pos.x &&
                user.currentAreaPosition.y === pos.y
            ) && !this.spawnedObjects.some(obj =>
                obj.position.x === pos.x &&
                obj.position.y === pos.y
            );
        });

        if (availablePositions.length === 0) {
            logger.log(`No hay posiciones para ${item.name}`, 'warning');
            return;
        }

        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const newObject = {
            item: item,
            position: availablePositions[randomIndex],
            timer: setTimeout(() => {
                this.removeObject(newObject);
            }, item.desactivate_time * 1000) // ← 15 segundos
        };

        this.spawnedObjects.push(newObject);
        this.emit(ResponseSocketsEnum.SCENE_OBJECT_SPAWNED, {
            itemId: item.id,
            position: newObject.position
        });
    }

    removeObject(object) {
        this.spawnedObjects = this.spawnedObjects.filter(obj => obj !== object);
        clearTimeout(object.timer);
        this.emit(ResponseSocketsEnum.SCENE_OBJECT_REMOVED, {
            itemId: object.item.id,
            position: object.position
        });
    }
}

module.exports = SceneModel;
