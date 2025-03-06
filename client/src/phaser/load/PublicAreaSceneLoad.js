import UfoScenePreload from "./public-areas/UfoSceneLoad";
import PublicAreaSceneEnum from "../../enums/PublicAreaSceneEnum";

class PublicAreaSceneLoad {
    static main(gameScene, areaId) {
        switch (areaId) {
            case PublicAreaSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            case PublicAreaSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            default:
                break;
        }
    }
}

export default PublicAreaSceneLoad;