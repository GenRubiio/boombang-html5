import spritesheet_0 from '../../../assets/game/avatars/1/animations/spritesheet-0.webp';
import spritesheet_1 from '../../../assets/game/avatars/1/animations/spritesheet-1.webp';
import atlas from '../../../assets/game/avatars/1/animations/atlas.json';

class AvatarWerewolfLoad {
    static main(gameScene) {
        const webpFiles = [spritesheet_0, spritesheet_1];

        atlas.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('werewolf_atlas', atlas);
    }
}

export default AvatarWerewolfLoad;
