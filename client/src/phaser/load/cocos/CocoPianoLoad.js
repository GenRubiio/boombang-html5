import asset_spritesheet0Image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-0.webp';
import asset_spritesheet1Image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-1.webp';
import asset_spritesheet2Image from '../../../assets/game/scene/cocos/coco_piano/spritesheet-2.webp';
import asset_atlasJson from '../../../assets/game/scene/cocos/coco_piano/atlas.json';

class CocoPianoLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0Image, asset_spritesheet1Image, asset_spritesheet2Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_piano_atlas', asset_atlasJson);
    }
}

export default CocoPianoLoad;
