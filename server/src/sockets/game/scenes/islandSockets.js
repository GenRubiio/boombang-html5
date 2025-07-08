
const CreateIslandController = require('../../../controllers/game/islands/CreateIslandController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.ISLAND_CREATE, (data) => {
        CreateIslandController.main(socket, io, data);
    });
};