
import SetUserCardController from "./SetUserCardController.js";

class UserSelectUserController {
    static main(gameScene, data) {
        console.log("UserSelectUserController.main", data);
        SetUserCardController.main(gameScene, data.selected_user);
    }
}

export default UserSelectUserController;
