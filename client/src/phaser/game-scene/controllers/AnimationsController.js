class AnimationsController {
    static main(gameScene) {
        this.playerAnimations(gameScene);
    }

    static playerAnimations(gameScene) {
        this.playWalkAnimation(gameScene, "walk_down_left", { start: 0, end: 14 });
        this.playWalkAnimation(gameScene, "walk_down", { start: 48, end: 62 });
        this.playWalkAnimation(gameScene, "walk_left", { start: 16, end: 30 });
        this.playWalkAnimation(gameScene, "walk_up", { start: 32, end: 46 });
        this.playWalkAnimation(gameScene, "walk_up_left", { start: 64, end: 77 });
        this.playWalkAnimation(gameScene, "walk_up_right", { start: 79, end: 92 });
        this.playWalkAnimation(gameScene, "walk_down_right", { start: 94, end: 108 });
        this.playWalkAnimation(gameScene, "walk_right", { start: 110, end: 124 });
    }

    static playWalkAnimation(gameScene, key, rightFrames) {
        gameScene.anims.create({
            key: key,
            frames: gameScene.anims.generateFrameNumbers("player_spritesheet", rightFrames),
            frameRate: (Math.round(((rightFrames.end - rightFrames.start) / 0.75))),
            repeat: -1,
        });
    }
}

export default AnimationsController;