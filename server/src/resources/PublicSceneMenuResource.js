const Resource = require('./Resource');

class PublicSceneMenuResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            name: data.name,
            total_users_in: data.users.length
        };
    }
}

module.exports = PublicSceneMenuResource;