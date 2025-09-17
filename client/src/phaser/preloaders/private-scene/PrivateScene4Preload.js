import asset_item1_image from "@/assets/game/private-scenes/4/white/2.webp";
import asset_item2_image from "@/assets/game/private-scenes/4/white/5.webp";
import asset_item3_image from "@/assets/game/private-scenes/4/white/8.webp";
import asset_item4_image from "@/assets/game/private-scenes/4/white/11.webp";
import asset_item5_image from "@/assets/game/private-scenes/4/14.webp";
import asset_item6_image from "@/assets/game/private-scenes/4/17.webp";
import SceneUtils from "@/utils/SceneUtils";

class PrivateScene4Preload {
    static preload(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        gameScene.load.image("item_1" + suffix, asset_item1_image);
        gameScene.load.image("item_2" + suffix, asset_item2_image);
        gameScene.load.image("item_3" + suffix, asset_item3_image);
        gameScene.load.image("item_4" + suffix, asset_item4_image);
        gameScene.load.image("item_5" + suffix, asset_item5_image);
        gameScene.load.image("item_6" + suffix, asset_item6_image);
    }

    static load(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        let items = [
            { name: "item_1", x: 506, y: 166, custom_depth: 63, show_item: true, show_controller: false }, //Ok
            { name: "item_2", x: 688, y: 137, custom_depth: 97, show_item: true, show_controller: false }, //Ok
            { name: "item_3", x: 505, y: 416, custom_depth: 92, show_item: true, show_controller: false }, //Ok
            { name: "item_4", x: 506, y: 657, custom_depth: 93, show_item: true, show_controller: false }, //Ok
            { name: "item_5", x: 506, y: 657, custom_depth: 99, show_item: true, show_controller: false }, //Ok
            { name: "item_6", x: 867, y: 657, custom_depth: 165, show_item: true, show_controller: false }, //Ok
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
        //TODO: Nuevo rederizado * 2
        const sprite = gameScene.add.image(item.x * 2, item.y * 2, item.name + suffix)
            .setOrigin(0.5, 1)
            .setDepth(item.custom_depth || item.y)
            .setName(item.name + suffix)
            //TODO: Nuevo rederizado * 2
            .setScale(2);
        if (item.show_controller) {
            // Si es un item que se puede mover, añadimos el controlador
            SceneUtils.moveItem(gameScene, sprite);
        }
    }
}

export default PrivateScene4Preload;