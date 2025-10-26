import asset_spritesheet0_image from '@/assets/game/avatars/brujita/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/brujita/animations/spritesheet-1.webp';
import asset_spritesheet2_image from '@/assets/game/avatars/brujita/animations/spritesheet-2.webp';
import asset_spritesheet3_image from '@/assets/game/avatars/brujita/animations/spritesheet-3.webp';
import asset_spritesheet4_image from '@/assets/game/avatars/brujita/animations/spritesheet-4.webp';
import asset_spritesheet5_image from '@/assets/game/avatars/brujita/animations/spritesheet-5.webp';
import asset_spritesheet6_image from '@/assets/game/avatars/brujita/animations/spritesheet-6.webp';
import asset_spritesheet7_image from '@/assets/game/avatars/brujita/animations/spritesheet-7.webp';
import asset_spritesheet8_image from '@/assets/game/avatars/brujita/animations/spritesheet-8.webp';
import asset_spritesheet9_image from '@/assets/game/avatars/brujita/animations/spritesheet-9.webp';
import asset_spritesheet10_image from '@/assets/game/avatars/brujita/animations/spritesheet-10.webp';
import asset_spritesheet11_image from '@/assets/game/avatars/brujita/animations/spritesheet-11.webp';
import asset_spritesheet12_image from '@/assets/game/avatars/brujita/animations/spritesheet-12.webp';

import asset_atlas_json from '@/assets/game/avatars/brujita/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/brujita/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/brujita/cara_media.svg';

class AvatarBrujitaLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [
            asset_spritesheet0_image,
            asset_spritesheet1_image,
            asset_spritesheet2_image,
            asset_spritesheet3_image,
            asset_spritesheet4_image,
            asset_spritesheet5_image,
            asset_spritesheet6_image,
            asset_spritesheet7_image,
            asset_spritesheet8_image,
            asset_spritesheet9_image,
            asset_spritesheet10_image,
            asset_spritesheet11_image,
            asset_spritesheet12_image
        ];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('brujita_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
        return asset_atlas_json;
    }
}

export default AvatarBrujitaLoad;
