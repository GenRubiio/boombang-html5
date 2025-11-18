const GetShopCatalogController = require('../../controllers/game/shop/GetShopCatalogController');
const PurchaseShopItemController = require('../../controllers/game/shop/PurchaseShopItemController');
const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_SHOP_CATALOG, async () => {
        GetShopCatalogController.main(socket, io);
    });

    socket.on(RequestSocketsEnum.PURCHASE_SHOP_ITEM, async (data) => {
        PurchaseShopItemController.main(socket, io, data);
    });
};
