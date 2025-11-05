const RequestSocketsEnum = require('../../enums/RequestSocketsEnum');
const NpcGetCatalogItemsController = require('../../controllers/game/npc/NpcGetCatalogItemsController');
const NpcCheckRequirementsController = require('../../controllers/game/npc/NpcCheckRequirementsController');
const NpcClaimItemController = require('../../controllers/game/npc/NpcClaimItemController');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_NPC_CATALOG_ITEMS, (data) => {
        NpcGetCatalogItemsController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.CHECK_NPC_REQUIREMENTS, (data) => {
        NpcCheckRequirementsController.main(socket, io, data);
    });

    socket.on(RequestSocketsEnum.CLAIM_NPC_ITEM, (data) => {
        NpcClaimItemController.main(socket, io, data);
    });
};
