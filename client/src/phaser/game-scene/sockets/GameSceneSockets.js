import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";

class GameSceneSockets {
    static main(gameScene) {
        socket.on("response:user_move", (data) => {
            const { id, path } = data;
            if (gameScene.players[id]) {
                console.log(`Moving player ${id} to path:`, path);
                MovePlayerController.main(gameScene, id, path);
            }
        });
    }
}

export default GameSceneSockets;