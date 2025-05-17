import GoldenRingPreload from "../preloaders/minigame-scene/GoldenRingPreload";
import MinigameSceneEnum from "../../enums/MinigameSceneEnum";

class MinigameSceneLoader {
    static main(gameScene, sceneType, preload = true) {
        switch (sceneType) {
            case MinigameSceneEnum.GOLDEN_RING:
                //TODO: el import debe producirse aquí
                if (preload) {
                    GoldenRingPreload.preload(gameScene);
                } else {
                    GoldenRingPreload.load(gameScene);
                }
                break;
            default:
                break;
        }
    }
}

export default MinigameSceneLoader;