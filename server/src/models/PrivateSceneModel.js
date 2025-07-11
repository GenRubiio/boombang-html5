const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const IslandModel = require('./IslandModel');

class PrivateSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.PRIVATE_SCENE;// Tipo de modelo
        this.colors = row.colors ? JSON.parse(row.colors) : {}; // Colores personalizados de la escena
        this.has_password = row.has_password || null; // Contraseña de la escena privada
        this.my_scene = row.my_scene || false; // Indica si es la escena del usuario
        //this.objects = row.objects ? row.objects.map(item => new SceneItemModel(item)) : []; // Lista de objetos activos en la escena
        this.objects = row.objects || []; // Lista de objetos activos en la escena
        this.island = new IslandModel(row.island); // Isla asociada a la escena
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario
}

module.exports = PrivateSceneModel; 