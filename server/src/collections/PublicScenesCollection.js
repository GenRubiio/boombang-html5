class PublicScenesCollection {
    constructor() {
        this.collection = new Map();
    }

    add(uuid, item) {
        this.collection.set(uuid, item);
    }

    getByUid(uid) {
        return this.collection.get(uid);
    }

    getById(id) {
        for (let scene of this.collection.values()) {
            if (scene.id == id) {
                return scene;
            }
        }
        return null;
    }

    getAll() {
        return Array.from(this.collection.values());
    }

    getAllParentIdNull() {
        return Array.from(this.collection.values()).filter(scene => (scene.parent_id == null || scene.parent_id == 0));
    }
}

module.exports = new PublicScenesCollection();