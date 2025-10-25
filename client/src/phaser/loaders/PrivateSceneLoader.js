import PrivateScene1Preload from "../preloaders/private-scene/PrivateScene1Preload";
import PrivateScene2Preload from "../preloaders/private-scene/PrivateScene2Preload";
import PrivateScene3Preload from "../preloaders/private-scene/PrivateScene3Preload";
import PrivateScene4Preload from "../preloaders/private-scene/PrivateScene4Preload";
import PrivateScene5Preload from "../preloaders/private-scene/PrivateScene5Preload";
import PrivateScene6Preload from "../preloaders/private-scene/PrivateScene6Preload";
import PrivateSceneEnum from "../../enums/PrivateSceneEnum";

class PrivateSceneLoader {
    static main(gameScene, sceneType, preload = true) {
        switch (sceneType) {
            case PrivateSceneEnum.SCENE_1:
                preload ? PrivateScene1Preload.preload(gameScene) : PrivateScene1Preload.load(gameScene);
                break;
            case PrivateSceneEnum.SCENE_2:
                preload ? PrivateScene2Preload.preload(gameScene) : PrivateScene2Preload.load(gameScene);
                break;
            case PrivateSceneEnum.SCENE_3:
                preload ? PrivateScene3Preload.preload(gameScene) : PrivateScene3Preload.load(gameScene);
                break;
            case PrivateSceneEnum.SCENE_4:
                preload ? PrivateScene4Preload.preload(gameScene) : PrivateScene4Preload.load(gameScene);
                break;
            case PrivateSceneEnum.SCENE_5:
                preload ? PrivateScene5Preload.preload(gameScene) : PrivateScene5Preload.load(gameScene);
                break;
            case PrivateSceneEnum.SCENE_6:
                preload ? PrivateScene6Preload.preload(gameScene) : PrivateScene6Preload.load(gameScene);
                break;
        }
    }
}

export default PrivateSceneLoader;