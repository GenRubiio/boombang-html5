
const GachaSpinController = require('../../controllers/game/lobby/GachaSpinController');
const GachaGetPrizesController = require('../../controllers/game/lobby/GachaGetPrizesController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');
const SettingsUpdateGraphicsController = require('../../controllers/game/lobby/SettingsUpdateGraphicsController');
const SettingsUpdateLangController = require('../../controllers/game/lobby/SettingsUpdateLangController');
const SettingsUpdateNameController = require('../../controllers/game/lobby/SettingsUpdateNameController');
const SettingsUpdateSoundsController = require('../../controllers/game/lobby/SettingsUpdateSoundsController');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.LOBBY_GACHA_SPIN, (data) => {
        GachaSpinController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_GACHA_PRIZES, (data) => {
        GachaGetPrizesController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SETTINGS_UPDATE_GRAPHICS, (data) => {
        SettingsUpdateGraphicsController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SETTINGS_UPDATE_LANG, (data) => {
        SettingsUpdateLangController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SETTINGS_UPDATE_NAME, (data) => {
        SettingsUpdateNameController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SETTINGS_UPDATE_SOUNDS, (data) => {
        SettingsUpdateSoundsController.main(socket, io, data);
    });
};