const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const PublicAreaMenuResource = require('../../../resources/PublicAreaMenuResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class UpdatePublicAreasController {
    static async main(io) {
        try {
            const areas = await PublicAreasCollection.getAll();
            const publicAreaMenuResource = PublicAreaMenuResource.collection(areas);
            io.emit(ResponseSocketsEnum.UPDATE_PUBLIC_AREAS, publicAreaMenuResource);
        } catch (err) {
            Log.error('Error in UpdatePublicAreasController: ' + err);
        }
    }
}

module.exports = UpdatePublicAreasController;