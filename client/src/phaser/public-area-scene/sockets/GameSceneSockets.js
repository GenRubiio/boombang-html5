import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";
import RemovePlayerController from "../controllers/RemovePlayerController";
import AddPlayerController from "../controllers/AddPlayerController";
import CreateSceneController from "../controllers/CreateSceneController";

class GameSceneSockets {
    static main(gameScene) {
        // Solicitar datos iniciales de la sala
        socket.emit("request:get_public_area_data", {
            roomId: gameScene.areaId
        });
        // Escuchar respuesta con datos de la sala
        socket.on("response:get_public_area_data", (data) => {
            CreateSceneController.main(gameScene, data.players); // Crear escena con jugadores
        });
        // Escuchar cuando un nuevo jugador entra
        socket.on("response:new_user_join_public_area", (data) => {
            AddPlayerController.main(gameScene, data.user);
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
        socket.on("response:user_move_denied", (data) => {
            const { id } = data;
            if (gameScene.players[id]) {
                const playerData = gameScene.players[id];
                const player = playerData.player;
                const shadow = playerData.shadow;
                const direction = playerData.position.z;

                // Detener Tweens activos
                if (playerData.currentTween) {
                    playerData.currentTween.stop();
                    playerData.currentTween = null;
                }
                if (playerData.currentShadowTween) {
                    playerData.currentShadowTween.stop();
                    playerData.currentShadowTween = null;
                }
                gameScene.tweens.killTweensOf(player);
                gameScene.tweens.killTweensOf(shadow);

                // Detener animación
                MovePlayerController.stopAnimation(id, player, direction, gameScene);
            }
        });
        // Escuchar cuando un jugador sale
        socket.on("response:user_left_public_area", (data) => {
            RemovePlayerController.main(gameScene, data.socketId);
        });
    }
}

export default GameSceneSockets;