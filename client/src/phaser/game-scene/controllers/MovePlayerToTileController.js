class MovePlayerToTileController {
    static main(gameScene, position, player, shadow) {
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla del tile en la cuadrícula isométrica
        const centerX = (position.x - position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (position.x + position.y) * (tileHeight / 2);

        // Posicionar sombra
        shadow.setPosition(centerX, centerY);
        shadow.setDepth(centerY);

        // Posicionar personaje encima de la sombra
        const playerX = centerX;
        const playerY = centerY - (shadow.displayHeight / 2) - (player.displayHeight / 2);
        player.setPosition(playerX, playerY);
        player.setDepth(centerY);
    }
}

export default MovePlayerToTileController;