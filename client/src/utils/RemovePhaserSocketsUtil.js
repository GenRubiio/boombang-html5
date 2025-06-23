
import ResponseSocketsEnum from '../enums/ResponseSocketsEnum';
import RequestSocketsEnum from '../enums/RequestSocketsEnum';

class RemovePhaserSocketsUtil {
    static main(socket) {
        // Listas de exclusión
        const excludedResponseEvents = [
            ResponseSocketsEnum.UPDATE_PUBLIC_SCENES,
            ResponseSocketsEnum.JOIN_PUBLIC_SCENE,
            ResponseSocketsEnum.MINIGAME_JOIN,
            ResponseSocketsEnum.MINIGAME_CALL_NOTIFICATION
        ];

        const excludedRequestEvents = [
            RequestSocketsEnum.GET_PUBLIC_SCENES,
            RequestSocketsEnum.JOIN_PUBLIC_SCENE
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
