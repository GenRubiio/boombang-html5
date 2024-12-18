import Enum from './Enum';

const RequestSocketsEnum = new Enum({
    GET_PUBLIC_AREA_DATA: 'request:get_public_area_data',
    USER_SELECT_USER: 'request:user_select_user',
    SEND_UPPERCUT: 'request:send_uppercut',
    USER_LEAVE_AREA: 'request:user_leave_area',
});

export default RequestSocketsEnum;