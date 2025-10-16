import gameConfig from "@/config/gameConfig.js";

class MoveUserToTileController {
    static main(gameScene, user) {
        const tileWidth = 65 * gameConfig.DPI;
        const tileHeight = 33 * gameConfig.DPI;

        // Calcular posición en pantalla en la cuadrícula isométrica
        const centerX = (user.position.x - user.position.y) * (tileWidth / gameConfig.DPI) + gameScene.scale.width / gameConfig.DPI;
        const centerY = (user.position.x + user.position.y) * (tileHeight / gameConfig.DPI);

        // Posicionar el contenedor del jugador
        user.containerUser.setPosition(centerX, centerY);

        // Actualizar profundidad en base a la posición Y
        user.containerUser.setDepth(centerY);

        // Si necesitas ajustes adicionales:
        user.spriteShadow.setPosition(0, 0);
        //user.spriteAvatar.setPosition(
        //    0,
        //    -(user.spriteShadow.displayHeight / 2) - (user.spriteAvatar.displayHeight / 2)
        //);
    }
}

export default MoveUserToTileController;
