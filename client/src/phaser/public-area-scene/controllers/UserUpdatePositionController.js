import UserIdleAnimation from "../animations/UserIdleAnimation.js";

class UserUpdatePositionController {
    static main(gameScene, data) {
        const socketId = data.socket_id;
        const position = data.position;
        console.log(gameScene.players[socketId])
        if (!gameScene.players[socketId]) return;

        const playerModel = gameScene.players[socketId];
        playerModel.position = position;

        console.log(`Updating player ${socketId} position to:`, position);
        console.log(playerModel)
        UserIdleAnimation.playDefaultFrame(gameScene, socketId, playerModel.sprite_player, position.z, playerModel.avatar_id);
    }
}

export default UserUpdatePositionController;
