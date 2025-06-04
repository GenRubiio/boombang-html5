import asset_spritesheet0Image from '../../../assets/game/scene/cocos/coco_garbage/spritesheet-0.webp';
import asset_spritesheet1Image from '../../../assets/game/scene/cocos/coco_garbage/spritesheet-1.webp';
import asset_atlasJson from '../../../assets/game/scene/cocos/coco_garbage/atlas.json';

class CocoGarbageLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0Image, asset_spritesheet1Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_garbage_atlas', asset_atlasJson);
    }
}

export default CocoGarbageLoad;
