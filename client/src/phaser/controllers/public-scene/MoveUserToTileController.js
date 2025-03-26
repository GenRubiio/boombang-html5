class MoveUserToTileController {
    static main(gameScene, user) {
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla en la cuadrícula isométrica
        const centerX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (user.position.x + user.position.y) * (tileHeight / 2);

        // Posicionar el contenedor del jugador
        user.containerUser.setPosition(centerX, centerY);

        // Actualizar profundidad en base a la posición Y
        user.containerUser.setDepth(centerY);

        // Si necesitas ajustes adicionales:
        user.spriteShadow.setPosition(0, 0);
        user.spriteAvatar.setPosition(
            0,
            -(user.spriteShadow.displayHeight / 2) - (user.spriteAvatar.displayHeight / 2) + 15
        );
    }
}

export default MoveUserToTileController;
