import GoldenRingSceneLoad from "./minigame-scenes/GoldenRingSceneLoad";
import MinigameSceneEnum from "../../enums/MinigameSceneEnum";

class MinigameSceneLoad {
    static main(gameScene, sceneType) {
        switch (sceneType) {
            case MinigameSceneEnum.GOLDEN_RING:
                GoldenRingSceneLoad.main(gameScene);
                break;
            default:
                console.warn(`No se encontró el tipo de escena: ${sceneType}`);
                break;
        }
    }
}

export default MinigameSceneLoad;