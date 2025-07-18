import Enum from './Enum';

const RequestSocketsEnum = new Enum({
    USER_MOVE: 'request:user_move',
    USER_CHANGE_UPPERCUT: 'request:user_change_uppercut',
    USER_CHANGE_COCONUT: 'request:user_change_coconut',
    MINIGAME_SUBSCRIBE: 'request:minigame_subscribe',
    GET_PUBLIC_SCENE_DATA: 'request:get_public_area_data',
    USER_SELECT_USER: 'request:user_select_user',
    SEND_UPPERCUT: 'request:send_uppercut',
    USER_LEAVE_SCENE: 'request:user_leave_area',
    LOGIN: 'login',
    REGISTER: 'register',
    GET_PUBLIC_SCENES: 'get_public_areas',
    JOIN_PUBLIC_SCENE: 'request:join_public_area',
    SEND_EMOJI: 'request:send_emoji',
    SEND_CHAT: 'request:send_chat',
    SEND_COCONUT: 'request:send_coconut',
    CHANGE_LOOK: 'request:change_look',
    GET_GAME_SCENES: 'request:get_game_scenes',
    ISLAND_CREATE: 'request:island_create',
    GET_MY_ISLANDS: 'request:get_my_islands',
    JOIN_ISLAND: 'request:join_island',
    PRIVATE_SCENE_CREATE: 'request:private_scene_create',
    JOIN_PRIVATE_SCENE: 'request:join_private_scene',
    SCENE_PUT_ITEM: 'request:scene_put_item',
    SCENE_REMOVE_ITEM: 'request:scene_remove_item',
    GET_PUBLIC_ISLANDS: 'request:get_public_islands',
    GET_MINIGAME_SUBSCRIBE_STATUS: 'request:get_minigame_subscribe_status',
});

export default RequestSocketsEnum;