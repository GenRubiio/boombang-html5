class AnimationsController {
    static async main(gameScene, playerData) {
        const animationsData = gameScene.avatarAnimations[playerData.avatar_id];
        await this.playerAnimations(gameScene, playerData.animations, animationsData);
    }

    static async playerAnimations(gameScene, animations, animationsData) {
        // Cargamos en paralelo los dos tipos de animaciones (walk, interaction) si existen
        const tasks = [];

        if (animations.walk) {
            tasks.push(this.animations(gameScene, animations.walk, animationsData));
        }
        if (animations.interaction) {
            tasks.push(this.animations(gameScene, animations.interaction, animationsData));
        }

        await Promise.all(tasks);
    }

    static async animations(gameScene, animations, animationsData) {
        // Cargar y crear todas las animaciones en paralelo
        // De esta manera, evitamos bloqueos secuenciales
        const tasks = animations.map((animation) => this.prepareAnimation(gameScene, animation, animationsData));
        await Promise.all(tasks);
    }

    /**
     * Prepara (carga y crea) una animación individual.
     * Se ejecuta en paralelo para cada animación.
     */
    static async prepareAnimation(gameScene, animation, animationsData) {
        const key = animation.key;
        const base64 = animation.base64;
        const config = animationsData[animation.link];

        if (!config) {
            // Evitar errores si no existe la config en animationsData
            console.warn(`No existe configuración para la animación: ${animation.link}`);
            return;
        }

        const { frames, frameRate, frameWidth, frameHeight, has_atlas, atlas, repeat } = config;

        // Primero, si la textura no está en Phaser, la cargamos
        if (!gameScene.textures.exists(key)) {
            if (has_atlas) {
                // Cargamos como atlas
                await this.loadAtlasImage(gameScene, key, base64, atlas);
            } else {
                // Cargamos como spritesheet
                await this.loadBase64Image(gameScene, key, base64, frameWidth, frameHeight);
            }
        }

        // Luego, creamos la animación en caso de que no exista
        if (!gameScene.anims.exists(key)) {
            let animFrames;

            if (has_atlas) {
                // Generamos frames usando los nombres en el atlas
                animFrames = gameScene.anims.generateFrameNames(key, {
                    start: frames.start,
                    end: frames.end,
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

    /**
     * Carga una imagen base64 como spritesheet, usando frameWidth y frameHeight
     */
    static loadBase64Image(gameScene, key, base64, frameWidth, frameHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                try {
                    gameScene.textures.addSpriteSheet(key, img, {
                        frameWidth: frameWidth,
                        frameHeight: frameHeight
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = (err) => reject(err);
        });
    }

    /**
     * Carga una imagen base64 como atlas, usando la definición (atlasJsonStr)
     */
    static loadAtlasImage(gameScene, key, base64, atlasJsonStr) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                try {
                    const atlasData = JSON.parse(atlasJsonStr);
                    gameScene.textures.addAtlas(key, img, atlasData);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = (err) => reject(err);
        });
    }

    /**
     * Método auxiliar para extraer el prefijo de frames de un atlas
     * (solo útil si tus frames siguen un patrón, por ejemplo "left_punch_doy_0000")
     */
    static getFramePrefixFromAtlas(atlasData) {
        const frameNames = Object.keys(atlasData.frames);
        if (frameNames.length === 0) return '';

        // Toma el primer frame y elimina dígitos al final para obtener el prefix
        // Ejemplo: "left_punch_doy_0000" => prefix "left_punch_doy_"
        const firstFrame = frameNames[0];
        const match = firstFrame.match(/^(.*?_)0+$/);
        if (match && match[1]) {
            return match[1];
        }
        return '';
    }
}

export default AnimationsController;
