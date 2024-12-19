const Resource = require('./Resource');
const AnimationsController = require('../controllers/game/AnimationsController');

class UserAreaResource extends Resource {
    async transform(data) {
        return {
            id: data.socket.id,
            x: data.currentAreaPosition.x,
            y: data.currentAreaPosition.y,
            z: data.currentAreaPosition.z,
            avatar_id: data.avatarId,
            animations: await AnimationsController.main(data),
        };
    }
}

module.exports = UserAreaResource;