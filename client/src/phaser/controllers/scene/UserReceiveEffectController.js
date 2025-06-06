
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import DirectionEnum from "../../../enums/DirectionEnum.js";

class UserReceiveEffectController {
    static main(gameScene, data) {
        const user = gameScene.users[data.user_socket];
        if (!user) return;

        let effectData = window.avatar_effects_config[data.effect];
        if (!effectData) return;

        UserIdleAnimation.main(
            user.spriteAvatar,
            DirectionEnum.DOWN,
            user.avatarId
        );

        let spriteAvatar = user.spriteAvatar;
        const container = spriteAvatar.parentContainer;

        // Crear sprite del efecto en la posición deseada
        const effect = gameScene.add.sprite(
            container.x + effectData.effect.positionOffset.x,
            container.y + effectData.effect.positionOffset.y,
            data.effect
        );

        // Asegurarte de que el efecto esté por encima del avatar
        effect.setDepth(container.depth);

        // Reproducir la animación
        effect.play(data.effect);

        // Destruir el sprite del efecto cuando termine la animación
        effect.once('animationcomplete', () => {
            effect.destroy();
        });

        if (!effectData.effect.hideAvatar) {
            // Si no se especifica que se oculte el avatar, no hacemos nada más
            return;
        }

        // 2 segundos después de lanzar el efecto, ocultar el avatar
        gameScene.time.delayedCall(effectData.effect.avatarVisibilityFalseStartTime, () => {
            // Si tu avatar está dentro de un container:
            container.setVisible(false);
            // Si en lugar de un container quieres ocultar solo el sprite:
            // sprite.setVisible(false);
        });

        // 4 segundos después de lanzar el efecto (es decir, 2 segundos tras ocultarlo), volver a mostrar el avatar
        gameScene.time.delayedCall(effectData.effect.avatarVisibilityTrueStartTime, () => {
            container.setVisible(true);
            // o sprite.setVisible(true);
        });
    }
}

export default UserReceiveEffectController;
