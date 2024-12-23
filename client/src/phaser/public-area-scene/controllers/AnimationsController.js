// AnimationsController.js

import PQueue from 'p-queue';

class AnimationsController {
    // Inicializar una instancia estática de PQueue con una concurrencia limitada
    // Puedes ajustar la concurrencia según las necesidades de tu aplicación
    static queue = new PQueue({ concurrency: 1 }); // Por ejemplo, 3 cargas concurrentes

    /**
     * Método principal para iniciar las animaciones de un jugador.
     * @param {Phaser.Scene} gameScene - La escena de Phaser.
     * @param {Object} playerData - Datos del jugador.
     */
    static async main(gameScene, playerData) {
        const animationsData = gameScene.avatarAnimations[playerData.avatar_id];
        if (!animationsData) {
            console.error(`No se encontraron datos de animaciones para avatar_id: ${playerData.avatar_id}`);
            return;
        }
        await this.playerAnimations(gameScene, playerData.id, playerData.animations, animationsData);
    }

    /**
     * Carga las animaciones específicas para un jugador.
     * @param {Phaser.Scene} gameScene - La escena de Phaser.
     * @param {string} socketId - ID del socket del jugador.
     * @param {Object} animations - Animaciones del jugador.
     * @param {Object} animationsData - Datos de las animaciones.
     */
    static async playerAnimations(gameScene, socketId, animations, animationsData) {
        if (animations.walk) {
            await this.animations(gameScene, socketId, animations.walk.walk_singleAtlas, animationsData.walk_singleAtlas, "walk_singleAtlas");
        }
    }

    /**
     * Carga y crea las animaciones para un atlas específico.
     * @param {Phaser.Scene} gameScene - La escena de Phaser.
     * @param {string} socketId - ID del socket del jugador.
     * @param {Object} animation - Datos de la animación.
     * @param {Object} animationsDataContent - Contenido de los datos de animación.
     * @param {string} atlasName - Nombre del atlas.
     */
    static async animations(gameScene, socketId, animation, animationsDataContent, atlasName) {
        console.log("animationsDataContent: ", animationsDataContent);
        console.log(`Loading animation: `, animation);

        const animationKey = atlasName;
        const animationBase64 = animation.base64;
        const animationAtlas = animation.atlas;
        const uidAtlas = `${socketId}_${animationKey}`;
        console.log(`UID Atlas generado: ${uidAtlas}`);

        if (!gameScene.textures.exists(uidAtlas)) {
            console.log(`Loading image for key: ${uidAtlas}`);
            // Encolar la carga de la textura usando p-queue
            await AnimationsController.queue.add(() => this.loadAtlasImage(gameScene, uidAtlas, animationBase64, animationAtlas, atlasName));
        }

        if (animationsDataContent && typeof animationsDataContent === 'object') {
            Object.entries(animationsDataContent).forEach(([key, animationData]) => {
                console.log(`Creating animation: ${key}`);
                console.log(`animationData: `, animationData);
                const uidAnimation = `${socketId}_${key}`;
                const { frames, frameRate, repeat, prefix } = animationData;

                console.log(`UID Animation generado: ${uidAnimation}`);

                gameScene.time.delayedCall(10, () => {
                    if (!gameScene.anims.exists(uidAnimation)) {
                        console.log(`Creating animation: ${uidAnimation}`);

                        console.log("animation atlas: ", uidAtlas);
                        const animFrames = gameScene.anims.generateFrameNames(uidAtlas, {
                            start: frames.start,
                            end: frames.end,
                            prefix: prefix,
                            // zeroPad: 0
                        });

                        gameScene.anims.create({
                            key: uidAnimation,
                            frames: animFrames,
                            frameRate: frameRate,
                            repeat: repeat
                        });
                    }
                });
            });
        } else {
            console.warn(`No se encontró configuración de animaciones para la clave: ${animationKey}`);
        }
    }

    /**
     * Método para cargar un atlas de animación en memoria.
     * @param {Phaser.Scene} gameScene - La escena de Phaser.
     * @param {string} key - Clave única para la textura.
     * @param {string} base64 - Imagen en formato base64.
     * @param {string} atlasJsonStr - Datos del atlas en formato JSON.
     * @returns {Promise<void>}
     */
    static loadAtlasImage(gameScene, key, base64, atlasJsonStr, atlasName) {
        let imagePath = '';
        let atlasPath = '';
        console.log("meta url: ", import.meta.url);
        switch (atlasName) {
            //if key contains "walk_singleAtlas"
            case "walk_singleAtlas":
                console.log("Loading image for key: ", key);
                //img esta en ruta public/game/users/1/walk_singleAtlas.png
                imagePath = new URL('../../../assets/game/users/1/walk_singleAtlas.png', import.meta.url).href;
                atlasPath = new URL('../../../assets/game/users/1/walk_singleAtlas.json', import.meta.url).href;
                break;
         
        }
        return new Promise((resolve, reject) => {
            gameScene.load.atlas(key, imagePath, atlasPath);

            // Escucha el evento de carga completa
            gameScene.load.once('complete', () => {
                resolve();
            });

            gameScene.load.once('error', (error) => {
                console.error(`Error al cargar el atlas ${key}:`, error);
                reject(error);
            });

            // Inicia el cargador dinámico
            gameScene.load.start();
        });
    }
}

export default AnimationsController;
