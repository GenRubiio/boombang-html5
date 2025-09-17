import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import DirectionEnum from "../../../enums/DirectionEnum.js";
import UserCocoAnimation from "../../animations/UserCocoAnimation.js";

class UserReceiveEffectController {
    static main(gameScene, data) {
        const user = gameScene.users[data.user_socket];
        if (!user) return;

        const effectData = window.avatar_effects_config[data.effect];
        if (!effectData) return;

        const spriteAvatar = user.spriteAvatar;
        const container = spriteAvatar.parentContainer;

        // Animación de idle
        UserIdleAnimation.main(
            spriteAvatar,
            DirectionEnum.DOWN,
            user.avatarId
        );

        // Crear sprite del efecto en la posición inicial
        const effect = gameScene.add.sprite(
            container.x + effectData.effect.positionOffset.x * 2,
            container.y + effectData.effect.positionOffset.y * 2,
            data.effect
        );
        effect.setDepth(container.depth + 1);
        effect.setScale(2);

        if (effectData.effect.avatarAnimation) {
            gameScene.time.delayedCall(
                effectData.effect.avatarAnimationStartTime,
                () => UserCocoAnimation.main(spriteAvatar, user.avatarId, gameScene)
            );
        }

        // Si queremos ajustar posición, entramos en modo controlador
        if (effectData.effect.show_controller) {
            this.#setController(gameScene, effect, container, data.effect);
            return;
        }

        // Reproducir animación una vez
        effect.play(data.effect);
        effect.once('animationcomplete', () => effect.destroy());

        // Control de visibilidad del avatar
        if (effectData.effect.hideAvatar) {
            gameScene.time.delayedCall(
                effectData.effect.avatarVisibilityFalseStartTime,
                () => container.setVisible(false)
            );
            gameScene.time.delayedCall(
                effectData.effect.avatarVisibilityTrueStartTime,
                () => container.setVisible(true)
            );
        }
    }

    static #setController(gameScene, effect, container, effectKey) {
        // Bucle infinito de la animación
        effect.play({ key: effectKey, repeat: -1 });

        // Texto para mostrar offset actual relativo al avatar
        const info = gameScene.add.text(10, 10, '', { font: '16px Arial', backgroundColor: '#000000AA' })
            .setScrollFactor(0)
            .setDepth(9999);

        const updateInfo = () => {
            const offsetX = Math.round(effect.x - container.x);
            const offsetY = Math.round(effect.y - container.y);
            info.setText(`Offset → x: ${offsetX}, y: ${offsetY}`);
        };
        updateInfo();

        // Botones para mover píxel a píxel
        const baseX = 10, baseY = 60, size = 30, pad = 5;
        const botones = [
            { label: '↑', dx: 0, dy: -1, x: baseX + size + pad, y: baseY },
            { label: '↓', dx: 0, dy: +1, x: baseX + size + pad, y: baseY + size * 2 },
            { label: '←', dx: -1, dy: 0, x: baseX, y: baseY + size },
            { label: '→', dx: +1, dy: 0, x: baseX + size * 2 + pad * 2, y: baseY + size }
        ];

        botones.forEach(btn => {
            gameScene.add.text(btn.x, btn.y, btn.label, { font: '20px Arial', backgroundColor: '#555' })
                .setInteractive()
                .setScrollFactor(0)
                .setDepth(9999)
                .on('pointerdown', () => {
                    effect.x += btn.dx;
                    effect.y += btn.dy;
                    updateInfo();
                });
        });

        // Flechas del teclado
        gameScene.input.keyboard.on('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp': effect.y -= 1; break;
                case 'ArrowDown': effect.y += 1; break;
                case 'ArrowLeft': effect.x -= 1; break;
                case 'ArrowRight': effect.x += 1; break;
                default: return;
            }
            updateInfo();
        });
    }
}

export default UserReceiveEffectController;
