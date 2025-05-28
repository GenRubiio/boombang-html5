class RemoveUserController {
    static main(gameScene, socketId) {
        const user = gameScene.users[socketId];
        if (!user) return;

        // Detener y eliminar tweens activos
        if (user.currentTween) user.currentTween.stop();
        gameScene.tweens.killTweensOf(user.containerUser);

        // Detener cualquier animación activa
        if (user.spriteAvatar?.anims) {
            user.spriteAvatar.anims.stop();
        }

        // Eliminar contenedor completo
        if (user.containerUser && user.containerUser.active) {
            user.containerUser.destroy();
        }

        // Eliminar datos del jugador
        delete gameScene.users[socketId];
    }
}

export default RemoveUserController;
