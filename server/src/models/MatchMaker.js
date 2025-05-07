const MinigamesEnum = require('../enums/MinigamesEnum');
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameRingSceneInstance = require('../controllers/game/instances/MinigameRingSceneInstance');

class MatchMaker {
    constructor(requiredPlayers) {
        this.requiredPlayers = requiredPlayers;
        // Map<type, Array<socket>>
        this.waitingLists = new Map();
        // Map<roomId, GameRoom>
        this.rooms = new Map();
    }

    register(socket, type, onMatchFound) {
        if (!this.waitingLists.has(type)) {
            this.waitingLists.set(type, []);
        }
        const queue = this.waitingLists.get(type);

        // Evitar duplicados
        if (queue.includes(socket)) return;
        queue.push(socket);

        // Si ya hay suficientes, extraer y llamar callback
        if (queue.length >= this.requiredPlayers) {
            const players = queue.splice(0, this.requiredPlayers);
            onMatchFound(players, type);
        }
    }

    createMinigame(type, players) {
        console.log('Creando sala de minijuego:');
        let minigame = null;
        switch (type) {
            case MinigamesEnum.GOLDEN_RING:
                let sceneModel = MinigameScenesCollection.getByUid(type);
                minigame = new MinigameRingSceneInstance(sceneModel, players);
                break;
            default:
                throw new Error(`Tipo de sala desconocido: ${type}`);
        }
        console.log("hola");
        //for (const player of players) {
        //    minigame.addUser(player.user);
        //    player.user.currentArea = minigame;
        //}
        //const room = new GameRoom(type, players);
        //this.rooms.set(room.id, room);
        //return room;
    }

    // (Opcional) Recuperar sala por ID
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    unregister(socket, type) {
        const queue = this.waitingLists.get(type) || [];
        this.waitingLists.set(
            type,
            queue.filter(s => s !== socket)
        );
    }
}

module.exports = MatchMaker;