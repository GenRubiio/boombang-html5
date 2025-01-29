import spritesheet_0 from '../../../assets/game/avatars/modern/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/modern/animations/spritesheet-1.webp';
import atlas from '../../../assets/game/avatars/modern/animations/atlas.json';

class AvatarModernLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0, spritesheet_1];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('modern_atlas', atlas);
    }
}

export default AvatarModernLoad;
