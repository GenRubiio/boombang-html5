
const CreateIslandController = require('../../../controllers/game/islands/CreateIslandController');
const GetMyIslandsController = require('../../../controllers/game/islands/GetMyIslandsController');
const JoinIslandController = require('../../../controllers/game/islands/JoinIslandController');
const GetPublicIslandsController = require('../../../controllers/game/islands/GetPublicIslandsController');
const UpdateIslandNameController = require('../../../controllers/game/islands/UpdateIslandNameController');
const UpdateIslandDescriptionController = require('../../../controllers/game/islands/UpdateIslandDescriptionController');
const SearchIslandsController = require('../../../controllers/game/islands/SearchIslandsController');
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
    socket.on(RequestSocketsEnum.GET_PUBLIC_ISLANDS, (data) => {
        GetPublicIslandsController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.UPDATE_ISLAND_NAME, (data) => {
        UpdateIslandNameController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.UPDATE_ISLAND_DESCRIPTION, (data) => {
        UpdateIslandDescriptionController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SEARCH_ISLANDS, (data) => {
        SearchIslandsController.main(socket, io, data);
    });
};