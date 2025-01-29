import spritesheet_0 from '../../../assets/game/avatars/boomer/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/boomer/animations/spritesheet-1.webp';
import spritesheet_2 from '../../../assets/game/avatars/boomer/animations/spritesheet-2.webp';
import atlas from '../../../assets/game/avatars/boomer/animations/atlas.json';

class AvatarBoomerLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0, spritesheet_1, spritesheet_2];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('boomer_atlas', atlas);
    }
}

export default AvatarBoomerLoad;
