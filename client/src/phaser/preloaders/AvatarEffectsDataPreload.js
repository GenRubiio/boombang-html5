import asset_avatar_effects_json from "../../assets/game/scene/cocos/config.json";

class AvatarEffectsDataPreload {
    static main() {
        window.avatar_effects_config = asset_avatar_effects_json;
    }
}

export default AvatarEffectsDataPreload;