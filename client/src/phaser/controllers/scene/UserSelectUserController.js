
import SetUserCardController from "./SetUserCardController.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io

class UserSelectUserController {
    static main(gameScene, data) {
        //console.log("UserSelectUserController.main", data);
        let user = data.selected_user;
        user.is_selected = user.socket_id != socket.id ? true : false;
        SetUserCardController.main(gameScene, data.selected_user);
    }
}

export default UserSelectUserController;
