import background from "../../../assets/game/scenarios/1/background.png";
import item_1 from "../../../assets/game/scenarios/1/item_1.png";
import item_2 from "../../../assets/game/scenarios/1/item_2.png";

class UfoScenePreload {
    static main(gameScene) {
        gameScene.load.image("background", background);
        gameScene.load.image("item_1", item_1);
        gameScene.load.image("item_2", item_2);
    }
}

export default UfoScenePreload;