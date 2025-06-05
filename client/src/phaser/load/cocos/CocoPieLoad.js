import asset_spritesheet0Image from '../../../assets/game/scene/cocos/coco_pie/spritesheet-0.webp';
import asset_atlasJson from '../../../assets/game/scene/cocos/coco_pie/atlas.json';

class CocoPieLoad {
    static main(gameScene) {
        const webpFiles = [asset_spritesheet0Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('coco_pie_atlas', asset_atlasJson);
    }
}

export default CocoPieLoad;
