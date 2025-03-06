import UfoScenePreload from "./public-areas/UfoScenePreload";
import PublicAreaSceneEnum from "../../enums/PublicAreaSceneEnum";

class PublicAreaScenePreload {
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

export default PublicAreaScenePreload;