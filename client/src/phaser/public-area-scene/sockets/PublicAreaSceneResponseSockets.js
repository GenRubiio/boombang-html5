import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";
import RemovePlayerController from "../controllers/RemovePlayerController";
import AddPlayerController from "../controllers/AddPlayerController";
import CreateSceneController from "../controllers/CreateSceneController";
import UserSelectUserController from "../../controllers/UserSelectUserController";
import UserUpdatePositionController from "../../controllers/UserUpdatePositionController";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import RemoveUserAreaController from "../controllers/RemoveUserAreaController";
import SendUppercutAnimationController from "../../controllers/SendUppercutAnimationController";
import UserMoveDeniedController from "../../controllers/UserMoveDeniedController";
import SendEmojiController from "../../controllers/SendEmojiController";
import UserSendChatController from "../../controllers/UserSendChatController";

class PublicAreaSceneResponseSockets {
    static main(gameScene) {
        // Escuchar respuesta con datos de la sala
        socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
            gameScene.avatarAnimations = data.avatar_animations; // Guardar animaciones de avatares
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

        socket.on(ResponseSocketsEnum.USER_MOVE_DENIED, (data) => {
            const { id } = data;
            UserMoveDeniedController.main(gameScene, id);
        });
  
        socket.on(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, (data) => {
            RemovePlayerController.main(gameScene, data.socketId);
        });

        socket.on(ResponseSocketsEnum.USER_SELECT_USER, (data) => {
            //console.log('User select user', data);
            UserSelectUserController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_UPDATE_POSITION, (data) => {
            UserUpdatePositionController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.REMOVE_USER_AREA, () => {
            RemoveUserAreaController.main(gameScene);
        });

        socket.on(ResponseSocketsEnum.SEND_UPPERCUT, (data) => {
            SendUppercutAnimationController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SEND_EMOJI, (data) => {
            SendEmojiController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SEND_CHAT, (data) => {
            UserSendChatController.main(gameScene, data);
        });
    }
}

export default PublicAreaSceneResponseSockets;