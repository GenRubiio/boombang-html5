const publicAreasCollection = require('../../../collections/publicAreasCollection');
const PublicAreaMenuResource = require('../../../resources/PublicAreaMenuResource');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

class UpdatePublicAreasController {
    static async main(io) {
        try {
            const areas = await publicAreasCollection.getAll();
            const publicAreaMenuResource = PublicAreaMenuResource.collection(areas);
            io.emit('update_public_areas', publicAreaMenuResource);
        } catch (err) {
            console.log(err);
            logger.log(`Error updating public areas: ${err.message}`, 'error');
        }
    }
}

module.exports = UpdatePublicAreasController;