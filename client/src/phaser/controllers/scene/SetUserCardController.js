
class SetUserCardController {
    static main(gameScene, selectedUser, authUser) {
        const vueComponent = gameScene.sys.settings.data.vueComponent;
        vueComponent.updateUserCard({
            selectedUser: selectedUser,
            authUser: authUser,
        });
    }
}

export default SetUserCardController;
