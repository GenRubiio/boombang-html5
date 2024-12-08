class AnimationsController {
    static async main(gameScene, animations) {
        await this.playerAnimations(gameScene, animations);
    }

    static async playerAnimations(gameScene,animations) {
        if (animations.walk) {
            await this.walkAnimations(gameScene, animations.walk);
        }
    }

    static async walkAnimations(gameScene, animations) {
        for (const animation of animations) {
            const { key, base64, frames, frameRate, frameWidth, frameHeight, repeat } = animation;

            // Cargar imagen base64 con dimensiones específicas
            if (!gameScene.textures.exists(key)) {
                await this.loadBase64Image(gameScene, key, base64, frameWidth, frameHeight);
            }

            // Crear la animación si no existe
            if (!gameScene.anims.exists(key)) {
                console.log(`Creating animation: ${key}`);
                gameScene.anims.create({
                    key: key,
                    frames: gameScene.anims.generateFrameNumbers(key, frames),
                    frameRate: frameRate,
                    repeat: repeat
                });
            }
        }
    }

    // Método para cargar imágenes base64 con tamaño
    static loadBase64Image(gameScene, key, base64, frameWidth, frameHeight) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                gameScene.textures.addSpriteSheet(key, img, {
                    frameWidth: frameWidth,
                    frameHeight: frameHeight,
                });
                resolve();
            };
        });
    }
}

export default AnimationsController;
