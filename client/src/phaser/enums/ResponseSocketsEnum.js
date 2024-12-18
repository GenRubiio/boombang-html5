import Enum from './Enum';

const ResponseSocketsEnum = new Enum({
    GET_PUBLIC_AREA_DATA: 'response:get_public_area_data',
    NEW_USER_JOIN_PUBLIC_AREA: 'response:new_user_join_public_area',
    USER_MOVE: 'response:user_move',
    USER_MOVE_DENIED: 'response:user_move_denied',
    USER_LEFT_PUBLIC_AREA: 'response:user_left_public_area',
    USER_SELECT_USER: 'response:user_select_user',
    USER_UPDATE_POSITION: 'response:user_update_position',
    REMOVE_USER_AREA: 'response:remove_user_area',
    SEND_UPPERCUT: 'response:send_uppercut',
});

export default ResponseSocketsEnum;