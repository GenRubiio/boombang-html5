const Enum = require('./Enum');

const SceneTypesEnum = new Enum({
    PUBLIC_SCENE: 'public_scene',
    GAME_SCENE: 'game_scene',
    PRIVATE_SCENE: 'private_scene',
    MINIGAME_RING: 'minigame_ring',
});

module.exports = SceneTypesEnum;