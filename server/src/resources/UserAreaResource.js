const Resource = require('./Resource');
class UserAreaResource extends Resource {
    async transform(data) {
        return {
            id: data.socket.id,
            x: data.currentAreaPosition.x,
            y: data.currentAreaPosition.y,
            z: data.currentAreaPosition.z,
            avatar_id: Math.floor(Math.random() * 17) + 1,//data.avatarId
            animations: [],
        };
    }
}

module.exports = UserAreaResource;