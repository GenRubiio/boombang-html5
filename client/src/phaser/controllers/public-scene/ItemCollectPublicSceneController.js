
class ItemCollectPublicSceneController {
    static main(gameScene, data) {
        const key = `${data.position.x},${data.position.y}`;
        if (gameScene.activeItems.has(key)) {
            const item = gameScene.activeItems.get(key);
            const itemName = data.itemName;
            const userName = data.userName;
            const catchFileName = data.catchFileName;
            const points = data.points;
            const text = data.text;

            // Mostrar alerta en chat
            if (gameScene.chatManager) {
                gameScene.chatManager.addSystemAlert(`${userName} ha atrapado un ${itemName} y obtiene: ${points} ${text}`);
            }

            if (catchFileName) {
                item.sprite.setTexture('item_' + catchFileName);
            }

            // Animación de fadeout
            gameScene.tweens.add({
                targets: item.sprite,
                alpha: 0,
                duration: 1200,
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
