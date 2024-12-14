const LoginController = require('../controllers/auth/LoginController');
const RegisterController = require('../controllers/auth/RegisterController');
const RequestSocketsEnum = require('../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.LOGIN, (data) => {
        LoginController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.REGISTER, (data) => {
        RegisterController.main(socket, io, data);
    });
};