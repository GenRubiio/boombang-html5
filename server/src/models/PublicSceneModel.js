const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class PublicSceneModel extends SceneModel {
    constructor(row) {
        super(row); // Llama al constructor de la clase padre
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.PUBLIC_SCENE;// Tipo de modelo
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PublicSceneModel; 