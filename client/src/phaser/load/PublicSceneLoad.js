import UfoScenePreload from "./public-scenes/UfoSceneLoad";
import PublicSceneEnum from "../../enums/PublicSceneEnum";

class PublicSceneLoad {
    static main(gameScene, sceneType) {
        switch (sceneType) {
            case PublicSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            case PublicSceneEnum.UFO:
                UfoScenePreload.main(gameScene);
                break;
            default:
                console.warn(`No se encontró el tipo de escena: ${sceneType}`);
                break;
        }
    }
}

export default PublicSceneLoad;