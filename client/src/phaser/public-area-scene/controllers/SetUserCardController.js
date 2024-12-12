
class SetUserCardController {
    static main(gameScene, data) {
        const vueComponent = gameScene.sys.settings.data.vueComponent;
        vueComponent.updateUserCard(data);
    }
}

export default SetUserCardController;
