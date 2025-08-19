
import ResponseSocketsEnum from '../enums/ResponseSocketsEnum';
import RequestSocketsEnum from '../enums/RequestSocketsEnum';

class RemovePhaserSocketsUtil {
    static main(socket) {
        // Listas de exclusión
        const excludedResponseEvents = [
            ResponseSocketsEnum.UPDATE_PUBLIC_SCENES,
            ResponseSocketsEnum.UPDATE_GAME_SCENES,
            ResponseSocketsEnum.JOIN_PUBLIC_SCENE,
            ResponseSocketsEnum.MINIGAME_JOIN,
            ResponseSocketsEnum.MINIGAME_CALL_NOTIFICATION,
            ResponseSocketsEnum.ISLAND_CREATE_ERROR,
            ResponseSocketsEnum.JOIN_ISLAND,
            ResponseSocketsEnum.GET_MY_ISLANDS,
            ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR,
            ResponseSocketsEnum.JOIN_PRIVATE_SCENE,
            ResponseSocketsEnum.JOIN_PRIVATE_SCENE_ERROR,
            ResponseSocketsEnum.UPDATE_PUBLIC_ISLANDS,
            ResponseSocketsEnum.MINIGAME_SUBSCRIBE,
            ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS,
            ResponseSocketsEnum.REFRESH_USER_CREDITS
        ];

        const excludedRequestEvents = [
            RequestSocketsEnum.GET_PUBLIC_SCENES,
            RequestSocketsEnum.GET_GAME_SCENES,
            RequestSocketsEnum.JOIN_PUBLIC_SCENE,
            RequestSocketsEnum.MINIGAME_SUBSCRIBE,
            RequestSocketsEnum.ISLAND_CREATE,
            RequestSocketsEnum.JOIN_ISLAND,
            RequestSocketsEnum.GET_MY_ISLANDS,
            RequestSocketsEnum.PRIVATE_SCENE_CREATE,
            RequestSocketsEnum.JOIN_PRIVATE_SCENE,
            RequestSocketsEnum.GET_PUBLIC_ISLANDS,
            RequestSocketsEnum.GET_MINIGAME_SUBSCRIBE_STATUS,
            RequestSocketsEnum.USER_UPDATE_DESCRIPTION,
            RequestSocketsEnum.USER_CATCH_ITEM,
            RequestSocketsEnum.USER_CHANGE_FICHA,
            RequestSocketsEnum.USER_CHANGE_CHAT,
            RequestSocketsEnum.USER_CHANGE_NAME_COLOR,
            RequestSocketsEnum.USER_CHANGE_SHADOW_COLOR,
            RequestSocketsEnum.REFRESH_USER_CREDITS
        ];

        // Remover solo eventos que no están en las listas de exclusión
        Object.values(ResponseSocketsEnum).forEach((event) => {
            if (!excludedResponseEvents.includes(event)) {
                //console.log(`Eliminando evento de respuesta de socket: ${event}`);
                socket.off(event);
            }
        });

        Object.values(RequestSocketsEnum).forEach((event) => {
            if (!excludedRequestEvents.includes(event)) {
                //console.log(`Eliminando evento de solicitud de socket: ${event}`);
                socket.off(event);
            }
        });
    }
}

export default RemovePhaserSocketsUtil;
