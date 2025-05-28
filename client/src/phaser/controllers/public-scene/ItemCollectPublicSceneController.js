
class ItemCollectPublicSceneController {
    static main(gameScene, data) {
        const key = `${data.position.x},${data.position.y}`;
        if (gameScene.activeItems.has(key)) {
            const item = gameScene.activeItems.get(key);
            const itemName = data.itemName;
            const userName = data.userName;
            // Mostrar alerta en chat
            if (gameScene.chatManager) {
                gameScene.chatManager.addSystemAlert(`${userName} ha atrapado un ${itemName}`);
            }

            // Animación de fadeout
            gameScene.tweens.add({
                targets: item.sprite,
                alpha: 0,
                duration: 800,
                ease: 'Linear',
                onComplete: () => {
                    item.sprite.destroy();
                    gameScene.activeItems.delete(key);
                }
            });
        }
    }
}

export default ItemCollectPublicSceneController;
