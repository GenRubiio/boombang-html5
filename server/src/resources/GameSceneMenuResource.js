const Resource = require('./Resource');

class GameSceneMenuResource extends Resource {
    transform(data) {
        return {
            uuid: data.uuid,
            id: data.id,
            name: data.name,
            type: data.type,
            total_users_in: data.countVisitors()
        };
    }
}

module.exports = GameSceneMenuResource;