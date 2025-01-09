class UserUppercutAnimation {
    static main(gameScene, socketId, spritePlayer, direction, attacker, avatarId) {
        if (attacker) {
            const textureKey = direction + "_punch_doy";
            const animationData = window.avatars_config[avatarId][textureKey];
            spritePlayer.setFlipX(animationData.flip_horizontally);
            spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
            spritePlayer.play(avatarId + "_" + textureKey);
        }
        else {
            const textureKey = direction + "_punch_rec";
            const animationData = window.avatars_config[avatarId][textureKey];
            spritePlayer.setFlipX(animationData.flip_horizontally);
            spritePlayer.setOrigin(animationData.originX + (animationData.offsetX / animationData.frameWidth), animationData.originY + (animationData.offsetY / animationData.frameHeight));
            spritePlayer.play(avatarId + "_" + textureKey);
        }
    }
}

export default UserUppercutAnimation;