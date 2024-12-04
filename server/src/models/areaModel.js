class AreaModel {
    constructor(id, name, map_width, map_height, game_map, startPosition) {
        this.id = id;
        this.name = name;
        this.users = []; // Lista vacía de usuarios
        this.map_width = map_width;
        this.map_height = map_height;
        this.game_map = game_map;
        this.startPosition = startPosition; // Posición de inicio del área {x, y, z}
    }

    // Método para añadir un usuario
    addUser(user) {
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

    // Implementación del algoritmo A*
    findPath(startPos, endPos, customMap) {
        const EasyStar = require('easystarjs').js;

        const easystar = new EasyStar();

        // Usar el mapa personalizado si se proporciona
        const mapToUse = customMap || this.game_map;

        easystar.setGrid(mapToUse);
        easystar.setAcceptableTiles([0]); // 0 es caminable
        easystar.enableDiagonals();
        easystar.enableCornerCutting();

        return new Promise((resolve, reject) => {
            easystar.findPath(startPos.x, startPos.y, endPos.x, endPos.y, function (path) {
                if (path === null) {
                    resolve(null);
                } else {
                    resolve(path);
                }
            });
            easystar.calculate();
        });
    };

    getNavigationMapWithPlayers(excludeUserId) {
        // Clonar el mapa original
        let navigationMap = JSON.parse(JSON.stringify(this.game_map));

        // Marcar las posiciones de los jugadores como obstáculos
        this.users.forEach(user => {
            if (user.id !== excludeUserId) {
                const pos = user.currentAreaPosition;
                navigationMap[pos.y][pos.x] = 1; // 1 representa un obstáculo
            }
        });

        return navigationMap;
    };
}

module.exports = AreaModel;
