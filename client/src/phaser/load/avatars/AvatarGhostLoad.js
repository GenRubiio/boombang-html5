import asset_spritesheet0_image from '@/assets/game/avatars/ghost/animations/spritesheet-0.webp';
import asset_atlas_json from '@/assets/game/avatars/ghost/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/ghost/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/ghost/cara_media.svg';

class AvatarGhostLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('ghost_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
        return asset_atlas_json;
    }
}

export default AvatarGhostLoad;
