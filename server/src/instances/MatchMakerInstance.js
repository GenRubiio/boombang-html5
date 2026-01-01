const uuidv4 = require('uuid');
const MinigamesEnum = require('../enums/MinigamesEnum');
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameRingSceneInstance = require('./MinigameRingSceneInstance');
const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const UserResource = require('../resources/UserResource');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const MinigameInstancesCollection = require('../collections/MinigameInstancesCollection');
const sceneMutex = require('../utils/SceneMutex');

class MatchMakerInstance {
    constructor(requiredPlayers, io) {
        this.requiredPlayers = requiredPlayers;
        this.io = io;
        // Map<type, Array<socket>>
        this.waitingLists = new Map();
        // Map<roomId, GameRoom>
        this.rooms = new Map();
        this.notifiedUsers = new Map();

        this.matchCheckInterval = setInterval(() => {
            for (const [sceneType, queue] of this.waitingLists.entries()) {
                if (queue.length >= this.requiredPlayers) {
                    const players = queue.splice(0, this.requiredPlayers);
                    this.createMinigame(sceneType, players, this.io);
                }
            }
        }, 5000); // Check every 5 seconds
    }

    register(socket, sceneType) {
        const notifiedSet = this.notifiedUsers.get(sceneType);
        if (notifiedSet?.has(socket.id)) {
            return;
        }

        if (!this.waitingLists.has(sceneType)) {
            this.waitingLists.set(sceneType, []);
        }
        const queue = this.waitingLists.get(sceneType);

        // Evitar duplicados
        const idx = queue.findIndex(s => s.id === socket.id);
        if (idx !== -1) {
            queue.splice(idx, 1);
            socket.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE, {
                success: true,
            });
            return;
        }
        if (queue.includes(socket)) return;
        queue.push(socket);

        socket.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE, {
            success: true,
        });
    }

    isUserInQueue(socketId, sceneType) {
        const queue = this.waitingLists.get(sceneType);
        if (!queue) {
            return false;
        }
        return queue.some(s => s.id === socketId);
    }

    createMinigame(sceneType, players, io) {
        const id = uuidv4.v4();
        console.log(id);
        let miniGameInstance = null;
        switch (sceneType) {
            case MinigamesEnum.GOLDEN_RING:
                let miniGameScene = { ...MinigameScenesCollection.getByUid(sceneType) }
                miniGameInstance = new MinigameRingSceneInstance(id, miniGameScene);
                break;
            default:
                throw new Error(`Tipo de sala desconocido: ${sceneType}`);
        }
        this.sendNotificationToUsers(players, sceneType);
        setTimeout(async () => {
            await this.callUsers(miniGameInstance, players, io);
            miniGameInstance.startMinigame();
            MinigameInstancesCollection.add(id, miniGameInstance);
        }, 1000);//time to wait before starting the minigame
    }

    sendNotificationToUsers(players, sceneType) {
        if (!this.notifiedUsers.has(sceneType)) {
            this.notifiedUsers.set(sceneType, new Set());
        }
        const notifiedSet = this.notifiedUsers.get(sceneType);

        for (const player of players) {
            const user = ConnectedUsersCollection.getBySocketId(player.id);
            if (!user) {
                continue;
            }
            notifiedSet.add(player.id);
            player.emit(ResponseSocketsEnum.MINIGAME_CALL_NOTIFICATION);
        }
    }

    async callUsers(miniGameInstance, players, io) {
        // Usar el mutex global para sincronizar el acceso a la escena
        const release = await sceneMutex.acquire(miniGameInstance.id);
        
        try {
            // Notificar a los clientes que ya no están en la cola de espera
            for (const player of players) {
                player.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS, {
                    success: true,
                    isSubscribed: false,
                    npcId: miniGameInstance.minigameScene.type
                });
            }

            // 1. Añadir todos los usuarios a la escena primero
            for (const [index, player] of players.entries()) {
                const user = ConnectedUsersCollection.getBySocketId(player.id);
                if (!user) {
                    console.error(`Usuario no encontrado para el socket ${player.id}`);
                    continue;
                }

                if (user.currentArea && (user.currentArea.scene_type !== SceneTypesEnum.MINIGAME_RING)) {
                    try {
                        RemoveUserFromSceneTask.main(user.currentArea, user);
                    } catch (removeErr) {
                        console.error(`Error removing user ${user.username} from current area:`, removeErr.message);
                    }
                }

                const startPosition = {
                    x: miniGameInstance.position_users[index][0],
                    y: miniGameInstance.position_users[index][1],
                    z: miniGameInstance.position_users[index][2]
                };

                user.setArea(miniGameInstance);
                miniGameInstance.addUser(user, startPosition);
            }

            // 2. Obtener la lista completa de usuarios en la escena
            const sceneUsers = [];
            for (const user of miniGameInstance.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }

            // 3. Notificar a cada jugador con la lista completa
            for (const player of players) {
                const user = ConnectedUsersCollection.getBySocketId(player.id);
                if (!user) continue;

                player.emit(ResponseSocketsEnum.MINIGAME_JOIN, {
                    success: true,
                    sceneType: miniGameInstance.minigameScene.type,
                    data: {
                        players: sceneUsers,
                        authUser: await new UserResource(user).toObject(),
                        scenery: {
                            type: miniGameInstance.minigameScene.type,
                            map_rows: miniGameInstance.map_width,
                            map_cols: miniGameInstance.map_height,
                            game_map: miniGameInstance.game_map,
                        }
                    }
                });
            }

            this.clearNotifiedUsers(miniGameInstance, players);
        } catch (err) {
            console.error('Error al llamar a los usuarios:', err);
            throw err;
        } finally {
            release();
        }
    }

    clearNotifiedUsers(miniGameInstance, players) {
        const type = miniGameInstance.minigameScene.type;
        const notifiedSet = this.notifiedUsers.get(type);
        if (notifiedSet) {
            for (const player of players) {
                notifiedSet.delete(player.id);
            }
            // opcional: si está vacío, eliminar la clave
            if (notifiedSet.size === 0) {
                this.notifiedUsers.delete(type);
            }
        }
    }

    cleanup() {
        if (this.matchCheckInterval) {
            clearInterval(this.matchCheckInterval);
            this.matchCheckInterval = null;
        }
        this.waitingLists.clear();
        this.rooms.clear();
        this.notifiedUsers.clear();
        console.log('MatchMakerInstance cleaned up');
    }
}

module.exports = MatchMakerInstance;