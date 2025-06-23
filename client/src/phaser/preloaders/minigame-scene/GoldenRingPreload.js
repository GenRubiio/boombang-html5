import asset_background_image from "../../../assets/game/minigame-scenes/1/background.webp";
import asset_item1_image from "../../../assets/game/minigame-scenes/1/108.webp";
import asset_item2_image from "../../../assets/game/minigame-scenes/1/105.webp";
import asset_item3_image from "../../../assets/game/minigame-scenes/1/111.webp";
import asset_item4_image from "../../../assets/game/minigame-scenes/1/114.webp";
import asset_item5_image from "../../../assets/game/minigame-scenes/1/117.webp";
import asset_item6_image from "../../../assets/game/minigame-scenes/1/120.webp";
import asset_item7_image from "../../../assets/game/minigame-scenes/1/136.webp";
import asset_item8_image from "../../../assets/game/minigame-scenes/1/139.webp";
import SceneUtils from "../../../utils/SceneUtils";

class GoldenRingPreload {
    static preload(gameScene) {
        const suffix = '_golden_ring';
        gameScene.load.image("background" + suffix, asset_background_image);
        gameScene.load.image("item_1" + suffix, asset_item1_image);
        gameScene.load.image("item_2" + suffix, asset_item2_image);
        gameScene.load.image("item_3" + suffix, asset_item3_image);
        gameScene.load.image("item_4" + suffix, asset_item4_image);
        gameScene.load.image("item_5" + suffix, asset_item5_image);
        gameScene.load.image("item_6" + suffix, asset_item6_image);
        gameScene.load.image("item_7" + suffix, asset_item7_image);
        gameScene.load.image("item_8" + suffix, asset_item8_image);
    }

    static load(gameScene) {
        const suffix = '_golden_ring';
        this.loadBackground(gameScene, suffix);
        let items = [
            { name: "item_1", x: 206, y: 266, custom_depth: 239, show_controller: false },
            { name: "item_2", x: 810, y: 263, custom_depth: 239, show_controller: false },
            { name: "item_3", x: 949, y: 410, show_controller: false },
            { name: "item_4", x: 66, y: 411, custom_depth: 352, show_controller: false },
            { name: "item_5", x: 173, y: 492, custom_depth: 353, show_controller: false },
            { name: "item_6", x: 476, y: 326, custom_depth: 240, show_controller: false },
            { name: "item_7", x: 505, y: 658, custom_depth: 655, show_controller: false },
            { name: "item_8", x: 506, y: 656, show_controller: false },
        ];

        items.forEach(item => {
            this.#loadSingleItem(gameScene, suffix, item);
        });
    }

    static loadBackground(gameScene, suffix) {
        const background = gameScene.add.image(0, 0, "background" + suffix).setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static #loadSingleItem(gameScene, suffix, item) {
        // Creamos el sprite en (x,y)
        const sprite = gameScene.add.image(item.x, item.y, item.name + suffix)
            .setOrigin(0.5, 1)
            .setDepth(item.custom_depth || item.y)
            .setName(item.name + suffix);
        if (item.show_controller) {
            // Si es un item que se puede mover, añadimos el controlador
            SceneUtils.moveItem(gameScene, sprite);
        }
    }
}

export default GoldenRingPreload;