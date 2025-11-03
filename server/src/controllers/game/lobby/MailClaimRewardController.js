const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const MailService = require('../../../services/MailService');

class MailClaimRewardController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.CLAIM_REWARD_ERROR, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            if (!data || !data.mail_id) {
                socket.emit(ResponseSocketsEnum.CLAIM_REWARD_ERROR, {
                    success: false,
                    message: 'mail_id es requerido',
                });
                return;
            }

            const mailId = data.mail_id;
            const responseData = await MailService.claimReward(user, mailId);

            if (responseData.success) {
                // Actualizar los créditos del usuario en la colección
                if (responseData.user) {
                    user.goldCoins = responseData.user.gold_coins;
                    user.silverCoins = responseData.user.silver_coins;
                }

                socket.emit(ResponseSocketsEnum.CLAIM_REWARD_SUCCESS, {
                    success: true,
                    mail_id: mailId,
                    rewards: responseData.rewards,
                    user: {
                        gold_coins: user.goldCoins,
                        silver_coins: user.silverCoins,
                    },
                });

                // Actualizar créditos en el cliente
                socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                    gold: user.goldCoins,
                    silver: user.silverCoins,
                });

                Log.info(`Usuario ${user.username} reclamó recompensas del correo ${mailId}`);
            } else {
                socket.emit(ResponseSocketsEnum.CLAIM_REWARD_ERROR, {
                    success: false,
                    message: responseData.message || 'Error al reclamar las recompensas',
                });
            }
        } catch (err) {
            socket.emit(ResponseSocketsEnum.CLAIM_REWARD_ERROR, {
                success: false,
                message: 'Error del servidor al reclamar las recompensas',
            });
            Log.error('Error in MailClaimRewardController: ' + err);
        }
    }
}

module.exports = MailClaimRewardController;
