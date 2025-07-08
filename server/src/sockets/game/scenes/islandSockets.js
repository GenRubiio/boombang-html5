
const CreateIslandController = require('../../../controllers/game/islands/CreateIslandController');
const GetMyIslandsController = require('../../../controllers/game/islands/GetMyIslandsController');
const JoinIslandController = require('../../../controllers/game/islands/JoinIslandController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.ISLAND_CREATE, (data) => {
        CreateIslandController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_MY_ISLANDS, (data) => {
        GetMyIslandsController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.JOIN_ISLAND, (data) => {
        JoinIslandController.main(socket, io, data);
    });
};