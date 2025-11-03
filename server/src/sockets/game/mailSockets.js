const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');
const MailGetInboxController = require('../../controllers/game/lobby/MailGetInboxController');
const MailMarkAsReadController = require('../../controllers/game/lobby/MailMarkAsReadController');
const MailClaimRewardController = require('../../controllers/game/lobby/MailClaimRewardController');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_MAIL_INBOX, (data) => {
        MailGetInboxController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.MARK_MAIL_READ, (data) => {
        MailMarkAsReadController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.CLAIM_MAIL_REWARD, (data) => {
        MailClaimRewardController.main(socket, io, data);
    });
};
