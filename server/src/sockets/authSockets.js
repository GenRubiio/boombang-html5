const LoginController = require('../controllers/auth/LoginController');

module.exports = (socket, io) => {
    socket.on('login', (data) => {
        LoginController.main(socket, io, data);
    });
};