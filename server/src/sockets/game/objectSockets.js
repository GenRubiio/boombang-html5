
const RotateObjectController = require('../../controllers/game/objects/RotateObjectController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.ROTATE_OBJECT, (data) => {
        RotateObjectController.main(socket, io, data);
    });
};