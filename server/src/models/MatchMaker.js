const MinigamesEnum = require('../enums/MinigamesEnum');
const MinigameScenesCollection = require('../collections/MinigameScenesCollection');
const MinigameRingSceneInstance = require('../instances/MinigameRingSceneInstance');

class MatchMaker {
    constructor(requiredPlayers) {
        this.requiredPlayers = requiredPlayers;
        // Map<type, Array<socket>>
        this.waitingLists = new Map();
        // Map<roomId, GameRoom>
        this.rooms = new Map();
    }

    register(socket, sceneType, onMatchFound) {
        if (!this.waitingLists.has(sceneType)) {
            this.waitingLists.set(sceneType, []);
        }
        const queue = this.waitingLists.get(sceneType);

        // Evitar duplicados
        if (queue.includes(socket)) return;
        queue.push(socket);

        // Si ya hay suficientes, extraer y llamar callback
        if (queue.length >= this.requiredPlayers) {
            const players = queue.splice(0, this.requiredPlayers);
            onMatchFound(players, sceneType);
        }
    }

    createMinigame(sceneType, players, io) {
        console.log('Creando sala de minijuego:');
        let minigame = null;
        switch (sceneType) {
            case MinigamesEnum.GOLDEN_RING:
                let sceneModel = MinigameScenesCollection.getByUid(sceneType);
                minigame = new MinigameRingSceneInstance(sceneModel, players, io);
                break;
            default:
                throw new Error(`Tipo de sala desconocido: ${sceneType}`);
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

    unregister(socket, sceneType) {
        const queue = this.waitingLists.get(sceneType) || [];
        this.waitingLists.set(
            sceneType,
            queue.filter(s => s !== socket)
        );
    }
}

module.exports = MatchMaker;