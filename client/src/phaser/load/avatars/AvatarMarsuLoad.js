import asset_spritesheet0_image from '@/assets/game/avatars/marsu/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/marsu/animations/spritesheet-1.webp';
import asset_spritesheet2_image from '@/assets/game/avatars/marsu/animations/spritesheet-2.webp';
import asset_atlas_json from '@/assets/game/avatars/marsu/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/marsu/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/marsu/cara_media.svg';

class AvatarMarsuLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image, asset_spritesheet2_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('marsu_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }
}

export default AvatarMarsuLoad;
