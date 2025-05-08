import UfoScenePreload from "./public-scene/UfoScenePreload";
import PublicSceneEnum from "../../enums/PublicSceneEnum";

class PublicScenePreload {
    static main(gameScene, sceneType) {
        switch (sceneType) {
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

export default PublicScenePreload;