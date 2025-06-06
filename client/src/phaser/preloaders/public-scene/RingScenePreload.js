import asset_background_image from "../../../assets/game/scenarios/100/background.webp";
import asset_npc_image from "../../../assets/game/npc/wise_ring.webp";
import SceneUtils from "../../../utils/SceneUtils"; // Utilidad para cargar NPCs
import NpcEnum from "../../../enums/NpcEnum"; // Enum para NPCs

class RingScenePreload {
    static preload(gameScene) {
        gameScene.load.image("background_ring", asset_background_image);
        gameScene.load.image("npc_ring", asset_npc_image);
    }

    static load(gameScene) {
        this.loadBackground(gameScene);
        SceneUtils.loadNpc(2, 0, gameScene, "npc_ring", NpcEnum.WISE_RING); // Cargar NPC usando la utilidad
    }

    static loadBackground(gameScene) {
        const background = gameScene.add.image(0, 0, "background_ring").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }
}

export default RingScenePreload;