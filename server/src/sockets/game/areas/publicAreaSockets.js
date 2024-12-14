
const GetPublicAreasController = require('../../../controllers/game/areas/GetPublicAreasController');
const JoinPublicAreaController = require('../../../controllers/game/areas/JoinPublicAreaController');
const GetPublicAreaDataController = require('../../../controllers/game/areas/GetPublicAreaDataController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREAS, () => {
        GetPublicAreasController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.JOIN_PUBLIC_AREA, async (data) => {
        JoinPublicAreaController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
        GetPublicAreaDataController.main(socket, io, data);
    });
};