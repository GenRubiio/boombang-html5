import asset_spritesheet0_image from '@/assets/game/avatars/india/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/india/animations/spritesheet-1.webp';
import asset_atlas_json from '@/assets/game/avatars/india/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/india/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/india/cara_media.svg';

class AvatarIndiaLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('india_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
        return asset_atlas_json;
    }
}

export default AvatarIndiaLoad;
