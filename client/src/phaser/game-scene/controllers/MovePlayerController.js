class MovePlayerController {
    static main(gameScene, id, path) {
        if (!path || path.length === 0 || !gameScene.players[id]) return;

        const playerData = gameScene.players[id];
        const { player, shadow } = playerData;
        const tileWidth = 65;
        const tileHeight = 33;

        // Detener y eliminar correctamente los tweens existentes
        if (playerData.currentTween) {
            playerData.currentTween.stop();
            playerData.currentTween = null;
        }
        if (playerData.currentShadowTween) {
            playerData.currentShadowTween.stop();
            playerData.currentShadowTween = null;
        }
        gameScene.tweens.killTweensOf(player);
        gameScene.tweens.killTweensOf(shadow);

        // Guardar el path y reiniciar el índice
        playerData.path = path;
        playerData.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(id, gameScene);
    }

    static moveToNextStep(id, gameScene) {
        const playerData = gameScene.players[id];
        if (!playerData) return;

        const { player, shadow, path, pathIndex } = playerData;

        if (pathIndex >= path.length) {
            // Ha llegado al destino
            playerData.currentTween = null;
            playerData.currentShadowTween = null;
            return;
        }

        const step = path[pathIndex];
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualizar la posición del jugador
        playerData.position = { x: step.x, y: step.y };

        // Tween para la sombra
        const shadowTween = gameScene.tweens.add({
            targets: shadow,
            x: centerX,
            y: centerY,
            duration: 300,
            onUpdate: () => {
                shadow.setDepth(shadow.y);
            }
        });

        // Tween para el personaje
        const playerTween = gameScene.tweens.add({
            targets: player,
            x: centerX,
            y: centerY - (shadow.displayHeight / 2) - (player.displayHeight / 2),
            duration: 300,
            onUpdate: () => {
                player.setDepth(shadow.y);
            },
            onComplete: () => {
                // Al completar el movimiento, avanzar al siguiente paso
                playerData.pathIndex++;
                this.moveToNextStep(id, gameScene);
            }
        });

        // Almacenar los tweens actuales
        playerData.currentTween = playerTween;
        playerData.currentShadowTween = shadowTween;
    }
}

export default MovePlayerController;