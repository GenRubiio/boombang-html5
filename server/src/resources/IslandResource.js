const Resource = require('./Resource');

class IslandResource extends Resource {
    transform(data) {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            type: data.type,
            is_uppercut_active: data.isUppercutActive,
            user_id: data.userId,
            count_users: data.countUsers || 0, // Default to 0 if not provided
            scenes: data.scenes || [], // Default to empty array if not provided
        };
    }
}

module.exports = IslandResource;