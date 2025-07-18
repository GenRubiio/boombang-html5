const SceneModel = require('./SceneModel');
const SceneTypesEnum = require('../enums/SceneTypesEnum');
const MinigameInstancesCollection = require('../collections/MinigameInstancesCollection');

class GameSceneModel extends SceneModel {
    constructor(uuid, row) {
        super(row); // Llama al constructor de la clase padre
        this.uuid = uuid; // UUID único de la escena
        this.max_users = row.max_users; // Número máximo de usuarios permitidos en el área
        this.scene_type = SceneTypesEnum.GAME_SCENE;// Tipo de modelo
    }
    // Puedes agregar métodos adicionales o sobrescribir los existentes si es necesario

    countVisitors() {
        let count = this.users.length;
        switch (this.type) {
            case 100:// Ring
                let minigameScenes = MinigameInstancesCollection.getBySceneType(SceneTypesEnum.MINIGAME_RING);
                minigameScenes.forEach(scene => {
                    count += scene.users.length;
                });
                break;
        }
        return count;
    }
}

module.exports = GameSceneModel; 