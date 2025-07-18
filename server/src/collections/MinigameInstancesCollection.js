class MinigameInstancesCollection {
    constructor() {
        this.collection = new Map();
    }

    add(uuid, item) {
        this.collection.set(uuid, item);
    }

    getByUid(uid) {
        return this.collection.get(uid);
    }

    getAll() {
        return Array.from(this.collection.values());
    }

    getBySceneType(type) {
        return Array.from(this.collection.values()).filter(item => item.scene_type == type);
    }

    remove(uuid) {
        if (this.collection.has(uuid)) {
            this.collection.delete(uuid);
        } else {
            throw new Error(`Minigame instance with UUID ${uuid} not found.`);
        }
    }
}

module.exports = new MinigameInstancesCollection();