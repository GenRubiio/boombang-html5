class MovePlayerToTileController {
    static main(gameScene, playerModel) {
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla del tile en la cuadrícula isométrica
        const centerX = (playerModel.position.x - playerModel.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (playerModel.position.x + playerModel.position.y) * (tileHeight / 2);

        // Posicionar sombra
        playerModel.sprite_shadow.setPosition(centerX, centerY);
        playerModel.sprite_shadow.setDepth(centerY);

        // Posicionar personaje encima de la sombra, ajustando la distancia
        const playerX = centerX;
        const playerY = centerY - (playerModel.sprite_shadow.displayHeight / 2) - (playerModel.sprite_player.displayHeight / 2) + 15; // Ajustar distancia
        playerModel.sprite_player.setPosition(playerX, playerY);
        playerModel.sprite_player.setDepth(centerY);
    }
}

export default MovePlayerToTileController;
