
const GetPublicAreasController = require('../../../controllers/game/areas/GetPublicAreasController');
const UserJoinPublicAreaController = require('../../../controllers/game/areas/UserJoinPublicAreaController');
const GetPublicAreaDataController = require('../../../controllers/game/areas/GetPublicAreaDataController');
const GetPublicAreaUsersController = require('../../../controllers/game/areas/GetPublicAreaUsersController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREAS, () => {
        GetPublicAreasController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.JOIN_PUBLIC_AREA, async (data) => {
        UserJoinPublicAreaController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
        GetPublicAreaDataController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREA_USERS, async (data) => {
        GetPublicAreaUsersController.main(socket, io, data);
    });
};