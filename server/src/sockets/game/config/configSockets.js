
const GetIslandsConfigController = require('../../../controllers/game/config/GetIslandsConfigController');
const GetPrivateSceneConfigByIslandController = require('../../../controllers/game/config/GetPrivateSceneConfigByIslandController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_ISLANDS_CONFIG, (data) => {
        GetIslandsConfigController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.GET_PRIVATE_SCENE_CONFIG_BY_ISLAND, (data) => {
        GetPrivateSceneConfigByIslandController.main(socket, io, data);
    });
};
