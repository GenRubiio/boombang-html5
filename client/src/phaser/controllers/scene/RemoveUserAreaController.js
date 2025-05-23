
class RemoveUserAreaController {
    static main(gameScene) {
        const vueComponent = gameScene.sys.settings.data.vueComponent;
        vueComponent.exitToLobbyResponse();
    }
}

export default RemoveUserAreaController;
