import asset_backgroundImage from "../../../assets/game/scenarios/1/background.webp";
import asset_item1Image from "../../../assets/game/scenarios/1/item_1.webp";
import asset_item2Image from "../../../assets/game/scenarios/1/item_2.webp";

class UfoScenePreload {
    static main(gameScene) {
        gameScene.load.image("background_ufo", asset_backgroundImage);
        gameScene.load.image("item_1_ufo", asset_item1Image);
        gameScene.load.image("item_2_ufo", asset_item2Image);
    }
}

export default UfoScenePreload;