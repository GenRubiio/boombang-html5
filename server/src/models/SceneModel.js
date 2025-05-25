const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const MovementProcessorInstance = require('../instances/MovementProcessorInstance');

class SceneModel {
    constructor(row) {
        this.id = row.id;
        this.name = row.name;
        this.type = row.type; //Tipo de escena un idetificador de escena para cargar sus componentes
        this.menu_type = row.menu_type; // Tipo de menú para la escena
        this.map_width = row.map_width;
        this.map_height = row.map_height;
        this.game_map = JSON.parse(row.map);
        this.startPosition = row.start_position; // Posición de inicio del área {x, y, z}
        this.movementBlocked = false; // Indica si el movimiento está bloqueado

        this.users = []; // Lista vacía de usuarios
        // Guardamos una copia base del mapa para evitar clonaciones repetidas
        this.navigationMapBase = JSON.parse(row.map);
        // Objeto para reservar tiles: clave "x,y" → id del usuario
        this.reservedTiles = {};

        // Inicializar el procesador de movimiento
        this.movementProcessorInstance = new MovementProcessorInstance(this);
        this.movementProcessorInstance.startProcessing();
    }

    // Método para añadir un usuario
    addUser(user) {
        if (this.users.includes(user)) {
            logger.log('User already in area', 'error');
            return;
        }
        // Inicializamos la posición actual del usuario si no existe
        if (!user.currentAreaPosition) {
            user.currentAreaPosition = { ...this.startPosition };
        }
        // Propiedad para recordar la casilla reservada previamente
        user.lastReservedTile = null;
        this.users.push(user);
    }

    // Método para devolver la lista de usuarios
    getUsers() {
        return this.users;
    }

    // Método para comprobar si un usuario está en el área
    containsUser(user) {
        return this.users.includes(user);
    }

    // Método para eliminar un usuario
    removeUser(user) {
        // Liberar su última reserva si existe
        if (user.lastReservedTile) {
            delete this.reservedTiles[user.lastReservedTile];
        }
        this.users = this.users.filter(u => u !== user);
    }

    // Método para emitir un evento a todos los usuarios del área
    emit(event, data) {
        this.users.forEach(user => {
            user.socket.emit(event, data);
        });
    }

    // Método para emitir un evento a todos los usuarios del área excepto uno
    emitToAllExcept(event, data, excludedUser) {
        this.users.forEach(user => {
            if (user !== excludedUser) {
                user.socket.emit(event, data);
            }
        });
    }

    // Combina el mapa base con las posiciones actuales de otros usuarios y las reservas
    getNavigationMapWithPlayers(excludeUserId) {
        // Clonar la copia base del mapa
        let navigationMap = JSON.parse(JSON.stringify(this.navigationMapBase));

        // Marcar las posiciones actuales de los demás usuarios
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                navigationMap[pos.y][pos.x] = 1;
            }
        });

        // Marcar las casillas reservadas
        for (let key in this.reservedTiles) {
            const [x, y] = key.split(',').map(Number);
            navigationMap[y][x] = 1;
        }

        return navigationMap;
    }
}

module.exports = SceneModel;
