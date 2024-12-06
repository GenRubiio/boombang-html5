class MovePlayerController {
    static main(gameScene, id, path, isLastStep) {
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
        this.moveToNextStep(id, gameScene, isLastStep);
    }

    static moveToNextStep(id, gameScene, isLastStep) {
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
        playerData.position = { x: step.x, y: step.y, z: step.z };

        // Tween para la sombra
        const shadowTween = gameScene.tweens.add({
            targets: shadow,
            x: centerX,
            y: centerY,
            duration: 750,
            onUpdate: () => {
                shadow.setDepth(shadow.y);
            }
        });

        // Tween para el personaje
        const playerTween = gameScene.tweens.add({
            targets: player,
            x: centerX,
            y: centerY - (shadow.displayHeight / 2) - (player.displayHeight / 2) + 15,
            duration: 750,
            onUpdate: () => {
                //if player exists, update its depth
                if (!player) return;
                this.playAnimation(player, step.z);
                player.setDepth(shadow.y);
            },
            onComplete: () => {
                if (!player) return;
                // Al completar el movimiento, avanzar al siguiente paso
                if (isLastStep) {
                    this.stopAnimation(player, step.z);
                }
                else {
                    playerData.pathIndex++;
                    this.moveToNextStep(id, gameScene, isLastStep);
                }
            }
        });

        // Almacenar los tweens actuales
        playerData.currentTween = playerTween;
        playerData.currentShadowTween = shadowTween;
    }

    static playAnimation(player, direction) {
        switch (direction) {
            case 1:
                player.play("walk_down_left", true);
                break;
            case 2:
                player.play("walk_down", true);
                break;
            case 3:
                player.play("walk_down_right", true);
                break;
            case 4:
                player.play("walk_right", true);
                break;
            case 5:
                player.play("walk_up_right", true);
                break;
            case 6:
                player.play("walk_up", true);
                break;
            case 7:
                player.play("walk_up_left", true);
                break;
            case 8:
                player.play("walk_left", true);
                break;
        }
    }

    static stopAnimation(player, direction) {
        switch (direction) {
            case 1:
                player.setFrame(15);
                break;
            case 2:
                player.setFrame(63);
                break;
            case 3:
                player.setFrame(109);
                break;
            case 4:
                player.setFrame(125);
                break;
            case 5:
                player.setFrame(93);
                break;
            case 6:
                player.setFrame(47);
                break;
            case 7:
                player.setFrame(78);
                break;
            case 8:
                player.setFrame(31);
                break;
        }
        player.stop();
    }
}

export default MovePlayerController;