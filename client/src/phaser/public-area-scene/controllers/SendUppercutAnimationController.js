import MovementUtil from "../utils/MovementUtil.js";

class SendUppercutAnimationController {
    static main(gameScene, data) {
        const attacker = gameScene.players[data.attacker];
        const receiver = gameScene.players[data.receiver];
        if (!attacker || !receiver) return;

        // Detener movimiento del atacante si está en curso
        if (attacker.currentTween) {
            attacker.currentTween.stop();
            attacker.currentTween = null;
        }
        if (attacker.currentShadowTween) {
            attacker.currentShadowTween.stop();
            attacker.currentShadowTween = null;
        }

        // Evitar que siga moviéndose
        attacker.path = [];
        attacker.pathIndex = 0;

        // Recalcular la posición final en píxeles
        const tileWidth = 65;
        const tileHeight = 33;
        const finalX = (attacker.position.x - attacker.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (attacker.position.x + attacker.position.y) * (tileHeight / 2);

        // Ajustar la posición de la sombra
        attacker.sprite_shadow.setPosition(finalX, finalY);
        attacker.sprite_shadow.setDepth(attacker.sprite_shadow.y);

        // Ajustar posición del jugador en base a la sombra (según tu lógica original)
        attacker.sprite_player.setPosition(
            finalX,
            finalY - (attacker.sprite_shadow.displayHeight / 2) - (attacker.sprite_player.displayHeight / 2) + 15
        );
        attacker.sprite_player.setDepth(attacker.sprite_shadow.y);

        // Ahora el jugador está en su posición final. Pon el frame idle antes de la animación
        MovementUtil.setDefaultFrame(data.attacker, attacker.sprite_player, attacker.position.z);

        const attackerSprite = attacker.sprite_player;
        const receiverSprite = receiver.sprite_player;

        // Reproducir la animación de golpe del atacante
        attackerSprite.play(data.attacker + "_" + data.direction + "_punch_doy_atlas_0");
        attackerSprite.on("animationcomplete", () => {
            MovementUtil.playDefaultFrame(data.attacker, attacker.sprite_player, attacker.position.z);
        });

        // Reproducir la animación de recibir golpe del receptor
        receiverSprite.play(data.receiver + "_" + data.direction + "_punch_rec_atlas_0");
    }
}

export default SendUppercutAnimationController;
