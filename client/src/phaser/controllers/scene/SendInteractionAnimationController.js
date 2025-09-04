import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserInteractionAnimation from "../../animations/UserInteractionAnimation.js";

class SendInteractionAnimationController {
    static main(gameScene, data) {
        const receiverUser = gameScene.users[data.receiverUser];
        const senderUser = gameScene.users[data.senderUser];
        if (!receiverUser || !senderUser) return;

        // ===== DETENER Y REPOSICIONAR AL ATACANTE =====
        if (receiverUser.currentTween) {
            receiverUser.currentTween.stop();
            receiverUser.currentTween = null;
        }
        gameScene.tweens.killTweensOf(receiverUser.containerUser);
        receiverUser.path = [];
        receiverUser.pathIndex = 0;

        const tileWidth = 65;
        const tileHeight = 33;
        const receiverUserFinalX = (receiverUser.position.x - receiverUser.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const receiverUserFinalY = (receiverUser.position.x + receiverUser.position.y) * (tileHeight / 2);

        receiverUser.containerUser.setPosition(receiverUserFinalX, receiverUserFinalY);
        receiverUser.containerUser.setDepth(receiverUserFinalY);

        // ===== DETENER Y REPOSICIONAR AL RECEPTOR =====
        if (senderUser.currentTween) {
            senderUser.currentTween.stop();
            senderUser.currentTween = null;
        }
        gameScene.tweens.killTweensOf(senderUser.containerUser);
        senderUser.path = [];
        senderUser.pathIndex = 0;

        const senderUserFinalX = (senderUser.position.x - senderUser.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const senderUserFinalY = (senderUser.position.x + senderUser.position.y) * (tileHeight / 2);

        senderUser.containerUser.setPosition(senderUserFinalX, senderUserFinalY);
        senderUser.containerUser.setDepth(senderUserFinalY);


        // Ahora ambos están forzados a la posición lógica del servidor
        // Ajustar el frame idle del atacante antes de la animación
        UserIdleAnimation.main(
            receiverUser.spriteAvatar,
            receiverUser.position.z,
            receiverUser.avatarId
        );

        const receiverUserSprite = receiverUser.spriteAvatar;
        const senderUserSprite = senderUser.spriteAvatar;

        UserInteractionAnimation.main(
            receiverUserSprite,
            data.direction,
            true,
            receiverUser.avatarId,
            gameScene,
            data.interactionType
        );

        UserInteractionAnimation.main(
            senderUserSprite,
            data.direction,
            false,
            senderUser.avatarId,
            gameScene,
            data.interactionType
        );

        receiverUserSprite.once("animationcomplete", () => {
            UserIdleAnimation.main(
                receiverUser.spriteAvatar,
                receiverUser.position.z,
                receiverUser.avatarId
            );
        });

        senderUserSprite.once("animationcomplete", () => {
            UserIdleAnimation.main(
                senderUser.spriteAvatar,
                senderUser.position.z,
                senderUser.avatarId
            );
        });
    }
}

export default SendInteractionAnimationController;
