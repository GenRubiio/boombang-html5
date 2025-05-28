import asset_backgroundImage from "../../../assets/game/scenarios/100/background.webp";
import asset_npcImage from "../../../assets/game/npc/wise_ring.webp";
import SceneUtils from "../../../utils/SceneUtils"; // Utilidad para cargar NPCs
import NpcEnum from "../../../enums/NpcEnum"; // Enum para NPCs

class RingScenePreload {
    static preload(gameScene) {
        gameScene.load.image("background_ring", asset_backgroundImage);
        gameScene.load.image("npc_ring", asset_npcImage);
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