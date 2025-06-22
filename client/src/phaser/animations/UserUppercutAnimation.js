import AnimationUtils from "../../utils/AnimationUtils.js";
import UserEmojiAnimation from "./UserEmojiAnimation.js";
class UserUppercutAnimation {
    static main(spriteAvatar, direction, attacker, avatarId, gameScene) {
        if (UserEmojiAnimation.isFlying(spriteAvatar)) {
            UserEmojiAnimation.cancelFly(spriteAvatar, gameScene);
        }
        if (attacker) {
            const textureKey = direction + "_punch_doy";
            AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
            spriteAvatar.play(avatarId + "_" + textureKey, true);

            //this.changeColor(spriteAvatar);
        }
        else {
            const textureKey = direction + "_punch_rec";
            AnimationUtils.setSpriteConfig(spriteAvatar, avatarId, textureKey);
            spriteAvatar.play(avatarId + "_" + textureKey, true);

            // Detectar el frame 5 para iniciar el uppercut
            spriteAvatar.on('animationupdate', (anim, frame) => {
                if (anim.key === avatarId + "_" + textureKey && frame.index === 160) {
                    this.launchUpwards(spriteAvatar);
                }
            });
        }
    }

    static changeColor(spriteAvatar) {
        // Genera un color aleatorio
        const randomColor = Phaser.Display.Color.RandomRGB().color;

        // Aplica el efecto de reemplazo de color
        spriteAvatar.scene.plugins.get('rexcolorreplacepipelineplugin').add(spriteAvatar, {
            originalColor: 0xFF0000, // Color original a reemplazar (rojo)
            newColor: randomColor,   // Nuevo color aleatorio
            epsilon: 0.3             // Tolerancia de comparación de colores
        });
    }

    static launchUpwards(spriteAvatar) {
        // Verificamos que el sprite pertenezca a una escena
        if (!spriteAvatar.scene) return;

        // Aplicamos un tween para que el personaje salga volando hacia arriba
        spriteAvatar.scene.tweens.add({
            targets: spriteAvatar,
            y: spriteAvatar.y - 500, // Mueve 500px hacia arriba
            duration: 800, // Duración de la animación
            ease: 'Power2', // Efecto de aceleración suave
            onComplete: () => {
                spriteAvatar.setVisible(false); // Oculta el sprite al salir de pantalla
            }
        });
    }
}

export default UserUppercutAnimation;