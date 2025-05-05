const SceneModel = require('./SceneModel');

class MinigameSceneModel extends SceneModel {
    constructor(row) {
        super(row); // Llama al constructor de la clase padre
        this.position_users = JSON.parse(row.position_users);
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = MinigameSceneModel; 