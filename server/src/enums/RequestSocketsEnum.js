const Enum = require('./Enum');

const RequestSocketsEnum = new Enum({
    LOGIN: 'login',
    REGISTER: 'register',
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
    GET_PUBLIC_SCENE_USERS: 'request:get_public_area_users',
    USER_SEND_EMOJI: 'request:send_emoji',
    USER_SEND_CHAT: 'request:send_chat',
    USER_SEND_COCONUT: 'request:send_coconut',
});

module.exports = RequestSocketsEnum;