import AnimationUtils from "../../utils/AnimationUtils.js";
class UserUppercutAnimation {
    static main(spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            const textureKey = direction + "_punch_doy";
            AnimationUtils.setSpriteConfig(spritePlayer, avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey, true);

            //this.changeColor(spritePlayer);
        }
        else {
            const textureKey = direction + "_punch_rec";
            AnimationUtils.setSpriteConfig(spritePlayer, avatarId, textureKey);
            spritePlayer.play(avatarId + "_" + textureKey, true);

            // Detectar el frame 5 para iniciar el uppercut
            spritePlayer.on('animationupdate', (anim, frame) => {
                if (anim.key === avatarId + "_" + textureKey && frame.index === 160) {
                    this.launchUpwards(spritePlayer);
                }
            });
        }
    }

    static changeColor(spritePlayer){
        // Genera un color aleatorio
        const randomColor = Phaser.Display.Color.RandomRGB().color;

        // Aplica el efecto de reemplazo de color
        spritePlayer.scene.plugins.get('rexcolorreplacepipelineplugin').add(spritePlayer, {
            originalColor: 0xFF0000, // Color original a reemplazar (rojo)
            newColor: randomColor,   // Nuevo color aleatorio
            epsilon: 0.3             // Tolerancia de comparación de colores
        });
    }

    static launchUpwards(spritePlayer) {
        // Verificamos que el sprite pertenezca a una escena
        if (!spritePlayer.scene) return;

        // Aplicamos un tween para que el personaje salga volando hacia arriba
        spritePlayer.scene.tweens.add({
            targets: spritePlayer,
            y: spritePlayer.y - 500, // Mueve 500px hacia arriba
            duration: 800, // Duración de la animación
            ease: 'Power2', // Efecto de aceleración suave
            onComplete: () => {
                spritePlayer.setVisible(false); // Oculta el sprite al salir de pantalla
            }
        });
    }
}

export default UserUppercutAnimation;