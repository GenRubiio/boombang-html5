const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ShopApiService = require('../../../services-api/ShopApiService');

class PurchaseShopItemController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);

            if (!user) {
                socket.emit(ResponseSocketsEnum.SHOP_PURCHASE, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            const { catalog_item_id, quantity } = data;

            if (!catalog_item_id) {
                socket.emit(ResponseSocketsEnum.SHOP_PURCHASE, {
                    success: false,
                    message: 'catalog_item_id es requerido',
                });
                return;
            }

            //console.log('=== PURCHASE ATTEMPT (SERVER) ===');
            //console.log('User ID:', user.id);
            //console.log('User Gold (before):', user.gold);
            //console.log('User Silver (before):', user.silver);
            //console.log('Catalog Item ID:', catalog_item_id);
            //console.log('Quantity:', quantity);
            //console.log('Quantity Type:', typeof quantity);

            const responseData = await ShopApiService.purchaseItem(user, catalog_item_id, quantity || 1);

            //console.log('=== PURCHASE RESPONSE ===');
            //console.log('Success:', responseData.success);
            //console.log('Response:', JSON.stringify(responseData, null, 2));

            if (responseData.success) {
                // Actualizar el oro y plata del usuario en ConnectedUsersCollection
                user.gold = responseData.user.gold;
                user.silver = responseData.user.silver;
                user.goldCoins = responseData.user.gold;
                user.silverCoins = responseData.user.silver;

                //console.log('=== USER UPDATED ===');
                //console.log('New Gold:', user.gold);
                //console.log('New Silver:', user.silver);

                // Emitir evento para actualizar los créditos en el UI
                socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                    gold: responseData.user.gold,
                    silver: responseData.user.silver,
                });

                socket.emit(ResponseSocketsEnum.SHOP_PURCHASE, {
                    success: true,
                    message: responseData.message,
                    user: {
                        gold: responseData.user.gold,
                        silver: responseData.user.silver,
                    },
                });
            } else {
                socket.emit(ResponseSocketsEnum.SHOP_PURCHASE, {
                    success: false,
                    message: responseData.error || 'Error al comprar el item',
                });
            }
        } catch (err) {
            console.error('Error en PurchaseShopItemController:', err);
            socket.emit(ResponseSocketsEnum.SHOP_PURCHASE, {
                success: false,
                message: err.message || 'Error del servidor',
            });
        }
    }
}

module.exports = PurchaseShopItemController;
