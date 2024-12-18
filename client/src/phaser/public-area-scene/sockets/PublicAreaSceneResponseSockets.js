import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";
import RemovePlayerController from "../controllers/RemovePlayerController";
import AddPlayerController from "../controllers/AddPlayerController";
import CreateSceneController from "../controllers/CreateSceneController";
import UserSelectUserController from "../controllers/UserSelectUserController";
import UserUpdatePositionController from "../controllers/UserUpdatePositionController";
import ResponseSocketsEnum from "../../enums/ResponseSocketsEnum";
import RemoveUserAreaController from "../controllers/RemoveUserAreaController";

class PublicAreaSceneResponseSockets {
    static main(gameScene) {
        // Escuchar respuesta con datos de la sala
        socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, (data) => {
            CreateSceneController.main(gameScene, data.players); // Crear escena con jugadores
        });
        // Escuchar cuando un nuevo jugador entra
        socket.on(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_AREA, (data) => {
            AddPlayerController.main(gameScene, data.user);
        });
        // Escuchar cuando un jugador se mueve
        socket.on(ResponseSocketsEnum.USER_MOVE, (data) => {
            const { id, path } = data;
            if (gameScene.players[id]) {
                console.log(`Moving player ${id} to path:`, path);
                console.log(`Is last step: ${data.isLastStep}`);
                MovePlayerController.main(gameScene, id, path, data.isLastStep);
            }
        });
        socket.on(ResponseSocketsEnum.USER_MOVE_DENIED, (data) => {
            const { id } = data;
            if (gameScene.players[id]) {
                const playerModel = gameScene.players[id];
                const spritePlayer = playerModel.sprite_player;
                const spriteShadow = playerModel.sprite_shadow;
                const direction = playerModel.position.z;

                // Detener Tweens activos
                if (playerModel.currentTween) {
                    playerModel.currentTween.stop();
                    playerModel.currentTween = null;
                }
                if (playerModel.currentShadowTween) {
                    playerModel.currentShadowTween.stop();
                    playerModel.currentShadowTween = null;
                }
                gameScene.tweens.killTweensOf(spritePlayer);
                gameScene.tweens.killTweensOf(spriteShadow);

                // Detener animación
                MovePlayerController.stopAnimation(id, spritePlayer, direction);
            }
        });
        // Escuchar cuando un jugador sale
        socket.on(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, (data) => {
            RemovePlayerController.main(gameScene, data.socketId);
        });

        socket.on(ResponseSocketsEnum.USER_SELECT_USER, (data) => {
            UserSelectUserController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.USER_UPDATE_POSITION, (data) => {
            UserUpdatePositionController.main(gameScene, data);
        });

        socket.on(ResponseSocketsEnum.REMOVE_USER_AREA, () => {
            RemoveUserAreaController.main(gameScene);
        });
    }
}

export default PublicAreaSceneResponseSockets;