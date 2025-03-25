
const GetPublicScenesController = require('../../../controllers/game/areas/GetPublicScenesController');
const UserJoinPublicSceneController = require('../../../controllers/game/areas/UserJoinPublicSceneController');
const GetPublicSceneDataController = require('../../../controllers/game/areas/GetPublicSceneDataController');
const GetPublicSceneUsersController = require('../../../controllers/game/areas/GetPublicSceneUsersController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREAS, () => {
        GetPublicScenesController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.JOIN_PUBLIC_AREA, async (data) => {
        UserJoinPublicSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREA_DATA, async (data) => {
        GetPublicSceneDataController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_AREA_USERS, async (data) => {
        GetPublicSceneUsersController.main(socket, io, data);
    });
};