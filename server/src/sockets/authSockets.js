const loginController = require('../controllers/auth/loginController');

module.exports = (socket, io) => {
    socket.on('login', (data) => {
        loginController.main(socket, io, data);
    });
};