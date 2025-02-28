const Enum = require('./Enum');

const RequestSocketsEnum = new Enum({
    LOGIN: 'login',
    REGISTER: 'register',
    USER_MOVE: 'request:user_move',
    USER_LEAVE_AREA: 'request:user_leave_area',
    USER_SELECT_USER: 'request:user_select_user',
    GET_PUBLIC_AREAS: 'get_public_areas',
    JOIN_PUBLIC_AREA: 'request:join_public_area',
    GET_PUBLIC_AREA_DATA: 'request:get_public_area_data',
    DISCONNECT: 'disconnect',
    GET_CONNECTED_USERS: 'get_connected_users',
    SEND_MESSAGE: 'send_message',
    SEND_UPPERCUT: 'request:send_uppercut',
    GET_PUBLIC_AREA_USERS: 'request:get_public_area_users',
    SEND_EMOJI: 'request:send_emoji',
    SEND_CHAT: 'request:send_chat',
});

module.exports = RequestSocketsEnum;