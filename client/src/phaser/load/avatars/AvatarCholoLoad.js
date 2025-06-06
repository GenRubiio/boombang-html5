import asset_spritesheet0_image from '../../../assets/game/avatars/cholo/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '../../../assets/game/avatars/cholo/animations/spritesheet-1.webp';
import asset_atlas_json from '../../../assets/game/avatars/cholo/animations/atlas.json';
import asset_cara_peque_image from '../../../assets/game/avatars/cholo/cara_peque.svg';
import asset_cara_media_image from '../../../assets/game/avatars/cholo/cara_media.svg';

class AvatarCholoLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [
            asset_spritesheet0_image,
            asset_spritesheet1_image
        ];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('cholo_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }
}

export default AvatarCholoLoad;
