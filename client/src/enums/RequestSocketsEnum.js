import Enum from './Enum';

const RequestSocketsEnum = new Enum({
    USER_MOVE: 'request:user_move',
    USER_CHANGE_UPPERCUT: 'request:user_change_uppercut',
    USER_CHANGE_COCONUT: 'request:user_change_coconut',
    MINIGAME_SUBSCRIBE: 'request:minigame_subscribe',
    GET_PUBLIC_AREA_DATA: 'request:get_public_area_data',
    USER_SELECT_USER: 'request:user_select_user',
    SEND_UPPERCUT: 'request:send_uppercut',
    USER_LEAVE_AREA: 'request:user_leave_area',
    LOGIN: 'login',
    REGISTER: 'register',
    GET_PUBLIC_AREAS: 'get_public_areas',
    JOIN_PUBLIC_AREA: 'request:join_public_area',
    SEND_EMOJI: 'request:send_emoji',
    SEND_CHAT: 'request:send_chat',
    SEND_COCONUT: 'request:send_coconut',
});

export default RequestSocketsEnum;