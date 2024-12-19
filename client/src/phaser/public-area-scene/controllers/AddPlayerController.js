import MovePlayerToTileController from "./MovePlayerToTileController.js";
import UserIdleAnimation from "../animations/UserIdleAnimation.js";
import AnimationsController from "./AnimationsController.js";
import PlayerModel from "../../models/PlayerModel.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io
import RequestSocketsEnum from "../../enums/RequestSocketsEnum";

class AddPlayerController {
    static async main(gameScene, playerData) {
        if (gameScene.players[playerData.id]) return;
        await AnimationsController.main(gameScene, playerData); // Inicializar animaciones

        const spriteShadow = this.createSpriteShadow(gameScene, playerData);
        this.eventShadowClick(spriteShadow, gameScene);
        const spritePlayer = this.createSpritePlayer(gameScene, playerData);

        const playerModel = new PlayerModel({
            socketId: playerData.id,
            position: {
                x: playerData.x,
                y: playerData.y,
                z: playerData.z
            },
            avatar_id: playerData.avatar_id,
            animations: playerData.animations,
            sprite_player: spritePlayer,
            sprite_shadow: spriteShadow
        });

        MovePlayerToTileController.main(gameScene, playerModel);

        // Almacenar jugador
        gameScene.players[playerData.id] = playerModel;
    }

    static createSpritePlayer(gameScene, playerData) {
        // Crear personaje
        //const player = gameScene.add.sprite(0, 0, "player_spritesheet");
        const spritePlayer = gameScene.add.sprite(0, 0, "player_" + playerData.id);
        UserIdleAnimation.setDefaultFrame(gameScene, playerData.id, spritePlayer, playerData.z, playerData.avatar_id);
        spritePlayer.setDepth(1);
        return spritePlayer;
    }

    static createSpriteShadow(gameScene, playerData) {
        // Crear sombra
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        spriteShadow.setDepth(0);
        spriteShadow.playerSocketId = playerData.id;
        return spriteShadow;
    }

    static eventShadowClick(spriteShadow, gameScene) {
        // Configurar evento de clic en la sombra
        spriteShadow.setInteractive(); // Hacer interactiva la sombra
        spriteShadow.removeListener("pointerdown");
        spriteShadow.on('pointerdown', () => {
            const clickedPlayer = gameScene.players[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                console.log("Jugador clickeado: ", clickedPlayer);
                console.log(`Jugador clickeado: ID=${spriteShadow.playerSocketId}`);
                // Aquí puedes hacer algo con el jugador, como mostrar su nombre

                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }
        });
    }
}

export default AddPlayerController;