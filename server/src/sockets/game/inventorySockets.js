const GetPublicInventoryController = require('../../controllers/game/inventory/GetPublicInventoryController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_PUBLIC_INVENTORY, async () => {
        GetPublicInventoryController.main(socket, io);
    });
};
