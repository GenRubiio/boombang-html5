const LoginController = require('../controllers/auth/LoginController');
const RegisterController = require('../controllers/auth/RegisterController');

module.exports = (socket, io) => {
    socket.on('login', (data) => {
        LoginController.main(socket, io, data);
    });
    socket.on('register', (data) => {
        RegisterController.main(socket, io, data);
    });
};