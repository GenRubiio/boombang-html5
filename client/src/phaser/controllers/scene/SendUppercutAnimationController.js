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

        // Aplicar factor de escala para big_scene
        const scaleFactor = gameScene.sceneScaleFactor || 1;
        const tileWidth = 65 * gameConfig.DPI * scaleFactor;
        const tileHeight = 33 * gameConfig.DPI * scaleFactor;
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
        // Gameplay defect fix (2026-08-19): the legacy global-tint uppercut mechanism only ever
        // did anything for a baked (non-layered) sprite — it replaces a fixed placeholder hex
        // (0x11051C) baked into the OLD flat atlas art, which no layered avatar's pixels ever
        // contain, so this call was already a visual no-op for every migrated character
        // (AddUserController.safeApplyTint already skips it for the same reason on spawn: "the
        // global-tint uppercut mechanism below is superseded" for layered avatars, which paint
        // colorGuante as an ordinary palette slot in LayeredAvatar._applyFrame/_tintChild
        // instead). Guarded here too — same `isLayered` check `safeApplyTint` already uses —
        // because leaving it unguarded still attached one more rexColorReplacePipeline
        // post-pipeline instance to the Container on every single punch thrown (never cleared;
        // `TintManager.clearPart` is never called for the 'uppercut' part), an unbounded leak
        // over a long bot-fight session even though it never changed what was rendered.
        if (!attackerSprite || !attackerSprite.isLayered) {
            gameScene.tintMgr.changeUppercutColor(attackerSprite, data.uppercutSelected);
        }

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
