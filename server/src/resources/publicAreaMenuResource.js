const Resource = require('./Resource');

class PublicAreaMenuResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            name: data.name,
            total_users_in: data.users.length
        };
    }
}

module.exports = PublicAreaMenuResource;