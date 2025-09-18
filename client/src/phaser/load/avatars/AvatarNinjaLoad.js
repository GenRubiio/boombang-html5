import asset_spritesheet0_image from '@/assets/game/avatars/ninja/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/ninja/animations/spritesheet-1.webp';
import asset_atlas_json from '@/assets/game/avatars/ninja/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/ninja/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/ninja/cara_media.svg';

class AvatarNinjaLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('ninja_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
        return asset_atlas_json;
    }
}

export default AvatarNinjaLoad;
