import asset_spritesheet0Image from '../../../assets/game/avatars/werewolf/animations/spritesheet-0.webp';
import asset_spritesheet1Image from '../../../assets/game/avatars/werewolf/animations/spritesheet-1.webp';
import asset_atlasJson from '../../../assets/game/avatars/werewolf/animations/atlas.json';
import asset_caraPequeImage from '../../../assets/game/avatars/werewolf/cara_peque.svg';
import asset_caraMediaImage from '../../../assets/game/avatars/werewolf/cara_media.svg';

class AvatarWerewolfLoad {
    static main(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0Image, asset_spritesheet1Image];

        asset_atlasJson.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        gameScene.load.multiatlas('werewolf_atlas', asset_atlasJson);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_caraPequeImage);
        gameScene.load.svg((avatarId + "_cara_media"), asset_caraMediaImage);
    }
}

export default AvatarWerewolfLoad;
