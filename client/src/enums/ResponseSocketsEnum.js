import Enum from './Enum';

const ResponseSocketsEnum = new Enum({
    GET_PUBLIC_SCENE_DATA: 'response:get_public_area_data',
    NEW_USER_JOIN_SCENE: 'response:new_user_join_public_area',
    USER_MOVE: 'response:user_move',
    USER_MOVE_DENIED: 'response:user_move_denied',
    USER_LEFT_PUBLIC_SCENE: 'response:user_left_public_area',
    USER_SELECT_USER: 'response:user_select_user',
    USER_UPDATE_POSITION: 'response:user_update_position',
    REMOVE_USER_SCENE: 'response:remove_user_area',
    SEND_UPPERCUT: 'response:send_uppercut',
    LOGIN_SUCCESS: 'login_success',
    LOGIN_ERROR: 'login_error',
    REGISTER_SUCCESS: 'register_success',
    REGISTER_ERROR: 'register_error',
    UPDATE_PUBLIC_SCENES: 'update_public_areas',
    JOIN_PUBLIC_SCENE: 'response:join_public_area',
    SEND_EMOJI: 'response:send_emoji',
    SEND_CHAT: 'response:send_chat',
    MINIGAME_SUBSCRIBE: 'response:minigame_subscribe',
    MINIGAME_COUNTER: 'response:minigame_counter',
    MINIGAME_ALERT: 'response:minigame_alert',
    MINIGAME_JOIN: 'response:join_minigame',
    MINIGAME_CALL_NOTIFICATION: 'response:minigame_call_notification',
    SCENE_OBJECT_SPAWNED: 'response:object_spawned',
    SCENE_OBJECT_REMOVED: 'response:object_removed',
    SCENE_OBJECT_COLLECTED: 'response:object_collected',
    USER_RECEIVE_EFFECT: 'response:user_receive_effect',
    UPDATE_GAME_SCENES: 'response:update_game_scenes',
    MINIGAME_SUBSCRIBE_STATUS: 'response:minigame_subscribe_status',
});

export default ResponseSocketsEnum;