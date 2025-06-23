const Enum = require('./Enum');

const RequestSocketsEnum = new Enum({
    LOGIN: 'login',
    REGISTER: 'register',
    MINIGAME_SUBSCRIBE: 'request:minigame_subscribe',
    USER_MOVE: 'request:user_move',
    USER_LEAVE_AREA: 'request:user_leave_area',
    USER_SELECT_USER: 'request:user_select_user',
    GET_PUBLIC_SCENES: 'get_public_areas',
    JOIN_PUBLIC_SCENE: 'request:join_public_area',
    GET_PUBLIC_SCENE_DATA: 'request:get_public_area_data',
    DISCONNECT: 'disconnect',
    GET_CONNECTED_USERS: 'get_connected_users',
    USER_SEND_MESSAGE: 'send_message',
    USER_SEND_UPPERCUT: 'request:send_uppercut',
    USER_CHANGE_UPPERCUT: 'request:user_change_uppercut',
    GET_PUBLIC_SCENE_USERS: 'request:get_public_area_users',
    USER_CHANGE_COCONUT: 'request:user_change_coconut',
    USER_SEND_EMOJI: 'request:send_emoji',
    USER_SEND_CHAT: 'request:send_chat',
    USER_SEND_COCONUT: 'request:send_coconut',
    CHANGE_LOOK: 'request:change_look',
});

module.exports = RequestSocketsEnum;