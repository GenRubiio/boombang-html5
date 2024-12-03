
const getPublicAreasController = require('../../../controllers/game/areas/getPublicAreasController');
const joinPublicAreaController = require('../../../controllers/game/areas/joinPublicAreaController');
const getPublicAreaDataController = require('../../../controllers/game/areas/getPublicAreaDataController');

module.exports = (socket, io) => {
    socket.on('get_public_areas', () => {
        getPublicAreasController.main(socket, io);
    });
    socket.on('request:join_public_area', async (data) => {
        joinPublicAreaController.main(socket, io, data);
    });
    socket.on('request:get_public_area_data', async (data) => {
        getPublicAreaDataController.main(socket, io, data);
    });
};