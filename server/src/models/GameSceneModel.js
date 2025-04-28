const SceneModel = require('./SceneModel');

class GameSceneModel extends SceneModel {
    constructor(row) {
        super(row); // Llama al constructor de la clase padre
    }

    callUsers() {
        this.users.forEach(user => {
            user.socket.emit(ResponseSocketsEnum.GAME_SCENE, {
                scene: this.game_map,
                startPosition: this.startPosition,
                users: this.getUsers(),
            });
        });
    }
}

module.exports = GameSceneModel; 