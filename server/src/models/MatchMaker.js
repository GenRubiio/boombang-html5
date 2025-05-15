const MinigamesEnum = require('../enums/MinigamesEnum');
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameRingSceneInstance = require('../instances/MinigameRingSceneInstance');
const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const UserSceneResource = require('../resources/UserSceneResource');
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class MatchMaker {
    constructor(requiredPlayers) {
        this.requiredPlayers = requiredPlayers;
        // Map<type, Array<socket>>
        this.waitingLists = new Map();
        // Map<roomId, GameRoom>
        this.rooms = new Map();
    }

    register(socket, sceneType, onMatchFound) {
        if (!this.waitingLists.has(sceneType)) {
            this.waitingLists.set(sceneType, []);
        }
        const queue = this.waitingLists.get(sceneType);

        // Evitar duplicados
        if (queue.includes(socket)) return;
        queue.push(socket);

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
                minigame = new MinigameRingSceneInstance(MinigameScenesCollection.getByUid(sceneType));
                break;
            default:
                throw new Error(`Tipo de sala desconocido: ${sceneType}`);
        }

        this.sendNotificationToUsers(players);
        setTimeout(() => {
            this.callUsers(minigame, players, io);
            minigame.startMinigame();
        }, 10000);
    }

    sendNotificationToUsers(players) {
        for (const player of players) {
            player.emit('response:minigame_call_notification');
        }
    }

    async callUsers(minigameScene, players, io) {
        try {
            let position = 0;
            for (const player of players) {
                const user = ConnectedUsersCollection.getBySocketId(player.id);
                if (user) {
                    if (user.currentArea && user.currentArea.scene_type == SceneTypesEnum.PUBLIC_SCENE) {
                        RemoveUserFromSceneTask.main(user.currentArea, user);
                        console.log('Usuario eliminado de la escena pública', user.username);
                    }
                    user.setArea(minigameScene);
                    minigameScene.addUser(user, {
                        x: minigameScene.position_users[position][0],
                        y: minigameScene.position_users[position][1],
                        z: minigameScene.position_users[position][2]
                    });

                    let sceneUsers = [];
                    for (const user of minigameScene.users) {
                        sceneUsers.push(await new UserSceneResource(user).toObject());
                    }

                    player.emit('response:join_minigame', {
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
                    minigameScene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_SCENE, {
                        user: await new UserSceneResource(user).toObject(),
                    }, user);
                    position++;
                } else {
                    console.error(`Usuario no encontrado para el socket ${player.id}`);
                }
            }
        }
        catch (err) {
            console.error('Error al llamar a los usuarios:', err);
        }
    }

    // (Opcional) Recuperar sala por ID
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    unregister(socket, sceneType) {
        const queue = this.waitingLists.get(sceneType) || [];
        this.waitingLists.set(
            sceneType,
            queue.filter(s => s !== socket)
        );
    }
}

module.exports = MatchMaker;