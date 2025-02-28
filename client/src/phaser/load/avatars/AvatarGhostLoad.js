import spritesheet_0 from '../../../assets/game/avatars/ghost/animations/spritesheet-0.webp';
import atlas from '../../../assets/game/avatars/ghost/animations/atlas.json';
import cara_peque from '../../../assets/game/avatars/ghost/cara_peque.svg';
import cara_media from '../../../assets/game/avatars/ghost/cara_media.svg';

class AvatarGhostLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [spritesheet_0];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('ghost_atlas', atlas);
        gameScene.load.svg((avatarId + "_cara_peque"), cara_peque);
        gameScene.load.svg((avatarId + "_cara_media"), cara_media);
    }
}

export default AvatarGhostLoad;
