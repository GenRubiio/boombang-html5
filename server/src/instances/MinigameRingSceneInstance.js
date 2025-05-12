const ConnectedUsersCollection = require('../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../tasks/RemoveUserFromSceneTask');
const PublicSceneModel = require('../models/PublicSceneModel');

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

        this.callUsers(); // Llamar a los usuarios para que se unan al minijuego
    }

    callUsers() {
        for (const player of this.players) {
            const user = ConnectedUsersCollection.getBySocketId(player.id);
            if (user) {
                if (publicArea = user.currentArea && user.currentArea instanceof PublicSceneModel) {
                    RemoveUserFromSceneTask.main(publicArea, user, io);
                }
                // Aquí puedes enviar un mensaje al usuario para que se una al minijuego
                // Por ejemplo: user.socket.emit('joinMinigame', { minigameId: this.id });
                //console.log(`Invitando a ${user.username} al minijuego ${this.name}`);
                //user.setArea(this.minigameScene);
                //this.users.push(user); // Agregar el usuario a la lista de usuarios del minijuego
                //user.socket.emit('response:minigame_ring', {
                //
                //})
            } else {
                console.error(`Usuario no encontrado para el socket ${player.id}`);
            }
        }
    }
}

module.exports = MinigameRingSceneInstance; 