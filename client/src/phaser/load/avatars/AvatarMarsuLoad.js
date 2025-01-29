import spritesheet_0 from '../../../assets/game/avatars/marsu/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/marsu/animations/spritesheet-1.webp';
import spritesheet_2 from '../../../assets/game/avatars/marsu/animations/spritesheet-2.webp';
import atlas from '../../../assets/game/avatars/marsu/animations/atlas.json';

class AvatarMarsuLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0, spritesheet_1, spritesheet_2];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('marsu_atlas', atlas);
    }
}

export default AvatarMarsuLoad;
