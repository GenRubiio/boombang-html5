import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";
import RemovePlayerController from "../controllers/RemovePlayerController";
import AddPlayerController from "../controllers/AddPlayerController";
import CreateSceneController from "../controllers/CreateSceneController";

class GameSceneSockets {
    static main(gameScene) {
        // Solicitar datos iniciales de la sala
        socket.emit("request:get_public_area_data", { roomId: gameScene.roomId });
        // Escuchar respuesta con datos de la sala
        socket.on("response:get_public_area_data", (data) => {
            CreateSceneController.main(gameScene, data.players); // Crear escena con jugadores
        });
        // Escuchar cuando un nuevo jugador entra
        socket.on("response:new_user_join_public_area", (data) => {
            AddPlayerController.main(gameScene, data.user.id, data.user.x, data.user.y, data.user.z);
        });
        // Escuchar cuando un jugador se mueve
        socket.on("response:user_move", (data) => {
            const { id, path } = data;
            if (gameScene.players[id]) {
                console.log(`Moving player ${id} to path:`, path);
                console.log(`Is last step: ${data.isLastStep}`);
                MovePlayerController.main(gameScene, id, path, data.isLastStep);
            }
        });
        //this.socket.emit('response:user_move_denied', {
        //    id: this.socket.id,
        //});
        socket.on("response:user_move_denied", (data) => {
            const { id } = data;
            if (gameScene.players[id]) {
                const player = gameScene.players[id].player;
                const direction = gameScene.players[id].position.z;
                MovePlayerController.stopAnimation(player, direction);
            }
        });
        // Escuchar cuando un jugador sale
        socket.on("response:user_left_public_area", (data) => {
            RemovePlayerController.main(gameScene, data.socketId);
        });
    }
}

export default GameSceneSockets;