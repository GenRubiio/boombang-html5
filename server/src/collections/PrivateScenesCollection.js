class PrivateScenesCollection {
    constructor() {
        this.collection = new Map();
    }

    add(id, item) {
        this.collection.set(id, item);
    }

    getById(id) {
        return this.collection.get(id);
    }

    getAll() {
        return Array.from(this.collection.values());
    }

    getByIslandId(islandId) {
        return Array.from(this.collection.values()).filter(scene => scene.island_id === islandId);
    }

    remove(id) {
        this.collection.delete(id);
    }
}

module.exports = new PrivateScenesCollection();