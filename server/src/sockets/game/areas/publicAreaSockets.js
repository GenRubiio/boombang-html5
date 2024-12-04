
const GetPublicAreasController = require('../../../controllers/game/areas/GetPublicAreasController');
const JoinPublicAreaController = require('../../../controllers/game/areas/JoinPublicAreaController');
const GetPublicAreaDataController = require('../../../controllers/game/areas/GetPublicAreaDataController');

module.exports = (socket, io) => {
    socket.on('get_public_areas', () => {
        GetPublicAreasController.main(socket, io);
    });
    socket.on('request:join_public_area', async (data) => {
        JoinPublicAreaController.main(socket, io, data);
    });
    socket.on('request:get_public_area_data', async (data) => {
        GetPublicAreaDataController.main(socket, io, data);
    });
};