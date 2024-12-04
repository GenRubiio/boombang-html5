const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const PublicAreaMenuResource = require('../../../resources/PublicAreaMenuResource');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class UpdatePublicAreasController {
    static async main(io) {
        try {
            const areas = await PublicAreasCollection.getAll();
            const publicAreaMenuResource = PublicAreaMenuResource.collection(areas);
            io.emit('update_public_areas', publicAreaMenuResource);
        } catch (err) {
            console.log(err);
            logger.log(`Error updating public areas: ${err.message}`, 'error');
        }
    }
}

module.exports = UpdatePublicAreasController;