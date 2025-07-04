const GameScenesCollection = require('../../../collections/GameScenesCollection');
const PublicSceneMenuResource = require('../../../resources/PublicSceneMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class UpdateGameScenesController {
    static async main() {
        try {
            const scenes = await GameScenesCollection.getAll();
            const publicSceneMenuResource = PublicSceneMenuResource.collection(scenes);
            const usersNotInArea = ConnectedUsersCollection.getAllNotInArea();
            for (let user of usersNotInArea) {
                user.socket.emit(ResponseSocketsEnum.UPDATE_GAME_SCENES, publicSceneMenuResource);
            }
        } catch (err) {
            Log.error('Error in UpdateGameScenesController: ' + err);
        }
    }
}

module.exports = UpdateGameScenesController;