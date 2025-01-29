import spritesheet_0 from '../../../assets/game/avatars/wraith/animations/spritesheet-0.webp';
import atlas from '../../../assets/game/avatars/wraith/animations/atlas.json';

class AvatarWraithLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('wraith_atlas', atlas);
    }
}

export default AvatarWraithLoad;
