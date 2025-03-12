const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const PublicAreaMenuResource = require('../../../resources/PublicAreaMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class UpdatePublicAreasController {
    static async main(io) {
        try {
            const areas = await PublicAreasCollection.getAll();
            const publicAreaMenuResource = PublicAreaMenuResource.collection(areas);
            const useNotInArea = ConnectedUsersCollection.getAllNotInArea();
            for (let user of useNotInArea) {
                user.socket.emit(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, publicAreaMenuResource);
            }
        } catch (err) {
            Log.error('Error in UpdatePublicAreasController: ' + err);
        }
    }
}

module.exports = UpdatePublicAreasController;