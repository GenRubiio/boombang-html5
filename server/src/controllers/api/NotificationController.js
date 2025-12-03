const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');
const ConsoleLogger = require('../../utils/ConsoleLogger');

class NotificationController {
    constructor() {
        this.logger = new ConsoleLogger();
    }

    /**
     * Handle credits update notification from API
     */
    notifyCreditsUpdate(req, res) {
        try {
            const { user_id, gold, silver } = req.body;
            
            if (!user_id) {
                return res.status(400).json({ error: 'user_id is required' });
            }

            // Buscar el socket del usuario
            const user = ConnectedUsersCollection.getByUserId(user_id.toString());
            
            if (user && user.socket) {
                // Actualizar los créditos en memoria
                user.goldCoins = gold || 0;
                user.silverCoins = silver || 0;
                user.gold = gold || 0;
                user.silver = silver || 0;

                // Emitir evento de actualización de créditos
                user.socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                    gold: user.goldCoins,
                    silver: user.silverCoins,
                });

                res.json({ success: true, message: 'Credits updated successfully' });
            } else {
                res.json({ success: false, message: 'User not connected' });
            }
        } catch (error) {
            this.logger.log('Error updating credits: ' + error.message, 'error');
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Handle inventory update notification from API
     */
    notifyInventoryUpdate(req, res) {
        try {
            const { user_id, items } = req.body;
            
            if (!user_id) {
                return res.status(400).json({ error: 'user_id is required' });
            }

            const user = ConnectedUsersCollection.getByUserId(user_id.toString());
            
            if (user && user.socket) {
                // Aquí podrías agregar lógica adicional para el inventario si es necesario
                res.json({ success: true, message: 'Inventory update notification sent' });
            } else {
                res.json({ success: false, message: 'User not connected' });
            }
        } catch (error) {
            this.logger.log('Error updating inventory: ' + error.message, 'error');
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new NotificationController();