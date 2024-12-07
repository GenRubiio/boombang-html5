class AnimationsController {
    static main(gameScene) {
        this.playerAnimations(gameScene);
    }

    static playerAnimations(gameScene) {
        this.playWalkAnimation(gameScene, "walk_down_left", { start: 46, end: 60 });// 76
        this.playWalkAnimation(gameScene, "walk_down", { start: 110, end: 124 }); // 125
        this.playWalkAnimation(gameScene, "walk_left", { start: 78, end: 92 }); // 108
        this.playWalkAnimation(gameScene, "walk_up", { start: 0, end: 14 }); // 15
        this.playWalkAnimation(gameScene, "walk_up_left", { start: 16, end: 29 }); // 44
        this.playWalkAnimation(gameScene, "walk_up_right", { start: 30, end: 43 }); // 45
        this.playWalkAnimation(gameScene, "walk_down_right", { start: 61, end: 75 }); // 77
        this.playWalkAnimation(gameScene, "walk_right", { start: 93, end: 107 }); // 109
    }

    static playWalkAnimation(gameScene, key, frames) {
        gameScene.anims.create({
            key: key,
            frames: gameScene.anims.generateFrameNumbers("player_spritesheet", frames),
            frameRate: (Math.round(((frames.end - frames.start) / 0.75))),
            repeat: -1,
        });
    }
}

export default AnimationsController;