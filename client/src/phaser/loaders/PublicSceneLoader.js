import UfoScenePreload from "../preloaders/public-scene/UfoScenePreload";
import RingScenePreload from "../preloaders/public-scene/RingScenePreload";
import PublicSceneEnum from "../../enums/PublicSceneEnum";

class PublicSceneLoader {
    static main(gameScene, sceneType, preload = true) {
        switch (sceneType) {
            case PublicSceneEnum.UFO:
                //TODO: el import debe producirse aquí
                if (preload) {
                    UfoScenePreload.preload(gameScene);
                } else {
                    UfoScenePreload.load(gameScene);
                }
                break;
            case PublicSceneEnum.RING:
                if (preload) {
                    RingScenePreload.preload(gameScene);
                } else {
                    RingScenePreload.load(gameScene);
                }
                break;
        }
    }
}

export default PublicSceneLoader;