class AnimationsController {
    static async main(gameScene, animations) {
        await this.playerAnimations(gameScene, animations);
    }

    static async playerAnimations(gameScene, animations) {
        if (animations.walk) {
            await this.animations(gameScene, animations.walk);
        }
        if (animations.interaction) {
            await this.animations(gameScene, animations.interaction);
        }
    }

    static async animations(gameScene, animations) {
        for (const animation of animations) {
            const { key, base64, frames, frameRate, frameWidth, frameHeight, has_atlas, atlas, repeat } = animation;

            if (!gameScene.textures.exists(key)) {
                console.log(`Loading image for key: ${key}`);

                if (has_atlas) {
                    // Usar el atlas
                    await this.loadAtlasImage(gameScene, key, base64, atlas);
                } else {
                    // Usar la antigua forma de spritesheet
                    await this.loadBase64Image(gameScene, key, base64, frameWidth, frameHeight);
                }
            }

            // Crear la animación si no existe
            if (!gameScene.anims.exists(key)) {
                console.log(`Creating animation: ${key}`);

                let animFrames;

                if (has_atlas) {
                    // Si sabes que tus frames en el atlas se llaman por índice (ej: "frame_0", "frame_1", ...)
                    // usa generateFrameNames
                    animFrames = gameScene.anims.generateFrameNames(key, {
                        start: frames.start,
                        end: frames.end,
                        // Ajusta prefix y zeroPad según la convención de nombres en tu atlas.
                        // Por ejemplo, si tus frames en el atlas se llaman "left_punch_doy_0000", "left_punch_doy_0001", etc.:
                        prefix: '',
                        zeroPad: 0
                    });
                } else {
                    // Spritesheet normal
                    animFrames = gameScene.anims.generateFrameNumbers(key, frames);
                }

                gameScene.anims.create({
                    key: key,
                    frames: animFrames,
                    frameRate: frameRate,
                    repeat: repeat
                });
            }
        }
    }

    // Método para cargar imágenes base64 con tamaño (spritesheet)
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

    // Método para cargar atlas en memoria
    static loadAtlasImage(gameScene, key, base64, atlasJsonStr) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const atlasData = JSON.parse(atlasJsonStr);
                // Añade el atlas como textura. Esto creará frames con nombres específicos
                // según lo que defina atlasData.frames
                gameScene.textures.addAtlas(key, img, atlasData);
                resolve();
            };
        });
    }

    // Este método extrae el prefijo común de los frames del atlas
    // Suponiendo que todos los frames se llamen algo como "left_punch_doy_0000"
    static getFramePrefixFromAtlas(atlasData) {
        const frameNames = Object.keys(atlasData.frames);
        if (frameNames.length === 0) return '';
        // Toma el primer frame y elimina los dígitos al final para obtener el prefix
        // Ejemplo: "left_punch_doy_0000" => prefix "left_punch_doy_"
        const firstFrame = frameNames[0];
        const match = firstFrame.match(/^(.*?_)0+$/);
        if (match && match[1]) {
            return match[1];
        }
        // Si no hay un patrón tan claro, deberás ajustarlo según tus nombres reales
        return '';
    }
}

export default AnimationsController;
