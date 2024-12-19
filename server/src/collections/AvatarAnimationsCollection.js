class AvatarAnimationsCollection {
    constructor() {
        this.collection = new Map();
    }

    add(key, data) {
        this.collection.set(key, data);
    }

    getAllValues() {
        return Array.from(this.collection.values());
    }

    getAllData() {
        return this.collection;
    }

}

module.exports = new AvatarAnimationsCollection();