import socket from "../../sockets/socket"; // Conexión Socket.io
import UserSelectUserController from "../controllers/scene/UserSelectUserController";
import UserUpdatePositionController from "../controllers/scene/UserUpdatePositionController";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";
import SendUppercutAnimationController from "../controllers/scene/SendUppercutAnimationController";
import UserMoveDeniedController from "../controllers/scene/UserMoveDeniedController";
import UserSendEmojiController from "../controllers/scene/UserSendEmojiController";
import UserSendChatController from "../controllers/scene/UserSendChatController";
import MoveUserController from "../controllers/scene/MoveUserController";
import RemoveUserController from "../controllers/scene/RemoveUserController";
import AddUserController from "../controllers/scene/AddUserController";
import RemoveUserAreaController from "../controllers/scene/RemoveUserAreaController";
import UserReceiveEffectController from "../controllers/scene/UserReceiveEffectController";
import InteractionNotificationController from "../controllers/scene/InteractionNotificationController";
import SendInteractionAnimationController from "../controllers/scene/SendInteractionAnimationController";
import UserChangeAvatarController from "../controllers/scene/UserChangeAvatarController.js";

class SceneResponseSockets {
    static main(gameScene) {
        // Escuchar cuando un nuevo jugador entra
        socket.on(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, (data) => {
            AddUserController.main(gameScene, data.user);
        });

        // Escuchar cuando un jugador se mueve
        socket.on(ResponseSocketsEnum.USER_MOVE, (data) => {
            MoveUserController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_LEFT_PUBLIC_SCENE, (data) => {
            RemoveUserController.main(gameScene, data.socketId);
        });

        socket.on(ResponseSocketsEnum.REMOVE_USER_SCENE, () => {
            RemoveUserAreaController.main(gameScene);
        });

        socket.on(ResponseSocketsEnum.USER_MOVE_DENIED, (data) => {
            UserMoveDeniedController.main(gameScene, data.id);
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

        socket.on(ResponseSocketsEnum.USER_RECEIVE_EFFECT, (data) => {
            UserReceiveEffectController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_RECEIVE_INTERACTION, (data) => {
            InteractionNotificationController.create(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_CANCEL_INTERACTION, (data) => {
            InteractionNotificationController.remove(data.fromUser);
        });

        socket.on(ResponseSocketsEnum.USER_ACCEPT_INTERACTION, (data) => {
            InteractionNotificationController.remove(data.fromUser);
        });

        socket.on(ResponseSocketsEnum.USERS_INTERACTION, (data) => {
            SendInteractionAnimationController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_CHANGE_AVATAR, (data) => {
            UserChangeAvatarController.main(gameScene, data);
        });
    }
}

export default SceneResponseSockets;