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
// tasks.md slice 22 (design.md §16): sally's asset compile was deferred past slice 10's
// registration-only scope (this static import needed a real file, which did not exist until
// `compile-layered-avatar.cjs sally --emit-config-shim` ran) — this is the one-line wiring
// that compile unblocks. `asset_sally_json` is a generated shim (`atlasKey: null`, no baked
// atlas exists for a layered-only character) built by `buildConfigShim.cjs` from her real
// compiled manifest, not hand-authored data.
import asset_sally_json from "@/assets/game/avatars/sally/config.json";
// god apply pass (2026-08-19): same treatment — a generated shim (`atlasKey: null`, no baked
// atlas for a layered-only character) built by `compile-raster-avatar.cjs --emit-config-shim`
// from her real compiled (base-pack-only, idle/talk/walk) manifest, not hand-authored data.
import asset_god_json from "@/assets/game/avatars/god/config.json";
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
            [AvatarEnum.SALLY]: asset_sally_json,
            [AvatarEnum.GOD]: asset_god_json,
            [AvatarEnum.SKELETON]: asset_skeleton_json,
            [AvatarEnum.WEREWOLF]: asset_werewolf_json,
            [AvatarEnum.WRAITH]: asset_wraith_json,
            [AvatarEnum.YAYO]: asset_yayo_json,
            [AvatarEnum.ZOMBIE]: asset_zombie_json
        };
    }
}

export default AvatarsDataPreload;