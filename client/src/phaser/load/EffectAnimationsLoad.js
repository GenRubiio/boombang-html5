import CocoGarbageLoad from "./cocos/CocoGarbageLoad";
import CocoPianoLoad from "./cocos/CocoPianoLoad";
import CocoAvispasLoad from "./cocos/CocoAvispasLoad";
import CocoCocoLoad from "./cocos/CocoCocoLoad";
import CocoMacetaLoad from "./cocos/CocoMacetaLoad";
import CocoPieLoad from "./cocos/CocoPieLoad";
import CocoSandiaLoad from "./cocos/CocoSandiaLoad";
import CocoShoeLoad from "./cocos/CocoShoeLoad";
import CocoSnowballLoad from "./cocos/CocoSnowballLoad";
import CocoYunqueLoad from "./cocos/CocoYunqueLoad";
import asset_config_json from '@/assets/game/scene/cocos/config.json';

class EffectAnimationsLoad {
    /**
     * Método principal que se llama en el "preload" de tu escena.
     * Aquí cargamos todos los ficheros atlas (spritesheet + JSON)
     */
    static preload(gameScene) {
        CocoGarbageLoad.main(gameScene);
        CocoPianoLoad.main(gameScene);
        CocoAvispasLoad.main(gameScene);
        CocoCocoLoad.main(gameScene);
        CocoMacetaLoad.main(gameScene);
        CocoPieLoad.main(gameScene);
        CocoSandiaLoad.main(gameScene);
        CocoShoeLoad.main(gameScene);
        CocoSnowballLoad.main(gameScene);
        CocoYunqueLoad.main(gameScene);
    }

    /**
     * Método que se llama en el "create" de tu escena.
     * Aquí creamos las animaciones a partir de los atlases ya cargados.
     */
    static create(gameScene) {
        Object.entries(asset_config_json).forEach(([animationName, animData]) => {
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
