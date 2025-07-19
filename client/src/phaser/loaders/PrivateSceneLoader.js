import PrivateScene1Preload from "../preloaders/private-scene/PrivateScene1Preload";
import PrivateScene2Preload from "../preloaders/private-scene/PrivateScene2Preload";
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
        }
    }
}

export default PrivateSceneLoader;