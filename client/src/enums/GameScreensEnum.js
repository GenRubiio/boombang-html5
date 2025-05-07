import Enum from './Enum';

const GameScreensEnum = new Enum({
    LOGIN: 'login',
    REGISTER: 'register',
    LOBBY: 'lobby',
    PUBLIC_SCENE: 'public_area',
    MINIGAME_SCENE: 'minigame_scene',
});

export default GameScreensEnum;