import UfoScenePreload from "./public-scenes/UfoSceneLoad";
import PublicSceneEnum from "../../enums/PublicSceneEnum";

class PublicSceneLoad {
    static main(gameScene, areaId) {
        switch (areaId) {
            case PublicSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            case PublicSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            default:
                break;
        }
    }
}

export default PublicSceneLoad;