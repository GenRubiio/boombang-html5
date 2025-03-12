class PublicAreasCollection {
    constructor() {
        this.collection = new Map();
    }

    add(uuid, publicArea) {
        this.collection.set(uuid, publicArea);
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

module.exports = new PublicAreasCollection();