
class RemoveItemPublicSceneController {
    static main(gameScene, data) {
        const key = `${data.position.x},${data.position.y}`;
        if (gameScene.activeItems.has(key)) {
            const item = gameScene.activeItems.get(key);
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

export default RemoveItemPublicSceneController;
