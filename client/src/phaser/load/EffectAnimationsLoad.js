import asset_configJson from '../../assets/game/scene/cocos/config.json';

class EffectAnimationsLoad {
    /**
     * Método principal que se llama en el "preload" de tu escena.
     * Aquí cargamos todos los ficheros atlas (spritesheet + JSON)
     */
    static async preload(gameScene) {
        const effectAssets = {
            coco_garbage: {
                images: [
                    import('../../assets/game/scene/cocos/coco_garbage/spritesheet-0.webp'),
                    import('../../assets/game/scene/cocos/coco_garbage/spritesheet-1.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_garbage/atlas.json')
            },
            coco_piano: {
                images: [
                    import('../../assets/game/scene/cocos/coco_piano/spritesheet-0.webp'),
                    import('../../assets/game/scene/cocos/coco_piano/spritesheet-1.webp'),
                    import('../../assets/game/scene/cocos/coco_piano/spritesheet-2.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_piano/atlas.json')
            },
            coco_avispas: {
                images: [
                    import('../../assets/game/scene/cocos/coco_avispas/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_avispas/atlas.json')
            },
            coco_coco: {
                images: [
                    import('../../assets/game/scene/cocos/coco_coco/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_coco/atlas.json')
            },
            coco_maceta: {
                images: [
                    import('../../assets/game/scene/cocos/coco_maceta/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_maceta/atlas.json')
            },
            coco_pie: {
                images: [
                    import('../../assets/game/scene/cocos/coco_pie/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_pie/atlas.json')
            },
            coco_sandia: {
                images: [
                    import('../../assets/game/scene/cocos/coco_sandia/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_sandia/atlas.json')
            },
            coco_shoe: {
                images: [
                    import('../../assets/game/scene/cocos/coco_shoe/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_shoe/atlas.json')
            },
            coco_snowball: {
                images: [
                    import('../../assets/game/scene/cocos/coco_snowball/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_snowball/atlas.json')
            },
            coco_yunque: {
                images: [
                    import('../../assets/game/scene/cocos/coco_yunque/spritesheet-0.webp')
                ],
                atlas: import('../../assets/game/scene/cocos/coco_yunque/atlas.json')
            }
        };

        await Promise.all(
            Object.entries(effectAssets).map(async ([effectName, assets]) => {
                const [atlasModule, ...imageModules] = await Promise.all([
                    assets.atlas,
                    ...assets.images
                ]);

                // Obtener el contenido real del JSON
                const atlasData = atlasModule.default;
                // Obtener las rutas reales de las imágenes
                const imagePaths = imageModules.map(module => module.default);

                atlasData.textures.forEach((texture, i) => {
                    texture.image = imagePaths[i];
                });

                gameScene.load.multiatlas(
                    asset_configJson[effectName].atlasKey,
                    atlasData  // Pasar el JSON real, no el módulo
                );
            })
        );
    }

    /**
     * Método que se llama en el "create" de tu escena.
     * Aquí creamos las animaciones a partir de los atlases ya cargados.
     */
    static create(gameScene) {
        Object.entries(asset_configJson).forEach(([animationName, animData]) => {
            const animKey = `${animationName}`;
            const atlasKey = animData.atlasKey;

            gameScene.anims.create({
                key: animKey,
                frames: gameScene.anims.generateFrameNames(atlasKey, {
                    start: animData.start,
                    end: animData.end,
                    prefix: animData.prefix
                }),
                frameRate: animData.frameRate,
                repeat: animData.repeat
            });
        });
    }
}

export default EffectAnimationsLoad;
