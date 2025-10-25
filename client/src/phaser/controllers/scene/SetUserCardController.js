
class SetUserCardController {
    static main(gameScene, selectedUser, authUser, pendingInteraction) {
        const vueComponent = gameScene.sys.settings.data.vueComponent;
        vueComponent.updateUserCard({
            selectedUser: selectedUser,
            authUser: authUser,
            pendingInteraction: pendingInteraction
        });
    }
}

export default SetUserCardController;
