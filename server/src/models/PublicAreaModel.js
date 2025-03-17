const AreaModel = require('./AreaModel');

class PublicAreaModel extends AreaModel {
    constructor(row) {
        super(row); // Llama al constructor de la clase padre
    }

    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PublicAreaModel; 