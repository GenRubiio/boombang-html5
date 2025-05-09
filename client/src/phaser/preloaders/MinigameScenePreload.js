import GoldenRingPreload from "./minigame-scene/GoldenRingPreload";
import MinigameSceneEnum from "../../enums/MinigameSceneEnum";

class MinigameScenePreload {
    static main(gameScene, sceneType) {
        switch (sceneType) {
            case MinigameSceneEnum.GOLDEN_RING:
                GoldenRingPreload.main(gameScene);
                break;
            default:
                break;
        }
    }
}

export default MinigameScenePreload;