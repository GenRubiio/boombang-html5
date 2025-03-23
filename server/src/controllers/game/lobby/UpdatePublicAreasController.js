const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const PublicSceneMenuResource = require('../../../resources/PublicSceneMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class UpdatePublicAreasController {
    static async main(io) {
        try {
            const areas = await PublicScenesCollection.getAll();
            const publicSceneMenuResource = PublicSceneMenuResource.collection(areas);
            const useNotInArea = ConnectedUsersCollection.getAllNotInArea();
            for (let user of useNotInArea) {
                user.socket.emit(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, publicSceneMenuResource);
            }
        } catch (err) {
            Log.error('Error in UpdatePublicAreasController: ' + err);
        }
    }
}

module.exports = UpdatePublicAreasController;