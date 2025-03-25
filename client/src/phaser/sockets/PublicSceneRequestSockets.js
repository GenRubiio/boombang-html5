import socket from "../../sockets/socket"; // Conexión Socket.io
import RequestSocketsEnum from "../../enums/RequestSocketsEnum";

class PublicSceneRequestSockets {
    static main(gameScene) {
        // Solicitar datos iniciales de la sala
        socket.emit(RequestSocketsEnum.GET_PUBLIC_AREA_DATA, {
            roomId: gameScene.areaId
        });
    }
}

export default PublicSceneRequestSockets;