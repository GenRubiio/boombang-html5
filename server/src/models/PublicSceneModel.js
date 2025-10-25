const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const NpcModel = require('./NpcModel');

class PublicSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.parent_id = row.parent_id; // ID del área padre
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.PUBLIC_SCENE;// Tipo de modelo
        this.big_scene = row.big_scene; // Indica si la escena es grande
        this.sound = row.sound; // Sonido ambiental de la escena
        this.sound_url = row.sound_url; // URL completa del sonido
        this.darkening = row.darkening; // Indica si la escena tiene oscurecimiento
        this.base_api_url = row.base_api_url ? row.base_api_url : ''; // URL base para los recursos
        this.assets_data = row.assets_data ? row.assets_data : []; // Datos de los assets en formato JSON
        this.npc = row.npc ? new NpcModel(row.npc) : null; // Datos del NPC asociado a la escena
        this.arrows = row.arrows ? row.arrows : []; // Flechas de navegación en la escena
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PublicSceneModel; 