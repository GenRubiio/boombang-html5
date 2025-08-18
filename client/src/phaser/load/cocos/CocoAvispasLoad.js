import asset_spritesheet0_image from '@/assets/game/scene/cocos/coco_avispas/spritesheet-0.webp';
import asset_atlas_json from '@/assets/game/scene/cocos/coco_avispas/atlas.json';

class CocoAvispasLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_avispas_atlas', asset_atlas_json);
    }
}

export default CocoAvispasLoad;
