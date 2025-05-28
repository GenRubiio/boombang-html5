import UfoScenePreload from "../preloaders/public-scene/UfoScenePreload";
import RingScenePreload from "../preloaders/public-scene/RingScenePreload";
import PublicSceneEnum from "../../enums/PublicSceneEnum";

class PublicSceneLoader {
    static main(gameScene, sceneType, preload = true) {
        switch (sceneType) {
            case PublicSceneEnum.UFO:
                //TODO: el import debe producirse aquí
                preload ? UfoScenePreload.preload(gameScene) : UfoScenePreload.load(gameScene);
                break;
            case PublicSceneEnum.RING:
                preload ? RingScenePreload.preload(gameScene) : RingScenePreload.load(gameScene);
                break;
        }
        if (preload) {
            this.#loadItems(gameScene);
        }
    }

    static async #loadItems(gameScene) {
        for (const item of gameScene.sceneData.scenery.items) {
            const { default: itemImage } = await import(`../../assets/game/items-scene/${item.file_name}.png`);
            gameScene.load.image(item.file_name, itemImage);
        }
    }
}

export default PublicSceneLoader;