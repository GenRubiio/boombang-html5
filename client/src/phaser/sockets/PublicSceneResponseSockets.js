import socket from "../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../public-scene/controllers/MovePlayerController";
import RemovePlayerController from "../public-scene/controllers/RemovePlayerController";
import AddPlayerController from "../public-scene/controllers/AddPlayerController";
import CreateSceneController from "../public-scene/controllers/CreateSceneController";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";
import RemoveUserAreaController from "../public-scene/controllers/RemoveUserAreaController";

class PublicSceneResponseSockets {
    static main(gameScene) {
        // Escuchar respuesta con datos de la sala
        socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
            await CreateSceneController.main(gameScene, data); // Crear escena con jugadores
            gameScene.vueComponent.$emit("updateLoading", false);
        });
        
        // Escuchar cuando un nuevo jugador entra
        socket.on(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_AREA, (data) => {
            AddPlayerController.main(gameScene, data.user);
        });

        // Escuchar cuando un jugador se mueve
        socket.on(ResponseSocketsEnum.USER_MOVE, (data) => {
            const { id, path } = data;
            if (gameScene.players[id]) {
                //console.log(`Moving player ${id} to path:`, path);
                //console.log(`Is last step: ${data.isLastStep}`);
                MovePlayerController.main(gameScene, id, path, data.isLastStep);
            }
        });

        socket.on(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, (data) => {
            RemovePlayerController.main(gameScene, data.socketId);
        });

        socket.on(ResponseSocketsEnum.REMOVE_USER_AREA, () => {
            RemoveUserAreaController.main(gameScene);
        });
    }
}

export default PublicSceneResponseSockets;