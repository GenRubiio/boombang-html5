import socket from "../../sockets/socket"; // Conexión Socket.io
import MoveUserController from "../controllers/public-scene/MoveUserController";
import RemoveUserController from "../controllers/public-scene/RemoveUserController";
import AddUserController from "../controllers/public-scene/AddUserController";
import CreateSceneController from "../controllers/public-scene/CreateSceneController";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";
import RemoveUserAreaController from "../controllers/public-scene/RemoveUserAreaController";

class PublicSceneResponseSockets {
    static main(gameScene) {
        // Escuchar respuesta con datos de la sala
        socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
            await CreateSceneController.main(gameScene, data); // Crear escena con jugadores
            gameScene.vueComponent.$emit("updateLoading", false);
        });
        
        // Escuchar cuando un nuevo jugador entra
        socket.on(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_AREA, (data) => {
            AddUserController.main(gameScene, data.user);
        });

        // Escuchar cuando un jugador se mueve
        socket.on(ResponseSocketsEnum.USER_MOVE, (data) => {
            const { id, path } = data;
            if (gameScene.users[id]) {
                //console.log(`Moving player ${id} to path:`, path);
                //console.log(`Is last step: ${data.isLastStep}`);
                MoveUserController.main(gameScene, id, path, data.isLastStep);
            }
        });

        socket.on(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, (data) => {
            RemoveUserController.main(gameScene, data.socketId);
        });

        socket.on(ResponseSocketsEnum.REMOVE_USER_AREA, () => {
            RemoveUserAreaController.main(gameScene);
        });
    }
}

export default PublicSceneResponseSockets;