import AvatarEnum from "../enums/AvatarEnum";
import boomer_config from "../../assets/game/avatars/boomer/config.json";
import brujita_config from "../../assets/game/avatars/brujita/config.json";
import cholo_config from "../../assets/game/avatars/cholo/config.json";
import empollon_config from "../../assets/game/avatars/empollon/config.json";
import gata_config from "../../assets/game/avatars/gata/config.json";
import ghost_config from "../../assets/game/avatars/ghost/config.json";
import india_config from "../../assets/game/avatars/india/config.json";
import lilian_config from "../../assets/game/avatars/lilian/config.json";
import marsu_config from "../../assets/game/avatars/marsu/config.json";
import modern_config from "../../assets/game/avatars/modern/config.json";
import ninja_config from "../../assets/game/avatars/ninja/config.json";
import rasta_config from "../../assets/game/avatars/rasta/config.json";
import skeleton_config from "../../assets/game/avatars/skeleton/config.json";
import werewolf_config from "../../assets/game/avatars/werewolf/config.json";
import wraith_config from "../../assets/game/avatars/wraith/config.json";
import yayo_config from "../../assets/game/avatars/yayo/config.json";
import zombie_config from "../../assets/game/avatars/zombie/config.json";

class AvatarsDataPreload {
    static main() {
        window.avatars_config = {
            [AvatarEnum.BOOMER]: boomer_config,
            [AvatarEnum.BRUJITA]: brujita_config,
            [AvatarEnum.CHOLO]: cholo_config,
            [AvatarEnum.EMPOLLON]: empollon_config,
            [AvatarEnum.GATA]: gata_config,
            [AvatarEnum.GHOST]: ghost_config,
            [AvatarEnum.INDIA]: india_config,
            [AvatarEnum.LILIAN]: lilian_config,
            [AvatarEnum.MARSU]: marsu_config,
            [AvatarEnum.MODERN]: modern_config,
            [AvatarEnum.NINJA]: ninja_config,
            [AvatarEnum.RASTA]: rasta_config,
            [AvatarEnum.SKELETON]: skeleton_config,
            [AvatarEnum.WEREWOLF]: werewolf_config,
            [AvatarEnum.WRAITH]: wraith_config,
            [AvatarEnum.YAYO]: yayo_config,
            [AvatarEnum.ZOMBIE]: zombie_config
        };
    }
}

export default AvatarsDataPreload;