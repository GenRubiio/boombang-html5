import AvatarEnum from "../../enums/AvatarEnum";
import asset_boomerJson from "../../assets/game/avatars/boomer/config.json";
import asset_brujitaJson from "../../assets/game/avatars/brujita/config.json";
import asset_choloJson from "../../assets/game/avatars/cholo/config.json";
import asset_empollonJson from "../../assets/game/avatars/empollon/config.json";
import asset_gataJson from "../../assets/game/avatars/gata/config.json";
import asset_ghostJson from "../../assets/game/avatars/ghost/config.json";
import asset_indiaJson from "../../assets/game/avatars/india/config.json";
import asset_lilianJson from "../../assets/game/avatars/lilian/config.json";
import asset_marsuJson from "../../assets/game/avatars/marsu/config.json";
import asset_modernJson from "../../assets/game/avatars/modern/config.json";
import asset_ninjaJson from "../../assets/game/avatars/ninja/config.json";
import asset_rastaJson from "../../assets/game/avatars/rasta/config.json";
import asset_skeletonJson from "../../assets/game/avatars/skeleton/config.json";
import asset_werewolfJson from "../../assets/game/avatars/werewolf/config.json";
import asset_wraithJson from "../../assets/game/avatars/wraith/config.json";
import asset_yayoJson from "../../assets/game/avatars/yayo/config.json";
import asset_zombieJson from "../../assets/game/avatars/zombie/config.json";

class AvatarsDataPreload {
    static main() {
        window.avatars_config = {
            [AvatarEnum.BOOMER]: asset_boomerJson,
            [AvatarEnum.BRUJITA]: asset_brujitaJson,
            [AvatarEnum.CHOLO]: asset_choloJson,
            [AvatarEnum.EMPOLLON]: asset_empollonJson,
            [AvatarEnum.GATA]: asset_gataJson,
            [AvatarEnum.GHOST]: asset_ghostJson,
            [AvatarEnum.INDIA]: asset_indiaJson,
            [AvatarEnum.LILIAN]: asset_lilianJson,
            [AvatarEnum.MARSU]: asset_marsuJson,
            [AvatarEnum.MODERN]: asset_modernJson,
            [AvatarEnum.NINJA]: asset_ninjaJson,
            [AvatarEnum.RASTA]: asset_rastaJson,
            [AvatarEnum.SKELETON]: asset_skeletonJson,
            [AvatarEnum.WEREWOLF]: asset_werewolfJson,
            [AvatarEnum.WRAITH]: asset_wraithJson,
            [AvatarEnum.YAYO]: asset_yayoJson,
            [AvatarEnum.ZOMBIE]: asset_zombieJson
        };
    }
}

export default AvatarsDataPreload;