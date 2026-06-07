const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ShopApiService = require('../../../services-api/ShopApiService');

class GetShopCatalogController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);

            if (!user) {
                socket.emit(ResponseSocketsEnum.SHOP_CATALOG, {
                    success: false,
                    message: 'Usuario no autenticado',
                });
                return;
            }

            const responseData = await ShopApiService.getCatalog(user);

            socket.emit(ResponseSocketsEnum.SHOP_CATALOG, {
                success: true,
                categories: responseData.categories || [],
                items: responseData.items || [],
            });
        } catch (err) {
            console.error('Error en GetShopCatalogController:', err);
            socket.emit(ResponseSocketsEnum.SHOP_CATALOG, {
                success: false,
                message: err.message || 'Error del servidor',
            });
        }
    }
}

module.exports = GetShopCatalogController;
