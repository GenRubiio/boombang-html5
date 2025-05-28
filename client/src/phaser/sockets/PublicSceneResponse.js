import socket from "../../sockets/socket"; // Conexión Socket.io
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum"; // Enum de respuestas
import ItemSpawnPublicSceneController from "../controllers/public-scene/ItemSpawnPublicSceneController"; // Controlador de aparición de items
import RemoveItemPublicSceneController from "../controllers/public-scene/ItemRemovePublicSceneController"; // Controlador de eliminación de items
import ItemCollectPublicSceneController from "../controllers/public-scene/ItemCollectPublicSceneController"; // Controlador de recolección de items

class PublicSceneResponse {
    static main(gameScene) {
        socket.on(ResponseSocketsEnum.SCENE_OBJECT_SPAWNED, (data) => {
            ItemSpawnPublicSceneController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SCENE_OBJECT_REMOVED, (data) => {
            RemoveItemPublicSceneController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SCENE_OBJECT_COLLECTED, (data) => {
            ItemCollectPublicSceneController.main(gameScene, data);
        });
    }
}

export default PublicSceneResponse;