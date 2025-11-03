const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const MailService = require('../../../services/MailService');

class MailGetInboxController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.GET_MAIL_INBOX, {
                    success: false,
                    message: 'Usuario no autenticado',
                    mails: [],
                    unread_count: 0,
                });
                return;
            }

            const responseData = await MailService.getInbox(user);
            
            socket.emit(ResponseSocketsEnum.GET_MAIL_INBOX, {
                success: true,
                mails: responseData.mails || [],
                unread_count: responseData.unread_count || 0,
            });

            Log.info(`Usuario ${user.username} obtuvo ${responseData.mails ? responseData.mails.length : 0} correos`);
        } catch (err) {
            socket.emit(ResponseSocketsEnum.GET_MAIL_INBOX, {
                success: false,
                message: 'Error del servidor al obtener los correos',
                mails: [],
                unread_count: 0,
            });
            Log.error('Error in MailGetInboxController: ' + err);
        }
    }
}

module.exports = MailGetInboxController;
