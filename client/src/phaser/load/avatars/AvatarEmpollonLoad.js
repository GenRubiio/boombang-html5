import spritesheet_0 from '../../../assets/game/avatars/empollon/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/empollon/animations/spritesheet-1.webp';
import atlas from '../../../assets/game/avatars/empollon/animations/atlas.json';

class AvatarEmpollonLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0, spritesheet_1];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('empollon_atlas', atlas);
    }
}

export default AvatarEmpollonLoad;
