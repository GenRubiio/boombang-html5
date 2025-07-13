import PrivateScene1Preload from "../preloaders/private-scene/PrivateScene1Preload";
import PrivateSceneEnum from "../../enums/PrivateSceneEnum";

class PrivateSceneLoader {
    static main(gameScene, sceneType, preload = true) {
        switch (sceneType) {
            case PrivateSceneEnum.SCENE_1:
                //TODO: el import debe producirse aquí
                preload ? PrivateScene1Preload.preload(gameScene) : PrivateScene1Preload.load(gameScene);
                break;
        }
    }
}

export default PrivateSceneLoader;