const MinigamesEnum = require('../enums/MinigamesEnum');
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameRingSceneInstance = require('./MinigameRingSceneInstance');
const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const UserResource = require('../resources/UserResource');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class MatchMakerInstance {
    constructor(requiredPlayers) {
        this.requiredPlayers = requiredPlayers;
        // Map<type, Array<socket>>
        this.waitingLists = new Map();
        // Map<roomId, GameRoom>
        this.rooms = new Map();
        this.notifiedUsers = new Map();
    }

    register(socket, sceneType, onMatchFound) {
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

        // Si ya hay suficientes, extraer y llamar callback
        if (queue.length >= this.requiredPlayers) {
            const players = queue.splice(0, this.requiredPlayers);
            onMatchFound(players, sceneType);
        }
    }

    createMinigame(sceneType, players, io) {
        let minigame = null;
        switch (sceneType) {
            case MinigamesEnum.GOLDEN_RING:
                let miniGameScene = { ...MinigameScenesCollection.getByUid(sceneType) }
                minigame = new MinigameRingSceneInstance(miniGameScene);
                break;
            default:
                throw new Error(`Tipo de sala desconocido: ${sceneType}`);
        }
        this.sendNotificationToUsers(players, sceneType);
        setTimeout(() => {
            this.callUsers(minigame, players, io);
            minigame.startMinigame();
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

    async callUsers(minigameScene, players, io) {
        try {
            // Notificar a los clientes que ya no están en la cola de espera
            for (const player of players) {
                player.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS, {
                    success: true,
                    isSubscribed: false,
                    npcId: minigameScene.minigameScene.type
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
                    RemoveUserFromSceneTask.main(user.currentArea, user);
                }
                
                const startPosition = {
                    x: minigameScene.position_users[index][0],
                    y: minigameScene.position_users[index][1],
                    z: minigameScene.position_users[index][2]
                };

                user.setArea(minigameScene);
                minigameScene.addUser(user, startPosition);
            }

            // 2. Obtener la lista completa de usuarios en la escena
            const sceneUsers = [];
            for (const user of minigameScene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }

            // 3. Notificar a cada jugador con la lista completa
            for (const player of players) {
                const user = ConnectedUsersCollection.getBySocketId(player.id);
                 if (!user) continue;

                player.emit(ResponseSocketsEnum.MINIGAME_JOIN, {
                    success: true,
                    sceneType: minigameScene.minigameScene.type,
                    data: {
                        players: sceneUsers,
                        scenery: {
                            type: minigameScene.minigameScene.type,
                            map_rows: minigameScene.map_width,
                            map_cols: minigameScene.map_height,
                            game_map: minigameScene.game_map,
                        }
                    }
                });
            }

            this.clearNotifiedUsers(minigameScene, players);
        } catch (err) {
            console.error('Error al llamar a los usuarios:', err);
        }
    }

    clearNotifiedUsers(minigameScene, players) {
        const type = minigameScene.minigameScene.type;
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
}

module.exports = MatchMakerInstance;