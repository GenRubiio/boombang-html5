import socket from "../../sockets/socket"; // Conexión Socket.io
import UserSelectUserController from "../controllers/scene/UserSelectUserController";
import UserUpdatePositionController from "../controllers/scene/UserUpdatePositionController";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";
import SendUppercutAnimationController from "../controllers/scene/SendUppercutAnimationController";
import UserMoveDeniedController from "../controllers/scene/UserMoveDeniedController";
import UserSendEmojiController from "../controllers/scene/UserSendEmojiController";
import UserSendChatController from "../controllers/scene/UserSendChatController";

class SceneResponseSockets {
    static main(gameScene) {
        socket.on(ResponseSocketsEnum.USER_MOVE_DENIED, (data) => {
            const { id } = data;
            UserMoveDeniedController.main(gameScene, id);
        });

        socket.on(ResponseSocketsEnum.USER_SELECT_USER, (data) => {
            //console.log('User select user', data);
            UserSelectUserController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_UPDATE_POSITION, (data) => {
            UserUpdatePositionController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SEND_UPPERCUT, (data) => {
            SendUppercutAnimationController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SEND_EMOJI, (data) => {
            UserSendEmojiController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.SEND_CHAT, (data) => {
            UserSendChatController.main(gameScene, data);
        });
    }
}

export default SceneResponseSockets;