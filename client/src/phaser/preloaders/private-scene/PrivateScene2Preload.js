import asset_item1_image from "@/assets/game/private-scenes/2/white/2.webp";
import asset_item2_image from "@/assets/game/private-scenes/2/white/5.webp";
import asset_item3_image from "@/assets/game/private-scenes/2/white/8.webp";
import asset_item4_image from "@/assets/game/private-scenes/2/white/11.webp";
import asset_item5_image from "@/assets/game/private-scenes/2/14.webp";
import asset_item6_image from "@/assets/game/private-scenes/2/white/17.webp";
import asset_item7_image from "@/assets/game/private-scenes/2/white/20.webp";
import asset_item8_image from "@/assets/game/private-scenes/2/white/23.webp";
import asset_item9_image from "@/assets/game/private-scenes/2/white/26.webp";
import SceneUtils from "@/utils/SceneUtils";

class PrivateScene2Preload {
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
        gameScene.load.image("item_9" + suffix, asset_item9_image);
    }

    static load(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        let items = [
            { name: "item_1", x: 506, y: 92, custom_depth: 97, show_item: true, show_controller: false }, //ok
            { name: "item_2", x: 506, y: 516, custom_depth: 97, show_item: true, show_controller: false }, //ok
            { name: "item_3", x: 347, y: 398, custom_depth: 97, show_item: true, show_controller: false }, //
            { name: "item_4", x: 180, y: 657, custom_depth: 98, show_item: true, show_controller: false }, // ok
            { name: "item_5", x: 506, y: 658, custom_depth: 99, show_item: true, show_controller: false }, // ok
            { name: "item_6", x: 128, y: 548, custom_depth: 101, show_item: true, show_controller: false }, //
            { name: "item_7", x: 622, y: 657, custom_depth: 99, show_item: true, show_controller: false }, // ok
            { name: "item_8", x: 324, y: 444, custom_depth: 103, show_item: true, show_controller: false }, // ok
            { name: "item_9", x: 425, y: 381, custom_depth: 365, show_item: true, show_controller: false } //
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

export default PrivateScene2Preload;