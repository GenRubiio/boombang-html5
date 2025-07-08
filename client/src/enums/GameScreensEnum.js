import Enum from './Enum';

const GameScreensEnum = new Enum({
    LOGIN: 'login',
    REGISTER: 'register',
    LOBBY: 'lobby',
    PUBLIC_SCENE: 'public_area',
    GAME_SCENE: 'game_scene',
    MINIGAME_SCENE: 'minigame_scene',
    ISLAND_CREATE: 'island_create',
    ISLAND: 'island',
});

export default GameScreensEnum;