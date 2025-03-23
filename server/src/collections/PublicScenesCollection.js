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

    remove(id) {
        this.collection.delete(socketId);
    }

    getAll() {
        return Array.from(this.collection.values());
    }
}

module.exports = new PublicScenesCollection();