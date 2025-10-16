import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserUppercutAnimation from "../../animations/UserUppercutAnimation.js";
import gameConfig from "@/config/gameConfig.js";

class SendUppercutAnimationController {
    static main(gameScene, data) {
        const attacker = gameScene.users[data.attacker];
        const receiver = gameScene.users[data.receiver];
        if (!attacker || !receiver) return;

        // ===== DETENER Y REPOSICIONAR AL ATACANTE =====
        if (attacker.currentTween) {
            attacker.currentTween.stop();
            attacker.currentTween = null;
        }
        gameScene.tweens.killTweensOf(attacker.containerUser);
        attacker.path = [];
        attacker.pathIndex = 0;

        const tileWidth = 65 * gameConfig.DPI;
        const tileHeight = 33 * gameConfig.DPI;
        const attackerFinalX = (attacker.position.x - attacker.position.y) * (tileWidth / gameConfig.DPI) + gameScene.scale.width / gameConfig.DPI;
        const attackerFinalY = (attacker.position.x + attacker.position.y) * (tileHeight / gameConfig.DPI);

        attacker.containerUser.setPosition(attackerFinalX, attackerFinalY);
        attacker.containerUser.setDepth(attackerFinalY);
        //attacker.spriteShadow.setPosition(0, 0);
        //attacker.spriteAvatar.setPosition(
        //    0,
        //    -(attacker.spriteShadow.displayHeight / 2) - (attacker.spriteAvatar.displayHeight / 2) + 15 * 2
        //);

        // ===== DETENER Y REPOSICIONAR AL RECEPTOR =====
        if (receiver.currentTween) {
            receiver.currentTween.stop();
            receiver.currentTween = null;
        }
        gameScene.tweens.killTweensOf(receiver.containerUser);
        receiver.path = [];
        receiver.pathIndex = 0;

        const receiverFinalX = (receiver.position.x - receiver.position.y) * (tileWidth / gameConfig.DPI) + gameScene.scale.width / gameConfig.DPI;
        const receiverFinalY = (receiver.position.x + receiver.position.y) * (tileHeight / gameConfig.DPI);

        receiver.containerUser.setPosition(receiverFinalX, receiverFinalY);
        receiver.containerUser.setDepth(receiverFinalY);
        //receiver.spriteShadow.setPosition(0, 0);
        //receiver.spriteAvatar.setPosition(
        //    0,
        //    -(receiver.spriteShadow.displayHeight / 2) - (receiver.spriteAvatar.displayHeight / 2) + 15 * 2
        //);

        // Ahora ambos están forzados a la posición lógica del servidor
        // Ajustar el frame idle del atacante antes de la animación
        UserIdleAnimation.main(
            attacker.spriteAvatar,
            attacker.position.z,
            attacker.avatarId
        );

        const attackerSprite = attacker.spriteAvatar;
        const receiverSprite = receiver.spriteAvatar;

        // Animación de uppercut del atacante
        UserUppercutAnimation.main(
            attackerSprite,
            data.direction,
            true,
            attacker.avatarId,
            gameScene
        );
        gameScene.tintMgr.changeUppercutColor(attackerSprite, data.uppercutSelected);

        attackerSprite.once("animationcomplete", () => {
            UserIdleAnimation.main(
                attacker.spriteAvatar,
                attacker.position.z,
                attacker.avatarId
            );
        });

        // Animación de recibir golpe del receptor
        UserUppercutAnimation.main(
            receiverSprite,
            data.direction,
            false,
            receiver.avatarId,
            gameScene
        );
    }
}

export default SendUppercutAnimationController;
