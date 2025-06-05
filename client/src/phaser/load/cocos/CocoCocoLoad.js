import asset_spritesheet0Image from '../../../assets/game/scene/cocos/coco_coco/spritesheet-0.webp';
import asset_atlasJson from '../../../assets/game/scene/cocos/coco_coco/atlas.json';

class CocoCocoLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_coco_atlas', asset_atlasJson);
    }
}

export default CocoCocoLoad;
