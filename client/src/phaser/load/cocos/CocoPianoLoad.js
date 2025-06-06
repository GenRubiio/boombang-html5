import asset_spritesheet0_image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-0.webp';
import asset_spritesheet1_image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-1.webp';
import asset_spritesheet2_image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-2.webp';
import asset_atlas_json from '../../../assets/game/scene/cocos/coco_piano/atlas.json';

class CocoPianoLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image, asset_spritesheet2_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_piano_atlas', asset_atlas_json);
    }
}

export default CocoPianoLoad;
