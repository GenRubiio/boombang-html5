const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const PublicSceneMenuResource = require('../../../resources/PublicSceneMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class UpdatePublicScenesController {
    static async main() {
        try {
            const scenes = await PublicScenesCollection.getAll();
            const publicSceneMenuResource = PublicSceneMenuResource.collection(scenes);
            const useNotInArea = ConnectedUsersCollection.getAllNotInArea();
            for (let user of useNotInArea) {
                user.socket.emit(ResponseSocketsEnum.UPDATE_PUBLIC_SCENES, publicSceneMenuResource);
            }
        } catch (err) {
            Log.error('Error in UpdatePublicScenesController: ' + err);
        }
    }
}

module.exports = UpdatePublicScenesController;