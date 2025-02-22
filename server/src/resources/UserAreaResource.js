const Resource = require('./Resource');
class UserAreaResource extends Resource {
    async transform(data) {
        return {
            id: data.socket.id,
            username: data.username,
            x: data.currentAreaPosition.x,
            y: data.currentAreaPosition.y,
            z: data.currentAreaPosition.z,
            avatar_id: data.avatarId,
            animations: [],
        };
    }
}

module.exports = UserAreaResource;