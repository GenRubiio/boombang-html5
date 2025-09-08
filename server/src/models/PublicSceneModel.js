const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const NpcModel = require('./NpcModel');

class PublicSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.PUBLIC_SCENE;// Tipo de modelo
        this.base_api_url = row.base_api_url ? row.base_api_url : ''; // URL base para los recursos
        this.assets_data = row.assets_data ? row.assets_data : []; // Datos de los assets en formato JSON
        this.npc = row.npc ? new NpcModel(row.npc) : null; // Datos del NPC asociado a la escena
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PublicSceneModel; 