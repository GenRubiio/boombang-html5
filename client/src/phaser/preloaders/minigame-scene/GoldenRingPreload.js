import asset_backgroundImage from "../../../assets/game/minigame-scenes/1/background.webp";

class GoldenRingPreload {
    static main(gameScene) {
        gameScene.load.image("background_golden_ring", asset_backgroundImage);
    }
}

export default GoldenRingPreload;