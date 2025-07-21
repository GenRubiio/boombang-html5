import asset_item1_image from "../../../assets/game/private-scenes/3/white/2.png";
import asset_item2_image from "../../../assets/game/private-scenes/3/white/5.png";
import asset_item3_image from "../../../assets/game/private-scenes/3/white/8.png";
import asset_item4_image from "../../../assets/game/private-scenes/3/white/11.png";
import asset_item5_image from "../../../assets/game/private-scenes/3/white/14.png";
import asset_item6_image from "../../../assets/game/private-scenes/3/white/17.png";
import asset_item7_image from "../../../assets/game/private-scenes/3/20.png";
import asset_item8_image from "../../../assets/game/private-scenes/3/23.png";
import SceneUtils from "../../../utils/SceneUtils";

class PrivateScene3Preload {
    static preload(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
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
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        let items = [
            { name: "item_1", x: 506, y: 226, custom_depth: 63, show_item: true, show_controller: false }, //Ok
            { name: "item_2", x: 506, y: 374, custom_depth: 76, show_item: true, show_controller: false }, //Ok
            { name: "item_3", x: 542, y: 247, custom_depth: 92, show_item: true, show_controller: false }, //Ok
            { name: "item_4", x: 490, y: 399, custom_depth: 93, show_item: true, show_controller: false }, //Ok
            { name: "item_5", x: 506, y: 657, custom_depth: 99, show_item: true, show_controller: false }, //Ok
            { name: "item_6", x: 891, y: 201, custom_depth: 165, show_item: true, show_controller: false }, //Ok
            { name: "item_7", x: 506, y: 402, custom_depth: 150, show_item: true, show_controller: false }, //Ok
            { name: "item_8", x: 504, y: 157, custom_depth: 151, show_item: true, show_controller: false } //Ok
        ];

        items.forEach(item => {
            this.#loadSingleItem(gameScene, suffix, item);
        });

        //SceneUtils.moveItems(gameScene);
    }

    static #loadSingleItem(gameScene, suffix, item) {
        if (!item.show_item) {
            return; // Si no se debe mostrar el item, no hacemos nada
        }
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

export default PrivateScene3Preload;