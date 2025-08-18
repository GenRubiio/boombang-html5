import asset_spritesheet0_image from '@/assets/game/scene/cocos/coco_garbage/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/scene/cocos/coco_garbage/spritesheet-1.webp';
import asset_atlas_json from '@/assets/game/scene/cocos/coco_garbage/atlas.json';

class CocoGarbageLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_garbage_atlas', asset_atlas_json);
    }
}

export default CocoGarbageLoad;
