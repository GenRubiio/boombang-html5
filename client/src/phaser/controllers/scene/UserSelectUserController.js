
import SetUserCardController from "./SetUserCardController.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io

class UserSelectUserController {
    static main(gameScene, data) {
        //console.log("UserSelectUserController.main", data);
        let selectedUser = data.selected_user;
        socket.user.ficha_color = data.auth_user ? data.auth_user.ficha_color : selectedUser.ficha_color;
        selectedUser.is_selected = selectedUser.socket_id != socket.id ? true : false;
        SetUserCardController.main(gameScene, data.selected_user, data.auth_user, data.pending_interaction);
    }
}

export default UserSelectUserController;
