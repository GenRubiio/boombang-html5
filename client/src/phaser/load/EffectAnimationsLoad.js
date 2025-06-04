import CocoGarbageLoad from "./cocos/CocoGarbageLoad";
import CocoPianoLoad from "./cocos/CocoPianoLoad";
import asset_configJson from '../../assets/game/scene/cocos/config.json';

class EffectAnimationsLoad {
    /**
     * Método principal que se llama en el "preload" de tu escena.
     * Aquí cargamos todos los ficheros atlas (spritesheet + JSON)
     */
    static preload(gameScene) {
        CocoGarbageLoad.main(gameScene);
        CocoPianoLoad.main(gameScene);
    }

    /**
     * Método que se llama en el "create" de tu escena.
     * Aquí creamos las animaciones a partir de los atlases ya cargados.
     */
    static create(gameScene) {
        Object.entries(asset_configJson).forEach(([animationName, animData]) => {
            const animKey = `${animationName}`;
            const atlasKey = animData.atlasKey;
            console.log(animationName);
            console.log(animData);

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
