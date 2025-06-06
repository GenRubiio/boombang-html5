import asset_spritesheet0_image from '../../../assets/game/scene/cocos/coco_snowball/spritesheet-0.webp';
import asset_atlas_json from '../../../assets/game/scene/cocos/coco_snowball/atlas.json';

class CocoSnowballLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_snowball_atlas', asset_atlas_json);
    }
}

export default CocoSnowballLoad;
