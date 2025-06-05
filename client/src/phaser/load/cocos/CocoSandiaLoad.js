import asset_spritesheet0Image from '../../../assets/game/scene/cocos/coco_sandia/spritesheet-0.webp';
import asset_atlasJson from '../../../assets/game/scene/cocos/coco_sandia/atlas.json';

class CocoSandiaLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_sandia_atlas', asset_atlasJson);
    }
}

export default CocoSandiaLoad;
