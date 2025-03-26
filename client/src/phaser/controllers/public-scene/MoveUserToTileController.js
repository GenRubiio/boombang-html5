class MoveUserToTileController {
    static main(gameScene, playerModel) {
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla en la cuadrícula isométrica
        const centerX = (playerModel.position.x - playerModel.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (playerModel.position.x + playerModel.position.y) * (tileHeight / 2);

        // Posicionar el contenedor del jugador
        playerModel.playerContainer.setPosition(centerX, centerY);

        // Actualizar profundidad en base a la posición Y
        playerModel.playerContainer.setDepth(centerY);

        // Si necesitas ajustes adicionales:
        playerModel.sprite_shadow.setPosition(0, 0);
        playerModel.sprite_player.setPosition(
            0,
            -(playerModel.sprite_shadow.displayHeight / 2) - (playerModel.sprite_player.displayHeight / 2) + 15
        );
    }
}

export default MoveUserToTileController;
