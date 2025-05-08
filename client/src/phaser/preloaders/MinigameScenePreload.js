import GoldenRingPreload from "./minigame-scene/GoldenRingPreload";
import MinigameSceneEnm from "../../enums/MinigameSceneEnm";

class MinigameScenePreload {
    static main(gameScene, sceneType) {
        switch (sceneType) {
            case MinigameSceneEnm.GOLDEN_RING:
                GoldenRingPreload.main(gameScene);
                break;
            default:
                break;
        }
    }
}

export default MinigameScenePreload;