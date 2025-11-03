const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const MailService = require('../../../services/MailService');

class MailMarkAsReadController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.MAIL_READ, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            if (!data || !data.mail_id) {
                socket.emit(ResponseSocketsEnum.MAIL_READ, {
                    success: false,
                    message: 'mail_id es requerido',
                });
                return;
            }

            const mailId = data.mail_id;
            const responseData = await MailService.markAsRead(user, mailId);

            if (responseData.success) {
                socket.emit(ResponseSocketsEnum.MAIL_READ, {
                    success: true,
                    mail_id: mailId,
                });

                // Obtener el nuevo contador de no leídos
                const unreadResponse = await MailService.getUnreadCount(user);
                if (unreadResponse.success) {
                    socket.emit(ResponseSocketsEnum.MAIL_UNREAD_COUNT, {
                        unread_count: unreadResponse.unread_count,
                    });
                }

                Log.success(`Usuario ${user.username} marcó correo ${mailId} como leído`);
            } else {
                socket.emit(ResponseSocketsEnum.MAIL_READ, {
                    success: false,
                    message: responseData.message || 'Error al marcar el correo como leído',
                });
            }
        } catch (err) {
            socket.emit(ResponseSocketsEnum.MAIL_READ, {
                success: false,
                message: 'Error del servidor al marcar el correo como leído',
            });
            Log.error('Error in MailMarkAsReadController: ' + err);
        }
    }
}

module.exports = MailMarkAsReadController;
