import UserIdleAnimation from "../../animations/UserIdleAnimation.js";

class UserChangeAvatarController {
    static main(gameScene, data) {
        const socketId = data.user;
        const position = data.position;
        
        // Verificar que el jugador exista
        if (!gameScene.users[socketId]) return;

        const user = gameScene.users[socketId];
        if (!user) return;

        // Actualizar el avatarId del usuario
        user.avatarId = parseInt(data.avatar);
        user.spriteAvatar._avatarId = user.avatarId;

        // Actualizar la posición lógica del jugador
        user.position = position;

        // Detener tweens existentes para asegurar que no se esté moviendo mientras cambias la dirección
        if (user.currentTween) {
            user.currentTween.stop();
            user.currentTween = null;
        }
        gameScene.tweens.killTweensOf(user.containerUser);

        // Si el jugador tiene un path definido, limpiarlo
        user.path = [];
        user.pathIndex = 0;

        // Forzar la posición en el mapa según la lógica isométrica
        const tileWidth = 65;
        const tileHeight = 33;
        const finalX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (user.position.x + user.position.y) * (tileHeight / 2);

        user.containerUser.setPosition(finalX, finalY);
        user.containerUser.setDepth(finalY);

        UserIdleAnimation.main(
            user.spriteAvatar,
            position.z,
            user.avatarId
        );
    }
}

export default UserChangeAvatarController;

