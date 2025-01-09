import socket from "../../../sockets/socket"; // Conexión Socket.io
import MovePlayerController from "../controllers/MovePlayerController";
import RemovePlayerController from "../controllers/RemovePlayerController";
import AddPlayerController from "../controllers/AddPlayerController";
import CreateSceneController from "../controllers/CreateSceneController";
import UserSelectUserController from "../controllers/UserSelectUserController";
import UserUpdatePositionController from "../controllers/UserUpdatePositionController";
import ResponseSocketsEnum from "../../../enums/ResponseSocketsEnum";
import RemoveUserAreaController from "../controllers/RemoveUserAreaController";
import SendUppercutAnimationController from "../controllers/SendUppercutAnimationController";

class PublicAreaSceneResponseSockets {
    static main(gameScene) {
        // Escuchar respuesta con datos de la sala
        socket.on(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, (data) => {
            gameScene.avatarAnimations = data.avatar_animations; // Guardar animaciones de avatares
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
                const avatarId = playerModel.avatar_id;
        
                // Detener Tweens activos del playerContainer
                if (playerModel.currentTween) {
                    playerModel.currentTween.stop();
                    playerModel.currentTween = null;
                }
                if (playerModel.currentShadowTween) {
                    playerModel.currentShadowTween.stop();
                    playerModel.currentShadowTween = null;
                }
                // Matar cualquier otro tween de sprites
                gameScene.tweens.killTweensOf(playerModel.playerContainer);
                gameScene.tweens.killTweensOf(spritePlayer);
                gameScene.tweens.killTweensOf(spriteShadow);
        
                // Forzar la posición del jugador en el mapa según (x, y)
                const tileWidth = 65;
                const tileHeight = 33;
                const finalX = (playerModel.position.x - playerModel.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
                const finalY = (playerModel.position.x + playerModel.position.y) * (tileHeight / 2);
        
                // Establecer posición y profundidad
                playerModel.playerContainer.setPosition(finalX, finalY);
                playerModel.playerContainer.setDepth(finalY);
        
                // Ajustar posiciones internas del sprite
                spriteShadow.setPosition(0, 0);
                spritePlayer.setPosition(
                    0,
                    -(spriteShadow.displayHeight / 2) - (spritePlayer.displayHeight / 2) + 15
                );
        
                // Detener animación actual y asegurar el frame idle
                MovePlayerController.stopAnimation(gameScene, id, spritePlayer, direction, avatarId);
        
                // Opcionalmente, si tienes una función específica para poner el frame idle
                // según la dirección actual, puedes llamarla aquí.
                // Por ejemplo:
                // UserIdleAnimation.main(spritePlayer, direction, playerModel.avatar_id);
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

        socket.on(ResponseSocketsEnum.SEND_UPPERCUT, (data) => {
            SendUppercutAnimationController.main(gameScene, data);
        });
    }
}

export default PublicAreaSceneResponseSockets;