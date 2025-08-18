import asset_spritesheet0_image from '@/assets/game/scene/cocos/coco_sandia/spritesheet-0.webp';
import asset_atlas_json from '@/assets/game/scene/cocos/coco_sandia/atlas.json';

class CocoSandiaLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_sandia_atlas', asset_atlas_json);
    }
}

export default CocoSandiaLoad;
