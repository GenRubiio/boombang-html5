const publicAreasCollection = require('../../../collections/publicAreasCollection');
const PublicAreaMenuResource = require('../../../resources/publicAreaMenuResource');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

const main = async (io) => {
    try {
        const areas = await publicAreasCollection.getAll();
        const publicAreaMenuResource = PublicAreaMenuResource.collection(areas);
        io.emit('update_public_areas', publicAreaMenuResource);
    } catch (err) {
        console.log(err);
        logger.log(`Error updating public areas: ${err.message}`, 'error');
    }
};

module.exports = { main };