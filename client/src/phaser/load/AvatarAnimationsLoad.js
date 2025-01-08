import werewolf_config from "../../assets/game/avatars/1/werewolf-config.json";
import AvatarsEnum from "../enums/AvatarsEnum";

class AvatarAnimationsLoad {
    static main(gameScene) {
        this.loadAvatarAnimations(gameScene, werewolf_config, AvatarsEnum.WEREWOLF);
    }

    static loadAvatarAnimations(gameScene, config, avatarId) {
    }
}

export default AvatarAnimationsLoad;