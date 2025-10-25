import AvatarEnum from "@/enums/AvatarEnum";
import asset_boomer_json from "@/assets/game/avatars/boomer/config.json";
import asset_brujita_json from "@/assets/game/avatars/brujita/config.json";
import asset_cholo_json from "@/assets/game/avatars/cholo/config.json";
import asset_empollon_json from "@/assets/game/avatars/empollon/config.json";
import asset_gata_json from "@/assets/game/avatars/gata/config.json";
import asset_ghost_json from "@/assets/game/avatars/ghost/config.json";
import asset_india_json from "@/assets/game/avatars/india/config.json";
import asset_lilian_json from "@/assets/game/avatars/lilian/config.json";
import asset_marsu_json from "@/assets/game/avatars/marsu/config.json";
import asset_modern_json from "@/assets/game/avatars/modern/config.json";
import asset_ninja_json from "@/assets/game/avatars/ninja/config.json";
import asset_rasta_json from "@/assets/game/avatars/rasta/config.json";
import asset_skeleton_json from "@/assets/game/avatars/skeleton/config.json";
import asset_werewolf_json from "@/assets/game/avatars/werewolf/config.json";
import asset_wraith_json from "@/assets/game/avatars/wraith/config.json";
import asset_yayo_json from "@/assets/game/avatars/yayo/config.json";
import asset_zombie_json from "@/assets/game/avatars/zombie/config.json";

class AvatarsDataPreload {
    static main() {
        window.avatars_config = {
            [AvatarEnum.BOOMER]: asset_boomer_json,
            [AvatarEnum.BRUJITA]: asset_brujita_json,
            [AvatarEnum.CHOLO]: asset_cholo_json,
            [AvatarEnum.EMPOLLON]: asset_empollon_json,
            [AvatarEnum.GATA]: asset_gata_json,
            [AvatarEnum.GHOST]: asset_ghost_json,
            [AvatarEnum.INDIA]: asset_india_json,
            [AvatarEnum.LILIAN]: asset_lilian_json,
            [AvatarEnum.MARSU]: asset_marsu_json,
            [AvatarEnum.MODERN]: asset_modern_json,
            [AvatarEnum.NINJA]: asset_ninja_json,
            [AvatarEnum.RASTA]: asset_rasta_json,
            [AvatarEnum.SKELETON]: asset_skeleton_json,
            [AvatarEnum.WEREWOLF]: asset_werewolf_json,
            [AvatarEnum.WRAITH]: asset_wraith_json,
            [AvatarEnum.YAYO]: asset_yayo_json,
            [AvatarEnum.ZOMBIE]: asset_zombie_json
        };
    }
}

export default AvatarsDataPreload;