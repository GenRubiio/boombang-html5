import UserIdleAnimation from "../animations/UserIdleAnimation.js";
import UserUppercutAnimation from "../animations/UserUppercutAnimation.js";

class SendUppercutAnimationController {
    static main(gameScene, data) {
        const attacker = gameScene.players[data.attacker];
        const receiver = gameScene.players[data.receiver];
        if (!attacker || !receiver) return;

        // ===== DETENER Y REPOSICIONAR AL ATACANTE =====
        if (attacker.currentTween) {
            attacker.currentTween.stop();
            attacker.currentTween = null;
        }
        gameScene.tweens.killTweensOf(attacker.playerContainer);
        attacker.path = [];
        attacker.pathIndex = 0;

        const tileWidth = 65;
        const tileHeight = 33;
        const attackerFinalX = (attacker.position.x - attacker.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const attackerFinalY = (attacker.position.x + attacker.position.y) * (tileHeight / 2);

        attacker.playerContainer.setPosition(attackerFinalX, attackerFinalY);
        attacker.playerContainer.setDepth(attackerFinalY);
        attacker.sprite_shadow.setPosition(0, 0);
        attacker.sprite_player.setPosition(
            0,
            -(attacker.sprite_shadow.displayHeight / 2) - (attacker.sprite_player.displayHeight / 2) + 15
        );

        // ===== DETENER Y REPOSICIONAR AL RECEPTOR =====
        if (receiver.currentTween) {
            receiver.currentTween.stop();
            receiver.currentTween = null;
        }
        gameScene.tweens.killTweensOf(receiver.playerContainer);
        receiver.path = [];
        receiver.pathIndex = 0;

        const receiverFinalX = (receiver.position.x - receiver.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const receiverFinalY = (receiver.position.x + receiver.position.y) * (tileHeight / 2);

        receiver.playerContainer.setPosition(receiverFinalX, receiverFinalY);
        receiver.playerContainer.setDepth(receiverFinalY);
        receiver.sprite_shadow.setPosition(0, 0);
        receiver.sprite_player.setPosition(
            0,
            -(receiver.sprite_shadow.displayHeight / 2) - (receiver.sprite_player.displayHeight / 2) + 15
        );

        // Ahora ambos están forzados a la posición lógica del servidor
        // Ajustar el frame idle del atacante antes de la animación
        UserIdleAnimation.main(
            attacker.sprite_player,
            attacker.position.z,
            attacker.avatar_id
        );

        const attackerSprite = attacker.sprite_player;
        const receiverSprite = receiver.sprite_player;

        // Animación de uppercut del atacante
        UserUppercutAnimation.main(
            attackerSprite,
            data.direction,
            true,
            attacker.avatar_id
        );

        attackerSprite.once("animationcomplete", () => {
            UserIdleAnimation.main(
                attacker.sprite_player,
                attacker.position.z,
                attacker.avatar_id
            );
        });

        // Animación de recibir golpe del receptor
        UserUppercutAnimation.main(
            receiverSprite,
            data.direction,
            false,
            receiver.avatar_id
        );
    }
}

export default SendUppercutAnimationController;
