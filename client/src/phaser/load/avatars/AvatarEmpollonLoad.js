import spritesheet_0 from '../../../assets/game/avatars/empollon/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/empollon/animations/spritesheet-1.webp';
import atlas from '../../../assets/game/avatars/empollon/animations/atlas.json';
import cara_peque from '../../../assets/game/avatars/empollon/cara_peque.svg';
import cara_media from '../../../assets/game/avatars/empollon/cara_media.svg';

class AvatarEmpollonLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [spritesheet_0, spritesheet_1];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('empollon_atlas', atlas);
        gameScene.load.svg((avatarId + "_cara_peque"), cara_peque);
        gameScene.load.svg((avatarId + "_cara_media"), cara_media);
    }
}

export default AvatarEmpollonLoad;
