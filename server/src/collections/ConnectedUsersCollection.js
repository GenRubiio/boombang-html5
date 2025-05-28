class ConnectedUsersCollection {
    constructor() {
        this.collection = new Map(); // Almacena usuarios conectados: socketId -> userModel
    }

    // Agregar un usuario
    add(socketId, userId) {
        this.collection.set(socketId, userId);
    }

    // Obtener un usuario por su socketId
    getBySocketId(socketId) {
        return this.collection.get(socketId);
    }

    // Obtener el socketId de un usuario por su userId
    getSocketIdByUserId(userId) {
        for (let [socketId, user] of this.collection) {
            if (user.id === userId) {
                return socketId;
            }
        }
        return null;
    }

    // Eliminar un usuario
    removeUser(socketId) {
        this.collection.delete(socketId);
    }

    // Obtener todos los usuarios conectados
    getAll() {
        return Array.from(this.collection.values());
    }

    //Obtener todos los usuarios que no esten en un area
    getAllNotInArea() {
        let users = Array.from(this.collection.values());
        return users.filter(user => !user.currentArea);
    }

    // Obtener un usuario por su userId
    getByUserId(userId) {
        for (let [socketId, user] of this.collection) {
            if (user.id === userId) {
                return user;
            }
        }
        return null;
    }
}

module.exports = new ConnectedUsersCollection();