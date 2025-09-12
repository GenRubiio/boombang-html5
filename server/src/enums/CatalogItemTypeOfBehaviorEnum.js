const Enum = require('./Enum');

const CatalogItemTypeOfBehaviorEnum = new Enum({
    NORMAL: 'normal',
    FLYING: 'flying',
    WALKABLE: 'walkable',
    WALKABLE_OVERLAY: 'walkable_overlay',
});

module.exports = CatalogItemTypeOfBehaviorEnum;
