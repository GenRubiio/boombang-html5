import asset_backgroundImage from "../../../assets/game/scenarios/1/background.png";
import asset_item1Image from "../../../assets/game/scenarios/1/item_1.png";
import asset_item2Image from "../../../assets/game/scenarios/1/item_2.png";

class UfoScenePreload {
    static main(gameScene) {
        gameScene.load.image("background", asset_backgroundImage);
        gameScene.load.image("item_1", asset_item1Image);
        gameScene.load.image("item_2", asset_item2Image);
    }
}

export default UfoScenePreload;