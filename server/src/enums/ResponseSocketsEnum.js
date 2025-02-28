const Enum = require('./Enum');

const ResponseSocketsEnum = new Enum({
    GET_PUBLIC_AREA_DATA: 'response:get_public_area_data',
    JOIN_PUBLIC_AREA: 'response:join_public_area',
    NEW_USER_JOIN_PUBLIC_AREA: 'response:new_user_join_public_area',
    USER_LEFT_PUBLIC_AREA: 'response:user_left_public_area',
    USER_MOVE_DENIED: 'response:user_move_denied',
    USER_MOVE: 'response:user_move',
    USER_SELECT_USER: 'response:user_select_user',
    USER_UPDATE_POSITION: 'response:user_update_position',
    UPDATE_PUBLIC_AREAS: 'update_public_areas',
    LOGIN_SUCCESS: 'login_success',
    LOGIN_ERROR: 'login_error',
    REGISTER_ERROR: 'register_error',
    REGISTER_SUCCESS: 'register_success',
    REMOVE_USER_AREA: 'response:remove_user_area',
    SEND_UPPERCUT: 'response:send_uppercut',
    GET_PUBLIC_AREA_USERS: 'response:get_public_area_users',
    SEND_EMOJI: 'response:send_emoji',
    SEND_CHAT: 'response:send_chat',
});

module.exports = ResponseSocketsEnum;