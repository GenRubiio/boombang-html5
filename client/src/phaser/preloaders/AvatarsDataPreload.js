import AvatarsEnum from "../enums/AvatarsEnum";
import werewolf_config from "../../assets/game/avatars/1/config.json";

class AvatarsDataPreload {
    static main() {
        window.avatars_config = {
            [AvatarsEnum.WEREWOLF]: werewolf_config
        };
    }
}

export default AvatarsDataPreload;