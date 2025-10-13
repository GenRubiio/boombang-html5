const Resource = require('./Resource');
const GameClock = require('../utils/GameClock');

class GameSceneMenuResource extends Resource {
    transform(data) {
        return {
            game_time: GameClock.getCurrentGameTime(),
            uuid: data.uuid,
            id: data.id,
            name: data.name,
            type: data.type,
            total_users_in: data.countVisitors()
        };
    }
}

module.exports = GameSceneMenuResource;