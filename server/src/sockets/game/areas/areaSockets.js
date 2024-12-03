
const userMoveContorller = require('../../../controllers/game/areas/userMoveContorller');
const userLeaveAreaController = require('../../../controllers/game/areas/userLeaveAreaController');

module.exports = (socket, io) => {
    socket.on('request:user_move', (data) => {
        userMoveContorller.main(socket, io, data);
    });
    socket.on('request:user_leave_area', () => {
        userLeaveAreaController.main(socket, io);
    });
};