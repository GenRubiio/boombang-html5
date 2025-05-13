const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const PublicSceneModel = require('../models/PublicSceneModel');
const UserSceneResource = require('../resources/UserSceneResource');

class MinigameRingSceneInstance {
    constructor(minigameScene, players, io) {
        this.minigameScene = minigameScene; // Escena del minijuego
        this.players = players; // Lista de jugadores
        this.io = io; // Instancia de socket.io

        this.name = minigameScene.name;
        this.map_width = minigameScene.map_width;
        this.map_height = minigameScene.map_height;
        this.game_map = minigameScene.game_map;
        this.startPosition = minigameScene.startPosition;
        this.navigationMapBase = minigameScene.navigationMapBase;
        this.position_users = minigameScene.position_users;
        this.users = []; // Lista de usuarios en el minijuego

        setTimeout(() => {
            this.callUsers();
        }, 10000); // Llamar a los usuarios después de 1 segundo
    }

    async callUsers() {
        try {
            for (const player of this.players) {
                const user = ConnectedUsersCollection.getBySocketId(player.id);
                if (user) {
                    if (user.currentArea && user.currentArea instanceof PublicSceneModel) {
                        RemoveUserFromSceneTask.main(user.currentArea, user, this.io);
                    }
                    user.setArea(this);
                    this.users.push(user);
                    let sceneUsers = [];
                    for (const user of this.users) {
                        sceneUsers.push(await new UserSceneResource(user).toObject());
                    }

                    player.emit('response:join_minigame', {
                        success: true,
                        sceneType: this.minigameScene.type,
                        data: {
                            players: sceneUsers,
                            scenery: {
                                type: this.minigameScene.type,
                                map_rows: this.map_width,
                                map_cols: this.map_height,
                                game_map: this.game_map,
                            }
                        }
                    });
                    //this.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_SCENE, {
                    //    user: await new UserSceneResource(user).toObject(),
                    //}, user);
                } else {
                    console.error(`Usuario no encontrado para el socket ${player.id}`);
                }
            }
        }
        catch (err) {
            console.error('Error al llamar a los usuarios:', err);
        }
    }
}

module.exports = MinigameRingSceneInstance; 