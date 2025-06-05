import asset_avatarEffectsJson from "../../assets/game/scene/cocos/config.json";

class AvatarEffectsDataPreload {
    static main() {
        window.avatar_effects_config = asset_avatarEffectsJson;
    }
}

export default AvatarEffectsDataPreload;