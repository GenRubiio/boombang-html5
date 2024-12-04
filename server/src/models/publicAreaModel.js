const AreaModel = require('./AreaModel');

class PublicAreaModel extends AreaModel {
    constructor(id, name, map_width, map_height, game_map, startPosition) {
        super(id, name, map_width, map_height, game_map, startPosition); // Llama al constructor de la clase padre
    }

    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PublicAreaModel; 