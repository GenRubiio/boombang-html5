const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class GameSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.GAME_SCENE;// Tipo de modelo
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = GameSceneModel; 