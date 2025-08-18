import asset_spritesheet0_image from '@/assets/game/avatars/wraith/animations/spritesheet-0.webp';
import asset_atlas_json from '@/assets/game/avatars/wraith/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/wraith/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/wraith/cara_media.svg';

class AvatarWraithLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('wraith_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }
}

export default AvatarWraithLoad;
