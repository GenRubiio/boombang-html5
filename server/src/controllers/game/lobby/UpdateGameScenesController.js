const GameScenesCollection = require('../../../collections/GameScenesCollection');
const GameSceneMenuResource = require('../../../resources/GameSceneMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class UpdateGameScenesController {
    static async main() {
        try {
            const scenes = await GameScenesCollection.getAll();
            const gameSceneMenuResource = GameSceneMenuResource.collection(scenes);
            const usersNotInArea = ConnectedUsersCollection.getAllNotInArea();
            for (let user of usersNotInArea) {
                user.socket.emit(ResponseSocketsEnum.UPDATE_GAME_SCENES, gameSceneMenuResource);
            }
        } catch (err) {
            Log.error('Error in UpdateGameScenesController: ' + err);
        }
    }
}

module.exports = UpdateGameScenesController;