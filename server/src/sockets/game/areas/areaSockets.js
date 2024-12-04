
const UserMoveController = require('../../../controllers/game/areas/UserMoveController');
const UserLeaveAreaController = require('../../../controllers/game/areas/UserLeaveAreaController');

module.exports = (socket, io) => {
    socket.on('request:user_move', (data) => {
        UserMoveController.main(socket, io, data);
    });
    socket.on('request:user_leave_area', () => {
        UserLeaveAreaController.main(socket, io);
    });
};