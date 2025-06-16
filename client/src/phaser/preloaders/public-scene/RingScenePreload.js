import asset_background_image from "../../../assets/game/scenarios/100/background.webp";
import asset_npc_image from "../../../assets/game/npc/wise_ring.webp";
import SceneUtils from "../../../utils/SceneUtils";
import NpcEnum from "../../../enums/NpcEnum";
import asset_item1_image from "../../../assets/game/scenarios/100/5.png";
import asset_item2_image from "../../../assets/game/scenarios/100/8.png";
import asset_item3_image from "../../../assets/game/scenarios/100/11.png";
import asset_item4_image from "../../../assets/game/scenarios/100/14.png";
import asset_item5_image from "../../../assets/game/scenarios/100/17.png";

class RingScenePreload {
    static preload(gameScene) {
        const suffix = '_ring';
        gameScene.load.image("background" + suffix, asset_background_image);
        gameScene.load.image("npc" + suffix, asset_npc_image);
        gameScene.load.image("item_1" + suffix, asset_item1_image);
        gameScene.load.image("item_2" + suffix, asset_item2_image);
        gameScene.load.image("item_3" + suffix, asset_item3_image);
        gameScene.load.image("item_4" + suffix, asset_item4_image);
        gameScene.load.image("item_5" + suffix, asset_item5_image);
    }

    static load(gameScene) {
        const suffix = '_ring';
        this.#loadBackground(gameScene, suffix);
        let items = [
            { name: "item_1", x: 206, y: 266, show_controller: false },
            { name: "item_2", x: 806, y: 266, show_controller: false },
            { name: "item_3", x: 941, y: 411, show_controller: false },
            { name: "item_4", x: 66, y: 411, show_controller: false },
            { name: "item_5", x: 511, y: 661, show_controller: false }
        ];

        items.forEach(item => {
            this.#loadSingleItem(gameScene, suffix, item);
        });

        SceneUtils.loadNpc(2, 0, gameScene, "npc" + suffix, NpcEnum.WISE_RING);
    }

    static #loadBackground(gameScene, suffix) {
        const bg = gameScene.add.image(0, 0, "background" + suffix).setOrigin(0);
        bg.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    // Carga un único item partiendo de coordenadas píxel
    static #loadSingleItem(gameScene, suffix, item) {
        // Creamos el sprite en (x,y)
        const sprite = gameScene.add.image(item.x, item.y, item.name + suffix)
            .setOrigin(0.5, 1)
            .setDepth(item.y)
            .setName(item.name + suffix);
        if (item.show_controller) {
            // Si es un item que se puede mover, añadimos el controlador
            SceneUtils.moveItem(gameScene, sprite);
        }
    }
}

export default RingScenePreload;
