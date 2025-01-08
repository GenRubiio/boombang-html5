import MovePlayerToTileController from "./MovePlayerToTileController.js";
import UserIdleAnimation from "../animations/UserIdleAnimation.js";
import PlayerModel from "../../models/PlayerModel.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";

class AddPlayerController {
    static async main(gameScene, playerData) {
        if (gameScene.players[playerData.id]) return;
        const { playerContainer, spritePlayer, spriteShadow } = this.createPlayerContainer(gameScene, playerData);

        const playerModel = new PlayerModel(playerData, spritePlayer, spriteShadow, playerContainer);

        MovePlayerToTileController.main(gameScene, playerModel);

        // Almacenar jugador
        gameScene.players[playerData.id] = playerModel;
    }

    static createPlayerContainer(gameScene, playerData) {
        // Crear sombra
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        spriteShadow.setDepth(0);
        spriteShadow.setInteractive({ useHandCursor: true });
        spriteShadow.playerSocketId = playerData.id;

        //remove listener if already exists
        spriteShadow.removeAllListeners();
        spriteShadow.on('pointerdown', () => {
            const clickedPlayer = gameScene.players[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                console.log("Jugador clickeado: ", clickedPlayer);
                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }
        });

        // Crear personaje
        const spritePlayer = gameScene.add.sprite(0, 0, "player");
        UserIdleAnimation.main(
            gameScene,
            playerData.id,
            spritePlayer,
            playerData.z,
            playerData.avatar_id
        );
        spritePlayer.setDepth(1);

        // Crear contenedor
        const playerContainer = gameScene.add.container(0, 0, [spriteShadow, spritePlayer]);
        playerContainer.setSize(spritePlayer.width, spritePlayer.height + spriteShadow.height);

        return { playerContainer, spritePlayer, spriteShadow };
    }
}

export default AddPlayerController;